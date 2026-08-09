/**
 * Диагностика связи с платёжным шлюзом Альфа-Банка.
 * Запуск:  npm run diag
 *
 * Проверяет по шагам: DNS → TCP → TLS (кто выпустил сертификат и доверяет ли
 * ему Node) → реальный запрос к шлюзу с вашими реквизитами.
 * Пароль нигде не печатается.
 *
 * Запускается напрямую через node: Node 22.18+ стрипает типы сам, сборка
 * не нужна. Поэтому импорты здесь с явным расширением .ts и без алиаса @/ —
 * псевдонимы знает только сборщик Next.
 */

import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import { installGatewayTrust } from '../lib/payments/trust.ts';

const HOST = process.env.ALFA_ENV === 'prod' ? 'payment.alfabank.ru' : 'alfa.rbsuat.com';
const PORT = 443;

const ok = (t: string) => console.log(`  ✅ ${t}`);
const bad = (t: string) => console.log(`  ❌ ${t}`);
const info = (t: string) => console.log(`     ${t}`);

// Диагностика обязана проверять ровно ту конфигурацию доверия, с которой
// работает сервер, иначе её вердикт ничего не значит.
const trust = installGatewayTrust();

console.log(`\nПроверяем ${HOST}:${PORT}`);
console.log(`Node ${process.version}`);
console.log(
    trust.ok
        ? `Корень Минцифры добавлен, доверенных корней: ${trust.total}\n`
        : `Корень Минцифры НЕ добавлен: ${trust.reason}\n`
);

// --- 1. DNS -----------------------------------------------------------------
console.log('1. DNS');
try {
    const addresses = await dns.resolve4(HOST);
    ok(`домен резолвится: ${addresses.join(', ')}`);
} catch (error) {
    const e = error as NodeJS.ErrnoException;
    bad(`домен не резолвится (${e.code ?? e.message})`);
    info('Нет интернета, либо DNS не отдаёт этот домен. Дальше проверять нечего.');
    process.exit(1);
}

// --- 2. TCP -----------------------------------------------------------------
console.log('\n2. TCP-соединение на порт 443');
const tcpResult = await new Promise<true | string>((resolve) => {
    const socket = net.connect({ host: HOST, port: PORT, timeout: 8000 });
    socket.on('connect', () => {
        socket.destroy();
        resolve(true);
    });
    socket.on('timeout', () => {
        socket.destroy();
        resolve('timeout');
    });
    socket.on('error', (error: NodeJS.ErrnoException) => resolve(error.code ?? error.message));
});

if (tcpResult === true) {
    ok('порт открыт, соединение устанавливается');
} else {
    bad(`не удалось подключиться (${tcpResult})`);
    info('Трафик режет VPN, прокси, файрвол или провайдер. Попробуйте выключить VPN.');
    process.exit(1);
}

// --- 3. TLS -----------------------------------------------------------------
console.log('\n3. TLS-сертификат');

type ChainLink = { subject: string; issuer: string; validTo: string };

/** Поля X.509 могут прийти массивом, если атрибут встречается несколько раз. */
function name(field: string | string[] | undefined): string {
    if (Array.isArray(field)) return field.join(', ');
    return field ?? '—';
}

type TlsResult =
    | { error: string }
    | { authorized: boolean; authorizationError?: Error; chain: ChainLink[] };

// rejectUnauthorized: false здесь стоит намеренно и ТОЛЬКО ради диагностики:
// иначе при недоверенном корне соединение рвётся до того, как мы увидим цепочку,
// и вместо «кто выпустил сертификат» остаётся голый код ошибки. Вердикт всё равно
// берётся из socket.authorized — проверка не отключается, а лишь не обрывает связь.
// Никогда не копируйте этот флаг в lib/payments/gateway.ts: там через него пойдут платежи.
const tlsResult = await new Promise<TlsResult>((resolve) => {
    const socket = tls.connect(
        { host: HOST, port: PORT, servername: HOST, timeout: 8000, rejectUnauthorized: false },
        () => {
            const chain: ChainLink[] = [];
            let cert = socket.getPeerCertificate(true);
            for (let depth = 0; cert && Object.keys(cert).length && depth < 10; depth++) {
                chain.push({
                    subject: name(cert.subject?.CN),
                    issuer: name(cert.issuer?.O ?? cert.issuer?.CN),
                    validTo: cert.valid_to,
                });
                // Корень подписан сам собой — на нём цепочка замыкается.
                if (cert.issuerCertificate === cert || !cert.issuerCertificate) break;
                cert = cert.issuerCertificate;
            }

            const result = {
                authorized: socket.authorized,
                authorizationError: socket.authorizationError,
                chain,
            };
            socket.destroy();
            resolve(result);
        }
    );
    socket.on('timeout', () => {
        socket.destroy();
        resolve({ error: 'timeout' });
    });
    socket.on('error', (error: NodeJS.ErrnoException) =>
        resolve({ error: error.code ?? error.message })
    );
});

if ('error' in tlsResult) {
    bad(`TLS не установился (${tlsResult.error})`);
} else {
    tlsResult.chain.forEach((cert, depth) => {
        const role = depth === 0 ? 'сертификат сайта' : `выпустивший #${depth}`;
        info(`${role}: ${cert.subject}`);
        info(`   выпустил: ${cert.issuer}${depth === 0 ? `, действует до ${cert.validTo}` : ''}`);
    });

    if (tlsResult.authorized) {
        ok('Node доверяет сертификату');
    } else {
        bad(`Node НЕ доверяет сертификату: ${tlsResult.authorizationError}`);
        const ministry = tlsResult.chain.some((c) => /Ministry of Digital|Минцифры/i.test(c.issuer));
        if (ministry && !trust.ok) {
            info('Цепочка замкнута на корень УЦ Минцифры, а он не подключён — см. строку про корень выше.');
        } else if (!ministry) {
            info('Корень в цепочке не похож на Минцифры — вероятно, трафик перехватывает прокси или антивирус.');
        }
    }
}

// --- 4. Реальный запрос -----------------------------------------------------
console.log('\n4. Запрос к шлюзу (getOrderStatusExtended.do с несуществующим заказом)');
const userName = process.env.ALFA_USERNAME;
const password = process.env.ALFA_PASSWORD;

if (!userName || !password) {
    bad('не заданы ALFA_USERNAME / ALFA_PASSWORD в .env — шаг пропущен');
    process.exit(0);
}

try {
    const response = await fetch(`https://${HOST}/payment/rest/getOrderStatusExtended.do`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            userName,
            password,
            orderId: '00000000-0000-0000-0000-000000000000',
        }),
    });
    const data = (await response.json()) as { errorCode?: string; errorMessage?: string };

    // errorCode 6 = «Незарегистрированный OrderId» — это УСПЕХ:
    // значит связь есть и логин с паролем приняты. 5 — реквизиты отвергнуты.
    if (String(data.errorCode) === '5') {
        bad(`шлюз ответил, но отверг реквизиты: ${data.errorMessage}`);
        info('Проверьте ALFA_USERNAME (должен оканчиваться на -api) и пароль в .env.');
    } else {
        ok(`шлюз ответил: errorCode=${data.errorCode}, ${data.errorMessage ?? ''}`);
        info('Связь и авторизация работают — можно проводить тестовый платёж.');
    }
} catch (error) {
    let root = error as NodeJS.ErrnoException & { cause?: unknown };
    while (root?.cause) root = root.cause as typeof root;
    bad(`запрос не прошёл: ${root.code ?? ''} ${root.message}`);
}

console.log('');

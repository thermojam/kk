/**
 * Доверие корню УЦ Минцифры.
 *
 * Платёжный шлюз Альфа-Банка предъявляет цепочку, замкнутую на «Russian Trusted
 * Root CA». Этого корня нет ни во вшитом наборе Node, ни в связке ключей macOS —
 * поэтому без него любой запрос падает с SELF_SIGNED_CERT_IN_CHAIN.
 *
 * Здесь корень ДОБАВЛЯЕТСЯ к штатному набору, а не заменяет его: остальной
 * интернет продолжает проверяться обычными корнями. Расширение доверия живёт
 * только внутри этого процесса — системная связка и браузеры не затронуты.
 *
 * Почему не переменной окружения: NODE_EXTRA_CA_CERTS читается Node ДО того,
 * как `--env-file` наполнит process.env, поэтому положить её в .env невозможно —
 * она молча не сработает.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';

/**
 * Путь считается от корня проекта, а не от import.meta.url: под `next start`
 * серверный код лежит в .next/server, и относительный путь оттуда не ведёт
 * к certs/. cwd у Next — всегда корень проекта.
 */
export const ROOT_PATH = path.join(process.cwd(), 'certs', 'russian-trusted-root.pem');

/**
 * Отпечаток корня. Сверен по двум независимым каналам: файл с gu-st.ru и корень
 * из цепочки, которую отдаёт сам шлюз. Если проверка перестанет сходиться —
 * сертификат в репозитории подменили, и доверять ему нельзя.
 */
export const ROOT_SHA256 = 'd26d2d0231b7c39f92cc738512ba54103519e4405d68b5bd703e9788ca8ecf31';

export type TrustResult = { ok: true; total: number } | { ok: false; reason: string };

/** Вытаскивает PEM-блоки сертификатов, игнорируя комментарии вокруг них. */
function extractCertificates(text: string): string[] {
    return text.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) ?? [];
}

function fingerprint(pemBlock: string): string {
    const base64 = pemBlock.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s/g, '');
    return crypto.createHash('sha256').update(Buffer.from(base64, 'base64')).digest('hex');
}

/**
 * Добавляет корень Минцифры к доверенным. Возвращает статус — instrumentation
 * и diag его печатают. Повторный вызов безопасен, но бессмысленен: доверие
 * глобально для процесса.
 */
export function installGatewayTrust(): TrustResult {
    if (typeof tls.setDefaultCACertificates !== 'function') {
        return {
            ok: false,
            reason: `Node ${process.version} не умеет tls.setDefaultCACertificates — нужен Node 22.15 или новее.`,
        };
    }

    let text: string;
    try {
        text = fs.readFileSync(ROOT_PATH, 'utf8');
    } catch {
        return { ok: false, reason: `Не найден файл корня ${ROOT_PATH}.` };
    }

    const [root] = extractCertificates(text);
    if (!root) {
        return { ok: false, reason: `В ${ROOT_PATH} нет PEM-блока сертификата.` };
    }

    // Подмена корня = возможность подсунуть поддельный шлюз. Это не повод
    // продолжать работу с предупреждением — только остановка.
    const actual = fingerprint(root);
    if (actual !== ROOT_SHA256) {
        throw new Error(
            `Отпечаток корня в ${ROOT_PATH} не совпадает с ожидаемым.\n` +
                `  ожидался: ${ROOT_SHA256}\n` +
                `  получен:  ${actual}\n` +
                'Сертификат подменён или обновлён. Не запускайте платежи, пока не разберётесь.'
        );
    }

    const defaults = tls.getCACertificates('default');
    tls.setDefaultCACertificates([...defaults, root]);

    return { ok: true, total: defaults.length + 1 };
}

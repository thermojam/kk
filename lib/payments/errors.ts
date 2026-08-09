/**
 * Расшифровка сетевых ошибок при обращении к платёжному шлюзу.
 *
 * fetch всегда бросает безликое «fetch failed», а настоящий код лежит во
 * вложенном cause. Любой новый сетевой вызов обязан разворачивать цепочку
 * через rootCause — иначе пользователь увидит «fetch failed» без объяснений.
 */

type NodeError = Error & { code?: string; cause?: unknown };

const HINTS: Record<string, string> = {
    ENOTFOUND: 'Домен не резолвится в DNS — похоже, нет интернета или DNS его не отдаёт.',
    EAI_AGAIN: 'DNS не отвечает. Проверьте интернет или смените DNS-сервер.',
    ECONNREFUSED: 'Сервер отказал в соединении.',
    ETIMEDOUT:
        'Соединение не установилось за отведённое время — вероятно, трафик режет VPN, прокси или файрвол.',
    UND_ERR_CONNECT_TIMEOUT:
        'Соединение не установилось за отведённое время — вероятно, трафик режет VPN, прокси или файрвол.',
    ECONNRESET: 'Соединение разорвано на полпути — типично для VPN или фильтрующего прокси.',
    UNABLE_TO_VERIFY_LEAF_SIGNATURE:
        'Node не доверяет сертификату шлюза. Российские банки выпускают сертификаты через УЦ Минцифры, которого нет в наборе доверенных корней Node.',
    SELF_SIGNED_CERT_IN_CHAIN:
        'В цепочке сертификатов есть недоверенный корень. Обычно это значит, что не подключился корень УЦ Минцифры из certs/ (см. lib/payments/trust.ts); реже — трафик перехватывает корпоративный прокси или антивирус.',
    DEPTH_ZERO_SELF_SIGNED_CERT:
        'Сертификат самоподписанный — трафик, скорее всего, перехватывает прокси или антивирус.',
    CERT_HAS_EXPIRED: 'Сертификат шлюза просрочен.',
};

/** Разворачивает цепочку cause до самой нижней ошибки — там лежит настоящий код. */
export function rootCause(error: unknown): NodeError {
    let current = error as NodeError;
    while (current?.cause) current = current.cause as NodeError;
    return current;
}

/** Переводит код сетевой ошибки Node в понятную причину и подсказку. */
export function explainNetworkError(error: NodeError): string {
    const code = error.code ?? '';
    const hint = HINTS[code] ?? '';
    const raw = `${code ? code + ': ' : ''}${error.message}`;
    return `${hint} (${raw}) Запустите «npm run diag» — скрипт покажет, на каком шаге всё ломается.`;
}

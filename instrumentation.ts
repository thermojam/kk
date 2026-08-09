/**
 * Хук Next, который выполняется один раз при старте серверного процесса —
 * до первого запроса. Здесь ставится доверие корню УЦ Минцифры: без него
 * любой запрос к платёжному шлюзу падает с SELF_SIGNED_CERT_IN_CHAIN.
 *
 * Проверка PUBLIC_BASE_URL здесь же: из него строятся returnUrl и failUrl,
 * которые уходят банку. Если он разъедется с адресом, на котором сайт реально
 * живёт, оплата пройдёт, а покупатель вернётся на мёртвую страницу — молча,
 * ошибку никто не увидит.
 */

export async function register() {
    // Edge-рантайм не умеет node:tls и не ходит в шлюз — там делать нечего.
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const { installGatewayTrust } = await import('./lib/payments/trust.ts');
    const { currentEnv } = await import('./lib/payments/gateway.ts');

    const trust = installGatewayTrust();
    if (!trust.ok) {
        console.error(`\n  Не удалось добавить корень платёжного шлюза: ${trust.reason}`);
        console.error('  Запросы к Альфа-Банку упадут с SELF_SIGNED_CERT_IN_CHAIN.');
        console.error('  Подробности — «npm run diag».\n');
    }

    const env = currentEnv();
    console.log(`  Среда шлюза:     ${env === 'test' ? 'ТЕСТОВАЯ (alfa.rbsuat.com)' : 'ПРОДУКТИВНАЯ — реальные деньги!'}`);
    console.log(`  Фискализация:    ${process.env.FISCALIZATION === 'on' ? 'включена' : 'выключена'}`);
    console.log(`  Корень Минцифры: ${trust.ok ? `добавлен (доверенных корней: ${trust.total})` : 'НЕ ДОБАВЛЕН'}`);

    const baseUrl = process.env.PUBLIC_BASE_URL;
    if (!baseUrl) {
        console.warn('  ⚠️  PUBLIC_BASE_URL не задан — банку уйдёт адрес возврата на localhost.');
    } else {
        console.log(`  Банк вернёт на:  ${baseUrl}/payment/result/`);
    }
    console.log('');
}

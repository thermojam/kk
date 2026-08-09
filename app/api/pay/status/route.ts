/**
 * Статус заказа. Единственный источник правды об оплате: ни адрес возврата,
 * ни errorCode: 0 в ответе шлюза не означают, что деньги списаны.
 *
 * Персональные данные отсюда не отдаются вообще — ни имени, ни email,
 * ни телефона. Поэтому orderId нечего защищать: покупатель и так получил его
 * от банка, а больше по нему ничего не узнать. Это причина, по которой
 * в проекте нет подписанных кук и токенов доступа.
 */

import {
    AlfaError,
    ORDER_STATUS_TEXT,
    detectPaymentWay,
    getOrderStatus,
} from '@/lib/payments/gateway';
import { updateStatus } from '@/lib/payments/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
    const orderId = new URL(request.url).searchParams.get('orderId')?.trim();
    if (!orderId) {
        return Response.json({ error: 'Не указан номер заказа.' }, { status: 400 });
    }

    try {
        const status = await getOrderStatus(orderId);

        if (status.orderStatus !== undefined) {
            updateStatus(orderId, status.orderStatus);
        }

        return Response.json({
            orderStatus: status.orderStatus ?? null,
            statusText:
                status.orderStatus === undefined ? null : ORDER_STATUS_TEXT[status.orderStatus],
            amount: status.amount ?? null,
            orderNumber: status.orderNumber ?? null,
            paymentWay: detectPaymentWay(status),
            // Именно ?? null, а не || null: actionCode 0 — код успешной
            // авторизации, и терять его нельзя.
            actionCode: status.actionCode ?? null,
            actionCodeDescription: status.actionCodeDescription ?? null,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error(`Не удалось получить статус заказа ${orderId}: ${details}`);

        // Как и в create: покупателю — только текст банка.
        return Response.json(
            {
                error: error instanceof AlfaError
                    ? details
                    : 'Не удалось проверить платёж. Обновите статус через минуту или напишите мне в Телеграм.',
            },
            { status: 502 }
        );
    }
}

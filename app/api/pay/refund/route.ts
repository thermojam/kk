/**
 * Возврат средств. Служебный эндпоинт: кнопки возврата на публичных страницах
 * нет и быть не должно — иначе вернуть чужой платёж сможет любой, кто узнал
 * orderId.
 *
 * Возврат в день оплаты шлюз проводит как отмену авторизации: заказ уходит
 * в статус 3, а не 4. Статус 4 приходит, только если возвращать позже.
 */

import { refundOrder } from '@/lib/payments/gateway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
    const token = process.env.REFUND_TOKEN;
    if (!token) {
        console.error('REFUND_TOKEN не задан — эндпоинт возврата отключён.');
        return Response.json({ error: 'Возврат не настроен.' }, { status: 503 });
    }

    if (request.headers.get('authorization') !== `Bearer ${token}`) {
        return Response.json({ error: 'Нет доступа.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
    if (!orderId) {
        return Response.json({ error: 'Не указан номер заказа.' }, { status: 400 });
    }

    // Пусто — полный возврат.
    const amount = typeof body?.amount === 'number' ? body.amount : undefined;

    try {
        await refundOrder(orderId, amount);
        return Response.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Неизвестная ошибка шлюза.';
        console.error(`Не удалось вернуть заказ ${orderId}: ${message}`);
        return Response.json({ error: message }, { status: 502 });
    }
}

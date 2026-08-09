/**
 * Создание заказа: регистрирует его в шлюзе и отдаёт адрес платёжной страницы
 * банка. Карточные данные сюда не приходят никогда — покупатель вводит их
 * уже на стороне Альфа-Банка.
 */

import { randomUUID } from 'node:crypto';
import { getProduct, isProductId } from '@/lib/payments/catalog';
import { AlfaError, registerOrder } from '@/lib/payments/gateway';
import { saveOrder } from '@/lib/payments/orders';
import { buildOrderBundle } from '@/lib/payments/receipt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Эндпоинт ходит в банк на каждый вызов — открытым его оставлять нельзя.
 * Map живёт в памяти процесса: при перезапуске счётчики обнуляются, и это
 * приемлемо, задача — отсечь скрипт, а не построить учёт.
 */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const attempts = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (attempts.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
    recent.push(now);
    attempts.set(ip, recent);
    return recent.length > RATE_MAX;
}

function fail(message: string, status: number): Response {
    return Response.json({ error: message }, { status });
}

export async function POST(request: Request): Promise<Response> {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return fail('Не удалось прочитать запрос.', 400);

    const { productId, name, email, phone, consent } = body;

    if (!isProductId(productId)) return fail('Такого продукта нет.', 400);

    // Без согласия нет правового основания обрабатывать email и телефон.
    if (consent !== true) return fail('Нужно принять оферту и политику обработки данных.', 400);

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) return fail('Укажите имя — как к вам обращаться.', 400);

    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    if (!EMAIL.test(trimmedEmail)) {
        return fail('Укажите корректный email — на него придёт чек.', 400);
    }

    // Форма присылает уже нормализованный «+79991234567», но запрос может прийти
    // и мимо неё, поэтому цифры вытаскиваем сами. Телефон необязателен: если он
    // есть, то должен быть полным — половина номера в чеке бесполезна.
    const rawPhone = typeof phone === 'string' ? phone.trim() : '';
    const phoneDigits = rawPhone.replace(/\D/g, '');
    if (rawPhone && phoneDigits.length !== 11) {
        return fail('Телефон должен содержать 11 цифр.', 400);
    }
    const trimmedPhone = phoneDigits ? `+${phoneDigits}` : '';

    // nginx проставляет x-forwarded-for; без него все запросы схлопнутся
    // в один ключ, и лимит станет общим на всех — это тоже рабочее поведение.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (rateLimited(ip)) {
        return fail('Слишком много попыток подряд. Подождите несколько минут.', 429);
    }

    // Слэш в конце дал бы «//payment/result/»: Next чинит это 308-редиректом,
    // но лишний прыжок на возврате из банка ни к чему.
    const baseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/+$/, '');
    if (!baseUrl) {
        console.error('PUBLIC_BASE_URL не задан — банку некуда возвращать покупателя.');
        return fail('Оплата временно недоступна. Напишите мне в Телеграм, я помогу.', 500);
    }

    const product = getProduct(productId);
    const orderNumber = `${product.id}-${Date.now()}-${randomUUID().slice(0, 5)}`;
    const returnUrl = `${baseUrl}/payment/result/`;

    try {
        const registered = await registerOrder({
            orderNumber,
            amount: product.priceKopecks,
            returnUrl,
            // Различать адреса возврата смысла нет: статус всё равно спрашивается
            // у шлюза, а не выводится из того, куда покупатель вернулся.
            failUrl: returnUrl,
            description: product.title,
            email: trimmedEmail,
            orderBundle:
                process.env.FISCALIZATION === 'on'
                    ? buildOrderBundle(product, {
                          email: trimmedEmail,
                          phone: trimmedPhone || undefined,
                      })
                    : undefined,
        });

        saveOrder({
            orderId: registered.orderId,
            orderNumber,
            productId: product.id,
            amountKopecks: product.priceKopecks,
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone || null,
        });

        // orderId в ответе не нужен: банк вернёт его покупателю в query.
        return Response.json({ formUrl: registered.formUrl });
    } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error(`Не удалось создать заказ ${orderNumber}: ${details}`);

        // Наружу — только текст самого банка: он написан для покупателя.
        // Ошибки конфигурации и сети содержат имена переменных окружения
        // и советы про «npm run diag» — этому в браузере делать нечего.
        return fail(
            error instanceof AlfaError
                ? details
                : 'Оплата временно недоступна. Попробуйте позже или напишите мне в Телеграм.',
            502
        );
    }
}

/**
 * Тонкий клиент REST-интерфейса платёжного шлюза Альфа-Банка (схема API-R:
 * платёжная страница на стороне банка, карточные данные через наш сервер
 * не проходят никогда).
 *
 * Документация:
 * https://alfabank.ru/sme/payservice/internet-acquiring/docs/connection-options/api-r/
 *
 * Все запросы — HTTP POST с телом application/x-www-form-urlencoded.
 * Ответ — JSON. errorCode = 0 означает «запрос обработан без системных ошибок»
 * и НЕ означает, что заказ оплачен: статус заказа берётся из
 * getOrderStatusExtended.do.
 *
 * Модуль только для сервера: он читает ALFA_USERNAME / ALFA_PASSWORD. В браузере
 * эти переменные — undefined (Next подставляет в клиентский бандл только
 * NEXT_PUBLIC_*), поэтому импорт из клиентского компонента не утечёт пароль,
 * но сломает оплату с ошибкой про незаданные реквизиты. Импортировать отсюда
 * можно только из route handlers и серверных компонентов.
 */

import { explainNetworkError, rootCause } from './errors.ts';

const HOSTS = {
    test: 'https://alfa.rbsuat.com',
    prod: 'https://payment.alfabank.ru',
} as const;

export type AlfaEnv = keyof typeof HOSTS;

/** Статусы из getOrderStatusExtended.do. Поля нет у незарегистрированного заказа. */
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PaymentWay = 'CARD' | 'SBP_C2B' | null;

export type MerchantOrderParam = { name: string; value: string };

export type CardAuthInfo = {
    maskedPan?: string;
    expiration?: string;
    cardholderName?: string;
    approvalCode?: string;
};

export type RegisterResult = {
    orderId: string;
    formUrl: string;
};

export type OrderStatusResult = {
    orderNumber?: string;
    orderStatus?: OrderStatus;
    /** 0 — успешная авторизация. Именно 0, а не «пусто»: см. фильтр в PaymentResult. */
    actionCode?: number;
    actionCodeDescription?: string;
    amount?: number;
    date?: number;
    paymentWay?: string;
    cardAuthInfo?: CardAuthInfo;
    merchantOrderParams?: MerchantOrderParam[];
};

export type RegisterParams = {
    /** Уникален в пределах магазина. */
    orderNumber: string;
    /** Сумма в копейках. */
    amount: number;
    returnUrl: string;
    failUrl: string;
    description?: string;
    email?: string;
    /** JSON-строка с корзиной для чека ОФД. */
    orderBundle?: string;
};

export class AlfaError extends Error {
    readonly alfaCode: string;

    constructor(message: string, alfaCode: string) {
        super(message);
        this.name = 'AlfaError';
        this.alfaCode = alfaCode;
    }
}

export function currentEnv(): AlfaEnv {
    return process.env.ALFA_ENV === 'prod' ? 'prod' : 'test';
}

function config() {
    const env = currentEnv();
    const userName = process.env.ALFA_USERNAME;
    const password = process.env.ALFA_PASSWORD;

    if (!userName || !password) {
        throw new Error(
            'Не заданы ALFA_USERNAME / ALFA_PASSWORD. Скопируйте .env.example в .env и впишите реквизиты.'
        );
    }
    return { base: `${HOSTS[env]}/payment/rest`, userName, password };
}

/** Выполняет запрос к шлюзу и возвращает разобранный JSON-ответ. */
async function call<T>(method: string, params: Record<string, string | number | undefined>): Promise<T> {
    const { base, userName, password } = config();

    const body = new URLSearchParams({ userName, password });
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            body.set(key, String(value));
        }
    }

    let response: Response;
    try {
        response = await fetch(`${base}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            cache: 'no-store',
        });
    } catch (cause) {
        throw new Error(
            `Нет связи с платёжным шлюзом (${base}). ${explainNetworkError(rootCause(cause))}`,
            { cause }
        );
    }

    if (!response.ok) {
        throw new Error(`Шлюз вернул HTTP ${response.status} на ${method}`);
    }

    const data = (await response.json()) as Record<string, unknown>;

    // Шлюз кладёт код ошибки то в errorCode, то в ErrorCode — нормализуем.
    const errorCode = String(data.errorCode ?? data.ErrorCode ?? '0');
    if (errorCode !== '0') {
        const message = String(data.errorMessage ?? data.ErrorMessage ?? 'неизвестная ошибка');
        throw new AlfaError(`Альфа-Банк (${method}): ${message} [код ${errorCode}]`, errorCode);
    }

    return data as T;
}

/**
 * Регистрация заказа. formUrl — адрес платёжной страницы банка,
 * куда надо отправить покупателя.
 */
export function registerOrder(order: RegisterParams): Promise<RegisterResult> {
    return call<RegisterResult>('register.do', {
        orderNumber: order.orderNumber,
        amount: order.amount,
        // Валюта намеренно не передаётся: шлюз возьмёт ту, на которую настроен
        // магазин. Коды в средах разные — тестовый магазин заведён на 810
        // (старый код рубля), продуктивные обычно на 643, и жёстко зашитое
        // значение даёт «Неизвестная валюта [код 3]» в одной из сред.
        // Переопределить можно через ALFA_CURRENCY, если магазин мультивалютный.
        currency: process.env.ALFA_CURRENCY,
        returnUrl: order.returnUrl,
        failUrl: order.failUrl,
        description: order.description,
        email: order.email,
        orderBundle: order.orderBundle,
        language: 'ru',
    });
}

/** Единственный источник правды о том, оплачен ли заказ. */
export function getOrderStatus(orderId: string): Promise<OrderStatusResult> {
    return call<OrderStatusResult>('getOrderStatusExtended.do', { orderId, language: 'ru' });
}

/**
 * Возврат средств. amount — в копейках, пусто = полный возврат.
 *
 * Ноль подставляется намеренно: полным возвратом шлюз считает именно
 * `amount=0`, а не отсутствие параметра — на пустом он отвечает
 * «[amount] не задан [код 5]». Проверено на тестовом контуре 09.08.2026.
 */
export function refundOrder(orderId: string, amount?: number): Promise<unknown> {
    return call('refund.do', { orderId, amount: amount ?? 0, language: 'ru' });
}

/**
 * Способ оплаты по ответу getOrderStatusExtended.do.
 *
 * Поля paymentWay в ответе тестового шлюза нет вообще — ни у карточного платежа,
 * ни у отклонённой попытки СБП (проверено на обоих). Поэтому определяем по следам:
 * QR_ID / QR_PAYLOAD в merchantOrderParams — это СБП, cardAuthInfo — карта.
 * Без этого страница результата показывает «—» и советует «попробовать другой
 * картой» там, где карту никто не вводил.
 */
export function detectPaymentWay(status: OrderStatusResult): PaymentWay {
    if (status.paymentWay === 'CARD' || status.paymentWay === 'SBP_C2B') return status.paymentWay;

    const params = status.merchantOrderParams ?? [];
    if (params.some((p) => p.name === 'QR_ID' || p.name === 'QR_PAYLOAD')) return 'SBP_C2B';

    if (status.cardAuthInfo?.maskedPan) return 'CARD';

    return null;
}

/** Человекочитаемая расшифровка orderStatus. */
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
    0: 'Заказ зарегистрирован, но не оплачен',
    1: 'Сумма захолдирована (двухстадийный платёж)',
    2: 'Оплачен',
    3: 'Авторизация отменена',
    4: 'Оформлен возврат',
    5: 'Инициирована авторизация через ACS',
    6: 'Авторизация отклонена',
};

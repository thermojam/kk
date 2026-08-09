/**
 * Каталог того, что продаётся на сайте.
 *
 * ЕДИНСТВЕННЫЙ источник цены. Карточка услуги рисует цену отсюда, register.do
 * получает сумму отсюда же — разойтись они не могут. Не дублируйте цену
 * в content/home.ts и не пишите её строкой в разметке.
 *
 * Суммы — в копейках, как их принимает шлюз.
 */

export type Product = {
    readonly id: string;
    /** Уходит в description заказа и в наименование позиции чека. */
    readonly title: string;
    readonly priceKopecks: number;
    /**
     * Признак предмета расчёта, тег 1212. 4 — услуга.
     * При продаже товара значение другое.
     */
    readonly paymentObject: 1 | 4;
    /**
     * Признак способа расчёта, тег 1214. 1 — полная предоплата.
     * 6 900 ₽ — полная стоимость курса, поэтому 1. Для частичной оплаты
     * значение другое, и в уже пробитом чеке его не переиграть.
     */
    readonly paymentMethod: 1 | 2;
};

export const PRODUCTS = {
    course: {
        id: 'course',
        title: 'Курс «Три ступени к телу»',
        priceKopecks: 690_000,
        paymentObject: 4,
        paymentMethod: 1,
    },
} as const satisfies Record<string, Product>;

export type ProductId = keyof typeof PRODUCTS;

export function getProduct(id: ProductId): Product {
    return PRODUCTS[id];
}

export function isProductId(value: unknown): value is ProductId {
    return typeof value === 'string' && Object.hasOwn(PRODUCTS, value);
}

/**
 * «690000» → «6 900 ₽». Без Intl намеренно: формат обязан совпасть до символа
 * на сервере и в браузере, иначе React ругается на несовпадение при гидратации.
 * Разряды разделяются обычным пробелом — как в ценах в content/home.ts.
 */
export function formatPrice(kopecks: number): string {
    const rubles = Math.round(kopecks / 100);
    const grouped = String(rubles).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${grouped} ₽`;
}

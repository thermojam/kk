/**
 * Корзина для фискального чека по 54-ФЗ.
 *
 * Уходит в register.do параметром orderBundle только при FISCALIZATION=on.
 * Включать можно лишь после того, как у оператора ОФД подключена онлайн-касса:
 * без неё чек не пробьётся, даже если orderBundle сформирован верно
 * (проверено платежом 4 900 ₽ 9 августа 2026, см. alfa-test/docs/paykeeper.md).
 *
 * taxType: 0 — «без НДС», для ИП на УСН. При другой системе налогообложения
 * значение нужно менять.
 */

import type { Product } from './catalog.ts';

export type Customer = {
    email: string;
    phone?: string;
};

export function buildOrderBundle(product: Product, customer: Customer): string {
    return JSON.stringify({
        customerDetails: {
            email: customer.email,
            ...(customer.phone ? { phone: customer.phone } : {}),
        },
        cartItems: {
            items: [
                {
                    positionId: 1,
                    name: product.title,
                    quantity: { value: '1', measure: 'шт' },
                    itemAmount: product.priceKopecks,
                    itemPrice: product.priceKopecks,
                    itemCode: product.id,
                    tax: { taxType: 0 },
                    itemAttributes: {
                        attributes: [
                            { name: 'paymentMethod', value: String(product.paymentMethod) },
                            { name: 'paymentObject', value: String(product.paymentObject) },
                        ],
                    },
                },
            ],
        },
    });
}

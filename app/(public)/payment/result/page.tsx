import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentResult } from '@/components/payment/PaymentResult';

export const metadata: Metadata = {
    title: 'Результат оплаты',
    robots: { index: false, follow: false },
};

/**
 * Сюда банк возвращает покупателя — и после успешной оплаты, и после неудачной.
 * Различать адреса возврата смысла нет: статус спрашивается у шлюза.
 *
 * orderId читается через useSearchParams в клиентском компоненте, поэтому он
 * обязан лежать в <Suspense>: без границы Next не сможет отрендерить оболочку
 * страницы статически.
 */
export default function PaymentResultPage() {
    return (
        <article className="container-page py-16 lg:py-24">
            <div className="mx-auto max-w-3xl">
                <Suspense fallback={<p className="text-body text-neutral-500">Проверяем платёж…</p>}>
                    <PaymentResult />
                </Suspense>
            </div>
        </article>
    );
}

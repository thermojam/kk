'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BuyButton } from '@/components/payment/BuyButton';
import { formatPrice } from '@/lib/payments/catalog';
import { reachGoal } from '@/lib/analytics/metrika';
import { PAY_GOALS } from '@/lib/telegram';

type StatusResponse = {
    orderStatus: number | null;
    statusText: string | null;
    amount: number | null;
    orderNumber: string | null;
    paymentWay: 'CARD' | 'SBP_C2B' | null;
    actionCode: number | null;
    actionCodeDescription: string | null;
};

type Tone = 'success' | 'neutral' | 'error';

const toneClasses: Record<Tone, string> = {
    success: 'bg-success text-neutral-0',
    neutral: 'bg-neutral-50 text-neutral-700 border border-neutral-100',
    error: 'bg-error text-neutral-0',
};

const PAYMENT_WAY_TEXT: Record<'CARD' | 'SBP_C2B', string> = {
    CARD: 'Банковская карта',
    SBP_C2B: 'СБП',
};

type View = {
    tone: Tone;
    badge: string;
    title: string;
    text: string;
    action: 'retry' | 'refresh' | null;
};

function view(status: StatusResponse): View {
    switch (status.orderStatus) {
        case 2:
            return {
                tone: 'success',
                badge: 'Оплачено',
                title: 'Оплата прошла',
                text: 'Ксения напишет вам в Телеграм в течение дня и пришлёт приглашение в закрытый чат курса. Чек придёт на указанную почту.',
                action: null,
            };
        // Возврат в день оплаты шлюз проводит как отмену авторизации: холд снят,
        // деньги покупателю не списывались. Это не неудачный платёж.
        case 3:
            return {
                tone: 'success',
                badge: 'Авторизация отменена',
                title: 'Авторизация отменена',
                text: 'Холд снят, деньги с карты не списывались.',
                action: null,
            };
        case 4:
            return {
                tone: 'success',
                badge: 'Возврат',
                title: 'Оформлен возврат',
                text: 'Сумма вернётся на карту, которой вы платили. Обычно это занимает до нескольких рабочих дней — срок зависит от вашего банка.',
                action: null,
            };
        case 0:
            return {
                tone: 'neutral',
                badge: 'Не оплачено',
                title: 'Заказ не оплачен',
                text: 'Оплата не была завершена. Деньги с карты не списывались — можно попробовать ещё раз.',
                action: 'retry',
            };
        case 1:
        case 5:
            return {
                tone: 'neutral',
                badge: 'В обработке',
                title: 'Платёж обрабатывается',
                text: 'Банк ещё не закончил обработку. Обновите статус через минуту.',
                action: 'refresh',
            };
        case 6:
            return {
                tone: 'error',
                badge: 'Отклонён',
                title: 'Платёж отклонён',
                text:
                    status.paymentWay === 'SBP_C2B'
                        ? 'Банк не подтвердил перевод. Деньги с вашего счёта не списывались — можно попробовать ещё раз.'
                        : 'Банк не подтвердил оплату. Деньги с карты не списывались — попробуйте другую карту или свяжитесь со своим банком.',
                action: 'retry',
            };
        default:
            return {
                tone: 'neutral',
                badge: 'Неизвестно',
                title: 'Не удалось определить статус заказа',
                text: 'Обновите страницу через минуту. Если статус не появится — напишите мне в Телеграм, я проверю платёж вручную.',
                action: 'refresh',
            };
    }
}

export function PaymentResult() {
    const orderId = useSearchParams().get('orderId');
    const [status, setStatus] = useState<StatusResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const goalSent = useRef(false);

    // setLoading(true) сюда не входит намеренно: load вызывается из эффекта,
    // а синхронный setState в теле эффекта запрещён правилом react-hooks.
    // Начальное состояние уже loading, а кнопка «Обновить» ставит его сама.
    const load = useCallback(async () => {
        if (!orderId) return;

        try {
            // Слэш перед query обязателен: trailingSlash: true в next.config.
            const response = await fetch(
                `/api/pay/status/?orderId=${encodeURIComponent(orderId)}`
            );
            const data = (await response.json()) as StatusResponse & { error?: string };

            if (!response.ok) {
                setError(data.error ?? 'Не удалось получить статус заказа.');
            } else {
                setError(null);
                setStatus(data);

                // Один раз за жизнь страницы, а не на каждый опрос.
                if (!goalSent.current) {
                    if (data.orderStatus === 2) reachGoal(PAY_GOALS.success);
                    if (data.orderStatus === 6) reachGoal(PAY_GOALS.fail);
                    goalSent.current = true;
                }
            }
        } catch {
            setError('Не удалось связаться с сайтом. Проверьте интернет и обновите статус.');
        }
        setLoading(false);
    }, [orderId]);

    useEffect(() => {
        // Спросить статус у банка можно только после монтирования: orderId
        // приходит в query. Внутри load все setState стоят после await,
        // но правило разбирает вызов статически и этого не видит.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    function refresh() {
        setLoading(true);
        void load();
    }

    if (!orderId) {
        return (
            <Shell title="Заказ не указан">
                <p className="text-body text-neutral-700">
                    В адресе страницы нет номера заказа. Если вы оплачивали курс — напишите мне
                    в Телеграм, я проверю платёж вручную.
                </p>
            </Shell>
        );
    }

    if (loading && !status) {
        return (
            <Shell title="Проверяем платёж…">
                <p className="text-body text-neutral-700">
                    Спрашиваем статус у банка. Это занимает пару секунд.
                </p>
            </Shell>
        );
    }

    if (error && !status) {
        return (
            <Shell title="Не удалось проверить платёж">
                <p className="text-body text-neutral-700">{error}</p>
                <Button type="button" variant="secondary" size="md" onClick={refresh}>
                    Обновить статус
                </Button>
            </Shell>
        );
    }

    if (!status) return null;

    const { tone, badge, title, text, action } = view(status);

    return (
        <Shell title={title} badge={<span className={badgeClasses(tone)}>{badge}</span>}>
            <p className="text-body text-neutral-700">{text}</p>

            <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-[13px] text-neutral-500 sm:grid-cols-2">
                <Detail label="Номер заказа" value={status.orderNumber} />
                <Detail
                    label="Сумма"
                    value={status.amount === null ? null : formatPrice(status.amount)}
                />
                <Detail
                    label="Способ оплаты"
                    value={status.paymentWay === null ? null : PAYMENT_WAY_TEXT[status.paymentWay]}
                />
                <Detail
                    label="Код ответа банка"
                    // Явная проверка: actionCode 0 — код успешной авторизации,
                    // filter(Boolean) выбросил бы его и показал прочерк.
                    value={
                        status.actionCode === null || status.actionCode === undefined
                            ? null
                            : [status.actionCode, status.actionCodeDescription]
                                  .filter((part) => part !== null && part !== undefined && part !== '')
                                  .join(' · ')
                    }
                />
            </dl>

            {action === 'retry' && (
                <BuyButton
                    productId="course"
                    label="Попробовать снова"
                    variant="primary"
                    size="md"
                />
            )}
            {action === 'refresh' && (
                <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={loading}
                    onClick={refresh}
                >
                    {loading ? 'Проверяем…' : 'Обновить статус'}
                </Button>
            )}
        </Shell>
    );
}

function badgeClasses(tone: Tone): string {
    return `inline-flex items-center gap-1 rounded-pill px-3 py-1 text-[12px] font-bold leading-none ${toneClasses[tone]}`;
}

function Detail({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex justify-between gap-4 border-b border-neutral-100 py-2">
            <dt>{label}</dt>
            <dd className="text-right text-neutral-700">{value ?? '—'}</dd>
        </div>
    );
}

function Shell({
    title,
    badge,
    children,
}: {
    title: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-start gap-5">
            {badge}
            <h1 className="text-h1 text-neutral-900">{title}</h1>
            {children}
        </div>
    );
}

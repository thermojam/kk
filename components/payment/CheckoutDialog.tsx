'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatPrice, getProduct, type ProductId } from '@/lib/payments/catalog';
import { reachGoal } from '@/lib/analytics/metrika';
import { PAY_GOALS } from '@/lib/telegram';

type CheckoutDialogProps = {
    productId: ProductId;
    open: boolean;
    onClose: () => void;
};

/** Та же проверка, что на сервере: клиентская — только чтобы не гонять запрос зря. */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Приводит ввод к «+7 (999) 123-45-67». Ведущие 7 или 8 считаем кодом страны:
 * их набирают по привычке, а значащих цифр в номере всё равно десять.
 *
 * Формат никогда не заканчивается разделителем, поэтому Backspace всегда
 * съедает цифру и поле не залипает — отдельная обработка стирания не нужна.
 * Курсор при правке в середине уезжает в конец: для необязательного поля
 * это дешевле, чем возиться с восстановлением позиции.
 */
function formatPhone(input: string): string {
    const digits = input.replace(/\D/g, '');
    if (!digits) return '';

    const rest = (digits[0] === '7' || digits[0] === '8' ? digits.slice(1) : digits).slice(0, 10);

    let out = '+7';
    if (rest.length > 0) out += ` (${rest.slice(0, 3)}`;
    if (rest.length > 3) out += `) ${rest.slice(3, 6)}`;
    if (rest.length > 6) out += `-${rest.slice(6, 8)}`;
    if (rest.length > 8) out += `-${rest.slice(8, 10)}`;
    return out;
}

const fieldClasses =
    'h-11 w-full rounded-md border border-neutral-100 bg-neutral-0 px-4 text-body text-neutral-900 ' +
    'outline-none transition-colors focus-visible:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-300';

export function CheckoutDialog({ productId, open, onClose }: CheckoutDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Единственное управляемое поле: маску иначе не наложить.
    const [phone, setPhone] = useState('');

    const product = getProduct(productId);

    // showModal() даёт фокус-трап, закрытие по Esc и настоящий ::backdrop —
    // без библиотеки диалогов и без ручных обработчиков клавиатуры.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            setError(null);
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        const name = String(form.get('name') ?? '').trim();
        const email = String(form.get('email') ?? '').trim();
        const consent = form.get('consent') === 'on';
        const phoneDigits = phone.replace(/\D/g, '');

        if (!name) return setError('Укажите имя — как к вам обращаться.');
        if (!EMAIL.test(email)) return setError('Укажите корректный email — на него придёт чек.');
        if (phone && phoneDigits.length !== 11) return setError('Телефон введён не полностью.');
        if (!consent) return setError('Нужно принять оферту и политику обработки данных.');

        setError(null);
        setSubmitting(true);

        try {
            // Слэш на конце обязателен: trailingSlash: true в next.config,
            // без него запрос уедет через 308-редирект.
            const response = await fetch('/api/pay/create/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // В чек и в банк уходят только цифры: разделители маски там лишние.
                body: JSON.stringify({
                    productId,
                    name,
                    email,
                    phone: phoneDigits ? `+${phoneDigits}` : '',
                    consent,
                }),
            });
            const data = (await response.json()) as { formUrl?: string; error?: string };

            if (!response.ok || !data.formUrl) {
                // Текст приходит с сервера: там уже человеческая формулировка,
                // а не «fetch failed».
                setError(data.error ?? 'Не удалось создать заказ. Попробуйте ещё раз.');
                setSubmitting(false);
                return;
            }

            reachGoal(PAY_GOALS.submit);
            // Не router.push: formUrl ведёт на домен банка.
            window.location.href = data.formUrl;
        } catch {
            setError('Не удалось связаться с сайтом. Проверьте интернет и попробуйте ещё раз.');
            setSubmitting(false);
        }
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onClose={onClose}
            // Клик по ::backdrop приходит на сам <dialog>: содержимое лежит
            // во вложенном блоке, поэтому такой клик — это клик мимо окна.
            onClick={(event) => {
                if (event.target === dialogRef.current) onClose();
            }}
            // m-auto обязателен: браузер центрирует модальный <dialog>
            // через margin: auto, а preflight Tailwind обнуляет margin —
            // без него окно прилипает к левому верхнему углу.
            className="
                m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg bg-neutral-0 p-0
                shadow-[0_18px_50px_-28px_rgba(30,30,46,0.3)]
                backdrop:bg-neutral-950/60
            "
        >
            <div className="p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 id={titleId} className="text-h3 text-neutral-900">
                            {product.title}
                        </h2>
                        <span className="font-serif text-[24px] italic leading-none text-primary-500">
                            {formatPrice(product.priceKopecks)}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        className="
                            -mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full
                            text-neutral-500 outline-none transition-colors
                            hover:bg-neutral-50 hover:text-neutral-900
                            focus-visible:ring-2 focus-visible:ring-primary-300
                        "
                    >
                        <span aria-hidden="true" className="text-[18px] leading-none">
                            ✕
                        </span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-neutral-700">Имя</span>
                        <input name="name" type="text" autoComplete="name" className={fieldClasses} />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-neutral-700">
                            Email <span className="font-normal text-neutral-500">· на него придёт чек</span>
                        </span>
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={fieldClasses}
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-neutral-700">
                            Телефон <span className="font-normal text-neutral-500">· необязательно</span>
                        </span>
                        <input
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+7 (999) 123-45-67"
                            value={phone}
                            onChange={(event) => setPhone(formatPhone(event.target.value))}
                            className={fieldClasses}
                        />
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 text-[13px] text-neutral-700">
                        <input
                            name="consent"
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary-500"
                        />
                        <span>
                            Принимаю условия{' '}
                            <Link href="/offer/" className="text-primary-500 underline">
                                оферты
                            </Link>{' '}
                            и{' '}
                            <Link href="/privacy/" className="text-primary-500 underline">
                                политику обработки персональных данных
                            </Link>
                        </span>
                    </label>

                    {error && (
                        <p role="alert" className="text-[13px] text-error">
                            {error}
                        </p>
                    )}

                    <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
                        {submitting ? 'Создаём заказ…' : 'Перейти к оплате'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-[13px] text-neutral-500">
                    Оплата картой или через СБП на защищённой странице Альфа-Банка.
                    Карточные данные на наш сайт не передаются.
                </p>
            </div>
        </dialog>
    );
}

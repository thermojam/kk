import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { BuyButton } from '@/components/payment/BuyButton';
import { course } from '@/content/course';
import { formatPrice, getProduct } from '@/lib/payments/catalog';

export function CoursePricing() {
    const price = formatPrice(getProduct(course.productId).priceKopecks);

    return (
        <section id="pricing" className="container-page py-16 lg:py-24">
            <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-lg bg-primary-500 p-6 text-neutral-0 shadow-[0_18px_50px_-28px_rgba(30,30,46,0.3)]">
                <Badge tone="accent" className="self-start">
                    Полная стоимость
                </Badge>

                <div className="flex flex-col gap-1">
                    <span className="font-serif text-[32px] italic font-medium leading-none tracking-[-0.01em] text-accent-500 lg:text-[36px]">
                        {price}
                    </span>
                    {course.startsAt && (
                        <span className="text-[13px] text-neutral-0/85">
                            Старт {course.startsAt}
                        </span>
                    )}
                </div>

                <ul className="flex flex-col gap-2 border-t border-neutral-0/20 pt-4">
                    {course.pricingIncludes.map((item) => (
                        <li key={item} className="flex gap-3 text-neutral-0/90">
                            <span
                                aria-hidden="true"
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                            />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <BuyButton
                    productId={course.productId}
                    label="Купить курс"
                    variant="primary"
                    size="lg"
                    className="mt-2 w-full !bg-neutral-0 !text-primary-500 hover:!bg-neutral-50"
                />

                <p className="text-[13px] text-neutral-0/85">
                    Оплата картой или через СБП на странице Альфа-Банка. Нажимая кнопку,
                    вы принимаете{' '}
                    <Link href="/offer/" className="underline">
                        оферту
                    </Link>{' '}
                    и{' '}
                    <Link href="/privacy/" className="underline">
                        политику обработки персональных данных
                    </Link>
                    .
                </p>
            </div>
        </section>
    );
}

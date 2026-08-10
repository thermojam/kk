import { BuyButton } from '@/components/payment/BuyButton';
import { course } from '@/content/course';
import { formatPrice, getProduct } from '@/lib/payments/catalog';

export function CoursePricing() {
    const price = formatPrice(getProduct(course.productId).priceKopecks);

    return (
        <section id="pricing" className="container-page pb-16 pt-10 lg:pb-24 lg:pt-14">
            <div className="mx-auto grid max-w-[1030px] gap-10 rounded-[28px] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] p-8 text-neutral-0 sm:p-12 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-center lg:gap-16 lg:p-16">
                <div>
                    <h2 className="mb-6 text-h2 text-neutral-0">Что входит в курс</h2>
                    <ul className="flex flex-col">
                        {course.pricingIncludes.map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 border-b border-white/15 py-3 text-[16px] leading-[1.45] text-white/75 first:pt-0 last:pb-0"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-5 rounded-[20px] bg-white/10 p-7 text-center">
                    <span className="font-serif text-[48px] italic font-medium leading-none text-accent-300">
                        {price}
                    </span>
                    <BuyButton
                        productId={course.productId}
                        label="Купить курс"
                        variant="primary"
                        size="lg"
                        className="w-full !bg-neutral-0 !text-primary-700 hover:!bg-neutral-50"
                    />
                    <p className="text-[13px] leading-[1.5] text-white/60">
                        {course.hero.note}
                    </p>
                </div>
            </div>
        </section>
    );
}

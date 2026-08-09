import { Badge } from '@/components/ui/Badge';
import { BuyButton } from '@/components/payment/BuyButton';
import { course } from '@/content/course';
import { formatPrice, getProduct } from '@/lib/payments/catalog';

/**
 * Тёмный первый экран в стиле Hero главной, но ниже и без фотографии.
 * Отрицательный отступ сверху — под хедер, как на главной.
 */
export function CourseHero() {
    const price = formatPrice(getProduct(course.productId).priceKopecks);

    return (
        <section className="relative isolate -mt-[72px] min-h-[560px] overflow-hidden rounded-b-[42px] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] pt-[72px] lg:rounded-b-[72px]">
            <div className="container-page flex flex-col items-start gap-6 pb-20 pt-14 lg:pb-28 lg:pt-20">
                <Badge tone="accent" className="hero-reveal">
                    Курс
                </Badge>

                <h1 className="hero-reveal font-display text-white" style={{ animationDelay: '0.05s' }}>
                    <span className="block">Три ступени</span>
                    <span className="block text-accent-500">к телу</span>
                </h1>

                <p
                    className="hero-reveal text-body max-w-[560px] text-white/[0.78] lg:text-[17px] lg:leading-[1.55]"
                    style={{ animationDelay: '0.15s' }}
                >
                    {course.tagline}
                </p>

                <p
                    className="hero-reveal font-serif text-[28px] italic leading-none text-accent-500 lg:text-[32px]"
                    style={{ animationDelay: '0.2s' }}
                >
                    {price}
                    {course.startsAt && (
                        <span className="text-white/70"> · старт {course.startsAt}</span>
                    )}
                </p>

                <div className="hero-reveal w-full sm:w-auto" style={{ animationDelay: '0.25s' }}>
                    <BuyButton
                        productId={course.productId}
                        label="Купить курс"
                        variant="accent"
                        size="lg"
                        className="w-full px-8 sm:w-auto"
                    />
                </div>

                <p
                    className="hero-reveal -mt-2 font-sans text-[13px] text-white/50"
                    style={{ animationDelay: '0.3s' }}
                >
                    Оплата картой или через СБП на защищённой странице Альфа-Банка
                </p>
            </div>
        </section>
    );
}

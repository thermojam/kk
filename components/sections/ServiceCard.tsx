import { TelegramButton } from '@/components/ui/TelegramButton';
import { BuyButton } from '@/components/payment/BuyButton';
import { Badge } from '@/components/ui/Badge';
import { DisclaimerToggle } from '@/components/sections/DisclaimerToggle';
import type { Service } from '@/content/home';
import { formatPrice, getProduct } from '@/lib/payments/catalog';
import { cn } from '@/lib/cn';

type ServiceCardProps = { item: Service };

export function ServiceCard({ item }: ServiceCardProps) {
    const featured = item.featured === true;
    const showDisclaimerBeforePrices = item.id === 'bereginya' && Boolean(item.disclaimer);

    // У платной услуги prices намеренно пуст: цена приходит из каталога —
    // из того же места, откуда её берёт register.do.
    const prices =
        item.cta.kind === 'payment'
            ? [{ value: formatPrice(getProduct(item.cta.productId).priceKopecks) }]
            : item.prices;

    return (
        <article
            className={cn(
                'relative flex h-full flex-col gap-4 rounded-lg p-6 transition-shadow duration-200',
                featured
                    ? 'bg-primary-500 text-neutral-0 shadow-[0_18px_50px_-28px_rgba(30,30,46,0.3)]'
                    : 'border border-neutral-100 bg-neutral-0 text-neutral-900 shadow-[0_18px_50px_-32px_rgba(30,30,46,0.18)]'
            )}
        >
            <Badge tone={featured ? 'accent' : 'neutral'} className="self-start">
                {item.badge}
            </Badge>

            <div className="flex min-h-[5.5rem] flex-col gap-1">
                <h3
                    className={cn(
                        'text-h3 line-clamp-2 min-h-[2lh]',
                        featured ? 'text-neutral-0' : 'text-neutral-900'
                    )}
                >
                    {item.title}
                </h3>
                {item.subtitle && (
                    <p
                        className={cn(
                            'font-serif italic text-[16px]',
                            featured ? 'text-neutral-0/90' : 'text-primary-500'
                        )}
                    >
                        {item.subtitle}
                    </p>
                )}
            </div>

            <p
                className={cn(
                    'text-body flex-1',
                    featured ? 'text-neutral-0/90' : 'text-neutral-700'
                )}
            >
                {item.description}
            </p>

            {showDisclaimerBeforePrices && item.disclaimer && (
                <DisclaimerToggle text={item.disclaimer} />
            )}

            {(prices.length > 0 || item.pricingNote) && (
                <div
                    className={cn(
                        'mt-auto flex flex-col gap-2 border-t pt-3.5',
                        featured ? 'border-neutral-0/20' : 'border-neutral-100'
                    )}
                >
                    {prices.length > 0 && (
                        <ul className="flex flex-col gap-2">
                            {prices.map((price) => (
                                <li
                                    key={price.value + (price.meta ?? '')}
                                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
                                >
                                    <span
                                        className={cn(
                                            'font-serif italic font-medium leading-none tracking-[-0.01em] text-[32px] lg:text-[36px]',
                                            featured ? 'text-accent-500' : 'text-primary-500'
                                        )}
                                    >
                                        {price.value}
                                    </span>
                                    {price.meta && (
                                        <span
                                            className={cn(
                                                'text-[13px]',
                                                featured ? 'text-neutral-0/85' : 'text-neutral-500'
                                            )}
                                        >
                                            {price.meta}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {item.pricingNote && (
                        <p
                            className={cn(
                                'font-serif italic text-[13px]',
                                featured ? 'text-neutral-0/85' : 'text-neutral-500'
                            )}
                        >
                            {item.pricingNote}
                        </p>
                    )}
                </div>
            )}

            {!showDisclaimerBeforePrices && item.disclaimer && <DisclaimerToggle text={item.disclaimer} />}

            {item.cta.kind === 'payment' ? (
                <BuyButton
                    productId={item.cta.productId}
                    label={item.cta.label}
                    variant="primary"
                    size="md"
                    className={cn(
                        featured && '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                    )}
                />
            ) : (
                <TelegramButton
                    goal={item.cta.tgGoal}
                    text={item.cta.tgText}
                    variant="primary"
                    className={cn(
                        prices.length === 0 && !item.pricingNote && 'mt-auto',
                        featured && '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50'
                    )}
                >
                    {item.cta.label}
                </TelegramButton>
            )}
        </article>
    );
}

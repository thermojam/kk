import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Service } from '@/content/home';
import { cn } from '@/lib/cn';

type ServiceCardProps = { item: Service };

export function ServiceCard({ item }: ServiceCardProps) {
    const featured = item.featured === true;

    return (
        <article
            className={cn(
                'flex h-full flex-col gap-4 rounded-lg p-6',
                featured
                    ? 'bg-primary-500 text-neutral-0'
                    : 'bg-neutral-0 text-neutral-900 border border-neutral-100 shadow-sm'
            )}
        >
            <Badge tone={featured ? 'accent' : 'neutral'} className="self-start">
                {item.badge}
            </Badge>

            <div className="flex flex-col gap-1">
                <h3 className={cn('text-h3', featured ? 'text-neutral-0' : 'text-neutral-900')}>
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

            {item.pricing.length > 0 && (
                <ul
                    className={cn(
                        'flex flex-col gap-1 text-[14px]',
                        featured ? 'text-neutral-0/85' : 'text-neutral-500'
                    )}
                >
                    {item.pricing.map((line) => (
                        <li key={line}>{line}</li>
                    ))}
                </ul>
            )}

            <Button
                href={item.cta.href}
                variant="primary"
                className={featured ? '!bg-neutral-0 !text-primary-500 hover:!bg-neutral-50' : ''}
            >
                {item.cta.label}
            </Button>

            {item.disclaimer && (
                <p className="border-t border-neutral-100 pt-4 text-[13px] text-neutral-500 leading-snug">
                    {item.disclaimer}
                </p>
            )}
        </article>
    );
}

import { cn } from '@/lib/cn';

type ResponsiveImageName =
    | 'hero'
    | 'about'
    | 'course'
    | 'food-bogina'
    | 'food-bogina-author'
    | 'service-consultation'
    | 'service-course'
    | 'service-food-boginya'
    | 'service-free-consultation'
    | 'service-gymnastics'
    | 'service-long-support'
    | 'service-nutrition-psychosomatics'
    | 'service-psych-session';

type ResponsiveImageProps = {
    /** Базовое имя источника (без размера и расширения). */
    name: ResponsiveImageName;
    alt: string;
    /** Доступные ширины из public/images/generated/. Должны существовать avif+webp файлы для каждой. */
    widths: number[];
    /** Ширина для fallback `<img src>` (обычно средняя). */
    fallbackWidth: number;
    /** Intrinsic width/height — для CLS. */
    width: number;
    height: number;
    sizes: string;
    /** true => loading="eager" + fetchpriority="high". По умолчанию lazy. */
    priority?: boolean;
    /** Небольшие изображения в карусели лучше загрузить до прокрутки. */
    loading?: 'eager' | 'lazy';
    className?: string;
};

function srcSetFor(name: ResponsiveImageName, widths: number[], ext: 'avif' | 'webp') {
    return widths.map((w) => `/images/generated/${name}-${w}.${ext} ${w}w`).join(', ');
}

export function ResponsiveImage({
    name,
    alt,
    widths,
    fallbackWidth,
    width,
    height,
    sizes,
    priority = false,
    loading = 'lazy',
    className,
}: ResponsiveImageProps) {
    return (
        <picture>
            <source type="image/avif" srcSet={srcSetFor(name, widths, 'avif')} sizes={sizes} />
            <source type="image/webp" srcSet={srcSetFor(name, widths, 'webp')} sizes={sizes} />
            <img
                src={`/images/generated/${name}-${fallbackWidth}.webp`}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : loading}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className={cn(className)}
            />
        </picture>
    );
}

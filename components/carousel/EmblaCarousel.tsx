'use client';

import type {EmblaOptionsType} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import {useEffect, type CSSProperties, type KeyboardEvent, type ReactNode} from 'react';
import {CarouselArrows} from '@/components/carousel/CarouselArrows';
import {CarouselDots} from '@/components/carousel/CarouselDots';
import {cn} from '@/lib/cn';

type SlidesPerView = { base: number; lg?: number };

export type EmblaCarouselProps<T> = {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    options?: EmblaOptionsType;
    showArrows?: boolean;
    showDots?: boolean;
    slidesPerView?: SlidesPerView;
    className?: string;
    ariaLabel: string;
};

export function EmblaCarousel<T>({
                                     items,
                                     renderItem,
                                     options,
                                     showArrows = false,
                                     showDots = true,
                                     slidesPerView = {base: 1},
                                     className,
                                     ariaLabel,
                                 }: EmblaCarouselProps<T>) {
    const [viewportRef, embla] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        ...options,
    });

    // Реинициализация при resize
    useEffect(() => {
        if (!embla) return;
        const onResize = () => embla.reInit();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [embla]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (!embla) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            embla.scrollPrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            embla.scrollNext();
        }
    };

    const base = slidesPerView.base;
    const lg = slidesPerView.lg ?? base;
    const style: CSSProperties = {
        ['--slide-size-base' as string]: `${100 / base}%`,
        ['--slide-size-lg' as string]: `${100 / lg}%`,
    };

    return (
        <div
            className={cn('flex flex-col gap-6', className)}
            role="region"
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div ref={viewportRef} className="embla__viewport" style={style}>
                <div className="embla__container">
                    {items.map((item, i) => (
                        <div key={i} className="embla__slide">
                            {renderItem(item, i)}
                        </div>
                    ))}
                </div>
            </div>

            {(showArrows || showDots) && (
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        {showDots && <CarouselDots embla={embla}/>}
                    </div>
                    {showArrows && <CarouselArrows embla={embla}/>}
                </div>
            )}
        </div>
    );
}

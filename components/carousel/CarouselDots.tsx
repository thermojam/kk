'use client';

import type {EmblaCarouselType} from 'embla-carousel';
import {useCallback, useLayoutEffect, useState} from 'react';
import {cn} from '@/lib/cn';

type CarouselDotsProps = {
    embla: EmblaCarouselType | undefined;
    className?: string;
};

export function CarouselDots({embla, className}: CarouselDotsProps) {
    const [snaps, setSnaps] = useState<number[]>([]);
    const [selected, setSelected] = useState(0);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setSelected(api.selectedScrollSnap());
    }, []);

    useLayoutEffect(() => {
        if (!embla) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Embla is an external imperative library
        setSnaps(embla.scrollSnapList());
        onSelect(embla);
        embla.on('select', onSelect);
        embla.on('reInit', (api) => {
            setSnaps(api.scrollSnapList());
            onSelect(api);
        });
        return () => {
            embla.off('select', onSelect);
        };
    }, [embla, onSelect]);

    if (snaps.length <= 1) return null;

    return (
        <div
            className={cn('flex items-center justify-center gap-2', className)}
            role="tablist"
            aria-label="Слайды карусели"
        >
            {snaps.map((_, i) => {
                const isActive = i === selected;
                return (
                    <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Перейти к слайду ${i + 1}`}
                        onClick={() => embla?.scrollTo(i)}
                        className={cn(
                            // Кликабельная область 44px (touch-target), визуал — точка 8px
                            'inline-flex h-11 w-11 items-center justify-center',
                        )}
                    >
            <span
                className={cn(
                    'block size-2 rounded-pill transition-colors',
                    isActive ? 'bg-accent-500' : 'bg-primary-300',
                )}
            />
                    </button>
                );
            })}
        </div>
    );
}

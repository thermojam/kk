'use client';

import type { EmblaCarouselType } from 'embla-carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useLayoutEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type CarouselArrowsProps = {
    embla: EmblaCarouselType | undefined;
    className?: string;
};

export function CarouselArrows({ embla, className }: CarouselArrowsProps) {
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const update = useCallback((api: EmblaCarouselType) => {
        setCanPrev(api.canScrollPrev());
        setCanNext(api.canScrollNext());
    }, []);

    useLayoutEffect(() => {
        if (!embla) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Embla is an external imperative library
        update(embla);
        embla.on('select', update);
        embla.on('reInit', update);
        return () => {
            embla.off('select', update);
            embla.off('reInit', update);
        };
    }, [embla, update]);

    const btn =
        'inline-flex h-11 w-11 items-center justify-center rounded-full ' +
        'border border-neutral-100 bg-neutral-0 text-primary-500 ' +
        'hover:bg-primary-50 transition-colors ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ' +
        'disabled:opacity-40 disabled:cursor-not-allowed';

    return (
        <div className={cn('hidden md:flex items-center justify-center gap-3', className)}>
            <button
                type="button"
                aria-label="Предыдущий слайд"
                disabled={!canPrev}
                onClick={() => embla?.scrollPrev()}
                className={btn}
            >
                <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label="Следующий слайд"
                disabled={!canNext}
                onClick={() => embla?.scrollNext()}
                className={btn}
            >
                <ChevronRight className="size-5" aria-hidden="true" />
            </button>
        </div>
    );
}

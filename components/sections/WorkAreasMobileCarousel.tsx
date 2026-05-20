'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { WorkAreaCard } from '@/components/sections/WorkAreaCard';
import type { WorkArea } from '@/content/home';

type WorkAreasMobileCarouselProps = { items: WorkArea[] };

export function WorkAreasMobileCarousel({ items }: WorkAreasMobileCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item) => <WorkAreaCard item={item} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Сферы работы"
        />
    );
}

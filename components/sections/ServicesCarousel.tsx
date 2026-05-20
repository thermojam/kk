'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { ServiceCard } from '@/components/sections/ServiceCard';
import type { Service } from '@/content/home';

type ServicesCarouselProps = { items: Service[] };

export function ServicesCarousel({ items }: ServicesCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item) => <ServiceCard item={item} />}
            options={{ loop: true }}
            slidesPerView={{ base: 1, lg: 3 }}
            showArrows
            showDots
            ariaLabel="Услуги"
        />
    );
}

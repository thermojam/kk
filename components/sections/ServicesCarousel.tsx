'use client';

import { type ReactNode } from 'react';
import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { ServiceCard } from '@/components/sections/ServiceCard';
import type { Service } from '@/content/home';

type ServicesCarouselProps = { items: Service[]; heading?: ReactNode };

export function ServicesCarousel({ items, heading }: ServicesCarouselProps) {
    return (
        <EmblaCarousel
            heading={heading}
            items={items}
            renderItem={(item) => <ServiceCard item={item} />}
            getItemKey={(item) => item.id}
            options={{ loop: true }}
            slidesPerView={{ base: 1, lg: 3 }}
            showArrows
            showDots
            ariaLabel="Услуги"
        />
    );
}

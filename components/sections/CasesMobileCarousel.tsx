'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { CaseCard } from '@/components/sections/CaseCard';
import type { Case } from '@/content/home';

type CasesMobileCarouselProps = { items: Case[] };

export function CasesMobileCarousel({ items }: CasesMobileCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item, idx) => <CaseCard item={item} number={idx + 1} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Истории клиенток"
        />
    );
}

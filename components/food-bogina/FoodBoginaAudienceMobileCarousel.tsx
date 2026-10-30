'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { FoodBoginaReasonCard } from '@/components/food-bogina/FoodBoginaReasonCard';
import type { FoodBoginaReason } from '@/content/food-bogina';

type FoodBoginaAudienceMobileCarouselProps = { items: FoodBoginaReason[] };

export function FoodBoginaAudienceMobileCarousel({ items }: FoodBoginaAudienceMobileCarouselProps) {
    return (
        <EmblaCarousel
            items={items}
            renderItem={(item) => <FoodBoginaReasonCard item={item} />}
            options={{ loop: false }}
            slidesPerView={{ base: 1 }}
            showArrows={false}
            showDots
            ariaLabel="Причины выбрать курс"
        />
    );
}

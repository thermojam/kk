import { Clock, Leaf, Sparkles, WheatOff, Heart } from 'lucide-react';
import type { ComponentType } from 'react';
import type { FoodBoginaReason } from '@/content/food-bogina';

const ICONS: Record<FoodBoginaReason['icon'], ComponentType<{ className?: string }>> = {
    clock: Clock,
    leaf: Leaf,
    sparkles: Sparkles,
    'wheat-off': WheatOff,
    heart: Heart,
};

type FoodBoginaReasonCardProps = { item: FoodBoginaReason };

export function FoodBoginaReasonCard({ item }: FoodBoginaReasonCardProps) {
    const Icon = ICONS[item.icon];
    return (
        <article className="flex h-full flex-col gap-5 rounded-3xl border border-neutral-100 bg-neutral-0 p-6 shadow-[0_18px_50px_-28px_rgba(30,30,46,0.18)]">
            <div
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50/70"
            >
                <Icon className="size-8 text-primary-300" />
            </div>
            <p className="text-body text-neutral-700">{item.title}</p>
        </article>
    );
}

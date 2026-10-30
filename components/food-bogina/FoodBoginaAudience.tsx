import { foodBogina } from '@/content/food-bogina';
import { FoodBoginaReasonCard } from '@/components/food-bogina/FoodBoginaReasonCard';
import { FoodBoginaAudienceMobileCarousel } from '@/components/food-bogina/FoodBoginaAudienceMobileCarousel';

export function FoodBoginaAudience() {
    return (
        <section id="audience" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-8 text-neutral-900">Эта программа для тебя, если хочешь</h2>

            <div className="hidden min-[861px]:grid min-[861px]:grid-cols-3 min-[861px]:gap-6">
                {foodBogina.reasons.map((reason) => (
                    <FoodBoginaReasonCard key={reason.id} item={reason} />
                ))}
            </div>

            <div className="min-[861px]:hidden">
                <FoodBoginaAudienceMobileCarousel items={foodBogina.reasons} />
            </div>
        </section>
    );
}

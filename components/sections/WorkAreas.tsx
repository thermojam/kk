import type { WorkArea } from '@/content/home';
import { WorkAreaCard } from '@/components/sections/WorkAreaCard';
import { WorkAreasMobileCarousel } from '@/components/sections/WorkAreasMobileCarousel';

type WorkAreasProps = { items: WorkArea[] };

export function WorkAreas({ items }: WorkAreasProps) {
    return (
        <section id="work-areas" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">С чем я работаю</h2>

            <div className="hidden min-[861px]:grid min-[861px]:grid-cols-3 min-[861px]:gap-6">
                {items.map((item) => (
                    <WorkAreaCard key={item.id} item={item} />
                ))}
            </div>

            <div className="min-[861px]:hidden">
                <WorkAreasMobileCarousel items={items} />
            </div>
        </section>
    );
}

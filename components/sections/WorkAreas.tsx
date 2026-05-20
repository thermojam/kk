import type { WorkArea } from '@/content/home';
import { WorkAreaCard } from '@/components/sections/WorkAreaCard';
import { WorkAreasMobileCarousel } from '@/components/sections/WorkAreasMobileCarousel';

type WorkAreasProps = { items: WorkArea[] };

export function WorkAreas({ items }: WorkAreasProps) {
    return (
        <section id="work-areas" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">С чем я работаю</h2>

            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
                {items.map((item) => (
                    <WorkAreaCard key={item.id} item={item} />
                ))}
            </div>

            <div className="lg:hidden">
                <WorkAreasMobileCarousel items={items} />
            </div>
        </section>
    );
}

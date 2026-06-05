import type { Case } from '@/content/home';
import { CaseCard } from '@/components/sections/CaseCard';
import { CasesMobileCarousel } from '@/components/sections/CasesMobileCarousel';

type CasesProps = { items: Case[] };

export function Cases({ items }: CasesProps) {
    return (
        <section id="cases" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">Истории клиенток</h2>

            <div className="hidden min-[861px]:grid min-[861px]:grid-cols-3 min-[861px]:gap-6">
                {items.map((item, idx) => (
                    <CaseCard key={item.id} item={item} number={idx + 1} />
                ))}
            </div>

            <div className="min-[861px]:hidden">
                <CasesMobileCarousel items={items} />
            </div>
        </section>
    );
}

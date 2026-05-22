import type { FAQItem } from '@/content/home';
import { FAQAccordion } from '@/components/sections/FAQAccordion';

type FAQProps = { items: FAQItem[] };

export function FAQ({ items }: FAQProps) {
    return (
        <section id="faq" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">Частые вопросы</h2>
            <div className="max-w-4xl">
                <FAQAccordion items={items} />
            </div>
        </section>
    );
}

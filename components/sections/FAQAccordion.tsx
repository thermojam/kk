'use client';

import { Accordion } from '@/components/ui/Accordion';
import type { FAQItem } from '@/content/home';

type FAQAccordionProps = { items: FAQItem[] };

export function FAQAccordion({ items }: FAQAccordionProps) {
    const accordionItems = items.map((item) => ({
        id: item.id,
        q: item.question,
        a: item.answer,
    }));

    return <Accordion items={accordionItems} defaultOpenId={items[0]?.id} />;
}

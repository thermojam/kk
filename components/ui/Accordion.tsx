'use client';

import * as RA from '@radix-ui/react-accordion';
import {ChevronDown} from 'lucide-react';
import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type AccordionItemData = {
    id: string;
    q: string;
    a: ReactNode;
};

type AccordionProps = {
    items: AccordionItemData[];
    defaultOpenId?: string;
    className?: string;
};

export function Accordion({items, defaultOpenId, className}: AccordionProps) {
    return (
        <RA.Root
            type="single"
            collapsible
            defaultValue={defaultOpenId}
            className={cn('flex flex-col divide-y divide-neutral-100', className)}
        >
            {items.map((item) => (
                <RA.Item key={item.id} value={item.id} className="py-2">
                    <RA.Header>
                        <RA.Trigger
                            className={cn(
                                'group flex w-full items-center justify-between gap-4 py-4',
                                'text-left text-h3 text-neutral-900',
                                'outline-none focus-visible:ring-2 focus-visible:ring-primary-300 rounded-sm',
                            )}
                        >
                            <span>{item.q}</span>
                            <ChevronDown
                                aria-hidden="true"
                                className="size-5 shrink-0 text-primary-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            />
                        </RA.Trigger>
                    </RA.Header>
                    <RA.Content
                        className={cn(
                            'overflow-hidden',
                            'data-[state=open]:animate-[accordion-down_200ms_ease]',
                            'data-[state=closed]:animate-[accordion-up_200ms_ease]',
                        )}
                    >
                        <div className="pb-4 text-body text-neutral-700">{item.a}</div>
                    </RA.Content>
                </RA.Item>
            ))}
        </RA.Root>
    );
}

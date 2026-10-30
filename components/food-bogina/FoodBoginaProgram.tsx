'use client';

import * as RA from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { foodBogina, type FoodBoginaStep } from '@/content/food-bogina';

const CONTENT_ANIMATION_CLASS =
    'grid overflow-hidden contain-content data-[state=open]:animate-[accordion-down_200ms_ease] data-[state=closed]:animate-[accordion-up_200ms_ease]';

function StepList({ steps }: { steps: FoodBoginaStep[] }) {
    return (
        <ol className="min-h-0 pb-24">
            {steps.map((step) => (
                <li
                    key={step.n}
                    className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-3 sm:py-7"
                >
                    <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">
                        {String(step.n).padStart(2, '0')}
                    </span>
                    <p className="text-[16px] leading-[1.55] text-white/65">{step.body}</p>
                </li>
            ))}
        </ol>
    );
}

export function FoodBoginaProgram() {
    return (
        <section
            id="program"
            className="overflow-hidden rounded-[clamp(42px,7vw,72px)] bg-dark-gradient text-neutral-0"
        >
            <div className="container-page py-16 lg:py-24">
                <RA.Root type="single" collapsible defaultValue="theory">
                    <RA.Item value="theory">
                        <StepTrigger
                            eyebrow="Теоретическая часть"
                            title={foodBogina.theory.title}
                        />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <StepList steps={foodBogina.theory.steps} />
                        </RA.Content>
                    </RA.Item>

                    <RA.Item value="practice">
                        <StepTrigger
                            eyebrow="Практическая часть"
                            title={foodBogina.practice.title}
                        />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <StepList steps={foodBogina.practice.steps} />
                        </RA.Content>
                    </RA.Item>
                </RA.Root>
            </div>
        </section>
    );
}

function StepTrigger({ eyebrow, title }: { eyebrow: string; title: ReactNode }) {
    return (
        <RA.Header asChild>
            <div>
                <RA.Trigger className="group flex w-full items-center justify-between gap-6 rounded-sm border-b border-accent-500 pb-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-500 mb-8 lg:mb-10">
                    <div>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                            {eyebrow}
                        </p>
                        <h2 className="text-h2 text-neutral-0">{title}</h2>
                    </div>
                    <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent-500 transition-colors duration-200 group-data-[state=open]:bg-accent-500/15"
                    >
                        <ChevronDown className="size-4 text-accent-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </span>
                </RA.Trigger>
            </div>
        </RA.Header>
    );
}

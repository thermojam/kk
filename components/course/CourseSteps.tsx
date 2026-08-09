'use client';

import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { CourseStepIcon } from '@/components/icons/CourseStepIcons';
import { course, type CourseStep } from '@/content/course';

/**
 * Слайдер, как на главной: на мобилке три карточки подряд — это три экрана
 * скролла. На десктопе три слайда по трети ширины умещаются целиком, листать
 * нечего — точки прячутся сами, и секция выглядит обычной сеткой.
 */
export function CourseSteps() {
    return (
        <section id="steps" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-3 text-neutral-900">Три ступени</h2>
            <p className="text-body mb-8 max-w-2xl text-neutral-700">{course.stepsIntro}</p>

            <EmblaCarousel
                items={course.steps}
                renderItem={(step) => <StepCard step={step} />}
                getItemKey={(step) => step.id}
                slidesPerView={{ base: 1, lg: 3 }}
                ariaLabel="Ступени курса"
            />
        </section>
    );
}

function StepCard({ step }: { step: CourseStep }) {
    return (
        <article
            className="
                flex h-full flex-col rounded-3xl border border-white/60 bg-neutral-0/90
                p-6 shadow-[0_18px_50px_-28px_rgba(30,30,46,0.18)]
                transition duration-300
                lg:hover:-translate-y-1
            "
        >
            <div className="mb-5 flex items-start gap-5">
                <div
                    aria-hidden="true"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50/70"
                >
                    <CourseStepIcon name={step.icon} className="size-8 text-primary-300/70" />
                </div>
                <div className="flex flex-col gap-1 pt-1">
                    <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary-500">
                        {step.subtitle}
                    </span>
                    <h3 className="text-h3 text-neutral-900">{step.title}</h3>
                </div>
            </div>

            <ul className="flex flex-col gap-2 text-neutral-700">
                {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                        />
                        <span>{bullet}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}

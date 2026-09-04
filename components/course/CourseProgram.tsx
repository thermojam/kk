'use client';

import * as RA from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { course } from '@/content/course';

const CONTENT_ANIMATION_CLASS =
    'overflow-hidden data-[state=open]:animate-[accordion-down_200ms_ease] data-[state=closed]:animate-[accordion-up_200ms_ease]';

export function CourseProgram() {
    return (
        <section
            id="program"
            className="overflow-hidden rounded-[clamp(42px,7vw,72px)] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] text-neutral-0"
        >
            <div className="container-page py-16 lg:py-24">
                <RA.Root type="single" collapsible defaultValue="psycho">
                    <RA.Item value="psycho">
                        <StepTrigger eyebrow="Первая ступень" title="Психокоррекция" meta="Одна сессия в неделю" />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <ol className="pb-24">
                                {course.sessions.map((session) => (
                                    <li
                                        key={session.n}
                                        className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_280px_minmax(0,1fr)] sm:gap-3 sm:py-7"
                                    >
                                        <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">
                                            {String(session.n).padStart(2, '0')}
                                        </span>
                                        <h3 className="text-[17px] font-bold leading-tight text-neutral-0">
                                            {session.title}
                                        </h3>
                                        <p className="text-[16px] leading-[1.55] text-white/65">{session.body}</p>
                                    </li>
                                ))}
                            </ol>
                        </RA.Content>
                    </RA.Item>

                    <RA.Item value="nutrition">
                        <StepTrigger eyebrow="Вторая ступень" title="Питание и образ жизни" meta="Между сессиями" />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <div className="pb-24 lg:pb-28">
                                <div className="mb-8">
                                    {course.nutrition.topics.map((topic, index) => (
                                        <div
                                            key={topic.title}
                                            className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_280px_minmax(0,1fr)] sm:gap-3 sm:py-7"
                                        >
                                            <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className="text-[17px] font-bold leading-tight text-neutral-0">
                                                {topic.title}
                                            </h3>
                                            <p className="text-[16px] leading-[1.55] text-white/65">{topic.body}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="max-w-[560px] text-[13px] leading-[1.6] text-white/55">
                                    {course.nutrition.intro} Здесь нет рационов и подсчёта калорий — есть физиология и
                                    привычки.
                                </p>
                            </div>
                        </RA.Content>
                    </RA.Item>

                    <RA.Item value="body">
                        <StepTrigger eyebrow="Третья ступень" title={course.practice.title} meta="20 минут каждый день" />
                        <RA.Content className={CONTENT_ANIMATION_CLASS}>
                            <div>
                                <p className="mb-6 max-w-[560px] text-[16px] leading-[1.55] text-neutral-0">
                                    <b className="font-extrabold text-accent-500">4 комплекса</b> — по одному на
                                    каждую неделю программы.
                                </p>
                                <div className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_280px_minmax(0,1fr)] sm:gap-3 sm:py-7">
                                    <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">
                                        01
                                    </span>
                                    <p className="text-[17px] font-bold leading-tight text-neutral-0">
                                        {course.practice.subtitle}
                                    </p>
                                    <p className="text-[16px] leading-[1.55] text-white/65">{course.practice.body}</p>
                                </div>
                                <p className="mt-6 max-w-[560px] text-[13px] leading-[1.6] text-white/55">
                                    Это оздоровительная практика, не лечебная физкультура. При беременности,
                                    обострениях, тяжёлой гипертонии, онкологии и активной фазе эпилепсии нужна
                                    консультация врача.
                                </p>
                            </div>
                        </RA.Content>
                    </RA.Item>
                </RA.Root>
            </div>
        </section>
    );
}

function StepTrigger({ eyebrow, title, meta }: { eyebrow: string; title: ReactNode; meta: string }) {
    return (
        <RA.Header asChild>
            <div>
                <RA.Trigger className="group flex w-full items-end justify-between gap-6 rounded-sm border-b border-accent-500 pb-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-500 mb-8 lg:mb-10">
                    <div>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                            {eyebrow}
                        </p>
                        <h2 className="text-h2 text-neutral-0">{title}</h2>
                    </div>
                    <div className="flex items-center gap-4 pb-1">
                        <p className="hidden text-[13px] text-white/65 sm:block">{meta}</p>
                        <span
                            aria-hidden="true"
                            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent-500 transition-colors duration-200 group-data-[state=open]:bg-accent-500/15"
                        >
                            <ChevronDown className="size-4 text-accent-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </span>
                    </div>
                </RA.Trigger>
            </div>
        </RA.Header>
    );
}

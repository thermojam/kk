'use client';

import { Accordion } from '@/components/ui/Accordion';
import { course } from '@/content/course';

/**
 * Пять портретов подряд занимают несколько экранов — поэтому аккордеон.
 * Ни один пункт не раскрыт по умолчанию (в отличие от FAQ, где открыт первый):
 * смысл секции именно в том, чтобы она умещалась в один экран.
 */
export function CourseAudience() {
    const items = course.personas.map((persona) => ({
        id: persona.id,
        q: persona.title,
        a: (
            <ul className="flex flex-col gap-2">
                {persona.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                        />
                        <span>{bullet}</span>
                    </li>
                ))}
            </ul>
        ),
    }));

    return (
        <section id="audience" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-3 text-neutral-900">Для кого эта программа</h2>
            <p className="text-body mb-8 max-w-2xl text-neutral-700">
                Узнаёшь себя хотя бы в одном — значит, программа про тебя.
            </p>

            <div className="max-w-4xl">
                <Accordion items={items} />
            </div>

            <div className="mx-auto mt-10 max-w-2xl text-center">
                <p className="font-serif text-[28px] italic leading-tight text-primary-700 lg:text-[34px]">
                    {course.closingAccent}
                </p>
                <p className="text-body mt-4 text-neutral-700">{course.closing}</p>
            </div>
        </section>
    );
}

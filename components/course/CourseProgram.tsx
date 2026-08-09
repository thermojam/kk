import { Badge } from '@/components/ui/Badge';
import { CourseStepIcon } from '@/components/icons/CourseStepIcons';
import { course } from '@/content/course';

export function CourseProgram() {
    return (
        <section id="program" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-3 text-neutral-900">Как устроен курс</h2>
            <p className="text-body mb-8 max-w-2xl text-neutral-700">{course.lead}</p>

            <dl className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {course.facts.map((fact) => (
                    <div
                        key={fact.label}
                        className="flex flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-0 p-4"
                    >
                        <dt className="text-[12px] font-bold uppercase tracking-[0.16em] text-primary-500">
                            {fact.label}
                        </dt>
                        <dd className="text-body text-neutral-700">{fact.value}</dd>
                    </div>
                ))}
            </dl>

            <Badge tone="accent" className="mb-4">
                Первая ступень · сессии
            </Badge>

            <ol className="flex flex-col gap-4">
                {course.sessions.map((session) => (
                    <li
                        key={session.n}
                        className="
                            flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-0 p-6
                            shadow-[0_18px_50px_-32px_rgba(30,30,46,0.18)]
                            sm:flex-row sm:items-baseline sm:gap-6
                        "
                    >
                        <span
                            aria-hidden="true"
                            className="font-serif text-[32px] italic font-medium leading-none text-primary-500 lg:text-[36px]"
                        >
                            {session.n}
                        </span>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-h3 text-neutral-900">{session.title}</h3>
                            <p className="text-body text-neutral-700">{session.body}</p>
                        </div>
                    </li>
                ))}
            </ol>

            <article className="mt-6 flex flex-col gap-6 rounded-3xl bg-primary-50/70 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    <div
                        aria-hidden="true"
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-0/80"
                    >
                        <CourseStepIcon
                            name={course.nutrition.icon}
                            className="size-8 text-primary-300"
                        />
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        <Badge tone="accent">{course.nutrition.badge}</Badge>
                        <h3 className="text-h3 text-neutral-900">{course.nutrition.title}</h3>
                        <p className="text-body text-neutral-700">{course.nutrition.intro}</p>
                    </div>
                </div>

                <dl className="grid gap-4 sm:grid-cols-2">
                    {course.nutrition.topics.map((topic) => (
                        <div
                            key={topic.title}
                            className="flex flex-col gap-1 rounded-lg bg-neutral-0/80 p-4"
                        >
                            <dt className="font-medium text-neutral-900">{topic.title}</dt>
                            <dd className="text-body text-neutral-700">{topic.body}</dd>
                        </div>
                    ))}
                </dl>
            </article>

            <article className="mt-6 flex flex-col gap-4 rounded-3xl bg-primary-50/70 p-6 sm:flex-row sm:items-start sm:gap-6">
                <div
                    aria-hidden="true"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-0/80"
                >
                    <CourseStepIcon name={course.practice.icon} className="size-8 text-primary-300" />
                </div>
                <div className="flex flex-col items-start gap-2">
                    <Badge tone="accent">{course.practice.badge}</Badge>
                    <h3 className="text-h3 text-neutral-900">{course.practice.title}</h3>
                    <p className="text-[13px] text-neutral-500">{course.practice.subtitle}</p>
                    <p className="text-body text-neutral-700">{course.practice.body}</p>
                </div>
            </article>
        </section>
    );
}

import { course } from '@/content/course';

export function CourseProgram() {
    return (
        <section
            id="program"
            className="overflow-hidden rounded-[clamp(42px,7vw,72px)] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] text-neutral-0"
        >
            <div className="container-page py-16 lg:py-24">
                <div className="mb-8 flex items-end justify-between gap-6 border-b border-accent-500 pb-5 lg:mb-10">
                    <div>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                            Первая ступень
                        </p>
                        <h2 className="text-h2 text-neutral-0">Психокоррекция</h2>
                    </div>
                    <p className="hidden pb-1 text-[13px] text-white/65 sm:block">Одна сессия в неделю</p>
                </div>

                <ol className="mb-24">
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

                <div className="mb-8 flex items-end justify-between gap-6 border-b border-accent-500 pb-5 lg:mb-10">
                    <div>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                            Вторая ступень
                        </p>
                        <h2 className="text-h2 text-neutral-0">Питание и образ жизни</h2>
                    </div>
                    <p className="hidden pb-1 text-[13px] text-white/65 sm:block">Между сессиями</p>
                </div>

                <div className="mb-8">
                    {course.nutrition.topics.map((topic, index) => (
                        <div
                            key={topic.title}
                            className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_280px_minmax(0,1fr)] sm:gap-3 sm:py-7"
                        >
                            <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-[17px] font-bold leading-tight text-neutral-0">{topic.title}</h3>
                            <p className="text-[16px] leading-[1.55] text-white/65">{topic.body}</p>
                        </div>
                    ))}
                </div>
                <p className="mb-24 max-w-[560px] text-[13px] leading-[1.6] text-white/55 lg:mb-28">
                    {course.nutrition.intro} Здесь нет рационов и подсчёта калорий — есть физиология и привычки.
                </p>

                <div className="mb-8 flex items-end justify-between gap-6 border-b border-accent-500 pb-5">
                    <div>
                        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                            Третья ступень
                        </p>
                        <h2 className="text-h2 text-neutral-0">{course.practice.title}</h2>
                    </div>
                    <p className="hidden pb-1 text-[13px] text-white/65 sm:block">20 минут каждый день</p>
                </div>

                <div className="grid gap-2 border-b border-white/10 py-6 sm:grid-cols-[80px_280px_minmax(0,1fr)] sm:gap-3 sm:py-7">
                    <span className="font-serif text-[36px] italic leading-none text-accent-500 lg:text-[44px]">01</span>
                    <p className="text-[17px] font-bold leading-tight text-neutral-0">{course.practice.subtitle}</p>
                    <p className="text-[16px] leading-[1.55] text-white/65">{course.practice.body}</p>
                </div>
                <p className="mt-6 max-w-[560px] text-[13px] leading-[1.6] text-white/55">
                    Это оздоровительная практика, не лечебная физкультура. При беременности, обострениях, тяжёлой
                    гипертонии, онкологии и активной фазе эпилепсии нужна консультация врача.
                </p>
            </div>
        </section>
    );
}

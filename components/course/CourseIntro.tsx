import { course } from '@/content/course';

export function CourseIntro() {
    return (
        <section id="intro" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 mb-6 text-neutral-900">О чём этот курс</h2>

            <div className="flex max-w-2xl flex-col gap-4 text-body text-neutral-700">
                {course.intro.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                ))}

                <p className="font-serif text-[22px] italic leading-tight text-primary-700">
                    {course.intro.accent}
                </p>

                <p>{course.intro.closingLine}</p>
            </div>
        </section>
    );
}
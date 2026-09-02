import type { Metadata } from 'next';
import { CourseHero } from '@/components/course/CourseHero';
import { CourseIntro } from '@/components/course/CourseIntro';
import { CourseSteps } from '@/components/course/CourseSteps';
import { CourseAudience } from '@/components/course/CourseAudience';
import { CourseProgram } from '@/components/course/CourseProgram';
import { CoursePricing } from '@/components/course/CoursePricing';
import { FAQ } from '@/components/sections/FAQ';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';
import { course } from '@/content/course';

const DESCRIPTION =
    'Групповой курс о контакте с телом: три ступени — психокоррекция, питание и образ жизни, славянская гимнастика. Четыре недели, одна глубокая сессия в неделю.';

export const metadata: Metadata = {
    title: course.title,
    description: DESCRIPTION,
    alternates: { canonical: '/course/' },
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        url: 'https://ksenia-kamenskaya.ru/course/',
        siteName: 'Ксения Каменская',
        title: `${course.title} · Ксения Каменская`,
        description: DESCRIPTION,
        images: [{ url: '/images/og-cover.webp', width: 1200, height: 630, alt: course.title }],
    },
};

export default function CoursePage() {
    return (
        <>
            <CourseHero />
            <CourseIntro />
            <CourseSteps />
            <CourseProgram />
            <CourseAudience />
            <CoursePricing />
            <FAQ items={course.faq} />
            <ContactCtaBanner />
        </>
    );
}

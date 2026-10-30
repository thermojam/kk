import type { Metadata } from 'next';
import { FoodBoginaHero } from '@/components/food-bogina/FoodBoginaHero';
import { FoodBoginaAudience } from '@/components/food-bogina/FoodBoginaAudience';
import { FoodBoginaProgram } from '@/components/food-bogina/FoodBoginaProgram';
import { FoodBoginaIntro } from '@/components/food-bogina/FoodBoginaIntro';
import { FoodBoginaFormat } from '@/components/food-bogina/FoodBoginaFormat';
import { FoodBoginaAuthor } from '@/components/food-bogina/FoodBoginaAuthor';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';
import { foodBogina } from '@/content/food-bogina';

export const metadata: Metadata = {
    title: foodBogina.title,
    description: foodBogina.hero.lead,
    alternates: { canonical: '/food-bogina/' },
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        url: 'https://ksenia-kamenskaya.ru/food-bogina/',
        siteName: 'Ксения Каменская',
        title: `${foodBogina.title} · Ксения Каменская`,
        description: foodBogina.hero.lead,
        images: [{ url: '/images/og-cover.webp', width: 1200, height: 630, alt: foodBogina.title }],
    },
};

export default function FoodBoginaPage() {
    return (
        <>
            <FoodBoginaHero />
            <FoodBoginaAudience />
            <FoodBoginaProgram />
            <FoodBoginaIntro />
            <FoodBoginaFormat />
            <FoodBoginaAuthor />
            <ContactCtaBanner />
        </>
    );
}

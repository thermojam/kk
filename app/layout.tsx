import type { Metadata } from 'next';
import { Cormorant_Garamond, Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
    variable: '--font-nunito',
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '700', '800'],
    display: 'swap',
});

const cormorant = Cormorant_Garamond({
    variable: '--font-cormorant',
    subsets: ['latin', 'cyrillic'],
    weight: ['400'],
    style: ['italic'],
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://kamenskaya.ru'),
    title: {
        default: 'Ксения Каменская · Психолог · Женские практики',
        template: '%s · Ксения Каменская',
    },
    description:
        'Психолог, специалист по работе с телом и эмоциями. Консультации, длительное сопровождение «Путь к себе», славянская гимнастика «Сила Берегини».',
    keywords: ['психолог', 'женские практики', 'консультация психолога', 'Сила Берегини', 'СПб'],
    authors: [{ name: 'Ксения Каменская' }],
    icons: {
        icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    },
    openGraph: {
        type: 'website',
        locale: 'ru_RU',
        url: 'https://kamenskaya.ru',
        siteName: 'Ксения Каменская',
        title: 'Ксения Каменская · Психолог · Женские практики',
        description:
            'Психолог, специалист по работе с телом и эмоциями. Консультации, программа «Путь к себе», «Сила Берегини».',
        images: [
            {
                url: '/images/about.webp',
                width: 960,
                height: 1280,
                alt: 'Ксения Каменская — психолог',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Ксения Каменская · Психолог · Женские практики',
        description: 'Психология женского тела и проявленности.',
        images: ['/images/about.webp'],
    },
    robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ru" className={`${nunito.variable} ${cormorant.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col font-sans">{children}</body>
        </html>
    );
}

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
  title: 'Ксения Каменская · Психолог',
  description:
    'Психология женского тела и проявленности. Бесплатная консультация 20 минут.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${nunito.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

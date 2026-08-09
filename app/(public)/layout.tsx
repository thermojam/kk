import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/legal/CookieBanner';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <div className="h-[var(--cookie-banner-h,0px)]" aria-hidden="true" />
            <CookieBanner />
        </>
    );
}

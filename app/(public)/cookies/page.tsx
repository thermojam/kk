import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { cookiesPolicy } from '@/content/legal/cookies';

export const metadata: Metadata = {
    title: 'Политика куки',
    robots: { index: false, follow: false },
};

export default function CookiesPage() {
    return (
        <LegalPageShell
            title={cookiesPolicy.title}
            lastUpdated={cookiesPolicy.lastUpdated}
            intro={cookiesPolicy.intro}
            sections={cookiesPolicy.sections}
        />
    );
}

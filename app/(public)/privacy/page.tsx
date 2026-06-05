import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { privacyPolicy } from '@/content/legal/privacy';

export const metadata: Metadata = {
    title: 'Политика обработки персональных данных',
    robots: { index: false, follow: false },
};

export default function PrivacyPage() {
    return (
        <LegalPageShell
            title={privacyPolicy.title}
            lastUpdated={privacyPolicy.lastUpdated}
            intro={privacyPolicy.intro}
            sections={privacyPolicy.sections}
        />
    );
}

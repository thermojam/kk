import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { offer } from '@/content/legal/offer';

export const metadata: Metadata = {
    title: 'Публичная оферта',
    robots: { index: false, follow: false },
};

export default function OfferPage() {
    return (
        <LegalPageShell
            title={offer.title}
            lastUpdated={offer.lastUpdated}
            intro={offer.intro}
            sections={offer.sections}
        />
    );
}

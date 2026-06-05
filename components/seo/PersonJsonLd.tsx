import { BUSINESS } from '@/content/legal/business';

export function PersonJsonLd() {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ксения Каменская',
        jobTitle: 'Психолог, специалист по психосоматике и телесной терапии',
        url: BUSINESS.siteUrl,
        email: `mailto:${BUSINESS.email}`,
        sameAs: [
            'https://t.me/xenia_kamensky',
            'https://t.me/kmensky_case',
        ],
        worksFor: {
            '@type': 'Organization',
            name: BUSINESS.name,
            taxID: BUSINESS.inn,
        },
    };
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
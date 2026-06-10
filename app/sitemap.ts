import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://ksenia-kamenskaya.ru/',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
    ];
}

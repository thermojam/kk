import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/cookies/', '/privacy/', '/offer/'],
        },
        sitemap: 'https://ksenia-kamenskaya.ru/sitemap.xml',
        host: 'https://ksenia-kamenskaya.ru',
    };
}

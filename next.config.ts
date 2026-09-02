import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'export',
    images: { unoptimized: true },
    // Не трогать: sitemap с этими адресами уже в индексе, смена формы URL
    // положит выдачу.
    trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // output: 'export' убран намеренно. Приём платежей требует серверного
    // рантайма: пароль от шлюза уходит в теле каждого запроса к register.do
    // и не должен попадать в браузер, а при статическом экспорте route handlers
    // с POST невозможны в принципе. Маркетинговые страницы Next всё равно
    // отрендерит статически при сборке — скорость не меняется.
    images: { unoptimized: true },
    // Не трогать: sitemap с этими адресами уже в индексе, смена формы URL
    // положит выдачу.
    trailingSlash: true,
};

export default nextConfig;

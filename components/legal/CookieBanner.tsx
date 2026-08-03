'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { initMetrika } from '@/lib/analytics/metrika';
import { readConsent, writeConsent } from '@/lib/analytics/consent';

export function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const decision = readConsent();
        if (decision === 'accepted') {
            initMetrika();
            return;
        }
        if (decision === null) {
            const show = () => setVisible(true);
            const events: Array<keyof WindowEventMap> = [
                'scroll',
                'touchstart',
                'pointerdown',
                'keydown',
            ];
            events.forEach((e) =>
                window.addEventListener(e, show, { once: true, passive: true }),
            );
            return () => events.forEach((e) => window.removeEventListener(e, show));
        }
    }, []);

    // Баннер зафиксирован снизу и перекрывает нижние ссылки футера.
    // Резервируем под него место в потоке (--cookie-banner-h, см. PublicLayout),
    // чтобы страницу можно было докрутить и футер не оказался под баннером.
    useEffect(() => {
        const root = document.documentElement;
        if (!visible) {
            root.style.setProperty('--cookie-banner-h', '0px');
            return;
        }
        const el = bannerRef.current;
        if (!el) return;
        const update = () => root.style.setProperty('--cookie-banner-h', `${el.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.setProperty('--cookie-banner-h', '0px');
        };
    }, [visible]);

    if (!visible) return null;

    function handleAccept() {
        writeConsent('accepted');
        setVisible(false);
        initMetrika();
    }

    function handleDecline() {
        writeConsent('declined');
        setVisible(false);
    }

    return (
        <div
            ref={bannerRef}
            role="region"
            aria-label="Согласие на куки"
            className="
                fixed inset-x-0 bottom-0 z-40 border-t border-neutral-100 bg-neutral-0 p-4
                shadow-[0_-8px_24px_-18px_rgba(30,30,46,0.2)]
                lg:p-6 rounded-md
            "
        >
            <div className="container-page flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-[14px] text-neutral-700 lg:max-w-3xl">
                    Сайт использует куки и Яндекс.Метрику для обезличенной статистики посещений
                    (IP, страницы, время визита). Оператор данных — ООО «Яндекс». Срок хранения — 12
                    месяцев. Подробнее:{' '}
                    <Link href="/cookies/" className="underline hover:text-primary-500">
                        Политика куки
                    </Link>
                    {' · '}
                    <Link href="/privacy/" className="underline hover:text-primary-500">
                        Политика ПДн
                    </Link>
                    .
                </p>
                <div className="flex shrink-0 gap-3">
                    <Button variant="secondary" size="md" onClick={handleDecline}>
                        Отказаться
                    </Button>
                    <Button variant="accent" size="md" onClick={handleAccept}>
                        Принять
                    </Button>
                </div>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/cn';

const NAV = [
    { href: '/#about', id: 'about', label: 'Обо мне' },
    { href: '/#services', id: 'services', label: 'Услуги' },
    { href: '/#materials', id: 'materials', label: 'Материалы' },
    { href: '/#contact', id: 'contact', label: 'Контакт' },
];

const COMPACT_THRESHOLD_PX = 20;

export function Header() {
    const [compact, setCompact] = useState(false);

    // Hysteresis: переход вниз → компакт срабатывает после 20px накопления.
    const lastYRef = useRef(0);
    const accDownRef = useRef(0);
    const tickingRef = useRef(false);

    useEffect(() => {
        function onScroll() {
            if (tickingRef.current) return;
            tickingRef.current = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                const delta = y - lastYRef.current;
                lastYRef.current = y;

                if (y <= 0) {
                    accDownRef.current = 0;
                    setCompact(false);
                } else if (delta > 0) {
                    accDownRef.current += delta;
                    if (accDownRef.current >= COMPACT_THRESHOLD_PX) {
                        setCompact(true);
                    }
                } else if (delta < 0) {
                    accDownRef.current = 0;
                    setCompact(false);
                }
                tickingRef.current = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
                className={cn(
                    'sticky top-0 z-30 w-full bg-neutral-900 transition-[height,border-color] duration-150',
                    compact
                        ? 'h-14 border-b border-white/10'
                        : 'h-20 border-b border-transparent'
                )}
            >
                <div className="container-page flex h-full items-center justify-between">
                    <Link href="/" aria-label="На главную">
                        <Logo tone="duotone" />
                    </Link>

                    {/* Десктоп-нав */}
                    <nav
                        aria-label="Главная навигация"
                        className="hidden lg:flex items-center gap-8"
                    >
                        {NAV.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-body relative py-2 transition-colors duration-150 text-white/85 hover:text-accent-500"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Десктоп-CTA */}
                    <div className="hidden lg:block">
                        <Button href="/#contact" variant="accent" size="md">
                            Записаться
                        </Button>
                    </div>

                </div>
        </header>
    );
}

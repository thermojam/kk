'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { cn } from '@/lib/cn';

const NAV = [
    { href: '/#about', label: 'Обо мне' },
    { href: '/#services', label: 'Услуги' },
    { href: '/#materials', label: 'Материалы' },
    { href: '/#contact', label: 'Контакт' },
];

const COMPACT_THRESHOLD_PX = 20;

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
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
        <>
            <header
                className={cn(
                    'sticky top-0 z-30 w-full bg-neutral-0/95 backdrop-blur transition-[height,border-color] duration-150',
                    compact
                        ? 'h-14 border-b border-neutral-100'
                        : 'h-20 border-b border-transparent'
                )}
            >
                <div className="container-page flex h-full items-center justify-between">
                    <Link href="/" aria-label="На главную" className="text-primary-500">
                        <Logo variant="mark+text" />
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
                                className="text-body text-neutral-700 hover:text-primary-500"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Десктоп-CTA */}
                    <div className="hidden lg:block">
                        <Button href="/#contact" variant="primary" size="md">
                            Записаться
                        </Button>
                    </div>

                    {/* Мобайл-меню кнопка */}
                    <button
                        type="button"
                        aria-label="Открыть меню"
                        onClick={() => setMenuOpen(true)}
                        className={cn(
                            'inline-flex h-11 w-11 items-center justify-center rounded-md',
                            'text-neutral-900 hover:bg-neutral-100',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                            'lg:hidden'
                        )}
                    >
                        <Menu className="size-6" aria-hidden="true" />
                    </button>
                </div>
            </header>

            <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </>
    );
}

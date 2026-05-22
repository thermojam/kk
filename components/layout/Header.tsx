'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { cn } from '@/lib/cn';
import { useActiveSection } from '@/lib/hooks/useActiveSection';

const NAV = [
    { href: '/#about', id: 'about', label: 'Обо мне' },
    { href: '/#services', id: 'services', label: 'Услуги' },
    { href: '/#materials', id: 'materials', label: 'Материалы' },
    { href: '/#contact', id: 'contact', label: 'Контакт' },
];

const SECTION_IDS = NAV.map((item) => item.id);

const COMPACT_THRESHOLD_PX = 20;

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [compact, setCompact] = useState(false);
    const activeId = useActiveSection(SECTION_IDS);

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
                    'sticky top-0 z-30 w-full bg-neutral-900 transition-[height,border-color] duration-150',
                    compact
                        ? 'h-14 border-b border-white/10'
                        : 'h-20 border-b border-transparent'
                )}
            >
                <div className="container-page flex h-full items-center justify-between">
                    <Link href="/" aria-label="На главную">
                        <Logo variant="mark" tone="duotone" />
                    </Link>

                    {/* Десктоп-нав */}
                    <nav
                        aria-label="Главная навигация"
                        className="hidden lg:flex items-center gap-8"
                    >
                        {NAV.map((item) => {
                            const isActive = activeId === item.id;
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'text-body relative py-2 transition-colors duration-150',
                                        isActive
                                            ? 'font-bold text-accent-500'
                                            : 'text-white/85 hover:text-accent-500'
                                    )}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span
                                            aria-hidden
                                            className="absolute left-0 right-0 -bottom-0.5 h-[3px] rounded-sm bg-accent-500"
                                        />
                                    )}
                                </a>
                            );
                        })}
                    </nav>

                    {/* Десктоп-CTA */}
                    <div className="hidden lg:block">
                        <Button href="/#contact" variant="accent" size="md">
                            Записаться
                        </Button>
                    </div>

                    {/* Мобайл-меню кнопка */}
                    <button
                        type="button"
                        aria-label="Открыть меню"
                        onClick={() => setMenuOpen(true)}
                        className={cn(
                            'inline-flex h-11 w-11 items-center justify-center rounded-full',
                            'text-white hover:bg-white/10',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
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

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';
import { cn } from '@/lib/cn';

const COMPACT_THRESHOLD_PX = 20;

const HEADER_TG_TEXT =
    'Здравствуйте, Ксения! Хочу записаться на консультацию.';

export function Header() {
    const [compact, setCompact] = useState(false);
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
                    if (accDownRef.current >= COMPACT_THRESHOLD_PX) setCompact(true);
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
                <TelegramButton
                    goal={TG_GOALS.header}
                    text={HEADER_TG_TEXT}
                    variant="accent"
                    size="md"
                >
                    Написать в Telegram
                </TelegramButton>
            </div>
        </header>
    );
}
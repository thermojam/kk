'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HeroBackground } from '@/components/sections/HeroBackground';

export function Hero() {
    const reduced = useReducedMotion();

    const fadeUp = (delay: number) => ({
        initial: reduced ? false : { opacity: 0, y: 20 },
        animate: reduced ? undefined : { opacity: 1, y: 0 },
        transition: reduced
            ? undefined
            : { duration: 0.6, delay, ease: 'easeOut' as const },
    });

    return (
        <section
            id="hero"
            className="relative isolate overflow-hidden"
            style={{ background: 'var(--color-neutral-900)' }}
        >
            <HeroBackground />

            <div className="container-page relative z-10 grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-24 lg:min-h-[720px]">
                <div className="flex flex-col gap-6 lg:order-1 lg:max-w-[560px]">
                    <motion.span
                        {...fadeUp(0)}
                        className="font-sans font-bold uppercase tracking-[0.4em] text-[11px]"
                        style={{ color: 'var(--color-accent-500)' }}
                    >
                        Ksenia Kamenskaya
                    </motion.span>

                    <motion.h1
                        {...fadeUp(0.05)}
                        className="font-display"
                        style={{ color: '#ffffff', lineHeight: 0.98 }}
                    >
                        Психология женского тела{' '}
                        <span style={{ color: 'var(--color-accent-500)' }}>
                            и&nbsp;проявленности.
                        </span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp(0.15)}
                        className="text-body max-w-[460px]"
                        style={{ color: 'rgba(255,255,255,0.78)' }}
                    >
                        Помогаю женщинам перестать носить эмоции в&nbsp;теле, разобраться
                        с&nbsp;эмоциональным перееданием и&nbsp;вернуть себе ощущение
                        «я&nbsp;живу свою жизнь».
                    </motion.p>

                    <motion.div
                        {...fadeUp(0.25)}
                        className="flex flex-col items-start gap-3"
                    >
                        <Button href="#contact" variant="accent" size="lg">
                            Записаться на бесплатную консультацию · 20 минут
                        </Button>
                        <Button href="#services" variant="ghost" size="md" className="!text-white">
                            Узнать о программе →
                        </Button>
                    </motion.div>
                </div>

                <div className="lg:order-2 flex items-center justify-center lg:justify-self-end">
                    <motion.div
                        {...fadeUp(0.3)}
                        whileHover={reduced ? undefined : { scale: 1.02 }}
                        className="relative w-[min(70vw,320px)] aspect-[3/4] lg:w-[300px] lg:h-[380px] lg:aspect-auto"
                    >
                        {/* Offset-рамка (только на десктопе, под фото) */}
                        <span
                            aria-hidden
                            className="hidden lg:block absolute pointer-events-none"
                            style={{
                                top: '-14px',
                                right: '-14px',
                                left: '14px',
                                bottom: '14px',
                                border: '1px solid var(--color-accent-500)',
                                borderRadius: 'var(--radius-sm)',
                                zIndex: 0,
                            }}
                        />

                        {/* Фото + duotone-стек */}
                        <div
                            className="relative overflow-hidden w-full h-full"
                            style={{
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--color-neutral-100)',
                                zIndex: 1,
                            }}
                        >
                            <Image
                                src="/images/hero.webp"
                                alt="Ксения Каменская"
                                fill
                                sizes="(min-width: 1024px) 300px, 70vw"
                                priority
                                className="object-cover"
                                style={{ filter: 'grayscale(1) contrast(1.1)' }}
                            />
                            <span
                                aria-hidden
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'var(--color-primary-500)',
                                    mixBlendMode: 'multiply',
                                }}
                            />
                            <span
                                aria-hidden
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'var(--color-accent-500)',
                                    mixBlendMode: 'lighten',
                                    opacity: 0.85,
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

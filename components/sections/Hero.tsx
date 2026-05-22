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
            className="relative isolate overflow-hidden border-border rounded-b-[4rem] md:rounded-b-[6rem]"
            style={{ background: 'var(--color-neutral-900)' }}
        >
            <HeroBackground />

            <div className="container-page relative z-10 grid gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:pt-24 lg:pb-0 lg:min-h-180">
                <div className="flex flex-col gap-6 lg:order-1 lg:max-w-140">
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
                        className="text-body max-w-115"
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
                            Записаться на консультацию
                        </Button>
                        <Button href="#services" variant="ghost" size="md" className="text-white!">
                            Узнать о программе →
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    {...fadeUp(0.3)}
                    whileHover={reduced ? undefined : { scale: 1.01 }}
                    className="hidden lg:order-2 w-full lg:h-180 lg:self-end lg:flex lg:justify-end"
                >
                    <Image
                        src="/images/hero.webp"
                        alt="Ксения Каменская"
                        width={1086}
                        height={1448}
                        priority
                        sizes="(min-width: 1024px) 540px, 100vw"
                        className="block w-full h-auto object-bottom lg:w-auto lg:h-full"
                    />
                </motion.div>
            </div>
        </section>
    );
}

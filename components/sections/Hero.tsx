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
        transition: reduced ? undefined : { duration: 0.6, delay, ease: 'easeOut' as const },
    });

    return (
        <section
            id="hero"
            className="relative isolate overflow-hidden"
            style={{
                background:
                    'linear-gradient(135deg, var(--color-primary-50), var(--color-accent-50))',
            }}
        >
            <HeroBackground />

            <div className="container-page relative z-10 grid gap-10 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:py-24 lg:min-h-[720px]">
                <div className="flex flex-col gap-6 lg:order-1 lg:max-w-[560px]">
                    <motion.h1 {...fadeUp(0)} className="font-display text-neutral-900">
                        Психология женского тела и проявленности.
                    </motion.h1>
                    <motion.p {...fadeUp(0.1)} className="text-body text-neutral-700 max-w-[480px]">
                        Помогаю женщинам перестать носить эмоции в теле, разобраться с эмоциональным
                        перееданием и вернуть себе ощущение «я живу свою жизнь».
                    </motion.p>
                    <motion.div {...fadeUp(0.2)} className="flex flex-col items-start gap-3">
                        <Button href="#contact" variant="primary" size="lg">
                            Записаться на бесплатную консультацию · 20 минут
                        </Button>
                        <Button href="#services" variant="ghost" size="md">
                            Узнать о программе →
                        </Button>
                    </motion.div>
                </div>

                <div className="lg:order-2 flex items-center justify-center">
                    <motion.div
                        whileHover={reduced ? undefined : { scale: 1.02 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="relative size-[280px] sm:size-[320px] lg:size-[320px] overflow-hidden rounded-full bg-neutral-100"
                    >
                        <Image
                            src="/images/hero.webp"
                            alt="Ксения Каменская"
                            fill
                            sizes="(min-width: 1024px) 320px, 280px"
                            priority
                            className="object-cover"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

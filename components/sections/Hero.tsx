'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { Logo } from '@/components/ui/Logo';
import { TG_GOALS } from '@/lib/telegram';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { Button } from '@/components/ui/Button';

const HERO_TG_TEXT =
    'Здравствуйте, Ксения! Пишу с сайта — хочу записаться на бесплатную консультацию.';

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
            className="relative isolate min-h-[760px] overflow-hidden bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] lg:min-h-screen"
        >
            <HeroBackground />

            <div className="container-page relative z-20 pt-4 lg:pt-6">
                <Link href="/" aria-label="На главную" className="inline-flex">
                    <Logo size={58} tone="mono" className="text-white" />
                </Link>
            </div>

            <div className="container-page relative z-10 grid gap-10 pb-24 pt-14 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)] lg:items-center lg:pb-0 lg:pt-4">
                <div className="flex flex-col items-start gap-6 lg:max-w-[720px] lg:pb-8">
                    <motion.span
                        {...fadeUp(0)}
                        className="font-sans text-[11px] font-bold uppercase tracking-[0.38em] text-accent-500 lg:text-[12px]"
                    >
                        Ксения Каменская
                    </motion.span>

                    <motion.h1
                        {...fadeUp(0.05)}
                        className="max-w-[12ch] font-display text-white lg:max-w-none lg:text-[76px] xl:text-[88px]"
                        style={{ lineHeight: 1.03 }}
                    >
                        <span className="block">Психология</span>
                        <span className="block">женского</span>
                        <span className="block">
                            тела <span className="text-accent-500">и</span>
                        </span>
                        <span className="block text-accent-500">проявленности.</span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp(0.15)}
                        className="text-body max-w-[560px] text-white/[0.78] lg:text-[17px] lg:leading-[1.55]"
                    >
                        Помогаю женщинам перестать носить эмоции в&nbsp;теле, разобраться
                        с&nbsp;эмоциональным перееданием и&nbsp;вернуть себе ощущение «я&nbsp;живу
                        свою жизнь».
                    </motion.p>

                    <motion.div
                        {...fadeUp(0.25)}
                        className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                    >
                        <TelegramButton
                            goal={TG_GOALS.hero}
                            text={HERO_TG_TEXT}
                            variant="accent"
                            size="lg"
                            className="w-full px-8 sm:w-auto"
                        >
                            Написать в Telegram
                        </TelegramButton>
                        <Button
                            href="#services"
                            variant="secondary"
                            size="lg"
                            className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                        >
                            Смотреть услуги
                        </Button>
                    </motion.div>

                    <motion.p
                        {...fadeUp(0.3)}
                        className="-mt-2 font-sans text-[13px] text-white/50"
                    >
                        Первый шаг — бесплатная консультация 20 минут
                    </motion.p>
                </div>

                <motion.div
                    {...fadeUp(0.2)}
                    whileHover={reduced ? undefined : { scale: 1.035 }}
                    transition={
                        reduced
                            ? undefined
                            : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="hidden h-full min-h-[650px] self-end lg:flex lg:items-end lg:justify-end"
                >
                    <Image
                        src="/images/hero.webp"
                        alt="Ксения Каменская"
                        width={1086}
                        height={1448}
                        priority
                        sizes="(min-width: 1280px) 760px, 58vw"
                        className="block h-auto max-h-[calc(100vh+100px)] w-[125%] max-w-none shrink-0 object-contain object-bottom xl:w-[138%]"
                    />
                </motion.div>
            </div>
        </section>
    );
}

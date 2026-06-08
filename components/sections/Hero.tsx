import Link from 'next/link';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { Logo } from '@/components/ui/Logo';
import { TG_GOALS } from '@/lib/telegram';
import { HeroBackground } from '@/components/sections/HeroBackground';
import { Button } from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

const HERO_TG_TEXT =
    'Здравствуйте, Ксения! Пишу с сайта — хочу записаться на бесплатную консультацию.';

export function Hero() {
    return (
        <section
            id="hero"
            className="relative isolate min-h-[760px] overflow-hidden rounded-b-[42px] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] lg:min-h-screen lg:rounded-b-[72px]"
        >
            <HeroBackground />

            <div className="container-page relative z-20 pt-4 lg:pt-6">
                <Link href="/" aria-label="На главную" className="inline-flex">
                    <Logo size={58} tone="mono" className="text-white" />
                </Link>
            </div>

            <div className="container-page relative z-10 grid gap-10 pb-24 pt-14 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[minmax(0,1.12fr)_minmax(420px,0.88fr)] lg:items-center lg:pb-0 lg:pt-4">
                <div className="flex flex-col items-start gap-6 lg:max-w-[720px] lg:pb-8">
                    <span className="hero-reveal font-sans text-[11px] font-bold uppercase tracking-[0.38em] text-accent-500 lg:text-[12px]">
                        Ксения Каменская
                    </span>

                    <h1
                        className="hero-reveal max-w-[12ch] font-display text-white lg:max-w-none lg:text-[76px] xl:text-[88px]"
                        style={{ lineHeight: 1.03, animationDelay: '0.05s' }}
                    >
                        <span className="block">Психология</span>
                        <span className="block">женского</span>
                        <span className="block">
                            тела <span className="text-accent-500">и</span>
                        </span>
                        <span className="block text-accent-500">проявленности</span>
                    </h1>

                    <p
                        className="hero-reveal text-body max-w-[560px] text-white/[0.78] lg:text-[17px] lg:leading-[1.55]"
                        style={{ animationDelay: '0.15s' }}
                    >
                        Помогаю женщинам перестать носить эмоции в&nbsp;теле, разобраться
                        с&nbsp;эмоциональным перееданием и&nbsp;вернуть себе ощущение «я&nbsp;живу
                        свою жизнь».
                    </p>

                    <div
                        className="hero-reveal flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                        style={{ animationDelay: '0.25s' }}
                    >
                        <TelegramButton
                            goal={TG_GOALS.hero}
                            text={HERO_TG_TEXT}
                            variant="accent"
                            size="lg"
                            className="w-full px-8 sm:w-auto"
                        >
                            Написать в Телеграм
                        </TelegramButton>
                        <Button
                            href="#services"
                            variant="secondary"
                            size="lg"
                            className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                        >
                            Смотреть услуги
                        </Button>
                    </div>

                    <p
                        className="hero-reveal -mt-2 font-sans text-[13px] text-white/50"
                        style={{ animationDelay: '0.3s' }}
                    >
                        Первый шаг — бесплатная консультация 20 минут
                    </p>
                </div>

                <div
                    className="hero-reveal hidden h-full min-h-[650px] self-end transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.035] lg:flex lg:items-end lg:justify-end"
                    style={{ animationDelay: '0.2s' }}
                >
                    <ResponsiveImage
                        name="hero"
                        alt="Ксения Каменская"
                        widths={[960, 1440, 1920]}
                        fallbackWidth={1440}
                        width={1086}
                        height={1448}
                        priority
                        sizes="(min-width: 1280px) 950px, 58vw"
                        className="block h-auto max-h-[calc(100vh+100px)] w-[125%] max-w-none shrink-0 object-contain object-bottom xl:w-[138%]"
                    />
                </div>
            </div>
        </section>
    );
}

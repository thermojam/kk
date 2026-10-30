import { TelegramButton } from '@/components/ui/TelegramButton';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DarkHeroBackground } from '@/components/ui/DarkHeroBackground';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { foodBogina } from '@/content/food-bogina';

/**
 * Тёмный первый экран, но с раскладкой наоборот относительно CourseHero:
 * портрет слева и прижат к нижнему краю секции (приём Hero.tsx с главной —
 * self-end/items-end на колонке, object-bottom на картинке), текст справа.
 */
export function FoodBoginaHero() {
    return (
        <section className="relative isolate -mt-[72px] overflow-hidden rounded-b-[clamp(42px,7vw,72px)] bg-dark-gradient pt-[72px]">
            <DarkHeroBackground />
            <div className="container-page relative z-10 grid items-center gap-10 pt-14 lg:grid-cols-[minmax(320px,0.62fr)_minmax(0,1fr)] lg:gap-8 lg:pt-16">
                {/* Портрет только с десктопа — на мобильном он украл бы весь экран у оффера. */}
                <div className="hidden h-full min-h-[520px] self-end lg:flex lg:items-end lg:justify-start">
                    <ResponsiveImage
                        name="food-bogina"
                        alt="Ксения Каменская"
                        widths={[360, 500]}
                        fallbackWidth={500}
                        width={2131}
                        height={3682}
                        sizes="420px"
                        className="h-auto max-h-[calc(100vh-72px)] w-full max-w-[420px] object-contain object-bottom"
                    />
                </div>

                <div className="flex flex-col items-start gap-8 pb-20 lg:gap-9 lg:pb-28">
                    <Badge tone="accent">✨ Новая программа</Badge>

                    <div className="flex flex-col items-start gap-5">
                        <h1 className="font-display text-white">{foodBogina.title}</h1>
                        <p className="max-w-[460px] font-sans text-[15px] text-white/80">
                            {foodBogina.hero.subtitle}
                        </p>
                        <p className="my-6 max-w-[560px] font-serif text-[24px] italic leading-[1.15] text-white/90 lg:my-8 lg:text-[30px]">
                            <span className="block">{foodBogina.hero.lead}</span>
                            <span className="mt-1 block text-accent-500">
                                {foodBogina.hero.leadAccent}
                            </span>
                        </p>
                    </div>

                    <ul className="flex max-w-[560px] flex-wrap items-center gap-x-3 gap-y-1 font-serif text-[20px] font-medium italic leading-none text-accent-500 lg:text-[24px]">
                        {foodBogina.hero.facts.map((fact, i) => (
                            <li key={fact} className="flex items-center gap-3">
                                {i > 0 && (
                                    <span
                                        aria-hidden="true"
                                        className="h-1 w-1 rounded-full bg-white/40"
                                    />
                                )}
                                {fact}
                            </li>
                        ))}
                    </ul>

                    <div className="flex w-full flex-col items-start gap-4 sm:w-auto">
                        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <TelegramButton
                                goal={foodBogina.cta.tgGoalHero}
                                text={foodBogina.cta.tgText}
                                variant="accent"
                                size="lg"
                                className="w-full px-8 sm:w-auto"
                            >
                                {foodBogina.cta.label}
                            </TelegramButton>
                            <Button
                                href="#format"
                                variant="secondary"
                                size="lg"
                                className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                            >
                                Узнать формат
                            </Button>
                        </div>
                        <p className="font-sans text-[13px] text-white/70">
                            {foodBogina.hero.note}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

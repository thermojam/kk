import { TelegramButton } from '@/components/ui/TelegramButton';
import { CourseHeroBackground } from '@/components/course/CourseHeroBackground';
import { Button } from '@/components/ui/Button';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { course } from '@/content/course';
import { TG_GOALS } from '@/lib/telegram';

/**
 * Тёмный первый экран в стиле Hero главной: слева обещание и решение,
 * справа портрет ведущей — с десктопа, как на главной.
 * Отрицательный отступ сверху — под хедер, как на главной.
 */
export function CourseHero() {
    return (
        <section className="relative isolate -mt-[72px] overflow-hidden rounded-b-[clamp(42px,7vw,72px)] bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)] pt-[72px]">
            <CourseHeroBackground />
            {/* Портрет-фон только на мобилке/планшете: с десктопа фигура уже отдельной
                колонкой справа (см. ниже), здесь дублировать её не нужно. */}
            <div aria-hidden="true" className="absolute inset-0 lg:hidden">
                <ResponsiveImage
                    name="course"
                    alt=""
                    widths={[360, 500]}
                    fallbackWidth={500}
                    width={932}
                    height={1117}
                    sizes="100vw"
                    className="absolute inset-x-0 bottom-0 h-[92%] w-full object-contain object-bottom"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,11,61,0)_0%,rgba(30,10,55,0.55)_40%,rgba(24,8,44,0.94)_72%,rgba(20,6,38,0.99)_100%)]" />
            </div>
            <div className="container-page relative z-10 grid items-center gap-10 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)] lg:gap-8 lg:pt-16">
                {/* Нижний воздух на мобильном держит эта колонка: соседняя там скрыта целиком. */}
                <div className="hero-reveal flex flex-col items-start gap-8 pb-20 lg:gap-9 lg:pb-28">
                    <div className="flex flex-col items-start gap-5">
                        <h1 className="font-display text-white">
                            <span className="block">Три ступени</span>
                            <span className="block text-accent-500">к телу 2.0</span>
                        </h1>

                        <p className="my-6 max-w-[560px] font-serif text-[24px] italic leading-[1.15] text-white/90 lg:my-8 lg:text-[30px]">
                            <span className="block">
                                {course.hero.lead}
                            </span>
                            <span className="mt-1 block text-accent-500">
                                {course.hero.leadAccent}
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-4">
                        {/* Разделитель ведущий, а не замыкающий: при переносе на узком
                            экране точка уходит на новую строку вместе со своим фактом,
                            а не повисает в конце предыдущей. */}
                        <ul className="flex max-w-[560px] flex-wrap items-center gap-x-3 gap-y-1 font-serif text-[20px] font-medium italic leading-none text-accent-500 lg:text-[24px]">
                            {course.hero.facts.map((fact, i) => (
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
                    </div>

                    <div className="flex w-full flex-col items-start gap-4 sm:w-auto">
                        <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:flex-row sm:items-center">
                            <TelegramButton
                                goal={TG_GOALS.courseHero}
                                text="Здравствуйте! Хочу записаться на программу «Три ступени к телу». Как оплатить?"
                                variant="accent"
                                size="lg"
                                className="w-full px-8 sm:w-auto"
                            >
                                Записаться
                            </TelegramButton>
                            <Button
                                href="#program"
                                variant="secondary"
                                size="lg"
                                className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                            >
                                Что в программе
                            </Button>
                        </div>

                        <p className="font-sans text-[13px] text-white/70">{course.hero.note}</p>
                    </div>
                </div>

                {/* Портрет только с десктопа: на мобильном он украл бы весь первый
                    экран у оффера. Размеры — от обрезанного исходника
                    (см. trim в scripts/optimize-images.mjs).
                    hidden нужен на обоих элементах: на обёртке — чтобы колонка не
                    занимала строку сетки и не тянула gap, на самой картинке — чтобы
                    lazy-загрузка её не запросила (скрыт только предок — Chrome качает). */}
                <div
                    className="hero-reveal hidden transition-transform duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.035] lg:flex lg:justify-end"
                    style={{ animationDelay: '0.12s' }}
                >
                    <ResponsiveImage
                        name="course"
                        alt={course.author.name}
                        widths={[360, 500]}
                        fallbackWidth={500}
                        width={932}
                        height={1117}
                        sizes="500px"
                        className="hidden h-auto w-full max-w-[500px] object-contain object-bottom lg:block"
                    />
                </div>
            </div>
        </section>
    );
}

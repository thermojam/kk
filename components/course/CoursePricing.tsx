import { TelegramButton } from '@/components/ui/TelegramButton';
import { course } from '@/content/course';
import { TG_GOALS } from '@/lib/telegram';

export function CoursePricing() {
    return (
        <section id="pricing" className="container-page py-16 lg:py-24">
            <div className="mx-auto grid max-w-[1030px] gap-10 rounded-[28px] bg-dark-gradient p-8 text-neutral-0 sm:p-12 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-center lg:gap-16 lg:p-16">
                <div>
                    <h2 className="mb-6 text-h2 text-neutral-0">Что входит в программу</h2>
                    <ul className="flex flex-col">
                        {course.pricingIncludes.map((item) => (
                            <li
                                key={item}
                                className="flex gap-3 border-b border-white/15 py-3 text-[16px] leading-[1.45] text-white/75 first:pt-0 last:pb-0"
                            >
                                <span
                                    aria-hidden="true"
                                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-5 rounded-[20px] bg-white/10 p-7 text-center">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="font-serif text-[40px] italic font-medium leading-none text-accent-300">
                                {course.price.early}
                            </span>
                            <span className="text-[13px] text-white/60">
                                при оплате до {course.price.earlyDeadline}
                            </span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="font-serif text-[22px] italic font-medium leading-none text-white/50">
                                {course.price.regular}
                            </span>
                            <span className="text-[13px] text-white/60">после</span>
                        </div>
                        <p className="font-serif text-[22px] italic font-medium leading-none text-neutral-0">
                            Старт {course.startsAt}
                        </p>
                    </div>
                    <TelegramButton
                        goal={TG_GOALS.coursePricing}
                        text="Здравствуйте! Хочу записаться на программу «Три ступени к телу». Как оплатить?"
                        variant="primary"
                        size="lg"
                        className="w-full !bg-neutral-0 !text-primary-700 hover:!bg-neutral-50"
                    >
                        Записаться
                    </TelegramButton>
                    <p className="text-[13px] leading-[1.5] text-white/60">
                        {course.hero.note}
                    </p>
                </div>
            </div>
        </section>
    );
}

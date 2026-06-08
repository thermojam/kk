import { Check } from 'lucide-react';
import type { Qualification } from '@/content/home';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

type AboutProps = { qualifications: Qualification[] };

export function About({ qualifications }: AboutProps) {
    return (
        <section id="about" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16 lg:items-center">
                <div className="order-1 lg:order-1">
                    <ResponsiveImage
                        name="about"
                        alt="Ксения Каменская"
                        widths={[320, 480, 760]}
                        fallbackWidth={480}
                        width={1086}
                        height={1448}
                        sizes="(min-width: 1024px) 380px, 320px"
                        className="w-full rounded-lg object-cover aspect-[3/4] max-w-[320px] mx-auto lg:max-w-none lg:mx-0"
                    />
                </div>
                <div className="order-2 lg:order-2 flex flex-col gap-8">
                    <h2 className="text-h2 text-neutral-900">Обо мне</h2>
                    <div className="flex flex-col gap-4 text-body text-neutral-700">
                        <p>
                            Лишний вес. ПМС, который выбивал из жизни. Эмоциональное переедание и
                            срывы. Я знаю этот путь изнутри — не из учебника.
                        </p>
                        <p>
                            Через психосоматику, нутрициологию и славянские практики я вернула себе
                            энергию, гармонию и тело, в котором мне хорошо.
                        </p>
                        <p>
                            Прошла путь от страха камеры и публичных выступлений — к норме «быть
                            видимой и яркой». Занялась тем, что действительно мне по душе. Теперь
                            помогаю другим женщинам пройти этот путь. В работе соединяю
                            восстановление контакта с телом и свободу быть проявленной.
                        </p>
                    </div>
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-primary-500">
                            Квалификации
                        </p>
                        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-10">
                            {qualifications.map((q) => (
                                <li key={q.title} className="flex gap-3">
                                    <Check
                                        aria-hidden="true"
                                        className="mt-0.5 size-5 shrink-0 text-accent-500"
                                        strokeWidth={2.5}
                                    />
                                    <div>
                                        <p className="text-neutral-900">{q.title}</p>
                                        {q.institution && (
                                            <p className="mt-0.5 text-[13px] text-neutral-500">
                                                {q.institution}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

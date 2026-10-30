import { Check } from 'lucide-react';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { foodBogina } from '@/content/food-bogina';

export function FoodBoginaAuthor() {
    return (
        <section id="author" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-16 lg:items-center">
                <div>
                    <ResponsiveImage
                        name="food-bogina-author"
                        alt="Ксения Каменская"
                        widths={[320, 480, 760]}
                        fallbackWidth={480}
                        width={1242}
                        height={828}
                        sizes="(min-width: 1024px) 380px, 320px"
                        className="w-full rounded-lg object-cover aspect-[3/4] max-w-[320px] mx-auto lg:max-w-none lg:mx-0"
                    />
                </div>

                <div className="flex flex-col gap-8">
                    <h2 className="text-h2 text-neutral-900">Автор и ведущая программы</h2>
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-primary-500">
                            Квалификации
                        </p>
                        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-10">
                            {foodBogina.author.qualifications.map((q) => (
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

            <div className="mx-auto mt-16 max-w-2xl text-center">
                <p className="font-serif text-[28px] italic leading-tight text-primary-700 lg:text-[34px]">
                    {foodBogina.closingAccent}
                </p>
                <p className="text-body mt-4 text-neutral-700">{foodBogina.closing}</p>
            </div>
        </section>
    );
}

'use client';

import { Card } from '@/components/ui/Card';
import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { About } from '@/components/sections/About';
import { Cases } from '@/components/sections/Cases';
import { FAQ } from '@/components/sections/FAQ';
import { Services } from '@/components/sections/Services';
import { WorkAreas } from '@/components/sections/WorkAreas';
import { cases, faq, qualifications, services, workAreas } from '@/content/home';

const placeholderSlides = (n: number, prefix: string) =>
    Array.from({ length: n }, (_, i) => ({ id: `${prefix}-${i + 1}`, label: `Слайд ${i + 1}` }));

const materialsDemo = placeholderSlides(4, 'mat');

function Placeholder({ label }: { label: string }) {
    return (
        <Card className="flex h-40 items-center justify-center text-h3 text-primary-500">
            {label}
        </Card>
    );
}

function SectionHeading({ children }: { children: string }) {
    return (
        <h2 className="text-h2 text-neutral-900 mb-6">
            {children} <span className="text-neutral-500">(плейсхолдер)</span>
        </h2>
    );
}

export default function HomePage() {
    return (
        <>
            <section id="hero" className="container-page py-16 lg:py-24">
                <SectionHeading>Hero</SectionHeading>
                <p className="text-body text-neutral-700">Здесь будет первый экран — Sprint 2.</p>
            </section>

            <About qualifications={qualifications} />

            <WorkAreas items={workAreas} />

            <Cases items={cases} />

            <Services items={services} />

            <FAQ items={faq} />

            <section id="contact" className="container-page py-16 lg:py-24">
                <SectionHeading>Записаться</SectionHeading>
                <p className="text-body text-neutral-700">Здесь будет форма — Sprint 3.</p>
            </section>

            {/* Демо-карусель #3 (materials поведение) — рендерим в отдельной секции */}
            <section id="materials" className="container-page py-16 lg:py-24">
                <SectionHeading>Материалы</SectionHeading>

                <div className="lg:hidden">
                    <EmblaCarousel
                        items={materialsDemo}
                        renderItem={(item) => <Placeholder label={item.label} />}
                        options={{ loop: false }}
                        slidesPerView={{ base: 1 }}
                        showArrows={false}
                        showDots
                        ariaLabel="Демо-карусель: материалы"
                    />
                </div>
                <div className="hidden lg:grid grid-cols-3 gap-4">
                    {materialsDemo.map((item) => (
                        <Placeholder key={item.id} label={item.label} />
                    ))}
                </div>
            </section>
        </>
    );
}

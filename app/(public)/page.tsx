'use client';

import { Card } from '@/components/ui/Card';
import { EmblaCarousel } from '@/components/carousel/EmblaCarousel';
import { About } from '@/components/sections/About';
import { FAQ } from '@/components/sections/FAQ';
import { WorkAreas } from '@/components/sections/WorkAreas';
import { faq, qualifications, workAreas } from '@/content/home';

const placeholderSlides = (n: number, prefix: string) =>
    Array.from({ length: n }, (_, i) => ({ id: `${prefix}-${i + 1}`, label: `Слайд ${i + 1}` }));

const casesDemo = placeholderSlides(3, 'case');
const servicesDemo = placeholderSlides(5, 'svc');
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

            {/* Демо повторяет #1, но с кейсами — структурно то же */}
            <section id="cases" className="container-page py-16 lg:py-24">
                <SectionHeading>Истории клиенток</SectionHeading>

                <div className="lg:hidden">
                    <EmblaCarousel
                        items={casesDemo}
                        renderItem={(item) => <Placeholder label={item.label} />}
                        options={{ loop: false }}
                        slidesPerView={{ base: 1 }}
                        showArrows={false}
                        showDots
                        ariaLabel="Демо-карусель: кейсы"
                    />
                </div>
                <div className="hidden lg:grid grid-cols-3 gap-4">
                    {casesDemo.map((item) => (
                        <Placeholder key={item.id} label={item.label} />
                    ))}
                </div>
            </section>

            {/* Демо-карусель #2: секция 5 — Embla везде, lg=3 / base=1, loop: true */}
            <section id="services" className="container-page py-16 lg:py-24">
                <SectionHeading>Услуги</SectionHeading>
                <EmblaCarousel
                    items={servicesDemo}
                    renderItem={(item) => <Placeholder label={item.label} />}
                    options={{ loop: true }}
                    slidesPerView={{ base: 1, lg: 3 }}
                    showArrows
                    showDots
                    ariaLabel="Демо-карусель: услуги"
                />
            </section>

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

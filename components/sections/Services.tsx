import type { Service } from '@/content/home';
import { ServicesCarousel } from '@/components/sections/ServicesCarousel';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';

type ServicesProps = { items: Service[] };

export function Services({ items }: ServicesProps) {
    return (
        <section id="services" className="container-page py-16 lg:py-24">
            <ServicesCarousel
                items={items}
                heading={
                    <h2 key="services-heading" className="text-h2 text-neutral-900">
                        Услуги
                    </h2>
                }
            />
            <ContactCtaBanner />
        </section>
    );
}

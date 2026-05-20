import type { Service } from '@/content/home';
import { ServicesCarousel } from '@/components/sections/ServicesCarousel';
import { ContactCtaBanner } from '@/components/sections/ContactCtaBanner';

type ServicesProps = { items: Service[] };

export function Services({ items }: ServicesProps) {
    return (
        <section id="services" className="container-page py-16 lg:py-24">
            <h2 className="text-h2 text-neutral-900 mb-8">Услуги</h2>
            <ServicesCarousel items={items} />
            <ContactCtaBanner />
        </section>
    );
}

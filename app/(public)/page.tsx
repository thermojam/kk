import { About } from '@/components/sections/About';
import { Cases } from '@/components/sections/Cases';
import { FAQ } from '@/components/sections/FAQ';
import { Hero } from '@/components/sections/Hero';
import { PersonJsonLd } from '@/components/seo/PersonJsonLd';
import { Services } from '@/components/sections/Services';
import { WorkAreas } from '@/components/sections/WorkAreas';
import { Offer } from '@/components/sections/Offer';
import { cases, faq, qualifications, services, workAreas } from '@/content/home';

export default function HomePage() {
    return (
        <>
            <PersonJsonLd />
            <Hero />
            <About qualifications={qualifications} />
            <WorkAreas items={workAreas} />
            <Cases items={cases} />
            <Services items={services} />
            <FAQ items={faq} />
            <Offer />
        </>
    );
}

import { About } from '@/components/sections/About';
import { Cases } from '@/components/sections/Cases';
import { FAQ } from '@/components/sections/FAQ';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { WorkAreas } from '@/components/sections/WorkAreas';
import { cases, faq, qualifications, services, workAreas } from '@/content/home';

export default function HomePage() {
    return (
        <>
            <Hero />
            <About qualifications={qualifications} />
            <WorkAreas items={workAreas} />
            <Cases items={cases} />
            <Services items={services} />
            <FAQ items={faq} />
        </>
    );
}

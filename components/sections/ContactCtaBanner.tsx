import { Button } from '@/components/ui/Button';

export function ContactCtaBanner() {
    return (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-lg bg-primary-50 px-6 py-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <p className="text-body text-neutral-700 max-w-md">
                Не знаешь, с чего начать? Начни с бесплатного звонка.
            </p>
            <Button href="#contact" variant="primary" size="md">
                Бесплатная консультация · 20 минут
            </Button>
        </div>
    );
}

import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const BANNER_TG_TEXT =
    'Здравствуйте! Хочу начать с бесплатного звонка 20 минут.';

export function ContactCtaBanner() {
    return (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-lg bg-primary-50 px-6 py-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <p className="text-body text-neutral-700 max-w-md">
                Не знаешь, с чего начать? Начни с бесплатного звонка.
            </p>
            <TelegramButton
                goal={TG_GOALS.servicesBanner}
                text={BANNER_TG_TEXT}
                variant="primary"
                size="md"
            >
                Бесплатная консультация
            </TelegramButton>
        </div>
    );
}

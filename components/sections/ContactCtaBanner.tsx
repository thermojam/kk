import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const BANNER_TG_TEXT =
    'Здравствуйте! Не уверена, какой формат мне подходит. Хочу начать с бесплатного звонка.';

export function ContactCtaBanner() {
    return (
        <div className="mt-12 flex flex-col items-center gap-5 px-6 py-8 text-center lg:py-12">
            <p className="max-w-md font-serif text-[28px] italic leading-tight text-neutral-900 lg:text-[34px]">
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

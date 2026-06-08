import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const OFFER_TG_TEXT =
    'Здравствуйте, Ксения! Хочу обсудить свой запрос и начать с бесплатной консультации.';

export function Offer() {
    return (
        <section className="bg-white">
            <div className="container-page flex flex-col items-center px-6 py-16 text-center lg:py-24">
                <h2 className="font-serif text-[28px] italic leading-tight text-neutral-900 lg:text-[34px]">
                    Готова вернуться к себе?
                </h2>
                <p className="mt-5 max-w-2xl text-body text-neutral-700">
                    Начни с бесплатного 20-минутного звонка. Расскажешь, что происходит — я отвечу,
                    смогу ли помочь и как мы будем работать. Без обязательств и давления.
                </p>
                <TelegramButton
                    goal={TG_GOALS.offer}
                    text={OFFER_TG_TEXT}
                    variant="accent"
                    size="md"
                    className="mt-8"
                >
                    Обсудить мой запрос
                </TelegramButton>
                <p className="mt-4 text-sm text-primary-500">Отвечаю лично, обычно в течение дня</p>
            </div>
        </section>
    );
}

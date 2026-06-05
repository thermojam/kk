import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

export function Offer() {
    return (
        <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--color-primary-900),var(--color-primary-700)_55%,#1a0833)] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(255,165,82,0.22),transparent_35%)]" />
            <div className="container-page relative flex flex-col items-center px-6 py-16 text-center lg:py-24">
                <h2 className="font-serif text-[38px] italic leading-tight lg:text-[56px]">
                    Готова вернуться к себе?
                </h2>
                <p className="mt-5 max-w-2xl text-body text-white/80">
                    Начни с бесплатного 20-минутного звонка. Расскажешь, что происходит — я отвечу,
                    смогу ли помочь и как мы будем работать. Без обязательств и давления.
                </p>
                <TelegramButton
                    goal={TG_GOALS.offer}
                    text=""
                    variant="accent"
                    size="lg"
                    className="mt-8"
                >
                    Написать в Telegram
                </TelegramButton>
                <p className="mt-4 text-sm text-accent-300">Отвечаю лично, обычно в течение дня</p>
            </div>
        </section>
    );
}

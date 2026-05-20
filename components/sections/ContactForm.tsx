'use client';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';

const CONSENT_GENERAL_TEXT =
    'Я согласна на обработку моих персональных данных (имя, email, телефон) для связи со мной.';

const CONSENT_HEALTH_TEXT =
    'Я согласна на обработку специальных категорий персональных данных о состоянии здоровья, которые я могу указать в ходе дальнейшего общения.';

export function ContactForm() {
    return (
        <section id="contact" className="container-page py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:items-start">
                <div className="flex flex-col gap-4">
                    <h2 className="text-h2 text-neutral-900">
                        Запишись на бесплатную консультацию
                    </h2>
                    <p className="text-body text-neutral-700 max-w-md">
                        20 минут. Расскажешь, что происходит — отвечу честно, могу ли быть полезной
                        и как мы будем работать.
                    </p>
                </div>

                <form
                    aria-label="Форма заявки на консультацию"
                    className="flex flex-col gap-5 rounded-lg bg-neutral-50 p-6 lg:p-8"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Input label="Имя" name="name" required autoComplete="name" />
                    <Input label="Email" name="email" type="email" required autoComplete="email" />
                    <PhoneInput label="Телефон (опционально)" name="phone" />

                    <Checkbox
                        id="consent-general"
                        name="consent_pdn_general"
                        required
                        label={
                            <>
                                {CONSENT_GENERAL_TEXT}{' '}
                                <span className="text-primary-500 underline">подробнее ▾</span>
                            </>
                        }
                    />
                    <Checkbox
                        id="consent-health"
                        name="consent_pdn_health"
                        required
                        label={
                            <>
                                {CONSENT_HEALTH_TEXT}{' '}
                                <span className="text-primary-500 underline">подробнее ▾</span>
                            </>
                        }
                    />

                    <Button type="submit" disabled className="self-start">
                        Записаться
                    </Button>
                    <p className="text-[13px] text-neutral-500">
                        Записываясь, ты принимаешь условия оферты.
                    </p>
                </form>
            </div>
        </section>
    );
}

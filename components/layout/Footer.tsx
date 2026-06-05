import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { TG_GOALS } from '@/lib/telegram';

const NAV = [
    { href: '/#about', label: 'Обо мне' },
    { href: '/#work-areas', label: 'С чем работаю' },
    { href: '/#cases', label: 'Истории' },
    { href: '/#services', label: 'Услуги' },
    { href: '/#faq', label: 'Вопросы' },
];

const FOOTER_TG_TEXT = 'Здравствуйте, Ксения! Пишу с сайта.';

export function Footer() {
    return (
        <footer className="bg-neutral-900 text-white/85">
            <div className="container-page py-16">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Левая колонка */}
                    <div>
                        <Link href="/" aria-label="На главную">
                            <Logo tone="duotone" />
                        </Link>
                        <p className="mt-4 text-white">Ксения Каменская</p>
                        <p className="text-white/70">Психолог · Женские практики</p>
                        <p className="mt-6 text-[13px] text-white/55">
                            Услуги психолога не являются психотерапией
                            <br />
                            и медицинской помощью.
                        </p>
                    </div>

                    {/* Центральная колонка */}
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                            Контакты
                        </p>
                        <div className="flex flex-col gap-3 items-start">
                            <TelegramButton
                                goal={TG_GOALS.footer}
                                text={FOOTER_TG_TEXT}
                                variant="accent"
                                size="md"
                            >
                                @xenia_kamensky
                            </TelegramButton>
                            <a
                                href="https://t.me/kmensky_case"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/85 hover:text-accent-500"
                            >
                                Канал отзывов: t.me/kmensky_case
                            </a>
                            <a
                                href="mailto:hello@kamenskaya.ru"
                                className="text-white/85 hover:text-accent-500"
                            >
                                hello@kamenskaya.ru
                            </a>
                        </div>
                    </div>

                    {/* Правая колонка */}
                    <nav aria-label="Навигация в футере">
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                            Разделы
                        </p>
                        <ul className="flex flex-col gap-2">
                            {NAV.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-white/85 hover:text-accent-500"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Нижняя строка */}
                <div className="mt-12 border-t border-white/10 pt-6">
                    <p className="text-[13px] text-white/55">
                        ИП Каменская К. С. · ОГРНИП 323784700394015 · ИНН 781435744110
                    </p>
                    <p className="mt-2 text-[13px]">
                        <Link href="/privacy/" className="text-white/55 hover:text-accent-500">
                            Политика ПДн
                        </Link>
                        <span className="mx-2 text-white/30">·</span>
                        <Link href="/cookies/" className="text-white/55 hover:text-accent-500">
                            Cookie
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
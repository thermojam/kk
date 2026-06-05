import Link from 'next/link';
import { Mail, Send, Star } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { BUSINESS, CONTACTS } from '@/lib/constants';

const NAV = [
    { href: '/#about', label: 'Обо мне' },
    { href: '/#work-areas', label: 'С чем работаю' },
    { href: '/#cases', label: 'Истории' },
    { href: '/#services', label: 'Услуги' },
    { href: '/#faq', label: 'Вопросы' },
];

export function Footer() {
    const contacts = [
        { href: CONTACTS.telegram, label: '@xenia_kamensky', meta: 'Telegram', Icon: Send },
        { href: CONTACTS.email, label: 'hello@kamenskaya.ru', meta: 'Email', Icon: Mail },
        { href: CONTACTS.reviews, label: 't.me/kmensky_case', meta: 'Канал отзывов', Icon: Star },
    ];

    return (
        <footer className="bg-neutral-950 text-white/85">
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
                            <br />и медицинской помощью.
                        </p>
                    </div>

                    {/* Центральная колонка */}
                    <div>
                        <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">
                            Контакты
                        </p>
                        <div className="flex flex-col gap-3">
                            {contacts.map(({ href, label, meta, Icon }) => (
                                <a
                                    key={href}
                                    href={href}
                                    target={href.startsWith('http') ? '_blank' : undefined}
                                    rel={
                                        href.startsWith('http') ? 'noopener noreferrer' : undefined
                                    }
                                    className="group flex items-center gap-3 text-white/85 hover:text-white"
                                >
                                    <span className="grid size-10 place-items-center rounded-full bg-white/8 text-white transition group-hover:bg-accent-500 group-hover:text-neutral-900">
                                        <Icon
                                            aria-hidden="true"
                                            className="size-5"
                                            strokeWidth={1.7}
                                        />
                                    </span>
                                    <span>
                                        {label}
                                        <small className="block text-white/50">{meta}</small>
                                    </span>
                                </a>
                            ))}
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
                        {BUSINESS.name} · ОГРНИП {BUSINESS.ogrnip} · ИНН {BUSINESS.inn}
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { TelegramButton } from '@/components/ui/TelegramButton';
import { Button } from '@/components/ui/Button';
import { TG_GOALS } from '@/lib/telegram';

const NAV = [
    { href: '/#about', label: 'Обо мне' },
    { href: '/course/', label: 'Программа' },
    { href: '/#work-areas', label: 'С чем работаю' },
    { href: '/#cases', label: 'Истории' },
    { href: '/#services', label: 'Услуги' },
    { href: '/#faq', label: 'Вопросы' },
];

export const metadata: Metadata = {
    title: 'Страница не найдена',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <section className="relative isolate flex min-h-screen flex-1 items-center overflow-hidden bg-[linear-gradient(112deg,#351058_0%,#4e1b78_52%,#220b3d_100%)]">
            <div className="container-page py-20 text-center">
                <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-accent-500">
                    Ошибка 404
                </p>

                <p
                    aria-hidden="true"
                    className="font-serif text-[96px] italic leading-none text-neutral-0 sm:text-[130px] lg:text-[180px]"
                >
                    4<span className="text-accent-500">0</span>4
                </p>

                <h1 className="text-h1 mx-auto mt-2 max-w-[600px] text-neutral-0">
                    Такой страницы нет — но путь всегда можно найти заново
                </h1>

                <p className="text-body mx-auto mt-4 mb-10 max-w-[520px] text-white/70">
                    Ссылка устарела, или адрес был введён неточно. Ниже — дорога назад: на главную
                    или к разделам сайта.
                </p>

                <div className="mx-auto mb-12 flex flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center sm:gap-4">
                    <TelegramButton
                        goal={TG_GOALS.notFound}
                        text="Здравствуйте! Не могу найти нужную страницу на сайте — подскажите, пожалуйста."
                        variant="accent"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Написать в Telegram
                    </TelegramButton>
                    <Button
                        href="/"
                        variant="secondary"
                        size="lg"
                        className="w-full border-white/50 text-white hover:bg-white/10 sm:w-auto"
                    >
                        На главную
                    </Button>
                </div>

                <nav
                    aria-label="Разделы сайта"
                    className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[14px] font-bold text-white/70"
                >
                    {NAV.map((item) => (
                        <Link key={item.href} href={item.href} className="hover:text-accent-500">
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </section>
    );
}

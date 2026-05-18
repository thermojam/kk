import {Logo} from '@/components/ui/Logo';

const NAV = [
    {href: '/#about', label: 'Обо мне'},
    {href: '/#services', label: 'Услуги'},
    {href: '/#materials', label: 'Материалы'},
    {href: '/#contact', label: 'Контакт'},
];

export function Footer() {
    return (
        <footer className="mt-24 border-t border-neutral-100 bg-neutral-50">
            <div className="container-page py-12">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Левая колонка */}
                    <div className="flex flex-col gap-3 text-neutral-700">
                        <Logo variant="mark+text"/>
                        <p className="text-body">Психолог · Женские практики</p>
                        <p className="text-[13px] text-neutral-500">
                            Услуги психолога не являются психотерапией и медицинской помощью.
                        </p>
                    </div>

                    {/* Центральная колонка */}
                    <div className="flex flex-col gap-2 text-body text-neutral-700">
                        <a
                            href="https://t.me/xenia_kamensky"
                            className="hover:text-primary-500"
                        >
                            Telegram: @xenia_kamensky
                        </a>
                        <a
                            href="https://t.me/kmensky_case"
                            className="hover:text-primary-500"
                        >
                            Канал отзывов: t.me/kmensky_case
                        </a>
                        <a
                            href="mailto:hello@kamenskaya.ru"
                            className="hover:text-primary-500"
                        >
                            Email: hello@kamenskaya.ru
                        </a>
                    </div>

                    {/* Правая колонка */}
                    <nav aria-label="Футер: навигация">
                        <ul className="flex flex-col gap-2 text-body text-neutral-700">
                            {NAV.map((item) => (
                                <li key={item.href}>
                                    <a href={item.href} className="hover:text-primary-500">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Нижняя строка */}
                <div
                    className="mt-10 border-t border-neutral-100 pt-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between text-[13px] text-neutral-500">
                    <p>
                        ИП Каменская К. С. · ОГРНИП 323784700394015 · ИНН 781435744110
                    </p>
                    <ul className="flex gap-4">
                        <li>
                            <a href="#" className="hover:text-primary-500">
                                Политика ПДн
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary-500">
                                Оферта
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary-500">
                                Cookie
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

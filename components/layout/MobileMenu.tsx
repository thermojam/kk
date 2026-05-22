'use client';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Logo } from '@/components/ui/Logo';

const NAV = [
    { href: '/#about', label: 'Обо мне' },
    { href: '/#services', label: 'Услуги' },
    { href: '/#materials', label: 'Материалы' },
    { href: '/#contact', label: 'Контакт' },
];

type MobileMenuProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
    const close = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange} title="Меню" hideTitle position="right">
            <div className="flex h-full flex-col bg-neutral-900 px-6 pt-6 pb-8">
                <div className="mb-8 flex items-center text-white">
                    <Logo variant="mark+text" tone="duotone" />
                </div>

                <nav aria-label="Главная навигация" className="flex flex-col gap-4">
                    {NAV.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className="text-h3 text-white/85 transition-colors duration-150 hover:text-accent-500"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="my-8 border-t border-white/10" />

                <Button
                    href="/#contact"
                    variant="accent"
                    size="md"
                    onClick={close}
                    className="w-full"
                >
                    Записаться на консультацию
                </Button>

                <div className="mt-auto flex flex-col gap-2 pt-8 text-body text-white/60">
                    <a href="https://t.me/xenia_kamensky">@xenia_kamensky</a>
                    <a href="mailto:hello@kamenskaya.ru">hello@kamenskaya.ru</a>
                </div>
            </div>
        </Dialog>
    );
}

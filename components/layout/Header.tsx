'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { reachGoal } from '@/lib/analytics/metrika';
import { TG_GOALS } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * На страницах с тёмным первым экраном (главная и /course) хедер статичный:
 * прозрачный поверх градиента, при скролле уезжает вместе со страницей.
 * Липнуть ему незачем — купить курс можно из карточки на слайдере, из блока
 * цен и из баннера ниже. На остальных страницах — белый и sticky, как было.
 *
 * Хедер занимает место в потоке, поэтому Hero подтянут под него отрицательным
 * отступом. Высота фиксирована: h-[72px] здесь и -mt-[72px] в Hero.
 */
export function Header() {
    const pathname = usePathname();
    const onCourse = pathname === '/course/';
    // Над тёмным градиентом логотип белый. Везде ещё фон белый, и на нём
    // белый логотип не виден.
    const darkFirstScreen = pathname === '/' || onCourse;

    return (
        <header
            className={cn(
                'z-50 h-[72px]',
                darkFirstScreen
                    ? 'relative bg-transparent'
                    : 'sticky top-0 border-b border-neutral-100 bg-neutral-0/85 backdrop-blur-md'
            )}
        >
            <div className="container-page flex h-full items-center justify-between gap-4">
                <Link href="/" aria-label="На главную" className="inline-flex">
                    <Logo size={48} className={darkFirstScreen ? 'text-white' : 'text-primary-500'} />
                </Link>

                {/* На самом курсе кнопка не нужна: страница целиком про него,
                    а блок цен всё равно ниже по этой же странице. */}
                {!onCourse && (
                    <Button
                        href="/course/"
                        variant="accent"
                        size="md"
                        onClick={() => reachGoal(TG_GOALS.courseHeader)}
                    >
                        Записаться
                    </Button>
                )}
            </div>
        </header>
    );
}

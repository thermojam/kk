'use client';

import { type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { reachGoal } from '@/lib/analytics/metrika';
import { tgLink, type TgGoal } from '@/lib/telegram';

type Variant = 'primary' | 'secondary' | 'accent';
type Size = 'md' | 'lg';

type TelegramButtonProps = {
    goal: TgGoal;
    text: string;
    children: ReactNode;
    variant?: Variant;
    size?: Size;
    className?: string;
};

export function TelegramButton({
    goal,
    text,
    children,
    variant = 'accent',
    size = 'md',
    className,
}: TelegramButtonProps) {
    return (
        <Button
            href={tgLink(text)}
            variant={variant}
            size={size}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => reachGoal(goal)}
        >
            {children}
        </Button>
    );
}
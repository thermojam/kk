import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardProps = {
    as?: ElementType;
    className?: string;
    children: ReactNode;
};

export function Card({ as: Tag = 'div', className, children }: CardProps) {
    return (
        <Tag
            className={cn(
                'rounded-lg bg-neutral-0 border border-neutral-100 shadow-sm p-6',
                className
            )}
        >
            {children}
        </Tag>
    );
}

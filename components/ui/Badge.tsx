import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent' | 'primary' | 'inverse';

type BadgeProps = {
    tone?: BadgeTone;
    className?: string;
    children: ReactNode;
};

const toneClasses: Record<BadgeTone, string> = {
    neutral: 'bg-neutral-50 text-neutral-700 border border-neutral-100',
    accent: 'bg-accent-500 text-neutral-900',
    primary: 'bg-primary-50 text-primary-500 border border-primary-300',
    inverse: 'bg-neutral-0 text-primary-500',
};

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-pill px-3 py-1',
                'text-[12px] font-bold leading-none',
                toneClasses[tone],
                className
            )}
        >
            {children}
        </span>
    );
}

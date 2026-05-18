'use client';

import * as RC from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CheckboxProps = {
    id: string;
    label: ReactNode;
    required?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    name?: string;
    className?: string;
};

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
    { id, label, required, checked, defaultChecked, onCheckedChange, name, className },
    ref
) {
    return (
        <div className={cn('flex items-start gap-3', className)}>
            <RC.Root
                ref={ref}
                id={id}
                name={name}
                required={required}
                checked={checked}
                defaultChecked={defaultChecked}
                onCheckedChange={(v) => onCheckedChange?.(v === true)}
                className={cn(
                    'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center',
                    'rounded-sm border bg-neutral-0 transition-colors',
                    'border-neutral-100 hover:border-primary-400',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                    'data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500'
                )}
            >
                <RC.Indicator>
                    <Check className="size-4 text-neutral-0" aria-hidden="true" />
                </RC.Indicator>
            </RC.Root>
            <label htmlFor={id} className="text-[14px] text-neutral-700 leading-snug">
                {label}
                {required && <span className="text-error ml-0.5">*</span>}
            </label>
        </div>
    );
});

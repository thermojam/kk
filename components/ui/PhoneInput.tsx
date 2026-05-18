'use client';

import {forwardRef, useState, type InputHTMLAttributes} from 'react';
import {cn} from '@/lib/cn';

type PhoneInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'type'
> & {
    label: string;
    error?: string;
    containerClassName?: string;
    value?: string; // нормализованное +7XXXXXXXXXX или пустая строка
    onChange?: (normalized: string) => void;
};

function digitsToMask(digits: string): string {
    const d = digits.slice(0, 10);
    if (d.length === 0) return '';
    let out = '+7 (';
    out += d.slice(0, 3);
    if (d.length >= 3) {
        out += ')';
        if (d.length > 3) out += ' ' + d.slice(3, 6);
        if (d.length > 6) out += '-' + d.slice(6, 8);
        if (d.length > 8) out += '-' + d.slice(8, 10);
    }
    return out;
}

function normalizedFromDigits(digits: string): string {
    return digits.length === 10 ? '+7' + digits : '';
}

function extractDigits(value: string): string {
    // Берём только цифры; если первая — 7 или 8, считаем её страновым кодом и отбрасываем
    let d = value.replace(/\D/g, '');
    if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1);
    return d.slice(0, 10);
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    function PhoneInput(
        {
            label,
            error,
            className,
            containerClassName,
            id,
            required,
            value,
            onChange,
            ...rest
        },
        ref,
    ) {
        const inputId = id ?? rest.name ?? 'phone';

        const initialDigits =
            value && value.startsWith('+7') ? value.slice(2) : '';
        const [digits, setDigits] = useState(initialDigits);
        const display = digitsToMask(digits);

        return (
            <div className={cn('flex flex-col gap-1.5', containerClassName)}>
                <label
                    htmlFor={inputId}
                    className="text-[14px] font-bold text-neutral-700"
                >
                    {label}
                    {required && <span className="text-error ml-0.5">*</span>}
                </label>
                <input
                    ref={ref}
                    id={inputId}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    required={required}
                    aria-invalid={error ? 'true' : undefined}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    value={display}
                    onChange={(e) => {
                        const d = extractDigits(e.target.value);
                        setDigits(d);
                        onChange?.(normalizedFromDigits(d));
                    }}
                    className={cn(
                        'h-12 rounded-md border bg-neutral-0 px-4 text-body text-neutral-900',
                        'placeholder:text-neutral-500 outline-none transition-colors',
                        'focus-visible:ring-2 focus-visible:ring-primary-300',
                        error
                            ? 'border-error'
                            : 'border-neutral-100 focus:border-primary-400',
                        className,
                    )}
                    {...rest}
                />
                {error && (
                    <span id={`${inputId}-error`} className="text-[13px] text-error">
            {error}
          </span>
                )}
            </div>
        );
    },
);

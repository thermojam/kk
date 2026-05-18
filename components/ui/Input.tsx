import {forwardRef, type InputHTMLAttributes} from 'react';
import {cn} from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    {label, error, className, containerClassName, id, required, ...rest},
    ref,
) {
    const inputId = id ?? rest.name;
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
                required={required}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={error && inputId ? `${inputId}-error` : undefined}
                className={cn(
                    'h-12 rounded-md border bg-neutral-0 px-4 text-body text-neutral-900',
                    'placeholder:text-neutral-500 outline-none transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-primary-300',
                    error ? 'border-error' : 'border-neutral-100 focus:border-primary-400',
                    className,
                )}
                {...rest}
            />
            {error && inputId && (
                <span id={`${inputId}-error`} className="text-[13px] text-error">
          {error}
        </span>
            )}
        </div>
    );
});

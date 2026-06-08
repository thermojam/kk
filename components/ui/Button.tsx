import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'accent';
type Size = 'md' | 'lg';

type CommonProps = {
    variant?: Variant;
    size?: Size;
    className?: string;
    children: ReactNode;
};

type ButtonAsButton = CommonProps &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | 'href'> & {
        href?: undefined;
    };

type ButtonAsLink = CommonProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
        href: string;
    };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary-500 text-neutral-0 hover:bg-primary-600 focus-visible:ring-primary-300',
    secondary:
        'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus-visible:ring-primary-300',
    accent: 'bg-accent-500 text-neutral-900 hover:opacity-90 focus-visible:ring-accent-500',
};

const sizeClasses: Record<Size, string> = {
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-[52px] px-7 text-[16px]',
};

const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-sans font-bold ' +
    'transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...rest
}: ButtonProps) {
    const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

    if ('href' in rest && rest.href !== undefined) {
        return (
            <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {children}
            </a>
        );
    }

    return (
        <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
            {children}
        </button>
    );
}

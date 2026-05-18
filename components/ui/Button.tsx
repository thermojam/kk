import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
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
    ghost: 'text-primary-500 bg-transparent hover:underline focus-visible:ring-primary-300',
};

const sizeClasses: Record<Size, string> = {
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-[52px] px-7 text-[16px]',
};

const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-sans font-bold ' +
    'transition-colors duration-150 outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0 ' +
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

export function Button(props: ButtonProps) {
    const { variant = 'primary', size = 'md', className, children } = props;
    const classes = cn(base, variantClasses[variant], sizeClasses[size], className);

    if ('href' in props && props.href !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
        return (
            <a href={href} className={classes} {...rest}>
                {children}
            </a>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
        variant: _v,
        size: _s,
        className: _c,
        children: _ch,
        ...rest
    } = props as ButtonAsButton;
    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
}

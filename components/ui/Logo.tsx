import { cn } from '@/lib/cn';

type LogoProps = {
    size?: number;
    variant?: 'mark' | 'mark+text';
    className?: string;
};

export function Logo({ size = 60, variant = 'mark', className }: LogoProps) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* Background */}
                <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="currentColor"
                    fillOpacity="0.04"
                    stroke="currentColor"
                    strokeOpacity="0.12"
                    strokeWidth="2"
                />

                {/* KK */}
                <g
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Left K */}
                    <path d="M28 24 V72" />
                    <path d="M28 48 L42 26" />
                    <path d="M28 48 L42 70" />

                    {/* Right K */}
                    <path d="M68 24 V72" />
                    <path d="M68 48 L54 26" />
                    <path d="M68 48 L54 70" />
                </g>

                {/* Center dot */}
                <circle cx="48" cy="48" r="4.5" fill="currentColor" />
            </svg>

            {variant === 'mark+text' && (
                <span className="font-serif italic text-[16px] leading-none">Ксения Каменская</span>
            )}
        </span>
    );
}

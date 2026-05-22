import { cn } from '@/lib/cn';

type LogoProps = {
    size?: number;
    tone?: 'mono' | 'duotone';
    className?: string;
};

export function Logo({ size = 60, tone = 'mono', className }: LogoProps) {
    const isDuotone = tone === 'duotone';

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
                {/* Background ring */}
                <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill={isDuotone ? 'rgba(106,90,200,0.08)' : 'currentColor'}
                    fillOpacity={isDuotone ? undefined : 0.04}
                    stroke={isDuotone ? 'var(--color-primary-500)' : 'currentColor'}
                    strokeOpacity={isDuotone ? 1 : 0.12}
                    strokeWidth="2"
                />

                {/* KK */}
                <g
                    stroke={isDuotone ? 'var(--color-neutral-0)' : 'currentColor'}
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
                <circle
                    cx="48"
                    cy="48"
                    r="4.5"
                    fill={isDuotone ? 'var(--color-accent-500)' : 'currentColor'}
                />
            </svg>
        </span>
    );
}

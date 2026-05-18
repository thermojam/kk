import {cn} from '@/lib/cn';

type LogoProps = {
    size?: number;
    variant?: 'mark' | 'mark+text';
    className?: string;
};

export function Logo({size = 40, variant = 'mark', className}: LogoProps) {
    return (
        <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
      >
        <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5"/>
        <path
            d="M12 11 V29 M12 20 L20 11 M12 20 L20 29"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M22 11 V29 M22 20 L30 11 M22 20 L30 29"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
            {variant === 'mark+text' && (
                <span className="font-serif italic text-[16px] text-neutral-900">
          Ксения Каменская
        </span>
            )}
    </span>
    );
}

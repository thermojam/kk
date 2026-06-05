import { Compass, HeartPulse, Sparkles } from 'lucide-react';
import type { WorkAreaIconName } from '@/content/home';

type WorkAreaIconProps = {
    name: WorkAreaIconName;
    className?: string;
};

const icons = {
    'heart-pulse': HeartPulse,
    compass: Compass,
    sparkles: Sparkles,
} as const;

export function WorkAreaIcon({ name, className }: WorkAreaIconProps) {
    const Icon = icons[name];
    return (
        <Icon
            aria-hidden="true"
            strokeWidth={1.5}
            className={className ?? 'size-7 text-primary-500'}
        />
    );
}

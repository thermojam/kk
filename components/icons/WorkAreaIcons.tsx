import { Compass, Mic, Waves } from 'lucide-react';
import type { WorkAreaIconName } from '@/content/home';

type WorkAreaIconProps = {
    name: WorkAreaIconName;
    className?: string;
};

const icons = {
    waves: Waves,
    compass: Compass,
    mic: Mic,
} as const;

export function WorkAreaIcon({ name, className }: WorkAreaIconProps) {
    const Icon = icons[name];
    return (
        <Icon
            aria-hidden="true"
            strokeWidth={1.5}
            className={className ?? 'size-10 text-primary-500'}
        />
    );
}

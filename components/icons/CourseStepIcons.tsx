import { Flower2, HeartHandshake, Salad } from 'lucide-react';
import type { CourseStepIcon as CourseStepIconName } from '@/content/course';

type CourseStepIconProps = {
    name: CourseStepIconName;
    className?: string;
};

const icons = {
    psycho: HeartHandshake,
    nutrition: Salad,
    body: Flower2,
} as const;

export function CourseStepIcon({ name, className }: CourseStepIconProps) {
    const Icon = icons[name];
    return (
        <Icon
            aria-hidden="true"
            strokeWidth={1.5}
            className={className ?? 'size-7 text-primary-500'}
        />
    );
}

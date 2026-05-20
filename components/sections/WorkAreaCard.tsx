import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article className="flex h-full flex-col gap-4 rounded-lg bg-neutral-0 border border-neutral-100 shadow-sm p-6">
            <WorkAreaIcon name={item.icon} />
            <h3 className="text-h3 text-neutral-900">{item.title}</h3>
            <ul className="flex flex-col gap-2 text-body text-neutral-700">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 size-1 shrink-0 rounded-full bg-primary-400"
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}

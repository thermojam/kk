import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article
            className="
                group flex h-full flex-col rounded-lg border border-neutral-100 bg-neutral-0 p-6
                shadow-[0_8px_24px_-18px_rgba(30,30,46,0.15)]
                transition duration-300
                lg:hover:-translate-y-1 lg:hover:border-primary-300
            "
        >
            <div
                className="
                    mb-4 flex h-14 w-14 items-center justify-center
                    rounded-md bg-primary-50
                "
            >
                <WorkAreaIcon name={item.icon} />
            </div>

            <h3 className="text-h3 mb-3 text-neutral-900">{item.title}</h3>

            <ul className="flex flex-col gap-2 text-neutral-700">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
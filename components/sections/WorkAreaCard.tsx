import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article
            className="
                group flex h-full flex-col rounded-3xl border border-white/60 bg-neutral-0/90
                p-6 shadow-[0_18px_50px_-28px_rgba(30,30,46,0.18)]
                transition duration-300
                lg:hover:-translate-y-1
            "
        >
            <div className="mb-5 flex items-start gap-5">
                <div
                    aria-hidden="true"
                    className="
                        flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-50/70
                    "
                >
                    <WorkAreaIcon name={item.icon} className="size-8 text-primary-300/70" />
                </div>
                <h3 className="text-h3 pt-1 text-neutral-900">{item.title}</h3>
            </div>

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

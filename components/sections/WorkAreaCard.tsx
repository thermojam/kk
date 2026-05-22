import type { WorkArea } from '@/content/home';
import { WorkAreaIcon } from '@/components/icons/WorkAreaIcons';

type WorkAreaCardProps = { item: WorkArea };

export function WorkAreaCard({ item }: WorkAreaCardProps) {
    return (
        <article
            className="
                work-area-card relative flex h-full flex-col gap-4 overflow-hidden
                rounded-lg border border-white/[0.06] p-6
                text-neutral-0 shadow-[0_18px_40px_-22px_rgba(30,30,46,0.55)]
                transition-transform duration-300 hover:-translate-y-1
            "
        >
            <div className="flex size-14 items-center justify-center rounded-[14px] border border-white/[0.14] bg-white/[0.08]">
                <WorkAreaIcon name={item.icon} className="size-7 text-accent-500" />
            </div>

            <h3 className="text-h3 text-neutral-0">{item.title}</h3>

            <ul className="flex flex-col gap-2 text-body text-white/[0.78]">
                {item.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                        <span
                            aria-hidden="true"
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-500 shadow-[0_0_10px_rgba(255,165,82,0.7)]"
                        />
                        <span>{b}</span>
                    </li>
                ))}
            </ul>
        </article>
    );
}

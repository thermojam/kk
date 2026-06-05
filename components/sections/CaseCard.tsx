import type { Case } from '@/content/home';

type CaseCardProps = { item: Case; number: number };

export function CaseCard({ item, number }: CaseCardProps) {
    return (
        <article
            className="
                relative flex h-full flex-col gap-3 overflow-hidden
                rounded-xl bg-neutral-0 py-7 pl-8 pr-7
                shadow-[0_8px_24px_-18px_rgba(30,30,46,0.15)]
                before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary-400
            "
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-3 select-none font-serif text-[64px] italic leading-none text-primary-300/40"
            >
                {String(number).padStart(2, '0')}
            </span>

            <h3 className="line-clamp-2 min-h-[2lh] pr-12 font-serif text-[22px] font-medium italic leading-[1.18] text-neutral-900">
                «{item.title}»
            </h3>

            <p className="text-body leading-relaxed text-neutral-700">{item.body}</p>
        </article>
    );
}

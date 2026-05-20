import type { Case } from '@/content/home';

type CaseCardProps = { item: Case };

export function CaseCard({ item }: CaseCardProps) {
    return (
        <article className="flex h-full flex-col gap-4 rounded-lg bg-primary-50 p-6">
            <h3 className="font-serif italic text-[24px] leading-[1.15] text-neutral-900">
                «{item.title}»
            </h3>
            <p className="text-body text-neutral-700 leading-relaxed">{item.body}</p>
        </article>
    );
}

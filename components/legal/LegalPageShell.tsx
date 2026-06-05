type Section = { heading: string; body: string };

type LegalPageShellProps = {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: Section[];
};

export function LegalPageShell({
    title,
    lastUpdated,
    intro,
    sections,
}: LegalPageShellProps) {
    return (
        <article className="container-page py-16 lg:py-24">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-h1 mb-4 text-neutral-900">{title}</h1>
                <p className="mb-10 text-[13px] text-neutral-500">
                    Действует с {lastUpdated}
                </p>
                <p className="text-body mb-10 text-neutral-700">{intro}</p>
                <div className="flex flex-col gap-8">
                    {sections.map((s) => (
                        <section key={s.heading}>
                            <h2 className="text-h2 mb-3 text-neutral-900">
                                {s.heading}
                            </h2>
                            <p className="text-body text-neutral-700">{s.body}</p>
                        </section>
                    ))}
                </div>
            </div>
        </article>
    );
}
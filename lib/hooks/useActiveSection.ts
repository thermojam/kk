'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently visible in the viewport's middle band,
 * or null if none. Pass a stable `sectionIds` reference (declare at module scope
 * or memoize) — inline array literals re-subscribe on every render.
 */
export function useActiveSection(sectionIds: string[]): string | null {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (sectionIds.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]) setActiveId(visible[0].target.id);
            },
            { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5] }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [sectionIds]);

    return activeId;
}

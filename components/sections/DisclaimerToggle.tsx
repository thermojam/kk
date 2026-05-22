'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';

type DisclaimerToggleProps = { text: string };

export function DisclaimerToggle({ text }: DisclaimerToggleProps) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        document.addEventListener('keydown', onEscape);
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, [open]);

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center gap-2 border-t border-neutral-100 pt-3 text-left text-[13px] text-neutral-500 transition-colors hover:text-neutral-700"
            >
                <Info className="size-4 shrink-0" aria-hidden="true" />
                <span className="line-clamp-1 flex-1">{text}</span>
            </button>
            {open && (
                <div
                    id={panelId}
                    role="region"
                    aria-label="Полный текст дисклеймера"
                    className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-lg border border-neutral-100 bg-neutral-0 p-4 text-[13px] leading-snug text-neutral-700 shadow-lg"
                >
                    {text}
                </div>
            )}
        </div>
    );
}

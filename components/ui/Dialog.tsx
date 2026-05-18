'use client';

import * as RD from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    hideTitle?: boolean;
    position?: 'right' | 'center';
    children: ReactNode;
    contentClassName?: string;
};

export function Dialog({
    open,
    onOpenChange,
    title,
    hideTitle,
    position = 'center',
    children,
    contentClassName,
}: DialogProps) {
    const reduced = useReducedMotion();

    const contentMotion =
        position === 'right'
            ? {
                  initial: reduced ? { opacity: 0 } : { x: '100%' },
                  animate: reduced ? { opacity: 1 } : { x: 0 },
                  exit: reduced ? { opacity: 0 } : { x: '100%' },
                  transition: { duration: 0.2, ease: 'easeOut' as const },
              }
            : {
                  initial: { opacity: 0, scale: 0.98 },
                  animate: { opacity: 1, scale: 1 },
                  exit: { opacity: 0, scale: 0.98 },
                  transition: { duration: 0.15, ease: 'easeOut' as const },
              };

    return (
        <RD.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <RD.Portal forceMount>
                        <RD.Overlay asChild forceMount>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="fixed inset-0 z-40 bg-neutral-900/40"
                            />
                        </RD.Overlay>
                        <RD.Content asChild forceMount>
                            <motion.div
                                {...contentMotion}
                                className={cn(
                                    'fixed z-50 bg-neutral-0 outline-none',
                                    position === 'right' &&
                                        'top-0 right-0 h-full w-[88%] max-w-sm shadow-xl',
                                    position === 'center' &&
                                        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ' +
                                            'w-[92%] max-w-md rounded-lg shadow-xl',
                                    contentClassName
                                )}
                            >
                                <RD.Title
                                    className={cn(
                                        hideTitle && 'sr-only',
                                        !hideTitle && 'text-h3 text-neutral-900 px-6 pt-6'
                                    )}
                                >
                                    {title}
                                </RD.Title>
                                <RD.Close
                                    aria-label="Закрыть"
                                    className={cn(
                                        'absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center',
                                        'rounded-md text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none',
                                        'focus-visible:ring-2 focus-visible:ring-primary-300'
                                    )}
                                >
                                    <X className="size-5" aria-hidden="true" />
                                </RD.Close>
                                {children}
                            </motion.div>
                        </RD.Content>
                    </RD.Portal>
                )}
            </AnimatePresence>
        </RD.Root>
    );
}

'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PARTICLES = [
    { top: '10%', left: '55%', delay: 0, duration: 5.5 },
    { top: '22%', left: '78%', delay: 1.2, duration: 6.2 },
    { top: '70%', left: '62%', delay: 2.4, duration: 5.0 },
    { top: '82%', left: '85%', delay: 3.6, duration: 6.8 },
    { top: '45%', left: '92%', delay: 4.8, duration: 5.8 },
];

export function HeroBackground() {
    const reduced = useReducedMotion();
    if (reduced) return null;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block overflow-hidden"
        >
            <motion.div
                className="absolute"
                style={{
                    left: '-160px',
                    bottom: '-180px',
                    width: '460px',
                    height: '460px',
                    background:
                        'radial-gradient(circle, var(--color-primary-500) 0%, transparent 70%)',
                    opacity: 0.55,
                }}
                animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
                transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
                className="absolute"
                style={{
                    right: '35%',
                    top: '-120px',
                    width: '320px',
                    height: '320px',
                    background:
                        'radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)',
                    opacity: 0.35,
                }}
                animate={{ x: [15, -15, 15], y: [10, -10, 10] }}
                transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
            />

            {PARTICLES.map((p, i) => (
                <span
                    key={i}
                    className="hero-particle"
                    style={{
                        top: p.top,
                        left: p.left,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

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
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1200 720"
                preserveAspectRatio="xMidYMid slice"
            >
                <motion.ellipse
                    cx="120"
                    cy="160"
                    rx="240"
                    ry="160"
                    fill="var(--color-primary-300)"
                    opacity="0.4"
                    animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
                    transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
                />
                <motion.ellipse
                    cx="720"
                    cy="540"
                    rx="180"
                    ry="130"
                    fill="var(--color-primary-400)"
                    opacity="0.3"
                    animate={{ x: [20, -20, 20], y: [12, -12, 12] }}
                    transition={{ duration: 22, ease: 'easeInOut', repeat: Infinity }}
                />
                <motion.ellipse
                    cx="980"
                    cy="80"
                    rx="100"
                    ry="80"
                    fill="var(--color-primary-300)"
                    opacity="0.5"
                    animate={{ x: [-8, 8, -8], y: [-6, 6, -6] }}
                    transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity }}
                />
            </svg>

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

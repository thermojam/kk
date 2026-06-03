import { readConsent } from '@/lib/analytics/consent';

declare global {
    interface Window {
        ym?: (id: number, action: string, ...args: unknown[]) => void;
    }
}

const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID);

let initStarted = false;
const pendingGoals: string[] = [];

/** Безопасный no-op в SSR. */
function isClient(): boolean {
    return typeof window !== 'undefined';
}

/** Вставляет скрипт Метрики. Вызывать ТОЛЬКО после явного opt-in. */
export function initMetrika(): void {
    if (!isClient() || initStarted || !YM_ID) return;
    initStarted = true;

    /* eslint-disable */
    // Standard Yandex Metrika IIFE boilerplate — intentionally untyped.
    (function (m: any, e: any, t: any, r: any, i: any, k?: any, a?: any) {
        m[i] = m[i] || function () {
            (m[i].a = m[i].a || []).push(arguments);
        };
        m[i].l = +new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) return;
        }
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
    })(
        window, document, 'script',
        'https://mc.yandex.ru/metrika/tag.js',
        'ym'
    );
    /* eslint-enable */

    window.ym?.(YM_ID, 'init', {
        ssr: false,
        webvisor: false, // явно отключено (см. аудит A3)
        clickmap: true,
        ecommerce: false,
        accurateTrackBounce: true,
        trackLinks: true,
    });

    // Слить очередь отложенных целей.
    while (pendingGoals.length > 0) {
        const goal = pendingGoals.shift();
        if (goal) sendGoal(goal);
    }
}

function sendGoal(goal: string): void {
    // target="_blank" keeps the origin tab active, so reachGoal completes
    // from this tab normally — no per-call beacon transport is needed.
    window.ym?.(YM_ID, 'reachGoal', goal);
}

/**
 * Отправляет goal в Метрику.
 * — Если согласия нет: no-op (но goal '_decline' от баннера может идти всегда — см. ниже).
 * — Если согласие есть, но скрипт ещё не загружен: ставим в очередь.
 */
export function reachGoal(goal: string): void {
    if (!isClient() || !YM_ID) return;
    if (readConsent() !== 'accepted') return;

    if (typeof window.ym !== 'function') {
        pendingGoals.push(goal);
        return;
    }
    sendGoal(goal);
}
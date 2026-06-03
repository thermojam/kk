import { POLICY_VERSION } from '@/content/legal/policy-version';

const KEY = 'kk.consent.v1';

type StoredConsent = {
    version: number;
    decision: 'accepted' | 'declined';
    timestamp: number;
};

export type ConsentDecision = StoredConsent['decision'];

const TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 месяцев

export function readConsent(): ConsentDecision | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredConsent;
        if (parsed.version !== POLICY_VERSION) return null;
        if (Date.now() - parsed.timestamp > TTL_MS) return null;
        return parsed.decision;
    } catch {
        return null;
    }
}

export function writeConsent(decision: ConsentDecision): void {
    if (typeof window === 'undefined') return;
    const value: StoredConsent = {
        version: POLICY_VERSION,
        decision,
        timestamp: Date.now(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(value));
}

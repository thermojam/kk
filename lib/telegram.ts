import { CONTACTS } from '@/lib/constants';

/** Источник истины — Часть 1 SPEC_v3. Менять синхронно со спеком. */
export const TG_GOALS = {
    hero: 'tg_click_hero',
    offer: 'tg_click_offer',
    serviceFood: 'tg_click_service_food',
    serviceSession: 'tg_click_service_session',
    serviceProgram: 'tg_click_service_program',
    serviceGym: 'tg_click_service_gym',
    serviceFree: 'tg_click_service_free',
    servicesBanner: 'tg_click_services_banner',
} as const;

export type TgGoal = (typeof TG_GOALS)[keyof typeof TG_GOALS];

export function tgLink(_text?: string): string {
    void _text;
    return CONTACTS.telegram;
}

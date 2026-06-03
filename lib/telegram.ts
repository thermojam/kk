const TG_USERNAME = 'xenia_kamensky';

/** Источник истины — Часть 1 SPEC_v3. Менять синхронно со спеком. */
export const TG_GOALS = {
    header: 'tg_click_header',
    hero: 'tg_click_hero',
    serviceFood: 'tg_click_service_food',
    serviceSession: 'tg_click_service_session',
    serviceProgram: 'tg_click_service_program',
    serviceGym: 'tg_click_service_gym',
    serviceFree: 'tg_click_service_free',
    servicesBanner: 'tg_click_services_banner',
    footer: 'tg_click_footer',
} as const;

export type TgGoal = (typeof TG_GOALS)[keyof typeof TG_GOALS];

export function tgLink(text: string): string {
    return `https://t.me/${TG_USERNAME}?text=${encodeURIComponent(text)}`;
}
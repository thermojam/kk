import { CONTACTS } from '@/lib/constants';

/** Источник истины — Часть 1 SPEC_v3. Менять синхронно со спеком. */
export const TG_GOALS = {
    hero: 'tg_click_hero',
    offer: 'tg_click_offer',
    serviceFood: 'tg_click_service_food',
    serviceSession: 'tg_click_service_session',
    serviceProgram: 'tg_click_service_program',
    serviceGym: 'tg_click_service_gym',
    serviceCombo: 'tg_click_service_combo',
    serviceFree: 'tg_click_service_free',
    servicesBanner: 'tg_click_services_banner',
} as const;

export type TgGoal = (typeof TG_GOALS)[keyof typeof TG_GOALS];

/** Цели воронки оплаты: клик → отправка формы → возврат из банка. */
export const PAY_GOALS = {
    headerClick: 'pay_header_click',
    buyClick: 'pay_click',
    submit: 'pay_submit',
    success: 'pay_success',
    fail: 'pay_fail',
} as const;

export type PayGoal = (typeof PAY_GOALS)[keyof typeof PAY_GOALS];

export function tgLink(text: string): string {
    return `${CONTACTS.telegram}?text=${encodeURIComponent(text)}`;
}

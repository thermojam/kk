import assert from 'node:assert/strict';
import test from 'node:test';
import { tgLink } from '../lib/telegram.ts';

test('tgLink adds an encoded message draft to the Telegram URL', () => {
    const text = 'Здравствуйте! Интересует консультация «Путь к себе».';

    assert.equal(
        tgLink(text),
        `https://t.me/xenia_kamensky?text=${encodeURIComponent(text)}`
    );
});

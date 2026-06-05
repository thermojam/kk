import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('service and final CTAs use centered white layouts without panels', async () => {
    const banner = await readFile(
        new URL('../components/sections/ContactCtaBanner.tsx', import.meta.url),
        'utf8'
    );
    const offer = await readFile(new URL('../components/sections/Offer.tsx', import.meta.url), 'utf8');

    assert.match(banner, /flex flex-col items-center.*text-center/);
    assert.doesNotMatch(banner, /rounded-lg|bg-primary-50|lg:flex-row|lg:text-left/);

    assert.match(offer, /bg-white/);
    assert.match(offer, /flex flex-col items-center.*text-center/);
    assert.doesNotMatch(offer, /linear-gradient|radial-gradient|text-white/);
});

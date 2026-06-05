import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('hero and footer use responsive edge rounding', async () => {
    const hero = await readFile(new URL('../components/sections/Hero.tsx', import.meta.url), 'utf8');
    const footer = await readFile(new URL('../components/layout/Footer.tsx', import.meta.url), 'utf8');

    assert.match(hero, /rounded-b-\[20px\].*lg:rounded-b-\[\d+px\]/);
    assert.match(footer, /rounded-t-\[20px\].*lg:rounded-t-\[\d+px\]/);
});

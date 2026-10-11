/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { persistMotionPreference, readMotionPreference, getReducedMotion } = require('../app/components/motion-preference.ts');

test('motion choice survives a storage write failure for the current session', () => {
  const originals = Object.fromEntries(['localStorage', 'document', 'window', 'matchMedia'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    globalThis.localStorage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
    globalThis.document = { documentElement: { dataset: {} } };
    globalThis.window = new EventTarget();
    globalThis.matchMedia = () => ({ matches: true });
    assert.equal(readMotionPreference(), 'system');
    assert.equal(getReducedMotion(), true);
    persistMotionPreference('full');
    assert.equal(readMotionPreference(), 'full');
    assert.equal(getReducedMotion(), false);
    assert.equal(document.documentElement.dataset.motion, 'full');
    persistMotionPreference('reduce');
    assert.equal(getReducedMotion(), true);
    assert.equal(document.documentElement.dataset.motion, 'reduce');
    let saved = null;
    globalThis.localStorage = { getItem: () => saved, setItem: (_, value) => { saved = value; } };
    persistMotionPreference('system');
    assert.equal(saved, 'system');
    assert.equal(readMotionPreference(), 'system');
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

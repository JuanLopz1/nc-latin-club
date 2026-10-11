/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { places } = require('../app/components/niagara/place-data.ts');
const NiagaraTeaser = require('../app/components/niagara/niagara-teaser.tsx').default;

test('homepage rail links to every public business once, keeping the original first three', () => {
  const html = renderToStaticMarkup(React.createElement(NiagaraTeaser, { language: 'en' }));
  const ids = [...html.matchAll(/href="\/niagara#([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 21);
  assert.equal(new Set(ids).size, 21);
  assert.deepEqual([...ids].sort(), places.map(place => place.id).sort());
  assert.deepEqual(ids.slice(0, 3), ['coco-bar-mexican-grill', 'la-paisana-tienda', 'origen-bistro-bakery']);
  for (const id of ['la-paisana-restaurante', 'paz-bakery', 'la-casita-guanaca']) assert.ok(ids.includes(id));
  assert.equal((html.match(/data-home-place=/g) || []).length, 21);
  assert.ok(html.includes('data-niagara-rail'));
});

test('homepage rail exposes manual navigation without repeating the global animation switch', () => {
  for (const [language, labels] of [['en', ['Previous business', 'Next business']], ['es', ['Negocio anterior', 'Negocio siguiente']]]) {
    const html = renderToStaticMarkup(React.createElement(NiagaraTeaser, { language }));
    for (const label of labels) assert.ok(html.includes(`aria-label="${label}"`), label);
    assert.equal((html.match(/aria-controls="niagara-businesses"/g) || []).length, 2);
    assert.ok(!html.includes('data-rail-toggle'));
    assert.ok(html.includes('tabindex="0"'));
    assert.ok(html.includes('aria-live="off"'));
  }
});

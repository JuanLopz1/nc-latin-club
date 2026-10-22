/* eslint-disable @typescript-eslint/no-require-imports -- existing real TypeScript harness */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
function load(file) {
  try {
    return require(file);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') return {};
    throw e;
  }
}
const validation = load('../app/cms/validation.ts');
const guards = load('../app/cms/security.ts');
const defaults = load('../app/cms/defaults.ts');
test('CMS defaults preserve every existing reviewed collection', () => {
  assert.equal(typeof validation.validateContent, 'function');
  for (const [key, value] of Object.entries(defaults.defaultContent))
    validation.validateContent(key, value);
  assert.equal(defaults.defaultContent.places.length, 21);
  assert.equal(defaults.defaultContent.pages.length, 55);
  assert.equal(defaults.defaultContent.events[0].slug, 'latin-fiesta-2026');
});
test('CMS publication rejects incomplete translations and unsafe settings links', () => {
  assert.equal(typeof validation.validateContent, 'function');
  const value = structuredClone(defaults.defaultContent.settings);
  value.instagramUrl = 'javascript:alert(1)';
  assert.throws(() => validation.validateContent('settings', value));
  value.instagramUrl = 'https://www.instagram.com/nclat1nclub/';
  value.spotifyUrl = 'https://evil.example/embed';
  assert.throws(() => validation.validateContent('settings', value));
  value.spotifyUrl = 'https://open.spotify.com/album/4kS7bSuU0Jm9LYMosFU2x5';
  value.spotifyTitle.es = '';
  assert.throws(() => validation.validateContent('settings', value));
  const home = structuredClone(defaults.defaultContent.home);
  home.es.heroText = '';
  assert.throws(() => validation.validateContent('home', home));
});
test('CMS keeps cultural dates separate and rejects invalid geography or duplicated slugs', () => {
  assert.equal(typeof validation.validateContent, 'function');
  assert.throws(() =>
    validation.validateContent('events', defaults.defaultContent.culture),
  );
  assert.throws(() =>
    validation.validateContent('culture', defaults.defaultContent.events),
  );
  const place = structuredClone(defaults.defaultContent.places[0]);
  place.coordinates = { lat: 0, lng: 0, accuracy: 'verified' };
  assert.throws(() => validation.validateContent('places', [place]));
  const page = defaults.defaultContent.pages[0];
  assert.throws(() => validation.validateContent('pages', [page, page]));
});
test('editor can save but only admin can publish; cross-origin writes are blocked', () => {
  assert.equal(typeof guards.requireRole, 'function');
  guards.requireRole('editor', 'save');
  guards.requireRole('admin', 'publish');
  assert.throws(() => guards.requireRole('editor', 'publish'));
  assert.throws(() => guards.requireRole(null, 'save'));
  guards.requireSameOrigin(
    new Request('https://club.example/api/admin/document', {
      method: 'POST',
      headers: { origin: 'https://club.example' },
    }),
  );
  assert.throws(() =>
    guards.requireSameOrigin(
      new Request('https://club.example/api/admin/document', {
        method: 'POST',
        headers: { origin: 'https://evil.example' },
      }),
    ),
  );
  assert.throws(() =>
    guards.requireSameOrigin(
      new Request('https://club.example/api/admin/document', { method: 'POST' }),
    ),
  );
  guards.requireSameOrigin(
    new Request('http://localhost:3061/api/admin/document', {
      method: 'POST',
      headers: {
        host: 'club.example',
        origin: 'https://club.example',
        'x-forwarded-proto': 'https',
      },
    }),
  );
});
test('private media access requires an exact published reference', () => {
  assert.equal(typeof validation.hasMediaReference, 'function');
  const id = '8f8e3c5c-047c-4462-b59a-cb5e48887d0e';
  assert.equal(validation.hasMediaReference({ src: '/api/media/' + id }, id), true);
  assert.equal(validation.hasMediaReference({ text: 'try /api/media/' + id }, id), false);
  assert.equal(
    validation.hasMediaReference({ src: '/api/media/' + id + '-extra' }, id),
    false,
  );
});
test('upload validation checks image signature and size instead of trusting extension', () => {
  assert.equal(typeof validation.validateImageBytes, 'function');
  const png = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489',
    'hex',
  );
  assert.equal(validation.validateImageBytes(png, 'image/png'), 'png');
  assert.throws(() =>
    validation.validateImageBytes(
      Buffer.from('<svg onload="evil()"></svg>'),
      'image/png',
    ),
  );
  assert.throws(() => validation.validateImageBytes(png, 'image/jpeg'));
  const oversized = Buffer.alloc(3 * 1024 * 1024 + 1);
  png.copy(oversized);
  assert.throws(() => validation.validateImageBytes(oversized, 'image/png'));
});
test('adding a second music track preserves its required verification marker', () => {
  const { blankClone } = require('../app/admin/editor-fields.tsx');
  const track = defaults.defaultContent.pages.find((page) => page.music?.length)
    ?.music[0];
  const added = blankClone(track);
  assert.equal(added.verification, 'spotify-title-and-artist');
  assert.equal(added.title, '');
});

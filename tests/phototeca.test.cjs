/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateContent, hasMediaReference } = require('../app/cms/validation.ts');
const { contentKeys } = require('../app/cms/types.ts');
const { defaultContent } = require('../app/cms/defaults.ts');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { SiteProvider } = require('../app/components/site-context.tsx');
const { ContentProvider } = require('../app/components/content-context.tsx');
const PhotoLibrary = require('../app/components/gallery/photo-library.tsx').default;
const photo = {
  id: 'memory-1',
  image: {
    src: '/api/media/11111111-1111-4111-8111-111111111111',
    width: 1200,
    height: 800,
    alt: { en: 'Friends at the club', es: 'Amigos en el club' },
  },
  caption: { en: 'Our first gathering', es: 'Nuestro primer encuentro' },
  album: 'Familia',
  credit: 'Juan',
};
const gallery = () => ({
  title: { en: 'The nights we keep.', es: 'Las noches que guardamos.' },
  description: { en: 'Our photo memories.', es: 'Nuestros recuerdos en fotos.' },
  musicUrl: defaultContent.settings.spotifyUrl,
  photos: [structuredClone(photo)],
});
test('gallery is a CMS collection with reviewed empty defaults, rather than fictional memories', () => {
  assert.ok(contentKeys.includes('gallery'));
  validateContent('gallery', defaultContent.gallery);
  assert.deepEqual(defaultContent.gallery.photos, []);
});
test('gallery accepts bilingual published photos and exposes only exact media references', () => {
  const g = gallery();
  assert.doesNotThrow(() => validateContent('gallery', g));
  assert.equal(hasMediaReference(g, '11111111-1111-4111-8111-111111111111'), true);
  assert.equal(hasMediaReference(g, '22222222-2222-4222-8222-222222222222'), false);
});
test('gallery publication rejects duplicate photos, missing translations and external or invalid images', () => {
  for (const mutate of [
    (g) => g.photos.push(structuredClone(photo)),
    (g) => (g.photos[0].image.alt.es = ''),
    (g) => (g.photos[0].caption.en = ''),
    (g) => (g.photos[0].image.src = 'https://example.com/image.png'),
    (g) => (g.photos[0].image.width = 0),
    (g) => (g.musicUrl = 'javascript:alert(1)'),
    (g) => (g.photos[0].album = ''),
    (g) => (g.photos = Array(601).fill(photo)),
  ]) {
    const g = gallery();
    mutate(g);
    assert.throws(() => validateContent('gallery', g));
  }
});
test('photo room renders real published records, album filters, original music controls and multi-image submissions', () => {
  const content = { ...defaultContent, gallery: gallery() };
  const html = renderToStaticMarkup(
    React.createElement(
      ContentProvider,
      { content },
      React.createElement(SiteProvider, null, React.createElement(PhotoLibrary)),
    ),
  );
  assert.match(html, /data-gallery-photo="memory-1"/);
  assert.match(html, /Our first gathering/);
  assert.match(html, /aria-label="Photo albums"/);
  assert.match(html, /<input(?=[^>]*name="images")(?=[^>]*multiple)[^>]*>/);
  assert.match(html, /<input(?=[^>]*name="consent")(?=[^>]*required)[^>]*>/);
  assert.match(html, /data-sound-playing="false"/);
  assert.doesNotMatch(html, /autoplay|editorial instructions/i);
});

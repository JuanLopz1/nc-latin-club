/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-typescript.cjs');
const test = require('node:test'), assert = require('node:assert/strict');
const { pageMetadata, siteOrigin } = require('../app/components/site-metadata.ts');

test('preview share images belong to the deployment while canonical pages retain the public domain', () => {
  const saved = { env: process.env.VERCEL_ENV, url: process.env.VERCEL_URL };
  try {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'nc-latin-club-preview.vercel.app';
    const preview = pageMetadata('Fiesta', 'Event details', '/events/latin-fiesta-2026');
    assert.equal(preview.alternates.canonical, '/events/latin-fiesta-2026');
    assert.equal(new URL(preview.openGraph.images[0].url).origin, 'https://nc-latin-club-preview.vercel.app');
    assert.equal(preview.twitter.images[0], preview.openGraph.images[0].url);
    process.env.VERCEL_ENV = 'production';
    assert.equal(new URL(pageMetadata('Home', 'Club', '/').openGraph.images[0].url).origin, siteOrigin);
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    assert.equal(new URL(pageMetadata('Home', 'Club', '/').openGraph.images[0].url).origin, siteOrigin);
  } finally {
    if (saved.env === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = saved.env;
    if (saved.url === undefined) delete process.env.VERCEL_URL; else process.env.VERCEL_URL = saved.url;
  }
});

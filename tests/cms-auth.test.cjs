/* eslint-disable @typescript-eslint/no-require-imports -- real TypeScript with mocked server request boundaries */
require('./register-typescript.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const original = Module._load;
const stored = new Map();
const writes = [];
Module._load = function (name, ...args) {
  if (name === 'server-only') return {};
  if (name === 'next/headers')
    return {
      cookies: async () => ({
        get: (key) => (stored.has(key) ? { value: stored.get(key) } : undefined),
        set: (...args) => writes.push(args),
        delete: (key) => stored.delete(key),
      }),
    };
  return original.call(this, name, ...args);
};
const { signIn, requireSession } = require('../app/cms/auth.ts');
Module._load = original;
const env = {
  SUPABASE_URL: 'https://fixture.example',
  SUPABASE_ANON_KEY: 'fixture',
  SUPABASE_SERVICE_ROLE_KEY: 'fixture',
};
async function withBackend(fn) {
  const previous = { ...process.env };
  const fetch = global.fetch;
  Object.assign(process.env, env);
  stored.clear();
  writes.length = 0;
  try {
    await fn();
  } finally {
    global.fetch = fetch;
    for (const key of Object.keys(env)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}
test('HTTPS proxy login and refresh always use Secure session cookies', () =>
  withBackend(async () => {
    global.fetch = async (url) =>
      Response.json(
        String(url).includes('/token')
          ? { access_token: 'good', refresh_token: 'good-refresh', expires_in: 3600 }
          : String(url).includes('/user')
            ? { id: 'admin', email: 'admin@example.com' }
            : [{ role: 'admin' }],
      );
    const request = new Request('http://localhost/api/admin/session', {
      headers: { host: 'club.example', 'x-forwarded-proto': 'https' },
    });
    await signIn('admin@example.com', 'fixture', request);
    assert.ok(writes.every(([, , options]) => options.secure));
    writes.length = 0;
    stored.set('nc-admin-refresh', 'good-refresh');
    await requireSession(request);
    assert.ok(writes.every(([, , options]) => options.secure));
  }));
test('expired access and revoked refresh return signed-out and clear both cookies', () =>
  withBackend(async () => {
    stored.set('nc-admin-access', 'expired');
    stored.set('nc-admin-refresh', 'revoked');
    global.fetch = async (url) =>
      Response.json(
        String(url).includes('/token')
          ? { code: 'refresh_token_not_found' }
          : { message: 'expired' },
        { status: String(url).includes('/token') ? 400 : 401 },
      );
    await assert.rejects(
      requireSession(new Request('https://club.example/api/admin/session')),
      (error) => error.status === 401,
    );
    assert.equal(stored.size, 0);
  }));
test('refresh outages stay unavailable rather than signing the visitor out', () =>
  withBackend(async () => {
    stored.set('nc-admin-refresh', 'valid');
    global.fetch = async () => {
      throw Error('fixture network unavailable');
    };
    await assert.rejects(
      requireSession(new Request('https://club.example/api/admin/session')),
      (error) => error.status === 503,
    );
    assert.equal(stored.size, 1);
  }));
test('sign-in keeps a Supabase service failure distinct from invalid credentials', () =>
  withBackend(async () => {
    global.fetch = async () =>
      Response.json(
        { message: 'private upstream details must not leak' },
        { status: 500 },
      );
    await assert.rejects(
      signIn(
        'admin@example.com',
        'fixture',
        new Request('https://club.example/api/admin/session'),
      ),
      (error) =>
        error.status === 502 &&
        !error.message.includes('password') &&
        !error.message.includes('private upstream'),
    );
    assert.equal(writes.length, 0);
  }));
test('sign-in identifies application API-key rejection without blaming the password', () =>
  withBackend(async () => {
    global.fetch = async () =>
      Response.json(
        { message: 'Invalid API key', hint: 'private key details' },
        { status: 401 },
      );
    await assert.rejects(
      signIn(
        'admin@example.com',
        'fixture',
        new Request('https://club.example/api/admin/session'),
      ),
      (error) =>
        error.status === 503 &&
        error.message.includes('API key') &&
        !error.message.includes('private key'),
    );
    assert.equal(writes.length, 0);
  }));
test('unconfirmed email gets confirmation guidance instead of a password error', () =>
  withBackend(async () => {
    global.fetch = async () =>
      Response.json(
        { code: 400, error_code: 'email_not_confirmed', msg: 'Email not confirmed' },
        { status: 400 },
      );
    await assert.rejects(
      signIn(
        'admin@example.com',
        'fixture',
        new Request('https://club.example/api/admin/session'),
      ),
      (error) => error.status === 403 && error.message.includes('confirm'),
    );
    assert.equal(writes.length, 0);
  }));
test('sign-in rate limits remain retryable rate limits', () =>
  withBackend(async () => {
    global.fetch = async () =>
      Response.json({ code: 'over_request_rate_limit' }, { status: 429 });
    await assert.rejects(
      signIn(
        'admin@example.com',
        'fixture',
        new Request('https://club.example/api/admin/session'),
      ),
      (error) => error.status === 429,
    );
    assert.equal(writes.length, 0);
  }));
test('invalid credentials still have a generic credential error and no session', () =>
  withBackend(async () => {
    global.fetch = async () =>
      Response.json(
        {
          code: 400,
          error_code: 'invalid_credentials',
          msg: 'Invalid login credentials',
        },
        { status: 400 },
      );
    await assert.rejects(
      signIn(
        'admin@example.com',
        'fixture',
        new Request('https://club.example/api/admin/session'),
      ),
      (error) =>
        error.status === 401 &&
        error.message === 'Email or password could not be verified.',
    );
    assert.equal(writes.length, 0);
  }));
test('disabled email sign-in identifies the provider setting', () =>
  withBackend(async () => {
    global.fetch = async () =>
      Response.json({ error_code: 'email_provider_disabled' }, { status: 400 });
    await assert.rejects(
      signIn(
        'admin@example.com',
        'fixture',
        new Request('https://club.example/api/admin/session'),
      ),
      (error) => error.status === 503 && error.message.includes('Email provider'),
    );
    assert.equal(writes.length, 0);
  }));
test('a Supabase Data API URL resolves auth at the project root', () =>
  withBackend(async () => {
    process.env.SUPABASE_URL = 'https://fixture.example/rest/v1/';
    const urls = [];
    global.fetch = async (url) => {
      urls.push(String(url));
      return Response.json(
        String(url).includes('/token')
          ? { access_token: 'good', refresh_token: 'good-refresh', expires_in: 3600 }
          : String(url).includes('/user')
            ? { id: 'admin', email: 'admin@example.com' }
            : [{ role: 'admin' }],
      );
    };
    await signIn(
      'admin@example.com',
      'fixture',
      new Request('https://club.example/api/admin/session'),
    );
    assert.equal(urls[0], 'https://fixture.example/auth/v1/token?grant_type=password');
    assert.equal(urls[1], 'https://fixture.example/auth/v1/user');
    assert.ok(urls[2].startsWith('https://fixture.example/rest/v1/cms_members?'));
    assert.equal(writes.length, 2);
  }));

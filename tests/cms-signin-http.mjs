// Run against a production Next server using cms-rest-fixture.mjs.
import assert from 'node:assert/strict';
const base = process.env.CHECK_URL || 'http://127.0.0.1:3066';
const cases = [
  ['key-rejection', 503, 'API key'],
  ['unconfirmed', 403, 'confirmation'],
  ['provider-disabled', 503, 'Email provider'],
  ['rate-limit', 429, 'Too many'],
  ['upstream-failure', 502, 'content service'],
  ['missing-user', 401, 'Email or password'],
];
for (const [name, status, message] of cases) {
  const response = await fetch(base + '/api/admin/session', {
    method: 'POST',
    headers: { origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: name + '@example.com',
      password: 'fixture-only-password',
    }),
  });
  assert.equal(response.status, status, name);
  const result = await response.json();
  assert.ok(result.error.includes(message), name);
  assert.ok(!result.error.includes('private fixture'));
  assert.equal(response.headers.getSetCookie().length, 0);
}
const login = await fetch(base + '/api/admin/session', {
  method: 'POST',
  headers: { origin: base, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: 'fixture-only-password' }),
});
assert.equal(login.status, 200);
assert.equal((await login.json()).role, 'admin');
assert.equal(login.headers.getSetCookie().length, 2);
console.log(
  'PASS production sign-in HTTP: distinct credentials, confirmation, API key, rate limits and service failures; valid admin still signs in. Local contract fixture.',
);

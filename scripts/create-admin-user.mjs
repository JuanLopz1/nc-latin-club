// Run locally with server credentials; never put a password in this file.
const [username, email] = process.argv.slice(2);
const url = process.env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let password = process.env.CMS_NEW_USER_PASSWORD;
delete process.env.CMS_NEW_USER_PASSWORD;

async function request(path, options = {}) {
  const response = await fetch(`${url}${path}`, {
    ...options,
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase returned ${response.status}. No credentials were logged.`);
  }
  return response.status === 204 ? null : response.json();
}

try {
  if (!username || !/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(username)) {
    throw new Error('Provide a lowercase username with 3 to 32 characters.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Provide an email address as the second argument.');
  }
  if (!url || !serviceKey || !password) {
    throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and CMS_NEW_USER_PASSWORD privately.');
  }
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
    throw new Error('Use an HTTPS Supabase URL.');
  }
  // This also confirms the username migration exists before creating an account.
  const members = await request(
    `/rest/v1/cms_members?username=eq.${encodeURIComponent(username)}&select=user_id&limit=1`,
  );
  if (members.length) throw new Error('This username is already assigned. No account was changed.');
  const user = await request('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    }),
  });
  password = undefined;
  if (!user.id) throw new Error('Supabase did not return a user ID.');
  try {
    await request('/rest/v1/cms_members', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ user_id: user.id, role: 'admin', username }),
    });
  } catch {
    throw new Error(`The account was created, but admin membership was not confirmed. Assign the membership in Supabase for user ${user.id}; do not recreate the account.`);
  }
  console.log(`Admin account created for ${username}. Sign in with the username or email.`);
} catch (error) {
  password = undefined;
  console.error(error instanceof Error ? error.message : 'Account creation failed.');
  process.exitCode = 1;
}

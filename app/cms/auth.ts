import 'server-only';
import { cookies } from 'next/headers';
import { backendFetch, backendConfig } from './backend';
import { CmsError, externalProtocol, requireRole } from './security';
import type { EditorRole } from './types';
const accessCookie = 'nc-admin-access';
const refreshCookie = 'nc-admin-refresh';
type Tokens = { access_token: string; refresh_token: string; expires_in: number };
export async function setSession(tokens: Tokens, secure: boolean) {
  const jar = await cookies();
  const options = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };
  jar.set(accessCookie, tokens.access_token, {
    ...options,
    maxAge: Math.min(tokens.expires_in, 3600),
  });
  jar.set(refreshCookie, tokens.refresh_token, { ...options, maxAge: 7 * 24 * 3600 });
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(accessCookie);
  jar.delete(refreshCookie);
}
async function identity(token: string) {
  const user = await (await backendFetch('/auth/v1/user', {}, token)).json();
  if (!user.id) throw new CmsError(401, 'Please sign in.');
  const rows = await (
    await backendFetch(
      `/rest/v1/cms_members?user_id=eq.${encodeURIComponent(user.id)}&select=role`,
      {},
      token,
    )
  ).json();
  const role = rows[0]?.role as EditorRole | undefined;
  requireRole(role ?? null, 'save');
  return {
    token,
    user: { id: user.id as string, email: user.email as string },
    role: role!,
  };
}
export async function requireSession(request: Request) {
  if (!backendConfig()) throw new CmsError(503, 'Supabase is not connected yet.');
  const jar = await cookies();
  const access = jar.get(accessCookie)?.value;
  const refresh = jar.get(refreshCookie)?.value;
  if (access) {
    try {
      return await identity(access);
    } catch (error) {
      if (!(error instanceof CmsError) || error.status !== 401) throw error;
    }
  }
  if (!refresh) throw new CmsError(401, 'Please sign in.');
  let tokens: Tokens;
  try {
    tokens = await (
      await backendFetch('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      })
    ).json();
  } catch (error) {
    if (error instanceof CmsError && error.status === 401) {
      await clearSession();
      throw new CmsError(401, 'Please sign in again.');
    }
    throw error;
  }
  const session = await identity(tokens.access_token);
  await setSession(tokens, externalProtocol(request) === 'https');
  return session;
}
export async function signIn(email: string, password: string, request: Request) {
  const tokens = (await (
    await backendFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  ).json()) as Tokens;
  const session = await identity(tokens.access_token);
  await setSession(tokens, externalProtocol(request) === 'https');
  return session;
}

import { backendConfig, backendFetch } from '../../../cms/backend';
import { clearSession, requireSession, signIn } from '../../../cms/auth';
import { CmsError, requireSameOrigin, safeError } from '../../../cms/security';
export async function GET(request: Request) {
  if (!backendConfig())
    return Response.json(
      { configured: false, user: null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  try {
    const { user, role } = await requireSession(request);
    return Response.json(
      { configured: true, user, role },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof CmsError && [401, 403].includes(error.status))
      return Response.json(
        { configured: true, user: null },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    return safeError(error);
  }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const text = await request.text();
    if (text.length > 8192) throw new CmsError(413, 'Request too large.');
    const { email, password } = JSON.parse(text);
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    )
      throw new CmsError(400, 'Username or email and password are required.');
    const { user, role } = await signIn(email.trim(), password, request);
    return Response.json(
      { configured: true, user, role },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return safeError(error);
  }
}
export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    try {
      const { token } = await requireSession(request);
      await backendFetch('/auth/v1/logout', { method: 'POST' }, token);
    } catch {}
    await clearSession();
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return safeError(error);
  }
}

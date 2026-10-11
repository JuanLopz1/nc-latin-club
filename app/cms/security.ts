import type { EditorRole } from './types';
export class CmsError extends Error { constructor(public status: number, message: string) { super(message); } }
export function requireRole(role: EditorRole | null, action: 'save' | 'publish') {
  if (!role) throw new CmsError(403, 'Editorial access is required.');
  if (action === 'publish' && role !== 'admin') throw new CmsError(403, 'Only an administrator can publish.');
}
export function externalProtocol(request: Request) {
  return request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.slice(0,-1);
}
export function requireSameOrigin(request: Request) {
  // Next may use an internal hostname; compare with the browser-facing Host.
  const url=new URL(request.url),host=request.headers.get('host') ?? url.host;
  const protocol=externalProtocol(request);
  if (!['http','https'].includes(protocol) || request.headers.get('origin') !== `${protocol}://${host}` || request.headers.get('sec-fetch-site') === 'cross-site') throw new CmsError(403, 'Cross-origin request rejected.');
}
export function safeError(error: unknown) {
  return Response.json({ error: error instanceof CmsError ? error.message : 'The operation could not be completed. Please try again.' }, { status: error instanceof CmsError ? error.status : 500, headers: { 'Cache-Control': 'no-store' } });
}

import { requireSession } from '../../../cms/auth';
import { backendFetch } from '../../../cms/backend';
import { safeError } from '../../../cms/security';
export async function GET(request: Request) {
  try {
    const { token } = await requireSession(request);
    const response = await backendFetch(
      '/rest/v1/photo_submissions?status=eq.pending&select=id,photos,status,created_at&order=created_at.desc&limit=160',
      {},
      token,
    );
    return Response.json(await response.json(), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return safeError(error);
  }
}

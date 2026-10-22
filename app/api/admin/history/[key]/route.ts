import { requireSession } from '../../../../cms/auth';
import { backendFetch } from '../../../../cms/backend';
import { contentKeys, type ContentKey } from '../../../../cms/types';
import { CmsError, safeError } from '../../../../cms/security';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { token } = await requireSession(request);
    const { key } = await params;
    if (!contentKeys.includes(key as ContentKey))
      throw new CmsError(404, 'Unknown collection.');
    const response = await backendFetch(
      `/rest/v1/cms_history?key=eq.${key}&select=id,key,content,action,version,created_at&order=id.desc&limit=30`,
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

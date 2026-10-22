import { requireSession } from '../../../../cms/auth';
import { backendFetch, rpc } from '../../../../cms/backend';
import { defaultContent } from '../../../../cms/defaults';
import { contentKeys, type ContentKey } from '../../../../cms/types';
import { validateContent } from '../../../../cms/validation';
import {
  CmsError,
  requireRole,
  requireSameOrigin,
  safeError,
} from '../../../../cms/security';
type Context = { params: Promise<{ key: string }> };
function checked(key: string): ContentKey {
  if (!contentKeys.includes(key as ContentKey))
    throw new CmsError(404, 'Unknown collection.');
  return key as ContentKey;
}
export async function GET(request: Request, { params }: Context) {
  try {
    const { token } = await requireSession(request);
    const key = checked((await params).key);
    const rows = await (
      await backendFetch(
        `/rest/v1/cms_documents?key=eq.${key}&select=key,draft,published,version,published_version,updated_at`,
        {},
        token,
      )
    ).json();
    const document = rows[0] ?? {
      key,
      draft: defaultContent[key],
      published: null,
      version: 0,
      published_version: 0,
      updated_at: null,
    };
    if (key === 'settings') {
      document.draft = {
        familiaPhotoSrc: '',
        familiaPhotoAlt: { en: '', es: '' },
        ...document.draft,
      };
    }
    return Response.json(
      document,
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return safeError(error);
  }
}
export async function PUT(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request);
    const { token, role } = await requireSession(request);
    const key = checked((await params).key);
    const text = await request.text();
    if (text.length > 1_600_000) throw new CmsError(413, 'Collection too large.');
    const body = JSON.parse(text);
    if (
      !['save', 'publish'].includes(body.action) ||
      !Number.isSafeInteger(body.version) ||
      body.version < 0
    )
      throw new CmsError(400, 'Invalid action or revision.');
    requireRole(role, body.action);
    // Drafts may contain incomplete copy, but must remain bounded JSON.
    if (body.content === undefined || JSON.stringify(body.content).length > 1_500_000)
      throw new CmsError(400, 'Invalid draft.');
    if (body.action === 'publish') {
      try {
        validateContent(key, body.content);
      } catch (error) {
        throw new CmsError(
          422,
          error instanceof Error ? error.message : 'Invalid content.',
        );
      }
    }
    const result = await rpc(
      'cms_write',
      {
        p_key: key,
        p_content: body.content,
        p_version: body.version,
        p_publish: body.action === 'publish',
      },
      token,
    );
    return Response.json(Array.isArray(result) ? result[0] : result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return safeError(error);
  }
}

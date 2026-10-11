import { requireSession } from '../../../cms/auth';
import { backendFetch } from '../../../cms/backend';
import { getPublishedContent } from '../../../cms/public-content';
import { hasMediaReference } from '../../../cms/validation';
import { CmsError, safeError } from '../../../cms/security';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params;
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) throw new CmsError(404,'Image not found.');
    const published=hasMediaReference(await getPublishedContent(),id);
    if(!published) {try{await requireSession(request);}catch{throw new CmsError(404,'Image not found.');}}
    const response=await backendFetch(`/storage/v1/object/authenticated/club-media/${id}.webp`,{},undefined,true);
    return new Response(await response.arrayBuffer(),{headers:{'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
  }catch(error){return safeError(error);}
}

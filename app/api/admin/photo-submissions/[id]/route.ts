import {requireSession} from '../../../../cms/auth';
import {rpc} from '../../../../cms/backend';
import {defaultContent} from '../../../../cms/defaults';
import {limitedBody} from '../../../../cms/photo-service';
import {CmsError,requireSameOrigin,safeError} from '../../../../cms/security';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 requireSameOrigin(request);const {token}=await requireSession(request),{id}=await params;
 if(!/^[a-f0-9-]{36}$/.test(id))throw new CmsError(400,'Invalid submission.');
 const body=JSON.parse(Buffer.from(await limitedBody(request,4096)).toString());
 if(!['approve','reject'].includes(body.action)||!Number.isSafeInteger(body.version)||body.version<0)throw new CmsError(400,'Invalid action or revision.');
 const rows=await rpc('gallery_moderate',{p_id:id,p_action:body.action,p_version:body.version},token);
 return Response.json(rows[0]??{key:'gallery',draft:defaultContent.gallery,published:null,version:0,published_version:0,updated_at:null},{headers:{'Cache-Control':'no-store'}});
}catch(error){return safeError(error);}}

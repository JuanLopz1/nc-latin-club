import sharp from 'sharp';
import {backendFetch} from '../../../../../cms/backend';
import {checkOpenSubmission,checkPhotoToken,limitedBody,maxPhotoBytes,photoSlotId,serviceRpc,sanitizePhoto,uploadProof} from '../../../../../cms/photo-service';
import {CmsError,requireSameOrigin,safeError} from '../../../../../cms/security';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{
 requireSameOrigin(request);const {id}=await params;checkPhotoToken(request.headers.get('x-photo-token'),id);
 const slot=Number(request.headers.get('x-photo-slot'));if(!Number.isInteger(slot)||slot<0||slot>7)throw new CmsError(422,'Use up to 8 images.');
 await checkOpenSubmission(id);
 const body=await limitedBody(request,maxPhotoBytes+8192),form=await new Response(body as BodyInit,{headers:{'Content-Type':request.headers.get('content-type')??''}}).formData(),file=form.get('image');
 if(!(file instanceof File))throw new CmsError(422,'Choose an image.');
 const image=await sanitizePhoto(file),mediaId=await serviceRpc('gallery_claim_slot',{p_id:id,p_slot:slot,p_media_id:photoSlotId(id,slot)}) as string,path=`/storage/v1/object/club-media/${mediaId}.webp`;
 let dimensions={width:image.width,height:image.height};
 try{await backendFetch(path,{method:'POST',headers:{'Content-Type':'image/webp'},body:new Uint8Array(image.output)},undefined,true);}
 catch(error){
   // Immutable slot: a network retry reuses the saved image; never overwrites it.
   try{const existing=await backendFetch(`/storage/v1/object/authenticated/club-media/${mediaId}.webp`,{},undefined,true);const metadata=await sharp(Buffer.from(await existing.arrayBuffer())).metadata();dimensions={width:metadata.width!,height:metadata.height!};}catch{throw error;}
 }
 const result={src:`/api/media/${mediaId}`,...dimensions};return Response.json({...result,proof:uploadProof(id,result)},{headers:{'Cache-Control':'no-store'}});
}catch(error){return safeError(error);}}

import 'server-only';
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import sharp from 'sharp';
import {backendConfig,backendFetch} from './backend';
import {CmsError} from './security';
import {validateImageBytes} from './validation';
import type {EntryImage} from '../components/events/event-types';
export const maxPhotoBytes=3*1024*1024;
export async function limitedBody(request:Request,limit:number):Promise<Uint8Array> {
  if(Number(request.headers.get('content-length'))>limit)throw new CmsError(413,'Payload too large.');
  const reader=request.body?.getReader();if(!reader)throw new CmsError(400,'Missing request.');
  const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new CmsError(413,'Payload too large.');}chunks.push(value);}}finally{reader.releaseLock();}
  return Buffer.concat(chunks,size);
}
function signature(value:string){const config=backendConfig();if(!config)throw new CmsError(503,'Uploads unavailable.');return createHmac('sha256',config.service).update('phototeca-v1:'+value).digest('hex');}
function equal(a:string,b:string){return /^[a-f0-9]{64}$/.test(a)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export function makePhotoToken(value:string){return `${value}.${signature(value)}`;}
export function checkPhotoToken(token:unknown,expectedId?:string) {
  if(typeof token!=='string'||token.length>160)throw new CmsError(400,'Invalid form.');
  const parts=token.split('.');if(parts.length!==3)throw new CmsError(400,'Invalid form.');
  const [id,timestamp,mac]=parts,value=`${id}.${timestamp}`,age=Date.now()-Number(timestamp);
  if(!/^[a-f0-9-]{36}$/.test(id)||!equal(mac,signature(value))||!Number.isFinite(age)||age<2000||age>3600000||expectedId&&id!==expectedId)throw new CmsError(400,'Form expired. Refresh and try again.');
  return id;
}
export function photoChallenge(){return makePhotoToken(`${randomUUID()}.${Date.now()}`);}
export function photoFingerprint(request:Request){const ip=request.headers.get('x-vercel-forwarded-for')??request.headers.get('x-real-ip')??request.headers.get('x-forwarded-for')?.split(',')[0]??'unknown';return signature(`source:${new Date().toISOString().slice(0,10)}:${ip.trim()}`);}
export async function galleryReady(){if(!backendConfig())return false;try{await backendFetch('/rest/v1/photo_submissions?select=id&limit=0',{},undefined,true);return true;}catch{return false;}}
export async function serviceRpc(name:string,body:unknown) {
  // Quota errors are not authentication failures; translate their exact SQL code.
  const config=backendConfig();if(!config)throw new CmsError(503,'Uploads unavailable.');
  let response:Response;try{response=await fetch(`${config.url}/rest/v1/rpc/${name}`,{method:'POST',cache:'no-store',signal:AbortSignal.timeout(10000),headers:{apikey:config.service,Authorization:`Bearer ${config.service}`,'Content-Type':'application/json'},body:JSON.stringify(body)});}catch{throw new CmsError(503,'Uploads unavailable.');}
  const result=await response.json().catch(()=>null);
  if(!response.ok)throw new CmsError(result?.code==='P0001'?429:result?.code==='23514'?422:503,result?.code==='P0001'?'Please try again later.':'Upload could not be completed.');
  return result;
}
export async function checkOpenSubmission(id:string){
 const rows=await(await backendFetch(`/rest/v1/photo_submissions?id=eq.${id}&select=id,status,created_at`,{},undefined,true)).json();
 if(rows[0]?.status!=='uploading'||Date.now()-Date.parse(rows[0].created_at)>3600000)throw new CmsError(409,'This submission is no longer accepting images.');
}
export function uploadProof(id:string,image:Pick<EntryImage,'src'|'width'|'height'>){return signature(`image:${id}:${image.src}:${image.width}:${image.height}`);}
export function verifyUploadProof(id:string,image:Pick<EntryImage,'src'|'width'|'height'>,proof:unknown){if(typeof proof!=='string'||!equal(proof,uploadProof(id,image)))throw new CmsError(422,'Invalid uploaded image.');}
export async function sanitizePhoto(file:File) {
 if(file.size>maxPhotoBytes)throw new CmsError(413,'Image exceeds 3 MiB.');
 const bytes=Buffer.from(await file.arrayBuffer());
 try{validateImageBytes(bytes,file.type);}catch{throw new CmsError(422,'Choose a valid JPEG, PNG or WebP image.');}
 let output:Buffer;try{output=await sharp(bytes,{limitInputPixels:40_000_000}).rotate().webp({quality:88}).toBuffer();}catch{throw new CmsError(422,'The image could not be decoded.');}
 if(output.length>maxPhotoBytes)throw new CmsError(413,'The processed image exceeds 3 MiB.');
 const {width,height}=await sharp(output).metadata();return {output,width:width!,height:height!};
}
export function photoSlotId(submission:string,slot:number){const hex=signature(`slot:${submission}:${slot}`).slice(0,32);return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20)}`;}

export async function cleanupPhotoUploads(){
 const rows=await serviceRpc('gallery_cleanup_candidates',{}) as {id:string;uploads:{slot:number;media_id:string}[]}[];
 for(const row of rows){const prefixes=row.uploads.map(upload=>`${upload.media_id}.webp`);if(prefixes.length)await backendFetch('/storage/v1/object/club-media',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes})},undefined,true);await serviceRpc('gallery_clear_uploads',{p_id:row.id});}
}

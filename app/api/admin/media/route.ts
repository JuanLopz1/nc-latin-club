import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { requireSession } from '../../../cms/auth';
import { backendFetch } from '../../../cms/backend';
import { validateImageBytes } from '../../../cms/validation';
import { CmsError, requireSameOrigin, safeError } from '../../../cms/security';
export async function POST(request:Request) {
  try {
    requireSameOrigin(request); await requireSession(request);
    if(Number(request.headers.get('content-length'))>3*1024*1024+8192) throw new CmsError(413,'Image exceeds 3 MiB.');
    const file=(await request.formData()).get('image');
    if(!(file instanceof File) || file.size>3*1024*1024) throw new CmsError(400,'Choose a JPEG, PNG or WebP image up to 3 MiB.');
    const bytes=Buffer.from(await file.arrayBuffer());
    try {validateImageBytes(bytes,file.type);} catch(error){throw new CmsError(422,error instanceof Error?error.message:'Invalid image.');}
    // Decode and re-encode: reject corrupt files and remove metadata/embedded payloads.
    const image=sharp(bytes,{limitInputPixels:40_000_000}).rotate();
    let output:Buffer;
    try {output=await image.webp({quality:90}).toBuffer();}catch{throw new CmsError(422,'The image could not be decoded.');}
    if(output.length>3*1024*1024) throw new CmsError(413,'The processed image exceeds 3 MiB. Choose a smaller image.');
    const metadata=await sharp(output).metadata(), id=randomUUID();
    await backendFetch(`/storage/v1/object/club-media/${id}.webp`,{method:'POST',headers:{'Content-Type':'image/webp'},body:new Uint8Array(output)},undefined,true);
    return Response.json({src:`/api/media/${id}`,width:metadata.width,height:metadata.height},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return safeError(error);}
}

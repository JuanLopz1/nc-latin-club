import {
  checkPhotoToken,
  limitedBody,
  serviceRpc,
  verifyUploadProof,
} from '../../../../cms/photo-service';
import { validateContent } from '../../../../cms/validation';
import { defaultContent } from '../../../../cms/defaults';
import { CmsError, requireSameOrigin, safeError } from '../../../../cms/security';
import type { GalleryPhoto } from '../../../../components/gallery/gallery-types';
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireSameOrigin(request);
    const { id } = await params;
    checkPhotoToken(request.headers.get('x-photo-token'), id);
    const data = JSON.parse(Buffer.from(await limitedBody(request, 24000)).toString());
    if (
      data.consent !== true ||
      typeof data.caption !== 'string' ||
      !data.caption.trim() ||
      data.caption.length > 500 ||
      typeof data.album !== 'string' ||
      !data.album.trim() ||
      data.album.length > 80 ||
      typeof data.credit !== 'string' ||
      data.credit.length > 100 ||
      !Array.isArray(data.images) ||
      !data.images.length ||
      data.images.length > 8
    )
      throw new CmsError(422, 'Complete the caption and photo permissions.');
    const seen = new Set<string>();
    const photos: GalleryPhoto[] = data.images.map(
      (
        image: { src: string; width: number; height: number; proof: string },
        i: number,
      ) => {
        verifyUploadProof(id, image, image.proof);
        if (seen.has(image.src)) throw new CmsError(422, 'Duplicate image.');
        seen.add(image.src);
        const caption = data.caption.trim();
        return {
          id: `memory-${id}-${i + 1}`,
          image: {
            src: image.src,
            width: image.width,
            height: image.height,
            alt: { en: caption, es: caption },
          },
          caption: { en: caption, es: caption },
          album: data.album.trim(),
          ...(data.credit.trim() ? { credit: data.credit.trim() } : {}),
        };
      },
    );
    try {
      validateContent('gallery', { ...defaultContent.gallery, photos });
    } catch {
      throw new CmsError(422, 'Invalid photo details.');
    }
    await serviceRpc('gallery_finish', { p_id: id, p_photos: photos, p_consent: true });
    return Response.json(
      { submitted: true },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return safeError(error);
  }
}

import { randomUUID } from 'node:crypto';
import {
  cleanupPhotoUploads,
  checkPhotoToken,
  galleryReady,
  limitedBody,
  photoChallenge,
  photoFingerprint,
  makePhotoToken,
  serviceRpc,
} from '../../../cms/photo-service';
import { CmsError, requireSameOrigin, safeError } from '../../../cms/security';
export async function GET() {
  const available = await galleryReady();
  return Response.json(
    { available, challenge: available ? photoChallenge() : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const data = JSON.parse(Buffer.from(await limitedBody(request, 4096)).toString());
    if (data.website || data.consent !== true)
      throw new CmsError(422, 'Confirm photo permission.');
    checkPhotoToken(data.challenge);
    await cleanupPhotoUploads();
    const id = randomUUID();
    await serviceRpc('gallery_reserve', {
      p_id: id,
      p_fingerprint: photoFingerprint(request),
    });
    // Preserve the verified form's age so sequential image requests can start now.
    const timestamp = String(data.challenge).split('.')[1];
    return Response.json(
      { id, token: makePhotoToken(`${id}.${timestamp}`) },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return safeError(error);
  }
}

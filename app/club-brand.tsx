import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

const logoFile = readFile(join(process.cwd(), 'public/images/brand/nc-latin-club.png'));

export async function clubLogoSource() {
  return `data:image/png;base64,${(await logoFile).toString('base64')}`;
}

export async function clubIcon(size: number) {
  const logo = await clubLogoSource();

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#0c101b',
        borderRadius: size / 6,
      }}
    >
      {/* ImageResponse requires a native image element, not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="NC LATIN CLUB" width={size} height={size} />
    </div>,
    { width: size, height: size },
  );
}

import { ImageResponse } from 'next/og';
import { clubLogoSource } from './club-brand';

export const alt = 'NC LATIN CLUB — Latin roots. Niagara energy.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await clubLogoSource();

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '60px 72px',
        gap: 64,
        color: '#f6f5ef',
        background: '#0c101b',
        borderBottom: '12px solid #ffe06a',
      }}
    >
      {/* ImageResponse requires a native image element, not next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="NC LATIN CLUB logo" width={430} height={430} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -3,
          }}
        >
          <span>NC LATIN</span>
          <span style={{ color: '#ffe06a' }}>CLUB</span>
        </div>
        <div style={{ fontSize: 27, color: '#76dbe3' }}>Latin roots. Niagara energy.</div>
        <div style={{ fontSize: 23, color: '#b3bdd1', marginTop: 12 }}>
          nc-latin-club.vercel.app
        </div>
      </div>
    </div>,
    size,
  );
}

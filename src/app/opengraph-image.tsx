import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

// Dynamically generated Open Graph image (no static asset needed).
export const runtime = 'edge';
export const alt = `${siteConfig.shortName} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at 30% 20%, #FE2C55 0%, transparent 45%), radial-gradient(circle at 80% 70%, #25F4EE 0%, transparent 45%), #0A0A0B',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 110,
            height: 110,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #FE2C55, #25F4EE)',
            fontSize: 56,
            fontWeight: 900,
          }}
        >
          VG
        </div>
        <div style={{ marginTop: 36, fontSize: 76, fontWeight: 900 }}>
          Vadász Gyula
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 34,
            color: '#9A9AA0',
            maxWidth: 900,
            textAlign: 'center',
          }}
        >
          {siteConfig.tagline}
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: '#25F4EE' }}>
          @{siteConfig.creatorHandle}
        </div>
      </div>
    ),
    { ...size },
  );
}

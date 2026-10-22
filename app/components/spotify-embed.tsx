'use client';
import { useEffect, useRef } from 'react';
export default function SpotifyEmbed({
  src,
  title,
  height = 352,
}: {
  src: string;
  title: string;
  height?: number;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    const visibility = () => {
      iframe.src = document.hidden ? 'about:blank' : src;
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      iframe.src = 'about:blank';
    };
  }, [src]);
  return (
    <iframe
      ref={frame}
      src={src}
      title={title}
      height={height}
      loading="lazy"
      allow="encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

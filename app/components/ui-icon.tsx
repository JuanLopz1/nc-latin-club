import type { SVGProps } from 'react';

const paths = {
  sparkle: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z',
  music: 'M9 18V5l12-2v13M9 8l12-2M9 18a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Zm12-2a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3Z',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  diamond: 'm12 3 9 9-9 9-9-9Z',
  external: 'M7 17 19 5M7 5h12v12',
  left: 'M20 12H4m7-7-7 7 7 7',
  right: 'M4 12h16m-7-7 7 7-7 7',
  up: 'M12 20V4m-7 7 7-7 7 7',
  down: 'M12 4v16m-7-7 7 7 7-7',
  chevron: 'm6 9 6 6 6-6',
  play: 'm8 4 12 8-12 8Z',
  pause: 'M8 4v16M16 4v16',
  dot: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  undo: 'M3 10h11a7 7 0 0 1 0 14M3 10l6-6M3 10l6 6',
};
export type IconName = keyof typeof paths;
export default function UiIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="ui-icon" {...props}><path d={paths[name]} /></svg>;
}

'use client';
import { useEffect, type RefObject } from 'react';

// Visible SSR content is progressively enhanced after hydration. Each reveal runs once.
export function useHomeMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let reveal: IntersectionObserver | undefined, mutations: MutationObserver | undefined, frame = 0;
    const image = element.querySelector<HTMLElement>('[data-hero-parallax]');
    const finishWaiting = () => element.querySelectorAll<HTMLElement>('[data-reveal-state="waiting"]').forEach(node => { node.dataset.revealState = 'visible'; });
    const parallax = () => {
      frame = 0;
      if (!image || document.hidden || preference.matches) return;
      const box = image.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      const offset = Math.max(-12, Math.min(12, (innerHeight / 2 - box.top - box.height / 2) / innerHeight * 20));
      image.style.setProperty('--hero-drift', `${offset.toFixed(2)}px`);
    };
    const scrolled = () => { if (!frame && !preference.matches) frame = requestAnimationFrame(parallax); };
    const configure = () => {
      reveal?.disconnect(); mutations?.disconnect();
      cancelAnimationFrame(frame); frame = 0;
      if (preference.matches) { finishWaiting(); image?.style.removeProperty('--hero-drift'); return; }
      reveal = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.revealState = 'visible';
          reveal?.unobserve(entry.target);
        }
      }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
      const scan = () => {
        for (const node of element.querySelectorAll<HTMLElement>('main > section:not(:first-child), [data-reveal], article')) {
          if (node.dataset.revealState) continue;
          const box = node.getBoundingClientRect();
          if (box.top < innerHeight - 30) node.dataset.revealState = 'visible';
          else { node.dataset.revealState = 'waiting'; reveal?.observe(node); }
        }
      };
      scan(); mutations = new MutationObserver(scan); mutations.observe(element, { childList: true, subtree: true });
      scrolled();
    };
    configure(); preference.addEventListener('change', configure);
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => {
      reveal?.disconnect(); mutations?.disconnect(); cancelAnimationFrame(frame); finishWaiting();
      preference.removeEventListener('change', configure); window.removeEventListener('scroll', scrolled);
      image?.style.removeProperty('--hero-drift');
    };
  }, [root]);
}

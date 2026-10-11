'use client';
import { useEffect, useRef, type RefObject } from 'react';
import { getReducedMotion, useReducedMotion } from './motion-preference';

// SSR stays readable; hydration arms individual text and artwork only until first seen.
export function useHomeMotion(root: RefObject<HTMLDivElement | null>) {
  const reduced = useReducedMotion();
  const seen = useRef(new WeakSet<Element>());
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const reducedNow = getReducedMotion();
    const image = element.querySelector<HTMLElement>('[data-hero-parallax]');
    let frame = 0, arrivalFrame = 0, observerReady = false;
    const tracked = new WeakSet<Element>();
    const pending = new Set<HTMLElement>();
    const finishWaiting = () => element.querySelectorAll<HTMLElement>('[data-reveal-state="waiting"]').forEach(node => { node.dataset.revealState = 'visible'; });
    const parallax = () => {
      frame = 0;
      if (!image || document.hidden || reducedNow) return;
      const box = image.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      const offset = Math.max(-12, Math.min(12, (innerHeight / 2 - box.top - box.height / 2) / innerHeight * 20));
      image.style.setProperty('--hero-drift', `${offset.toFixed(2)}px`);
    };
    const scrolled = () => { if (!frame && !reducedNow) frame = requestAnimationFrame(parallax); };
    if (reducedNow) { finishWaiting(); image?.style.removeProperty('--hero-drift'); return; }
    const reveal = new IntersectionObserver(entries => {
      let index = 0;
      for (const entry of entries) if (entry.isIntersecting && entry.intersectionRatio >= .18) {
        const node = entry.target as HTMLElement;
        if (!node.closest('section:first-child')) node.style.setProperty('--reveal-delay', `${Math.min(index++, 3) * 100}ms`);
        node.dataset.revealState = 'visible'; seen.current.add(node); reveal.unobserve(node);
      }
    }, { threshold: .18, rootMargin: '0px 0px -80px 0px' });
    const scan = () => {
      for (const node of element.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main h4, main p, [data-reveal]')) {
        if (tracked.has(node) || node.parentElement?.closest('[data-reveal]')) continue;
        tracked.add(node);
        // Text above the viewport has already been passed; don't hide it retroactively.
        if (seen.current.has(node) || node.getBoundingClientRect().bottom <= 0) {
          node.dataset.revealState = 'visible'; seen.current.add(node);
        } else {
          node.dataset.revealState = 'waiting';
          if (observerReady) reveal.observe(node); else pending.add(node);
        }
      }
    };
    scan();
    // Paint the starting state before observing initial viewport elements.
    arrivalFrame = requestAnimationFrame(() => {
      arrivalFrame = requestAnimationFrame(() => {
        observerReady = true; pending.forEach(node => reveal.observe(node)); pending.clear();
      });
    });
    const mutations = new MutationObserver(scan);
    mutations.observe(element, { childList: true, subtree: true });
    const focused = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      const children = event.target.matches('a,button,input,select,textarea') ? [...event.target.querySelectorAll<HTMLElement>('[data-reveal-state="waiting"]')] : [];
      const nodes = [event.target.closest<HTMLElement>('[data-reveal-state="waiting"]'), ...children];
      for (const node of nodes) if (node) { node.dataset.revealState = 'visible'; seen.current.add(node); reveal.unobserve(node); }
    };
    element.addEventListener('focusin', focused);
    window.addEventListener('scroll', scrolled, { passive: true }); scrolled();
    return () => {
      reveal.disconnect(); mutations.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(arrivalFrame); finishWaiting();
      element.removeEventListener('focusin', focused); window.removeEventListener('scroll', scrolled);
      image?.style.removeProperty('--hero-drift');
    };
  }, [root, reduced]);
}

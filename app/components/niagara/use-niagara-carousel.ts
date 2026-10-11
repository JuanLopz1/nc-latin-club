'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type MouseEvent, type DragEvent, type FocusEvent } from 'react';
import { useReducedMotion } from '../motion-preference';

const subscribeVisibility = (callback: () => void) => {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
};
const visibleSnapshot = () => document.visibilityState === 'visible';
const serverVisibleSnapshot = () => true;

export function useNiagaraCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const documentVisible = useSyncExternalStore(subscribeVisibility, visibleSnapshot, serverVisibleSnapshot);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const direction = useRef(1);
  const pointer = useRef<{ id: number; x: number; y: number; left: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playing = !paused && !reduced && inView && documentVisible && !hovered && !focused && !dragging;

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(entries => setInView(entries[0].isIntersecting), { threshold: 0.1 });
    observer.observe(rail);
    return () => { observer.disconnect(); clearTimeout(idleTimer.current); };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !playing) return;
    let frame = 0;
    let previous: number | undefined;
    // Keep subpixel progress independent of browsers that round scrollLeft.
    let position = rail.scrollLeft;
    const advance = (now: number) => {
      if (previous !== undefined) {
        const limit = Math.max(0, rail.scrollWidth - rail.clientWidth);
        const step = Math.min(now - previous, 50) * 0.018;
        position = Math.min(limit, Math.max(0, position + step * direction.current));
        rail.scrollLeft = position;
        if (position >= limit) direction.current = -1;
        if (position <= 0) direction.current = 1;
      }
      previous = now;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const pause = () => {
    setPaused(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setPaused(false), 8000);
  };
  const move = (delta: number) => {
    pause();
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('[data-home-place]'));
    const current = rail.scrollLeft;
    const target = delta > 0
      ? cards.find(card => card.offsetLeft > current + 4)
      : [...cards].reverse().find(card => card.offsetLeft < current - 4);
    rail.scrollTo({ left: target ? target.offsetLeft : delta > 0 ? rail.scrollWidth : 0, behavior: reduced ? 'instant' : 'smooth' });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      pause();
      railRef.current?.scrollTo({ left: event.key === 'Home' ? 0 : railRef.current.scrollWidth, behavior: reduced ? 'instant' : 'smooth' });
    }
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pause();
    suppressClick.current = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, dragging: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.dragging && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      start.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    if (start.dragging) {
      event.preventDefault();
      suppressClick.current = true;
      event.currentTarget.scrollLeft = start.left - dx;
    }
  };
  const endPointer = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    // A drag's click follows pointerup; later independent clicks stay usable.
    if (start.dragging) window.setTimeout(() => { suppressClick.current = false; }, 0);
  };
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  };

  return {
    railRef, playing, dragging, move,
    railEvents: {
      onWheel: pause, onPointerDown, onPointerMove, onPointerUp: endPointer,
      onPointerCancel: endPointer, onLostPointerCapture: endPointer, onClickCapture, onKeyDown,
      onDragStart: (event: DragEvent<HTMLDivElement>) => event.preventDefault(),
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => { setHovered(false); if (pointer.current && !pointer.current.dragging) pointer.current = null; },
    },
    focusEvents: {
      onFocusCapture: () => { setFocused(true); pause(); },
      onBlurCapture: (event: FocusEvent<HTMLDivElement>) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); },
    },
  };
}

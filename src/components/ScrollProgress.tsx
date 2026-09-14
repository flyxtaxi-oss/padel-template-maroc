"use client";
import { useEffect, useRef } from 'react';

/**
 * Fine barre de progression dorée en haut de page.
 *
 * Deux implémentations, la plus légère d'abord :
 *  1. `animation-timeline: scroll()` — animation pilotée par le défilement,
 *     entièrement sur le compositeur, zéro JavaScript (voir globals.css).
 *  2. Repli JavaScript pour les navigateurs sans scroll-driven animations :
 *     un `requestAnimationFrame` écrit directement `transform` sur le nœud.
 *
 * L'ancienne version stockait la progression dans un `useState` et animait
 * `width` : un rendu React et un calcul de layout à chaque événement de
 * défilement. `scaleX` est composité, donc ni layout ni peint.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // Le CSS s'en charge : ne pas doubler avec du JS.
    if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: scroll()')) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5" aria-hidden>
      <div ref={barRef} className="scroll-progress__bar h-full w-full bg-gold" />
    </div>
  );
}

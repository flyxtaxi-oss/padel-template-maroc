"use client";
import { useEffect, useRef, useState } from 'react';

// Compteur animé : anime le nombre en tête de chaîne (ex: "500+", "21°C", "4"),
// se déclenche quand l'élément entre dans le viewport. Conserve le suffixe.
//
// IMPORTANT : l'état initial est la valeur FINALE, pas 0.
// Le rendu serveur (et le cas « pas de JS / IntersectionObserver qui ne se
// déclenche jamais ») affiche donc toujours la vraie valeur. L'animation
// repart de 0 uniquement après le montage, côté client.
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';
  const [n, setN] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!match) return;
    const el = ref.current;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Pas d'observer, pas d'élément, ou animation refusée : on garde la valeur finale.
    if (!el || reduceMotion || typeof IntersectionObserver === 'undefined') return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const duration = 1100;
      const startAt = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - startAt) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
        else setN(target); // garantit la valeur exacte en fin d'animation
      };
      setN(0);
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            io.unobserve(el);
          }
        });
      },
      // Seuil bas + marge : un bloc plus haut que la moitié de l'écran
      // (fréquent sur mobile) déclenchait jamais avec threshold 0.5.
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);

    // Filet de sécurité : si rien ne s'est déclenché en 2,5 s, on affiche la valeur.
    const safety = window.setTimeout(() => {
      if (!started.current) {
        started.current = true;
        setN(target);
      }
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [match, target]);

  return (
    <span ref={ref} className={className}>
      {match ? `${n}${suffix}` : value}
    </span>
  );
}

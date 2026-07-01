"use client";
import { useEffect, useRef, useState } from 'react';

// Compteur animé : anime le nombre en tête de chaîne (ex: "500+", "21°C", "4"),
// se déclenche quand l'élément entre dans le viewport. Conserve le suffixe.
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';
  const [n, setN] = useState(match ? 0 : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!match) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setN(target); return; }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1100;
            const startAt = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - startAt) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setN(Math.round(target * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [match, target]);

  return (
    <span ref={ref} className={className}>
      {match ? `${n}${suffix}` : value}
    </span>
  );
}

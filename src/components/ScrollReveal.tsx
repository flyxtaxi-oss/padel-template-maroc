"use client";
import { useEffect } from 'react';

// Ajoute la classe `.in` aux éléments [data-reveal] et aux titres
// [data-word-reveal] quand ils entrent dans le viewport. Léger, sans
// dépendance, respecte prefers-reduced-motion.
//
// Un seul observateur pour les deux mécanismes : les titres mot à mot ne
// justifient pas un second IntersectionObserver, et le seuil est le même.
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-word-reveal]'),
    );
    if (!els.length) return;

    const revealAll = () => els.forEach((el) => el.classList.add('in'));

    if (typeof IntersectionObserver === 'undefined') {
      revealAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, []);

  return null;
}

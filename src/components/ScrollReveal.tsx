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

    // Filet de sécurité — même principe que celui de <CountUp />.
    // Ces éléments partent à `opacity: 0` : si l'observateur ne se déclenche
    // jamais (onglet resté en arrière-plan puis restauré dans un état étrange,
    // conteneur de défilement inattendu, bug navigateur), du contenu — dont des
    // titres — resterait invisible. Perdre l'animation vaut mieux que perdre le
    // texte. Le décompte ne court que pendant que l'onglet est visible : un
    // onglet ouvert en arrière-plan garde donc son animation à l'arrivée.
    let timer = 0;
    const startTimer = () => {
      if (timer || document.visibilityState !== 'visible') return;
      timer = window.setTimeout(() => {
        revealAll();
        io.disconnect();
      }, 5000);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') startTimer();
    };

    startTimer();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}

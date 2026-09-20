"use client";

import { useEffect } from 'react';

/**
 * Défilement fluide (Lenis) — la page glisse au lieu de sauter.
 *
 * C'est la mécanique qu'on retrouve sur la quasi-totalité des sites primés :
 * invisible quand elle est là, mais c'est elle qui fait la différence entre un
 * site « correct » et un site qui paraît cher. Elle sert aussi les animations
 * d'apparition au scroll déjà en place : les sections entrent en douceur au
 * lieu d'apparaître d'un bloc.
 *
 * Trois précautions :
 *  · chargée à la demande (`import()` dans l'effet) : la librairie ne pèse pas
 *    sur le premier affichage, qui est ce que mesure Google ;
 *  · désactivée si le visiteur a demandé « réduire les animations » dans son
 *    système — pour qui souffre de vertiges, un défilement inertiel est
 *    pénible, parfois impossible à utiliser ;
 *  · montée uniquement sur la page d'accueil : dans l'espace gérant, un
 *    défilement qui continue après le doigt rend le pointage d'une ligne de
 *    planning agaçant.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({
        autoRaf: true,
        // `anchors` fait passer les liens « #booking », « #contact » du menu par
        // Lenis. Sans cela, le clic sur « Réserver » sautait brutalement, en
        // pleine contradiction avec le reste de la page.
        // Pas de décalage pour l'en-tête fixe : chaque section commence par un
        // large espacement vertical, l'arrivée se fait donc à 155 px sous le
        // haut de l'écran — largement dégagé des 65 px de l'en-tête (vérifié).
        anchors: true,
      });
      destroy = () => lenis.destroy();
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return null;
}

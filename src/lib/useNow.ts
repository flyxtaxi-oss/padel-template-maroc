"use client";
import { useSyncExternalStore } from 'react';

/**
 * Heure courante, lisible pendant le rendu sans le rendre impur.
 *
 * `new Date()` appelé directement dans un composant ou un `useMemo` est une
 * lecture impure : React (et la règle `react-hooks` du lint) l'interdit car le
 * résultat change d'un rendu à l'autre sans que React en soit informé.
 * `useSyncExternalStore` est l'API prévue pour ça : l'horloge est une source
 * externe mutable à laquelle on s'abonne.
 *
 * L'instantané est arrondi à `intervalMs` pour rester stable entre deux appels
 * de `getSnapshot` — sinon React boucle indéfiniment.
 *
 * Retourne `0` au rendu serveur et à l'hydratation (pas d'horloge côté
 * serveur : renvoyer une vraie date provoquerait un écart d'hydratation).
 * Testez donc `if (!now) …` avant d'afficher une date.
 */
export function useNow(intervalMs = 60_000): number {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}

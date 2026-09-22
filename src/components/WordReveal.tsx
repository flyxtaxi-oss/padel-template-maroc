import { Fragment, type ElementType } from 'react';

/**
 * Révélation éditoriale mot à mot.
 *
 * Le découpage est fait au rendu (serveur) et non par mutation du DOM après
 * montage : le HTML envoyé contient déjà les mots, donc pas de saut de mise en
 * page ni de dépendance à l'hydratation pour le référencement.
 *
 * L'animation est déclenchée par le même IntersectionObserver que
 * `[data-reveal]` (voir ScrollReveal), qui pose la classe `.in`.
 *
 * Accessibilité : le conteneur porte le texte complet en `aria-label`, chaque
 * mot est `aria-hidden` — le lecteur d'écran lit une phrase, pas une liste de
 * mots. Sans JavaScript, `@media (scripting: enabled)` ne s'applique pas et le
 * texte reste visible (voir globals.css).
 *
 * Tokens de mouvement (skill « masked-reveal ») : chaque mot monte de 110 %
 * à travers un masque `overflow: hidden`, 0.9s, cubic-bezier(0.16, 1, 0.3, 1),
 * décalage 0.05s par mot, une seule fois.
 */
export type WordRevealPart = string | { text: string; className?: string };

export default function WordReveal({
  parts,
  as: Tag = 'span' as ElementType,
  className = '',
  dir,
}: {
  parts: WordRevealPart[];
  as?: ElementType;
  className?: string;
  /**
   * À forcer à "ltr" pour un titre en écriture latine (nom de marque) affiché
   * sur une page RTL. Les mots étant des inline-block atomiques, l'algorithme
   * bidi ne peut plus les réordonner : sans cette direction explicite,
   * « Golden Padel Club » s'affiche « Padel Golden Club » en arabe.
   * L'alignement du bloc reste celui de la page (voir globals.css).
   */
  dir?: 'ltr' | 'rtl';
}) {
  const normalized = parts.map((p) => (typeof p === 'string' ? { text: p, className: undefined } : p));
  const label = normalized
    .map((p) => p.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  let index = 0;

  return (
    <Tag className={`word-reveal ${className}`} data-word-reveal dir={dir} aria-label={label}>
      {normalized.map((part, partIdx) => {
        const words = part.text.trim().split(/\s+/).filter(Boolean);
        return words.map((word, wordIdx) => {
          const i = index++;
          return (
            // L'espace est un nœud texte FRÈRE du span, pas son contenu : un
            // inline-block est atomique, et c'est l'espace qui les sépare qui
            // offre au navigateur son point de césure. Une espace insécable ici
            // empêcherait tout retour à la ligne et ferait déborder les titres.
            <Fragment key={`${partIdx}-${wordIdx}`}>
              <span className="word-reveal__mask" aria-hidden="true">
                <span
                  className={`word-reveal__word ${part.className ?? ''}`}
                  style={{ '--word-index': i } as React.CSSProperties}
                >
                  {word}
                </span>
              </span>{' '}
            </Fragment>
          );
        });
      })}
    </Tag>
  );
}

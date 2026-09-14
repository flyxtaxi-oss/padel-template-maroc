import { getDictionary } from '@/i18n/dictionaries';

/**
 * Lien d'évitement — premier élément focusable de la page.
 *
 * Sans lui, un visiteur au clavier ou au lecteur d'écran doit traverser les
 * douze liens de l'en-tête (navigation, sélecteur de langue, CTA) avant
 * d'atteindre le contenu, à chaque page. Invisible à la souris, il apparaît
 * dès qu'il reçoit le focus.
 *
 * Il cible `#main` : toute page qui l'utilise doit porter cet id sur son
 * élément <main>.
 */
export default function SkipLink({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  return (
    <a href="#main" className="skip-link">
      {t.ui.skipToContent}
    </a>
  );
}

import defaultClub, { type ClubConfig } from '@/config/club.config';
import { getOpeningRange } from '@/lib/schedule';

/**
 * Descriptions de référencement.
 *
 * Elles étaient jusqu'ici découpées dans le texte « À propos » à 160 caractères,
 * ce qui coupait en plein mot (« … de dernière générati ») dans les résultats
 * Google. Ici, chaque langue a une phrase écrite pour le résultat de recherche :
 * ce que c'est, où, quand, combien, et quoi faire. Les valeurs viennent de la
 * configuration du club — elles ne peuvent donc pas mentir sur les tarifs ni
 * sur les horaires.
 */

const CLOSING_LABEL: Record<string, string> = {
  fr: 'minuit',
  en: 'midnight',
  es: 'medianoche',
  ar: 'منتصف الليل',
};

function hours(locale: string, club: ClubConfig): { open: string; close: string } {
  const { open, close } = getOpeningRange(club);
  // Chaque langue écrit l'heure à sa façon : « 9h » en français, « 9am » en
  // anglais, « 9:00 » en espagnol et en arabe. Servir « 9h » à un anglophone
  // (ce que faisait la première version) trahit une traduction bâclée dans le
  // texte le plus lu du site : le résultat Google.
  const fmt = (m: number) => {
    const h = Math.floor(m / 60) % 24;
    const mm = m % 60;
    if (locale === 'en') {
      const suffix = h < 12 ? 'am' : 'pm';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return mm === 0 ? `${h12}${suffix}` : `${h12}:${String(mm).padStart(2, '0')}${suffix}`;
    }
    if (locale === 'fr') return mm === 0 ? `${h}h` : `${h}h${String(mm).padStart(2, '0')}`;
    return `${h}:${String(mm).padStart(2, '0')}`;
  };
  const isMidnight = close % (24 * 60) === 0;
  return {
    open: fmt(open),
    close: isMidnight ? CLOSING_LABEL[locale] ?? CLOSING_LABEL.fr : fmt(close),
  };
}

export function metaDescription(locale: string, clubConfig: ClubConfig = defaultClub): string {
  const courts = clubConfig.courts.length;
  const price = clubConfig.pricing[0]?.price ?? 400;
  const duration = `${clubConfig.slotDurationMinutes} ${locale === 'ar' ? 'دقيقة لأربعة أشخاص' : locale === 'en' ? 'minutes for four players' : locale === 'es' ? 'minutos para cuatro jugadores' : 'minutes pour quatre joueurs'}`;
  const { open, close } = hours(locale, clubConfig);

  switch (locale) {
    case 'en':
      return `Padel club in Tangier: ${courts} indoor courts, open 7 days a week from ${open} to ${close}. Book online in 30 seconds — ${price} MAD per ${duration}.`;
    case 'es':
      return `Club de pádel en Tánger: ${courts} pistas cubiertas, abierto todos los días de ${open} a ${close}. Reserva online en 30 segundos — ${price} MAD por ${duration}.`;
    case 'ar':
      return `نادي بادل في طنجة: ${courts} ملاعب داخلية، مفتوح 7 أيام في الأسبوع من ${open} إلى ${close}. احجز عبر الإنترنت في 30 ثانية — ${price} درهم لكل ${duration}.`;
    default:
      return `Club de padel à Tanger : ${courts} terrains indoor, ouverts 7j/7 de ${open} à ${close}. Réservation en ligne en 30 secondes — ${price} MAD les ${duration}.`;
  }
}

/**
 * Titre de recherche. Le nom seul ne dit pas ce que fait le club ni où il est :
 * on ajoute l'activité et la ville, les deux mots que les gens tapent
 * réellement (« padel Tanger »).
 */
export function metaTitle(locale: string, clubConfig: ClubConfig = defaultClub): string {
  const tagline = clubConfig.tagline[locale] || clubConfig.tagline[clubConfig.defaultLocale];
  return `${clubConfig.name} — ${tagline}`;
}

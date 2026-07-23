import clubConfig from '@/config/club.config';

/**
 * Lien de dépôt d'avis Google, utilisé par la section Avis, la page /avis et le QR code.
 *
 * Ordre de préférence :
 * 1. googlePlaceId renseigné → lien « écrire un avis » : ouvre directement le
 *    formulaire de notation 5 étoiles. C'est celui qui convertit.
 * 2. googleReviewUrl posé manuellement → utilisé tel quel.
 * 3. Repli : recherche Google Maps du club. Fonctionne toujours, mais demande
 *    un clic de plus au visiteur.
 */
export function getGoogleReviewUrl(): string {
  const { googlePlaceId, googleReviewUrl, name, contact } = clubConfig;

  if (googlePlaceId) {
    return `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
  }
  if (googleReviewUrl) return googleReviewUrl;

  const q = encodeURIComponent(`${name} ${contact.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Vrai si le lien mène directement au formulaire d'avis (et non à la fiche). */
export function hasDirectReviewLink(): boolean {
  return Boolean(clubConfig.googlePlaceId);
}

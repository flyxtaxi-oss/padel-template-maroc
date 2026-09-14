import clubConfig from '@/config/club.config';

/**
 * Acheminement d'une demande de réservation jusqu'au club.
 *
 * Le point critique du produit : une demande qui n'arrive pas au gérant est
 * une réservation perdue, et un client à qui l'on a menti. Deux canaux :
 *
 *  1. **Backend distant** (Firestore) — alimente le tableau de bord gérant et
 *     fonctionne entre appareils. Optionnel : actif seulement si les variables
 *     Firebase sont configurées.
 *  2. **WhatsApp** — toujours disponible, aucune infrastructure, et c'est le
 *     canal que le club utilise réellement au quotidien. C'est le filet.
 *
 * Sans backend, le stockage local du navigateur est le SEUL endroit où la
 * demande atterrit : elle reste sur le téléphone du client et le gérant ne la
 * voit jamais. Dans ce cas, WhatsApp n'est pas un bonus, c'est l'envoi.
 */

/** Vrai si un backend distant est configuré (donc si le gérant verra la demande). */
export function hasRemoteBackend(): boolean {
  return (
    clubConfig.bookingMode === 'firebase' &&
    Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  );
}

export type BookingDraft = {
  name: string;
  phone: string;
  date: string;
  time_slot: string;
  level: string;
  players: number | string;
};

const LABELS: Record<string, { intro: string; date: string; slot: string; players: string; level: string; phone: string }> = {
  fr: { intro: 'Bonjour, je souhaite réserver un terrain au Golden Padel Club.', date: 'Date', slot: 'Créneau', players: 'Joueurs', level: 'Niveau', phone: 'Téléphone' },
  en: { intro: 'Hello, I would like to book a court at Golden Padel Club.', date: 'Date', slot: 'Time', players: 'Players', level: 'Level', phone: 'Phone' },
  es: { intro: 'Hola, me gustaría reservar una pista en Golden Padel Club.', date: 'Fecha', slot: 'Hora', players: 'Jugadores', level: 'Nivel', phone: 'Teléfono' },
  ar: { intro: 'مرحبًا، أود حجز ملعب في جولدن بادل كلوب.', date: 'التاريخ', slot: 'التوقيت', players: 'اللاعبون', level: 'المستوى', phone: 'الهاتف' },
};

/** Message WhatsApp pré-rempli, lisible tel quel par le gérant. */
export function buildWhatsAppMessage(booking: BookingDraft, locale: string): string {
  const l = LABELS[locale] || LABELS.fr;
  return [
    l.intro,
    '',
    `${l.date} : ${booking.date}`,
    `${l.slot} : ${booking.time_slot}`,
    `${l.players} : ${booking.players}`,
    `${l.level} : ${booking.level}`,
    '',
    `${booking.name} — ${l.phone} : ${booking.phone}`,
  ].join('\n');
}

/** Lien wa.me prêt à ouvrir, vers le numéro de réservation du club. */
export function buildWhatsAppUrl(booking: BookingDraft, locale: string): string {
  const digits = clubConfig.reservation.value.replace(/[^0-9]/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(buildWhatsAppMessage(booking, locale))}`;
}

/* ─── Réponse du gérant au client ──────────────────────────────────────────
   Le club répond aujourd'hui sur WhatsApp : on garde ce canal, mais le message
   est pré-rédigé dans la langue du client et le statut est enregistré dans le
   tableau de bord. Confirmer ou refuser = un clic + envoi. */

type ClientReply = { confirmed: string; declined: string };

const REPLIES: Record<string, (b: BookingDraft) => ClientReply> = {
  fr: (b) => ({
    confirmed: `Bonjour ${b.name}, votre réservation au Golden Padel Club est confirmée ✅\n${b.date} à ${b.time_slot} · ${b.players} joueurs.\nMerci d’arriver 10 minutes avant. À bientôt !`,
    declined: `Bonjour ${b.name}, le créneau du ${b.date} à ${b.time_slot} n’est malheureusement plus disponible. Souhaitez-vous un autre horaire ? Nous vous proposons volontiers une alternative.`,
  }),
  en: (b) => ({
    confirmed: `Hello ${b.name}, your booking at Golden Padel Club is confirmed ✅\n${b.date} at ${b.time_slot} · ${b.players} players.\nPlease arrive 10 minutes early. See you soon!`,
    declined: `Hello ${b.name}, unfortunately the slot on ${b.date} at ${b.time_slot} is no longer available. Would you like another time? We’d be happy to suggest an alternative.`,
  }),
  es: (b) => ({
    confirmed: `Hola ${b.name}, tu reserva en Golden Padel Club está confirmada ✅\n${b.date} a las ${b.time_slot} · ${b.players} jugadores.\nLlega 10 minutos antes, por favor. ¡Hasta pronto!`,
    declined: `Hola ${b.name}, lamentablemente la pista del ${b.date} a las ${b.time_slot} ya no está disponible. ¿Te interesa otro horario? Con gusto te proponemos una alternativa.`,
  }),
  ar: (b) => ({
    confirmed: `مرحبًا ${b.name}، تم تأكيد حجزك في جولدن بادل كلوب ✅\n${b.date} على الساعة ${b.time_slot} · ${b.players} لاعبين.\nيرجى الحضور قبل 10 دقائق. إلى اللقاء!`,
    declined: `مرحبًا ${b.name}، للأسف لم يعد الملعب متاحًا يوم ${b.date} على الساعة ${b.time_slot}. هل يناسبك وقت آخر؟ يسعدنا اقتراح بديل.`,
  }),
};

/** Lien WhatsApp vers le CLIENT, message de confirmation ou de refus pré-rempli. */
export function buildClientReplyUrl(
  booking: BookingDraft & { locale?: string },
  status: 'confirmed' | 'declined',
): string {
  const digits = booking.phone.replace(/[^0-9]/g, '');
  const make = REPLIES[booking.locale || 'fr'] || REPLIES.fr;
  return `https://wa.me/${digits}?text=${encodeURIComponent(make(booking)[status])}`;
}

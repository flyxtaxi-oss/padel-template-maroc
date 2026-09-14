"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { fr as frLocale, enUS, es as esLocale, ar as arLocale } from 'date-fns/locale';
import { saveBooking, type StoredBooking } from '@/lib/demoStore';
import { getClubNow, addDaysStr, getSlotsForDate } from '@/lib/schedule';
import { User, Phone, Trophy, Users, Check, ArrowRight, MessageCircle, RotateCcw } from 'lucide-react';
import { hasRemoteBackend, buildWhatsAppUrl, type BookingDraft } from '@/lib/bookingDelivery';

const dateLocales: Record<string, Locale> = { fr: frLocale, en: enUS, es: esLocale, ar: arLocale };

/** Disponibilités renvoyées par GET /api/bookings. */
type Live = { courts: number; taken: Record<string, number> };

type LiveCopy = {
  live: string;
  free: (n: number) => string;
  full: string;
  taken: string;
  instantTitle: string;
  instantMessage: (court: number, day: string, time: string) => string;
  instantNote: string;
  another: string;
};

// Réservation instantanée : textes propres à ce parcours, dans les 4 langues.
const LIVE_COPY: Record<string, LiveCopy> = {
  fr: {
    live: 'Disponibilités en direct',
    free: (n) => (n > 1 ? `${n} terrains libres` : '1 terrain libre'),
    full: 'Complet',
    taken: 'Ce créneau vient d’être réservé par quelqu’un d’autre. Choisissez-en un autre.',
    instantTitle: 'Réservation confirmée',
    instantMessage: (court, day, time) => `Terrain ${court} réservé pour vous le ${day} à ${time}. Paiement sur place — arrivez 10 minutes avant.`,
    instantNote: 'Un empêchement ? Prévenez le club sur WhatsApp pour libérer le terrain.',
    another: 'Réserver un autre créneau',
  },
  en: {
    live: 'Live availability',
    free: (n) => (n > 1 ? `${n} courts free` : '1 court free'),
    full: 'Full',
    taken: 'Someone just booked this slot. Please pick another one.',
    instantTitle: 'Booking confirmed',
    instantMessage: (court, day, time) => `Court ${court} is yours on ${day} at ${time}. Pay at the club — please arrive 10 minutes early.`,
    instantNote: 'Can’t make it? Let the club know on WhatsApp so the court can be freed.',
    another: 'Book another slot',
  },
  es: {
    live: 'Disponibilidad en directo',
    free: (n) => (n > 1 ? `${n} pistas libres` : '1 pista libre'),
    full: 'Completo',
    taken: 'Alguien acaba de reservar esta franja. Elige otra, por favor.',
    instantTitle: 'Reserva confirmada',
    instantMessage: (court, day, time) => `Pista ${court} reservada para ti el ${day} a las ${time}. Pago en el club — llega 10 minutos antes.`,
    instantNote: '¿Un imprevisto? Avisa al club por WhatsApp para liberar la pista.',
    another: 'Reservar otra franja',
  },
  ar: {
    live: 'التوفر المباشر',
    free: (n) => (n > 1 ? `${n} ملاعب متاحة` : 'ملعب واحد متاح'),
    full: 'محجوز بالكامل',
    taken: 'تم حجز هذا التوقيت للتو من طرف شخص آخر. اختر توقيتًا آخر من فضلك.',
    instantTitle: 'تم تأكيد الحجز',
    instantMessage: (court, day, time) => `الملعب ${court} محجوز لك يوم ${day} على الساعة ${time}. الأداء في النادي — يرجى الحضور قبل 10 دقائق.`,
    instantNote: 'طرأ مانع؟ أخبر النادي عبر واتساب لتحرير الملعب.',
    another: 'حجز توقيت آخر',
  },
};

export default function BookingWidget({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  const L = LIVE_COPY[locale] || LIVE_COPY.fr;
  const dateLocale = dateLocales[locale] || frLocale;

  // Heure du club (Tanger) figée au premier rendu : identique côté serveur et
  // côté client, donc pas de désynchronisation d'hydratation.
  const [clubNow] = useState(() => getClubNow());

  // 7 jours à partir d'aujourd'hui, en chaînes 'yyyy-MM-dd' (aucune ambiguïté de fuseau).
  const upcomingDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysStr(clubNow.dateStr, i)),
    [clubNow.dateStr],
  );

  // Créneaux précalculés pour les 7 jours : permet d'ouvrir par défaut sur le
  // premier jour qui a réellement de la disponibilité (le soir, « aujourd'hui »
  // est vide — on ne veut pas accueillir le visiteur sur une section vide).
  const slotsByDay = useMemo(
    () => Object.fromEntries(upcomingDays.map((d) => [d, getSlotsForDate(d, clubNow)])),
    [upcomingDays, clubNow],
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    () => upcomingDays.find((d) => slotsByDay[d].length > 0) ?? upcomingDays[0],
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('');
  const [players, setPlayers] = useState('4');
  // Champ piège invisible (anti-robots), vérifié par le serveur.
  const [website, setWebsite] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Demande soumise, conservée pour pré-remplir le message WhatsApp.
  const [sent, setSent] = useState<BookingDraft | null>(null);
  // Un backend distant reçoit-il vraiment la demande ? Détermine ce qu'on a
  // le droit d'affirmer au client sur l'écran de confirmation.
  const [delivered, setDelivered] = useState(false);

  // Réservation instantanée. `live` n'est renseigné que si le serveur a
  // répondu : sans Firebase, on reste sur le parcours demande + WhatsApp.
  const [live, setLive] = useState<Live | null>(null);
  const [instantCourt, setInstantCourt] = useState<number | null>(null);
  const [slotTaken, setSlotTaken] = useState(false);

  const { bookingMode, reservation } = clubConfig;

  const refreshLive = useCallback(async () => {
    // Sans Firebase configuré au build, l'API répondrait 503 toutes les 30 s :
    // inutile de la solliciter (ni de remplir la console d'erreurs).
    if (!hasRemoteBackend()) return;
    try {
      const res = await fetch('/api/bookings?days=7', { cache: 'no-store', signal: AbortSignal.timeout(6000) });
      setLive(res.ok ? ((await res.json()) as Live) : null);
    } catch {
      setLive(null);
    }
  }, []);

  // Rafraîchi toutes les 30 s : un créneau pris ailleurs disparaît sans recharger.
  useEffect(() => {
    // Lecture réseau au montage : les états posés viennent de la réponse.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshLive();
    const iv = setInterval(refreshLive, 30_000);
    return () => clearInterval(iv);
  }, [refreshLive]);

  if (bookingMode === 'external') {
    return (
      <section id="booking" className="section bg-cream text-center">
        <div className="mx-auto max-w-3xl px-6">
          <span className="eyebrow">{t.sections.bookingEyebrow}</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">{t.booking.title}</h2>
          <div className="divider mx-auto mt-5" />
          <a href={reservation.value} target="_blank" rel="noopener noreferrer" className="btn-gold mt-10 px-10 py-4 text-sm">
            {t.actions.book}
          </a>
        </div>
      </section>
    );
  }

  /** Terrains libres sur un créneau, ou `null` sans données en direct. */
  const freeCourts = (date: string, slot: string): number | null =>
    live ? Math.max(0, live.courts - (live.taken[`${date}T${slot}`] ?? 0)) : null;

  const slotsForSelectedDate = slotsByDay[selectedDate] ?? [];

  const resetForm = () => {
    setIsSuccess(false);
    setSelectedSlot(null);
    setInstantCourt(null);
    setSent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setSlotTaken(false);

    const booking: StoredBooking = {
      id: `b_${Date.now()}`,
      club_slug: clubConfig.slug,
      date: selectedDate,
      time_slot: selectedSlot,
      name,
      phone,
      level,
      players: parseInt(players, 10),
      created_at: new Date().toISOString(),
      // Langue du client : le gérant lui répondra dans celle-ci.
      locale,
      status: 'pending',
    };

    // 1. Réservation instantanée : le serveur attribue un terrain dans une
    //    transaction. Tout échec autre que « créneau pris » retombe sur le
    //    parcours demande + WhatsApp, pour ne jamais perdre un client.
    if (live) {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...booking, website }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.status === 201) {
          const data = (await res.json()) as { id: string; court: number };
          const confirmed: StoredBooking = { ...booking, id: data.id, court: data.court, status: 'confirmed' };
          saveBooking(confirmed);
          setSent(confirmed);
          setInstantCourt(data.court);
          setDelivered(true);
          setIsSuccess(true);
          setIsSubmitting(false);
          refreshLive();
          return;
        }
        if (res.status === 409) {
          setSlotTaken(true);
          setSelectedSlot(null);
          setIsSubmitting(false);
          refreshLive();
          return;
        }
      } catch {
        // Réseau coupé : repli ci-dessous.
      }
    }

    // 2. Enregistrement local instantané (fiable, alimente le tableau de bord)
    saveBooking(booking);

    // 3. Firestore si (et seulement si) configuré — avec délai max, jamais bloquant
    if (bookingMode === 'firebase' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      try {
        // Import dynamique : le SDK Firestore pèse ~570 Ko. Le charger au
        // clic « Réserver » plutôt qu'au chargement de la page divise par deux
        // le JavaScript initial de l'accueil.
        const [{ db }, { collection, addDoc }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/firestore'),
        ]);
        await Promise.race([
          addDoc(collection(db, 'booking_requests'), booking),
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]);
      } catch (err) {
        console.error('Booking Firestore error', err);
      }
    }

    // 4. Confirmation. `delivered` dit si la demande a RÉELLEMENT quitté
    //    l'appareil. Sans backend configuré, elle n'est allée que dans le
    //    stockage local de ce navigateur : le gérant ne la verra jamais, et
    //    l'écran doit demander l'envoi WhatsApp au lieu de prétendre l'inverse.
    setSent(booking);
    setDelivered(hasRemoteBackend());
    setIsSuccess(true);
    setIsSubmitting(false);
  };

  const stepLabel = "flex items-center gap-3 text-sm font-semibold t-title";
  const stepNumber = "flex h-6 w-6 items-center justify-center rounded-md bg-gold/15 font-mono text-xs t-gold";
  const inputBase = "w-full rounded-xl border border-[#1e1b14]/12 bg-white p-3.5 pl-11 text-sm text-[#1e1b14] outline-none transition-colors placeholder-[#1e1b14]/35 focus:border-gold";

  return (
    <section id="booking" className="section bg-cream">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center" data-reveal>
          <span className="eyebrow">{t.sections.bookingEyebrow}</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">
            {t.sections.bookingTitle} <span className="italic t-gold">{t.sections.bookingTitleAccent}</span>
          </h2>
          <div className="divider mx-auto mt-5" />
          <p className="mx-auto mt-5 max-w-md text-sm t-muted">
            {t.sections.bookingSubtitle}
          </p>
        </div>

        {isSuccess ? (
          <div className="card card-lift p-12 text-center" role="status">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
              {delivered ? <Check className="h-7 w-7 t-gold" /> : <MessageCircle className="h-7 w-7 t-gold" />}
            </div>

            <h3 className="font-display text-2xl font-semibold t-title">
              {instantCourt ? L.instantTitle : delivered ? t.sections.bookingSuccessTitle : t.booking.sendTitle}
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed t-soft">
              {instantCourt && sent
                ? L.instantMessage(instantCourt, format(parseISO(sent.date), 'EEEE d MMMM', { locale: dateLocale }), sent.time_slot)
                : delivered ? t.booking.successMessage : t.booking.sendMessage}
            </p>

            {sent && !instantCourt && (
              <a
                href={buildWhatsAppUrl(sent, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 px-8 py-4 text-sm ${delivered ? 'btn-outline' : 'btn-gold'}`}
              >
                <MessageCircle className="h-4 w-4" />
                {delivered ? t.booking.alsoWhatsApp : t.booking.sendViaWhatsApp}
              </a>
            )}

            {instantCourt ? (
              <>
                <p className="mx-auto mt-6 max-w-sm text-xs t-muted">{L.instantNote}</p>
                <button type="button" onClick={resetForm} className="btn-outline mt-8 px-6 py-3 text-sm font-medium">
                  <RotateCcw className="h-4 w-4" />
                  {L.another}
                </button>
              </>
            ) : (
              delivered && <div className="mt-6 text-xs t-muted">{t.sections.bookingSuccessNote}</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card card-lift p-6 sm:p-10">

            <div className="mb-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className={stepLabel}><span className={stepNumber}>1</span>{t.booking.selectDate}</h3>
                {live && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-gold/12 px-3 py-1 text-xs font-semibold t-gold">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold motion-safe:animate-pulse" />
                    {L.live}
                  </span>
                )}
              </div>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {upcomingDays.map((dateStr) => {
                  const isSelected = dateStr === selectedDate;
                  const daySlots = slotsByDay[dateStr] ?? [];
                  const isFull = daySlots.length === 0 || (live !== null && daySlots.every((s) => freeCourts(dateStr, s) === 0));
                  const day = parseISO(dateStr);
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isFull}
                      aria-pressed={isSelected}
                      onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); setSlotTaken(false); }}
                      className={`flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl border transition-colors ${
                        isSelected
                          ? 'border-gold bg-gold/12 t-gold'
                          : isFull
                            ? 'cursor-not-allowed border-[#1e1b14]/8 bg-[#1e1b14]/[0.03] text-[#1e1b14]/30'
                            : 'border-[#1e1b14]/12 bg-white t-soft hover:border-gold/40'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase">{format(day, 'eee', { locale: dateLocale })}</span>
                      <span className="mt-1 font-mono text-xl font-bold">{format(day, 'dd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-9">
              <h3 className={stepLabel}><span className={stepNumber}>2</span>{t.booking.selectTime}</h3>
              {slotTaken && (
                <p role="alert" className="mt-4 rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/8 p-3 text-sm t-title">
                  {L.taken}
                </p>
              )}
              {slotsForSelectedDate.length === 0 ? (
                <p className="mt-5 text-sm t-muted">{t.booking.noSlots}</p>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {slotsForSelectedDate.map(slot => {
                    const isSelected = selectedSlot === slot;
                    const free = freeCourts(selectedDate, slot);
                    const full = free === 0;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={full}
                        aria-pressed={isSelected}
                        onClick={() => { setSelectedSlot(slot); setSlotTaken(false); }}
                        className={`rounded-lg border px-2 py-3 transition-colors ${
                          isSelected
                            ? 'border-gold bg-gold/12 t-gold'
                            : full
                              ? 'cursor-not-allowed border-[#1e1b14]/8 bg-[#1e1b14]/[0.03] text-[#1e1b14]/35'
                              : 'border-[#1e1b14]/12 bg-white t-soft hover:border-gold/40'
                        }`}
                      >
                        <span className={`block font-mono text-sm ${full ? 'line-through' : ''}`}>{slot}</span>
                        {free !== null && (
                          <span className={`mt-0.5 block text-[11px] ${full ? '' : free === 1 ? 'font-semibold t-gold' : 't-muted'}`}>
                            {full ? L.full : L.free(free)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="animate-fade-up space-y-7 border-t hair pt-8">
                <h3 className={stepLabel}><span className={stepNumber}>3</span>{t.sections.bookingStep3}</h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="bk-name" className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldName}</label>
                    <div className="relative">
                      <input id="bk-name" required type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Yassine Belghiti" className={inputBase} />
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bk-phone" className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldPhone}</label>
                    <div className="relative">
                      <input id="bk-phone" required type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : +212612345678" className={inputBase} />
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bk-level" className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldLevel}</label>
                    <div className="relative">
                      <input id="bk-level" required type="text" value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex : Intermédiaire (niveau 3)" className={inputBase} />
                      <Trophy className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bk-players" className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldPlayers}</label>
                    <div className="relative">
                      <select id="bk-players" value={players} onChange={e => setPlayers(e.target.value)} className={`${inputBase} appearance-none`}>
                        <option value="2">2 {t.sections.playersUnit}</option>
                        <option value="3">3 {t.sections.playersUnit}</option>
                        <option value="4">4 {t.sections.playersUnit} ({t.sections.playersStandard})</option>
                      </select>
                      <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="hidden"
                />

                <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4 text-sm">
                  {isSubmitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a140a] border-t-transparent" />
                  ) : (
                    <>{t.booking.confirm}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

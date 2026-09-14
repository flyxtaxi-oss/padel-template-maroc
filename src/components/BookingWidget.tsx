"use client";

import { useState, useMemo } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { fr as frLocale, enUS, es as esLocale, ar as arLocale } from 'date-fns/locale';
import { saveBooking } from '@/lib/demoStore';
import { getClubNow, addDaysStr, getSlotsForDate } from '@/lib/schedule';
import { User, Phone, Trophy, Users, Check, ArrowRight, MessageCircle } from 'lucide-react';
import { hasRemoteBackend, buildWhatsAppUrl, type BookingDraft } from '@/lib/bookingDelivery';

const dateLocales: Record<string, Locale> = { fr: frLocale, en: enUS, es: esLocale, ar: arLocale };

export default function BookingWidget({ locale }: { locale: string }) {
  const t = getDictionary(locale);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Demande soumise, conservée pour pré-remplir le message WhatsApp.
  const [sent, setSent] = useState<BookingDraft | null>(null);
  // Un backend distant reçoit-il vraiment la demande ? Détermine ce qu'on a
  // le droit d'affirmer au client sur l'écran de confirmation.
  const [delivered, setDelivered] = useState(false);

  const { bookingMode, reservation } = clubConfig;

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

  const slotsForSelectedDate = slotsByDay[selectedDate] ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dateStr = selectedDate;

    const booking = {
      id: `b_${Date.now()}`,
      club_slug: clubConfig.slug,
      date: dateStr,
      time_slot: selectedSlot || '',
      name,
      phone,
      level,
      players: parseInt(players),
      created_at: new Date().toISOString(),
      // Langue du client : le gérant lui répondra dans celle-ci.
      locale,
      status: 'pending' as const,
    };

    // 1. Enregistrement local instantané (fiable, alimente le tableau de bord)
    saveBooking(booking);

    // 2. Firestore si (et seulement si) configuré — avec délai max, jamais bloquant
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

    // 3. Confirmation. `delivered` dit si la demande a RÉELLEMENT quitté
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
          <div className="card card-lift p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
              {delivered ? <Check className="h-7 w-7 t-gold" /> : <MessageCircle className="h-7 w-7 t-gold" />}
            </div>

            <h3 className="font-display text-2xl font-semibold t-title">
              {delivered ? t.sections.bookingSuccessTitle : t.booking.sendTitle}
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed t-soft">
              {delivered ? t.booking.successMessage : t.booking.sendMessage}
            </p>

            {sent && (
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

            {delivered && <div className="mt-6 text-xs t-muted">{t.sections.bookingSuccessNote}</div>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card card-lift p-6 sm:p-10">

            <div className="mb-9">
              <h3 className={stepLabel}><span className={stepNumber}>1</span>{t.booking.selectDate}</h3>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {upcomingDays.map((dateStr) => {
                  const isSelected = dateStr === selectedDate;
                  const isFull = (slotsByDay[dateStr] ?? []).length === 0;
                  const day = parseISO(dateStr);
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isFull}
                      onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
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
              {slotsForSelectedDate.length === 0 ? (
                <p className="mt-5 text-sm t-muted">{t.booking.noSlots}</p>
              ) : (
                <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {slotsForSelectedDate.map(slot => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border py-3 font-mono text-sm transition-colors ${
                          isSelected
                            ? 'border-gold bg-gold/12 t-gold'
                            : 'border-[#1e1b14]/12 bg-white t-soft hover:border-gold/40'
                        }`}
                      >
                        {slot}
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
                    <label className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldName}</label>
                    <div className="relative">
                      <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Yassine Belghiti" className={inputBase} />
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldPhone}</label>
                    <div className="relative">
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : +212612345678" className={inputBase} />
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldLevel}</label>
                    <div className="relative">
                      <input required type="text" value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex : Intermédiaire (niveau 3)" className={inputBase} />
                      <Trophy className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">{t.sections.fieldPlayers}</label>
                    <div className="relative">
                      <select value={players} onChange={e => setPlayers(e.target.value)} className={`${inputBase} appearance-none`}>
                        <option value="2">2 {t.sections.playersUnit}</option>
                        <option value="3">3 {t.sections.playersUnit}</option>
                        <option value="4">4 {t.sections.playersUnit} ({t.sections.playersStandard})</option>
                      </select>
                      <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-4 text-sm">
                  {isSubmitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a140a] border-t-transparent" />
                  ) : (
                    <>{t.booking.confirm}<ArrowRight className="h-4 w-4" /></>
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

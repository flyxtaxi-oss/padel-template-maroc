"use client";

import { useState } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, addDays, isSameDay } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { saveBooking } from '@/lib/demoStore';
import { User, Phone, Trophy, Users, Check, ArrowRight } from 'lucide-react';

export default function BookingWidget({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('');
  const [players, setPlayers] = useState('4');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { bookingMode, reservation, slotDurationMinutes, bookedSlots } = clubConfig;

  if (bookingMode === 'external') {
    return (
      <section id="booking" className="section bg-cream text-center">
        <div className="mx-auto max-w-3xl px-6">
          <span className="eyebrow">Réservations</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">{t.booking.title}</h2>
          <div className="divider mx-auto mt-5" />
          <a href={reservation.value} target="_blank" rel="noopener noreferrer" className="btn-gold mt-10 px-10 py-4 text-sm">
            {t.actions.book}
          </a>
        </div>
      </section>
    );
  }

  const upcomingDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  const generateSlots = (date: Date) => {
    const slots = [];
    const startHour = 8;
    const endHour = 22;
    let currentHour = startHour;
    let currentMinute = 0;

    while (currentHour < endHour) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const slotIso = `${format(date, 'yyyy-MM-dd')}T${timeString}`;

      if (isSameDay(date, new Date()) && currentHour < new Date().getHours()) {
        // Skip past slots
      } else if (!bookedSlots.includes(slotIso)) {
        slots.push(timeString);
      }

      currentMinute += slotDurationMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    return slots;
  };

  const slotsForSelectedDate = generateSlots(selectedDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

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
    };

    // 1. Enregistrement local instantané (fiable, alimente le tableau de bord)
    saveBooking(booking);

    // 2. Firestore si (et seulement si) configuré — avec délai max, jamais bloquant
    if (bookingMode === 'firebase' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      try {
        await Promise.race([
          addDoc(collection(db, 'booking_requests'), booking),
          new Promise((resolve) => setTimeout(resolve, 4000)),
        ]);
      } catch (err) {
        console.error('Booking Firestore error', err);
      }
    }

    // 3. Confirmation (aucun message auto envoyé — la demande apparaît côté gérant)
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
          <span className="eyebrow">Réservations</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">
            Réserver un <span className="italic t-gold">terrain</span>
          </h2>
          <div className="divider mx-auto mt-5" />
          <p className="mx-auto mt-5 max-w-md text-sm t-muted">
            Choisissez une date et un créneau — le club vous confirme rapidement.
          </p>
        </div>

        {isSuccess ? (
          <div className="card card-lift p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
              <Check className="h-7 w-7 t-gold" />
            </div>
            <h3 className="font-display text-2xl font-semibold t-title">Demande envoyée</h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed t-soft">{t.booking.successMessage}</p>
            <div className="mt-6 text-xs t-muted">Le club vous recontacte rapidement pour confirmer.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card card-lift p-6 sm:p-10">

            <div className="mb-9">
              <h3 className={stepLabel}><span className={stepNumber}>1</span>{t.booking.selectDate}</h3>
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {upcomingDays.map((date, i) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      className={`flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl border transition-colors ${
                        isSelected
                          ? 'border-gold bg-gold/12 t-gold'
                          : 'border-[#1e1b14]/12 bg-white t-soft hover:border-gold/40'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase">{format(date, 'eee')}</span>
                      <span className="mt-1 font-mono text-xl font-bold">{format(date, 'dd')}</span>
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
                <h3 className={stepLabel}><span className={stepNumber}>3</span>Compléter la réservation</h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">Nom complet</label>
                    <div className="relative">
                      <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex : Yassine Belghiti" className={inputBase} />
                      <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">Numéro de téléphone</label>
                    <div className="relative">
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ex : +212612345678" className={inputBase} />
                      <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">Votre niveau</label>
                    <div className="relative">
                      <input required type="text" value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex : Intermédiaire (niveau 3)" className={inputBase} />
                      <Trophy className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e1b14]/35" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium t-muted">Nombre de joueurs</label>
                    <div className="relative">
                      <select value={players} onChange={e => setPlayers(e.target.value)} className={`${inputBase} appearance-none`}>
                        <option value="2">2 joueurs</option>
                        <option value="3">3 joueurs</option>
                        <option value="4">4 joueurs (standard)</option>
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

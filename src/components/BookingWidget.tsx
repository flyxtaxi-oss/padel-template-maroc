"use client";

import { useState } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, addDays, parseISO, isBefore, isSameDay } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function BookingWidget({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('');
  const [players, setPlayers] = useState('4');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { bookingMode, reservation, slotDurationMinutes, openingHours, bookedSlots } = clubConfig;

  // External mode just renders a button
  if (bookingMode === 'external') {
    return (
      <section id="booking" className="py-24 bg-gray-50 dark:bg-gray-900 text-center">
        <h2 className="font-heading text-4xl font-bold mb-8 text-[var(--primary)] dark:text-white">
          {t.booking.title}
        </h2>
        <a 
          href={reservation.value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[var(--primary)] text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:bg-[var(--secondary)] transition-colors"
        >
          {t.actions.book}
        </a>
      </section>
    );
  }

  // Generate 7 upcoming days
  const upcomingDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  // A naive parser to get slots for a given day based on openingHours
  // In a real app, logic would map the selected day to 'Lundi - Vendredi' or 'Samedi - Dimanche' properly
  // Here we simplify by picking the first openingHours entry for simplicity, or we can just assume 08:00 to 23:00
  const generateSlots = (date: Date) => {
    // Basic slot generation from 08:00 to 22:00 for demo
    const slots = [];
    const startHour = 8;
    const endHour = 22;
    
    let currentHour = startHour;
    let currentMinute = 0;

    while (currentHour < endHour) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const slotIso = `${format(date, 'yyyy-MM-dd')}T${timeString}`;
      
      // Filter if in past
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

    const slotDateTime = `${format(selectedDate, 'yyyy-MM-dd')} ${selectedSlot}`;
    const whatsappMsg = `Bonjour, je souhaite réserver un terrain de padel.\n\nDate: ${slotDateTime}\nNom: ${name}\nTél: ${phone}\nNiveau: ${level}\nJoueurs: ${players}`;
    const waLink = `https://wa.me/${reservation.value.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

    if (bookingMode === 'firebase') {
      try {
        await addDoc(collection(db, 'booking_requests'), {
          club_slug: clubConfig.slug,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time_slot: selectedSlot,
          name,
          phone,
          level,
          players: parseInt(players),
          created_at: new Date().toISOString()
        });
        setIsSuccess(true);
        // Still redirect to WhatsApp for instant notification
        setTimeout(() => window.open(waLink, '_blank'), 1500);
      } catch (err) {
        console.error("Booking error", err);
        // Fallback to whatsapp immediately
        window.open(waLink, '_blank');
      }
    } else {
      // Direct to WhatsApp
      window.open(waLink, '_blank');
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="booking" className="py-32 bg-[#060913] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-1/4 -left-40 opacity-10" />
      <div className="glow-orb glow-gold w-[300px] h-[300px] bottom-10 -right-20 opacity-10" />
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            Réservations
          </div>
          <h2 className="font-heading text-4xl font-black text-white">
            {t.booking.title}
          </h2>
          <div className="divider mx-auto mt-4" />
        </div>

        {isSuccess ? (
          <div className="glass border-green-500/30 bg-green-500/5 text-green-200 p-8 rounded-3xl text-center">
            <h3 className="text-2xl font-bold mb-2">Merci !</h3>
            <p className="text-lg">{t.booking.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass p-8 sm:p-10 rounded-3xl relative z-10 border-white/5">
            
            {/* Step 1: Date */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <CalendarIcon className="w-5 h-5 text-gold" />
                {t.booking.selectDate}
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                {upcomingDays.map((date, i) => {
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : 'border-white/5 bg-white/2 hover:border-yellow-500/30 text-white/60'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">{format(date, 'eee')}</span>
                      <span className="text-xl font-bold mt-1">{format(date, 'dd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slot */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-gold" />
                {t.booking.selectTime}
              </h3>
              {slotsForSelectedDate.length === 0 ? (
                <p className="text-white/40">{t.booking.noSlots}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {slotsForSelectedDate.map(slot => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-500/15 text-yellow-400'
                            : 'border-white/5 bg-white/2 hover:border-yellow-500/30 text-white/80'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Details */}
            {selectedSlot && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">{t.booking.name}</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 focus:border-yellow-500/50 outline-none text-white transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">{t.booking.phone}</label>
                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 focus:border-yellow-500/50 outline-none text-white transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">{t.booking.level}</label>
                    <input required type="text" value={level} onChange={e => setLevel(e.target.value)} className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 focus:border-yellow-500/50 outline-none text-white transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">{t.booking.players}</label>
                    <select value={players} onChange={e => setPlayers(e.target.value)} className="w-full p-3.5 rounded-xl border border-white/10 bg-[#0c1322] focus:border-yellow-500/50 outline-none text-white transition-all text-sm">
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium w-full py-4 rounded-full text-black font-bold text-lg shadow-lg"
                >
                  {isSubmitting ? '...' : t.booking.confirm}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

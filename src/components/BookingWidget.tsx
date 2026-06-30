"use client";

import { useState } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, addDays, isSameDay } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock, User, Phone, Trophy, Users } from 'lucide-react';

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
      <section id="booking" className="py-32 bg-background text-center relative overflow-hidden">
        <div className="glow-orb glow-gold w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="font-heading text-4xl sm:text-5xl font-black mb-8 text-white uppercase">
            {t.booking.title}
          </h2>
          <div className="divider mx-auto mb-10" />
          <a 
            href={reservation.value}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium inline-block px-10 py-4 rounded-full text-black font-black text-xs uppercase tracking-widest shadow-lg"
          >
            {t.actions.book}
          </a>
        </div>
      </section>
    );
  }

  // Generate 7 upcoming days
  const upcomingDays = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  // A naive parser to get slots for a given day based on openingHours
  const generateSlots = (date: Date) => {
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
    <section id="booking" className="py-36 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-1/4 -left-40 opacity-10 animate-float" />
      <div className="glow-orb glow-gold w-[300px] h-[300px] bottom-10 -right-20 opacity-10 animate-float-delayed" />
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
            Réservations
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase">
            Réserver un <span className="font-quote italic text-gold normal-case font-medium tracking-wide">terrain</span>
          </h2>
          <div className="divider mx-auto mt-4" />
        </div>

        {isSuccess ? (
          <div className="glass border-gold-glow bg-yellow-500/5 text-yellow-100 p-12 rounded-[32px] text-center max-w-2xl mx-auto shadow-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
              <span className="w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
            </div>
            <h3 className="font-heading text-3xl font-black text-white uppercase mb-4">Demande Envoyée !</h3>
            <p className="text-white/60 text-base leading-relaxed mb-6">
              {t.booking.successMessage}
            </p>
            <div className="text-xs text-white/30 tracking-wider uppercase">Redirection vers WhatsApp en cours...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass p-8 sm:p-12 rounded-[32px] relative z-10 border border-white/5">
            
            {/* Step 1: Date */}
            <div className="mb-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-3 text-white">
                <span className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[10px] text-gold font-mono">1</span>
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
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-[20px] border transition-all duration-300 ${
                        isSelected
                          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 shadow-[0_8px_20px_rgba(212,175,55,0.15)]'
                          : 'border-white/5 bg-white/2 hover:border-yellow-500/20 hover:bg-white/5 text-white/60'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">{format(date, 'eee')}</span>
                      <span className="text-xl font-black font-mono mt-1">{format(date, 'dd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slot */}
            <div className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-3 text-white">
                <span className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[10px] text-gold font-mono">2</span>
                {t.booking.selectTime}
              </h3>
              {slotsForSelectedDate.length === 0 ? (
                <p className="text-white/30 text-sm leading-relaxed">{t.booking.noSlots}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {slotsForSelectedDate.map(slot => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl font-bold font-mono border transition-all duration-300 text-xs tracking-wider ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-500/15 text-yellow-400'
                            : 'border-white/5 bg-white/2 hover:border-yellow-500/30 text-white/70'
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
              <div className="space-y-8 border-t border-white/5 pt-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-white">
                  <span className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[10px] text-gold font-mono">3</span>
                  Compléter la réservation
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 pl-1">Nom complet</label>
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Ex: Yassine Belghiti"
                        className="w-full p-4 pl-12 rounded-xl border border-white/5 bg-[#090e1a]/60 focus:border-yellow-500/40 outline-none text-white transition-all text-xs tracking-wider placeholder-white/20" 
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 pl-1">Numéro de téléphone</label>
                    <div className="relative">
                      <input 
                        required 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        placeholder="Ex: +212612345678"
                        className="w-full p-4 pl-12 rounded-xl border border-white/5 bg-[#090e1a]/60 focus:border-yellow-500/40 outline-none text-white transition-all text-xs tracking-wider placeholder-white/20" 
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Level */}
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 pl-1">Votre niveau (1 - 5 ou Débutant/Intermédiaire)</label>
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        value={level} 
                        onChange={e => setLevel(e.target.value)} 
                        placeholder="Ex: Intermédiaire (Niveau 3)"
                        className="w-full p-4 pl-12 rounded-xl border border-white/5 bg-[#090e1a]/60 focus:border-yellow-500/40 outline-none text-white transition-all text-xs tracking-wider placeholder-white/20" 
                      />
                      <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>

                  {/* Players Count */}
                  <div className="relative">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 pl-1">Nombre de joueurs</label>
                    <div className="relative">
                      <select 
                        value={players} 
                        onChange={e => setPlayers(e.target.value)} 
                        className="w-full p-4 pl-12 rounded-xl border border-white/5 bg-[#090e1a]/80 focus:border-yellow-500/40 outline-none text-white transition-all text-xs tracking-wider appearance-none"
                      >
                        <option value="2">2 Joueurs</option>
                        <option value="3">3 Joueurs</option>
                        <option value="4">4 Joueurs (Standard)</option>
                      </select>
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>

                {/* Submitting button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-premium w-full py-4.5 rounded-full text-black font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 mt-4"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>{t.booking.confirm}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
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

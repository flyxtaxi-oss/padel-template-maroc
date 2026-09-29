'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, CalendarPlus } from 'lucide-react';
import type { ClubConfig } from '@/config/club.config';
import { slotsOfDay, isActive, type StatBooking } from '@/lib/bookingStats';
import { addDaysStr, getClubNow } from '@/lib/schedule';
import { saveBooking } from '@/lib/demoStore';

/**
 * Réservation saisie par le gérant : un client appelle ou passe au comptoir.
 * Le créneau est retiré du site à l'instant (même transaction que le
 * formulaire public). Sans base configurée, elle est gardée sur cet appareil.
 */

type Props = {
  club: ClubConfig;
  bookings: StatBooking[];
  /** Démonstration / base absente : enregistrement local. */
  localMode: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
  onUnauthorized: () => void;
};

const inputCls =
  'w-full rounded-xl border border-[#1e1b14]/12 bg-white px-3.5 py-3 text-sm text-[#1e1b14] outline-none transition-colors placeholder-[#1e1b14]/35 focus:border-gold';
const labelCls = 'mb-1.5 block text-xs font-medium t-muted';

export default function ManualBookingDialog({ club, bookings, localMode, onClose, onCreated, onUnauthorized }: Props) {
  const today = getClubNow().dateStr;
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [court, setCourt] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [players, setPlayers] = useState(4);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  const courts = useMemo(() => club.courts.map((_, i) => i + 1), [club]);
  const slots = useMemo(() => slotsOfDay(date, club), [date, club]);

  // Terrains déjà occupés sur le créneau choisi (d'après les réservations chargées).
  const takenCourts = useMemo(
    () => new Set(bookings.filter((b) => isActive(b) && b.date === date && b.time_slot === time && typeof b.court === 'number').map((b) => b.court as number)),
    [bookings, date, time],
  );
  const freeCount = courts.filter((c) => !takenCourts.has(c)).length;

  // Échap ferme, le focus reste dans la fenêtre.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLElement>('input, select')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !name.trim() || saving) return;
    setSaving(true);
    setError('');
    const label = `${format(parseISO(date), 'EEEE d MMMM', { locale: fr })} à ${time}`;

    if (!localMode) {
      try {
        const res = await fetch('/api/admin/bookings/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, time_slot: time, court, name, phone, players, note }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.status === 401) return onUnauthorized();
        const data = await res.json().catch(() => ({}));
        if (res.status === 201) {
          onCreated(`Réservation enregistrée : terrain ${data.court}, ${label}.`);
          return;
        }
        if (res.status !== 503) {
          setError(data.error || 'Enregistrement impossible.');
          setSaving(false);
          return;
        }
        // 503 : base non configurée → repli local ci-dessous.
      } catch {
        setError('Serveur injoignable — réessayez.');
        setSaving(false);
        return;
      }
    }

    const chosen = court === '' ? courts.find((c) => !takenCourts.has(c)) : court;
    if (chosen === undefined || takenCourts.has(chosen)) {
      setError(court === '' ? 'Créneau complet : tous les terrains sont pris.' : 'Ce terrain est déjà pris sur ce créneau.');
      setSaving(false);
      return;
    }
    const stamp = new Date().toISOString();
    saveBooking({
      id: `m_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      date,
      time_slot: time,
      level: note.trim(),
      players,
      created_at: stamp,
      club_slug: club.slug,
      status: 'confirmed',
      status_updated_at: stamp,
      court: chosen,
    });
    onCreated(`Réservation enregistrée sur cet appareil : terrain ${chosen}, ${label}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#08213c]/45 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-title"
        onClick={(e) => e.stopPropagation()}
        className="card card-lift-lg max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-b-none p-6 sm:rounded-b-[1.25rem] sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/12"><CalendarPlus className="h-5 w-5 t-gold" /></span>
            <div>
              <h2 id="manual-title" className="font-display text-xl font-semibold t-title">Nouvelle réservation</h2>
              <p className="text-xs t-muted">Appel téléphonique ou client au comptoir</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 t-muted hover:bg-[#1e1b14]/6 hover:t-title"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="m-date" className={labelCls}>Date</label>
              <input id="m-date" type="date" required min={today} max={addDaysStr(today, 60)} value={date}
                onChange={(e) => { setDate(e.target.value); setTime(''); }} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label htmlFor="m-time" className={labelCls}>Créneau</label>
              <select id="m-time" required value={time} onChange={(e) => { setTime(e.target.value); setCourt(''); }} className={`${inputCls} font-mono`}>
                <option value="">{slots.length ? 'Choisir…' : 'Fermé ce jour'}</option>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {time && (
            <div>
              <p className={labelCls}>Terrain {freeCount === 0 && <span className="text-[#c0392b]">— complet</span>}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCourt('')}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${court === '' ? 'border-gold bg-gold/12 t-title' : 'hair t-muted'}`}>
                  Automatique
                </button>
                {courts.map((c) => {
                  const taken = takenCourts.has(c);
                  return (
                    <button key={c} type="button" disabled={taken} onClick={() => setCourt(c)}
                      className={`rounded-full border px-3.5 py-1.5 font-mono text-xs font-semibold ${court === c ? 'border-gold bg-gold/12 t-title' : 'hair t-muted'} disabled:cursor-not-allowed disabled:line-through disabled:opacity-40`}>
                      T{c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="m-name" className={labelCls}>Nom du client</label>
            <input id="m-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Ex : Yassine B." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="m-phone" className={labelCls}>Téléphone (facultatif)</label>
              <input id="m-phone" type="tel" maxLength={25} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+212 6…" />
            </div>
            <div>
              <label htmlFor="m-players" className={labelCls}>Joueurs</label>
              <select id="m-players" value={players} onChange={(e) => setPlayers(Number(e.target.value))} className={`${inputCls} font-mono`}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="m-note" className={labelCls}>Note (facultatif)</label>
            <input id="m-note" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} placeholder="Ex : location de 2 raquettes" />
          </div>

          {error && <p role="alert" className="text-sm text-[#c0392b]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-3 text-sm font-medium">Annuler</button>
            <button type="submit" disabled={!time || !name.trim() || saving || freeCount === 0} className="btn-gold flex-1 py-3 text-sm">
              {saving ? 'Enregistrement…' : 'Réserver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBookings } from '@/lib/demoStore';
import clubConfig from '@/config/club.config';
import { Lock, Phone, MessageCircle, RefreshCw, CalendarDays, Users, Trophy, LogOut } from 'lucide-react';

// Code d'accès (optionnel) : défini via NEXT_PUBLIC_ADMIN_CODE dans .env.local.
// Si vide, l'accès n'est pas protégé (pratique pour la démo).
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || '';

type Booking = {
  id: string;
  name?: string;
  phone?: string;
  date?: string;
  time_slot?: string;
  level?: string;
  players?: number;
  created_at?: string;
  club_slug?: string;
};

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export default function AdminPage() {
  const [code, setCode] = useState('');
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (accessCode: string) => {
    setLoading(true);
    setError('');
    if (ADMIN_CODE && accessCode !== ADMIN_CODE) {
      setError('Code incorrect');
      setLoading(false);
      return;
    }
    // Source fiable : stockage local (démo). Alimenté par chaque réservation.
    const local = getBookings() as Booking[];

    // Source optionnelle : Firestore (si configuré) — non bloquant.
    let remote: Booking[] = [];
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      try {
        const q = query(collection(db, 'booking_requests'), orderBy('created_at', 'desc'), limit(500));
        const snap = await Promise.race([
          getDocs(q),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000)),
        ]);
        remote = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Booking)
          .filter((b) => !b.club_slug || b.club_slug === clubConfig.slug);
      } catch (err) {
        console.error('Firestore read error', err);
      }
    }

    // Fusion + dédoublonnage par id + tri antéchronologique
    const byId = new Map<string, Booking>();
    [...remote, ...local].forEach((b) => byId.set(b.id, b));
    const merged = [...byId.values()].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    setBookings(merged);
    setAuthed(true);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const t = todayStr();
    return {
      total: bookings.length,
      today: bookings.filter((b) => b.date === t).length,
      upcoming: bookings.filter((b) => (b.date || '') >= t).length,
    };
  }, [bookings]);

  const logout = () => {
    setAuthed(false);
    setBookings([]);
    setCode('');
  };

  // ── Écran de connexion ──
  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand px-6">
        <form
          onSubmit={(e) => { e.preventDefault(); load(code); }}
          className="card card-lift w-full max-w-sm p-8"
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/12">
            <Lock className="h-6 w-6 t-gold" />
          </div>
          <h1 className="font-display text-2xl font-semibold t-title">Espace gérant</h1>
          <p className="mt-1.5 text-sm t-muted">Golden Padel Club — réservations</p>

          <label className="mt-7 mb-2 block text-xs font-medium t-muted">Code d'accès</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="w-full rounded-xl border border-[#1e1b14]/12 bg-white p-3.5 text-sm text-[#1e1b14] outline-none transition-colors placeholder-[#1e1b14]/35 focus:border-gold"
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-gold mt-6 w-full py-3.5 text-sm">
            {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a140a] border-t-transparent" /> : 'Se connecter'}
          </button>
        </form>
      </main>
    );
  }

  // ── Tableau de bord ──
  const statCards = [
    { label: "Aujourd'hui", value: stats.today, icon: CalendarDays },
    { label: 'À venir', value: stats.upcoming, icon: Trophy },
    { label: 'Total', value: stats.total, icon: Users },
  ];

  return (
    <main className="min-h-screen bg-sand px-6 py-10">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold t-title sm:text-3xl">Réservations</h1>
            <p className="mt-1 text-sm t-muted">Golden Padel Club — espace gérant</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load(code)} className="btn-outline px-4 py-2.5 text-sm font-medium" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button onClick={logout} className="btn-outline px-4 py-2.5 text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Quitter
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card card-lift p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/12">
                  <Icon className="h-4 w-4 t-gold" />
                </div>
                <div className="font-mono text-3xl font-bold t-title">{s.value}</div>
                <div className="mt-1 text-xs t-muted">{s.label}</div>
              </div>
            );
          })}
        </div>

        {bookings.length === 0 ? (
          <div className="card card-lift p-12 text-center">
            <p className="text-sm t-muted">Aucune réservation pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const created = b.created_at && isValid(parseISO(b.created_at)) ? parseISO(b.created_at) : null;
              const phoneDigits = (b.phone || '').replace(/[^0-9]/g, '');
              return (
                <div key={b.id} className="card card-lift flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gold font-semibold text-[#1a140a]">
                      {(b.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold t-title">{b.name || '—'}</div>
                      <div className="text-sm t-muted">{b.phone || '—'}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="t-muted">Créneau : </span>
                      <span className="font-mono font-semibold t-title">{b.date} · {b.time_slot}</span>
                    </div>
                    <div><span className="t-muted">Niveau : </span><span className="t-soft">{b.level || '—'}</span></div>
                    <div><span className="t-muted">Joueurs : </span><span className="t-soft">{b.players ?? '—'}</span></div>
                  </div>

                  <div className="flex items-center gap-2">
                    {phoneDigits && (
                      <>
                        <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-3 py-2 text-xs" aria-label="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <a href={`tel:${b.phone}`} className="btn-outline px-3 py-2 text-xs" aria-label="Appeler">
                          <Phone className="h-4 w-4" />
                        </a>
                      </>
                    )}
                  </div>

                  {created && (
                    <div className="text-xs t-muted sm:hidden">Reçu le {format(created, 'dd/MM/yyyy HH:mm')}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

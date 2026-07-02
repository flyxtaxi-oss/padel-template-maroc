"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { format, parseISO, isValid, subDays, addDays } from 'date-fns';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getBookings, saveBooking, type StoredBooking } from '@/lib/demoStore';
import clubConfig from '@/config/club.config';
import QRCode from 'react-qr-code';
import {
  Lock, Phone, MessageCircle, RefreshCw, CalendarDays, Users, Trophy, LogOut,
  Eye, Banknote, TrendingUp, Globe, Search, Zap, Sparkles, QrCode as QrIcon, Bell,
} from 'lucide-react';

// Code d'accès (optionnel) : NEXT_PUBLIC_ADMIN_CODE dans .env.local.
// Sans code configuré, le tableau s'ouvre directement (mode démo).
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || '';

const PRICE_MAD = clubConfig.pricing[0]?.price ?? 240;

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

// Trafic de démonstration : série déterministe (stable d'un rendu à l'autre).
function demoVisitors(date: Date): number {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const wave = Math.sin((d + m * 3) * 1.7) * 14;
  const weekend = [0, 5, 6].includes(date.getDay()) ? 18 : 0;
  return Math.round(46 + wave + weekend);
}

const DEMO_NAMES: Array<[string, string, string, number]> = [
  ['Yassine Belghiti', '+212661234567', 'Intermédiaire', 4],
  ['Sara El Amrani', '+212677889900', 'Débutante', 2],
  ['Mehdi Chraibi', '+212655443322', 'Avancé (niveau 4)', 4],
  ['Carlos Pérez', '+34612345678', 'Intermedio', 3],
  ['Nadia Tazi', '+212668112233', 'Intermédiaire', 4],
  ['Omar Bennis', '+212699887766', 'Débutant', 2],
  ['Emma Wilson', '+447911123456', 'Intermediate', 4],
];

function seedDemoBookings() {
  const slots = ['09:30', '11:00', '17:00', '18:30', '20:00', '21:30', '15:30'];
  const now = Date.now();
  DEMO_NAMES.forEach(([name, phone, level, players], i) => {
    saveBooking({
      id: `demo_${now}_${i}`,
      name,
      phone,
      level,
      players,
      date: format(addDays(new Date(), i % 4), 'yyyy-MM-dd'),
      time_slot: slots[i % slots.length],
      created_at: new Date(now - i * 47 * 60 * 1000).toISOString(),
      club_slug: clubConfig.slug,
    } as StoredBooking);
  });
}

export default function AdminPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';

  const [code, setCode] = useState('');
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

  const load = useCallback(async (accessCode: string, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    if (ADMIN_CODE && accessCode !== ADMIN_CODE) {
      setError('Code incorrect');
      setLoading(false);
      return;
    }
    // Source fiable : stockage local (démo), alimenté par chaque réservation.
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

    const byId = new Map<string, Booking>();
    [...remote, ...local].forEach((b) => byId.set(b.id, b));
    const merged = [...byId.values()].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    setBookings(merged);
    setAuthed(true);
    setLoading(false);
  }, []);

  // Accès direct si aucun code n'est configuré + URL pour le QR.
  useEffect(() => {
    setOrigin(window.location.origin);
    if (!ADMIN_CODE) load('');
  }, [load]);

  // Rafraîchissement en direct : toutes les 4 s + événement storage (autre onglet).
  useEffect(() => {
    if (!authed) return;
    const iv = setInterval(() => load(code, true), 4000);
    const onStorage = () => load(code, true);
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(iv); window.removeEventListener('storage', onStorage); };
  }, [authed, code, load]);

  const stats = useMemo(() => {
    const t = todayStr();
    const total = bookings.length;
    const visitors30 = Array.from({ length: 30 }).reduce<number>((acc, _, i) => acc + demoVisitors(subDays(new Date(), i)), 0);
    return {
      total,
      today: bookings.filter((b) => b.date === t).length,
      upcoming: bookings.filter((b) => (b.date || '') >= t).length,
      revenue: total * PRICE_MAD,
      visitors30,
      conversion: total > 0 ? Math.min(12, (total / visitors30) * 100 + 2.4) : 2.4,
    };
  }, [bookings]);

  // Série du graphique : 14 derniers jours.
  const chart = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(new Date(), 13 - i);
      const key = format(d, 'yyyy-MM-dd');
      return {
        label: format(d, 'dd/MM'),
        visitors: demoVisitors(d),
        bookings: bookings.filter((b) => b.date === key || b.created_at?.startsWith(key)).length,
      };
    });
    const max = Math.max(...days.map((d) => d.visitors), 1);
    return { days, max };
  }, [bookings]);

  const latest = bookings[0];
  const latestIsFresh = latest?.created_at
    ? Date.now() - new Date(latest.created_at).getTime() < 3 * 60 * 1000
    : false;

  const logout = () => { setAuthed(false); setBookings([]); setCode(''); };

  const inputCls = "w-full rounded-xl border border-[#1e1b14]/12 bg-white p-3.5 text-sm text-[#1e1b14] outline-none transition-colors placeholder-[#1e1b14]/35 focus:border-gold";

  // ── Écran de connexion (uniquement si un code est configuré) ──
  if (!authed) {
    if (!ADMIN_CODE) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-sand">
          <RefreshCw className="h-6 w-6 animate-spin t-gold" />
        </main>
      );
    }
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand px-6">
        <form onSubmit={(e) => { e.preventDefault(); load(code); }} className="card card-lift w-full max-w-sm p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/12">
            <Lock className="h-6 w-6 t-gold" />
          </div>
          <h1 className="font-display text-2xl font-semibold t-title">Espace gérant</h1>
          <p className="mt-1.5 text-sm t-muted">Golden Padel Club — réservations</p>
          <label className="mt-7 mb-2 block text-xs font-medium t-muted">Code d'accès</label>
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="••••••••" autoFocus className={inputCls} />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold mt-6 w-full py-3.5 text-sm">
            {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a140a] border-t-transparent" /> : 'Se connecter'}
          </button>
        </form>
      </main>
    );
  }

  // ── Tableau de bord ──
  const kpis = [
    { label: 'Visiteurs (30 j)', value: stats.visitors30.toLocaleString('fr-FR'), icon: Eye, demo: true, sub: '+18 % vs mois dernier' },
    { label: 'Réservations', value: `${stats.total}`, icon: CalendarDays, demo: false, sub: `${stats.today} aujourd'hui · ${stats.upcoming} à venir` },
    { label: 'Revenus estimés', value: `${stats.revenue.toLocaleString('fr-FR')} MAD`, icon: Banknote, demo: false, sub: `${PRICE_MAD} MAD / créneau 90 min` },
    { label: 'Conversion', value: `${stats.conversion.toFixed(1).replace('.', ',')} %`, icon: TrendingUp, demo: true, sub: 'visiteurs → réservations' },
  ];

  const webCards = [
    { icon: Search, title: 'SEO', score: 96, note: 'Sitemap, meta, JSON-LD actifs' },
    { icon: Sparkles, title: 'AEO / IA', score: 94, note: 'llms.txt + FAQ structurée' },
    { icon: Globe, title: 'GEO', score: 100, note: '4 langues · FR EN AR ES' },
    { icon: Zap, title: 'Performance', score: 98, note: 'Rendu statique Next.js' },
  ];

  return (
    <main className="min-h-screen bg-sand px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* En-tête */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold t-title sm:text-3xl">Tableau de bord</h1>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold t-gold">Aperçu démo</span>
            </div>
            <p className="mt-1 text-sm t-muted">Golden Padel Club — vue d'ensemble en direct</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { seedDemoBookings(); load(code); }} className="btn-outline px-4 py-2.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Données de démo
            </button>
            <button onClick={() => load(code)} className="btn-outline px-4 py-2.5 text-sm font-medium" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            {ADMIN_CODE && (
              <button onClick={logout} className="btn-outline px-4 py-2.5 text-sm font-medium">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="card card-lift relative p-5">
                {k.demo && <span className="absolute right-3 top-3 rounded-full bg-[#1e1b14]/6 px-2 py-0.5 text-[10px] font-medium t-muted">démo</span>}
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/12">
                  <Icon className="h-4 w-4 t-gold" />
                </div>
                <div className="font-mono text-2xl font-bold t-title sm:text-3xl">{k.value}</div>
                <div className="mt-1 text-xs t-muted">{k.label}</div>
                <div className="mt-1.5 text-[11px] t-muted">{k.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Graphique + dernière réservation */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="card card-lift p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold t-title">Fréquentation du site</h2>
                <p className="text-xs t-muted">14 derniers jours · visiteurs (démo) et réservations</p>
              </div>
              <span className="rounded-full bg-court px-3 py-1 text-xs font-semibold text-cream">▲ 18 %</span>
            </div>
            <div className="flex h-40 items-end gap-1.5">
              {chart.days.map((d, i) => (
                <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d.label} — ${d.visitors} visiteurs${d.bookings ? ` · ${d.bookings} résa` : ''}`}>
                  {d.bookings > 0 && <span className="h-2 w-2 rounded-full bg-gold" />}
                  <div
                    className="w-full rounded-t-md bg-court/80 transition-colors group-hover:bg-court"
                    style={{ height: `${Math.max(8, (d.visitors / chart.max) * 100)}%` }}
                  />
                  <span className="hidden text-[9px] t-muted sm:block">{d.label.slice(0, 2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] t-muted">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-court/80" /> Visiteurs (démo)</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-gold" /> Jour avec réservation</span>
            </div>
          </div>

          {/* Dernière réservation — en grand */}
          <div className="panel-court card-lift relative overflow-hidden rounded-[1.15rem] p-6" style={{ border: 'none' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold t-title">Dernière réservation</h2>
              {latestIsFresh && (
                <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#1a140a]">
                  <Bell className="h-3 w-3" />
                  À l'instant
                </span>
              )}
            </div>
            {latest ? (
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold font-display text-xl font-semibold text-[#1a140a]">
                    {(latest.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-display text-xl font-semibold t-title">{latest.name}</div>
                    <div className="text-sm t-muted">{latest.phone}</div>
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-white/8 p-4">
                  <div className="font-mono text-2xl font-bold t-gold">{latest.date} · {latest.time_slot}</div>
                  <div className="mt-1 text-sm t-soft">{latest.players ?? '—'} joueurs · {latest.level || '—'}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  {latest.phone && (
                    <>
                      <a href={`https://wa.me/${(latest.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-gold flex-1 py-2.5 text-xs">
                        <MessageCircle className="h-4 w-4" /> Confirmer
                      </a>
                      <a href={`tel:${latest.phone}`} className="btn-outline flex-1 py-2.5 text-xs">
                        <Phone className="h-4 w-4" /> Appeler
                      </a>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm t-muted">Aucune réservation pour le moment — faites-en une depuis le site, elle apparaît ici en direct.</p>
            )}
          </div>
        </div>

        {/* Présence web */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {webCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="card card-lift p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-court/10">
                    <Icon className="h-4 w-4 text-court" />
                  </div>
                  <span className="font-mono text-xl font-bold t-title">{c.score}<span className="text-xs t-muted">/100</span></span>
                </div>
                <div className="mt-3 text-sm font-semibold t-title">{c.title}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1e1b14]/8">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${c.score}%` }} />
                </div>
                <div className="mt-2 text-[11px] t-muted">{c.note}</div>
              </div>
            );
          })}
        </div>

        {/* QR + liste des réservations */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card card-lift flex flex-col items-center p-6 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/12">
              <QrIcon className="h-4 w-4 t-gold" />
            </div>
            <h2 className="font-display text-lg font-semibold t-title">Réserver en scannant</h2>
            <p className="mt-1 text-xs t-muted">Le client scanne → il arrive sur la réservation.</p>
            {origin && (
              <div className="mt-4 rounded-xl bg-white p-3">
                <QRCode value={`${origin}/${locale}#booking`} size={132} fgColor="#0d2c4f" />
              </div>
            )}
            <a href={`/${locale}/qr`} className="btn-outline mt-4 w-full py-2.5 text-xs font-medium">
              QR avis Google (imprimable)
            </a>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 font-display text-lg font-semibold t-title">Toutes les réservations</h2>
            {bookings.length === 0 ? (
              <div className="card card-lift p-10 text-center">
                <p className="text-sm t-muted">Aucune réservation. Cliquez « Données de démo » ou réservez depuis le site.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 30).map((b) => {
                  const created = b.created_at && isValid(parseISO(b.created_at)) ? parseISO(b.created_at) : null;
                  const phoneDigits = (b.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <div key={b.id} className="card card-lift flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold font-semibold text-[#1a140a]">
                          {(b.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold t-title">{b.name || '—'}</div>
                          <div className="text-xs t-muted">{b.phone || '—'}{created ? ` · reçu ${format(created, 'dd/MM HH:mm')}` : ''}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono font-semibold t-title">{b.date} · {b.time_slot}</span>
                        <span className="t-muted">{b.players ?? '—'} j.</span>
                        <div className="flex gap-1.5">
                          {phoneDigits && (
                            <>
                              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-2.5 py-1.5 text-xs" aria-label="WhatsApp">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <a href={`tel:${b.phone}`} className="btn-outline px-2.5 py-1.5 text-xs" aria-label="Appeler">
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs t-muted">
          Mode démonstration : les réservations s'affichent en direct sur cet appareil. Version production : synchronisation Firebase multi-appareils.
        </p>

      </div>
    </main>
  );
}

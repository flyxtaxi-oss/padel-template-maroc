"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { format, parseISO, isValid, subDays, addDays } from 'date-fns';
import { getBookings, saveBooking, type StoredBooking, getFeedbacks, saveFeedback, type StoredFeedback, updateLocalBookingStatus, type BookingStatus } from '@/lib/demoStore';
import { buildClientReplyUrl } from '@/lib/bookingDelivery';
import clubConfig from '@/config/club.config';
import { SITE_URL } from '@/lib/site';
import { useNow } from '@/lib/useNow';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import {
  Lock, Phone, MessageCircle, RefreshCw, CalendarDays, LogOut, CloudOff, Cloud, Check, X, Clock, Undo2,
  Eye, Banknote, TrendingUp, Globe, Search, Zap, Sparkles, QrCode as QrIcon, Bell, Star,
} from 'lucide-react';

// Code d'accès. Surchargeable via NEXT_PUBLIC_ADMIN_CODE dans .env.local /
// les variables d'environnement Vercel.
//
// ⚠️ Ce code est un garde-fou, PAS une authentification : étant préfixé
// NEXT_PUBLIC_, il est présent dans le bundle client et reste lisible par
// quelqu'un qui inspecte le JavaScript. Il empêche l'accès accidentel
// (visiteur, client, moteur de recherche), pas un accès déterminé.
// Pour une vraie protection : Firebase Auth ou Vercel Password Protection.
const DEFAULT_ADMIN_CODE = 'golden2026';
const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || DEFAULT_ADMIN_CODE;

// Vrai tant que NEXT_PUBLIC_ADMIN_CODE n'est pas défini : le code par défaut est
// alors public (il est écrit en clair dans le bundle JavaScript). Un bandeau
// l'affiche dans le tableau de bord pour qu'on ne puisse pas livrer sans le voir.
const USING_DEFAULT_CODE = !process.env.NEXT_PUBLIC_ADMIN_CODE;

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
  locale?: string;
  status?: BookingStatus;
  status_updated_at?: string;
};

/** Ancienne demande sans champ statut = en attente. */
const statusOf = (b: Booking): BookingStatus => b.status ?? 'pending';

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  declined: 'Refusée',
};

/** Données minimales pour rédiger la réponse WhatsApp au client. */
const toDraft = (b: Booking) => ({
  name: b.name || '',
  phone: b.phone || '',
  date: b.date || '',
  time_slot: b.time_slot || '',
  level: b.level || '',
  players: b.players ?? '',
  locale: b.locale,
});

const todayStr = (now: Date) => format(now, 'yyyy-MM-dd');

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

function seedDemoFeedbacks() {
  const now = Date.now();
  const demoFeedbacks: Array<[string, string, number, number]> = [
    ['Mehdi K.', 'Le terrain 3 glissait un peu hier soir. Sinon super installations.', 3, 1],
    ['Yasmine T.', "Dommage qu'il n'y ait pas de douches individuelles fermées dans le vestiaire des femmes.", 3, 2],
    ['Karim B.', 'Impossible de se garer facilement à 19h, le parking du Marjane était bondé.', 2, 3],
  ];
  demoFeedbacks.forEach(([name, comment, rating, hourDiff]) => {
    saveFeedback({
      id: `demo_fb_${now}_${hourDiff}`,
      rating,
      comment,
      name,
      phone: '+2126' + Math.floor(10000000 + Math.random() * 90000000),
      created_at: new Date(now - hourDiff * 3.5 * 60 * 60 * 1000).toISOString(),
      club_slug: clubConfig.slug,
    });
  });
}

export default function AdminPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';

  const [code, setCode] = useState('');
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbacks, setFeedbacks] = useState<StoredFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'feedbacks'>('bookings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mode de lecture des données, décidé par le serveur à chaque chargement.
  //  · 'remote'  : l'API a répondu — le gérant voit les demandes de TOUS les
  //                appareils. C'est le mode attendu en production.
  //  · 'local'   : backend non configuré. Le tableau de bord ne montre que ce
  //                qui a été réservé depuis CE navigateur. Un bandeau le dit.
  const [dataMode, setDataMode] = useState<'remote' | 'local'>('local');
  const [localReason, setLocalReason] = useState<string>('');

  const load = useCallback(async (accessCode: string, silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    // L'authentification est tranchée par le SERVEUR quand il est configuré :
    // c'est le seul contrôle réel, `NEXT_PUBLIC_ADMIN_CODE` étant lisible dans
    // le bundle. Le code client ne sert que de repli en mode démo, sinon un
    // ADMIN_CODE serveur différent du code public rendrait la connexion
    // impossible.
    //
    // Stockage local : les réservations faites depuis ce navigateur. Toujours
    // lu, y compris en mode distant, pour ne rien perdre en cas de coupure.
    const local = getBookings() as Booking[];
    const localFeedbacks = getFeedbacks() as StoredFeedback[];

    // Source distante : UNIQUEMENT via /api/admin/bookings. Une lecture
    // Firestore depuis le navigateur serait refusée par firestore.rules
    // (`allow read: if false`) — et exposerait les téléphones des clients.
    let remote: Booking[] = [];
    let remoteFeedbacks: StoredFeedback[] = [];
    let mode: 'remote' | 'local' = 'local';
    let reason = 'Sauvegarde distante non configurée.';

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        remote = (data.bookings ?? []) as Booking[];
        remoteFeedbacks = (data.feedbacks ?? []) as StoredFeedback[];
        mode = 'remote';
      } else if (res.status === 401) {
        // Le serveur fait autorité : code refusé, on s'arrête là.
        setError('Code incorrect');
        setLoading(false);
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        // Nuance décisive : un 503 `no_service_account` signifie que le serveur
        // a DÉJÀ validé le code (il n'échoue que sur Firebase). Le revalider
        // contre le code public interdirait la connexion dès que les deux
        // diffèrent. On ne retombe sur le contrôle local que lorsque le serveur
        // n'a pas pu authentifier du tout (`no_admin_code`).
        if (data.reason !== 'no_service_account' && ADMIN_CODE && accessCode !== ADMIN_CODE) {
          setError('Code incorrect');
          setLoading(false);
          return;
        }
        const base =
          data.reason === 'no_service_account'
            ? 'La clé de service Firebase (FIREBASE_SERVICE_ACCOUNT) n’est pas utilisable sur le serveur.'
            : data.reason === 'no_admin_code'
              ? 'Le code gérant serveur (ADMIN_CODE) n’est pas configuré.'
              : 'Le serveur n’a pas pu lire les données distantes.';
        // `detail` précise si la clé est absente, mal formée ou incomplète.
        reason = data.detail ? `${base} ${data.detail}` : base;
      }
    } catch {
      // Serveur injoignable (hors ligne, timeout) : même repli local.
      if (ADMIN_CODE && accessCode !== ADMIN_CODE) {
        setError('Code incorrect');
        setLoading(false);
        return;
      }
      reason = 'Serveur injoignable — affichage des données de cet appareil uniquement.';
    }

    setDataMode(mode);
    setLocalReason(reason);

    // Fusion par id : le distant fait foi, le local complète.
    const byId = new Map<string, Booking>();
    [...remote, ...local].forEach((b) => byId.set(b.id, b));
    const merged = [...byId.values()].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    const fbById = new Map<string, StoredFeedback>();
    [...remoteFeedbacks, ...localFeedbacks].forEach((f) => fbById.set(f.id, f));
    const mergedFeedbacks = [...fbById.values()].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    setBookings(merged);
    setFeedbacks(mergedFeedbacks);
    setAuthed(true);
    setLoading(false);
  }, []);

  // Confirmer / refuser une demande. Mise à jour optimiste de l'écran, puis
  // persistance : API serveur en mode synchronisé, stockage local sinon. Si le
  // serveur refuse (non configuré), on retombe sur le local sans bloquer le
  // gérant — il vient de cliquer, WhatsApp s'ouvre, l'écran doit suivre.
  const setStatus = useCallback(async (id: string, status: BookingStatus) => {
    const stamp = new Date().toISOString();
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status, status_updated_at: stamp } : b)));

    let persisted = false;
    if (dataMode === 'remote') {
      try {
        const res = await fetch('/api/admin/bookings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, id, status }),
          signal: AbortSignal.timeout(8000),
        });
        persisted = res.ok;
      } catch {
        persisted = false;
      }
    }
    // Toujours refléter en local : c'est aussi le cache hors ligne du gérant.
    updateLocalBookingStatus(id, status);
    if (!persisted && dataMode === 'remote') {
      setError('Statut enregistré sur cet appareil seulement — synchronisation impossible pour le moment.');
    }
  }, [dataMode, code]);

  // Horloge : source externe, lue via useSyncExternalStore pour ne pas rendre
  // le rendu impur (`new Date()` en plein render est interdit par React 19).
  const nowMs = useNow(60_000);
  const now = useMemo(() => (nowMs ? new Date(nowMs) : null), [nowMs]);

  // Accès direct si aucun code n'est configuré.
  useEffect(() => {
    if (ADMIN_CODE) return;
    // « Fetch on mount » assumé : `load` est asynchrone et les états qu'elle
    // pose viennent de la réponse, pas d'une cascade de rendus. La règle
    // set-state-in-effect ne distingue pas ce cas légitime du vrai anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load('');
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
    const ref = now ?? new Date(0);
    const t = todayStr(ref);
    const active = bookings.filter((b) => statusOf(b) !== 'declined');
    const total = bookings.length;
    const pending = bookings.filter((b) => statusOf(b) === 'pending').length;
    const visitors30 = Array.from({ length: 30 }).reduce<number>((acc, _, i) => acc + demoVisitors(subDays(ref, i)), 0);
    return {
      total,
      pending,
      today: active.filter((b) => b.date === t).length,
      upcoming: active.filter((b) => (b.date || '') >= t).length,
      revenue: active.length * PRICE_MAD,
      visitors30,
      conversion: total > 0 ? Math.min(12, (total / visitors30) * 100 + 2.4) : 2.4,
    };
  }, [bookings, now]);

  // Série du graphique : 14 derniers jours.
  const chart = useMemo(() => {
    const ref = now ?? new Date(0);
    const days = Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(ref, 13 - i);
      const key = format(d, 'yyyy-MM-dd');
      return {
        label: format(d, 'dd/MM'),
        visitors: demoVisitors(d),
        bookings: bookings.filter((b) => b.date === key || b.created_at?.startsWith(key)).length,
      };
    });
    const max = Math.max(...days.map((d) => d.visitors), 1);
    const maxBookings = Math.max(...days.map((d) => d.bookings), 1);
    return { days, max, maxBookings };
  }, [bookings, now]);

  // Priorité au gérant : la demande la plus récente encore à traiter.
  const latest = bookings.find((b) => statusOf(b) === 'pending') ?? bookings[0];
  const latestIsFresh = latest?.created_at && nowMs
    ? nowMs - new Date(latest.created_at).getTime() < 3 * 60 * 1000
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
          <label className="mt-7 mb-2 block text-xs font-medium t-muted">Code d’accès</label>
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
  // En mode synchronisé (production), tout ce qui est inventé disparaît :
  // visiteurs, conversion, scores « présence web », bouton de données de démo.
  // Un gérant ne doit jamais prendre une décision sur un chiffre fictif — ni
  // injecter de faux clients parmi les vrais d'un clic.
  const isDemo = dataMode === 'local';
  const allKpis = [
    { label: 'Visiteurs (30 j)', value: stats.visitors30.toLocaleString('fr-FR'), icon: Eye, demo: true, sub: '+18 % vs mois dernier' },
    { label: 'Réservations', value: `${stats.total}`, icon: CalendarDays, demo: false, sub: stats.pending ? `${stats.pending} à traiter · ${stats.upcoming} à venir` : `${stats.today} aujourd'hui · ${stats.upcoming} à venir` },
    { label: 'Revenus estimés', value: `${stats.revenue.toLocaleString('fr-FR')} MAD`, icon: Banknote, demo: false, sub: `${PRICE_MAD} MAD / créneau 90 min` },
    { label: 'Conversion', value: `${stats.conversion.toFixed(1).replace('.', ',')} %`, icon: TrendingUp, demo: true, sub: 'visiteurs → réservations' },
  ];
  const kpis = isDemo ? allKpis : allKpis.filter((k) => !k.demo);

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
        {/* État de synchronisation. Le tableau de bord affichait auparavant les
            données locales sans rien dire : le gérant croyait voir toutes ses
            réservations alors qu'il ne voyait que celles faites sur SON
            appareil. Ce bandeau est la différence entre un outil et un piège. */}
        {dataMode === 'local' ? (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-[#c0392b]/35 bg-[#c0392b]/8 p-4"
          >
            <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-[#c0392b]" />
            <div className="text-sm">
              <p className="font-semibold t-title">Mode local — vos clients ne sont pas visibles ici</p>
              <p className="mt-1 t-soft">
                Ce tableau de bord n’affiche que les réservations effectuées <strong>depuis ce navigateur</strong>.
                Une demande envoyée par un client depuis son téléphone n’apparaîtra pas. {localReason}
              </p>
              <p className="mt-2 t-muted">
                Pour activer la synchronisation : renseignez <code className="font-mono">FIREBASE_SERVICE_ACCOUNT</code>,{' '}
                <code className="font-mono">ADMIN_CODE</code> et les variables{' '}
                <code className="font-mono">NEXT_PUBLIC_FIREBASE_*</code>, puis redéployez. En attendant, les clients
                envoient leur demande au club via WhatsApp depuis le site.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-2 text-xs t-muted">
            <Cloud className="h-3.5 w-3.5 t-gold" />
            Synchronisé — les demandes de tous les appareils apparaissent ici.
          </div>
        )}

        {USING_DEFAULT_CODE && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-[#b98a2e]/40 bg-[#b98a2e]/10 p-4"
          >
            <Lock className="mt-0.5 h-4 w-4 shrink-0 t-gold" />
            <div className="text-sm">
              <p className="font-semibold t-title">Code d’accès par défaut</p>
              <p className="mt-1 t-soft">
                Cet espace utilise <code className="font-mono">{DEFAULT_ADMIN_CODE}</code>, écrit en clair dans le
                JavaScript envoyé au navigateur : n’importe quel visiteur peut le lire. Avant de mettre le site en
                ligne, définissez <code className="font-mono">ADMIN_CODE</code> et{' '}
                <code className="font-mono">NEXT_PUBLIC_ADMIN_CODE</code> avec <strong>la même valeur</strong> dans les
                variables d’environnement, puis redéployez. Le premier est le vrai contrôle (serveur) ; sans lui, le
                tableau de bord reste en mode local. Ce bandeau disparaîtra.
              </p>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-semibold t-title sm:text-3xl">Tableau de bord</h1>
              {isDemo && <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold t-gold">Aperçu démo</span>}
            </div>
            <p className="mt-1 text-sm t-muted">Golden Padel Club — vue d’ensemble en direct</p>
          </div>
          <div className="flex gap-2">
            {isDemo && (
              <button onClick={() => { seedDemoBookings(); seedDemoFeedbacks(); load(code); }} className="btn-outline px-4 py-2.5 text-sm font-medium cursor-pointer">
                <Sparkles className="h-4 w-4" />
                Données de démo
              </button>
            )}
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
                <h2 className="font-display text-lg font-semibold t-title">{isDemo ? 'Fréquentation du site' : 'Réservations'}</h2>
                <p className="text-xs t-muted">{isDemo ? '14 derniers jours · visiteurs (démo) et réservations' : '14 derniers jours · demandes reçues par jour'}</p>
              </div>
              {isDemo && <span className="rounded-full bg-court px-3 py-1 text-xs font-semibold text-cream">▲ 18 %</span>}
            </div>
            <div className="flex h-40 items-end gap-1.5">
              {chart.days.map((d, i) => (
                <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1" title={isDemo ? `${d.label} — ${d.visitors} visiteurs${d.bookings ? ` · ${d.bookings} résa` : ''}` : `${d.label} — ${d.bookings} réservation${d.bookings > 1 ? 's' : ''}`}>
                  {isDemo && d.bookings > 0 && <span className="h-2 w-2 rounded-full bg-gold" />}
                  <div
                    className="w-full rounded-t-md bg-court/80 transition-colors group-hover:bg-court"
                    style={{ height: `${isDemo ? Math.max(8, (d.visitors / chart.max) * 100) : (d.bookings ? Math.max(12, (d.bookings / chart.maxBookings) * 100) : 4)}%` }}
                  />
                  <span className="hidden text-[9px] t-muted sm:block">{d.label.slice(0, 2)}</span>
                </div>
              ))}
            </div>
            {isDemo && (
              <div className="mt-3 flex items-center gap-4 text-[11px] t-muted">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-court/80" /> Visiteurs (démo)</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-gold" /> Jour avec réservation</span>
              </div>
            )}
          </div>

          {/* Dernière réservation — en grand */}
          <div className="panel-court card-lift relative overflow-hidden rounded-[1.15rem] p-6" style={{ border: 'none' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold t-title">Dernière réservation</h2>
              {latestIsFresh && (
                <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold text-[#1a140a]">
                  <Bell className="h-3 w-3" />
                  À l’instant
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
                  {latest.phone && statusOf(latest) === 'pending' ? (
                    <>
                      {/* Un clic : le statut est enregistré ET WhatsApp s'ouvre avec la
                          réponse rédigée dans la langue du client. */}
                      <a href={buildClientReplyUrl(toDraft(latest), 'confirmed')} target="_blank" rel="noopener noreferrer" onClick={() => setStatus(latest.id, 'confirmed')} className="btn-gold flex-1 py-2.5 text-xs">
                        <Check className="h-4 w-4" /> Confirmer
                      </a>
                      <a href={buildClientReplyUrl(toDraft(latest), 'declined')} target="_blank" rel="noopener noreferrer" onClick={() => setStatus(latest.id, 'declined')} className="btn-outline flex-1 py-2.5 text-xs">
                        <X className="h-4 w-4" /> Refuser
                      </a>
                    </>
                  ) : (
                    <>
                      <span className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold ${statusOf(latest) === 'confirmed' ? 'bg-gold/20 t-gold' : 'bg-white/10 t-muted'}`}>
                        {statusOf(latest) === 'confirmed' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {STATUS_LABEL[statusOf(latest)]}
                      </span>
                      {latest.phone && (
                        <a href={`tel:${latest.phone}`} className="btn-outline flex-1 py-2.5 text-xs">
                          <Phone className="h-4 w-4" /> Appeler
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm t-muted">Aucune réservation pour le moment — faites-en une depuis le site, elle apparaît ici en direct.</p>
            )}
          </div>
        </div>

        {/* Présence web — scores illustratifs, mode démo uniquement */}
        {isDemo && <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        </div>}

        {/* QR + liste des réservations */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card card-lift flex flex-col items-center p-6 text-center">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/12">
              <QrIcon className="h-4 w-4 t-gold" />
            </div>
            <h2 className="font-display text-lg font-semibold t-title">Réserver en scannant</h2>
            <p className="mt-1 text-xs t-muted">Le client scanne → il arrive sur la réservation.</p>
            {SITE_URL && (
              <div className="mt-4 rounded-xl bg-white p-3">
                <QRCode value={`${SITE_URL}/${locale}#booking`} size={132} fgColor="#0d2c4f" />
              </div>
            )}
            <a href={`/${locale}/qr`} className="btn-outline mt-4 w-full py-2.5 text-xs font-medium">
              QR avis Google (imprimable)
            </a>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-5 border-b hair flex gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className={`pb-2 text-base font-semibold transition-colors relative cursor-pointer ${
                  activeTab === 'bookings' ? 't-title text-gold' : 't-muted hover:t-title'
                }`}
              >
                Réservations ({bookings.length})
                {activeTab === 'bookings' && (
                  <motion.div layoutId="admin-active-tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('feedbacks')}
                className={`pb-2 text-base font-semibold transition-colors relative cursor-pointer ${
                  activeTab === 'feedbacks' ? 't-title text-gold' : 't-muted hover:t-title'
                }`}
              >
                Retours clients ({feedbacks.length})
                {activeTab === 'feedbacks' && (
                  <motion.div layoutId="admin-active-tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-gold" />
                )}
              </button>
            </div>

            {activeTab === 'bookings' ? (
              bookings.length === 0 ? (
                <div className="card card-lift p-10 text-center">
                  <p className="text-sm t-muted">Aucune réservation. Cliquez « Données de démo » ou réservez depuis le site.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...bookings]
                    // Les demandes à traiter remontent en tête ; le reste garde l'ordre d'arrivée.
                    .sort((a, b) => Number(statusOf(b) === 'pending') - Number(statusOf(a) === 'pending'))
                    .slice(0, 30)
                    .map((b) => {
                    const created = b.created_at && isValid(parseISO(b.created_at)) ? parseISO(b.created_at) : null;
                    const phoneDigits = (b.phone || '').replace(/[^0-9]/g, '');
                    const st = statusOf(b);
                    return (
                      <div key={b.id} className={`card card-lift flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${st === 'declined' ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold font-semibold text-[#1a140a]">
                            {(b.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold t-title">
                              {b.name || '—'}
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                st === 'confirmed' ? 'bg-gold/15 t-gold' : st === 'declined' ? 'bg-[#1e1b14]/8 t-muted' : 'bg-court/10 text-court'
                              }`}>
                                {st === 'confirmed' ? <Check className="h-3 w-3" /> : st === 'declined' ? <X className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {STATUS_LABEL[st]}
                              </span>
                            </div>
                            <div className="text-xs t-muted">{b.phone || '—'}{created ? ` · reçu ${format(created, 'dd/MM HH:mm')}` : ''}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="font-mono font-semibold t-title">{b.date} · {b.time_slot}</span>
                          <span className="t-muted">{b.players ?? '—'} j.</span>
                          <div className="flex gap-1.5">
                            {st === 'pending' && phoneDigits ? (
                              <>
                                <a href={buildClientReplyUrl(toDraft(b), 'confirmed')} target="_blank" rel="noopener noreferrer" onClick={() => setStatus(b.id, 'confirmed')} className="btn-gold px-3 py-1.5 text-xs">
                                  <Check className="h-3.5 w-3.5" /> Confirmer
                                </a>
                                <a href={buildClientReplyUrl(toDraft(b), 'declined')} target="_blank" rel="noopener noreferrer" onClick={() => setStatus(b.id, 'declined')} className="btn-outline px-3 py-1.5 text-xs">
                                  <X className="h-3.5 w-3.5" /> Refuser
                                </a>
                              </>
                            ) : (
                              <button type="button" onClick={() => setStatus(b.id, 'pending')} className="btn-outline px-2.5 py-1.5 text-xs" aria-label="Remettre en attente" title="Remettre en attente">
                                <Undo2 className="h-3.5 w-3.5" />
                              </button>
                            )}
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
              )
            ) : (
              feedbacks.length === 0 ? (
                <div className="card card-lift p-10 text-center">
                  <p className="text-sm t-muted">Aucun retour client enregistré. Scannez le QR code avis et laissez une note de 1 à 3 pour tester.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.slice(0, 50).map((f) => {
                    const created = f.created_at && isValid(parseISO(f.created_at)) ? parseISO(f.created_at) : null;
                    const phoneDigits = (f.phone || '').replace(/[^0-9]/g, '');
                    return (
                      <div key={f.id} className="card card-lift flex flex-col gap-3.5 p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/12 font-semibold t-gold">
                              {(f.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold t-title flex items-center gap-2.5">
                                {f.name}
                                <span className="flex items-center gap-0.5 text-gold bg-gold/5 px-2.5 py-0.5 rounded-full border border-gold/10">
                                  {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star
                                      key={idx}
                                      className={`h-3 w-3 ${
                                        idx < f.rating ? 'fill-gold text-gold' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </span>
                              </div>
                              <div className="text-xs t-muted">
                                {f.phone}{created ? ` · reçu ${format(created, 'dd/MM HH:mm')}` : ''}
                              </div>
                            </div>
                          </div>
                          {phoneDigits && f.phone !== 'Non renseigné' && (
                            <div className="flex gap-1.5">
                              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-2.5 py-1.5 text-xs" aria-label="WhatsApp">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <a href={`tel:${f.phone}`} className="btn-outline px-2.5 py-1.5 text-xs" aria-label="Appeler">
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-sm t-soft bg-sand/30 p-4 rounded-xl border border-[#1e1b14]/5 italic">
                          « {f.comment} »
                        </p>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs t-muted">
          {isDemo
            ? 'Mode démonstration : les réservations s’affichent en direct sur cet appareil. Version production : synchronisation Firebase multi-appareils.'
            : 'Les demandes sont synchronisées entre tous les appareils. Actualisation automatique toutes les 4 secondes.'}
        </p>

      </div>
    </main>
  );
}

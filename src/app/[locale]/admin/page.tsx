"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { format, parseISO, isValid, subDays, addDays } from 'date-fns';
import { getBookings, saveBooking, type StoredBooking, getFeedbacks, saveFeedback, type StoredFeedback, updateLocalBookingStatus, type BookingStatus } from '@/lib/demoStore';
import { buildClientReplyUrl } from '@/lib/bookingDelivery';
import clubConfig from '@/config/club.config';
import { SITE_URL } from '@/lib/site';
import { useNow } from '@/lib/useNow';
import {
  occupancy, peakHours, clients, dayPlanning, revenueOfMonth, toCsv, slotsOfDay, COURTS, PRICE_MAD,
} from '@/lib/bookingStats';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import {
  Lock, Phone, MessageCircle, RefreshCw, CalendarDays, LogOut, CloudOff, Cloud, Check, X, Clock, Undo2,
  Eye, Banknote, TrendingUp, Globe, Search, Zap, Sparkles, QrCode as QrIcon, Bell, Star,
  LayoutGrid, Users, Download, BarChart3, Repeat,
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

type Booking = {
  id: string;
  name?: string;
  phone?: string;
  date?: string;
  time_slot?: string;
  level?: string;
  players?: number;
  court?: number;
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

// Numéros volontairement fictifs (+212 600 000 0xx, et la plage britannique
// +44 7700 900xxx réservée à la fiction) : chaque ligne du tableau de bord a
// un bouton WhatsApp, un clic pendant une démonstration ne doit ouvrir aucune
// conversation avec un inconnu.
const DEMO_NAMES: Array<[string, string, string, number]> = [
  ['Yassine Belghiti', '+212600000017', 'Intermédiaire', 4],
  ['Sara El Amrani', '+212600000018', 'Débutante', 2],
  ['Mehdi Chraibi', '+212600000019', 'Avancé (niveau 4)', 4],
  ['Carlos Pérez', '+212600000020', 'Intermedio', 3],
  ['Nadia Tazi', '+212600000021', 'Intermédiaire', 4],
  ['Omar Bennis', '+212600000022', 'Débutant', 2],
  ['Emma Wilson', '+447700900002', 'Intermediate', 4],
  ['Amine Ouazzani', '+212600000001', 'Intermédiaire', 4],
  ['Lina Berrada', '+212600000002', 'Débutante', 2],
  ['Hamza El Idrissi', '+212600000003', 'Avancé', 4],
  ['Salma Kettani', '+212600000004', 'Intermédiaire', 4],
  ['Youssef Alaoui', '+212600000005', 'Confirmé', 4],
  ['Ines Benjelloun', '+212600000006', 'Débutante', 2],
  ['Rachid Fassi', '+212600000007', 'Intermédiaire', 4],
  ['Kenza Lahlou', '+212600000008', 'Intermédiaire', 3],
  ['Anas Tahiri', '+212600000009', 'Avancé', 4],
  ['Meryem Sebti', '+212600000010', 'Débutante', 2],
  ['Javier Morales', '+212600000011', 'Avanzado', 4],
  ['Lucía Fernández', '+212600000012', 'Intermedio', 4],
  ['Thomas Girard', '+212600000013', 'Intermédiaire', 4],
  ['Camille Martin', '+212600000014', 'Débutante', 2],
  ['James Carter', '+447700900001', 'Advanced', 4],
  ['Othmane Rami', '+212600000015', 'Intermédiaire', 4],
  ['Zineb Chami', '+212600000016', 'Intermédiaire', 4],
];

// Réservations de démonstration. Les créneaux et les terrains sont ceux que le
// club propose réellement (`slotsOfDay`) : sans cela, le planning des terrains
// resterait vide pendant une présentation, chaque demande tombant « hors
// grille ». Une semaine complète est semée, avec une rotation de clients qui
// reviennent : c'est ce qui fait vivre le remplissage et les clients fidèles.
function seedDemoBookings() {
  const now = Date.now();
  const today = format(new Date(), 'yyyy-MM-dd');
  const slots = slotsOfDay(today);

  // Profil de fréquentation d'un club qui tourne : matinées calmes, soirées
  // pleines. Un nombre de terrains occupés par créneau, dans l'ordre des
  // créneaux de la journée ; le week-end remplit aussi l'après-midi.
  // La première version ne semait que 9 réservations : le tableau de bord
  // affichait « Remplissage 3 % » pendant la démonstration — ce qu'un gérant
  // lit comme « club vide », exactement l'inverse du message.
  const weekday = [0, 1, 1, 0, 1, 2, 3, 4, 4, 2];
  const weekend = [1, 2, 2, 2, 3, 3, 4, 4, 4, 3];

  let i = 0;
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = addDays(new Date(), dayOffset);
    const profile = [0, 6].includes(day.getDay()) ? weekend : weekday;
    const date = format(day, 'yyyy-MM-dd');
    slots.forEach((time_slot, s) => {
      const count = Math.min(COURTS.length, profile[s] ?? 0);
      for (let court = 1; court <= count; court++) {
        // Rotation des clients : certains reviennent plusieurs fois dans la
        // semaine, ce qui alimente la carte « clients fidèles ».
        const [name, phone, level, players] = DEMO_NAMES[i % DEMO_NAMES.length];
        saveBooking({
          id: `demo_${now}_${i}`,
          name,
          phone,
          level,
          players,
          court,
          date,
          time_slot,
          // Les demandes les plus proches restent « en attente » : le gérant a
          // de quoi traiter à l'écran, bouton Confirmer compris.
          status: dayOffset === 0 && court === count && s >= slots.length - 3 ? 'pending' : 'confirmed',
          created_at: new Date(now - i * 37 * 60 * 1000).toISOString(),
          club_slug: clubConfig.slug,
        } as StoredBooking);
        i++;
      }
    });
  }
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

  // Statuts cliqués par le gérant et pas encore reflétés par une lecture.
  // Le tableau de bord se rafraîchit toutes les 4 s : une lecture partie AVANT
  // un clic, ralentie par le réseau, revenait APRÈS lui avec l'ancien statut,
  // et le badge repassait « En attente » sous les yeux du gérant (« j'ai
  // confirmé et ça n'a pas pris »). Chaque override tient jusqu'à ce que la
  // source affiche le même statut, 30 s au plus.
  const statusOverrides = useRef(new Map<string, { status: BookingStatus; at: number }>());

  const load = useCallback(async (accessCode: string, silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    // L'authentification est tranchée par le SERVEUR quand il est configuré :
    // c'est le seul contrôle réel, `NEXT_PUBLIC_ADMIN_CODE` étant lisible dans
    // le bundle. Le code client ne sert que de repli en mode démo, sinon un
    // ADMIN_CODE serveur différent du code public rendrait la connexion
    // impossible.

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

    // Stockage local lu APRÈS le réseau : il reflète ainsi un clic survenu
    // pendant l'attente. Toujours lu, y compris en mode distant, pour ne rien
    // perdre en cas de coupure.
    const local = getBookings() as Booking[];
    const localFeedbacks = getFeedbacks() as StoredFeedback[];

    // Fusion par id : le distant fait foi (placé en dernier, il écrase la copie
    // locale), le local complète ce que le serveur ne connaît pas.
    const byId = new Map<string, Booking>();
    [...local, ...remote].forEach((b) => byId.set(b.id, b));

    // Clics récents non encore reflétés : on les garde affichés.
    const nowTs = Date.now();
    for (const [id, o] of statusOverrides.current) {
      const b = byId.get(id);
      if (!b || statusOf(b) === o.status || nowTs - o.at > 30_000) {
        statusOverrides.current.delete(id);
      } else {
        byId.set(id, { ...b, status: o.status });
      }
    }
    const merged = [...byId.values()].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    const fbById = new Map<string, StoredFeedback>();
    [...localFeedbacks, ...remoteFeedbacks].forEach((f) => fbById.set(f.id, f));
    const mergedFeedbacks = [...fbById.values()].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    setBookings(merged);
    setFeedbacks(mergedFeedbacks);
    setAuthed(true);
    setLoading(false);

    // Empreinte de l'état lu : elle sert au sondage adaptatif ci-dessous à
    // savoir si quoi que ce soit a bougé depuis la fois précédente. Elle tient
    // compte des statuts, pas seulement du nombre : confirmer une demande est
    // un changement, même à effectif constant.
    return `${merged.length}:${mergedFeedbacks.length}:${merged[0]?.created_at ?? ''}:${merged
      .map((b) => statusOf(b))
      .join('')}`;
  }, []);

  // Confirmer / refuser une demande. Mise à jour optimiste de l'écran, puis
  // persistance : API serveur en mode synchronisé, stockage local sinon. Si le
  // serveur refuse (non configuré), on retombe sur le local sans bloquer le
  // gérant — il vient de cliquer, WhatsApp s'ouvre, l'écran doit suivre.
  const setStatus = useCallback(async (id: string, status: BookingStatus) => {
    const stamp = new Date().toISOString();
    statusOverrides.current.set(id, { status, at: Date.now() });
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

  /**
   * Rafraîchissement en direct — et sobre en lectures Firestore.
   *
   * La première version sondait toutes les 4 secondes, sans condition. Chaque
   * sondage relit les réservations ET les retours clients : à 60 documents par
   * passage, cela fait 54 000 lectures par heure. Le quota gratuit de Firestore
   * (50 000 lectures/jour) était donc épuisé en **56 minutes** : passé ce
   * délai, le gérant n'avait plus qu'un message d'erreur jusqu'au lendemain —
   * et sur le plan payant, la facture montait pour rien.
   *
   * Quatre garde-fous, sans rien perdre du « direct » ressenti :
   *  · 15 s entre deux sondages quand le club bouge ;
   *  · cadence ralentie jusqu'à 60 s après trois lectures identiques — un club
   *    calme à 15 h n'a pas besoin d'être interrogé quatre fois par minute, et
   *    la moindre nouveauté fait immédiatement repasser à 15 s ;
   *  · rien tant que l'onglet est en arrière-plan — personne ne regarde ;
   *  · rien après 5 minutes sans le moindre geste : un écran allumé dans un
   *    bureau vide ne consomme plus.
   * Dans tous les cas, le retour du gérant (onglet au premier plan, clic,
   * touche, molette) déclenche une lecture immédiate : l'écran est à jour avant
   * qu'il ait fini de s'asseoir.
   */
  useEffect(() => {
    if (!authed) return;

    const FAST = 15_000;
    const SLOW = 60_000;
    const IDLE_AFTER = 5 * 60_000;

    let lastActivity = Date.now();
    let delay = FAST;
    let quiet = 0;
    let signature = '';
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const schedule = () => {
      if (stopped) return;
      timer = setTimeout(tick, delay);
    };

    const tick = async () => {
      const awake =
        document.visibilityState === 'visible' && Date.now() - lastActivity <= IDLE_AFTER;

      if (awake) {
        const sig = await load(code, true);
        if (sig !== undefined) {
          if (sig === signature) {
            quiet += 1;
            if (quiet >= 3) delay = SLOW;
          } else {
            signature = sig;
            quiet = 0;
            delay = FAST;
          }
        }
      }
      schedule();
    };

    // Réveil : lecture immédiate et retour à la cadence rapide.
    const wakeNow = () => {
      lastActivity = Date.now();
      quiet = 0;
      delay = FAST;
      clearTimeout(timer);
      tick();
    };

    const onActivity = () => {
      // Un simple geste ne déclenche pas de requête ; il ne fait que repousser
      // la mise en veille. Seule une vraie reprise (veille ou onglet caché)
      // relance une lecture.
      const wasIdle = Date.now() - lastActivity > IDLE_AFTER;
      lastActivity = Date.now();
      if (wasIdle) wakeNow();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') wakeNow();
    };

    const onStorage = () => wakeNow();

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    for (const ev of ['pointerdown', 'keydown', 'wheel'] as const) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
    schedule();

    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
      for (const ev of ['pointerdown', 'keydown', 'wheel'] as const) {
        window.removeEventListener(ev, onActivity);
      }
    };
  }, [authed, code, load]);

  const stats = useMemo(() => {
    const ref = now ?? new Date(0);
    const t = todayStr(ref);
    const active = bookings.filter((b) => statusOf(b) !== 'declined');
    const total = bookings.length;
    const pending = bookings.filter((b) => statusOf(b) === 'pending').length;
    const visitors30 = Array.from({ length: 30 }).reduce<number>((acc, _, i) => acc + demoVisitors(subDays(ref, i)), 0);

    // Mesures réelles : elles valent autant en démo qu'en production, et ce
    // sont elles qui font vivre le tableau de bord une fois Firebase branché.
    const occ = occupancy(bookings, t, 7);
    const clientList = clients(bookings);
    const recurring = clientList.filter((c) => c.visits > 1).length;

    return {
      total,
      pending,
      today: active.filter((b) => b.date === t).length,
      upcoming: active.filter((b) => (b.date || '') >= t).length,
      revenue: active.length * PRICE_MAD,
      revenueMonth: revenueOfMonth(bookings, t.slice(0, 7)),
      occupancy: occ,
      clientList,
      recurring,
      visitors30,
      conversion: total > 0 ? Math.min(12, (total / visitors30) * 100 + 2.4) : 2.4,
    };
  }, [bookings, now]);

  // Planning : aujourd'hui par défaut, demain d'un clic (le gérant prépare sa soirée).
  const [planningOffset, setPlanningOffset] = useState(0);
  const planningDate = useMemo(
    () => (now ? todayStr(addDays(now, planningOffset)) : ''),
    [now, planningOffset],
  );
  const planning = useMemo(
    () => (planningDate ? dayPlanning(bookings, planningDate) : null),
    [bookings, planningDate],
  );

  const peaks = useMemo(() => peakHours(bookings), [bookings]);
  const peakMax = Math.max(1, ...peaks.map((p) => p.count));

  // Export tableur : fichier construit dans le navigateur, rien n'est envoyé.
  const exportCsv = useCallback(() => {
    const blob = new Blob([toCsv(bookings)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${clubConfig.slug}-${todayStr(now ?? new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  // KPIs calculés sur les vraies réservations : ils restent identiques une fois
  // le site en production. Les deux cartes « démo » (visiteurs, conversion)
  // s'ajoutent en plus, et disparaissent dès que la synchronisation est active.
  const realKpis = [
    { label: 'Réservations', value: `${stats.total}`, icon: CalendarDays, demo: false, sub: stats.pending ? `${stats.pending} à traiter · ${stats.upcoming} à venir` : `${stats.today} aujourd'hui · ${stats.upcoming} à venir` },
    { label: 'Remplissage', value: `${Math.round(stats.occupancy.rate * 100)} %`, icon: LayoutGrid, demo: false, sub: `${stats.occupancy.booked} / ${stats.occupancy.capacity} créneaux · 7 jours à venir` },
    { label: 'Revenus du mois', value: `${stats.revenueMonth.toLocaleString('fr-FR')} MAD`, icon: Banknote, demo: false, sub: `${PRICE_MAD} MAD / créneau 90 min` },
    { label: 'Clients', value: `${stats.clientList.length}`, icon: Users, demo: false, sub: stats.recurring ? `dont ${stats.recurring} fidèle${stats.recurring > 1 ? 's' : ''} (2 venues et +)` : 'clients uniques identifiés' },
  ];
  const demoKpis = [
    { label: 'Visiteurs (30 j)', value: stats.visitors30.toLocaleString('fr-FR'), icon: Eye, demo: true, sub: '+18 % vs mois dernier' },
    { label: 'Conversion', value: `${stats.conversion.toFixed(1).replace('.', ',')} %`, icon: TrendingUp, demo: true, sub: 'visiteurs → réservations' },
  ];
  const kpis = isDemo ? [...realKpis, ...demoKpis] : realKpis;

  // Visibilité web : des FAITS vérifiables (chaque ligne renvoie au fichier que
  // Google ou une IA lit réellement), et non un score inventé sur 100. Un
  // gérant peut cliquer et voir. C'est ce qui reste affichable en production.
  const webFacts = [
    { icon: Search, title: 'SEO', note: 'Sitemap, balises, données structurées', href: '/sitemap.xml', link: 'sitemap.xml' },
    { icon: Sparkles, title: 'AEO / IA', note: 'Fiche lisible par ChatGPT, Gemini, Perplexity', href: '/llms.txt', link: 'llms.txt' },
    { icon: Globe, title: 'GEO / local', note: 'Fiche lieu, horaires, carte, 4 langues', href: `/${locale}#contact`, link: 'FR · EN · AR · ES' },
    { icon: Zap, title: 'Indexation', note: 'Espace gérant exclu des moteurs', href: '/robots.txt', link: 'robots.txt' },
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
            <button
              onClick={exportCsv}
              className="btn-outline px-4 py-2.5 text-sm font-medium cursor-pointer"
              disabled={bookings.length === 0}
              title="Télécharger toutes les réservations (Excel)"
            >
              <Download className="h-4 w-4" />
              Export
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
        <div className={`mb-6 grid grid-cols-2 gap-4 ${isDemo ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
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
                  {latest.court && <div className="mt-1 text-xs font-semibold t-gold">Terrain {latest.court} · réservé en ligne</div>}
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

        {/* Planning du jour — une ligne par terrain, une colonne par créneau.
            C'est l'écran que le gérant ouvre le matin : qui joue, où, à quelle
            heure, et quels créneaux restent à vendre ce soir. */}
        <div className="card card-lift mb-6 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold t-title">Planning des terrains</h2>
              <p className="text-xs t-muted">
                {planning
                  ? `${planning.rows.reduce((n, r) => n + r.cells.filter((c) => c.booking).length, 0)} créneau(x) occupé(s) sur ${planning.slots.length * COURTS.length}`
                  : '—'}
              </p>
              <p className="mt-1.5 flex items-center gap-3 text-[11px] t-muted">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded-sm bg-court" /> Confirmé</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded-sm border border-dashed border-gold bg-gold/15" /> En attente</span>
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((off) => (
                <button
                  key={off}
                  type="button"
                  onClick={() => setPlanningOffset(off)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    planningOffset === off ? 'bg-court text-cream' : 'bg-[#1e1b14]/6 t-muted hover:t-title'
                  }`}
                >
                  {off === 0 ? "Aujourd'hui" : off === 1 ? 'Demain' : 'Après-demain'}
                </button>
              ))}
            </div>
          </div>

          {!planning || planning.slots.length === 0 ? (
            <p className="text-sm t-muted">Aucun créneau ce jour-là.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-1">
                <thead>
                  <tr>
                    <th className="w-20 text-left text-[11px] font-medium t-muted">Terrain</th>
                    {planning.slots.map((s) => (
                      <th key={s} className="font-mono text-[11px] font-medium t-muted">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planning.rows.map((row) => (
                    <tr key={row.court}>
                      <td className="text-xs font-semibold t-title">T{row.court}</td>
                      {row.cells.map((cell) => (
                        <td key={cell.slot} className="p-0">
                          {cell.booking ? (
                            // En attente ≠ confirmé : le gérant voit d'un coup
                            // d'œil ce qui est acquis et ce qu'il doit encore
                            // rappeler avant de considérer le terrain vendu.
                            <div
                              className={`truncate rounded-lg px-2 py-2 text-[11px] font-semibold ${
                                statusOf(cell.booking as Booking) === 'pending'
                                  ? 'border border-dashed border-gold bg-gold/15 t-title'
                                  : 'bg-court text-cream'
                              }`}
                              title={`${cell.booking.name} · ${cell.booking.phone} · ${cell.booking.players ?? '—'} joueurs · ${STATUS_LABEL[statusOf(cell.booking as Booking)]}`}
                            >
                              {(cell.booking.name || '—').split(' ')[0]}
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-[#1e1b14]/12 px-2 py-2 text-center text-[11px] t-muted">
                              libre
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {planning && planning.unassigned.length > 0 && (
            <p className="mt-4 rounded-xl bg-gold/10 p-3 text-xs t-soft">
              <strong>{planning.unassigned.length} demande(s)</strong> sans terrain attribué ce jour-là
              ({planning.unassigned.map((b) => `${b.name} ${b.time_slot}`).join(', ')}) — reçues avant la
              réservation instantanée, à placer à la main.
            </p>
          )}
        </div>

        {/* Heures de pointe + clients fidèles — deux décisions concrètes :
            quand ouvrir/renforcer, et qui rappeler. */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <div className="card card-lift p-6">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 t-gold" />
              <h2 className="font-display text-lg font-semibold t-title">Heures de pointe</h2>
            </div>
            {stats.total === 0 ? (
              <p className="text-sm t-muted">Les créneaux les plus demandés apparaîtront ici dès les premières réservations.</p>
            ) : (
              <div className="space-y-2">
                {peaks.map((p) => (
                  <div key={p.time} className="flex items-center gap-3">
                    <span className="w-12 font-mono text-xs t-muted">{p.time}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#1e1b14]/6">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${(p.count / peakMax) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right font-mono text-xs t-title">{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card-lift p-6">
            <div className="mb-4 flex items-center gap-2">
              <Repeat className="h-4 w-4 t-gold" />
              <h2 className="font-display text-lg font-semibold t-title">Clients fidèles</h2>
            </div>
            {stats.clientList.length === 0 ? (
              <p className="text-sm t-muted">Chaque réservation identifie un client par son numéro. Les habitués remonteront ici.</p>
            ) : (
              <div className="space-y-2.5">
                {stats.clientList.slice(0, 6).map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold t-title">{c.name}</div>
                      <div className="text-xs t-muted">{c.phone}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold t-gold">{c.visits}×</span>
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline px-2.5 py-1.5 text-xs"
                        aria-label={`Écrire à ${c.name}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibilité web — des faits cliquables, pas des scores inventés. */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {webFacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="card card-lift p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-court/10">
                  <Icon className="h-4 w-4 text-court" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold t-title">
                  {c.title}
                  <Check className="h-3.5 w-3.5 t-gold" />
                </div>
                <div className="mt-1.5 text-[11px] t-muted">{c.note}</div>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-block font-mono text-[11px] t-gold underline underline-offset-2"
                >
                  {c.link}
                </a>
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
                          <span className="font-mono font-semibold t-title">{b.date} · {b.time_slot}{b.court ? ` · T${b.court}` : ''}</span>
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

import type { ClubConfig, EventItem, LocalizedString } from '@/config/club.config';

/**
 * Réglages du club modifiables par le gérant depuis l'onglet « Mon club ».
 *
 * `club.config.ts` reste la source des valeurs par défaut (et de tout ce que le
 * gérant ne touche pas : photos, FAQ, SEO…). Ce qui est enregistré ici vient
 * par-dessus. Un champ absent = valeur du fichier de config.
 *
 * Module pur, sans dépendance serveur : utilisé à la fois par l'API (validation)
 * et par le formulaire du tableau de bord.
 */
export type ClubSettings = {
  pricing?: { court?: number; racket?: number };
  /** Même plage tous les jours, comme le moteur de créneaux. 'HH:MM'. */
  hours?: { open: string; close: string };
  /** Fermetures exceptionnelles : aucun créneau réservable ces jours-là. */
  closedDates?: string[];
  contact?: { phone?: string; whatsapp?: string; instagram?: string; address?: string };
  texts?: { tagline?: LocalizedString; heroPitch?: LocalizedString; about?: LocalizedString };
  events?: EventItem[];
  updated_at?: string;
};

export const SETTINGS_LOCALES = ['fr', 'en', 'es', 'ar'] as const;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Valeurs actuellement en vigueur, pour pré-remplir le formulaire. */
export function editableFrom(club: ClubConfig): Required<Omit<ClubSettings, 'updated_at'>> {
  const range = Object.values(club.openingHours)[0] ?? '09:00 - 00:00';
  const [open = '09:00', close = '00:00'] = range.split('-').map((s) => s.trim());
  return {
    pricing: { court: club.pricing[0]?.price ?? 0, racket: club.pricing[1]?.price ?? 0 },
    hours: { open, close },
    closedDates: club.closedDates ?? [],
    contact: {
      phone: club.contact.phone,
      whatsapp: club.contact.whatsapp,
      instagram: club.contact.instagram,
      address: club.contact.address,
    },
    texts: { tagline: { ...club.tagline }, heroPitch: { ...club.hero.pitch }, about: { ...club.about.text } },
    events: club.events ?? [],
  };
}

/** Applique les réglages sur la config par défaut, sans la modifier. */
export function applySettings(base: ClubConfig, s: ClubSettings | null | undefined): ClubConfig {
  if (!s) return base;
  const club: ClubConfig = structuredClone(base);

  if (s.pricing) {
    if (club.pricing[0] && typeof s.pricing.court === 'number') club.pricing[0].price = s.pricing.court;
    if (club.pricing[1] && typeof s.pricing.racket === 'number') club.pricing[1].price = s.pricing.racket;
  }
  if (s.hours) {
    const range = `${s.hours.open} - ${s.hours.close}`;
    club.openingHours = Object.fromEntries(Object.keys(club.openingHours).map((d) => [d, range]));
  }
  if (s.closedDates) club.closedDates = s.closedDates;
  if (s.contact) {
    club.contact = { ...club.contact, ...stripEmpty(s.contact) };
    // Les demandes WhatsApp du formulaire partent vers ce numéro : il suit le
    // WhatsApp saisi par le gérant (sauf réservation déléguée à une URL externe).
    if (s.contact.whatsapp?.trim() && club.bookingMode !== 'external') club.reservation = { value: s.contact.whatsapp };
  }
  if (s.texts?.tagline) club.tagline = mergeLocalized(club.tagline, s.texts.tagline);
  if (s.texts?.heroPitch) club.hero.pitch = mergeLocalized(club.hero.pitch, s.texts.heroPitch);
  if (s.texts?.about) club.about.text = mergeLocalized(club.about.text, s.texts.about);
  if (s.events) club.events = s.events;
  return club;
}

function stripEmpty<T extends Record<string, string | undefined>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => typeof v === 'string' && v.trim())) as Partial<T>;
}

/** Une langue laissée vide garde le texte d'origine plutôt que d'afficher un trou. */
function mergeLocalized(base: LocalizedString, over: LocalizedString): LocalizedString {
  const out: LocalizedString = { ...base };
  for (const [k, v] of Object.entries(over)) if (v.trim()) out[k] = v;
  return out;
}

// ── Validation ───────────────────────────────────────────────────────────
// Tout ce qui arrive du navigateur est reconstruit champ par champ : rien
// d'inattendu n'atteint la base ni le site public.

type Result = { ok: true; settings: ClubSettings } | { ok: false; error: string };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function price(v: unknown, label: string): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100_000 || Math.round(n) !== n) {
    throw new Error(`${label} : un nombre entier entre 0 et 100 000 est attendu.`);
  }
  return n;
}

function localized(v: unknown, max: number): LocalizedString {
  const out: LocalizedString = {};
  if (v && typeof v === 'object') {
    for (const l of SETTINGS_LOCALES) {
      const text = str((v as Record<string, unknown>)[l], max);
      if (text) out[l] = text;
    }
  }
  return out;
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function sanitizeSettings(input: unknown): Result {
  try {
    const i = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
    const s: ClubSettings = {};

    if (i.pricing && typeof i.pricing === 'object') {
      const p = i.pricing as Record<string, unknown>;
      s.pricing = { court: price(p.court, 'Prix du terrain'), racket: price(p.racket, 'Location de raquette') };
    }

    if (i.hours && typeof i.hours === 'object') {
      const h = i.hours as Record<string, unknown>;
      const open = str(h.open, 5);
      const close = str(h.close, 5);
      if (!TIME.test(open) || !TIME.test(close)) throw new Error('Horaires : format HH:MM attendu (ex. 07:00).');
      if (open === close) throw new Error('Horaires : l’ouverture et la fermeture sont identiques.');
      s.hours = { open, close };
    }

    if (Array.isArray(i.closedDates)) {
      const dates = [...new Set(i.closedDates.map((d) => str(d, 10)).filter((d) => DATE.test(d)))].sort();
      s.closedDates = dates.slice(0, 120);
    }

    if (i.contact && typeof i.contact === 'object') {
      const c = i.contact as Record<string, unknown>;
      const phone = str(c.phone, 30);
      const whatsapp = str(c.whatsapp, 30);
      const instagram = str(c.instagram, 200);
      const address = str(c.address, 200);
      for (const [label, value] of [['Téléphone', phone], ['WhatsApp', whatsapp]] as const) {
        const digits = value.replace(/\D/g, '');
        if (value && (digits.length < 8 || digits.length > 15 || !/^[+\d\s().-]+$/.test(value))) {
          throw new Error(`${label} : numéro invalide (8 à 15 chiffres, ex. +212 6 12 34 56 78).`);
        }
      }
      if (instagram && !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/.test(instagram)) {
        throw new Error('Instagram : lien attendu de la forme https://www.instagram.com/nomdecompte');
      }
      s.contact = { phone, whatsapp, instagram, address };
    }

    if (i.texts && typeof i.texts === 'object') {
      const t = i.texts as Record<string, unknown>;
      s.texts = {
        tagline: localized(t.tagline, 120),
        heroPitch: localized(t.heroPitch, 400),
        about: localized(t.about, 900),
      };
    }

    if (Array.isArray(i.events)) {
      const used = new Set<string>();
      s.events = i.events.slice(0, 12).map((raw, n) => {
        const e = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        const title = localized(e.title, 120);
        if (!title.fr) throw new Error(`Événement ${n + 1} : le titre en français est obligatoire.`);
        const date = str(e.date, 10);
        if (!DATE.test(date)) throw new Error(`Événement « ${title.fr} » : date invalide.`);
        let id = slugify(str(e.id, 48)) || slugify(`${title.fr}-${date}`) || `evenement-${n + 1}`;
        while (used.has(id)) id = `${id}-${n + 1}`;
        used.add(id);
        const prize = Number(e.prizeMAD);
        return {
          id,
          title,
          date,
          format: str(e.format, 20),
          prizeMAD: Number.isFinite(prize) && prize >= 0 ? Math.min(Math.round(prize), 10_000_000) : 0,
          description: localized(e.description, 600),
        };
      });
    }

    return { ok: true, settings: s };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Données invalides.' };
  }
}

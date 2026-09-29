'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Banknote, Clock, Phone, Type, Trophy, Plus, Trash2, Check, RotateCcw, ExternalLink, CalendarX, AlertTriangle,
} from 'lucide-react';
import type { ClubConfig, EventItem, LocalizedString } from '@/config/club.config';
import { getSlotsForDate } from '@/lib/schedule';

/**
 * Onglet « Mon club » : le gérant modifie lui-même ce qui change souvent —
 * tarifs, horaires, fermetures, contact, textes, tournois. Enregistrer met le
 * site public à jour en quelques secondes (voir /api/admin/settings).
 */

type Values = {
  pricing: { court: number; racket: number };
  hours: { open: string; close: string };
  closedDates: string[];
  contact: { phone: string; whatsapp: string; instagram: string; address: string };
  texts: { tagline: LocalizedString; heroPitch: LocalizedString; about: LocalizedString };
  events: EventItem[];
};

type Props = {
  locale: string;
  /** Appelé après un enregistrement réussi, avec la config désormais en vigueur. */
  onSaved: (club: ClubConfig) => void;
  /** Session expirée pendant l'édition. */
  onUnauthorized: () => void;
};

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
] as const;

const inputCls =
  'w-full rounded-xl border border-[#1e1b14]/12 bg-white px-3.5 py-3 text-sm text-[#1e1b14] outline-none transition-colors placeholder-[#1e1b14]/35 focus:border-gold';
const labelCls = 'mb-1.5 block text-xs font-medium t-muted';

function Section({ icon: Icon, title, hint, children }: { icon: typeof Clock; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card card-lift p-6 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/12">
          <Icon className="h-4 w-4 t-gold" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold t-title">{title}</h2>
          {hint && <p className="mt-0.5 text-xs t-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ClubSettingsPanel({ locale, onSaved, onUnauthorized }: Props) {
  const [values, setValues] = useState<Values | null>(null);
  const [initial, setInitial] = useState<string>('');
  const [club, setClub] = useState<ClubConfig | null>(null);
  const [storage, setStorage] = useState<'firestore' | 'file' | 'none'>('none');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [lang, setLang] = useState<(typeof LANGS)[number]['code']>('fr');
  const [newClosed, setNewClosed] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lecture impossible');
      setValues(data.values);
      setInitial(JSON.stringify(data.values));
      setClub(data.club);
      setStorage(data.storage);
      setUpdatedAt(data.updatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lecture impossible');
    }
  }, [onUnauthorized]);

  useEffect(() => {
    // Chargement initial des réglages : les états posés viennent de la réponse.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const dirty = values !== null && JSON.stringify(values) !== initial;

  // Prévient la perte de modifications en quittant la page.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof Values>(key: K, v: Values[K]) => {
    setSaved(false);
    setValues((prev) => (prev ? { ...prev, [key]: v } : prev));
  };

  // Aperçu des créneaux produits par les horaires saisis.
  const slotPreview = useMemo(() => {
    if (!values || !club) return [];
    const range = `${values.hours.open} - ${values.hours.close}`;
    const preview: ClubConfig = { ...club, closedDates: [], openingHours: { all: range } };
    return getSlotsForDate('2000-01-01', { dateStr: '', minutes: 0 }, preview);
  }, [values, club]);

  const save = async () => {
    if (!values) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Enregistrement impossible');
      setValues(data.values);
      setInitial(JSON.stringify(data.values));
      setClub(data.club);
      setUpdatedAt(new Date().toISOString());
      setSaved(true);
      onSaved(data.club);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  if (!values) {
    return (
      <div className="card card-lift p-10 text-center text-sm t-muted" role="status">
        {error ? <span className="text-[#c0392b]">{error}</span> : 'Chargement des réglages…'}
      </div>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingClosed = values.closedDates.filter((d) => d >= today);
  const perPlayer = Math.round(values.pricing.court / 4);
  const isAr = lang === 'ar';

  const setText = (field: keyof Values['texts'], text: string) =>
    set('texts', { ...values.texts, [field]: { ...values.texts[field], [lang]: text } });

  const updateEvent = (i: number, patch: Partial<EventItem>) =>
    set('events', values.events.map((e, n) => (n === i ? { ...e, ...patch } : e)));

  return (
    <div className="pb-28">
      {storage === 'none' && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-[#c0392b]/35 bg-[#c0392b]/8 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#c0392b]" />
          <p className="t-soft">
            <strong className="t-title">Enregistrement indisponible.</strong> La base de données n’est pas configurée
            (<code className="font-mono">FIREBASE_SERVICE_ACCOUNT</code>). Les valeurs affichées sont celles du site.
          </p>
        </div>
      )}
      {storage === 'file' && (
        <p className="mb-6 text-xs t-muted">
          Mode développement : les réglages sont enregistrés dans <code className="font-mono">.data/club-settings.json</code>.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm t-muted">
          Modifiez vos informations puis cliquez « Enregistrer » : le site est mis à jour en quelques secondes.
          {updatedAt && <> Dernière modification : {format(parseISO(updatedAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}.</>}
        </p>
        <a href={`/${locale}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-4 py-2 text-xs font-medium">
          <ExternalLink className="h-3.5 w-3.5" /> Voir le site
        </a>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={Banknote} title="Tarifs" hint="Affichés sur le site, dans Google et sur l’aperçu des liens WhatsApp.">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price-court" className={labelCls}>Terrain · 90 min, 4 joueurs</label>
              <div className="relative">
                <input id="price-court" type="number" inputMode="numeric" min={0} step={10} value={values.pricing.court}
                  onChange={(e) => set('pricing', { ...values.pricing, court: Number(e.target.value) })} className={`${inputCls} pe-12 font-mono`} />
                <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-xs t-muted">DH</span>
              </div>
              <p className="mt-1.5 text-xs t-muted">soit {perPlayer} DH par joueur</p>
            </div>
            <div>
              <label htmlFor="price-racket" className={labelCls}>Location de raquette</label>
              <div className="relative">
                <input id="price-racket" type="number" inputMode="numeric" min={0} step={5} value={values.pricing.racket}
                  onChange={(e) => set('pricing', { ...values.pricing, racket: Number(e.target.value) })} className={`${inputCls} pe-12 font-mono`} />
                <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-xs t-muted">DH</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs t-muted">Les réservations déjà faites gardent le prix du jour où elles ont été prises.</p>
        </Section>

        <Section icon={Clock} title="Horaires" hint="Même horaire tous les jours. Les créneaux de 90 min en découlent.">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="h-open" className={labelCls}>Ouverture</label>
              <input id="h-open" type="time" step={1800} value={values.hours.open}
                onChange={(e) => set('hours', { ...values.hours, open: e.target.value })} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label htmlFor="h-close" className={labelCls}>Fermeture (00:00 = minuit)</label>
              <input id="h-close" type="time" step={1800} value={values.hours.close}
                onChange={(e) => set('hours', { ...values.hours, close: e.target.value })} className={`${inputCls} font-mono`} />
            </div>
          </div>
          <p className="mt-4 text-xs t-muted">
            {slotPreview.length
              ? <>Créneaux proposés ({slotPreview.length}) : <span className="font-mono">{slotPreview.join(' · ')}</span></>
              : <span className="text-[#c0392b]">Aucun créneau de 90 min ne tient dans ces horaires.</span>}
          </p>

          <div className="mt-6 border-t hair pt-5">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold t-title"><CalendarX className="h-4 w-4 t-gold" /> Fermetures exceptionnelles</p>
            <p className="mb-3 text-xs t-muted">Jours fériés, travaux, tournoi privé : plus aucun créneau réservable ce jour-là.</p>
            <div className="flex gap-2">
              <input type="date" min={today} value={newClosed} onChange={(e) => setNewClosed(e.target.value)} className={`${inputCls} font-mono`} aria-label="Date de fermeture" />
              <button type="button" disabled={!newClosed}
                onClick={() => { set('closedDates', [...new Set([...values.closedDates, newClosed])].sort()); setNewClosed(''); }}
                className="btn-outline shrink-0 px-4 text-sm font-medium">
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </div>
            {upcomingClosed.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {upcomingClosed.map((d) => (
                  <li key={d} className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 py-1 ps-3 pe-1 text-xs t-title">
                    {format(parseISO(d), 'EEE d MMM', { locale: fr })}
                    <button type="button" aria-label={`Rouvrir le ${d}`} onClick={() => set('closedDates', values.closedDates.filter((x) => x !== d))}
                      className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-[#1e1b14]/10">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>

        <Section icon={Phone} title="Contact" hint="Boutons d’appel et WhatsApp du site ; le WhatsApp reçoit aussi les demandes de réservation.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-phone" className={labelCls}>Téléphone</label>
              <input id="c-phone" type="tel" maxLength={30} value={values.contact.phone}
                onChange={(e) => set('contact', { ...values.contact, phone: e.target.value })} className={inputCls} placeholder="+212 6 12 34 56 78" />
            </div>
            <div>
              <label htmlFor="c-wa" className={labelCls}>WhatsApp</label>
              <input id="c-wa" type="tel" maxLength={30} value={values.contact.whatsapp}
                onChange={(e) => set('contact', { ...values.contact, whatsapp: e.target.value })} className={inputCls} placeholder="+212 6 12 34 56 78" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-ig" className={labelCls}>Instagram (lien du compte)</label>
              <input id="c-ig" type="url" maxLength={200} value={values.contact.instagram}
                onChange={(e) => set('contact', { ...values.contact, instagram: e.target.value })} className={inputCls} placeholder="https://www.instagram.com/votreclub" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-addr" className={labelCls}>Adresse</label>
              <input id="c-addr" maxLength={200} value={values.contact.address}
                onChange={(e) => set('contact', { ...values.contact, address: e.target.value })} className={inputCls} />
            </div>
          </div>
        </Section>

        <Section icon={Type} title="Textes du site" hint="Une langue laissée vide garde le texte actuel.">
          <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Langue">
            {LANGS.map((l) => (
              <button key={l.code} type="button" role="tab" aria-selected={lang === l.code} onClick={() => setLang(l.code)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${lang === l.code ? 'border-gold bg-gold/12 t-title' : 'hair t-muted hover:t-title'}`}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
            {([
              ['tagline', 'Accroche (sous le nom du club)', 120, 1],
              ['heroPitch', 'Phrase de présentation', 400, 3],
              ['about', 'Texte « À propos »', 900, 5],
            ] as const).map(([field, label, max, rows]) => {
              const text = values.texts[field][lang] ?? '';
              return (
                <div key={field}>
                  <label htmlFor={`t-${field}`} className={labelCls}>{label}</label>
                  {rows === 1 ? (
                    <input id={`t-${field}`} maxLength={max} value={text} onChange={(e) => setText(field, e.target.value)} className={inputCls} />
                  ) : (
                    <textarea id={`t-${field}`} maxLength={max} rows={rows} value={text} onChange={(e) => setText(field, e.target.value)} className={`${inputCls} resize-y`} />
                  )}
                  <p className="mt-1 text-end font-mono text-[0.7rem] t-muted">{text.length} / {max}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <div className="lg:col-span-2">
          <Section icon={Trophy} title="Tournois & événements" hint="Un événement ajouté apparaît sur la page d’accueil et reçoit sa propre page.">
            {values.events.length === 0 && <p className="mb-4 text-sm t-muted">Aucun événement pour l’instant.</p>}
            <div className="space-y-4">
              {values.events.map((ev, i) => (
                <div key={i} className="rounded-2xl border hair bg-white/60 p-4 sm:p-5">
                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <label className={labelCls} htmlFor={`ev-title-${i}`}>Titre (français)</label>
                      <input id={`ev-title-${i}`} maxLength={120} value={ev.title.fr ?? ''} onChange={(e) => updateEvent(i, { title: { ...ev.title, fr: e.target.value } })} className={inputCls} placeholder="Tournoi P250 d’automne" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className={labelCls} htmlFor={`ev-date-${i}`}>Date</label>
                      <input id={`ev-date-${i}`} type="date" value={ev.date.slice(0, 10)} onChange={(e) => updateEvent(i, { date: e.target.value })} className={`${inputCls} font-mono`} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls} htmlFor={`ev-format-${i}`}>Format</label>
                      <input id={`ev-format-${i}`} maxLength={20} value={ev.format} onChange={(e) => updateEvent(i, { format: e.target.value })} className={inputCls} placeholder="P250" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls} htmlFor={`ev-prize-${i}`}>Dotation (DH)</label>
                      <input id={`ev-prize-${i}`} type="number" min={0} value={ev.prizeMAD} onChange={(e) => updateEvent(i, { prizeMAD: Number(e.target.value) })} className={`${inputCls} font-mono`} />
                    </div>
                    <div className="sm:col-span-12">
                      <label className={labelCls} htmlFor={`ev-desc-${i}`}>Description (français)</label>
                      <textarea id={`ev-desc-${i}`} rows={2} maxLength={600} value={ev.description.fr ?? ''} onChange={(e) => updateEvent(i, { description: { ...ev.description, fr: e.target.value } })} className={`${inputCls} resize-y`} />
                    </div>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-medium t-muted hover:t-title">Traductions (facultatif)</summary>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {(['en', 'es', 'ar'] as const).map((l) => (
                        <div key={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
                          <label className={labelCls}>{LANGS.find((x) => x.code === l)?.label}</label>
                          <input maxLength={120} value={ev.title[l] ?? ''} onChange={(e) => updateEvent(i, { title: { ...ev.title, [l]: e.target.value } })} className={inputCls} placeholder="Titre" />
                          <textarea rows={2} maxLength={600} value={ev.description[l] ?? ''} onChange={(e) => updateEvent(i, { description: { ...ev.description, [l]: e.target.value } })} className={`${inputCls} mt-2 resize-y`} placeholder="Description" />
                        </div>
                      ))}
                    </div>
                  </details>
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={() => set('events', values.events.filter((_, n) => n !== i))} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#c0392b] hover:underline">
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer l’événement
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" disabled={values.events.length >= 12}
              onClick={() => set('events', [...values.events, { id: '', title: { fr: '' }, date: today, format: '', prizeMAD: 0, description: { fr: '' } }])}
              className="btn-outline mt-4 px-4 py-2.5 text-sm font-medium">
              <Plus className="h-4 w-4" /> Ajouter un événement
            </button>
          </Section>
        </div>
      </div>

      {/* Barre d'enregistrement : toujours visible dès qu'il y a une modification. */}
      {(dirty || error || saved) && (
      <div className="animate-fade-up fixed inset-x-0 bottom-0 z-40 border-t hair bg-[#fbf8f1] shadow-[0_-8px_24px_rgba(30,27,20,0.06)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-sm" role="status" aria-live="polite">
            {error ? <span className="text-[#c0392b]">{error}</span>
              : saved && !dirty ? <span className="inline-flex items-center gap-2 t-title"><Check className="h-4 w-4 t-gold" /> Enregistré — le site est à jour.</span>
              : <span className="t-title">Modifications non enregistrées</span>}
          </p>
          <div className="flex gap-2">
            {dirty && (
              <button type="button" onClick={() => { setValues(JSON.parse(initial)); setError(''); }} className="btn-outline px-4 py-2.5 text-sm font-medium">
                <RotateCcw className="h-4 w-4" /> Annuler
              </button>
            )}
            <button type="button" onClick={save} disabled={!dirty || saving || storage === 'none'} className="btn-gold px-6 py-2.5 text-sm">
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

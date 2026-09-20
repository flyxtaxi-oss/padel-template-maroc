"use client";
import WordReveal from '@/components/WordReveal';
import Image from 'next/image';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import CountUp from '@/components/CountUp';

// Hero « image-first » (skill image-first-grid-layout) : la photo du club est
// la scène, pas un encart. Le texte s'ancre en bas à gauche, au-dessus d'un
// rail d'informations fin qui remplace les cartes de statistiques.
export default function Hero({ locale }: { locale: string }) {
  const { hero, name, tagline } = clubConfig;
  const t = getDictionary(locale);
  const localTagline = tagline[locale] || tagline[clubConfig.defaultLocale];
  const localPitch = hero.pitch[locale] || hero.pitch[clubConfig.defaultLocale];

  const stats = [
    { value: `${clubConfig.about.stats.courts}`, label: t.ui.indoorCourts },
    { value: clubConfig.about.stats.players, label: t.ui.activeMembers },
    { value: '7j/7', label: '09h – 00h' },
  ];

  return (
    <section className="panel-court relative isolate flex min-h-[100svh] w-full flex-col justify-end overflow-hidden pt-28">
      <Image
        src={hero.mediaPath}
        alt={`${name} — terrain de padel indoor à Tanger`}
        fill
        // Image LCP : `priority` la sort du lazy-loading et la précharge.
        priority
        // Aperçu flou inline, affiché tant que la photo n'est pas arrivée.
        // C'est ce qui remplace le rectangle noir qu'on voyait le temps que le
        // serveur optimise l'image (plusieurs secondes sur un déploiement neuf).
        {...(hero.blurDataURL ? { placeholder: 'blur' as const, blurDataURL: hero.blurDataURL } : {})}
        sizes="100vw"
        // La photo est un portrait affiché dans un cadre paysage : sans point
        // d'ancrage, le cadrage automatique (centre) coupait le mur au logo du
        // club et ne gardait que les silhouettes floues du premier plan.
        // 38 % remonte le cadre sur le logo et les joueurs.
        className="-z-20 object-cover object-[50%_38%]"
      />
      {/* Lisibilité du texte SANS enterrer la photo.
          Ces trois voiles se superposent : cumulés à 100/70/75 %, ils
          éteignaient complètement l'image — le hero paraissait noir, alors
          même que DESIGN.md demande une photo plein écran. Ils sont désormais
          dosés pour que la photo reste lisible partout, en ne redevenant
          opaques que là où se trouve réellement le texte : le bas à gauche.
          Teintes bleu terrain, jamais noir pur. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-court-deep via-court-deep/40 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-36 bg-gradient-to-b from-court-deep/60 to-transparent" />
      <div aria-hidden className="absolute inset-y-0 start-0 -z-10 w-full bg-gradient-to-r from-court-deep/70 via-court-deep/15 to-transparent lg:w-2/3 rtl:bg-gradient-to-l" />

      <div className="mx-auto w-full max-w-7xl px-6 pb-12 sm:pb-16">
        <span className="eyebrow animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
          {t.sections.heroEyebrow}
        </span>

        <WordReveal
          as="h1"
          // Nom de marque en écriture latine dans toutes les langues, y
          // compris en arabe : le flux des mots reste LTR.
          dir="ltr"
          className="mt-5 max-w-4xl font-display text-[clamp(3.2rem,9vw,7.5rem)] font-semibold leading-[0.95] t-title"
          parts={['Golden', { text: 'Padel', className: 'italic t-gold' }, 'Club']}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="max-w-lg text-lg t-soft animate-fade-up" style={{ animationDelay: '0.24s' }}>
              {localTagline}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed t-muted animate-fade-up" style={{ animationDelay: '0.32s' }}>
              {localPitch}
            </p>
          </div>

          <div className="flex flex-col gap-3 animate-fade-up sm:flex-row lg:col-span-6 lg:justify-end" style={{ animationDelay: '0.4s' }}>
            <Link href={`/${locale}#booking`} className="btn-gold px-8 py-4 text-sm">
              {t.actions.book}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
            <Link href={`/${locale}#about`} className="btn-outline px-8 py-4 text-sm font-medium">
              {t.actions.discover}
            </Link>
          </div>
        </div>
      </div>

      {/* Rail d'informations : filets fins, chiffres en mono. */}
      <div className="border-t hair">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className={`py-5 sm:py-6 ${i > 0 ? 'sm:border-s sm:ps-6' : ''} ${i % 2 === 1 ? 'border-s ps-6 sm:ps-6' : ''} hair`}>
              <CountUp value={s.value} className="font-mono text-2xl font-bold t-title sm:text-3xl" />
              <div className="mt-1 text-xs t-muted">{s.label}</div>
            </div>
          ))}
          <div className="col-span-2 flex items-center gap-3 border-t py-5 hair sm:col-span-1 sm:border-s sm:border-t-0 sm:ps-6">
            <MapPin className="h-4 w-4 shrink-0 t-gold" aria-hidden />
            <div>
              <p className="text-sm font-semibold t-title">Marjane, Route de Rabat</p>
              <p className="text-xs t-muted">{clubConfig.courts[0]?.surface}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

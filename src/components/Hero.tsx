"use client";
import WordReveal from '@/components/WordReveal';
import Image from 'next/image';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import CountUp from '@/components/CountUp';

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
    <section className="panel-court relative w-full overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* court-line brand motif, very subtle */}
      <div aria-hidden className="court-lines pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[460px] w-[460px] rounded-full opacity-25 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #d9b25a 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16">

        {/* Text */}
        <div>
          <span className="eyebrow animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
            {t.sections.heroEyebrow}
          </span>

          <WordReveal
            as="h1"
            // Nom de marque en écriture latine dans toutes les langues, y
            // compris en arabe : le flux des mots reste LTR.
            dir="ltr"
            className="mt-6 font-display text-5xl font-semibold leading-[1.04] t-title sm:text-6xl xl:text-[4.6rem]"
            parts={['Golden', { text: 'Padel', className: 'italic t-gold' }, 'Club']}
          />

          <p className="mt-6 max-w-lg text-lg t-soft animate-fade-up" style={{ animationDelay: '0.24s' }}>
            {localTagline}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed t-muted animate-fade-up" style={{ animationDelay: '0.32s' }}>
            {localPitch}
          </p>

          <div className="mt-9 flex flex-col gap-3 animate-fade-up sm:flex-row" style={{ animationDelay: '0.4s' }}>
            <Link href={`/${locale}#booking`} className="btn-gold px-7 py-3.5 text-sm">
              {t.actions.book}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={`/${locale}#about`} className="btn-outline px-7 py-3.5 text-sm font-medium">
              {t.actions.discover}
            </Link>
          </div>

          <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t hair pt-8 animate-fade-up" style={{ animationDelay: '0.48s' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <CountUp value={s.value} className="font-mono text-2xl font-bold t-title sm:text-3xl" />
                <div className="mt-1 text-xs t-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div className="relative animate-fade-up" style={{ animationDelay: '0.16s' }}>
          <div className="card-lift-lg relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-gold/25 sm:aspect-square lg:aspect-[4/5]">
            <Image
              src={hero.mediaPath}
              alt={`${name} — terrain de padel indoor à Tanger`}
              fill
              // Image LCP : `priority` la sort du lazy-loading et la précharge.
              priority
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover"
            />
            <div aria-hidden className="pblur">
              <div /><div /><div />
            </div>
            <div aria-hidden className="absolute inset-x-0 bottom-0 z-[2] h-2/5 bg-gradient-to-t from-court/70 via-court/20 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 z-[3] flex items-center gap-3 rounded-2xl border border-white/15 bg-court-deep/60 px-4 py-3 backdrop-blur-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20">
                <MapPin className="h-4 w-4 text-gold-bright" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cream">Marjane, Route de Rabat</p>
                <p className="text-xs text-cream/60">{clubConfig.courts[0]?.surface}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

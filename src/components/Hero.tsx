"use client";
import { useEffect, useRef } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';

export default function Hero({ locale }: { locale: string }) {
  const { hero, name, tagline } = clubConfig;
  const t = getDictionary(locale);
  const localTagline = tagline[locale] || tagline[clubConfig.defaultLocale];
  const localPitch = hero.pitch[locale] || hero.pitch[clubConfig.defaultLocale];

  return (
    <section className="relative w-full min-h-screen flex items-end overflow-hidden bg-[#060913]">
      {/* Background image with parallax overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/clubs/golden/1.jpg"
          alt={`${name} - terrain de padel`}
          className="w-full h-full object-cover opacity-50"
          style={{ objectPosition: 'center 30%' }}
        />
        {/* Multi-layered gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-[#060913]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060913]/80 via-transparent to-transparent" />
      </div>

      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[500px] h-[500px] -top-40 -left-40 opacity-20" />
      <div className="glow-orb glow-gold w-[400px] h-[400px] top-1/4 right-10 opacity-15" />
      <div className="glow-orb glow-blue w-[300px] h-[300px] bottom-10 left-1/3 opacity-10" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20 pt-36">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Tanger · Maroc
          </div>

          {/* Title */}
          <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-black leading-none mb-6 text-white tracking-tight">
            <span className="block">{name.split(' ').slice(0,1).join(' ')}</span>
            <span className="block text-gold">{name.split(' ').slice(1).join(' ')}</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-white/80 font-light mb-4 leading-relaxed max-w-xl">
            {localTagline}
          </p>
          <p className="text-base text-white/50 mb-12 max-w-lg leading-relaxed">
            {localPitch}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}#booking`}
              className="btn-premium group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-black font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <span>{t.actions.book}</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href={`/${locale}#about`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-base glass border-white/5 hover:bg-white/10 transition-all"
            >
              {t.actions.discover}
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-white/5">
          {[
            { value: `${clubConfig.about.stats.courts}`, label: 'Terrains Indoor' },
            { value: clubConfig.about.stats.players, label: 'Joueurs actifs' },
            { value: 'Ouvert 7j/7', label: '9h – 00h' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="font-heading text-2xl font-black text-gold">{stat.value}</div>
              <div className="text-white/40 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30">
        <span className="text-white text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

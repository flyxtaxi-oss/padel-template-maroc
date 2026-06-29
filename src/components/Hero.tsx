"use client";
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';

export default function Hero({ locale }: { locale: string }) {
  const { hero, name, tagline } = clubConfig;
  const t = getDictionary(locale);
  const localTagline = tagline[locale] || tagline[clubConfig.defaultLocale];
  const localPitch = hero.pitch[locale] || hero.pitch[clubConfig.defaultLocale];

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#060913] pt-24 pb-16">
      
      {/* Background visual layering */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Parallax blurred ambient map of the court */}
        <div 
          className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] opacity-20 filter blur-[80px] rounded-full"
          style={{
            backgroundImage: `radial-gradient(circle, #1062ae 0%, #060913 70%)`
          }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-[80%] h-[80%] opacity-20 filter blur-[80px] rounded-full"
          style={{
            backgroundImage: `radial-gradient(circle, #d4af37 0%, #060913 70%)`
          }}
        />
        {/* Subtle grid backing */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Floating orbs */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] -top-20 -left-20 opacity-20 animate-float" />
      <div className="glow-orb glow-gold w-[350px] h-[350px] bottom-10 right-10 opacity-15 animate-float-delayed" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Typography */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/25 bg-yellow-500/5 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            L'excellence du padel · Tanger
          </div>

          {/* Luxury Headings */}
          <h1 className="font-heading text-6xl sm:text-7xl xl:text-8.5xl font-black leading-[0.9] tracking-tighter mb-6 text-white uppercase">
            <span className="block text-white/90">Golden</span>
            <span className="block text-gold">Padel</span>
            <span className="block text-white/90">Club</span>
          </h1>

          {/* Subheading/Tagline */}
          <p className="text-lg sm:text-xl text-white/70 font-semibold mb-3 max-w-xl border-l-2 border-yellow-500/40 pl-4">
            {localTagline}
          </p>
          
          <p className="text-sm text-white/45 mb-10 max-w-lg leading-relaxed pl-4">
            {localPitch}
          </p>

          {/* Luxury Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pl-4">
            <Link
              href={`/${locale}#booking`}
              className="btn-premium group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full text-black font-black text-xs uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
            >
              <span>{t.actions.book}</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link
              href={`/${locale}#about`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white/80 font-black text-xs uppercase tracking-widest glass border-white/5 hover:bg-white/10 transition-all"
            >
              {t.actions.discover}
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-10 mt-16 pt-8 border-t border-white/5 w-full max-w-md pl-4">
            {[
              { value: `${clubConfig.about.stats.courts}`, label: 'Terrains Indoor' },
              { value: clubConfig.about.stats.players, label: 'Membres Actifs' },
              { value: '09h - 00h', label: 'Ouvert 7j/7' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-black text-white">{stat.value}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/35 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Styled Photo Showcase */}
        <div className="lg:col-span-5 relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[32px] overflow-hidden group">
          {/* Outer gold-line glow frame */}
          <div className="absolute inset-0 rounded-[32px] border border-yellow-500/20 p-2 z-10 pointer-events-none transition-all duration-700 group-hover:border-yellow-500/40" />
          
          {/* Image wrapper */}
          <div className="relative w-full h-full rounded-[24px] overflow-hidden">
            <img
              src="/clubs/golden/1.jpg"
              alt={`${name} - terrain de padel`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-[#060913]/10 mix-blend-overlay" />
          </div>

          {/* Floating interactive element */}
          <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-2xl border border-white/10 backdrop-blur-md flex items-center justify-between z-20">
            <div>
              <p className="text-white text-xs font-black uppercase tracking-wider">Terrain de Padel</p>
              <p className="text-white/40 text-[10px] mt-0.5">{clubConfig.courts[0]?.surface}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 opacity-25">
        <span className="text-white text-[9px] tracking-widest uppercase font-black">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}

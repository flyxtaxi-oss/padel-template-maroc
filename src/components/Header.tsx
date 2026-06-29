"use client";
import { useState, useEffect } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';

export default function Header({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: `/${locale}#about`, label: t.navigation.about },
    { href: `/${locale}#courts`, label: t.navigation.courts },
    ...(clubConfig.events?.length > 0 ? [{ href: `/${locale}#events`, label: t.navigation.events }] : []),
    { href: `/${locale}#gallery`, label: t.navigation.gallery },
    { href: `/${locale}#contact`, label: t.navigation.contact },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-dark shadow-[0_4px_40px_rgba(0,0,0,0.6)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-lg text-black" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
            G
          </div>
          <span className="font-heading font-bold text-lg text-white tracking-wide hidden sm:block">
            {clubConfig.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <div className="hidden sm:flex gap-1 bg-white/5 rounded-full p-1">
            {clubConfig.locales.map(loc => (
              <Link key={loc} href={`/${loc}`} className={`uppercase text-xs font-bold px-3 py-1 rounded-full transition-all ${loc === locale ? 'text-black' : 'text-white/50 hover:text-white'}`} style={loc === locale ? { background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' } : {}}>
                {loc}
              </Link>
            ))}
          </div>

          <Link href={`/${locale}#booking`} className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-black transition-all hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
            {t.actions.book}
          </Link>

          {/* Mobile hamburger */}
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={`block h-0.5 w-6 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden glass-dark border-t border-white/5 py-6 px-6 flex flex-col gap-4">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-white font-medium py-1">{l.label}</Link>
          ))}
          <div className="flex gap-2 pt-2">
            {clubConfig.locales.map(loc => (
              <Link key={loc} href={`/${loc}`} className={`uppercase text-xs font-bold px-3 py-1.5 rounded-full border ${loc === locale ? 'border-yellow-500 text-yellow-400' : 'border-white/20 text-white/50'}`}>{loc}</Link>
            ))}
          </div>
          <Link href={`/${locale}#booking`} onClick={() => setMenuOpen(false)} className="mt-2 text-center py-3 rounded-full text-sm font-bold text-black" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
            {t.actions.book}
          </Link>
        </div>
      )}
    </header>
  );
}

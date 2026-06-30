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
    const onScroll = () => setScrolled(window.scrollY > 50);
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
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-500 pt-4 px-4 sm:px-6">
      <div className={`mx-auto max-w-7xl h-16 rounded-full flex items-center justify-between px-6 transition-all duration-500 border ${
        scrolled 
          ? 'glass-dark border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.8)]' 
          : 'bg-black/30 backdrop-blur-md border-white/5 shadow-lg'
      }`}>

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-base text-black transition-transform duration-500 group-hover:rotate-12" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
            G
          </div>
          <span className="font-heading font-black text-sm tracking-widest text-white uppercase hidden md:block">
            Golden <span className="text-gold">Padel</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(l => (
            <Link 
              key={l.href} 
              href={l.href} 
              className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Locale switcher */}
          <div className="hidden sm:flex gap-0.5 bg-white/5 rounded-full p-0.5 border border-white/5">
            {clubConfig.locales.map(loc => (
              <Link 
                key={loc} 
                href={`/${loc}`} 
                className={`uppercase text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full transition-all duration-300 ${
                  loc === locale ? 'text-black font-bold' : 'text-white/40 hover:text-white'
                }`}
                style={loc === locale ? { background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' } : {}}
              >
                {loc}
              </Link>
            ))}
          </div>

          {/* Concierge CTA Button */}
          <Link 
            href={`/${locale}#booking`} 
            className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider text-black transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]" 
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}
          >
            {t.actions.book}
          </Link>

          {/* Mobile hamburger button */}
          <button 
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-full bg-white/5 border border-white/5" 
            onClick={() => setMenuOpen(!menuOpen)} 
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 w-4 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-40 bg-[#060913]/95 backdrop-blur-md transition-all duration-500 lg:hidden flex flex-col justify-center px-8 ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col gap-6 text-center">
          {navLinks.map(l => (
            <Link 
              key={l.href} 
              href={l.href} 
              onClick={() => setMenuOpen(false)} 
              className="text-2xl font-heading font-black text-white hover:text-gold transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex justify-center gap-4 mt-6">
            {clubConfig.locales.map(loc => (
              <Link 
                key={loc} 
                href={`/${loc}`} 
                onClick={() => setMenuOpen(false)}
                className={`uppercase text-xs font-bold px-4 py-2 rounded-full border transition-all ${
                  loc === locale ? 'border-yellow-500 text-yellow-400' : 'border-white/20 text-white/50'
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>
          <Link 
            href={`/${locale}#booking`} 
            onClick={() => setMenuOpen(false)} 
            className="mt-8 py-4 rounded-full text-sm font-black uppercase tracking-widest text-black shadow-lg" 
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}
          >
            {t.actions.book}
          </Link>
        </div>
        
        {/* Close Button */}
        <button 
          className="absolute top-8 right-8 text-white/50 hover:text-white"
          onClick={() => setMenuOpen(false)}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>
  );
}

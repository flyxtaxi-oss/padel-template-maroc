"use client";
import { useState, useEffect } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
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

  // light text over the dark hero; ink text once the cream bar appears
  const link = scrolled ? 'text-[#1e1b14]/65 hover:text-[#1e1b14]' : 'text-cream/75 hover:text-cream';
  const brandInk = scrolled ? 'text-[#1e1b14]' : 'text-cream';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-[#1e1b14]/10 bg-cream/85 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold font-display text-base font-semibold text-[#1a140a]">
            G
          </div>
          <span className={`font-display text-lg font-semibold transition-colors ${brandInk}`}>
            Golden <span className="text-gold">Padel</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${link}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className={`hidden items-center gap-1 rounded-full border p-1 sm:flex ${scrolled ? 'border-[#1e1b14]/15' : 'border-cream/25'}`}>
            {clubConfig.locales.map(loc => (
              <Link
                key={loc}
                href={`/${loc}`}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                  loc === locale ? 'bg-gold text-[#1a140a]' : scrolled ? 'text-[#1e1b14]/50 hover:text-[#1e1b14]' : 'text-cream/55 hover:text-cream'
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>

          <Link href={`/${locale}#booking`} className="btn-gold hidden px-5 py-2 text-sm sm:inline-flex">
            {t.actions.book}
          </Link>

          <button
            className={`flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${scrolled ? 'border-[#1e1b14]/15 text-[#1e1b14]' : 'border-cream/25 text-cream'}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-cream/97 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex flex-col gap-2 px-6 py-8">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#1e1b14]/8 py-4 font-display text-xl font-semibold text-[#1e1b14]"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-2">
            {clubConfig.locales.map(loc => (
              <Link
                key={loc}
                href={`/${loc}`}
                onClick={() => setMenuOpen(false)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                  loc === locale ? 'border-gold text-gold' : 'border-[#1e1b14]/15 text-[#1e1b14]/50'
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>
          <Link href={`/${locale}#booking`} onClick={() => setMenuOpen(false)} className="btn-gold mt-6 py-4 text-sm">
            {t.actions.book}
          </Link>
        </div>
      </div>
    </header>
  );
}

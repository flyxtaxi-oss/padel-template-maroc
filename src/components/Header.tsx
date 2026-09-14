"use client";
import { useState, useEffect } from 'react';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import { Menu, X } from 'lucide-react';

const ACADEMY_LABEL: Record<string, string> = { fr: 'Académie', en: 'Academy', es: 'Academia', ar: 'الأكاديمية' };

const MENU_LABEL: Record<string, { open: string; close: string }> = {
  fr: { open: 'Ouvrir le menu', close: 'Fermer le menu' },
  en: { open: 'Open menu', close: 'Close menu' },
  es: { open: 'Abrir el menú', close: 'Cerrar el menú' },
  ar: { open: 'فتح القائمة', close: 'إغلاق القائمة' },
};

// `solid` : header opaque dès le chargement. Indispensable sur les pages sans
// hero sombre (mentions légales, confidentialité) — sinon le texte clair du
// header s'affiche sur le fond ivoire de la page et devient illisible.
export default function Header({ locale, solid = false }: { locale: string; solid?: boolean }) {
  const t = getDictionary(locale);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuLabel = MENU_LABEL[locale] ?? MENU_LABEL.fr;

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solid]);

  // Menu ouvert : la page derrière ne défile plus, Échap le ferme, et il se
  // referme si l'écran repasse en largeur desktop (rotation d'une tablette).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onDesktop);
    };
  }, [menuOpen]);

  const onLight = solid || scrolled;

  const navLinks = [
    { href: `/${locale}#about`, label: t.navigation.about },
    { href: `/${locale}#courts`, label: t.navigation.courts },
    { href: `/${locale}#academy`, label: ACADEMY_LABEL[locale] ?? ACADEMY_LABEL.fr },
    ...(clubConfig.events?.length > 0 ? [{ href: `/${locale}#events`, label: t.navigation.events }] : []),
    { href: `/${locale}#gallery`, label: t.navigation.gallery },
    { href: `/${locale}#contact`, label: t.navigation.contact },
  ];

  // light text over the dark hero; ink text once the cream bar appears
  const link = onLight ? 'text-[#1e1b14]/65 hover:text-[#1e1b14]' : 'text-cream/75 hover:text-cream';
  const brandInk = onLight ? 'text-[#1e1b14]' : 'text-cream';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          onLight ? 'border-b border-[#1e1b14]/10 bg-cream/85 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <Link href={`/${locale}`} className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <LogoMark className="h-8 w-8" />
            <span className={`font-display text-lg font-semibold transition-colors ${brandInk}`}>
              {/* `text-gold` (#b98a2e) tombe à 2.72:1 sur la barre crème une fois
                  la page défilée. `t-gold` suit la surface : or clair sur le hero
                  bleu, or foncé lisible sur le crème. */}
              Golden <span className={onLight ? 't-gold' : 'text-gold'}>Padel</span>
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
            <div className={`hidden items-center gap-1 rounded-full border p-1 sm:flex ${onLight ? 'border-[#1e1b14]/15' : 'border-cream/25'}`}>
              {clubConfig.locales.map(loc => (
                <Link
                  key={loc}
                  href={`/${loc}`}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                    loc === locale ? 'bg-gold text-[#1a140a]' : onLight ? 'text-[#1e1b14]/50 hover:text-[#1e1b14]' : 'text-cream/55 hover:text-cream'
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
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${onLight || menuOpen ? 'border-[#1e1b14]/15 text-[#1e1b14]' : 'border-cream/25 text-cream'} ${menuOpen ? 'bg-cream' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? menuLabel.close : menuLabel.open}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile — volontairement HORS du <header>.
          Une fois la page défilée, le header reçoit `backdrop-blur-xl`. Or un
          `backdrop-filter` fait de l'élément le bloc conteneur de ses enfants
          en `position: fixed` : le panneau, calé sur la hauteur du header
          (64 px) au lieu de l'écran, tombait à 0 px de haut. Ses liens
          flottaient sans fond par-dessus la page. En frère du header, il se
          positionne toujours par rapport à l'écran.
          `inert` quand il est fermé : invisible ET inatteignable au clavier
          comme au lecteur d'écran. */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-cream/97 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-2 px-6 py-8" aria-label={menuLabel.open}>
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
                  loc === locale ? 'border-gold t-gold' : 'border-[#1e1b14]/15 text-[#1e1b14]/50'
                }`}
              >
                {loc}
              </Link>
            ))}
          </div>
          <Link href={`/${locale}#booking`} onClick={() => setMenuOpen(false)} className="btn-gold mt-6 py-4 text-sm">
            {t.actions.book}
          </Link>
        </nav>
      </div>
    </>
  );
}

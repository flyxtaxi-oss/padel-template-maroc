import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer({ locale }: { locale: string }) {
  const { name, contact, locales } = clubConfig;
  const currentYear = new Date().getFullYear();
  const t = getDictionary(locale);

  const navLinks = [
    { href: `/${locale}#about`, label: t.navigation.about },
    { href: `/${locale}#courts`, label: t.navigation.courts },
    { href: `/${locale}#gallery`, label: t.navigation.gallery },
    { href: `/${locale}#contact`, label: t.navigation.contact },
    { href: `/${locale}/qr`, label: 'QR Code avis' },
  ];

  return (
    <footer className="panel-court" style={{ background: '#08213c' }}>
      {/* CTA strip */}
      <div className="border-b hair">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-14 sm:flex-row">
          <div>
            <h3 className="font-display text-2xl font-semibold t-title sm:text-3xl">Prêt à jouer ?</h3>
            <p className="mt-1.5 text-sm t-muted">Réservez votre terrain en 30 secondes.</p>
          </div>
          <Link href={`/${locale}#booking`} className="btn-gold px-8 py-3.5 text-sm">
            {t.actions.book}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-display text-base font-semibold text-[#1a140a]">G</div>
              <span className="font-display text-lg font-semibold t-title">{name}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed t-muted" itemScope itemType="https://schema.org/SportsActivityLocation">
              <span className="hidden" itemProp="name">{name}</span>
              <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="streetAddress">{contact.address}</span>
              </span>
              <br />
              <span itemProp="telephone">{contact.phone}</span>
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold t-title">Navigation</h4>
            <ul className="space-y-2.5">
              {navLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm t-muted transition-colors hover:t-gold">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold t-title">Suivez-nous</h4>
            <div className="flex gap-3">
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border hair t-muted transition-colors hover:t-gold" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-xl border hair t-muted transition-colors hover:t-gold" aria-label="WhatsApp">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6 flex gap-2">
              {locales.map(loc => (
                <Link key={loc} href={`/${loc}`} className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${loc === locale ? 'border-gold t-gold' : 'hair t-muted hover:t-title'}`}>
                  {loc}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t hair pt-8 sm:flex-row">
          <p className="text-xs t-muted">&copy; {currentYear} {name}. {t.footer.rights}</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs t-muted transition-colors hover:t-title">{t.footer.legal}</Link>
            <Link href="#" className="text-xs t-muted transition-colors hover:t-title">{t.footer.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

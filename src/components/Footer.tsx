import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M11.997 2C6.477 2 2 6.477 2 12c0 1.89.518 3.657 1.418 5.168L2 22l4.986-1.387A9.944 9.944 0 0011.997 22C17.523 22 22 17.523 22 12S17.523 2 11.997 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export default function Footer({ locale }: { locale: string }) {
  const { name, contact, locales, defaultLocale } = clubConfig;
  const currentYear = new Date().getFullYear();
  const t = getDictionary(locale);

  const navLinks = [
    { href: `/${locale}#about`, label: t.navigation.about },
    { href: `/${locale}#courts`, label: t.navigation.courts },
    { href: `/${locale}#gallery`, label: t.navigation.gallery },
    { href: `/${locale}#contact`, label: t.navigation.contact },
    { href: `/${locale}/qr`, label: 'QR Code Avis' },
  ];

  return (
    <footer className="bg-[#04070f] border-t border-white/5 relative overflow-hidden">
      {/* Top CTA strip */}
      <div className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-3xl font-black text-black">Prêt à jouer ?</h3>
            <p className="text-black/60 mt-1">Réservez votre terrain en 30 secondes.</p>
          </div>
          <a
            href={`/${locale}#booking`}
            className="px-8 py-4 rounded-full bg-black text-white font-bold hover:bg-black/80 transition-colors"
          >
            {t.actions.book} →
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-lg text-black" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>G</div>
              <span className="font-heading font-bold text-white text-lg">{name}</span>
            </div>
            <p className="text-white/40 leading-relaxed text-sm max-w-xs" itemScope itemType="https://schema.org/SportsActivityLocation">
              <span className="hidden" itemProp="name">{name}</span>
              <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="streetAddress">{contact.address}</span>
              </span>
              <br />
              <span itemProp="telephone">{contact.phone}</span>
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/40 hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-widest">Suivez-nous</h4>
            <div className="flex gap-3">
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110 glass"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all hover:scale-110 glass"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            </div>

            <div className="flex gap-2 mt-6">
              {locales.map(loc => (
                <Link key={loc} href={`/${loc}`} className={`uppercase text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${loc === locale ? 'border-yellow-500 text-yellow-400' : 'border-white/10 text-white/30 hover:text-white'}`}>
                  {loc}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-white/25 text-xs">&copy; {currentYear} {name}. {t.footer.rights}</p>
          <div className="flex gap-6">
            <Link href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">{t.footer.legal}</Link>
            <Link href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">{t.footer.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

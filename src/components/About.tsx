import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import defaultClub, { type ClubConfig } from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import WordReveal from '@/components/WordReveal';

const copy: Record<string, { number: string; line: string; visit: string; caption: string; court: string; allYear: string }> = {
  fr: { number: '01 / LE LIEU', line: 'Une partie qui commence avant le premier échange.', visit: 'Voir les terrains', caption: 'Golden Padel Club, Tanger', court: 'terrains indoor', allYear: 'pour jouer toute l’année' },
  en: { number: '01 / THE CLUB', line: 'The game begins before the first rally.', visit: 'See the courts', caption: 'Golden Padel Club, Tangier', court: 'indoor courts', allYear: 'play all year round' },
  es: { number: '01 / EL CLUB', line: 'El partido empieza antes del primer punto.', visit: 'Ver las pistas', caption: 'Golden Padel Club, Tánger', court: 'pistas cubiertas', allYear: 'para jugar todo el año' },
  ar: { number: '01 / النادي', line: 'تبدأ المباراة قبل أول تبادل للكرة.', visit: 'اكتشف الملاعب', caption: 'جولدن بادل كلوب، طنجة', court: 'ملاعب داخلية', allYear: 'للعب طوال السنة' },
};

export default function About({ locale, club = defaultClub }: { locale: string; club?: ClubConfig }) {
  // Réglages en vigueur (onglet « Mon club » du gérant), par défaut ceux du dépôt.
  const clubConfig = club;
  const t = getDictionary(locale);
  const c = copy[locale] || copy.fr;
  const localText = clubConfig.about.text[locale] || clubConfig.about.text[clubConfig.defaultLocale];

  return (
    <section id="about" className="section about-editorial bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-center gap-5 border-b border-[#1e1b14]/15 pb-5 font-mono text-xs uppercase tracking-[0.18em] t-muted" data-reveal>
          <span className="text-[#87641a]">{c.number}</span><span className="h-px flex-1 bg-[#1e1b14]/12" aria-hidden /><span>{c.caption}</span>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:col-span-5">
            <span className="eyebrow" data-reveal>{t.sections.aboutEyebrow}</span>
            <WordReveal
              as="h2"
              className="mt-5 block max-w-[11ch] font-display text-[clamp(2.6rem,5.2vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.045em] t-title"
              parts={[t.sections.aboutTitle, { text: t.sections.aboutTitleAccent, className: 'italic t-gold' }]}
            />
            <p className="mt-8 max-w-md text-lg leading-relaxed t-soft" data-reveal>{c.line}</p>
            <p className="mt-4 max-w-md text-sm leading-[1.8] t-muted" data-reveal>{localText}</p>
            <Link href={`/${locale}#courts`} className="group mt-8 inline-flex min-h-11 items-center gap-3 border-b border-[#87641a] pb-1 text-sm font-semibold t-gold" data-reveal>
              {c.visit}<ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>

          <div className="about-editorial__images lg:col-span-7">
            <figure className="relative m-0" data-reveal>
              <div className="editorial-image relative aspect-[4/5] overflow-hidden bg-court">
                <Image src="/clubs/golden/6.jpg" alt="Joueur dans le club Golden Padel à Tanger" fill sizes="(min-width: 1024px) 50vw, 92vw" className="editorial-image__photo object-cover" />
              </div>
              <figcaption className="mt-3 flex justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-[0.12em] t-muted"><span>{c.caption}</span><span>01 / 02</span></figcaption>
            </figure>
            <div className="about-editorial__secondary mt-8 grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] items-end gap-6 sm:gap-10">
              <figure className="m-0" data-reveal>
                <div className="editorial-image relative aspect-[3/4] overflow-hidden bg-court">
                  <Image src="/clubs/golden/1.jpg" alt="Terrain de padel du club" fill sizes="(min-width: 1024px) 28vw, 50vw" className="editorial-image__photo object-cover" />
                </div>
              </figure>
              <div className="border-s border-[#1e1b14]/20 ps-5 pb-3 sm:ps-8" data-reveal>
                <span className="block font-display text-[clamp(3.5rem,8vw,7rem)] leading-none tracking-[-0.08em] text-court">{clubConfig.courts.length.toString().padStart(2, '0')}</span>
                <span className="mt-3 block text-sm font-semibold t-title">{c.court}</span>
                <span className="mt-1 block text-xs t-muted">{c.allYear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

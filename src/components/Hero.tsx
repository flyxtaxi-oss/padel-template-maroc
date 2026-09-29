import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, MapPin } from 'lucide-react';
import defaultClub, { type ClubConfig } from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

// Le prix vit dans le rail d'informations, pas dans une carte posée sur la
// photo : DESIGN.md veut un hero « image-first » avec un rail à filets fins, et
// la carte crème masquait les joueurs, avec des mentions en capitales de 10 px.
const copy: Record<string, { location: string; perPlayer: string; court: string; explore: string; courts: string }> = {
  fr: { location: 'Tanger · Maroc', perPlayer: 'DH / joueur', court: '{price} DH le terrain · 1 h 30', explore: 'Découvrir le club', courts: 'terrains couverts' },
  en: { location: 'Tangier · Morocco', perPlayer: 'DH / player', court: '{price} DH per court · 90 min', explore: 'Explore the club', courts: 'indoor courts' },
  es: { location: 'Tánger · Marruecos', perPlayer: 'DH / jugador', court: '{price} DH la pista · 90 min', explore: 'Descubre el club', courts: 'pistas cubiertas' },
  ar: { location: 'طنجة · المغرب', perPlayer: 'درهم / لاعب', court: '{price} درهم للملعب · 90 دقيقة', explore: 'اكتشف النادي', courts: 'ملاعب مغطاة' },
};

export default function Hero({ locale, club = defaultClub }: { locale: string; club?: ClubConfig }) {
  // Réglages en vigueur (onglet « Mon club » du gérant), par défaut ceux du dépôt.
  const clubConfig = club;
  const t = getDictionary(locale);
  const c = copy[locale] || copy.fr;
  const courtPrice = clubConfig.pricing[0]?.price ?? 400;
  const perPlayer = Math.round(courtPrice / 4);

  return (
    <section className="hero-editorial panel-court relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="hero-editorial__copy relative z-10 flex flex-col justify-between px-6 pb-12 pt-32 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:pb-16 lg:pt-40">
        <div className="hero-editorial__intro">
          <div className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-bright">
            <span className="inline-block h-px w-7 bg-gold-bright" aria-hidden />
            {t.sections.heroEyebrow}
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-cream/70"><MapPin className="h-3.5 w-3.5" aria-hidden />{c.location}</p>
        </div>

        <div className="hero-editorial__main mt-16 lg:mt-12">
          <p className="hero-editorial__kicker mb-5 font-mono text-xs uppercase tracking-[0.22em] text-cream/55">Golden Padel Club / 01</p>
          <h1 id="hero-title" className="hero-editorial__title font-display font-semibold leading-[0.86] tracking-[-0.055em] text-cream" dir="ltr">
            Golden<br /><em className="font-normal text-gold-bright">Padel</em><br />Club<span className="text-gold-bright">.</span>
          </h1>
          <p className="hero-editorial__pitch mt-8 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
            {clubConfig.tagline[locale] || clubConfig.tagline[clubConfig.defaultLocale]}
          </p>
          <div className="hero-editorial__actions mt-8 flex flex-wrap items-center gap-5">
            <Link href={`/${locale}#booking`} className="btn-gold min-h-12 px-7 py-3.5 text-sm">
              {t.actions.book}<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
            <Link href={`/${locale}#about`} className="group inline-flex min-h-12 items-center gap-2 text-sm font-medium text-cream transition-colors hover:text-gold-bright">
              {c.explore}<ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="hero-editorial__rail mt-16 grid grid-cols-2 border-t border-cream/20 pt-5 text-sm text-cream/70 lg:mt-12">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-3xl text-gold-bright">{clubConfig.courts.length.toString().padStart(2, '0')}</span>
            <span>{c.courts}</span>
          </div>
          <Link href={`/${locale}#courts`} className="group border-s border-cream/20 ps-5 transition-colors hover:text-cream">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-3xl text-gold-bright">{perPlayer}</span>
              <span>{c.perPlayer}</span>
            </span>
            <span className="mt-1 block text-xs text-cream/55 group-hover:text-cream/75">{c.court.replace('{price}', String(courtPrice))}</span>
          </Link>
        </div>
      </div>

      <div className="hero-editorial__media relative min-h-[540px] overflow-hidden lg:min-h-[760px]">
        <Image
          src={clubConfig.hero.mediaPath}
          alt="Joueurs sur le terrain de Golden Padel Club à Tanger"
          fill preload
          {...(clubConfig.hero.blurDataURL ? { placeholder: 'blur' as const, blurDataURL: clubConfig.hero.blurDataURL } : {})}
          sizes="(min-width: 1024px) 54vw, 100vw"
          className="hero-editorial__image object-cover object-[50%_34%]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-court-deep/65 via-transparent to-court-deep/10" />
      </div>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock3, UsersRound } from 'lucide-react';
import defaultClub, { type ClubConfig } from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import WordReveal from '@/components/WordReveal';

const copy: Record<string, { section: string; subtitle: string; fullPrice: string; duration: string; players: string; person: string; racket: string; extra: string; surface: string; indoor: string; photo: string }> = {
  fr: { section: '02 / LES TERRAINS', subtitle: 'Tout est prêt pour votre prochain match.', fullPrice: 'Le terrain', duration: '1 h 30', players: '4 joueurs', person: 'par personne, à quatre', racket: 'Location raquette', extra: 'par raquette, en supplément', surface: 'Surface', indoor: 'Terrains couverts', photo: 'Le jeu, au cœur de Tanger' },
  en: { section: '02 / THE COURTS', subtitle: 'Everything is ready for your next match.', fullPrice: 'The court', duration: '90 min', players: '4 players', person: 'per person, with four players', racket: 'Racket rental', extra: 'per racket, extra', surface: 'Surface', indoor: 'Indoor courts', photo: 'The game, in the heart of Tangier' },
  es: { section: '02 / LAS PISTAS', subtitle: 'Todo listo para tu próximo partido.', fullPrice: 'La pista', duration: '90 min', players: '4 jugadores', person: 'por persona, entre cuatro', racket: 'Alquiler de pala', extra: 'por pala, adicional', surface: 'Superficie', indoor: 'Pistas cubiertas', photo: 'El juego, en el corazón de Tánger' },
  ar: { section: '02 / الملاعب', subtitle: 'كل شيء جاهز لمباراتك القادمة.', fullPrice: 'الملعب', duration: '90 دقيقة', players: '4 لاعبين', person: 'للشخص الواحد عند اللعب بأربعة', racket: 'كراء المضرب', extra: 'للمضرب، إضافة إلى سعر الملعب', surface: 'الأرضية', indoor: 'ملاعب داخلية', photo: 'اللعب في قلب طنجة' },
};

export default function CourtsPricing({ locale, club = defaultClub }: { locale: string; club?: ClubConfig }) {
  // Réglages en vigueur (onglet « Mon club » du gérant), par défaut ceux du dépôt.
  const clubConfig = club;
  const t = getDictionary(locale);
  const c = copy[locale] || copy.fr;
  const courtPrice = clubConfig.pricing[0]?.price ?? 400;
  const racketPrice = clubConfig.pricing[1]?.price ?? 20;

  return (
    <section id="courts" className="section courts-editorial bg-sand">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-center gap-5 border-b border-[#1e1b14]/15 pb-5 font-mono text-xs uppercase tracking-[0.18em] t-muted" data-reveal>
          <span className="text-[#87641a]">{c.section}</span><span className="h-px flex-1 bg-[#1e1b14]/12" aria-hidden /><span>{clubConfig.courts.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="mb-12 grid gap-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="eyebrow" data-reveal>{t.sections.courtsEyebrow}</span>
            <WordReveal as="h2" className="mt-4 block font-display text-[clamp(2.8rem,5.3vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.045em] t-title" parts={[t.sections.courtsTitle, { text: t.sections.courtsTitleAccent, className: 'italic t-gold' }]} />
          </div>
          <p className="max-w-sm text-base leading-relaxed t-soft lg:col-span-4" data-reveal>{c.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <figure className="group relative m-0 min-h-[410px] overflow-hidden bg-court lg:col-span-7 lg:min-h-[640px]" data-reveal>
            <Image src="/clubs/golden/3.jpg" alt="Terrain et joueurs au Golden Padel Club" fill sizes="(min-width: 1024px) 56vw, 92vw" className="editorial-image__photo object-cover object-center" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-court-deep/75 to-transparent" aria-hidden />
            <figcaption className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em] text-cream sm:inset-x-8 sm:bottom-8">
              <span>{c.photo}</span><span>02 / 04</span>
            </figcaption>
          </figure>

          <div className="flex flex-col justify-between border border-[#1e1b14]/15 bg-cream p-6 sm:p-10 lg:col-span-5" data-reveal style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-[#1e1b14]/15 pb-5">
                <span className="font-mono text-xs uppercase tracking-[0.18em] t-muted">{c.fullPrice}</span>
                <span className="h-2 w-2 rounded-full bg-gold" aria-hidden />
              </div>
              <div className="mt-8 flex items-baseline gap-3">
                <span className="font-display text-[clamp(5rem,10vw,8.5rem)] leading-none tracking-[-0.09em] text-court">{courtPrice}</span>
                <span className="font-mono text-xl font-semibold t-gold">DH</span>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-4 border-b border-[#1e1b14]/15 pb-7">
                <div className="flex items-center gap-2 text-sm font-medium t-title"><Clock3 className="h-4 w-4 t-gold" aria-hidden />{c.duration}</div>
                <div className="flex items-center gap-2 text-sm font-medium t-title"><UsersRound className="h-4 w-4 t-gold" aria-hidden />{c.players}</div>
              </div>
              <div className="mt-7 flex items-end justify-between gap-4">
                <div><span className="block font-mono text-3xl font-semibold text-court">{courtPrice / 4} DH</span><span className="mt-1 block text-xs t-muted">{c.person}</span></div>
                <span className="font-mono text-[0.65rem] t-muted">01 / 04</span>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between gap-4 border-t border-[#1e1b14]/15 py-4 text-sm"><span className="t-soft">{c.racket}</span><span className="font-mono font-semibold t-title">+ {racketPrice} DH</span></div>
              <p className="mb-6 text-xs t-muted">{c.extra}</p>
              <Link href={`/${locale}#booking`} className="btn-gold flex w-full justify-between px-6 py-4 text-sm">{t.actions.book}<ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden /></Link>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-10 gap-y-3 border-t border-[#1e1b14]/15 pt-5 text-xs t-muted" data-reveal>
          <span>{clubConfig.courts.length} {c.indoor.toLocaleLowerCase(locale)}</span>
          <span>{c.surface} · {clubConfig.courts[0]?.surface}</span>
        </div>
      </div>
    </section>
  );
}

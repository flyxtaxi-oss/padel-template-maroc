import WordReveal from '@/components/WordReveal';
import Image from 'next/image';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Gallery({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  /**
   * Grille éditoriale à rangées fixes : chaque photo reçoit un cadre adapté à
   * son format d'origine (paysage large, portraits hauts) au lieu d'être
   * recadrée en carré. Sur mobile, une colonne en 4:3.
   *
   * La MISE EN PAGE vit ici (c'est une décision de design, pas une donnée),
   * mais les PHOTOS viennent de `club.config.ts`. Auparavant la liste était
   * écrite en dur ici pendant que la config déclarait un tableau `gallery`
   * que personne ne lisait : changer la config ne changeait rien à l'écran —
   * exactement le genre de piège qui fait perdre une heure sur le deuxième
   * club. L'ordre des photos dans la config suit l'ordre des cadres
   * ci-dessous : paysage, portrait haut, portrait haut, portrait, paysage.
   */
  const slots = [
    { className: 'md:col-span-7 md:row-span-2', sizes: '(min-width: 768px) 58vw, 92vw' },
    { className: 'md:col-span-5 md:row-span-3', sizes: '(min-width: 768px) 42vw, 92vw' },
    { className: 'md:col-span-4 md:row-span-3', sizes: '(min-width: 768px) 33vw, 92vw' },
    { className: 'md:col-span-3 md:row-span-3', sizes: '(min-width: 768px) 25vw, 92vw' },
    { className: 'md:col-span-5 md:row-span-2', sizes: '(min-width: 768px) 42vw, 92vw' },
  ];

  // Un club qui fournit moins de photos affiche moins de cadres, sans trou.
  const curatedImages = clubConfig.gallery
    .slice(0, slots.length)
    .map((src, i) => ({ src, ...slots[i] }));

  return (
    <section id="gallery" className="section bg-sand">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow" data-reveal>{t.sections.galleryEyebrow}</span>
            <WordReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold t-title sm:text-[2.6rem]"
              parts={[
                t.sections.galleryTitle,
                { text: t.sections.galleryTitleAccent, className: 'italic t-gold' },
              ]}
            />
          </div>
          <a href={clubConfig.contact.instagram} target="_blank" rel="noopener noreferrer" className="btn-outline px-4 py-2.5 text-sm font-medium" data-reveal style={{ '--reveal-delay': '220ms' } as React.CSSProperties}>
            <InstagramIcon className="h-4 w-4" />
            @goldenpadelclubtanger
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-flow-dense md:grid-cols-12 md:auto-rows-[170px] lg:auto-rows-[190px]">
          {curatedImages.map((img, i) => (
            <div key={i} data-reveal style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties} className={`group relative aspect-[4/3] overflow-hidden rounded-[1.25rem] card-lift md:aspect-auto ${img.className}`}>
              <Image
                src={img.src}
                alt={`${clubConfig.name} — photo ${i + 1}`}
                fill
                sizes={img.sizes}
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              <span aria-hidden className="absolute bottom-3 end-3 rounded-full bg-court-deep/70 px-2.5 py-1 font-mono text-[0.68rem] tracking-[0.08em] text-cream/85">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

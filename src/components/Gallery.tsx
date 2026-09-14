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
  const curatedImages = [
    { src: '/clubs/golden/6.jpg', className: 'md:col-span-8 aspect-[16/10]', sizes: '(min-width: 768px) 62vw, 92vw' },
    { src: '/clubs/golden/3.jpg', className: 'md:col-span-4 aspect-square', sizes: '(min-width: 768px) 31vw, 92vw' },
    { src: '/clubs/golden/4.jpg', className: 'md:col-span-4 aspect-square', sizes: '(min-width: 768px) 31vw, 92vw' },
    { src: '/clubs/golden/7.jpg', className: 'md:col-span-4 aspect-square', sizes: '(min-width: 768px) 31vw, 92vw' },
    { src: '/clubs/golden/8.jpg', className: 'md:col-span-4 aspect-square', sizes: '(min-width: 768px) 31vw, 92vw' },
  ];

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {curatedImages.map((img, i) => (
            <div key={i} data-reveal style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties} className={`group relative overflow-hidden rounded-[1.25rem] card-lift ${img.className}`}>
              <Image
                src={img.src}
                alt={`${clubConfig.name} — photo ${i + 1}`}
                fill
                sizes={img.sizes}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

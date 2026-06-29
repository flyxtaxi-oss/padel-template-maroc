import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

export default function Gallery({ locale }: { locale: string }) {
  const { gallery, name } = clubConfig;
  const t = getDictionary(locale);
  if (!gallery || gallery.length === 0) return null;

  // Layout: first photo large, rest in grid
  const [hero, ...rest] = gallery;

  return (
    <section id="gallery" className="py-32 bg-[#060913] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-10 -right-20 opacity-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
              Le club en images
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white">
              {t.navigation.gallery}
            </h2>
          </div>
          <a
            href="https://instagram.com/goldenpadelclubtanger"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            @goldenpadelclubtanger
          </a>
        </div>

        {/* Asymmetric masonry-style grid */}
        <div className="grid grid-cols-12 gap-3">
          {/* Hero photo */}
          <div className="col-span-12 md:col-span-7 row-span-2 aspect-video md:aspect-auto overflow-hidden rounded-3xl group">
            <img src={hero} alt={`${name} - vue principale`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          {/* Side photos */}
          {rest.slice(0, 2).map((src, i) => (
            <div key={i} className="col-span-6 md:col-span-5 overflow-hidden rounded-3xl group aspect-square">
              <img src={src} alt={`${name} - photo ${i + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          ))}
          {/* Bottom row */}
          {rest.slice(2).map((src, i) => (
            <div key={i} className="col-span-6 sm:col-span-4 md:col-span-3 overflow-hidden rounded-2xl group aspect-square">
              <img src={src} alt={`${name} - photo ${i + 4}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

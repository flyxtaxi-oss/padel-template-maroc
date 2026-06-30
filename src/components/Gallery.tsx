import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

export default function Gallery({ locale }: { locale: string }) {
  const t = getDictionary(locale);
  
  // Curated, non-repeated list of images for Golden Padel Club Tanger
  // (We use images 3, 4, 6, 7, 8 to avoid duplicating the ones shown in Hero/About/Courts sections)
  const curatedImages = [
    { src: '/clubs/golden/6.jpg', aspect: 'md:col-span-8 aspect-video' },
    { src: '/clubs/golden/3.jpg', aspect: 'md:col-span-4 aspect-square' },
    { src: '/clubs/golden/4.jpg', aspect: 'md:col-span-4 aspect-square' },
    { src: '/clubs/golden/7.jpg', aspect: 'md:col-span-4 aspect-square' },
    { src: '/clubs/golden/8.jpg', aspect: 'md:col-span-4 aspect-square' },
  ];

  return (
    <section id="gallery" className="py-36 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-10 -right-20 opacity-10 animate-float" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-4">
              Le club en images
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase">
              Notre <span className="font-quote italic text-gold normal-case font-medium tracking-wide">Galerie</span>
            </h2>
          </div>
          <a
            href="https://instagram.com/goldenpadelclubtanger"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-300 text-xs font-semibold tracking-wider uppercase border border-white/10 px-4 py-2.5 rounded-full hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>@goldenpadelclubtanger</span>
          </a>
        </div>

        {/* Asymmetrical masonry grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {curatedImages.map((img, i) => (
            <div 
              key={i} 
              className={`relative overflow-hidden rounded-[24px] group border border-white/5 shadow-md ${img.aspect}`}
            >
              <img 
                src={img.src} 
                alt={`${clubConfig.name} - photo ${i + 1}`} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              
              {/* Elegant hover vignette overlay with gold outline */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6 border-0 group-hover:border-[3px] group-hover:border-yellow-500/20 rounded-[24px] pointer-events-none" />
              
              <span className="absolute bottom-6 left-6 text-[10px] font-mono font-black uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Golden Padel Tanger
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

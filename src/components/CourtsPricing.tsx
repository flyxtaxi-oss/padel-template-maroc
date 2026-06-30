import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

export default function CourtsPricing({ locale }: { locale: string }) {
  const { courts, pricing } = clubConfig;
  const t = getDictionary(locale);
  const indoorCount = courts.filter(c => c.type === 'indoor').length;
  const outdoorCount = courts.filter(c => c.type === 'outdoor').length;

  const features = [
    { icon: '🌡️', title: 'Climatisation', desc: 'Température constante' },
    { icon: '💡', title: 'Éclairage LED', desc: 'Zéro zone d\'ombre' },
    { icon: '🎥', title: 'Vidéosurveillance', desc: 'Sécurisé 24h/24' },
    { icon: '🚿', title: 'Douches & Vestiaires', desc: 'Vestiaires haut de gamme' },
    { icon: '🏪', title: 'Pro-shop', desc: 'Équipement Siux & Adidas' },
    { icon: '🅿️', title: 'Parking Privé', desc: 'Gratuit & surveillé' },
  ];

  return (
    <section id="courts" className="py-36 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-gold w-[350px] h-[350px] -bottom-20 -right-20 opacity-10 animate-float" />
      <div className="glow-orb glow-blue w-[400px] h-[400px] -top-10 -left-10 opacity-5 animate-float-delayed" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
            Les installations
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4 uppercase">
            Terrains & <span className="font-quote italic text-gold normal-case font-medium tracking-wide">Tarifs</span>
          </h2>
          <div className="divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left: Court highlight card & Spec grid (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Court visual teaser */}
            <div className="rounded-[32px] overflow-hidden relative h-56 border border-white/5 group shadow-xl">
              <img 
                src="/clubs/golden/5.jpg" 
                alt="terrains" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060913]/95 via-[#060913]/60 to-transparent flex items-center px-8 sm:px-10">
                <div>
                  <div className="font-heading text-6xl sm:text-7xl font-black text-gold leading-none">{courts.length}</div>
                  <div className="text-white text-lg sm:text-xl font-black uppercase tracking-wider mt-2">Mondo Supercourt</div>
                  <div className="text-white/40 text-xs mt-1">Terrains intérieurs panoramiques homologués WPT</div>
                </div>
              </div>
            </div>

            {/* Features spec cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div 
                  key={i} 
                  className="glass rounded-[24px] p-5 text-center border border-white/5 flex flex-col items-center transition-all duration-300 hover:border-yellow-500/20"
                >
                  <span className="text-3xl mb-3 filter drop-shadow-md">{f.icon}</span>
                  <span className="text-white text-xs font-black uppercase tracking-wider">{f.title}</span>
                  <span className="text-white/40 text-[10px] mt-1 leading-relaxed">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pricing tickets (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <h3 className="text-white/35 text-[10px] font-black uppercase tracking-widest mb-4">Grille des tarifs</h3>
            
            {pricing.map((item, idx) => {
              const label = item.label[locale] || item.label[clubConfig.defaultLocale] || '';
              const isFirst = idx === 0;
              return (
                <div
                  key={idx}
                  className="relative rounded-[24px] p-6 pl-8 flex items-center justify-between overflow-hidden group transition-all duration-300 hover:scale-[1.02] border"
                  style={isFirst
                    ? { 
                        background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', 
                        borderColor: 'transparent',
                        boxShadow: '0 15px 40px rgba(212,175,55,0.2)' 
                      }
                    : { 
                        background: 'rgba(255,255,255,0.02)', 
                        borderColor: 'rgba(255,255,255,0.05)' 
                      }
                  }
                >
                  {/* Skeuomorphic ticket notches */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-black border border-white/5 z-20 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-7 rounded-full bg-black border border-white/5 z-20 group-hover:scale-110 transition-transform" />

                  {/* Left info */}
                  <div className="flex-grow min-w-0 pr-4">
                    <div className={`font-black uppercase tracking-wide text-sm truncate ${isFirst ? 'text-black' : 'text-white'}`}>{label}</div>
                    <div className={`text-xs mt-1 ${isFirst ? 'text-black/60' : 'text-white/40'}`}>{item.duration}</div>
                  </div>

                  {/* Dashed line */}
                  <div className={`h-12 border-l-2 border-dashed ${isFirst ? 'border-black/20' : 'border-white/10'} mx-4`} />
                  
                  {/* Right info */}
                  <div className="flex items-baseline gap-0.5 shrink-0 pl-2">
                    <span className={`font-mono font-black text-3xl sm:text-4xl ${isFirst ? 'text-black' : 'text-gold'}`}>
                      {item.price}
                    </span>
                    <span className={`text-[10px] font-black ${isFirst ? 'text-black/70' : 'text-white/45'}`}>
                      MAD
                    </span>
                  </div>

                  {isFirst && <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />}
                </div>
              );
            })}

            {/* Quick concierge booking button */}
            <a
              href={`/${locale}#booking`}
              className="mt-6 flex items-center justify-center gap-3 w-full py-4 rounded-full text-black font-black text-xs uppercase tracking-widest transition-all duration-300 btn-premium shadow-md"
            >
              <span>{t.actions.book}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

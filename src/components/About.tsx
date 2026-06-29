import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

export default function About({ locale }: { locale: string }) {
  const { about } = clubConfig;
  const t = getDictionary(locale);
  const localText = about.text[locale] || about.text[clubConfig.defaultLocale];

  return (
    <section id="about" className="py-36 bg-background relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-1/2 -left-40 opacity-10 animate-float" />
      <div className="glow-orb glow-gold w-[300px] h-[300px] top-1/3 -right-20 opacity-5 animate-float-delayed" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* Left Column - Single Editorial Showcase Image */}
          <div className="lg:col-span-5 relative">
            {/* Golden decorative accent background card */}
            <div className="absolute -inset-3 rounded-[36px] bg-gradient-to-br from-yellow-500/10 to-transparent -rotate-2 z-0 scale-95" />
            
            <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] border border-white/5 shadow-2xl z-10 group">
              <img 
                src="/clubs/golden/2.jpg" 
                alt="Golden Padel Club terrain" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060913]/60 to-transparent opacity-80" />
            </div>

            {/* Floating gold stamp badge */}
            <div className="absolute -bottom-6 -right-6 glass-dark rounded-2xl p-5 border border-yellow-500/20 z-25 shadow-xl transition-transform duration-500 hover:scale-105">
              <div className="text-gold font-mono font-black text-4xl leading-none">{about.stats.established}</div>
              <div className="text-white/40 text-[9px] uppercase tracking-widest font-black mt-1.5">Fondation du club</div>
            </div>
          </div>

          {/* Right Column - Luxury Copywriting */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
              L'histoire
            </div>
            
            {/* Title */}
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-6 leading-tight uppercase">
              Le padel, <span className="font-quote italic text-gold normal-case font-medium tracking-wide">autrement.</span>
            </h2>
            <div className="divider mb-8" />
            
            {/* Body */}
            <p className="text-white/60 text-base leading-relaxed mb-12 max-w-xl">
              {localText}
            </p>

            {/* Glassmorphic Stats Grid */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                { value: `${about.stats.courts}`, label: 'Terrains Indoor' },
                { value: about.stats.players, label: 'Membres Actifs' },
                { value: '21°C', label: 'Régulation Temp.' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-5 text-center border border-white/5 transition-all duration-300 hover:border-yellow-500/20">
                  <div className="font-mono text-2xl sm:text-3xl font-black text-gold">{s.value}</div>
                  <div className="text-white/35 text-[9px] uppercase tracking-widest font-bold mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

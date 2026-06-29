import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

export default function About({ locale }: { locale: string }) {
  const { about } = clubConfig;
  const t = getDictionary(locale);
  const localText = about.text[locale] || about.text[clubConfig.defaultLocale];

  return (
    <section id="about" className="py-32 bg-[#060913] relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-1/2 -left-40 opacity-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left - Image collage */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 aspect-video rounded-2xl overflow-hidden">
                <img src="/clubs/golden/2.jpg" alt="Golden Padel Club terrain" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src="/clubs/golden/3.jpg" alt="Golden Padel Club ambiance" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src="/clubs/golden/4.jpg" alt="Golden Padel Club tournoi" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 glass-dark rounded-2xl p-5 border border-yellow-500/20">
              <div className="text-gold font-heading font-black text-4xl">{about.stats.established}</div>
              <div className="text-white/50 text-sm mt-1">Année de création</div>
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
              Notre histoire
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Le padel, <span className="text-gold">autrement.</span>
            </h2>
            <div className="divider mb-8" />
            <p className="text-white/60 text-lg leading-relaxed mb-10">
              {localText}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: `${about.stats.courts}`, label: 'Terrains indoor' },
                { value: about.stats.players, label: 'Membres actifs' },
                { value: '21°C', label: 'Toute l\'année' },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-5 text-center border-yellow-500/10">
                  <div className="font-heading text-3xl font-black text-gold">{s.value}</div>
                  <div className="text-white/40 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

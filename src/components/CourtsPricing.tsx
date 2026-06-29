import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';

export default function CourtsPricing({ locale }: { locale: string }) {
  const { courts, pricing } = clubConfig;
  const t = getDictionary(locale);
  const indoorCount = courts.filter(c => c.type === 'indoor').length;
  const outdoorCount = courts.filter(c => c.type === 'outdoor').length;

  const features = [
    { icon: '🌡️', title: 'Climatisation', desc: '21°C toute l\'année' },
    { icon: '💡', title: 'Éclairage LED', desc: 'Haute luminosité' },
    { icon: '🎥', title: 'Vidéosurveillance', desc: 'Sécurité 24h/24' },
    { icon: '🚿', title: 'Vestiaires', desc: 'Modernes & propres' },
    { icon: '🏪', title: 'Pro-shop', desc: 'Matériel & location' },
    { icon: '🅿️', title: 'Parking', desc: 'Gratuit & sécurisé' },
  ];

  return (
    <section id="courts" className="py-32 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-gold w-[350px] h-[350px] -bottom-20 -right-20 opacity-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            Installations
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4">
            {t.navigation.courts}
          </h2>
          <div className="divider mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">

          {/* Courts & Features */}
          <div className="space-y-6">
            {/* Court count highlight */}
            <div className="rounded-3xl overflow-hidden relative h-48">
              <img src="/clubs/golden/5.jpg" alt="terrain" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/20 flex items-center px-8">
                <div>
                  <div className="font-heading text-6xl font-black text-gold">{courts.length}</div>
                  <div className="text-white text-xl font-medium">Terrains {indoorCount > 0 ? 'Indoor' : ''}{outdoorCount > 0 && indoorCount > 0 ? ' + Outdoor' : ''}</div>
                  <div className="text-white/50 text-sm mt-1">{courts[0]?.surface}</div>
                </div>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-3">
              {features.map((f, i) => (
                <div key={i} className="glass rounded-2xl p-4 text-center hover:border-yellow-500/30 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-white text-xs font-bold">{f.title}</div>
                  <div className="text-white/40 text-xs mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">Tarifs</h3>
            {pricing.map((item, idx) => {
              const label = item.label[locale] || item.label[clubConfig.defaultLocale] || '';
              const isFirst = idx === 0;
              return (
                <div
                  key={idx}
                  className="relative rounded-3xl p-6 flex items-center justify-between overflow-hidden group transition-all hover:scale-[1.02]"
                  style={isFirst
                    ? { background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', boxShadow: '0 20px 60px rgba(212,175,55,0.25)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  <div>
                    <div className={`font-bold text-lg ${isFirst ? 'text-black' : 'text-white'}`}>{label}</div>
                    <div className={`text-sm mt-1 ${isFirst ? 'text-black/60' : 'text-white/40'}`}>{item.duration}</div>
                  </div>
                  <div className={`font-heading font-black text-4xl ${isFirst ? 'text-black' : 'text-gold'}`}>
                    {item.price}<span className={`text-base font-medium ${isFirst ? 'text-black/60' : 'text-white/40'}`}> MAD</span>
                  </div>
                  {isFirst && <div className="absolute inset-0 animate-shimmer opacity-30" />}
                </div>
              );
            })}

            {/* CTA */}
            <a
              href={`/${locale}#booking`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-black font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}
            >
              {t.actions.book}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

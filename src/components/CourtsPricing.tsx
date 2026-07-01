import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { Thermometer, Lightbulb, Video, Droplets, ShoppingBag, Car, ArrowRight } from 'lucide-react';

export default function CourtsPricing({ locale }: { locale: string }) {
  const { courts, pricing } = clubConfig;
  const t = getDictionary(locale);

  const features = [
    { icon: Thermometer, title: 'Climatisation', desc: 'Température constante' },
    { icon: Lightbulb, title: 'Éclairage LED', desc: "Zéro zone d'ombre" },
    { icon: Video, title: 'Vidéosurveillance', desc: 'Sécurisé 24h/24' },
    { icon: Droplets, title: 'Douches & vestiaires', desc: 'Haut de gamme' },
    { icon: ShoppingBag, title: 'Pro-shop', desc: 'Siux & Adidas' },
    { icon: Car, title: 'Parking privé', desc: 'Gratuit & surveillé' },
  ];

  return (
    <section id="courts" className="section bg-sand">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 max-w-2xl" data-reveal>
          <span className="eyebrow">Les installations</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-[2.6rem]">
            Terrains & <span className="italic t-gold">tarifs</span>
          </h2>
          <div className="divider mt-5" />
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">

          <div className="space-y-6 lg:col-span-7" data-reveal>
            <div className="relative h-60 overflow-hidden rounded-[1.5rem] card-lift">
              <img src="/clubs/golden/5.jpg" alt="Terrains Mondo Supercourt" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center bg-gradient-to-r from-court/92 via-court/45 to-transparent px-8">
                <div>
                  <div className="font-display text-6xl font-semibold text-gold-bright">{courts.length}</div>
                  <div className="mt-1 text-lg font-semibold text-cream">Mondo Supercourt</div>
                  <div className="mt-1 text-sm text-cream/70">Terrains indoor panoramiques homologués WPT</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="card card-lift card-hover flex flex-col items-start p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/12">
                      <Icon className="h-5 w-5 t-gold" />
                    </div>
                    <span className="text-sm font-semibold t-title">{f.title}</span>
                    <span className="mt-0.5 text-xs t-muted">{f.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5" data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
            <h3 className="text-sm font-semibold t-muted">Grille des tarifs</h3>

            {pricing.map((item, idx) => {
              const label = item.label[locale] || item.label[clubConfig.defaultLocale] || '';
              const isFeatured = idx === 0;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between rounded-2xl p-6 ${
                    isFeatured ? 'bg-court text-cream card-lift' : 'card card-lift'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className={`truncate text-sm font-semibold ${isFeatured ? 'text-cream' : 't-title'}`}>{label}</div>
                    <div className={`mt-1 text-xs ${isFeatured ? 'text-cream/60' : 't-muted'}`}>{item.duration}</div>
                  </div>
                  <div className="flex shrink-0 items-baseline gap-1">
                    <span className={`font-mono text-3xl font-bold ${isFeatured ? 'text-gold-bright' : 't-gold'}`}>{item.price}</span>
                    <span className={`text-xs font-semibold ${isFeatured ? 'text-cream/60' : 't-muted'}`}>MAD</span>
                  </div>
                </div>
              );
            })}

            <a href={`/${locale}#booking`} className="btn-gold mt-4 w-full py-4 text-sm">
              {t.actions.book}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}

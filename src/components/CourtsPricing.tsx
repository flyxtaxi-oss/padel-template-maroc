import clubConfig from '@/config/club.config';
import { CheckCircle2 } from 'lucide-react';

export default function CourtsPricing() {
  const { courts, pricing, enableArabic, ar } = clubConfig;
  const isRtl = enableArabic;
  
  const indoorCount = courts.filter(c => c.type === 'indoor').length;
  const outdoorCount = courts.filter(c => c.type === 'outdoor').length;

  return (
    <section id="courts" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold mb-6 text-[var(--primary)] dark:text-white">
            Nos Terrains & Tarifs
          </h2>
          <div className="w-20 h-1 bg-[var(--accent)] mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Courts summary */}
          <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[var(--secondary)] text-white flex items-center justify-center text-sm">
                {courts.length}
              </span>
              Terrains disponibles
            </h3>
            
            <ul className="space-y-4 mb-8">
              {indoorCount > 0 && (
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[var(--secondary)] mt-1 flex-shrink-0" />
                  <div>
                    <strong className="block text-lg">{indoorCount} Terrains Indoor</strong>
                    <span className="text-gray-600 dark:text-gray-400">Idéal pour jouer à l'abri du soleil ou de la pluie.</span>
                  </div>
                </li>
              )}
              {outdoorCount > 0 && (
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[var(--secondary)] mt-1 flex-shrink-0" />
                  <div>
                    <strong className="block text-lg">{outdoorCount} Terrains Outdoor</strong>
                    <span className="text-gray-600 dark:text-gray-400">Pour profiter du beau temps.</span>
                  </div>
                </li>
              )}
            </ul>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Tous nos terrains sont équipés de moquettes de dernière génération (Supercourt) et d'un éclairage LED anti-éblouissement.
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-6">
            {pricing.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-950 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-[var(--secondary)] transition-colors"
              >
                <div className="text-center sm:text-left">
                  <h4 className="text-xl font-bold mb-1">
                    {isRtl && ar?.pricingLabels && ar.pricingLabels[item.label] 
                      ? ar.pricingLabels[item.label] 
                      : item.label}
                  </h4>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">{item.duration}</span>
                </div>
                <div className="flex flex-col items-center sm:items-end">
                  <div className="text-4xl font-black text-[var(--primary)] dark:text-white">
                    {item.price} <span className="text-lg font-medium text-gray-500">MAD</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

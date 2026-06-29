import clubConfig from '@/config/club.config';
import { ChevronDown } from 'lucide-react';

export default function FAQ({ locale }: { locale: string }) {
  const { faq } = clubConfig;
  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" className="py-32 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-gold w-[400px] h-[400px] top-10 right-10 opacity-10" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
            FAQ
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white">
            Questions <span className="text-gold">fréquentes</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faq.map((item, idx) => {
            const question = item.question[locale] || item.question[clubConfig.defaultLocale] || '';
            const answer = item.answer[locale] || item.answer[clubConfig.defaultLocale] || '';
            return (
              <details key={idx} className="group glass rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                  <span className="font-bold text-white">{question}</span>
                  <ChevronDown className="w-5 h-5 text-yellow-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-white/60 leading-relaxed border-t border-white/5 pt-4">
                  {answer}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

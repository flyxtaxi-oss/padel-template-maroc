import clubConfig from '@/config/club.config';
import { ChevronDown } from 'lucide-react';

export default function FAQ({ locale }: { locale: string }) {
  const { faq } = clubConfig;
  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" className="py-36 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-gold w-[400px] h-[400px] top-10 right-10 opacity-10 animate-float" />
      
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-6">
            FAQ
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase">
            Questions <span className="text-gold">fréquentes</span>
          </h2>
          <div className="divider mx-auto mt-4" />
        </div>

        <div className="space-y-4">
          {faq.map((item, idx) => {
            const question = item.question[locale] || item.question[clubConfig.defaultLocale] || '';
            const answer = item.answer[locale] || item.answer[clubConfig.defaultLocale] || '';
            return (
              <details 
                key={idx} 
                className="group glass rounded-[24px] overflow-hidden border border-white/5 transition-all duration-300"
              >
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none select-none">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-gold/60 font-bold bg-white/5 w-6 h-6 rounded-lg flex items-center justify-center border border-white/5">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-heading font-black text-sm sm:text-base tracking-wide text-white group-hover:text-gold transition-colors duration-300">
                      {question}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-yellow-400 flex-shrink-0 transition-transform duration-500 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-5 pl-16 animate-in fade-in slide-in-from-top-2 duration-300">
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

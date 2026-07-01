import clubConfig from '@/config/club.config';
import { ChevronDown } from 'lucide-react';

export default function FAQ({ locale }: { locale: string }) {
  const { faq } = clubConfig;
  if (!faq || faq.length === 0) return null;

  return (
    <section id="faq" className="section bg-sand">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center" data-reveal>
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl">
            Questions <span className="italic t-gold">fréquentes</span>
          </h2>
          <div className="divider mx-auto mt-5" />
        </div>

        <div className="space-y-3" data-reveal style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
          {faq.map((item, idx) => {
            const question = item.question[locale] || item.question[clubConfig.defaultLocale] || '';
            const answer = item.answer[locale] || item.answer[clubConfig.defaultLocale] || '';
            return (
              <details key={idx} className="group card card-lift overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 select-none">
                  <span className="font-display text-base font-semibold t-title transition-colors group-hover:t-gold">
                    {question}
                  </span>
                  <ChevronDown className="h-5 w-5 flex-shrink-0 t-gold transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="border-t hair px-5 pb-5 pt-4 text-sm leading-relaxed t-soft">{answer}</div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

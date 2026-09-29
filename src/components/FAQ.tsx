import WordReveal from '@/components/WordReveal';
import defaultClub, { type ClubConfig } from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { ChevronDown } from 'lucide-react';

export default function FAQ({ locale, club = defaultClub }: { locale: string; club?: ClubConfig }) {
  // Réglages en vigueur (onglet « Mon club » du gérant), par défaut ceux du dépôt.
  const clubConfig = club;
  const t = getDictionary(locale);
  const { faq } = clubConfig;
  if (!faq || faq.length === 0) return null;

  return (
    // Alternance des fonds (DESIGN.md) : Galerie ivoire → Tournois crème →
    // FAQ ivoire. Sans tournoi, la FAQ passe en crème pour ne pas fusionner
    // avec la Galerie. Automatique : le gérant ajoute un tournoi, le rythme suit.
    <section id="faq" className={`section ${clubConfig.events?.length ? 'bg-sand' : 'bg-cream'}`}>
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="eyebrow" data-reveal>{t.sections.faqEyebrow}</span>
          <WordReveal
            as="h2"
            className="mt-4 font-display text-3xl font-semibold t-title sm:text-4xl"
            parts={[
              t.sections.faqTitle,
              { text: t.sections.faqTitleAccent, className: 'italic t-gold' },
            ]}
          />
          <div className="divider mx-auto mt-5" data-reveal style={{ '--reveal-delay': '220ms' } as React.CSSProperties} />
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

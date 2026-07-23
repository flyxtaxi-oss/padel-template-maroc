import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export type LegalSection = { heading: string; body: string[] };

// Gabarit commun aux pages Mentions légales / Confidentialité.
// Volontairement sobre : pas de hero, pas d'animation — c'est une page de texte.
export default function LegalPage({
  locale,
  title,
  updated,
  backLabel,
  sections,
}: {
  locale: string;
  title: string;
  updated: string;
  backLabel: string;
  sections: LegalSection[];
}) {
  return (
    <main className="section bg-cream">
      <div className="mx-auto max-w-3xl px-6">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm t-muted transition-colors hover:t-gold">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {backLabel}
        </Link>

        <h1 className="mt-8 font-display text-4xl font-semibold t-title sm:text-5xl">{title}</h1>
        <div className="divider mt-5" />
        <p className="mt-4 text-xs t-muted">{updated}</p>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-xl font-semibold t-title">{s.heading}</h2>
              <div className="mt-3 space-y-3">
                {s.body.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed t-soft">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

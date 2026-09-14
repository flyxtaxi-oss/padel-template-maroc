import WordReveal from '@/components/WordReveal';
import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { getGoogleReviewUrl } from '@/lib/reviewUrl';
import { Star, ExternalLink } from 'lucide-react';

// Cette section n'affiche QUE des données réelles :
// - la note agrégée et le nombre d'avis de la fiche Google du club ;
// - les avis individuels uniquement s'ils ont été copiés depuis Google
//   dans club.config.ts (googleReviews). Aucun avis n'est inventé.
export default function Reviews({ locale }: { locale: string }) {
  const { googleReviews, googleRating, googleReviewCount } = clubConfig;
  const googleReviewUrl = getGoogleReviewUrl();
  const t = getDictionary(locale);
  const hasReviews = googleReviews && googleReviews.length > 0;

  if (!googleRating && !hasReviews) return null;

  return (
    <section className="panel-court section relative overflow-hidden">
      <div aria-hidden className="court-lines pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">

        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow" data-reveal>{t.sections.reviewsEyebrow}</span>
            <WordReveal
              as="h2"
              className="mt-4 font-display text-3xl font-semibold t-title sm:text-[2.6rem]"
              parts={[t.sections.reviewsTitle]}
            />
          </div>
          {googleReviewUrl && (
            <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn-outline px-5 py-2.5 text-sm font-medium">
              <Star className="h-4 w-4 fill-gold-bright text-gold-bright" />
              {t.sections.leaveReview}
            </a>
          )}
        </div>

        <div className={`grid grid-cols-1 items-stretch gap-6 ${hasReviews ? 'lg:grid-cols-12' : ''}`}>

          <div
            className={`card flex flex-col items-center justify-center p-10 text-center ${hasReviews ? 'lg:col-span-4' : ''}`}
            data-reveal
          >
            <span className="text-sm t-muted">{t.sections.overallRating}</span>
            <div className="my-3 font-mono text-7xl font-bold t-title">{googleRating || '—'}</div>
            <div className="mb-3 flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-gold-bright text-gold-bright" />)}
            </div>
            <div className="text-sm t-muted">
              {googleReviewCount ? `${googleReviewCount} ${t.sections.googleReviews}` : t.sections.googleReviews}
            </div>
            {googleReviewUrl && (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium t-gold underline-offset-4 hover:underline"
              >
                {t.sections.seeOnGoogle}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {hasReviews && (
            <div className="grid gap-6 md:grid-cols-2 lg:col-span-8" data-reveal style={{ '--reveal-delay': '120ms' } as React.CSSProperties}>
              {googleReviews.map((review, idx) => (
                <div key={idx} className="card flex flex-col justify-between p-7">
                  <div>
                    <div className="mb-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-gold-bright text-gold-bright' : 'text-white/20'}`} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed t-soft">&ldquo;{review.text}&rdquo;</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t hair pt-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-semibold text-[#1a140a]">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold t-title">{review.author}</div>
                      <div className="text-xs t-muted">{t.sections.googleReview}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}

import clubConfig from '@/config/club.config';
import { Star } from 'lucide-react';

export default function Reviews({ locale }: { locale: string }) {
  const { googleReviews, googleReviewUrl, googleRating, googleReviewCount } = clubConfig;
  if (!googleReviews || googleReviews.length === 0) return null;

  return (
    <section className="panel-court section relative overflow-hidden">
      <div aria-hidden className="court-lines pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative z-10 mx-auto max-w-7xl px-6">

        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-reveal>
          <div>
            <span className="eyebrow">Témoignages</span>
            <h2 className="mt-4 font-display text-3xl font-semibold t-title sm:text-[2.6rem]">
              Ils adorent <span className="italic t-gold">le club</span>
            </h2>
          </div>
          {googleReviewUrl && (
            <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="btn-outline px-5 py-2.5 text-sm font-medium">
              <Star className="h-4 w-4 fill-gold-bright text-gold-bright" />
              Laisser un avis
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">

          <div className="card flex flex-col items-center justify-center p-10 text-center lg:col-span-4" data-reveal>
            <span className="text-sm t-muted">Note globale</span>
            <div className="my-3 font-mono text-7xl font-bold t-title">{googleRating || '5,0'}</div>
            <div className="mb-3 flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-gold-bright text-gold-bright" />)}
            </div>
            <div className="text-sm t-muted">{googleReviewCount ? `${googleReviewCount} avis Google` : 'sur Google Reviews'}</div>
          </div>

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
                    <div className="text-xs t-muted">Avis Google</div>
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

import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { Star } from 'lucide-react';

export default function Reviews({ locale }: { locale: string }) {
  const { googleReviews, googleReviewUrl, name } = clubConfig;
  if (!googleReviews || googleReviews.length === 0) return null;

  return (
    <section className="py-32 bg-[#060913] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-1/2 left-10 opacity-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
              Témoignages
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white">
              Ils adorent<br /><span className="text-gold">le club.</span>
            </h2>
          </div>
          {googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-yellow-500/30 text-yellow-400 text-sm font-bold hover:bg-yellow-500/10 transition-colors"
            >
              <Star className="w-4 h-4 fill-yellow-400" />
              Laisser un avis
            </a>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Summary card */}
          <div className="rounded-3xl p-8 flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
            <div className="font-heading text-7xl font-black text-black mb-2">5.0</div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-black text-black" />)}
            </div>
            <div className="text-black/60 text-sm font-medium">sur Google Reviews</div>
          </div>

          {/* Review cards */}
          {googleReviews.map((review, idx) => (
            <div key={idx} className="glass rounded-3xl p-7 flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />
                ))}
              </div>
              <p className="text-white/70 text-base leading-relaxed flex-grow italic">
                "{review.text}"
              </p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black text-sm" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{review.author}</div>
                  <div className="text-white/30 text-xs">Google Review</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

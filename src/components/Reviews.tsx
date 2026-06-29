import clubConfig from '@/config/club.config';
import { getDictionary } from '@/i18n/dictionaries';
import { Star } from 'lucide-react';

export default function Reviews({ locale }: { locale: string }) {
  const { googleReviews, googleReviewUrl } = clubConfig;
  const t = getDictionary(locale);
  if (!googleReviews || googleReviews.length === 0) return null;

  return (
    <section className="py-36 bg-background relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="glow-orb glow-blue w-[400px] h-[400px] top-1/2 left-10 opacity-10 animate-float" />
      <div className="glow-orb glow-gold w-[300px] h-[300px] bottom-10 right-10 opacity-5 animate-float-delayed" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-4">
              Témoignages
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white uppercase leading-none">
              Ils adorent<br /><span className="text-gold">le club.</span>
            </h2>
          </div>
          {googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/10 transition-all duration-300"
            >
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Laisser un avis
            </a>
          )}
        </div>

        {/* Reviews Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Big score badge card (4 cols) */}
          <div className="lg:col-span-4 rounded-[32px] p-10 flex flex-col items-center justify-center text-center border border-white/5 relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(6, 9, 19, 0.8))' }}>
            {/* Ambient golden orb specifically for this card */}
            <div className="absolute inset-0 bg-yellow-500/5 filter blur-[40px] pointer-events-none" />
            
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Note Globale</span>
            <div className="font-heading text-8xl font-black text-white mb-2 leading-none">5.0</div>
            <div className="flex gap-1.5 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
            </div>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">sur Google Reviews</div>
          </div>

          {/* Right Column: Dynamic review items (8 cols) */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
            {googleReviews.map((review, idx) => (
              <div 
                key={idx} 
                className="glass rounded-[28px] p-8 flex flex-col justify-between border border-white/5 shadow-md"
              >
                <div>
                  <div className="flex gap-1.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed italic">
                    "{review.text}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-black text-xs" style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)' }}>
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-black text-xs uppercase tracking-wider">{review.author}</div>
                    <div className="text-white/25 text-[10px] tracking-wider uppercase font-semibold mt-0.5">Avis Google</div>
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

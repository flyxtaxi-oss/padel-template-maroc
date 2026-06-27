import clubConfig from '@/config/club.config';
import { Star } from 'lucide-react';

export default function Reviews() {
  const { googleReviews } = clubConfig;
  
  if (!googleReviews || googleReviews.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold mb-6 text-[var(--primary)] dark:text-white">
            L'avis de nos joueurs
          </h2>
          <div className="w-20 h-1 bg-[var(--accent)] mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {googleReviews.map((review, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-gray-950 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col"
            >
              <div className="flex items-center gap-1 mb-6 text-[var(--accent)]">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-700'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-8 flex-grow text-lg italic">
                "{review.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold">{review.author}</h4>
                  <span className="text-sm text-gray-500">Google Review</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

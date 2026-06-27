import clubConfig from '@/config/club.config';

export default function About() {
  const { about, enableArabic, ar } = clubConfig;
  const isRtl = enableArabic;
  
  return (
    <section id="about" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h2 className="font-heading text-4xl font-bold mb-6 text-[var(--primary)] dark:text-white">
            À propos du club
          </h2>
          <div className="w-20 h-1 bg-[var(--accent)] mb-10 mx-auto rounded-full" />
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-16 leading-relaxed">
            {isRtl && ar ? ar.aboutText : about.text}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-4xl font-bold text-[var(--secondary)] mb-2">{about.stats.courts}</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Terrains au total</div>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-4xl font-bold text-[var(--secondary)] mb-2">{about.stats.players}</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Joueurs actifs</div>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="text-4xl font-bold text-[var(--secondary)] mb-2">{about.stats.established}</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Année de création</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

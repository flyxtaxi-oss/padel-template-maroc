import clubConfig from '@/config/club.config';
import Image from 'next/image';

export default function Gallery() {
  const { gallery } = clubConfig;
  
  if (!gallery || gallery.length === 0) return null;

  return (
    <section id="gallery" className="py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold mb-6 text-[var(--primary)] dark:text-white">
            Galerie
          </h2>
          <div className="w-20 h-1 bg-[var(--accent)] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((imagePath, idx) => {
            // using a default placeholder for demo since we don't have actual images in public/
            const isPlaceholder = imagePath.startsWith('/gallery-');
            const demoUrl = `https://images.unsplash.com/photo-1622279457486-640c4343165d?q=80&w=600&auto=format&fit=crop&sig=${idx}`;
            
            return (
              <div 
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
              >
                {/* For real usage: src={imagePath} */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${isPlaceholder ? demoUrl : imagePath})` }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

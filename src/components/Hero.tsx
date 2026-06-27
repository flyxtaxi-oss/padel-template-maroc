import clubConfig from '@/config/club.config';

export default function Hero() {
  const { hero, name, tagline, enableArabic, ar, reservation } = clubConfig;
  const isRtl = enableArabic;
  
  const getReservationLink = () => {
    const { type, value } = reservation;
    if (type === 'whatsapp') {
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    } else if (type === 'phone') {
      return `tel:${value}`;
    }
    return value; // external link
  };

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <div 
          className="absolute inset-0 opacity-60 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1622279457486-640c4343165d?q=80&w=2070&auto=format&fit=crop')` }} // Placeholder image for template demo
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/90 via-[var(--primary)]/40 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center text-white mt-16">
        <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-lg">
          {name}
        </h1>
        <p className="text-xl md:text-2xl font-medium mb-8 max-w-2xl drop-shadow text-gray-200">
          {isRtl && ar ? ar.tagline : tagline}
        </p>
        <p className="text-lg mb-10 max-w-xl text-gray-300">
          {isRtl && ar ? ar.pitch : hero.pitch}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a 
            href={getReservationLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--primary)] font-bold px-8 py-4 rounded-full text-lg transition-transform transform hover:scale-105"
          >
            Réserver un terrain
          </a>
          <a 
            href="#about"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors"
          >
            Découvrir le club
          </a>
        </div>
      </div>
    </section>
  );
}

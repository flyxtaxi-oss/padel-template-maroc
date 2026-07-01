const brands = ['SIUX', 'ADIDAS', 'MONDO SUPERCOURT', 'WORLD PADEL TOUR', 'FIP', 'PADEL ELITE TANGER'];

// Bandeau « mur de marques » défilant — crédibilité + touche moderne.
export default function Marquee() {
  const items = [...brands, ...brands];
  return (
    <section className="border-b hair bg-cream py-8">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 marquee-mask">
        <div className="marquee-track">
          {items.map((b, i) => (
            <span key={i} className="mx-8 flex items-center gap-8 font-display text-lg font-semibold tracking-wide t-muted sm:text-xl">
              {b}
              <span className="h-1.5 w-1.5 rounded-full bg-gold/50" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

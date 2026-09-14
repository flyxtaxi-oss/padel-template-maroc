const brands = ['SIUX', 'ADIDAS', 'MONDO SUPERCOURT', 'WORLD PADEL TOUR', 'FIP', 'PADEL ELITE TANGER'];

// Bandeau « mur de marques » défilant — crédibilité + touche moderne.
//
// La séquence est dupliquée pour que la fin raccorde exactement au début
// (translation 0 → -50 %). Le second exemplaire est purement visuel : il est
// `aria-hidden`, sinon un lecteur d'écran énonce chaque marque deux fois.
export default function Marquee() {
  return (
    <section className="border-b hair bg-cream py-8" aria-label="Partenaires et équipementiers du club">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 marquee-mask">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 || undefined}>
              {brands.map((b, i) => (
                <span key={i} className="mx-8 flex items-center gap-8 font-display text-lg font-semibold tracking-wide t-muted sm:text-xl">
                  {b}
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/50" aria-hidden />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

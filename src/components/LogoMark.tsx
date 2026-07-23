// Marque « G » du Golden Padel Club : monogramme doré + balle de padel,
// dessiné en SVG (tracés, pas de police) pour rester net à toute taille et
// identique quel que soit le rendu de la police sur l'appareil du visiteur.
export default function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Golden Padel Club">
      <rect width="64" height="64" rx="14" fill="#0f2744" />
      <path
        d="M46 24.5c-2.6-5.4-7.8-8.8-14-8.8-9.2 0-16.2 7-16.2 16.3S22.8 48.3 32 48.3c8.4 0 14.6-5.6 15.4-13.6h-15v-5.4h20.2v3.1C52.6 44 44 53.7 32 53.7 19.6 53.7 10 44.1 10 32S19.6 10.3 32 10.3c8.4 0 15.6 4.5 19.2 11.4z"
        fill="#d4af37"
      />
    </svg>
  );
}

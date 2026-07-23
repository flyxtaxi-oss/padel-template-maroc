import type { Metadata } from 'next';

// Page QR : support interne à imprimer/afficher au club, pas une page publique.
export const metadata: Metadata = {
  title: 'QR avis',
  robots: { index: false, follow: false },
};

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

// Espace gérant : outil interne. Jamais indexé, jamais suivi par un crawler.
export const metadata: Metadata = {
  title: 'Espace gérant',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

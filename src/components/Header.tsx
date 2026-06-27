import clubConfig from '@/config/club.config';
import { Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const getReservationLink = () => {
    const { type, value } = clubConfig.reservation;
    if (type === 'whatsapp') {
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    } else if (type === 'phone') {
      return `tel:${value}`;
    }
    return value; // external link
  };

  const ctaLink = getReservationLink();
  const ctaIcon = clubConfig.reservation.type === 'whatsapp' ? <MessageCircle className="w-5 h-5 mr-2" /> : <Phone className="w-5 h-5 mr-2" />;

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Using a placeholder if logo is missing, or actual logo */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-bold text-xl">
            {clubConfig.name.charAt(0)}
          </div>
          <span className="font-heading font-bold text-xl hidden sm:block tracking-tight text-primary">
            {clubConfig.name}
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="#about" className="hover:text-primary transition-colors">À propos</Link>
          <Link href="#courts" className="hover:text-primary transition-colors">Terrains & Tarifs</Link>
          <Link href="#gallery" className="hover:text-primary transition-colors">Galerie</Link>
          <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        <a 
          href={ctaLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center bg-[var(--primary)] text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity text-sm shadow-md"
        >
          {clubConfig.reservation.type !== 'external' && ctaIcon}
          Réserver
        </a>
      </div>
    </header>
  );
}

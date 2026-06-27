import clubConfig from '@/config/club.config';
import { Instagram, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { name, contact } = clubConfig;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 border-b border-gray-800 pb-8">
          <div className="text-center md:text-left">
            <h2 className="font-heading text-2xl font-bold text-white mb-2">{name}</h2>
            <p className="text-gray-400 max-w-sm">{contact.address}</p>
          </div>
          
          <div className="flex gap-4">
            <a 
              href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gray-800 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a 
              href={`tel:${contact.phone}`}
              className="w-12 h-12 rounded-full bg-gray-800 hover:bg-[var(--primary)] text-white flex items-center justify-center transition-colors"
              aria-label="Téléphone"
            >
              <Phone className="w-5 h-5" />
            </a>
            <a 
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gray-800 hover:bg-[#E1306C] text-white flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {currentYear} {name}. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

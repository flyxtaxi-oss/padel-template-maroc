"use client";

import QRCode from "react-qr-code";
import clubConfig from '@/config/club.config';
import { useEffect, useState } from 'react';

export default function QRCodePage() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Generate the absolute URL to /avis dynamically
    setUrl(`${window.location.origin}/avis`);
  }, []);

  if (!url) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 print:p-0">
      <div className="text-center max-w-lg mx-auto">
        {clubConfig.logoPath && (
          <img 
            src={clubConfig.logoPath} 
            alt={clubConfig.name} 
            className="h-24 mx-auto mb-8 print:mb-12"
          />
        )}
        
        <h1 className="text-4xl font-bold mb-4 text-[var(--primary)] print:text-black">
          Votre avis compte !
        </h1>
        <p className="text-xl text-gray-600 mb-12 print:text-black">
          Scannez ce QR code avec votre téléphone pour nous laisser un avis sur Google. Merci pour votre soutien !
        </p>

        <div className="bg-white p-8 rounded-3xl shadow-xl inline-block print:shadow-none border border-gray-100 print:border-none">
          <QRCode 
            value={url} 
            size={256}
            level="H"
            fgColor={clubConfig.brandColors.primary}
          />
        </div>

        <button 
          onClick={() => window.print()}
          className="mt-12 px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-full print:hidden"
        >
          Imprimer le QR Code
        </button>
      </div>
    </div>
  );
}

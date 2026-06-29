import { NextResponse } from 'next/server';
import clubConfig from '@/config/club.config';

export async function GET() {
  const defaultLocale = clubConfig.defaultLocale;
  
  const content = `
# ${clubConfig.name}

## About
${clubConfig.about.text[defaultLocale]}

## Location and Contact
Address: ${clubConfig.contact.address}
Phone: ${clubConfig.contact.phone}
WhatsApp: ${clubConfig.contact.whatsapp}
Instagram: ${clubConfig.contact.instagram}
Map: ${clubConfig.contact.googleMapsEmbedUrl ? 'Available' : 'Not available'}

## Opening Hours
${Object.entries(clubConfig.openingHours).map(([days, hours]) => `- ${days}: ${hours}`).join('\n')}

## Facilities
Total Courts: ${clubConfig.courts.length}
${clubConfig.courts.map(c => `- Court ${c.id}: ${c.type} (${c.surface})`).join('\n')}

## Pricing
${clubConfig.pricing.map(p => `- ${p.label[defaultLocale]}: ${p.price} MAD (${p.duration})`).join('\n')}

## How to Book
Booking Mode: ${clubConfig.bookingMode}
Reservation Contact/Link: ${clubConfig.reservation.value}
To book, please use the provided contact information or link.

## Supported Languages
${clubConfig.locales.join(', ').toUpperCase()}

## Frequently Asked Questions
${clubConfig.faq ? clubConfig.faq.map(f => `Q: ${f.question[defaultLocale]}\nA: ${f.answer[defaultLocale]}`).join('\n\n') : 'No FAQs available.'}

## Upcoming Tournaments & Events
${clubConfig.events && clubConfig.events.length > 0 
    ? clubConfig.events.map(e => `- ${e.title[defaultLocale]} (${e.format}) on ${e.date.split('T')[0]}. Prize: ${e.prizeMAD} MAD`).join('\n') 
    : 'No upcoming events.'}
`.trim();

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

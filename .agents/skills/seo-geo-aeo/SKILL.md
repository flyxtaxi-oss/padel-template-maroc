---
name: seo-geo-aeo
description: Generates localized SEO, GEO, and AEO assets (metadata, FAQs, JSON-LD, GBP, and directories) for a given padel club configuration.
---

# SEO, GEO & AEO Generator for Padel Clubs

This skill generates a complete set of SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization) assets for a padel club based on its Next.js config file.

## Input
A club configuration object (e.g. `src/config/club.config.ts`).

## Instructions
1. Read the provided club config object to extract: Name, location/address, phone, hours, courts, pricing, and description.
2. Check for NAP (Name, Address, Phone) inconsistencies within the input. If the input has conflicting variants, note them clearly at the beginning of your output.
3. Generate the following artifacts and write them to a new directory `/seo-output/<slug>/`:
   - `meta.md`: Localized (FR/AR/ES) meta titles (<= 60 chars) and meta descriptions (<= 155 chars).
   - `faq.md`: 8-12 FAQ Q&A pairs per locale (FR/AR/ES). They must be answer-first, concise, and tuned for voice/AEO queries like "réserver padel <ville>", "padel <ville> tarif".
   - `llms.txt`: Factual club summary for LLM crawlers containing the name, what it is, location, courts, hours, price, how to book, contact, and languages.
   - `json-ld.json`: Ready-to-paste JSON-LD blocks for `SportsActivityLocation` and `FAQPage`.
   - `gbp.md`: A Google Business Profile pack containing:
     - An optimized business description (max 750 chars).
     - 5 attributes to enable (e.g., "Terrain couvert", "Parking gratuit").
     - 3 ready-to-post GBP updates in FR.
   - `directories.md`: A directory-submission checklist detailing exact sites to list the club on (padellands.com, padellog.com, clubs.ma, actu-padel.com, padel.co.ma, Google Business Profile, Apple Maps). Include the exact, machine-readable NAP block to copy-paste everywhere.

Keep outputs deterministic and strictly copy-paste ready. Do not include conversational fluff.

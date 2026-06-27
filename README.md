# Template Padel Club Maroc

Ce template Next.js a été conçu spécifiquement pour créer rapidement des sites vitrines pour des clubs de padel au Maroc. Il est **entièrement piloté par la configuration**, ce qui signifie que vous n'avez pas besoin de toucher au code pour lancer un nouveau site.

## Stack Technique
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

## Comment lancer un nouveau club ?

1. **Dupliquer la configuration**
   Ouvrez le fichier `src/config/club.config.ts`. Modifiez les informations avec celles de votre club (nom, couleurs, tarifs, terrains, etc.).

   *(Exemple alternatif fourni dans `src/config/sample2.config.ts`)*

2. **Ajouter les assets (images)**
   Ajoutez vos images dans le dossier `public/`.
   Par défaut, la configuration attend :
   - Un logo
   - Une image "Hero" (`/hero.jpg`)
   - Des images pour la galerie (`/gallery-1.jpg`, etc.)
   Vous pouvez organiser ces images dans un sous-dossier `public/clubs/<nom-du-club>/` et mettre à jour les chemins dans votre fichier de configuration.

3. **Déployer**
   Le projet est prêt à être déployé sur **Vercel** sans aucune configuration supplémentaire.
   ```bash
   npm run build
   ```

## Fonctionnalités incluses

- **Design Premium & Responsive** : Optimisé pour le mobile (plus de 80% du trafic).
- **SEO & Google Business Profile** : Balises OpenGraph, JSON-LD LocalBusiness pré-configuré, sitemap automatique.
- **Support Multi-langue** : Mode "RTL" (Right-to-Left) intégré pour l'arabe en activant `enableArabic: true` dans la configuration.
- **Conversion** : Appels à l'action directement connectés vers WhatsApp, téléphone ou une plateforme de réservation externe (Playtomic, Sportym).

## Scripts disponibles

```bash
npm run dev     # Lancer en environnement de développement
npm run build   # Créer le build de production
npm start       # Lancer le serveur de production
npm run lint    # Vérifier le code
```

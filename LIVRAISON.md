# Mise en ligne — Golden Padel Club

Procédure à suivre **avant** de livrer le site au club. Tant que l'étape 1
n'est pas faite, les demandes de réservation n'arrivent au gérant que par
WhatsApp et le tableau de bord affiche un bandeau rouge.

---

## 1. Réservations synchronisées (le point critique)

Sans ces variables, le tableau de bord ne montre que les réservations faites
depuis le navigateur du gérant. Les demandes envoyées par les clients depuis
leur téléphone **n'y apparaissent jamais**.

### a. Créer le projet Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) → nouveau projet.
2. **Firestore Database** → Créer une base → mode production → région `europe-west`.
3. Onglet **Règles** → coller le contenu de [`firestore.rules`](firestore.rules) → **Publier**.
   Ces règles autorisent le site à créer une demande, et interdisent à quiconque
   de lire les numéros de téléphone depuis un navigateur.

### b. Variables d'environnement Vercel
`Settings → Environment Variables`, pour l'environnement **Production** :

| Variable | Où la trouver | Rôle |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase → Paramètres → Vos applications → Config Web | écriture des demandes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | idem | idem |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | idem | idem |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | idem | idem |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | idem | idem |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | idem | idem |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase → Paramètres → **Comptes de service** → Générer une clé privée | lecture serveur (tableau de bord) |
| `ADMIN_CODE` | à choisir | code gérant, vérifié **côté serveur** |
| `NEXT_PUBLIC_ADMIN_CODE` | **la même valeur** que `ADMIN_CODE` | pré-contrôle côté navigateur |

> `FIREBASE_SERVICE_ACCOUNT` : coller le JSON **entier, sur une seule ligne**.
> C'est l'erreur la plus fréquente. En cas de problème, le tableau de bord
> affiche la cause exacte (JSON invalide, champ manquant…) dans son bandeau.

> `ADMIN_CODE` et `NEXT_PUBLIC_ADMIN_CODE` doivent être **identiques**. Le
> serveur fait autorité ; le code public n'est qu'un pré-filtre et reste
> lisible dans le JavaScript — ce n'est pas un secret.

### c. Vérifier
Après redéploiement, ouvrir `/fr/admin` :
- ✅ « **Synchronisé** — les demandes de tous les appareils apparaissent ici. »
- ❌ Bandeau rouge « Mode local » → lire la cause affichée, corriger, redéployer.

Test réel : réserver depuis un téléphone en 4G, la demande doit apparaître
dans le tableau de bord sur un autre appareil.

En mode synchronisé, tout ce qui relève de la démonstration disparaît du
tableau de bord : badge « Aperçu démo », bouton « Données de démo », KPI
visiteurs/conversion et scores « présence web » (chiffres illustratifs). Le
graphique passe aux réservations réelles par jour. Le gérant ne voit que des
données vraies.

---

## 2. Avis Google

`googlePlaceId` est **vide** dans [`src/config/club.config.ts`](src/config/club.config.ts).
Conséquence : le QR code affiché au club et le bouton « Laisser un avis »
renvoient vers une *recherche* Google Maps au lieu du formulaire 5 étoiles.

Récupérer l'identifiant sur
[developers.google.com/maps/documentation/places/web-service/place-id](https://developers.google.com/maps/documentation/places/web-service/place-id)
puis le renseigner dans `googlePlaceId`.

---

## 3. Mentions légales

[`src/app/[locale]/mentions-legales/page.tsx`](src/app/[locale]/mentions-legales/page.tsx)
contient trois champs `[à compléter par le gérant]` : raison sociale et forme
juridique, n° RC (Tanger) et ICE, nom du directeur de la publication.
Obligation légale au Maroc.

---

## 4. Photos

Les visuels de `public/clubs/golden/` font 640 px de large (sauf `5.jpg`).
Ils sont affichés jusqu'à ~1300 px sur écran retina, donc visiblement flous.
Demander les originaux au club : c'est le premier levier de qualité perçue.

---

## Playtomic et les autres plateformes

Playtomic est présent au Maroc et référence des clubs à Tanger (par ex. Padel
TMCT). **Golden Padel Club n'y figure pas** à ce jour. Playtomic n'ouvre pas
d'API de réservation aux sites tiers : l'intégration possible est un lien
profond vers la page du club, pas une synchronisation.

Deux stratégies, au choix du club :

| Stratégie | Quand | Réglage |
|---|---|---|
| **Site + WhatsApp + tableau de bord** (actuel) | le club gère lui-même ses créneaux, veut garder ses clients et zéro commission | `bookingMode: 'firebase'` |
| **Déléguer à Playtomic** | le club veut la visibilité de l'app, le paiement en ligne et le matchmaking, et accepte la commission | `bookingMode: 'external'` + `reservation.value` = URL Playtomic du club |

Les deux peuvent coexister : garder le formulaire du site pour les clients
directs et ajouter le lien Playtomic pour les joueurs de passage.

## Comment arrivent les réservations

```
Client remplit le formulaire
   │
   ├─→ Firestore (si configuré) ──→ /api/admin/bookings ──→ Tableau de bord
   │                                  (clé de service, serveur uniquement)
   │
   └─→ Bouton WhatsApp pré-rempli ──→ téléphone du club   ← toujours actif

Tableau de bord : chaque demande est « En attente », « Confirmée » ou
« Refusée ». Confirmer ou Refuser = un clic, qui enregistre le statut et ouvre
WhatsApp vers le client avec la réponse rédigée dans SA langue (FR/EN/ES/AR).
```

Le bouton WhatsApp est le filet de sécurité : il fonctionne sans aucune
infrastructure. Tant que Firebase n'est pas configuré, c'est le **seul** canal,
et l'écran de confirmation le dit explicitement au client au lieu de prétendre
que sa demande est partie.

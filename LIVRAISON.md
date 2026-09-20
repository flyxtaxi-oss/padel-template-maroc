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
2. **Firestore Database** → Créer une base → mode production → région
   **`europe-west9` (Paris)**. Les fonctions Vercel du site tournent aussi à
   Paris (`cdg1`, voir `vercel.json`) : base et serveur au même endroit, au plus
   près de Tanger. Une base aux États-Unis ajouterait un aller-retour
   transatlantique à chaque réservation et à chaque rafraîchissement du tableau
   de bord.
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
visiteurs et conversion (chiffres illustratifs). Le graphique passe aux
réservations réelles par jour. Le gérant ne voit que des données vraies.

**Ce qui reste, et qui constitue l'outil au quotidien**, calculé sur les vraies
réservations et identique en démonstration comme en production :

| Bloc | Ce qu'il répond |
|---|---|
| **Planning des terrains** | Qui joue, sur quel terrain, à quelle heure — aujourd'hui, demain, après-demain. Les demandes non confirmées apparaissent en pointillés or : c'est ce qu'il reste à rappeler. |
| **Remplissage (7 jours à venir)** | Quelle part des créneaux est vendue, et donc ce qu'il reste à vendre. |
| **Revenus du mois** | Créneaux réservés × tarif. |
| **Clients** | Nombre de clients uniques et d'habitués (identifiés par numéro), avec WhatsApp en un clic. |
| **Heures de pointe** | Les créneaux les plus demandés — sur quoi ajuster les tarifs et les horaires de personnel. |
| **Export** | Toutes les réservations en `.csv`, ouvrable dans Excel. |
| **Visibilité web** | Quatre liens cliquables vers ce que Google et les IA lisent réellement (`sitemap.xml`, `llms.txt`, `robots.txt`, langues). |

> Les scores « /100 » de présence web ont été retirés : ils étaient inventés.
> Un gérant ne doit pas prendre de décision sur un chiffre que personne ne
> mesure — les liens, eux, se vérifient d'un clic.

---

## 2. Audience du site (1 clic, gratuit)

Le site envoie déjà ses statistiques de fréquentation à **Vercel Analytics**
(sans cookie, sans bannière de consentement). Il reste à l'activer une fois :

> Vercel → le projet → onglet **Analytics** → **Enable**.

Sans cette activation, aucune donnée n'est collectée et le club n'a **aucun**
chiffre de fréquentation réel — le KPI « visiteurs » du tableau de bord n'est
qu'une démonstration et disparaît en production. Les chiffres se consultent
dans Vercel, pas dans l'espace gérant.

---

## 3. Avis Google

### Comment fonctionne la page `/avis` (QR code du club)

Le client scanne le QR, donne une note de 1 à 5, puis — **quelle que soit la
note** — se voit proposer deux choses au même endroit :

1. **Publier son avis sur Google** (bouton principal, redirection automatique
   après 3 secondes) ;
2. **Écrire au club en privé** (lien juste en dessous), qui arrête la
   redirection et ouvre un formulaire. Ce retour arrive dans l'onglet
   « Retours clients » du tableau de bord, et le client se voit quand même
   proposer de publier sur Google à la fin.

> ⚠️ **Ne pas revenir à un filtrage par note.** Une version précédente
> n'envoyait vers Google que les 4 et 5 étoiles. Cette pratique s'appelle
> « review gating » et Google l'interdit explicitement. Sanctions constatées :
> suppression de **tous** les avis de l'établissement, perte de classement,
> suspension de la fiche — détection automatisée, 292 millions d'avis
> supprimés en 2025. Pour un club dont la visibilité locale repose entièrement
> sur sa fiche Google, le risque est disproportionné par rapport au gain.
> Le vrai levier de conversion est conservé : demander au bon moment, en un
> scan, avec un lien qui ouvre directement le formulaire de notation.

### Lien direct vers le formulaire

`googlePlaceId` est **vide** dans [`src/config/club.config.ts`](src/config/club.config.ts).
Conséquence : le QR code affiché au club et le bouton « Laisser un avis »
renvoient vers une *recherche* Google Maps au lieu du formulaire 5 étoiles.

Récupérer l'identifiant sur
[developers.google.com/maps/documentation/places/web-service/place-id](https://developers.google.com/maps/documentation/places/web-service/place-id)
puis le renseigner dans `googlePlaceId`.

---

## 4. Mentions légales

[`src/app/[locale]/mentions-legales/page.tsx`](src/app/[locale]/mentions-legales/page.tsx)
contient trois champs `[à compléter par le gérant]` : raison sociale et forme
juridique, n° RC (Tanger) et ICE, nom du directeur de la publication.
Obligation légale au Maroc.

---

## 5. Fiche Google : données à recaler

Relevé sur la fiche Google réelle du club (septembre 2026), à confronter avec
[`club.config.ts`](src/config/club.config.ts) :

| Donnée | Le site affiche | La fiche Google affiche |
|---|---|---|
| Nombre d'avis | 18 | **27** |
| Horaires | 09:00 – 00:00 | **07:00 – 00:00** |

Des horaires qui se contredisent entre le site et la fiche Google nuisent au
référencement local (Google compare les deux) et font perdre des réservations
matinales. À faire confirmer par le gérant, puis corriger dans la config —
`openingHours` alimente aussi les créneaux de réservation, le balisage
schema.org et `/llms.txt`.

---

## 6. Photos

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

## Réservation instantanée (s'active toute seule avec Firebase)

Dès que l'étape 1 est faite (variables Firebase + `FIREBASE_SERVICE_ACCOUNT`),
le formulaire passe automatiquement en **réservation instantanée** :

- les créneaux affichent « N terrains libres » / « Complet » en direct
  (rafraîchi toutes les 30 s) ;
- le client obtient un **terrain attribué et confirmé** immédiatement, sans
  attendre le gérant ;
- deux clients qui cliquent au même instant sur le dernier terrain ne peuvent
  pas l'obtenir tous les deux : l'attribution se fait dans une transaction
  Firestore (collection `slot_ledger`, sans aucune donnée personnelle) ;
- dans le tableau de bord, refuser une réservation instantanée **libère son
  terrain** ; la remettre en attente le reprend s'il est encore libre.

Rien à ajouter dans `firestore.rules` : `slot_ledger` n'est lu et écrit que par
le serveur, et la règle « tout le reste est fermé » l'interdit aux navigateurs.
Protections côté serveur : validation stricte, champ anti-robot, limite de
6 tentatives / 10 min par IP.

Sans Firebase, rien ne change : parcours « demande + WhatsApp ».

## Vidéos Instagram

La section Instagram affiche un bandeau « Suivre le club ». Pour y intégrer
des reels, coller leurs liens dans `instagramReels` de
[`src/config/club.config.ts`](src/config/club.config.ts) (lecteur officiel
Instagram, aucun fichier téléchargé).

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

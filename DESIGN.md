# DESIGN.md — Golden Padel Club

Identité visuelle du site. **Toute modification UI doit respecter ce document.**
Objectif : premium, chaleureux, éditorial — *jamais* le style « dark SaaS générique / IA ».

## Principe directeur
Fond **clair et chaleureux** dominant. Le **sombre est une ponctuation**, pas la norme.
Couleurs tirées du **vrai club** : terrains bleus + marque « Golden » (or) + ambiance chaude.

## Palette
| Rôle | Hex | Usage |
|------|-----|-------|
| Ivoire (canvas clair) | `#f4efe4` | fond principal des sections |
| Crème (carte/section alt.) | `#fbf8f1` | sections alternées, cartes |
| Encre (texte sur clair) | `#1e1b14` | titres/corps sur fond clair |
| **Bleu terrain (signature)** | `#0d2c4f` | hero, bande Avis, footer, tarif vedette |
| Bleu terrain profond | `#08213c` | footer, aplats les plus sombres |
| **Or antique (accent)** | `#b98a2e` | boutons, chiffres, filets, mot accent |
| Or clair (sur sombre) | `#d9b25a` | accents sur fond bleu |

> Le bleu = couleur réelle des terrains du club (pas de vert). L'or = « Golden ».

## Typographie
- **Titres** : `Fraunces` (serif éditorial), poids 600, souvent avec un mot en *italique or*.
- **Corps / UI** : `Inter`.
- **Chiffres / prix / stats** : `JetBrains Mono`.
- Eyebrow : Inter, 0.72rem, uppercase, letter-spacing 0.22em, couleur or.

## Rythme des sections (alternance obligatoire)
Hero **bleu** → À propos crème → Terrains ivoire → Réservation crème → **Académie bleu** →
Instagram crème → Galerie ivoire →
Tournois crème → FAQ ivoire → **Avis bleu** → Contact crème → **Footer bleu foncé**.

> ⚠️ Deux sections de cette liste sont **conditionnelles** : Tournois disparaît si
> `events` est vide, Avis disparaît si `googleRating` et `googleReviews` le sont.
> Quand l'une saute, ses voisines se retrouvent avec le même fond et fusionnent.
> État actuel (`events: []`) : la FAQ est passée en **crème** pour ne pas coller
> à la Galerie. En réactivant les tournois, repasser la FAQ en `bg-sand` et
> donner `bg-cream` aux tournois.

## Système technique (globals.css)
- Tokens contextuels `--fg`, `--fg-soft`, `--fg-muted`, `--card-bg`, `--card-brd`, `--hair`, `--gold-ctx`.
- Ils **basculent automatiquement** sur fond sombre via la classe `.panel-court`.
- Helpers : `.t-title` `.t-soft` `.t-muted` `.t-gold` `.hair` `.card` `.card-lift` `.btn-gold` `.btn-outline` `.eyebrow` `.divider` `.court-lines`.

> ⚠️ La police mono s'expose sous `--font-jetbrains-mono` (et **pas** `--font-mono`,
> qui est le token de thème). Les nommer pareil crée une référence circulaire qui
> invalide la variable : tous les `.font-mono` retombent silencieusement sur Inter.

### Élévation
| Classe | Usage |
|--------|-------|
| `.card-lift` | cartes, panneaux, tarifs — élévation par défaut |
| `.card-lift-lg` | média du hero, panneau vedette — élévation maximale |

Six ombres de rayons croissants (teintées encre, jamais noir pur). **Une seule
force par composant** : ne pas empiler `.card-lift` et `.card-lift-lg`, ni les
mélanger avec les `shadow-*` de Tailwind.

### Détails éditoriaux
| Classe | Usage |
|--------|-------|
| `.pblur` (+ 3 `<div>` vides) | flou progressif en bas d'un média — remplace un dégradé opaque |
| `.edge-gold` | bord dégradé doré sur fond bleu — **un seul élément à la fois** (le tarif vedette) |
| `.num-marker` | repère `01`, `02`… en mono, faible contraste, coin de carte |

### Mouvement
- `[data-reveal]` : le bloc monte et apparaît à l'entrée dans le viewport.
- `<WordReveal>` : titre révélé **mot à mot** (y 20px → 0, 0.8 s,
  `cubic-bezier(0.16, 1, 0.3, 1)`, décalage 0.07 s/mot, une seule fois).
  Réservé aux titres courts. **Ne jamais imbriquer** un `<WordReveal>` dans un
  `[data-reveal]` : les deux translations se cumulent et le texte part de trop loin.
  Sur une page RTL, un titre en écriture latine (nom de marque) doit recevoir
  `dir="ltr"`, sinon les mots s'inversent.
- Les deux sont déclenchés par le même IntersectionObserver (`<ScrollReveal />`).
- La barre de progression utilise `animation-timeline: scroll()` quand le
  navigateur le supporte, sinon un repli `requestAnimationFrame`. On anime
  `transform`, **jamais** `width` (qui relayoute à chaque frame).

## À NE JAMAIS refaire (anti-patterns v1)
- ❌ Fond noir/quasi-noir généralisé, tout sombre.
- ❌ Glassmorphism, halos flottants (`glow-orb`), blobs animés, grille de fond partout.
- ❌ Texte `MAJUSCULE gras ultra-espacé` en 9–10px.
- ❌ Emojis en guise d'icônes (utiliser lucide-react ; `Instagram` n'existe pas dans la version installée → SVG inline).
- ❌ Dégradés dorés sur chaque titre, casse « IA générique ».
- ❌ `<img>` brut : toutes les photos passent par `next/image` (AVIF/WebP + `sizes`).
  La photo du hero porte `priority` — c'est l'élément LCP.

## Invariants produit
- Garder les 8 photos `public/clubs/golden/*.jpg`.
- Système de réservation **inchangé** : Firestore `booking_requests` + redirection WhatsApp.
- Multilingue FR / AR (RTL) / ES via `src/i18n/dictionaries.ts` ; contenu piloté par `src/config/club.config.ts`.

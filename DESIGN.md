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
Hero **bleu** → À propos crème → Terrains ivoire → Réservation crème → Galerie ivoire →
Tournois crème → FAQ ivoire → **Avis bleu** → Contact crème → **Footer bleu foncé**.

## Système technique (globals.css)
- Tokens contextuels `--fg`, `--fg-soft`, `--fg-muted`, `--card-bg`, `--card-brd`, `--hair`, `--gold-ctx`.
- Ils **basculent automatiquement** sur fond sombre via la classe `.panel-court`.
- Helpers : `.t-title` `.t-soft` `.t-muted` `.t-gold` `.hair` `.card` `.card-lift` `.btn-gold` `.btn-outline` `.eyebrow` `.divider` `.court-lines`.

## À NE JAMAIS refaire (anti-patterns v1)
- ❌ Fond noir/quasi-noir généralisé, tout sombre.
- ❌ Glassmorphism, halos flottants (`glow-orb`), blobs animés, grille de fond partout.
- ❌ Texte `MAJUSCULE gras ultra-espacé` en 9–10px.
- ❌ Emojis en guise d'icônes (utiliser lucide-react ; `Instagram` n'existe pas dans la version installée → SVG inline).
- ❌ Dégradés dorés sur chaque titre, casse « IA générique ».

## Invariants produit
- Garder les 8 photos `public/clubs/golden/*.jpg`.
- Système de réservation **inchangé** : Firestore `booking_requests` + redirection WhatsApp.
- Multilingue FR / AR (RTL) / ES via `src/i18n/dictionaries.ts` ; contenu piloté par `src/config/club.config.ts`.

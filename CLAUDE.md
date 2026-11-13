# Guitar Memory Sheets — règles du projet

Vision produit : `docs/VISION.md` (à lire avant toute décision produit).

## Gel des nouveautés (décision de Lucas, 13/11/2026)
- **Plus aucune nouvelle fonction** tant que le cœur n'est pas validé par Lucas. Le cœur : **créer une fiche, puis la jouer** (accueil, création, fiche, mode jeu).
- Le travail autorisé : polir ce parcours d'après ses retours en conditions réelles, cohérence visuelle, corrections de bugs.
- Navigation principale : Fiches · Accordeur · Créer · S'entraîner · Plus. Les écrans pas au niveau (Un morceau/Atelier, Tutos, Importer, Sites utiles) sont rangés dans « Plus », section « bêta » : ne pas les remettre en avant ni les supprimer sans son accord.
- Une demande de nouveauté pendant le gel : la noter, rappeler le gel, et laisser Lucas trancher.

## Le code
- App web en **un seul fichier** : `index.html` (HTML + CSS + JS vanilla, sans dépendance ni build). C'est la **source de vérité**.
- `a supprimer/` : fichiers obsolètes en attente de suppression (validée par Lucas en fin de projet). Ne pas les modifier ni les synchroniser.
- Le fichier fait ~9 000 lignes : **ne jamais le lire en entier**. Repérer avec `grep -n` les sections (`/* ═══════ NOM ═══════ */`), puis lire par plages.
- Fin de fichier : bloc `SAMPLES GUITARE` (~570 Ko de base64 sur quelques lignes très longues) : ne jamais l’afficher ; utiliser `grep -n ... | cut -c1-200` ou exclure ce bloc.
- Données : IndexedDB (`gms_v2` : stores `sheets`, `media`, `meta`) + quelques préférences en localStorage.
- **Identité visuelle (thème unique, plus de jour/nuit)** : fond « bureau en bois sombre » (jetons de `:root`) et contenu en « fiches papier ivoire ». Tout élément listé dans la règle `:is(…)` juste après `:root` reçoit les jetons papier (`--card`, `--cream`… redéfinis) : pour qu'un nouveau bloc soit une fiche, l'ajouter à cette liste ; sinon il reste sombre. Ne jamais coder de couleur en dur : utiliser les jetons. Couche de finition : bloc `IDENTITÉ VISUELLE` en fin de `<style>`. Police d'affichage : Fraunces ; interface : Manrope.
- Interface **en français, avec accents** (les vieux textes sans accents sont à corriger au passage).

## Vérifier avant de livrer
- Tester dans Chromium avec Playwright (`require('playwright')`, déjà installé ; scripts dans le scratchpad, jamais dans le dépôt) : 0 erreur console, captures desktop 1200px + mobile 390px, pas de scroll horizontal.
- Ne jamais committer de captures ou de scripts de test.

## Git
- Travailler sur la branche `claude/relaxed-hawking-5olqsb` ; ne pas toucher `main` sans accord de Lucas.
- Commits clairs, en anglais.

## L'équipe (sous-agents dans `.claude/agents/`)
Claude principal = bras droit de Lucas : il découpe, délègue, vérifie et rend compte.
| Agent | Rôle | Statut |
|---|---|---|
| `dev` | Code, architecture, perf, bugs | **actif** |
| `design-ergo` | UI, ergonomie, mobile/tablette | **actif** |
| `musicien` | Justesse musicale, contenu d'entraînement | **actif** |
| `testeur` | Tests + regard de débutant guitare | en réserve |
| `marketing` | Positionnement, stores, communication | en réserve |
| `motion` | Animations, transitions, vidéos de démo | en réserve |

**Validation de Lucas** : pour toute tâche longue (gros changement d'écran, refonte, nouveau parcours), présenter d'abord le plan court et/ou une maquette, et attendre son accord avant de lancer le code. Rien n'est committé sans vérification ; un rendu qui ne lui plaît pas est annulé.

Règles d'économie : briefs courts et précis ; chaque agent rend un **rapport court** (pas de copie de code ni de fichier) ; ne lancer que les agents utiles à la tâche.

# Guitar Memory Sheets — règles du projet

Vision produit : `docs/VISION.md` (à lire avant toute décision produit).

## Le code
- App web en **un seul fichier** : `index.html` (HTML + CSS + JS vanilla, sans dépendance ni build). C'est la **source de vérité**.
- `a supprimer/` : fichiers obsolètes en attente de suppression (validée par Lucas en fin de projet). Ne pas les modifier ni les synchroniser.
- Le fichier fait ~4 800 lignes : **ne jamais le lire en entier**. Repérer avec `grep -n` les sections (`/* ═══════ NOM ═══════ */`), puis lire par plages.
- Fin de fichier : bloc `SAMPLES GUITARE` (~570 Ko de base64 sur quelques lignes très longues) : ne jamais l’afficher ; utiliser `grep -n ... | cut -c1-200` ou exclure ce bloc.
- Données : IndexedDB (`gms_v2` : stores `sheets`, `media`, `meta`) + quelques préférences en localStorage.
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

Règles d'économie : briefs courts et précis ; chaque agent rend un **rapport court** (pas de copie de code ni de fichier) ; ne lancer que les agents utiles à la tâche.

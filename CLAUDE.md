# Guitar Memory Sheets — règles du projet

Vision produit : `docs/VISION.md` (à lire avant toute décision produit).

## Gel des nouveautés (décision de Lucas, 13/11/2026)
- **Plus aucune nouvelle fonction** tant que le cœur n'est pas validé par Lucas. Le cœur : **créer une fiche, puis la jouer** (accueil, création, fiche, mode jeu).
- Le travail autorisé : polir ce parcours d'après ses retours en conditions réelles, cohérence visuelle, corrections de bugs.
- Navigation principale (16/11/2026) : Fiches · Tutos · Créer · S'entraîner · Plus. « Tutos » ouvre l'écran « titre → tutos → fiche » (vue `atelier`) : c'est la force de l'app selon Lucas (chercher un tuto et créer la fiche en même temps). L'accordeur, les accords et le métronome sont dans « Plus ». Les écrans pas au niveau (Recherche de tutos, Importer, Sites utiles) restent dans « Plus », section « bêta » : ne pas les remettre en avant ni les supprimer sans son accord.
- Une demande de nouveauté pendant le gel : la noter, rappeler le gel, et laisser Lucas trancher.

## Le code
- App web en **un seul fichier** : `index.html` (HTML + CSS + JS vanilla, sans dépendance ni build). C'est la **source de vérité**.
- `a supprimer/` : fichiers obsolètes en attente de suppression (validée par Lucas en fin de projet). Ne pas les modifier ni les synchroniser.
- Le fichier fait ~9 000 lignes : **ne jamais le lire en entier**. Repérer avec `grep -n` les sections (`/* ═══════ NOM ═══════ */`), puis lire par plages.
- Fin de fichier : bloc `SAMPLES GUITARE` (~570 Ko de base64 sur quelques lignes très longues) : ne jamais l’afficher ; utiliser `grep -n ... | cut -c1-200` ou exclure ce bloc.
- Données : IndexedDB (`gms_v2` : stores `sheets`, `media`, `meta`) + quelques préférences en localStorage.
- **Identité visuelle « Studio » (validée par Lucas le 16/11/2026, thème unique)** : fond sombre neutre, surfaces à peine relevées, **un seul accent orange** (`--gold`), une seule police (Inter, `--sans` ; `--serif` et `--mono` pointent dessus). Pas de dégradés, pas de textures, pas de bande colorée sur les cartes, pas d'emoji décoratif dans les nouveaux écrans. Jetons dans `:root` ; la règle `:is(…)` juste après redéfinit les jetons pour ce qui est posé comme une surface. Ne jamais coder de couleur en dur : utiliser les jetons. Couche de finition : bloc `STUDIO — couche finale` en fin de `<style>` (barres, liste des fiches, fiche, PC). PC : menu à gauche (≥ 900 px), liste + fiche côte à côte (≥ 1200 px). L'impression reste sur papier blanc (bloc `PRINT`).
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

## Décisions de Lucas du 16/11/2026 (validées sur maquettes, pas encore codées)
Maquettes de référence : scratchpad `m2/` (peuvent avoir disparu ; les points ci-dessous suffisent).
1. **(FAIT le 16/11)** **Fiche = piste 3 « une carte par partie »** : accords puis rythme dans la même carte, un seul ▶ sur le rythme (ma prise si elle existe, sinon la guitare de l'app). Plus de barre du bas Jouer / BPM / Enregistrer. Chaque carte a un **bouton discret « modifier »** (changer les accords, enregistrer un rythme), **distinct** de ce qui complète le coffre (mes audios/vidéos, tutos = « Perso », en bas).
2. **(FAIT en grande partie le 16/11 ; reste : « Choisir un tuto » dans la fiche, enregistreur « coups qui tombent », éditeur de rythme à la main encore à l’ancien dessin)** **Création** : maquette validée. À ajuster : titre + artiste prennent trop de place (les compacter, une ligne) ; le bouton « Enregistrer mon rythme » garde sa place et son rôle mais doit avoir un **dessin moins générique** (proposer 2-3 variantes). Une seule partie sans nom, capo/tempo pour tout le morceau, « saisir à la main » et « arpège » en options, enregistreur « coups qui tombent » puis flèches corrigibles au toucher.
3. **(1re passe faite le 16/11 : sans emoji, titres clairs ; la mise en liste complète reste à faire)** **S'entraîner** : maquette validée (sans emoji). Ajouter les **suites d'accords** au même niveau que les rythmes (le contenu existe déjà : juste les lister).
4. **(FAIT le 16/11 ; l’onglet Tutos reste en place tant que « Découvrir » n’existe pas)** **Le « + »** propose deux choix : **fiche seule** ou **fiche avec tuto** (vidéo en haut, fiche dessous). L'écran Tutos seul retourne dans « Plus » et disparaîtra si « création + tuto » convient.
5. **Onglet « Tutos » remplacé par « Découvrir »** (nom à confirmer), et Lucas veut que ce soit **l'accueil de l'app** : du contenu tout fait (musiques populaires, fiches prêtes, tutos, communauté), avec les codes des grosses apps (rangées horizontales, « populaire », « pour toi », recherche en haut). Attention : fiches prêtes = catalogue intégré faisable hors ligne ; **communauté = comptes + serveur**, reporté (voir hébergement en fin de projet). À maquetter avant de coder.
6. **(Idée notée le 16/11, à faire après le reste)** Bouton « Paroles » : les paroles se récupèrent toutes seules d'après le titre (ou choix à la main dans une base / un site connu). Et un **mode « jeu »** : au ▶, accords + rythme défilent, avec les paroles si on veut. Attention : les paroles sont protégées par le droit d'auteur (sources sous licence ou lien vers un site ; à trancher avec Lucas avant de coder).
Ordre prévu : fiche (1) → création (2) et « + » (4) → Découvrir (5, maquette d'abord) → S'entraîner (3).
Lucas a peu de quota : réponses courtes, pas de maquette ni d'agent sans nécessité.

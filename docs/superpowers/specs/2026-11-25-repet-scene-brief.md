# Brief agent : la Répèt' « scène de Médi » (25/11/2026)

À lire avec `CLAUDE.md`. Économiser le contexte : ne lire que les fichiers cités, jamais `src/js/99-samples-guitare.js` en entier.

## But
Refaire l'écran Répèt' de S'entraîner (aujourd'hui bêta cachée `?beta`, `src/js/39-9-repet-jeux.js` + `src/css/23-repet.css`) en **un écran fixe sans défilement** : le métronome avec Médi, plus une bande dont chaque musicien **aide à comprendre** le rythme ou la suite d'accords. Validé par Lucas sur maquettes (« bonne direction »).

## Ce qui est décidé
- **Écran fixe**, de haut en bas : titre « Répèt' » + pilule « 90 BPM · 4/4 » ; **la scène** (prend la place restante) ; la suite d'accords (4 cases : nom + mini-schéma + barre de progression) ; **3 onglets** Rythme · Suite · Groupe (nom de ce qui joue écrit dessous) qui ouvrent chacun un **pop-up du bas** (la musique continue) ; tempo − / + , « Taper », gros « Jouer/Stop » ; barre de navigation de l'app.
- **La scène** : une **pancarte accrochée au plafond** (2 fils, se balance au tempo) avec le schéma + le nom de l'accord en cours. Médi au centre. **Pas de « Toi »** sur scène.
- **Par défaut : Médi seul** (= métronome, clic sur les temps). On appelle les musiciens un par un ; la scène se réarrange selon leur nombre (1-2 sur les côtés, 3-4 avec un 2e rang).
- **Musiciens éteints au repos** (désaturés), **allumés seulement quand ils jouent** (+ petit bond, ombre au sol de leur couleur). Médi toujours allumé, saute sur chaque temps.
- **Autour de Médi, le rythme défile** : la mesure en cases (temps = grandes, « et » = petites), tes coups en flèches orange (↓ ↑, × = étouffé), case en cours allumée. Forme retenue par défaut : **le cercle** (une mesure = un tour, Médi au centre, le « 1 » en haut sous la pancarte). Alternatives montrées : tapis roulant, arc + balle (à confirmer avec Lucas si besoin).
- **Rôles de la bande** (le cœur de l'idée) ; chacun **pose des points de sa couleur** sur les cases où il joue :
  - **Tchik** (charley, jaune) = *le balancier* : toutes les croches ; ta main fait l'aller-retour à chaque « tchik ».
  - **Boum** (batterie, bleu) = *les temps forts* : grosse caisse 1 et 3 (rond), caisse claire 2 et 4 (carré) ; tombe sur le « tchak » du chuck.
  - **Basile** (basse, vert) = *les changements* : note de base de l'accord ; bulle « D au prochain 1 ! » sur les 2 dernières croches.
  - **Ivoire** (clavier, violet, nouveau, même style) = *le son de l'accord* : accord complet sur les temps.
- **Médi conseille qui appeler** (ligne sous la scène : mini Médi + phrase + « Appeler » + ×), selon le rythme (× dans le motif → Boum ; sinon Tchik d'abord ; Basile pour les suites ; Ivoire ensuite). À l'arrivée, **carte « X arrive : son rôle »** 3 s. Le pop-up Groupe liste les 4 avec rôle, « T'apprend : … » et interrupteur.
- Pop-up Rythme : filtres Les bases / Pop et rock / Autres styles, lignes avec motif en barres + BPM conseillé + « Tchik/Boum t'aide ici ». Pop-up Suite : ambiances (Joyeux, Triste, Mélancolique, Énergique), lignes avec mini-schémas + noms. Choisir referme le pop-up et relance au début.

## Ce qui existe déjà (réutiliser)
- Personnages : `BOUM_SVG`, `BASILE_SVG` (`src/js/08-metronome…js`), `TCHIK_SVG` (`src/js/39-8-labo.js`), Médi `mediSVG` (`src/js/01-medi.js`, ne pas modifier son dessin ; les autres peuvent être retouchés). Couleurs bande : `:root` de `src/css/23-repet.css`.
- Moteur de jeu : `rpPlay` dans `39-9-repet-jeux.js` (bande, croches, accords par mesure, visuels calés sur l'audio) ; sons `metroKick/metroSnare/metroHihat`, schémas `chordSVG(newChord(x))` (`src/js/02-svg-chord-diagram.js`).
- Données : `RHYTHMS` (`src/js/04-rhythm-model.js`, motifs `pat` D/U/X/d/u/-), `FEEL_PROGS` + `AMBIANCES` (`src/js/17-au-feeling…js`).
- Jetons et polices de la refonte : `src/css/20-refonte-medi.css` (Bricolage Grotesque pour titres/accords/chiffres).

## Maquettes (référence visuelle, dans le scratchpad de la session, peuvent avoir disparu)
`repet-bande.html` (la plus récente : rôles + cercle/tapis/arc), `repet-fixe.html` (onglets + pop-ups, proposition 1 retenue).

## Hors périmètre
Jeux, déclics des murs, fiches. Garder la Répèt' derrière `?beta` tant que Lucas ne l'a pas testée sur téléphone.

## Livraison
Règles de `CLAUDE.md` : `src/` seulement, `node build.mjs`, `tests/smoke.cjs` OK, captures 390 et 1200 px (scratchpad), commit en anglais, push `main` + `claude/relaxed-hawking-5olqsb`. Réponses courtes en français à Lucas.

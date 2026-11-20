# S'entraîner v2 : Répét' + Jeux (bêta cachée) — 20/11/2026

## Pourquoi
Lucas veut un S'entraîner fun, animé, qui donne des résultats concrets (pas du théorique), relié au métronome et à « la bande ».
Maquettes validées : planche Design, page Refonte, rangées « S'entraîner × la bande » et « S'entraîner v2 » (R1–R4, J1–J5, D1–D7).
On le construit **dans le labo caché (`?beta`)**, à la place de l'accueil du labo : si ça marche, on l'intègre à l'app.

## Ce qu'on construit
- **Onglet Répét'** (remplace le métronome à terme) : la salle de répét' (Boum, Tchik, Médi, Basile), « Médi seul » (= métronome) ou « La bande », style, tempo, taper le tempo.
  - **Rythmes** (RHYTHMS, en 4/4 et 3/4 croches) : la bande joue, ta ligne montre où gratter, la guitare de l'app peut jouer la ligne.
  - **Suites d'accords** (FEEL_PROGS par ambiance) : Basile annonce l'accord suivant, barre de mesure, doigté, tours joués + record.
  - **Déclics** (cartes des murs qui ont un exercice en rythme) : Regarde (la vidéo existante) → Essaie (avec la bande) → Monte (3 paliers de tempo, la bande grossit : Tchik arrive au palier 2) → Gagné (les fiches où ça marche). « Presque ! » quand ça coince : on ralentit, Basile donne un truc.
- **Onglet Jeux** : la tournée (garage → bar → fête → festival, 3 étoiles par concert, chaque concert = 3 manches), le défi du jour, et 3 jeux jouables seuls :
  1. **L'oreille** : majeur/mineur, puis « Basile joue X, puis… ? ». Aucun micro.
  2. **Rythme ninja** : taper pile avec la bande (Parfait / Bien / Raté) ; option « gratter » au micro.
  3. **Accords éclair** : l'accord s'affiche, Boum compte, tu grattes sur le 1 ; tu valides (« Je l'ai ! »), le micro dit seulement si tu étais à l'heure.
- **Ton avis** sur chaque partie (Oui/Bof/Non : utile, fun, compris, encombrant, ça marche), envoyé avec les réponses du labo. Les tests du 19/11 restent accessibles.

## Ce qu'on ne fait pas
Juger l'accord au micro, vies perdues, classements, lien avec les fiches en mode jeu, toucher aux fiches.

## Technique
`src/js/39-9-repet-jeux.js` + `src/css/23-repet.css`, vue `labo` (inchangée dans la navigation). Un moteur commun (`rpPlay`) : croches, compte d'une mesure, batterie dérivée de METRO_PRESETS, basse sur la fondamentale, ligne de grattage, accords par mesure, visuels calés sur l'audio. Progrès dans localStorage (`gms_rp`).

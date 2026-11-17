/* ═══════ BLOCS « DÉBLOQUER » : l'entraînement à la carte, un mur = un bloc ═══════ */
const G4 = {name: 'G', frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4]};   // Sol à 4 doigts : l'annulaire sert d'ancre vers Ré
const FC = 'D-DU-UDU';
const BLOCS = [
  {id: 'b1', n: 'Changer sans casser le rythme', mur: 'Je m’arrête à chaque changement d’accord', cards: [
    {k: 'b1-1', t: 'Le doigt qui ne bouge pas', d: 'Entre deux accords, certains doigts restent au même endroit. Ne les soulève jamais : seuls les autres bougent.', ex: {type: 'exo', ref: 'anchor', param: 'C-Am'}, exl: 'Doigts pivots', song: 'Je l’aime à mourir',
     v: {kick: 'MUR 1 · CHANGER SANS CASSER LE RYTHME', h: ['Le doigt qui', 'ne bouge pas'], sub: 'Entre deux accords, certains doigts <b>restent posés</b>. C’est la moitié du travail en moins.', scenes: [
       {morph: 1, a: 'C', b: 'Am', top: ['Do → La mineur', 'regarde les doigts orange'], caps: [[.4, 'L’<b>index</b> et le <b>majeur</b> ne bougent pas.'], [4, 'Seul l’<b>annulaire</b> voyage, d’une corde à l’autre.'], [7.4, 'Garde-les appuyés pendant tout le changement.']]},
       {morph: 1, a: G4, b: 'D', top: ['Sol → Ré', 'avec le Sol à quatre doigts'], caps: [[.4, 'Joue le Sol avec l’<b>annulaire</b> et l’<b>auriculaire</b> en bas.'], [4, 'L’annulaire reste sur la corde de Si : c’est ton <b>ancre</b>.'], [7.4, 'Les autres doigts se replacent autour de lui.']]},
       {rows: [{lbl: 'En rythme', pat: FC, bpm: 80, chords: ['C', 'Am', 'C', 'Am'], hand: 1}], top: ['Maintenant en jouant', 'feu de camp, Do et La mineur'], caps: [[.4, 'Les doigts orange ne quittent <b>jamais</b> les cordes.'], [4.5, 'Le changement devient presque invisible.']]}]}},
    {k: 'b1-2', t: 'La dernière croche à vide', d: 'Le dernier coup de la mesure se joue cordes à vide : ta main gauche part en avance et arrive à l’heure sur le 1.', ex: {type: 'exo', ref: 'silent'}, exl: 'Croche à vide', song: 'Wonderwall',
     v: {kick: 'MUR 1 · CHANGER SANS CASSER LE RYTHME', h: ['La dernière croche', 'à vide'], sub: 'Le secret des guitaristes : la main gauche part <b>avant</b> la fin de la mesure.', scenes: [
       {rows: [{lbl: 'Ce que tu fais', pat: FC, bpm: 80, chords: ['G', 'C'], hand: 1}, {lbl: 'Avec l’astuce', pat: FC, bpm: 80, chords: ['G', 'C', 'G', 'C'], free: 1, hand: 1}], top: ['Le dernier « et » de la mesure', 'regarde la dernière case'],
        caps: [[.4, 'Si tu attends le 1 pour bouger, tu arrives <b>en retard</b>.'], [4.6, 'Le dernier coup se joue <b>cordes à vide</b> : ta main gauche est déjà partie.'], [9, 'Personne ne l’entend, et tu tombes pile sur le 1.']]},
       {tiles: 1, items: [{l: '4', s: 'je compte'}, {l: '+', s: 'je lâche l’accord', hot: 1}, {l: '1', s: 'nouvel accord', hot: 1}], step: .9, top: ['À retenir', 'sur le dernier « et »'], caps: [[.4, 'Lâche l’accord sur le dernier « et », <b>pas avant</b>.'], [3.6, 'Commence lentement, puis monte le tempo.']]}]}},
    {k: 'b1-3', t: 'Une minute, deux accords', d: 'Le défi qui fait progresser le plus vite : une minute, deux accords, et tu comptes tes changements. Bats ton score demain.', ex: {type: 'exo', ref: 'omc', param: 'G-C'}, exl: 'Défi d’une minute', song: 'Dès que le vent soufflera',
     v: {kick: 'MUR 1 · CHANGER SANS CASSER LE RYTHME', h: ['Une minute,', 'deux accords'], sub: 'Le défi qui a débloqué des milliers de guitaristes : <b>compter</b> ses changements.', scenes: [
       {morph: 1, a: 'G', b: 'C', n: 12, hold: .45, move: .32, cnt: 'omc', cntL: 'CHANGEMENTS', legend: false, top: ['Sol ↔ Do pendant une minute', 'sans gratter, juste les doigts'], caps: [[.4, 'Lance un chrono d’<b>une minute</b>.'], [3.2, 'Change le plus de fois possible, même si c’est sale.'], [6.4, 'Note ton score.']]},
       {tiles: 1, items: [{l: '12', s: 'jour 1'}, {l: '19', s: 'jour 3'}, {l: '26', s: 'jour 5'}, {l: '35', s: 'jour 7', hot: 1}], step: .7, top: ['Ce qui se passe en une semaine', 'deux minutes par jour suffisent'], caps: [[.4, 'Chaque jour, tu bats un peu ton score.'], [3.4, 'Au-delà de <b>30</b>, le changement ne te bloque plus en chanson.']]}]}},
    {k: 'b1-4', t: 'Changer en rythme', d: 'Les accords changent, la main droite continue. On commence lentement, on accélère seulement quand ça ne casse plus.', ex: {type: 'prog', ref: 'j3', param: 'feucamp'}, exl: 'Jouer G C G D', song: 'Morgane de toi',
     v: {kick: 'MUR 1 · CHANGER SANS CASSER LE RYTHME', h: ['Changer', 'en rythme'], sub: 'Les accords changent. <b>La main droite, elle, ne s’arrête jamais.</b>', scenes: [
       {rows: [{lbl: 'Lent', pat: FC, bpm: 70, chords: ['G', 'C', 'D', 'Em'], hand: 1}, {lbl: 'Plus vite', pat: FC, bpm: 92, chords: ['G', 'C', 'D', 'Em'], hand: 1}], top: ['Sol, Do, Ré, Mi mineur', 'un accord par mesure'],
        caps: [[.4, 'La main droite <b>balance</b> en continu, comme un métronome.'], [5, 'Change d’accord sans jamais l’arrêter.'], [10, 'Tu n’accélères que quand ça ne casse plus.']]}]}}]},
  {id: 'b2', n: 'Sortir du feu de camp', mur: 'Tous mes morceaux ont le même rythme', cards: [
    {k: 'b2-1', t: 'Le balancier', d: 'La main droite monte et descend tout le temps, même quand elle ne touche pas les cordes. C’est elle qui garde le tempo.', ex: {type: 'rc', ref: 'rc2'}, exl: 'Le balancier', song: 'Les Champs-Élysées',
     v: {kick: 'MUR 2 · SORTIR DU FEU DE CAMP', h: ['Le', 'balancier'], sub: 'Ta main droite est un <b>métronome</b> : elle bouge tout le temps, même dans le vide.', scenes: [
       {rows: [{lbl: 'Tout sonne', pat: 'DUDUDUDU', bpm: 80, chords: ['G', 'C'], hand: 1}, {lbl: 'Feu de camp', pat: FC, bpm: 80, chords: ['G', 'C'], ghost: 1, hand: 1}], top: ['Bas sur le temps, haut sur le « et »', 'regarde la main à droite'],
        caps: [[.4, 'Bas sur les chiffres, haut sur les « + ».'], [4.6, 'Dans le feu de camp, la main passe <b>au-dessus</b> des cordes sur les cases grises.'], [9, 'Elle ne s’arrête jamais : c’est tout le secret.']]}]}},
    {k: 'b2-2', t: 'Le « tchak »', d: 'Sur les temps 2 et 4, le plat de la main droite étouffe les cordes en frappant. La guitare devient batterie.', ex: {type: 'rc', ref: 'rc6'}, exl: 'Le tchak', song: 'Wonderwall',
     v: {kick: 'MUR 2 · SORTIR DU FEU DE CAMP', h: ['Le', '« tchak »'], sub: 'Sur les temps 2 et 4, on <b>étouffe</b> les cordes : la guitare devient batterie.', scenes: [
       {tiles: 1, items: [{l: 'Frappe', s: 'vers le bas'}, {l: 'Pose', s: 'le plat de la main', hot: 1}, {l: 'Tchak', s: 'son sec, sans note', hot: 1}], step: .8, top: ['Le geste', 'main droite'], caps: [[.4, 'Pendant que tu grattes, le <b>plat de la main</b> se pose sur les cordes.'], [3.6, 'Pas de note : juste un bruit sec.']]},
       {rows: [{lbl: 'Feu de camp', pat: FC, bpm: 84, chords: ['G', 'C'], hand: 1}, {lbl: 'Avec le tchak', pat: 'DUXUDUXU', bpm: 84, chords: ['G', 'C', 'D', 'Em'], hand: 1}], top: ['Mêmes accords, autre énergie', 'écoute la différence'],
        caps: [[.4, 'D’abord le feu de camp…'], [4.4, '… puis le <b>tchak</b> sur 2 et 4 : tout de suite, ça groove.']]}]}},
    {k: 'b2-3', t: 'Fort, doux', d: 'Un rythme vivant n’a pas tous ses coups au même volume. Appuie les temps 2 et 4, effleure le reste.', ex: {type: 'rc', ref: 'rc5'}, exl: 'Fort et doux', song: 'How to Save a Life',
     v: {kick: 'MUR 2 · SORTIR DU FEU DE CAMP', h: ['Fort,', 'doux'], sub: 'Un rythme vivant n’a pas tous ses coups <b>au même volume</b>.', scenes: [
       {rows: [{lbl: 'Tout pareil', pat: 'DUDUDUDU', bpm: 86, chords: ['G', 'D'], hand: 1}, {lbl: 'Accents sur 2 et 4', pat: 'dudududu', acc: [2, 6], bpm: 86, chords: ['G', 'D', 'Em', 'C'], hand: 1}], top: ['Les grosses flèches sonnent plus fort', 'même rythme, autre relief'],
        caps: [[.4, 'Tous les coups au même volume : c’est plat.'], [4.4, 'Appuie le <b>2</b> et le <b>4</b>, effleure le reste.'], [9, 'C’est ce qui donne envie de taper du pied.']]}]}},
    {k: 'b2-4', t: 'La pop syncopée', d: 'Les temps 2 et 3 restent muets, la main continue de balancer. C’est ce trou qui fait danser.', ex: {type: 'rc', ref: 'rc8'}, exl: 'Pop syncopée', song: 'How to Save a Life',
     v: {kick: 'MUR 2 · SORTIR DU FEU DE CAMP', h: ['La pop', 'syncopée'], sub: 'Deux temps <b>muets</b> au milieu de la mesure : c’est ce trou qui fait danser.', scenes: [
       {rows: [{lbl: 'Feu de camp', pat: FC, bpm: 90, chords: ['G', 'D'], ghost: 1, hand: 1}, {lbl: 'Pop syncopée', pat: 'D--U-UDU', bpm: 90, chords: ['G', 'D', 'Em', 'C'], ghost: 1, hand: 1}], top: ['Bas… (rien)… haut, haut-bas-haut', 'les cases grises : la main passe dans le vide'],
        caps: [[.4, 'Le feu de camp que tu connais.'], [4.4, 'On enlève le <b>2</b> : bas, puis on attend…'], [8.6, '… et on reprend sur le « + » du 2. La main ne s’arrête pas.']]}]}},
    {k: 'b2-5', t: 'Le reggae', d: 'On ne joue que les coups vers le haut, entre les temps. Le coup vers le bas se fait dans le vide.', ex: {type: 'rc', ref: 'rc4'}, exl: 'Reggae', song: 'Lady Melody',
     v: {kick: 'MUR 2 · SORTIR DU FEU DE CAMP', h: ['Le', 'reggae'], sub: 'On ne joue <b>que les coups vers le haut</b>, entre les temps.', scenes: [
       {rows: [{lbl: 'Reggae', pat: '-U-U-U-U', bpm: 84, chords: ['D', 'A', 'Em', 'G'], ghost: 1, hand: 1}], top: ['Le bas dans le vide, le haut sur les cordes', 'Ré, La, Mi mineur, Sol'],
        caps: [[.4, 'Sur les chiffres : la main descend <b>sans toucher</b>.'], [4.4, 'Sur les « + » : un petit coup <b>vers le haut</b>, court et léger.'], [8.4, 'Étouffe juste après chaque coup pour un son bien sec.']]}]}},
    {k: 'b2-6', t: 'Trois temps : valse et 6/8', d: 'Tous les morceaux ne sont pas en quatre. En valse, on compte 1-2-3 ; en 6/8, deux groupes de trois.', ex: {type: 'rc', ref: 'rc9'}, exl: 'La valse',
     v: {kick: 'MUR 2 · SORTIR DU FEU DE CAMP', h: ['Valse', 'et 6/8'], sub: 'Tous les morceaux ne sont pas en 4 : on compte <b>1-2-3</b>.', scenes: [
       {rows: [{lbl: 'Valse', mes: '3/4', pat: 'D-d-d-', acc: [0], bpm: 104, chords: ['G', 'C', 'D', 'G'], hand: 1}, {lbl: 'Six-huit', mes: '6/8', pat: 'D-UD-U', bpm: 60, chords: ['Em', 'C', 'G', 'D'], hand: 1}], top: ['Compter en trois', 'un temps fort, deux temps doux'],
        caps: [[.4, 'La valse : <b>UN</b>-deux-trois, un bas fort puis deux doux.'], [5.6, 'Le 6/8 : deux groupes de trois, comme une <b>berceuse</b>.'], [10.4, 'Parfait pour les ballades et les chansons lentes.']]}]}}]},
  {id: 'b3', n: 'De nouveaux accords sans barré', mur: 'Mes accords sonnent toujours pareil', cards: []},
  {id: 'b4', n: 'Le barré', mur: 'Le F me bloque', cards: []},
  {id: 'b5', n: 'Les arpèges', mur: 'Je ne sais que gratter', cards: []},
  {id: 'b6', n: 'Embellir', mur: 'Ça sonne débutant', cards: []},
  {id: 'b7', n: 'Jouer de vraies chansons', mur: 'Je ne sais pas apprendre un morceau seul', cards: []},
  {id: 'b8', n: 'Comprendre en 2 minutes', mur: 'Pourquoi ces accords vont ensemble ?', cards: [], to: 'cours'},
];

const EM7P = {name: 'Em7', frets: [0, 2, 2, 0, 3, 3], fingers: [0, 1, 2, 0, 3, 4]};       // Em7 « pro » : annulaire et auriculaire en haut, comme le Sol
const FMINI = {name: 'F', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1]};     // le petit Fa (index sur 2 cordes)
const GBAR = {name: 'G', frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1]};         // forme de Fa glissée en case 3
const BK = n => 'MUR ' + n + ' · ';
const MORE_BLOCS = {
  b3: [
    {k: 'b3-1', t: 'Les accords « sus »', d: 'Enlève ou déplace un seul doigt, et le Ré devient suspendu : ni joyeux ni triste, il flotte et appelle la suite.', song: 'Wonderwall',
     v: {kick: BK(3) + 'NOUVEAUX ACCORDS SANS BARRÉ', h: ['Les accords', '« sus »'], sub: 'Un seul doigt change, et l’accord se met à <b>flotter</b>.', scenes: [
       {morph: 1, a: 'D', b: 'Dsus4', n: 6, top: ['Ré → Ré sus4', 'l’auriculaire s’ajoute'], caps: [[.4, 'Pose l’<b>auriculaire</b> une case au-dessus : Ré sus4.'], [4.2, 'Ça crée une tension qui veut revenir au Ré.']]},
       {morph: 1, a: 'D', b: 'Dsus2', n: 6, top: ['Ré → Ré sus2', 'le majeur se lève'], caps: [[.4, 'Lève le <b>majeur</b> : la corde de Mi aigu sonne à vide.'], [4.2, 'Plus ouvert, plus aérien.']]},
       {rows: [{lbl: 'Ré qui respire', pat: FC, bpm: 84, chords: ['D', 'Dsus4', 'D', 'Dsus2'], hand: 1}], top: ['En rythme', 'Ré, sus4, Ré, sus2'], caps: [[.4, 'Alterne dans la même mesure : c’est le son <b>folk</b> par excellence.'], [4.6, 'Même chose avec La : Asus2, Asus4.']]}]}},
    {k: 'b3-2', t: 'Les couleurs : maj7 et 7', d: 'Retire ou ajoute un doigt à un accord que tu connais : Do devient Do maj7, Mi mineur devient Mi mineur 7. Plus doux, plus jazzy.', ex: {type: 'prog', ref: 'r5', param: 'douce'}, exl: 'Suite rêveuse',
     v: {kick: BK(3) + 'NOUVEAUX ACCORDS SANS BARRÉ', h: ['Les', 'couleurs'], sub: 'Tu connais déjà les formes. Il suffit d’<b>un doigt</b> pour changer l’ambiance.', scenes: [
       {morph: 1, a: 'C', b: 'Cmaj7', n: 6, top: ['Do → Do maj7', 'l’index se lève'], caps: [[.4, 'Lève l’<b>index</b> : la corde de Si sonne à vide.'], [4.2, 'Do maj7 : doux, rêveur, très « ballade ».']]},
       {morph: 1, a: 'Em', b: 'Em7', n: 6, top: ['Mi mineur → Mi mineur 7', 'l’auriculaire s’ajoute'], caps: [[.4, 'Ajoute l’<b>auriculaire</b> sur la corde de Si, case 3.'], [4.2, 'Mi mineur 7 : moins triste, plus mélancolique.']]},
       {rows: [{lbl: 'Rêveur', pat: 'D-du-udu', bpm: 76, chords: ['Cmaj7', 'Em7', 'Cmaj7', 'Em7'], hand: 1}], top: ['Juste deux accords', 'et c’est déjà une ambiance'], caps: [[.4, 'Deux accords « couleur » suffisent à faire un morceau.']]}]}},
    {k: 'b3-3', t: 'Les accords magiques, version pro', d: 'Sol, Do add9, Ré, Mi mineur 7 : l’annulaire et l’auriculaire restent collés en haut. Ça sonne riche, et les changements deviennent faciles.', ex: {type: 'prog', ref: 'r5', param: 'douce'}, exl: 'Suite rêveuse', song: 'Wonderwall',
     v: {kick: BK(3) + 'NOUVEAUX ACCORDS SANS BARRÉ', h: ['Les accords magiques,', 'version pro'], sub: 'Deux doigts qui ne bougent <b>jamais</b>, et tes quatre accords sonnent comme sur un disque.', scenes: [
       {morph: 1, a: G4, b: 'Cadd9', n: 6, top: ['Sol → Do add9', 'regarde les doigts orange'], caps: [[.4, 'L’<b>annulaire</b> et l’<b>auriculaire</b> restent en case 3.'], [4.2, 'Seuls l’index et le majeur descendent d’une corde.']]},
       {morph: 1, a: G4, b: EM7P, n: 6, top: ['Sol → Mi mineur 7', 'toujours les mêmes ancres'], caps: [[.4, 'Les deux doigts du haut ne bougent toujours pas.'], [4.2, 'C’est le secret de Wonderwall et de mille chansons acoustiques.']]},
       {rows: [{lbl: 'Version pro', pat: FC, bpm: 86, chords: [G4, 'Cadd9', 'D', EM7P], hand: 1}], top: ['Les quatre ensemble', 'Sol, Do add9, Ré, Mi mineur 7'], caps: [[.4, 'Compare avec ta version habituelle : ça <b>sonne</b> tout de suite plus riche.']]}]}},
    {k: 'b3-4', t: 'Contourner le Fa', d: 'Pas encore de barré ? Le Fa maj7 le remplace dans presque toutes les chansons, et l’index ne bouge pas depuis le Do.', ex: {type: 'prog', ref: 'j2', param: 'feucamp'}, exl: 'Do, Sol, La mineur, Fa', song: 'Je l’aime à mourir',
     v: {kick: BK(3) + 'NOUVEAUX ACCORDS SANS BARRÉ', h: ['Contourner', 'le Fa'], sub: 'Le Fa barré fait peur. Le <b>Fa maj7</b> fait presque le même travail.', scenes: [
       {morph: 1, a: 'C', b: 'Fmaj7', n: 6, top: ['Do → Fa maj7', 'l’index reste posé'], caps: [[.4, 'L’<b>index</b> ne bouge pas.'], [4.2, 'Majeur et annulaire montent d’une corde, ensemble.']]},
       {rows: [{lbl: 'La grille des tubes', pat: FC, bpm: 84, chords: ['C', 'G', 'Am', 'Fmaj7'], hand: 1}], top: ['Do, Sol, La mineur, Fa maj7', 'personne n’entendra la différence'], caps: [[.4, 'Partout où tu vois <b>F</b>, joue <b>Fmaj7</b> en attendant le barré.']]}]}}],
  b4: [
    {k: 'b4-1', t: 'Le petit Fa', d: 'L’index couche deux cordes seulement. C’est la marche entre le Fa maj7 et le vrai barré.', ex: {type: 'exo', ref: 'barre'}, exl: 'Le barré en marches', song: 'Je l’aime à mourir',
     v: {kick: BK(4) + 'LE BARRÉ', h: ['Le', 'petit Fa'], sub: 'Première marche : l’index couche <b>deux cordes</b>, pas six.', scenes: [
       {morph: 1, a: 'Fmaj7', b: FMINI, n: 6, top: ['Fa maj7 → petit Fa', 'l’index se couche'], caps: [[.4, 'Pars du Fa maj7 que tu connais.'], [4.2, 'Couche l’<b>index</b> sur les cordes de Si et de Mi aigu.'], [8, 'Appuie avec le côté de l’index, près de la frette.']]},
       {rows: [{lbl: 'En chanson', pat: FC, bpm: 80, chords: ['C', 'Am', FMINI, 'G'], hand: 1}], top: ['Do, La mineur, petit Fa, Sol', ''], caps: [[.4, 'Joue seulement les <b>quatre cordes aiguës</b> sur le Fa.']]}]}},
    {k: 'b4-2', t: 'Le grand Fa', d: 'Le pouce derrière, l’index roulé sur le côté, le poids du bras qui tire : le barré tient avec moins de force que tu crois.', ex: {type: 'exo', ref: 'barre'}, exl: 'Le barré en marches',
     v: {kick: BK(4) + 'LE BARRÉ', h: ['Le', 'grand Fa'], sub: 'Le barré, c’est de la <b>technique</b>, pas de la force.', scenes: [
       {tiles: 1, items: [{l: 'Pouce', s: 'derrière le manche, au milieu'}, {l: 'Index', s: 'roulé sur son côté', hot: 1}, {l: 'Frette', s: 'tout près, pas au milieu de la case'}, {l: 'Bras', s: 'son poids tire, la main serre peu', hot: 1}], step: .8, top: ['Les quatre réglages', ''], caps: [[.4, 'Le côté de l’index est plus dur : les cordes sonnent mieux.'], [4.2, 'Laisse le <b>poids du bras</b> tirer vers toi au lieu de serrer.']]},
       {morph: 1, a: FMINI, b: 'F', n: 6, top: ['Petit Fa → grand Fa', 'l’index s’allonge, deux doigts arrivent'], caps: [[.4, 'L’index couvre maintenant les <b>six cordes</b>.'], [4.2, 'L’annulaire et l’auriculaire prennent les cordes graves.'], [8, 'Vérifie corde par corde, puis gratte.']]}]}},
    {k: 'b4-3', t: 'Une forme, douze accords', d: 'Une fois le Fa en main, il suffit de le glisser : case 3 c’est Sol, case 5 La, case 8 Do. Le même geste te donne tous les accords majeurs.', ex: {type: 'exo', ref: 'barre'}, exl: 'Le barré en marches',
     v: {kick: BK(4) + 'LE BARRÉ', h: ['Une forme,', 'douze accords'], sub: 'La forme du Fa <b>glisse</b> sur le manche : chaque case donne un nouvel accord.', scenes: [
       {morph: 1, a: 'F', b: GBAR, n: 6, top: ['Fa en case 1 → Sol en case 3', 'toute la main glisse'], caps: [[.4, 'Même forme, deux cases plus haut : <b>Sol</b>.'], [4.2, 'Les doigts gardent leur place les uns par rapport aux autres.']]},
       {tiles: 1, items: [{l: '1', s: 'Fa', m: [41, 45, 48]}, {l: '3', s: 'Sol', m: [43, 47, 50]}, {l: '5', s: 'La', m: [45, 49, 52], hot: 1}, {l: '7', s: 'Si', m: [47, 51, 54]}, {l: '8', s: 'Do', m: [48, 52, 55], hot: 1}], step: .8, top: ['La case de l’index donne le nom', 'sur la grosse corde'], caps: [[.4, 'Repère la note sous l’index, sur la corde de Mi grave.'], [4.2, 'Avec une seule forme, tu joues <b>tous</b> les accords majeurs.']]}]}},
    {k: 'b4-4', t: 'Le Si mineur', d: 'Le barré le plus fréquent après le Fa : la forme du La mineur, décalée en case 2 avec l’index en barre.', ex: {type: 'exo', ref: 'omc', param: 'G-Bm'}, exl: 'Sol ↔ Si mineur',
     v: {kick: BK(4) + 'LE BARRÉ', h: ['Le Si', 'mineur'], sub: 'Le La mineur que tu connais, <b>glissé</b> et barré en case 2.', scenes: [
       {morph: 1, a: 'Am', b: 'Bm', n: 6, top: ['La mineur → Si mineur', 'même dessin, une case plus haut'], caps: [[.4, 'Regarde : le dessin des trois doigts est <b>le même</b>.'], [4.2, 'L’index devient la barre, en case 2.']]},
       {rows: [{lbl: 'En chanson', pat: FC, bpm: 80, chords: ['G', 'D', 'Bm', 'C'], hand: 1}], top: ['Sol, Ré, Si mineur, Do', ''], caps: [[.4, 'Ne joue pas la corde de Mi grave sur le Si mineur.']]}]}}],
  b5: [
    {k: 'b5-1', t: 'p-i-m-a', d: 'Le pouce joue la basse, puis l’index, le majeur et l’annulaire prennent chacun leur corde. Même accord, tout un autre monde.', ex: {type: 'exo', ref: 'pima'}, exl: 'Arpège p-i-m-a',
     v: {kick: BK(5) + 'LES ARPÈGES', h: ['p-i-m-a,', 'note par note'], sub: 'Au lieu de gratter, on fait <b>chanter</b> l’accord une corde à la fois.', scenes: [
       {arp: 1, chords: ['C', 'Am'], seq: ['B', 3, 2, 1], lbl: ['p · basse', 'i · sol', 'm · si', 'a · mi'], bpm: 76, rep: 4, top: ['Do puis La mineur', 'chaque doigt a sa corde'], caps: [[.4, 'Le <b>pouce</b> (p) joue la basse de l’accord.'], [4.6, 'Puis index, majeur, annulaire : une corde chacun.'], [9.2, 'La main gauche ne change rien : c’est le même accord.']]}]}},
    {k: 'b5-2', t: 'L’arpège qui monte et descend', d: 'Le motif de toutes les ballades : la basse, puis les cordes aiguës qui montent et redescendent.', ex: {type: 'exo', ref: 'pickarp'}, exl: 'Arpège au médiator',
     v: {kick: BK(5) + 'LES ARPÈGES', h: ['L’arpège', 'des ballades'], sub: 'Huit notes par accord : la basse, puis on <b>monte</b> et on <b>redescend</b>.', scenes: [
       {arp: 1, chords: ['G', 'Em', 'C', 'D'], seq: ['B', 3, 2, 3, 1, 3, 2, 3], bpm: 92, rep: 1, top: ['Sol, Mi mineur, Do, Ré', 'basse · 3 · 2 · 3 · 1 · 3 · 2 · 3'], caps: [[.4, 'La <b>basse</b> d’abord, puis les cordes 3, 2 et 1.'], [5, 'Au doigt ou au médiator : le motif est le même.'], [9.6, 'Laisse sonner les notes, ne les étouffe pas.']]}]}},
    {k: 'b5-3', t: 'La basse alternée', d: 'Le pouce alterne entre deux cordes graves pendant que les doigts piquent les aiguës : le son folk et country.', ex: {type: 'exo', ref: 'travis'}, exl: 'Basse alternée',
     v: {kick: BK(5) + 'LES ARPÈGES', h: ['La basse', 'alternée'], sub: 'Le pouce fait <b>tic-tac</b> entre deux basses, les doigts jouent par-dessus.', scenes: [
       {arp: 1, chords: ['C', 'G', 'Am', 'G'], seq: ['B', 2, 'A', 1], lbl: ['pouce', 'i', 'pouce', 'm'], bpm: 84, rep: 2, top: ['Do, Sol, La mineur, Sol', 'basse · 2 · basse 2 · 1'], caps: [[.4, 'Le pouce va et vient entre <b>deux cordes graves</b>.'], [5, 'Les doigts glissent une note entre chaque basse.'], [9.6, 'Commence très lentement : c’est le pouce qui doit devenir automatique.']]}]}}],
  b6: [
    {k: 'b6-1', t: 'Le hammer-on', d: 'Tu grattes une corde à vide, puis tu frappes la case du doigt sans regratter : la note sort toute seule.', ex: {type: 'exo', ref: 'hammer'}, exl: 'Hammer-on et pull-off',
     v: {kick: BK(6) + 'EMBELLIR', h: ['Le', 'hammer-on'], sub: 'Une note qui sort <b>sans gratter</b> : le doigt frappe la corde comme un marteau.', scenes: [
       {neck: 1, shape: 'C', ev: [[0, 'C', 0, 'c'], [1.2, 4, 0, 'n'], [1.55, 4, 2, 'h', 'h'], [3, 'C', 0, 'c'], [4.2, 4, 0, 'n'], [4.55, 4, 2, 'h', 'h'], [6, 'C', 0, 'c'], [7.2, 4, 0, 'n'], [7.55, 4, 2, 'h', 'h']], top: ['Sur un Do', 'corde de Ré : à vide, puis case 2'], caps: [[.4, 'Joue la corde de Ré <b>à vide</b>…'], [3.2, '… puis frappe la case 2 avec le majeur, <b>sans regratter</b>.'], [6.4, 'Le Do prend tout de suite un air folk.']]}]}},
    {k: 'b6-2', t: 'Le pull-off', d: 'L’inverse du hammer : tu joues la note, puis tu tires le doigt vers le bas pour faire sonner la corde à vide.', ex: {type: 'exo', ref: 'hammer'}, exl: 'Hammer-on et pull-off',
     v: {kick: BK(6) + 'EMBELLIR', h: ['Le', 'pull-off'], sub: 'Tu <b>arraches</b> le doigt de la corde : la note d’en dessous sonne toute seule.', scenes: [
       {neck: 1, shape: 'Am', ev: [[0, 'Am', 0, 'c'], [1.2, 3, 2, 'n'], [1.55, 3, 0, 'p', 'p'], [3, 'Am', 0, 'c'], [4.2, 3, 2, 'n'], [4.55, 3, 0, 'p', 'p'], [6, 'Am', 0, 'c'], [7.2, 3, 2, 'n'], [7.55, 3, 0, 'p', 'p']], top: ['Sur un La mineur', 'corde de Sol : case 2, puis à vide'], caps: [[.4, 'Joue la corde de Sol case 2…'], [3.2, '… puis tire le doigt <b>vers le sol</b>, en accrochant un peu la corde.'], [6.4, 'Hammer et pull ensemble : c’est le petit ornement des solos acoustiques.']]}]}},
    {k: 'b6-3', t: 'Le glissé', d: 'Tu joues une note et tu fais glisser le doigt jusqu’à la case suivante sans le lever : la note chante.', ex: {type: 'exo', ref: 'slide'}, exl: 'Les glissés',
     v: {kick: BK(6) + 'EMBELLIR', h: ['Le', 'glissé'], sub: 'Le doigt <b>reste appuyé</b> et voyage sur la corde.', scenes: [
       {neck: 1, frets: 7, ev: [[0, 3, 2, 'n'], [.5, 3, 4, 's', 'glisse'], [2, 3, 2, 'n'], [2.5, 3, 4, 's', 'glisse'], [4, 2, 3, 'n'], [4.5, 2, 5, 's', 'glisse'], [6, 2, 3, 'n'], [6.5, 2, 5, 's', 'glisse']], top: ['Corde de Sol, puis de Si', 'case 2 vers 4, case 3 vers 5'], caps: [[.4, 'Joue la note, puis <b>glisse</b> sans relâcher la pression.'], [4, 'La note d’arrivée doit sonner aussi fort que la première.']]}]}},
    {k: 'b6-4', t: 'Les basses qui relient', d: 'Entre deux accords, trois notes de basse font le pont. Ton enchaînement devient une petite mélodie.', ex: {type: 'exo', ref: 'combo'}, exl: 'Arpège et hammer-on',
     v: {kick: BK(6) + 'EMBELLIR', h: ['Les basses', 'qui relient'], sub: 'Trois notes graves entre deux accords : le <b>pont</b> qui fait pro.', scenes: [
       {neck: 1, ev: [[0, 'G', 0, 'c'], [1.4, 6, 3, 'n', 'Sol'], [1.8, 6, 2, 'n', 'Fa♯'], [2.2, 6, 0, 'n', 'Mi'], [2.6, 'Em', 0, 'c'], [4.4, 6, 0, 'n', 'Mi'], [4.8, 5, 0, 'n', 'La'], [5.2, 5, 2, 'n', 'Si'], [5.6, 'C', 0, 'c'], [7.4, 5, 3, 'n', 'Do'], [7.8, 5, 2, 'n', 'Si'], [8.2, 5, 0, 'n', 'La'], [8.6, 'Am', 0, 'c']], top: ['Sol → Mi mineur → Do → La mineur', 'la basse descend ou monte, note à note'], caps: [[.4, 'Sol, Fa dièse, Mi : la basse <b>descend</b> jusqu’au Mi mineur.'], [4.4, 'Mi, La, Si : elle <b>monte</b> jusqu’au Do.'], [7.6, 'Joue ces notes à la place du dernier coup de la mesure.']]}]}}],
  b7: [
    {k: 'b7-1', t: 'Lire une grille trouvée en ligne', d: 'Une grille sur internet, c’est un code simple : un accord = une mesure, deux accords dans une case = moitié-moitié, « % » ou « ×2 » = on répète.', ex: {type: 'fiche'}, exl: 'Créer une fiche',
     v: {kick: BK(7) + 'JOUER DE VRAIES CHANSONS', h: ['Lire une grille', 'trouvée en ligne'], sub: 'Trois règles, et n’importe quelle grille devient <b>jouable</b>.', scenes: [
       {tiles: 1, items: [{l: 'G', s: 'une mesure entière', c: 'G'}, {l: 'D', s: 'une mesure entière', c: 'D'}, {l: 'Em  C', s: 'moitié-moitié', hot: 1, c: 'Em'}, {l: '%', s: 'on rejoue la mesure', hot: 1}], step: 1, top: ['| G | D | Em C | % |', 'comment la lire'], caps: [[.4, 'Un accord seul : on le joue <b>toute la mesure</b>.'], [4.2, 'Deux accords dans une case : <b>deux temps</b> chacun.'], [7.8, '« % », « ×2 » ou « bis » : on répète.']]},
       {rows: [{lbl: 'La même grille, jouée', pat: FC, bpm: 84, chords: ['G', 'D', 'Em', 'C'], hand: 1}], top: ['Et en vrai', 'un accord par mesure'], caps: [[.4, 'Recopie-la dans une fiche : tu ne la chercheras plus jamais.']]}]}},
    {k: 'b7-2', t: 'La structure d’un morceau', d: 'Une chanson, c’est deux ou trois parties qui reviennent. Apprends le couplet et le refrain : tu as déjà presque tout le morceau.', ex: {type: 'fiche'}, exl: 'Créer une fiche',
     v: {kick: BK(7) + 'JOUER DE VRAIES CHANSONS', h: ['La structure', 'd’un morceau'], sub: 'Une chanson, c’est <b>deux ou trois parties</b> qui reviennent.', scenes: [
       {tiles: 1, items: [{l: 'Intro'}, {l: 'Couplet', hot: 1}, {l: 'Refrain', hot: 1}, {l: 'Couplet', hot: 1}, {l: 'Refrain', hot: 1}, {l: 'Pont'}], step: .6, top: ['Le plan de presque toutes les chansons', ''], caps: [[.4, 'Couplet et refrain reviennent <b>plusieurs fois</b>.'], [3.8, 'Apprends ces deux-là d’abord : c’est 80 % du morceau.'], [7.2, 'Dans ta fiche : <b>une carte par partie</b>.']]}]}},
    {k: 'b7-3', t: 'Le capo pour ta voix', d: 'Si la chanson est trop haute ou trop basse pour toi, le capo change la hauteur sans changer tes doigtés.', ex: {type: 'cours', ref: 'capo'}, exl: 'Le cours sur le capo',
     v: {kick: BK(7) + 'JOUER DE VRAIES CHANSONS', h: ['Le capo', 'pour ta voix'], sub: 'Mêmes doigts, <b>autre hauteur</b> : la chanson se met à ta voix.', scenes: [
       {tiles: 1, items: [{l: '0', s: 'Sol', m: [43, 47, 50]}, {l: '1', s: 'Sol #', m: [44, 48, 51]}, {l: '2', s: 'La', m: [45, 49, 52], hot: 1}, {l: '3', s: 'La #', m: [46, 50, 53]}, {l: '4', s: 'Si', m: [47, 51, 54]}, {l: '5', s: 'Do', m: [48, 52, 55], hot: 1}], step: .7, top: ['La forme de Sol avec le capo', ''], caps: [[.4, 'Chaque case du capo monte tout d’un demi-ton.'], [3.8, 'Chante par-dessus : le bon capo, c’est quand tu ne forces <b>ni en haut ni en bas</b>.']]}]}},
    {k: 'b7-4', t: 'Apprendre un morceau en 4 étapes', d: 'Écouter, trouver les accords, poser le rythme, chanter dessus. Avec un tuto à côté, la fiche se remplit pendant que tu apprends.', ex: {type: 'tuto'}, exl: 'Fiche avec un tuto',
     v: {kick: BK(7) + 'JOUER DE VRAIES CHANSONS', h: ['Un morceau', 'en 4 étapes'], sub: 'Toujours le même ordre, et chaque morceau devient <b>plus facile</b> que le précédent.', scenes: [
       {tiles: 1, items: [{l: '1', s: 'écoute en entier'}, {l: '2', s: 'les accords, sans rythme', hot: 1}, {l: '3', s: 'le rythme, lentement', hot: 1}, {l: '4', s: 'chante par-dessus'}], step: 1, top: ['La méthode', ''], caps: [[.4, 'D’abord les accords seuls, en changeant <b>lentement</b>.'], [4.6, 'Puis le rythme, puis la voix.'], [8.4, 'Note tout dans une fiche : c’est ta mémoire de guitariste.']]}]}}],
};
BLOCS.forEach(b => { if (MORE_BLOCS[b.id]) b.cards = MORE_BLOCS[b.id]; });
BLOCS.forEach(b => b.cards.forEach(c => { LV[c.k] = lvBuild(Object.assign({t: c.t}, c.v)); }));
let blocCur = null;
const blocDone = () => LS.get('gms_bloc_done', {});
function blocToggleDone(k) { const d = blocDone(); d[k] ? delete d[k] : d[k] = Date.now(); LS.set('gms_bloc_done', d); renderBlocs(); }
function blocOpen(id) { const b = BLOCS.find(x => x.id === id); if (b && b.to) { coursList(); return; } lvStop(); blocCur = id; renderBlocs(); window.scrollTo(0, 0); }
function blocBack() { lvStop(); blocCur = null; renderBlocs(); window.scrollTo(0, 0); }
function blocSong(t) {
  const lc = t.toLowerCase(), s = sheets.find(z => z.title.trim().toLowerCase() === lc);
  if (s) { viewSheet(s.id); return; }
  const k = CATALOG.findIndex(z => z.t.toLowerCase() === lc);
  if (k >= 0) catOpen(k); else discGo(t, '');
}
// lance l'action d'une carte : exercice, rythme, suite d'accords, cours ou nouvelle fiche
function pcGo(a) {
  rccStop(); feelStop();
  if (a.type === 'exo') exoOpen(a.ref, a.param);
  else if (a.type === 'cours') coursOpen(a.ref);
  else if (a.type === 'rc') {
    const i = RH_COURSE.findIndex(s => s.id === a.ref);
    exoCur = null; exoMode = 'rhy'; exoRet = null; rcz.cur = i; rcz.bpm = RH_COURSE[i].bpm[0]; rcz.bars = 0; rcz.fin = false;
    go('exo');
  } else if (a.type === 'prog') {
    const p = FEEL_PROGS.find(x => x.id === a.ref), r = RHYTHMS.find(x => x.id === a.param);
    exoCur = null; exoMode = 'feel'; exoRet = null; feel.amb = p.amb;
    go('exo'); feelPickProg(p.id);
    if (r) { feel.rh = r.id; feel.kind = 'rh'; feel.fx = null; feel.bpm = Math.round((r.bpm[0] + (r.bpm[1] - r.bpm[0])*.35)/5)*5; feelFixBpm(); exoRender(); }
  } else if (a.type === 'fiche') newSheet();
}
function blocEx(id, i) { const c = BLOCS.find(x => x.id === id).cards[i]; lvStop(); if (c.ex.type === 'tuto') go('atelier'); else pcGo(c.ex); }
function renderBlocs() {
  const host = $('blocs-body'); if (!host) return;
  const dn = blocDone();
  if (!blocCur) {
    host.innerHTML = `<div class="bk-hero"><small>DÉBLOQUE TON JEU</small><h2>Quel mur te bloque ?</h2><p>Des cours courts, en vidéo, pour franchir chaque mur de la guitare. Choisis le tien, dans l’ordre que tu veux.</p></div><div class="bk-list">` +
      BLOCS.map((b, i) => { const n = b.cards.length, f = b.cards.filter(c => dn[c.k]).length;
        return `<button type="button" class="bk-it${n || b.to ? '' : ' soon'}" onclick="${n || b.to ? `blocOpen('${b.id}')` : ''}"><span class="bk-n">${i + 1}</span><span class="bk-tx"><b>${b.n}</b><i>« ${b.mur} »</i></span><span class="bk-st">${b.to ? 'Ouvrir' : n ? `${f}/${n}` : 'Bientôt'}</span></button>`; }).join('') + '</div>';
    return;
  }
  const b = BLOCS.find(x => x.id === blocCur), bi = BLOCS.indexOf(b);
  host.innerHTML = `<button type="button" class="bk-back" onclick="blocBack()"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Tous les blocs</button>
    <div class="bk-hero"><small>MUR ${bi + 1}</small><h2>${b.n}</h2><p>« ${b.mur} »</p></div>` +
    b.cards.map((c, i) => `<div class="bk-card${dn[c.k] ? ' done' : ''}"><div class="bk-ch"><span class="bk-n">${i + 1}</span><div><b>${c.t}</b><p>${c.d}</p></div></div>
      ${lvCard(c.k, 'b')}
      <div class="bk-acts">${c.ex ? `<button type="button" class="btn btn-primary btn-sm" onclick="blocEx('${b.id}',${i})">${c.ex.type === 'fiche' || c.ex.type === 'tuto' ? c.exl : 'S’exercer · ' + c.exl}</button>` : ''}
        ${c.song ? `<button type="button" class="btn btn-ghost btn-sm" onclick="lvStop();blocSong('${c.song.replace(/'/g, "\\'")}')">Essaie sur « ${c.song} »</button>` : ''}
        <button type="button" class="bk-done" onclick="blocToggleDone('${c.k}')" aria-pressed="${!!dn[c.k]}">${dn[c.k] ? 'Fait ✓' : 'Marquer fait'}</button></div></div>`).join('');
}

let lv = null;   // {el, k, t0, done (s écoulées avant pause), timers, paused}
const LV_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6a.6.6 0 00.92.5l10.6-6.8a.6.6 0 000-1L8.92 4.7A.6.6 0 008 5.2z" fill="currentColor"/></svg>';
function lvCard(k, ctx) {
  const v = LV[k];
  return `<div class="lv-wrap"><div class="lv" id="lv-${ctx}-${k}" data-k="${k}">
      <div class="lv-stage" onclick="lvToggle('lv-${ctx}-${k}')"></div>
      <button type="button" class="lv-big" onclick="lvPlay('lv-${ctx}-${k}')" aria-label="Lire la vidéo : ${esc(v.t)}">${LV_PLAY}<span>${esc(v.t)} · ${v.dur} s</span></button>
      <div class="lv-bar"><i></i></div>
      <button type="button" class="lv-fs" onclick="lvFull('lv-${ctx}-${k}')" aria-label="Plein écran"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div></div>`;
}
function lvSched(from) {
  const v = LV[lv.k];
  lv.timers = v.cues().filter(([t]) => t >= from).map(([t, fn]) => setTimeout(() => { try { fn(lv.el); } catch (e) {} }, (t - from) * 1000));
  lv.timers.push(setTimeout(() => { const el = lv.el; lvStop(true); el.classList.add('ended'); }, (v.dur - from) * 1000));
}
function lvPlay(id) {
  lvStop();
  const el = $(id); if (!el) return;
  const v = LV[el.dataset.k];
  audioReady();
  el.classList.remove('ended', 'paused'); el.classList.add('on');
  el.querySelector('.lv-stage').innerHTML = v.html();
  const bar = el.querySelector('.lv-bar i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = `lvBar ${v.dur}s linear forwards`;
  lv = {el, k: el.dataset.k, t0: performance.now(), done: 0, timers: [], paused: false};
  lvSched(0);
}
function lvToggle(id) {
  if (!lv || lv.el.id !== id) return;
  if (lv.paused) { lv.paused = false; lv.t0 = performance.now(); lv.el.classList.remove('paused'); lvSched(lv.done); }
  else { lv.paused = true; lv.done += (performance.now() - lv.t0) / 1000; lv.timers.forEach(clearTimeout); lv.el.classList.add('paused'); }
}
function lvStop(keep) {
  if (!lv) return;
  lv.timers.forEach(clearTimeout);
  if (!keep) { lv.el.classList.remove('on', 'paused'); const st = lv.el.querySelector('.lv-stage'); if (st) st.innerHTML = ''; }
  lv = null;
}
function lvFull(id) { const el = $(id); try { document.fullscreenElement ? document.exitFullscreen() : (el.requestFullscreen || el.webkitRequestFullscreen).call(el); } catch (e) { toast('Plein écran indisponible ici', true); } }
function renderAdmin() {
  const ks = Object.keys(LV);
  const bl = BLOCS.filter(b => b.cards.length).map((b, bi) => `<h3 class="ad-h">Débloque ton jeu · mur ${bi + 1} : ${esc(b.n)}</h3>` + b.cards.map(c =>
    `<div class="ad-it"><div class="ad-t"><b>${esc(c.t)}</b><small>${LV[c.k].dur} s</small></div>${lvCard(c.k, 'a')}</div>`).join('')).join('');
  $('admin-body').innerHTML = `<p class="ad-n">${ks.length} vidéos : les cours « Débloque ton jeu », puis « Comprendre en 2 minutes ». Plein écran pour les filmer.</p>` + bl + `<h3 class="ad-h">Comprendre · les cours</h3>` +
    COURS.map((l, i) => LV[l.k]
      ? `<div class="ad-it"><div class="ad-t"><b>Leçon ${i + 1} · ${esc(l.t)}</b><small>${LV[l.k].dur} s</small></div>${lvCard(l.k, 'a')}</div>`
      : `<div class="ad-it off"><div class="ad-t"><b>Leçon ${i + 1} · ${esc(l.t)}</b><small>à venir</small></div></div>`).join('');
}
function coursListHTML() {
  return `<button type="button" class="bk-back" onclick="go('blocs')"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Débloque ton jeu</button>
    <div class="bk-hero"><small>MUR 8</small><h2>Comprendre en 2 minutes</h2><p>« Pourquoi ces accords vont ensemble ? » Douze petits cours pour comprendre ce que tu joues.</p></div>
    <div class="cl-list">${COURS.map((l, i) =>
      `<button type="button" class="les" onclick="coursOpen('${l.k}')"><span class="les-n">${i + 1}</span><b>${l.t}</b>${LV[l.k] ? '<i class="les-v">▶ vidéo</i>' : ''}<small>${l.m} min</small></button>`).join('')}</div>`;
}
function coursList() { coursStop(); coursView = 'list'; go('cours'); }
function renderCours() {
  if (coursView === 'list') {
    $('cours-list').innerHTML = coursListHTML(); $('cours-body').innerHTML = '';
    $('cours-hero').innerHTML = ''; $('cours-map').innerHTML = '';
  } else {
    $('cours-hero').innerHTML = ''; $('cours-map').innerHTML = ''; $('cours-list').innerHTML = '';
    renderCoursLesson();
  }
}
function renderCoursLesson() {
  const i = COURS.findIndex(l => l.k === coursCur), l = COURS[i];
  const nav = `<div style="display:flex;justify-content:space-between;gap:8px;margin-top:22px;flex-wrap:wrap">
    ${i > 0 ? `<button type="button" class="btn btn-ghost btn-sm" onclick="coursOpen('${COURS[i-1].k}')">&#8592; ${COURS[i-1].t}</button>` : '<span></span>'}
    ${i < COURS.length - 1 ? `<button type="button" class="btn btn-primary btn-sm" onclick="coursOpen('${COURS[i+1].k}')">${COURS[i+1].t} &#8594;</button>` : ''}</div>`;
  $('cours-body').innerHTML = `<button type="button" class="btn btn-ghost btn-sm exo-back" onclick="coursList()">&#8592; Leçons</button><div class="pv-block on">
    <div class="pv-hdr"><div class="pv-dot"></div><div class="pv-name">Leçon ${i+1} / ${COURS.length} — ${l.t}</div></div>
    <div class="pv-body">${LV[l.k] ? lvCard(l.k, 'c') : ''}${l.f()}${practiceChips(l.k)}${nav}</div></div>`;
}
function coursOpen(k) {
  coursStop();
  coursCur = k; coursView = 'lesson';
  renderCours();
  const top = $('cours-body').getBoundingClientRect().top + window.scrollY - 80;
  if (window.scrollY > top) window.scrollTo(0, top);
}


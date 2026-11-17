/* ═══════ EXERCICES — entraînement ciblé + parcours guidé ═══════
   Senior note: exercises are data (EXOS) rendered by one detail view; the
   visuals are small declarative blocks (tab / strum / chords / fretboard /
   tool) so adding an exercise never means writing UI code. The tab notation
   is a tiny DSL: "s.fret" per note (s = 1 high e … 6 low E), "+" stacks
   notes, "@x" puts a label under the column, "h p / \" between two columns
   draw hammer, pull-off and slides, "-" is a rest and "|" a bar line.
   Progress lives in IndexedDB (meta store, key "exo"). */
let exoProg = {done:{}, best:{}, hist:{}, path:{}, path2:{}, log:[]};   // path = ancien parcours (gardé pour la compatibilité), path2 = Parcours guidé v2
function exoSave() { try { DB.put('meta', {k:'exo', v:exoProg}); } catch (e) {} }
const dayStr = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = () => dayStr(new Date());
function exoLog(id) {
  const d = today();
  if (!exoProg.log.some(l => l.d === d && l.id === id)) exoProg.log.push({d, id});
  if (exoProg.log.length > 3000) exoProg.log.shift();
}
function exoStreak() {
  const days = new Set(exoProg.log.map(l => l.d)), dt = new Date();
  let n = 0;
  if (!days.has(dayStr(dt))) dt.setDate(dt.getDate() - 1);
  while (days.has(dayStr(dt))) { n++; dt.setDate(dt.getDate() - 1); }
  return n;
}

/* ── axes d'amélioration ── */
const AXES = [
  {k:'warm',    n:'Main gauche & échauffement', d:'Indépendance, précision et force des doigts', c:'var(--gold)'},
  {k:'changes', n:'Changements d’accords',      d:'Le blocage n°1 : passer d’un accord à l’autre sans casser le rythme', c:'var(--terra)'},
  {k:'rhythm',  n:'Rythme & main droite',       d:'Grattage régulier, accents, groove', c:'var(--sage)'},
  {k:'timing',  n:'Timing & tempo',             d:'Jouer en place et accélérer proprement', c:'var(--mauve)'},
  {k:'arp',     n:'Arpèges & fingerpicking',    d:'Faire chanter les accords note par note', c:'var(--gold2)'},
  {k:'fx',      n:'Effets de style',            d:'Liés, glissés, tirés, vibrato : l’expression', c:'var(--terra)'},
  {k:'neck',    n:'Manche, gammes & impro',     d:'Se repérer sur le manche et improviser', c:'var(--sage)'},
  {k:'ear',     n:'Oreille & musicalité',       d:'Entendre, chanter, nuancer', c:'var(--mauve)'},
];
const AXIS = Object.fromEntries(AXES.map(a => [a.k, a]));

/* ── tab generators ── */
const rep = (tok, n) => Array(n).fill(tok).join(' ');
const spiderTab = (perm, start) => [6,5,4,3,2,1].map(s => perm.split('').map(d => `${s}.${start + +d - 1}@${d}`).join(' ')).join(' | ');
const pentaTab = f => {
  const up = [[6,0],[6,3],[5,0],[5,2],[4,0],[4,2],[3,0],[3,2],[2,0],[2,3],[1,0],[1,3]];
  const tok = ([s, o]) => `${s}.${f + o}`;
  return up.map(tok).join(' ') + ' | ' + up.slice().reverse().map(tok).join(' ');
};
const mkChord = (name, frets, fingers, sub) => ({id:uid(), name, frets, fingers, base:1, arp:[], sub});

/* ── catalogue ── */
const EXOS = [
  {id:'spider', ax:'warm', lvl:1, dur:'5 min', bpm:[50,100], course:'notes', n:'L’araignée 1-2-3-4',
   why:'L’exercice chromatique le plus classique : <b>un doigt par case</b>. Il développe l’indépendance des doigts, la précision et la synchronisation des deux mains. C’est l’échauffement de référence de la plupart des méthodes.',
   steps:['Place la main « en position » : index case 1, majeur case 2, annulaire case 3, auriculaire case 4.','Joue 1-2-3-4 sur la corde de Mi grave, puis sur chaque corde jusqu’au Mi aigu, puis redescends.','Au médiator : alterne bas-haut à chaque note (aller-retour strict).','Laisse chaque doigt posé jusqu’à ce que le suivant joue.','Quand c’est propre 3 fois de suite, monte de 4 BPM.'],
   errors:['Doigts qui s’envolent loin du manche : garde-les à moins d’un centimètre.','Pouce crispé derrière le manche : il sert juste d’appui, relâche-le.','Accélérer avant d’être propre : la vitesse vient de la précision.'],
   ok:'Des croches nettes, sans frisure, à 80 BPM.',
   v:[{t:'tab', n:'Montée (le chiffre sous la note = le doigt)', tab:spiderTab('1234', 1)}]},
  {id:'perm', ax:'warm', lvl:2, dur:'5 min', bpm:[50,100], course:'notes', n:'Permutations de doigts',
   why:'Variante avancée de l’araignée : changer l’ordre des doigts (1-3-2-4, 1-4-2-3…) casse les automatismes et renforce les doigts faibles, l’annulaire et l’auriculaire. Il existe <b>24 combinaisons</b> : travailles-en une ou deux par jour.',
   steps:['Choisis une permutation et une case de départ (la case 5 est plus confortable : cases plus étroites).','Joue-la sur les 6 cordes, aller-retour au médiator.','Les doigts qui ne jouent pas restent au-dessus de leur case.','Change de permutation chaque jour.'],
   errors:['L’auriculaire qui se replie sous le manche : garde-le arrondi, prêt à jouer.'],
   ok:'Chaque permutation aussi fluide que 1-2-3-4.',
   v:[{t:'tool', k:'perm'}]},
  {id:'barre', ax:'warm', lvl:2, dur:'5 min', bpm:null, course:'barre', n:'Le barré progressif (vers le F)',
   why:'Le barré est le grand mur des débutants. La progression recommandée par les professeurs : <b>réduire l’accord</b> (mini-F), puis ajouter les cordes une à une, et travailler la pression plus haut sur le manche, là où c’est plus facile.',
   steps:['Commence par le Fmaj7 : 3 doigts, aucune barre.','Puis le mini-F : l’index barre seulement les 2 cordes aiguës.','Puis le F à 5 cordes, puis le F complet.','Presse / relâche : barre à la case 5, appuie 2 temps, relâche 2 temps sans quitter les cordes, pendant 1 minute.','Index légèrement tourné sur sa tranche, coude détendu : c’est le poids du bras qui tire, pas le pouce qui serre.'],
   errors:['Serrer avec le pouce : douleur et fatigue en 30 secondes.','Index pile sur la frette ou trop loin : place-le juste derrière.'],
   ok:'Chaque corde du F sonne quand tu les joues une par une.',
   v:[{t:'chords', n:'Les 4 marches vers le F', list:[mkChord('Fmaj7',[-1,-1,3,2,1,0],[0,0,3,2,1,0],'Marche 1 : sans barre'), mkChord('F (mini)',[-1,-1,3,2,1,1],[0,0,3,2,1,1],'Marche 2 : mini-barre'), mkChord('F (5 cordes)',[-1,3,3,2,1,1],[0,3,4,2,1,1],'Marche 3'), mkChord('F',[1,3,3,2,1,1],[1,3,4,2,1,1],'Marche 4 : le vrai F')]}]},

  {id:'omc', ax:'changes', lvl:1, dur:'3 min', bpm:null, course:'build', n:'One Minute Changes',
   why:'Méthode popularisée par Justin Sandercoe (JustinGuitar) et reprise par énormément de profs : compter combien de fois tu passes d’un accord à l’autre en <b>60 secondes</b>. Objectif clair, progrès mesurables : c’est le moyen le plus rapide de fluidifier les changements.',
   steps:['Choisis une paire d’accords.','Lance le chrono et alterne : accord 1, un coup de grattage, accord 2, un coup… vite MAIS proprement.','Compte chaque changement réussi.','Note ton score : bats-le demain.','2 ou 3 paires par jour, pas plus.'],
   errors:['Gratter des accords qui frisent pour aller plus vite : un changement sale ne compte pas.','Poser les doigts un par un : apprends à poser la forme « en bloc ».'],
   ok:'30 changements par minute : jouable dans une chanson lente. 60 : fluide.',
   v:[{t:'tool', k:'omc'}]},
  {id:'anchor', ax:'changes', lvl:1, dur:'5 min', bpm:[60,100], course:'dissect', n:'Doigts pivots et doigts guides',
   why:'Entre deux accords, certains doigts <b>ne bougent pas</b> (pivots), d’autres <b>glissent sur la même corde</b> (guides), parfois toute la forme se décale d’une corde. Les repérer divise l’effort par deux.',
   steps:['Choisis une paire : l’appli analyse les deux positions.','Fais le changement au ralenti en gardant le pivot appuyé, ou le guide en contact avec la corde.','Puis 4 coups par accord, au métronome.','Monte le tempo quand le changement tombe pile sur le « 1 ».'],
   errors:['Lever tous les doigts « par réflexe » alors que l’un d’eux peut rester.'],
   ok:'Le pivot ne quitte jamais la corde.',
   v:[{t:'tool', k:'anchor'}]},
  {id:'silent', ax:'changes', lvl:2, dur:'5 min', bpm:[60,100], course:'tension', n:'La dernière croche « à vide »',
   why:'L’astuce de tous les guitaristes d’accompagnement : sur le dernier « et » de la mesure, on gratte les cordes à vide pendant que la main gauche part vers l’accord suivant. <b>Le rythme ne s’arrête jamais</b>, et l’oreille ne remarque rien.',
   steps:['Joue le rythme D – DU – UDU sur G.','Sur le tout dernier coup (vers le haut), lâche l’accord : ta main est déjà en route.','Pose C pile sur le « 1 » suivant.','Boucle G – C, puis G – D – Em – C.'],
   errors:['Ralentir le grattage pendant le changement : c’est la main droite qui commande, elle ne s’arrête jamais.'],
   ok:'2 minutes de boucle sans la moindre hésitation rythmique.',
   v:[{t:'strum', pat:'D-DU-UDU', chords:['G','C'], n:'Change sur le dernier ↑'}]},

  {id:'down4', ax:'rhythm', lvl:1, dur:'5 min', bpm:[60,100], course:'build', n:'Les noires vers le bas',
   why:'La base absolue : <b>4 coups réguliers par mesure</b>, pile sur le clic. C’est ce qui permet à n’importe qui de jouer avec toi.',
   steps:['Accord de Em, puis G.','Gratte vers le bas sur 1, 2, 3, 4 en comptant à voix haute.','Entre deux coups, la main remonte sans toucher les cordes (flèches pâles).','Change d’accord à chaque mesure.'],
   errors:['Gratter avec tout le bras : le geste vient du poignet et de l’avant-bras, souple.','Taper trop fort : vise un son égal, pas puissant.'],
   ok:'1 minute pile sur le métronome à 80 BPM, sans décalage.',
   v:[{t:'strum', pat:'D-D-D-D-', chords:['Em','G']}]},
  {id:'motion', ax:'rhythm', lvl:1, dur:'5 min', bpm:[60,110], course:'colors', n:'Le balancier (mouvement constant)',
   why:'Le principe n°1 du grattage : la main droite fait un <b>aller-retour permanent</b>, comme un pendule. Bas sur les temps, haut sur les « et ». Ensuite, il suffit de toucher ou de rater les cordes pour créer n’importe quel rythme.',
   steps:['Gratte D U D U en croches, accent léger sur les D.','Garde exactement la même amplitude pour tous les coups.','Puis rate volontairement certains coups (fantômes) sans arrêter le mouvement.'],
   errors:['Coups vers le haut trop appuyés : ils ne touchent que les 3-4 cordes aiguës.'],
   ok:'Le bras ne s’arrête jamais, même quand il ne touche pas les cordes.',
   v:[{t:'strum', pat:'DuDuDuDu', chords:['C','Am']}]},
  {id:'oldfaithful', ax:'rhythm', lvl:1, dur:'5 min', bpm:[60,110], course:'progs', n:'Le rythme universel D – DU – UDU',
   why:'Le rythme pop / folk le plus utilisé (surnommé « Old Faithful » par JustinGuitar). Il contient la <b>syncope</b> essentielle : le coup manqué sur le 3. Il fonctionne sur des centaines de chansons.',
   steps:['Dis-le à voix haute : « 1, 2 et, et 4 et ».','Le balancier ne s’arrête pas : sur le « et » du 1 et sur le 3, la main passe sans toucher.','D’abord un seul accord, puis 2 accords (un par mesure).'],
   errors:['Arrêter la main sur le coup manqué : ça casse le groove.'],
   ok:'Tu peux le jouer en parlant d’autre chose.',
   v:[{t:'strum', pat:'D-DU-UDU', chords:['G','D']}]},
  {id:'accent', ax:'rhythm', lvl:2, dur:'5 min', bpm:[70,120], course:'progs', n:'Accents sur 2 et 4 (backbeat)',
   why:'En pop, rock et funk, la caisse claire frappe les temps <b>2 et 4</b>. Les accentuer à la guitare donne instantanément du groove.',
   steps:['Croches D U D U, très léger partout.','Coup fort sur 2 et 4.','Puis l’inverse (accents sur 1 et 3) pour sentir la différence : bien plus « marche militaire ».'],
   errors:['Accélérer sur les accents.'],
   ok:'On entend clairement deux niveaux de volume.',
   v:[{t:'strum', pat:'duDuduDu', chords:['Am','F']}]},
  {id:'chuck', ax:'rhythm', lvl:2, dur:'5 min', bpm:[60,100], course:'progs', n:'Le « chuck » (grattage percussif)',
   why:'Étouffer les cordes avec la paume sur 2 et 4 imite la caisse claire. Indispensable en guitare acoustique solo (pop acoustique, reggae).',
   steps:['Gratte vers le bas en posant immédiatement la paume sur les cordes : son sec « tchak ».','Pattern : D U ✕ U D U ✕ U.','Lentement : frapper et étouffer doivent devenir un seul geste.'],
   errors:['Étouffer seulement avec la main gauche : le son est moins percussif.'],
   ok:'Le ✕ sonne comme une caisse claire, sans note.',
   v:[{t:'strum', pat:'DUXUDUXU', chords:['Em','C']}]},
  {id:'pm', ax:'rhythm', lvl:2, dur:'5 min', bpm:[70,140], course:'barre', n:'Palm mute & power chords',
   why:'Le palm mute (tranche de la main posée sur les cordes, près du chevalet) est la base du son rock et punk. Avec les <b>power chords</b> (fondamentale + quinte), c’est l’accompagnement rock par excellence.',
   steps:['Power chord : index sur la fondamentale, annulaire 2 cases plus loin sur la corde suivante.','Pose la tranche de la main droite juste devant le chevalet.','Croches vers le bas : son étouffé, mais la note reste audible.','Relâche le palm mute sur certains temps pour créer du contraste.'],
   errors:['Main trop loin du chevalet : plus aucune note.','Main trop près : aucun effet.'],
   ok:'8 croches régulières par mesure à 120 BPM.',
   v:[{t:'tab', n:'E5 – G5 – A5 en palm mute', tab:rep('6.0+5.2@PM', 8) + ' | ' + rep('6.3+5.5@PM', 4) + ' ' + rep('5.0+4.2@PM', 4)}]},

  {id:'subdiv', ax:'timing', lvl:1, dur:'5 min', bpm:[60,100], course:'intervals', n:'Les subdivisions',
   why:'Les profs de rythme commencent tous par là : diviser le temps en 1, 2, 3 ou 4 et <b>compter à voix haute</b> (« 1 et 2 et », « 1 e et a »). C’est la base de la lecture rythmique et du groove.',
   steps:['Lance les noires et frappe dans tes mains (ou joue une corde étouffée).','Passe aux croches sans changer le tempo : le temps reste au même endroit.','Puis triolets, puis doubles croches.','Défi : change de subdivision toutes les 2 mesures.'],
   errors:['Le tempo qui accélère quand les notes deviennent plus rapides.'],
   ok:'Tu enchaînes les 4 subdivisions sans que le temps bouge.',
   v:[{t:'tool', k:'subdiv'}]},
  {id:'gap', ax:'timing', lvl:2, dur:'5 min', bpm:[60,100], course:'progs', n:'Le clic qui disparaît',
   why:'Exercice de batteurs repris par les guitaristes : le métronome joue quelques mesures, puis <b>se tait</b>. Tu continues seul. Quand il revient, tu sais tout de suite si tu as accéléré ou ralenti. C’est le meilleur test d’horloge interne.',
   steps:['Choisis un rythme simple que tu maîtrises (D – DU – UDU par exemple).','Lance le clic : 2 mesures audibles, 2 muettes.','Continue à jouer pendant le silence.','Puis 1 / 3 : le silence s’allonge.'],
   errors:['Accélérer pendant le silence (extrêmement courant !).'],
   ok:'Le clic retombe pile avec toi après le silence.',
   v:[{t:'tool', k:'gap'}]},
  {id:'ladder', ax:'timing', lvl:2, dur:'5 à 10 min', bpm:[60,140], course:'notes', n:'L’échelle de tempo',
   why:'La méthode reconnue pour gagner en vitesse sans perdre en propreté : on ne monte que quand c’est parfait, par <b>petits paliers</b>. Le cerveau apprend le geste lent et propre, puis l’accélère.',
   steps:['Trouve le tempo où tu joues l’exercice 100 % propre.','3 répétitions parfaites → +4 BPM.','Une erreur → on reste. Deux erreurs → −8 BPM.','Enregistre ton record avec le bouton « Propre à ce tempo ».','Termine toujours 10 BPM sous ton record, propre et détendu.'],
   errors:['Rester bloqué au tempo maximum en jouant sale : c’est la saleté qu’on mémorise.'],
   ok:'+10 à 20 BPM par semaine, sans tension.',
   v:[{t:'tab', n:'Support : 1-2-3-4-4-3-2-1 en doubles croches', tab:'1.5@1 1.6@2 1.7@3 1.8@4 1.8@4 1.7@3 1.6@2 1.5@1 | 2.5@1 2.6@2 2.7@3 2.8@4 2.8@4 2.7@3 2.6@2 2.5@1', sub:4}]},

  {id:'pima', ax:'arp', lvl:1, dur:'5 min', bpm:[50,100], course:'dissect', n:'Arpège p-i-m-a',
   why:'La base de la main droite classique (les 120 études de Giuliani en dérivent) : <b>p</b> = pouce sur les basses, <b>i, m, a</b> = index, majeur, annulaire sur les cordes G, B et e. Chaque doigt a sa corde.',
   steps:['Pouce sur la corde de la fondamentale (la 5 pour Am et C).','Index sur G, majeur sur B, annulaire sur e : ils restent attribués.','Joue p-i-m-a, régulier, chaque note au même volume.','Puis les variantes p-a-m-i et p-i-m-a-m-i.','Laisse sonner : ne touche pas les cordes qui vibrent.'],
   errors:['Le poignet qui bouge : seuls les doigts travaillent.','Le pouce qui rentre dans la main : il reste devant les doigts.'],
   ok:'4 notes de même volume à 80 BPM.',
   v:[{t:'tab', n:'p-i-m-a sur Am', tab:'5.0@p 3.2@i 2.1@m 1.0@a | 5.0@p 3.2@i 2.1@m 1.0@a'},
      {t:'tab', n:'p-a-m-i sur Am', tab:'5.0@p 1.0@a 2.1@m 3.2@i | 5.0@p 1.0@a 2.1@m 3.2@i'},
      {t:'tab', n:'p-i-m-a-m-i sur C', tab:'5.3@p 3.0@i 2.1@m 1.0@a 2.1@m 3.0@i | 5.3@p 3.0@i 2.1@m 1.0@a 2.1@m 3.0@i', sub:3}]},
  {id:'pickarp', ax:'arp', lvl:1, dur:'5 min', bpm:[50,100], course:'dissect', n:'Arpège au médiator en 6/8',
   why:'Arpéger une grille au médiator, corde par corde, en 6/8 : c’est l’accompagnement de <b>House of the Rising Sun</b>, et un excellent exercice de précision (viser la bonne corde).',
   steps:['La basse de l’accord, puis 3 cordes en montant, puis 2 en redescendant.','Compte « 1 2 3 4 5 6 », accent léger sur 1 et 4.','Am – C – D – F : un accord par mesure.','Garde les doigts de la main gauche posés toute la mesure.'],
   errors:['Regarder la main droite en permanence : apprends à sentir les cordes.'],
   ok:'La grille en boucle sans rater une corde.',
   v:[{t:'tab', n:'Am – C – D – F', sub:3, tab:'5.0 4.2 3.2 2.1 3.2 4.2 | 5.3 4.2 3.0 2.1 3.0 4.2 | 4.0 3.2 2.3 1.2 2.3 3.2 | 4.3 3.2 2.1 1.1 2.1 3.2'}]},
  {id:'travis', ax:'arp', lvl:3, dur:'10 min', bpm:[50,100], course:'inv', n:'Travis picking (basse alternée)',
   why:'Le style de Merle Travis, la technique fingerstyle folk / country la plus connue : le pouce joue une <b>basse alternée</b> régulière comme une contrebasse, les doigts posent les notes aiguës entre deux.',
   steps:['Étape 1 : pouce seul sur C, cordes 5 – 4 – 6 – 4 en noires. Il doit devenir automatique.','Étape 2 : ajoute le majeur sur la corde 2, sur le « et » du 1.','Étape 3 : pattern complet, majeur et index alternés sur les « et ».','Ne change rien au pouce quand les doigts s’ajoutent !'],
   errors:['Le pouce qui suit les doigts et perd sa régularité.'],
   ok:'Pouce métronomique pendant 2 minutes, doigts libres.',
   v:[{t:'tab', n:'Étape 1 : pouce seul sur C', tab:'5.3@p - 4.2@p - 6.3@p - 4.2@p -'},
      {t:'tab', n:'Pattern complet sur C', tab:'5.3@p 2.1@m 4.2@p 3.0@i 6.3@p 2.1@m 4.2@p 3.0@i'},
      {t:'tab', n:'Même pattern sur G', tab:'6.3@p 1.3@m 4.0@p 3.0@i 5.2@p 1.3@m 4.0@p 3.0@i'}]},

  {id:'hammer', ax:'fx', lvl:1, dur:'5 min', bpm:[50,100], course:'notes', n:'Hammer-on & pull-off (liés)',
   why:'Les deux techniques de base du legato : frapper (<b>hammer-on</b>, h) ou arracher (<b>pull-off</b>, p) une note avec la main gauche, sans rejouer de la main droite. Fluide, rapide, expressif : du folk au métal.',
   steps:['Hammer : joue la case 5, puis « martèle » la case 7 avec l’annulaire, sec et précis, juste derrière la frette.','Pull-off : les deux doigts posés, joue la 7 et tire l’annulaire légèrement vers le bas pour pincer la corde : la 5 sonne.','Les deux notes doivent avoir presque le même volume.','Trille : enchaîne h-p-h-p en rythme.'],
   errors:['Hammer trop mou : la deuxième note est faible.','Pull-off en soulevant simplement le doigt : il faut accrocher la corde.'],
   ok:'Trille régulière en croches à 80 BPM, volume égal.',
   v:[{t:'tab', n:'Hammer puis pull-off', tab:'3.5@1 h 3.7@3 - - | 3.7@3 p 3.5@1 - - | 2.5 h 2.7 - - | 2.7 p 2.5 - -'},
      {t:'tab', n:'Sur cordes à vide', tab:'1.0 h 1.2 1.0 h 1.3 | 1.3 p 1.0 1.2 p 1.0'},
      {t:'tab', n:'Trille', tab:'3.5 h 3.7 p 3.5 h 3.7 p 3.5 h 3.7 p 3.5 h 3.7'}]},
  {id:'slide', ax:'fx', lvl:1, dur:'5 min', bpm:[50,90], course:'notes', n:'Les glissés (slides)',
   why:'Glisser d’une case à l’autre <b>sans relâcher la pression</b> : l’effet chanté par excellence, et un moyen élégant de changer de position.',
   steps:['Joue la case 5, garde la pression et glisse jusqu’à la 7 : on doit entendre l’arrivée.','Pression constante, mais sans écraser.','Glisse dans les deux sens, puis sur de grandes distances (4 → 9).','Arrive pile en rythme sur la note d’arrivée.'],
   errors:['Relâcher pendant le glissé : la note s’éteint.'],
   ok:'La note d’arrivée sonne autant que celle de départ.',
   v:[{t:'tab', n:'Glissés montants et descendants', tab:'4.5 / 4.7 - - | 4.7 \\ 4.5 - - | 3.4 / 3.9 - - | 2.10 \\ 2.5 - -'}]},
  {id:'combo', ax:'fx', lvl:2, dur:'5 min', bpm:[50,90], course:'dissect', n:'Arpège + hammer-on (embellissement)',
   why:'Le fameux <b>effet de style folk</b> : dans un arpège, une note est jouée à vide puis martelée vers sa case. Ça donne vie à l’accord sans en changer (James Taylor, Simon & Garfunkel…).',
   steps:['Maîtrise d’abord l’arpège simple de C.','Sur la corde D : joue-la à vide, puis hammer case 2 (la note normale de l’accord).','Garde la basse et le rythme réguliers.','Même chose sur Am, puis sur Em (corde A : 0 h 2).'],
   errors:['Le hammer qui arrive en retard et décale tout l’arpège.'],
   ok:'Le hammer s’entend clairement sans casser le rythme.',
   v:[{t:'tab', n:'Sur C', tab:'5.3@p 4.0 h 4.2 3.0@i 2.1@m 3.0@i 4.2 3.0'},
      {t:'tab', n:'Sur Am', tab:'5.0@p 4.0 h 4.2 3.2@i 2.1@m 3.2@i 4.2 3.2'},
      {t:'tab', n:'Sur Em', tab:'6.0@p 5.0 h 5.2 3.0@i 2.0@m 3.0@i 5.2 3.0'}]},
  {id:'bend', ax:'fx', lvl:2, dur:'5 min', bpm:[60,80], course:'intervals', n:'Les tirés justes (bends)',
   why:'Tirer la corde pour monter la note : la voix de la guitare blues et rock. Le piège, c’est un bend faux. La méthode standard : <b>jouer la note cible d’abord</b>, puis l’atteindre en tirant.',
   steps:['Joue la note cible (case 9, corde G) et écoute-la.','Joue la case 7 avec l’annulaire, soutenu par le majeur et l’index posés derrière.','Pousse la corde vers le haut jusqu’à la note cible.','Compare : cible, bend, cible.','Vérifie avec l’accordeur de l’appli si besoin.'],
   errors:['Tirer avec un seul doigt : ni force ni contrôle.','Bend trop bas (le plus fréquent) : la note sonne « fausse ».'],
   ok:'Le bend atteint exactement la cible 9 fois sur 10.',
   v:[{t:'tab', n:'Cible, puis tiré (7b9 = case 7 tirée jusqu’au son de la 9)', tab:'3.9@cible - 3.7b9@tiré - | 2.10@cible - 2.8b10@tiré -'}]},
  {id:'vibrato', ax:'fx', lvl:2, dur:'5 min', bpm:[60,90], course:'notes', n:'Le vibrato régulier',
   why:'Le vibrato (petits bends répétés) est la signature d’un guitariste. Le travailler <b>en rythme</b>, comme on l’enseigne en cours de guitare solo, le rend contrôlé au lieu de nerveux.',
   steps:['Note case 8 sur la corde B (majeur ou annulaire).','Petits bends réguliers : le geste vient du poignet, comme tourner une poignée de porte.','D’abord 2 oscillations par temps (croches), puis 3, puis 4.','Variantes : large et lent (blues), étroit et rapide (rock).'],
   errors:['Vibrato qui fait baisser la note : on monte et on revient, jamais en dessous.'],
   ok:'Oscillations régulières, calées sur le clic.',
   v:[{t:'tab', n:'Notes tenues avec vibrato (~)', tab:'2.8~@~ - - - | 3.7~@~ - - - | 1.5~@~ - - -'}]},

  {id:'notefind', ax:'neck', lvl:1, dur:'5 min', bpm:null, course:'notes', n:'La note du jour',
   why:'Exercice recommandé par la plupart des profs pour apprendre le manche : <b>une seule note par jour</b>, à trouver sur toutes les cordes. En une semaine, tu connais toutes les notes naturelles.',
   steps:['Tire une note.','Trouve-la sur chaque corde, du Mi grave au Mi aigu, en la disant à voix haute.','Puis en redescendant.','Utilise les repères : case 5 = corde suivante, case 12 = octave.','Vérifie avec « Révéler ».'],
   errors:['Compter les cases depuis zéro à chaque fois : mémorise les repères (5, 7, 12).'],
   ok:'Les 6 positions en moins de 20 secondes.',
   v:[{t:'tool', k:'notefind'}]},
  {id:'majscale', ax:'neck', lvl:1, dur:'5 min', bpm:[50,100], course:'key', n:'Gamme de Do majeur (position ouverte)',
   why:'La gamme majeure est le mètre étalon de la théorie : connaître sa forme fait comprendre les tonalités, les accords et les mélodies. On commence par Do : <b>que des notes naturelles</b>.',
   steps:['Joue lentement en disant les notes : Do Ré Mi Fa Sol La Si Do.','Un doigt par case : case 1 = index, 2 = majeur, 3 = annulaire.','Monte et redescends, aller-retour au médiator.','Repère les demi-tons E–F et B–C : une seule case d’écart.'],
   errors:['Jouer sans dire les notes : tu perds la moitié de l’intérêt.'],
   ok:'Montée et descente fluides à 80 BPM en croches.',
   v:[{t:'tab', n:'Montée et descente', tab:'5.3@C 4.0@D 4.2@E 4.3@F 3.0@G 3.2@A 2.0@B 2.1@C | 2.1 2.0 3.2 3.0 4.3 4.2 4.0 5.3'},
      {t:'fret', n:'Toutes les notes de Do majeur en position ouverte', pcs:[0,2,4,5,7,9,11], root:0, range:[0,3]}]},
  {id:'penta', ax:'neck', lvl:2, dur:'5 min', bpm:[60,120], course:'progs', n:'Pentatonique mineure (position 1)',
   why:'LA gamme du rock et du blues : 5 notes, et presque aucune « fausse note » possible sur un accompagnement dans la même tonalité. La position 1 (la « box ») est la première que tout le monde apprend.',
   steps:['Index sur la case 5 (La), annulaire ou auriculaire sur les cases 7-8.','Monte et descends, aller-retour au médiator.','Repère les fondamentales (La, en doré) : ce sont tes points de repos.','Puis en triolets, puis par groupes de 3 notes.'],
   errors:['Jouer la gamme « comme un exercice » sans jamais en faire de la musique : passe vite à l’impro.'],
   ok:'Montée et descente propres en doubles croches à 70 BPM.',
   v:[{t:'tab', n:'La mineur pentatonique, case 5', tab:pentaTab(5)},
      {t:'fret', n:'La « box » sur le manche', pcs:[9,0,2,4,7], root:9, range:[5,8]}]},
  {id:'impro', ax:'neck', lvl:2, dur:'10 min', bpm:[80,110], course:'progs', n:'Impro sur le groupe',
   why:'Improviser tôt, avec des <b>contraintes</b>, est l’approche moderne recommandée. Tu joues avec la batterie et la basse de l’appli (mode impro du métronome), en pentatonique.',
   steps:['Lance le groupe dans la tonalité choisie.','Contrainte 1 : seulement 2 notes, fais du rythme avec.','Contrainte 2 : question / réponse, 2 mesures de phrase puis 2 mesures de silence.','Contrainte 3 : termine chaque phrase sur une fondamentale (en doré).','Ajoute bends, glissés et vibrato appris dans les exercices d’effets.'],
   errors:['Jouer sans arrêt : le silence fait partie de la phrase.'],
   ok:'Des phrases qui respirent et finissent sur la fondamentale.',
   v:[{t:'tool', k:'impro'}]},

  {id:'earint', ax:'ear', lvl:1, dur:'5 min', bpm:null, course:'intervals', n:'Reconnaître les intervalles',
   why:'L’entraînement d’oreille classique des écoles de musique : reconnaître la distance entre deux notes. Commence par <b>tierce mineure / majeure</b> (le cœur des accords), puis ajoute quinte et octave.',
   steps:['Écoute, devine, vérifie.','Associe chaque intervalle à un début de chanson que tu connais.','5 minutes par jour suffisent.'],
   errors:['Vouloir tout reconnaître d’un coup : un niveau à la fois.'],
   ok:'90 % de bonnes réponses sur un niveau avant de passer au suivant.',
   v:[{t:'tool', k:'earint'}]},
  {id:'earchords', ax:'ear', lvl:1, dur:'5 min', bpm:null, course:'ear', n:'Reconnaître les types d’accords',
   why:'Majeur, mineur, 7… les reconnaître à l’oreille permet de <b>relever des morceaux seul</b> et de comprendre ce que tu entends.',
   steps:['Ouvre le quiz de la leçon « Entraîner l’oreille ».','Niveau 1 : majeur / mineur uniquement.','Passe au niveau suivant à 9 bonnes réponses sur 10.'],
   errors:['Chercher les notes une par une : écoute la couleur globale (lumineux, sombre, tendu…).'],
   ok:'Majeur / mineur sans hésitation.',
   v:[{t:'tool', k:'earchords'}]},
  {id:'tune5', ax:'ear', lvl:1, dur:'5 min', bpm:null, course:'notes', n:'Accorder à l’oreille (case 5)',
   why:'La méthode traditionnelle : la case 5 d’une corde donne la note de la corde suivante (case 4 pour G → B). Elle entraîne l’oreille à entendre les <b>battements</b> quand deux notes sont presque justes.',
   steps:['Accorde le Mi grave avec la référence ci-dessous (ou l’accordeur).','Case 5 du Mi grave = La à vide : ajuste la corde de La jusqu’à ce que les battements (« wouah-wouah ») disparaissent.','Case 5 du La = Ré, case 5 du Ré = Sol, case 4 du Sol = Si, case 5 du Si = Mi.','Vérifie avec l’accordeur.'],
   errors:['Tourner la mauvaise clé : pince la corde en tournant pour entendre le changement.'],
   ok:'Plus aucun battement entre les paires.',
   v:[{t:'tool', k:'tuneref'}]},
  {id:'sing', ax:'ear', lvl:2, dur:'5 min', bpm:[60,90], course:'build', n:'Chanter en jouant',
   why:'Chanter (même doucement, même faux) la fondamentale ou la mélodie pendant que tu joues relie <b>l’oreille aux doigts</b>. C’est aussi la seule façon d’accompagner une chanson.',
   steps:['Joue un accord et fredonne sa note la plus grave.','Grattage en noires + une note longue chantée par accord.','Puis la mélodie d’une chanson simple à 2 accords.','Si la main droite s’arrête quand tu chantes : simplifie le rythme (noires).'],
   errors:['Ralentir le rythme pour suivre la voix : c’est la guitare qui tient le tempo.'],
   ok:'Le grattage reste régulier pendant que tu chantes.',
   v:[{t:'strum', pat:'D-D-D-D-', chords:['G','C','D','G'], n:'Une note chantée par mesure'}]},
  {id:'dyn', ax:'ear', lvl:2, dur:'5 min', bpm:[70,100], course:'colors', n:'Les nuances (dynamique)',
   why:'Ce qui distingue un musicien d’un débutant : jouer <b>doux puis fort</b>. Un couplet doux et un refrain plein, c’est déjà une interprétation.',
   steps:['Même rythme pendant 8 mesures.','Mesures 1-2 très doux, en grattant près du manche ; 3-4 moyen ; 5-8 fort, près du chevalet.','Puis l’inverse (decrescendo).','Le tempo ne doit PAS accélérer quand tu joues plus fort.'],
   errors:['Accélérer en jouant fort, ralentir en jouant doux.'],
   ok:'4 niveaux de volume nets, tempo stable.',
   v:[{t:'strum', pat:'DUDUDUDU', chords:['C','G']}]},
];
const EXO = Object.fromEntries(EXOS.map(e => [e.id, e]));

/* ── state ── */
let exoMode = 'feel', exoCur = null, exoAxis = 'all';
const exoBpm = {};
const exoSt = {perm:{p:'1324', f:5}, omc:{pair:'Em-Am', left:60, phase:'idle'}, anchor:'C-Am', nf:{pc:null, show:false},
  ei:{lvl:0, cur:null, ok:0, n:0, fb:''}, gap:0, impro:0, openStep:null};
const exoBpmOf = id => exoBpm[id] || exoProg.best[id] || (EXO[id] && EXO[id].bpm ? EXO[id].bpm[0] : 70);

/* ── looping player (tabs, strums, subdivisions) ── */
let exoTimer = null, exoPlaying = null, omcTimer = null;
const PLAY_HTML = '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21"/></svg> Jouer en boucle';
const STOP_HTML = '<svg class="ico" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/></svg> Stop';
function exoStop() {
  if (exoTimer) clearInterval(exoTimer);
  exoTimer = null;
  if (exoPlaying) { const b = $('pb-' + exoPlaying); if (b) b.innerHTML = PLAY_HTML; }
  exoPlaying = null;
  document.querySelectorAll('.exo-now').forEach(e => e.classList.remove('exo-now'));
  document.querySelectorAll('.tab-cur').forEach(e => e.setAttribute('opacity', '0'));
  if (omcTimer) { clearInterval(omcTimer); omcTimer = null; exoSt.omc.phase = 'idle'; exoSt.omc.left = 60; }
}
function exoLoop(id, stepSec, tick) {
  if (exoPlaying === id) { exoStop(); return; }
  exoStop(); audioReady();
  exoPlaying = id;
  const b = $('pb-' + id); if (b) b.innerHTML = STOP_HTML;
  let k = 0;
  const run = () => tick(k++);
  run(); exoTimer = setInterval(run, stepSec * 1000);
}

/* ── tab DSL → SVG ── */
const TABREG = {};
function tabParse(str) {
  const cols = []; let conn = null;
  str.trim().split(/\s+/).forEach(tok => {
    if (tok === '|') { cols.push({bar:true}); return; }
    if (['h','p','/','\\'].includes(tok)) { conn = tok; return; }
    const [body, lbl] = tok.split('@');
    const notes = body === '-' ? [] : body.split('+').map(n => { const [s, txt] = n.split('.'); return {s:+s, txt}; });
    cols.push({notes, lbl: lbl || '', conn}); conn = null;
  });
  return cols;
}
function tabSVG(id, cols) {
  const lg = 13, top = 16, cw = 28, bw = 12, ml = 18;
  let x = ml + 4; const pos = [];
  cols.forEach(c => { if (c.bar) { pos.push(x + bw/2); x += bw; } else { pos.push(x + cw/2); x += cw; } });
  const W = x + 8, hasLbl = cols.some(c => c.lbl), H = top + lg*5 + (hasLbl ? 26 : 12);
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">`;
  s += `<rect class="tab-cur" id="${id}-cur" x="0" y="${top-9}" width="24" height="${lg*5+18}" rx="6" fill="var(--gold)" opacity="0"/>`;
  'eBGDAE'.split('').forEach((l, li) => {
    const y = top + li*lg;
    s += `<text x="3" y="${y+3}" font-size="9" fill="var(--cream3)" font-family="Inter,system-ui,sans-serif" font-weight="600">${l}</text>`;
    s += `<line x1="${ml}" y1="${y}" x2="${W-4}" y2="${y}" stroke="var(--border2)" stroke-width="1"/>`;
  });
  s += `<line x1="${ml}" y1="${top}" x2="${ml}" y2="${top+lg*5}" stroke="var(--cream3)" stroke-width="2"/>`;
  let prev = -1;
  cols.forEach((c, i) => {
    const x = pos[i];
    if (c.bar) { s += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top+lg*5}" stroke="var(--cream4)" stroke-width="1.5"/>`; return; }
    if (c.conn && prev >= 0 && c.notes.length) {
      const y = top + (c.notes[0].s - 1)*lg, x1 = pos[prev] + 7, x2 = x - 7, mx = (x1 + x2)/2;
      if (c.conn === '/' || c.conn === '\\') {
        const up = c.conn === '/';
        s += `<line x1="${x1}" y1="${y + (up ? 4 : -4)}" x2="${x2}" y2="${y + (up ? -4 : 4)}" stroke="var(--gold2)" stroke-width="1.8" stroke-linecap="round"/>`;
      } else {
        s += `<path d="M ${x1} ${y-6} Q ${mx} ${y-17} ${x2} ${y-6}" fill="none" stroke="var(--gold2)" stroke-width="1.5"/>`;
        s += `<text x="${mx}" y="${y-13}" text-anchor="middle" font-size="9" font-weight="800" fill="var(--gold2)" font-family="Inter,system-ui,sans-serif">${c.conn}</text>`;
      }
    }
    c.notes.forEach(n => {
      const y = top + (n.s - 1)*lg, w = n.txt.length*6.2 + 6;
      s += `<rect x="${x-w/2}" y="${y-6.5}" width="${w}" height="13" rx="3" fill="var(--bg2)"/>`;
      s += `<text x="${x}" y="${y+3.5}" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--cream)" font-family="Inter,system-ui,sans-serif">${esc(n.txt)}</text>`;
    });
    if (c.lbl) s += `<text x="${x}" y="${top+lg*5+18}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--gold2)" font-family="Inter,system-ui,sans-serif">${esc(c.lbl)}</text>`;
    prev = i;
  });
  return {svg: s + '</svg>', pos};
}
function tabBlock(id, b, exId) {
  const cols = tabParse(b.tab), r = tabSVG(id, cols);
  TABREG[id] = {cols, pos:r.pos, sub:b.sub || 2, ex:exId};
  return `<div class="exo-vis"><div class="exo-vis-h"><span>${b.n || 'Tablature'}</span>
    <button type="button" class="btn btn-ghost btn-xs" id="pb-${id}" onclick="exoPlayTab('${id}')">${exoPlaying === id ? STOP_HTML : PLAY_HTML}</button></div>
    <div class="scroll-x">${r.svg}</div>${b.note ? `<div class="exo-note">${b.note}</div>` : ''}</div>`;
}
function exoPlayTab(id) {
  const R = TABREG[id]; if (!R) return;
  const play = R.cols.map((c, i) => ({c, i})).filter(o => !o.c.bar), sub = R.sub;
  exoLoop(id, 60 / exoBpmOf(R.ex) / sub, k => {
    const o = play[k % play.length], t = audio().currentTime + 0.01;
    if (k % sub === 0) click(t, k % (sub*4) === 0);
    o.c.notes.forEach(n => {
      const bm = n.txt.match(/b(\d+)/), f = bm ? +bm[1] : parseInt(n.txt);
      if (!isNaN(f)) pluck(fretFreq(6 - n.s, f, 0), t, o.c.lbl === 'PM' ? .14 : 1.1, o.c.lbl === 'PM' ? .1 : .14);
    });
    const cur = $(id + '-cur');
    if (cur) { cur.setAttribute('x', R.pos[o.i] - 12); cur.setAttribute('opacity', '.25'); }
  });
}

/* ── strum grid ── */
const STRUMREG = {};
const CNT8 = ['1','et','2','et','3','et','4','et'];
function strumGlyph(ch, i) {
  const u = String(ch).toUpperCase();
  if (u === 'D' || u === 'U') return `<span class="sgl ${u}">${rhArrow(u, ch === u ? 1 : 0)}</span>`;
  if (u === 'X') return `<span class="sgl X">${rhArrow('X', 1)}</span>`;
  return '<span class="sgl"><i class="rgd"></i></span>';
}
function strumBlock(id, b, exId) {
  STRUMREG[id] = {pat:b.pat, chords:b.chords, ex:exId};
  const cells = rhythmSVG(rhFromPat(b.pat, '4/4', 8), false, {idp: id});
  return `<div class="exo-vis"><div class="exo-vis-h"><span>${b.n || 'Rythme'} · ${b.chords.join(' → ')}</span>
    <span style="display:flex;gap:8px;align-items:center">${mmBtn('learn')}<button type="button" class="btn btn-ghost btn-xs" id="pb-${id}" onclick="exoPlayStrum('${id}')">${exoPlaying === id ? STOP_HTML : PLAY_HTML}</button></span></div>
    <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center">
      <div class="strum">${cells}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${[...new Set(b.chords)].map(c => `<div class="chord-cell"><div class="cn" style="font-size:14px">${c}</div>${chordSVG(newChord(c), {size:.75})}</div>`).join('')}</div>
    </div>
    <div class="legend"><span><b style="color:var(--gold2)">↓</b> vers le bas</span><span><b style="color:var(--sage)">↑</b> vers le haut</span><span style="opacity:.7">point pâle = la main passe sans toucher</span><span><b style="color:var(--terra)">✕</b> chuck étouffé</span><span>grande = accentué · petite = doux</span></div></div>`;
}
function exoPlayStrum(id) {
  const R = STRUMREG[id]; if (!R) return;
  const len = R.pat.length, chords = R.chords.map(c => newChord(c));
  exoLoop(id, 60 / exoBpmOf(R.ex) / 2, k => {
    const i = k % len, ch = R.pat[i], chord = chords[Math.floor(k / len) % chords.length], t = audio().currentTime + 0.01;
    if (i % 2 === 0) click(t, i === 0);
    const mm = mmOn('learn');
    if (ch === 'X') { if (mm) muteHit(t, chord, 0, 'D', 1, {x: 1}); else chuckSound(t, chord, 0); }
    else if ('DdUu'.includes(ch)) { const lv = ch === 'D' || ch === 'U' ? 2 : 0; if (mm) muteHit(t, chord, 0, ch.toUpperCase(), lv); else strumChord(chord, 0, ch.toUpperCase(), t, lv); }
    for (let j = 0; j < len; j++) { const el = $(id + '-' + j); if (el) el.classList.toggle('exo-now', j === i); }
  });
}

/* ── other visual blocks ── */
function chordsBlock(b) {
  return `<div class="exo-vis"><div class="exo-vis-h"><span>${b.n || 'Accords'}</span></div>
    <div class="lib-grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${b.list.map(c => {
      const ch = typeof c === 'string' ? newChord(c) : c; SEQ['cb' + ch.id] = [ch];
      return `<div class="lib-card"><div class="cn">${esc(ch.name)}</div>${chordSVG(ch, {size:1.1})}
        ${ch.sub ? `<div style="font-size:10px;color:var(--cream3);text-align:center">${ch.sub}</div>` : ''}
        <button class="lib-play" onclick="playChord(SEQ['cb${ch.id}'][0],0)"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></button></div>`;
    }).join('')}</div></div>`;
}
const fretBlock = b => `<div class="exo-vis"><div class="exo-vis-h"><span>${b.n || 'Sur le manche'}</span></div>${fretboardSVG(b.pcs, b.root, {range:b.range})}${LEGEND}</div>`;
function exoVis(ex) {
  return (ex.v || []).map((b, bi) => {
    const id = ex.id + '-v' + bi;
    if (b.t === 'tab') return tabBlock(id, b, ex.id);
    if (b.t === 'strum') return strumBlock(id, b, ex.id);
    if (b.t === 'chords') return chordsBlock(b);
    if (b.t === 'fret') return fretBlock(b);
    if (b.t === 'tool') return EXO_TOOLS[b.k](ex);
    return '';
  }).join('');
}

/* ═══ tools ═══ */
const PERMS = ['1234','1324','1423','1243','2413','1342','4321','3142'];
const OMC_PAIRS = ['Em-Am','Em-G','G-C','C-D','D-Em','G-D','Am-E','A-D','E-A','Am-Dm','C-Am','C-F','Am-F','G-Bm'];
const ANCHOR_PAIRS = ['C-Am','Am-E','Em-Am','G-Em','C-G','D-A','A-E','Am-Dm','D-Em','C-F','G-D','E-Am'];
function anchorInfo(a, b) {
  const A = newChord(a), B = newChord(b), piv = [], gui = [];
  for (let i = 0; i < 6; i++) {
    if (A.frets[i] > 0 && A.fingers[i] > 0 && A.fingers[i] === B.fingers[i] && B.frets[i] > 0) {
      if (A.frets[i] === B.frets[i]) piv.push(`doigt ${A.fingers[i]} (corde ${STRINGS[i]}, case ${A.frets[i]})`);
      else gui.push(`doigt ${A.fingers[i]} glisse sur la corde ${STRINGS[i]} (case ${A.frets[i]} → ${B.frets[i]})`);
    }
  }
  // whole sub-shapes that move together across strings (e.g. Am → E)
  let shift = null;
  [-1, 1, -2, 2].forEach(dlt => {
    if (shift) return;
    const moved = [];
    for (let i = 0; i < 6; i++) {
      const j = i + dlt;
      if (A.frets[i] > 0 && A.fingers[i] > 0 && j >= 0 && j < 6 && B.frets[j] === A.frets[i] && B.fingers[j] === A.fingers[i]) moved.push(A.fingers[i]);
    }
    if (moved.length >= 2) shift = {dlt, moved};
  });
  return {piv, gui, shift};
}
const EXO_TOOLS = {
  perm(ex) {
    const st = exoSt.perm;
    return `<div class="exo-vis"><div class="cours-ctrl" style="margin-top:0">
      <div class="fg"><label>Permutation</label><select onchange="exoSt.perm.p=this.value;exoRender()">${PERMS.map(p => `<option value="${p}" ${p===st.p?'selected':''}>${p.split('').join('-')}</option>`).join('')}</select></div>
      <div class="fg"><label>Case de départ</label><select onchange="exoSt.perm.f=+this.value;exoRender()">${[1,5,7].map(f => `<option value="${f}" ${f===st.f?'selected':''}>Case ${f}</option>`).join('')}</select></div></div></div>` +
      tabBlock('perm-tab', {n:'Doigts ' + st.p.split('').join('-') + ' sur les 6 cordes', tab:spiderTab(st.p, st.f)}, ex.id);
  },
  omc() {
    const st = exoSt.omc, [a, b] = st.pair.split('-'), key = 'omc:' + st.pair, best = exoProg.best[key] || 0;
    const hist = (exoProg.hist[key] || []).slice(-12), mx = Math.max(1, ...hist.map(h => h.n)), R = 46, C = 2*Math.PI*R;
    const action = st.phase === 'run' ? `<button class="btn btn-ghost btn-sm" onclick="omcCancel()">Annuler</button>`
      : st.phase === 'done' ? `<div style="display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap"><span style="font-size:13px;color:var(--cream2)">Combien de changements propres ?</span><input type="number" id="omc-n" min="0" max="200" style="width:90px" onkeydown="if(event.key==='Enter')omcSave()"><button class="btn btn-primary btn-sm" onclick="omcSave()">Enregistrer</button></div>`
      : `<button class="btn btn-primary" onclick="omcStart()">Lancer 60 secondes</button>`;
    return `<div class="exo-vis">
      <div class="cours-ctrl" style="margin-top:0"><div class="fg"><label>Paire d’accords</label><select onchange="exoSt.omc.pair=this.value;exoRender()" ${st.phase==='run'?'disabled':''}>${OMC_PAIRS.map(p => `<option ${p===st.pair?'selected':''}>${p}</option>`).join('')}</select></div></div>
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center">
        <div class="chord-cell"><div class="cn" style="font-size:22px">${a}</div>${chordSVG(newChord(a), {size:1.25})}</div>
        <div style="font-size:30px;color:var(--gold2);font-weight:800">⇄</div>
        <div class="chord-cell"><div class="cn" style="font-size:22px">${b}</div>${chordSVG(newChord(b), {size:1.25})}</div>
        <svg width="124" height="124" viewBox="0 0 124 124"><circle cx="62" cy="62" r="${R}" fill="none" stroke="var(--card3)" stroke-width="9"/>
          <circle id="omc-ring" cx="62" cy="62" r="${R}" fill="none" stroke="var(--gold)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1 - st.left/60)}" transform="rotate(-90 62 62)"/>
          <text id="omc-t" x="62" y="70" text-anchor="middle" font-size="28" font-weight="800" fill="var(--cream)" font-family="Inter,system-ui,sans-serif">${st.left}</text></svg>
      </div>
      <div style="text-align:center;margin-top:14px">${action}</div>
      <div style="margin-top:18px"><div class="exo-vis-h"><span>Record ${st.pair} : <b style="color:var(--gold2);font-size:14px">${best || '—'}</b> / min</span></div>
        ${hist.length ? `<div class="mini-bars">${hist.map(h => `<div class="mb" style="height:${Math.max(6, h.n/mx*62)}px" title="${h.d}"><span>${h.n}</span></div>`).join('')}</div>`
                      : '<div class="exo-note">Tes scores s’afficheront ici en graphique, séance après séance.</div>'}
        <div class="exo-note">Repères : 20 = début · 30 = jouable dans une chanson lente · 60 = fluide.</div></div></div>`;
  },
  anchor(ex) {
    const [a, b] = exoSt.anchor.split('-'), info = anchorInfo(a, b);
    const lines = [];
    if (info.piv.length) lines.push(`<div class="exo-ok" style="margin-bottom:6px"><b>Pivot</b> (ne bouge pas) : ${info.piv.join(', ')}</div>`);
    if (info.gui.length) lines.push(`<div class="exo-ok" style="margin-bottom:6px"><b>Guide</b> (reste en contact) : ${info.gui.join(', ')}</div>`);
    if (info.shift) lines.push(`<div class="exo-ok" style="margin-bottom:6px"><b>Forme qui se décale</b> : les doigts ${info.shift.moved.slice(0, -1).join(', ')} et ${info.shift.moved.slice(-1)} gardent leur forme, déplace-les ensemble ${Math.abs(info.shift.dlt) === 1 ? 'd’une corde' : 'de deux cordes'} vers les cordes ${info.shift.dlt > 0 ? 'aiguës' : 'graves'}.</div>`);
    if (!lines.length) lines.push(`<div class="exo-note">Aucun doigt commun : visualise la forme d’arrivée et pose tous les doigts <b>en bloc</b>, en commençant par celui de la basse.</div>`);
    return `<div class="exo-vis"><div class="cours-ctrl" style="margin-top:0"><div class="fg"><label>Changement</label><select onchange="exoSt.anchor=this.value;exoRender()">${ANCHOR_PAIRS.map(p => `<option value="${p}" ${p===exoSt.anchor?'selected':''}>${p.replace('-', ' → ')}</option>`).join('')}</select></div></div>
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;justify-content:center;margin-bottom:12px">
        <div class="chord-cell"><div class="cn" style="font-size:22px">${a}</div>${chordSVG(newChord(a), {size:1.3})}</div>
        <div style="font-size:30px;color:var(--gold2);font-weight:800">→</div>
        <div class="chord-cell"><div class="cn" style="font-size:22px">${b}</div>${chordSVG(newChord(b), {size:1.3})}</div></div>
      ${lines.join('')}</div>` + strumBlock('anchor-strum', {pat:'D-D-D-D-', chords:[a, b], n:'4 coups par accord'}, ex.id);
  },
  notefind() {
    const st = exoSt.nf;
    return `<div class="exo-vis" style="text-align:center">
      ${st.pc == null ? '<p class="cours-p">Tire la note du jour, puis trouve-la sur les 6 cordes.</p>'
        : `<div class="big-note">${pcName(st.pc)}</div><div style="font-size:14px;color:var(--cream3);margin:4px 0 12px">${frNote(pcName(st.pc))} — trouve-la sur chaque corde</div>`}
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="nfNew()">${st.pc == null ? 'Tirer une note' : 'Autre note'}</button>
        ${st.pc != null ? `<button class="btn btn-ghost btn-sm" onclick="exoSt.nf.show=!exoSt.nf.show;exoRender()">${st.show ? 'Cacher' : 'Révéler les positions'}</button>
          <button class="btn btn-ghost btn-sm" onclick="playNote(${40 + ((st.pc - 4 + 12) % 12)})">Entendre</button>` : ''}
      </div>
      ${st.pc != null && st.show ? `<div style="margin-top:14px;text-align:left">${fretboardSVG([st.pc], st.pc)}</div>` : ''}</div>`;
  },
  earint() {
    const z = exoSt.ei, opts = EI_LVLS[z.lvl][1];
    return `<div class="exo-vis" style="text-align:center">
      <div class="filters" style="justify-content:center">${EI_LVLS.map(([n], i) => `<button type="button" class="filt ${z.lvl===i?'on':''}" onclick="exoSt.ei.lvl=${i};exoSt.ei.cur=null;exoSt.ei.fb='';exoRender()">${n}</button>`).join('')}</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button type="button" class="btn btn-primary btn-sm" onclick="eiNew()">${z.cur ? 'Intervalle suivant' : 'Jouer un intervalle'}</button>
        ${z.cur ? `<button type="button" class="btn btn-ghost btn-sm" onclick="eiPlay()">Rejouer</button>` : ''}</div>
      <div class="filters" style="justify-content:center;margin:14px 0 0">${opts.map(s => `<button type="button" class="filt" ${z.cur ? '' : 'disabled style="opacity:.4"'} onclick="eiAnswer(${s})">${INTERVALS[s][1]}</button>`).join('')}</div>
      <div class="quiz-fb">${z.fb}</div>
      <div style="font-family:var(--mono);font-size:12px;color:var(--cream3)">Score : ${z.ok} / ${z.n}</div></div>`;
  },
  earchords() {
    return `<div class="exo-vis" style="text-align:center"><p class="cours-p">Le quiz d’accords est intégré à la leçon 12 du cours, avec 3 niveaux.</p>
      <button class="btn btn-primary btn-sm" onclick="coursGo('ear')">Ouvrir le quiz d’accords</button></div>`;
  },
  tuneref() {
    return `<div class="exo-vis"><div class="exo-vis-h"><span>Notes de référence (cordes à vide)</span><button class="btn btn-ghost btn-xs" onclick="go('tuner')">Ouvrir l’accordeur</button></div>
      <div class="lib-grid">${STRINGS.map((n, i) => `<div class="lib-card" style="cursor:pointer" onclick="playRefString(${i})"><div class="cn">${n}</div>
        <div style="font-size:9px;color:var(--cream4);text-align:center">${STRING_LABELS_FULL[i]}</div>
        <div class="lib-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></div></div>`).join('')}</div>
      <div class="exo-note">La paire « case 5 / corde suivante » : ${['E → A','A → D','D → G','G → B (case 4 !)','B → e'].join(' · ')}</div></div>`;
  },
  subdiv(ex) {
    return `<div class="exo-vis"><div class="exo-vis-h"><span>Les 4 subdivisions (4 temps)</span></div>${SUBS.map(([n, name, syl]) => {
      const cells = Array.from({length: 4*n}, (_, i) => `<div class="sub-cell ${i % n === 0 ? 'beat' : ''}" id="sd${n}-${i}" style="width:${Math.max(20, 132/n)}px">${i % n === 0 ? i/n + 1 : syl[i % n]}</div>`).join('');
      return `<div class="sub-row"><div class="sr-n">${name}</div><div class="sub-cells">${cells}</div>
        <button type="button" class="btn btn-ghost btn-xs" id="pb-sd${n}" onclick="exoPlaySub(${n})">${exoPlaying === 'sd' + n ? STOP_HTML : PLAY_HTML}</button></div>`;
    }).join('')}<div class="exo-note">On compte : « 1 », « 1 et », « 1 et a » (triolet), « 1 e et a » (doubles). Le chiffre tombe toujours sur le clic aigu.</div></div>`;
  },
  gap(ex) {
    const [on, off] = GAPS[exoSt.gap], running = metroPlaying && metroState.gap;
    return `<div class="exo-vis"><div class="exo-vis-h"><span>Mesures avec / sans clic</span></div>
      <div class="filters">${GAPS.map(([a, b], i) => `<button type="button" class="filt ${exoSt.gap===i?'on':''}" onclick="exoSt.gap=${i};if(metroState.gap)gapStart();exoRender()">${a} avec / ${b} sans</button>`).join('')}</div>
      <div class="gap-bars" id="gap-bars">${Array.from({length:on + off}, (_, i) => `<div class="gb ${i < on ? 'on' : 'off'}">${i < on ? 'clic' : 'silence'}</div>`).join('')}</div>
      <button class="btn ${running ? 'btn-ghost' : 'btn-primary'} btn-sm" onclick="${running ? 'gapStop()' : 'gapStart()'}">${running ? 'Arrêter' : 'Lancer à ' + exoBpmOf('gap') + ' BPM'}</button>
      <div class="exo-note">La case qui s’allume suit la mesure en cours, pour vérifier où tu en es.</div></div>`;
  },
  impro(ex) {
    const [key, bs, f] = IMPRO_KEYS[exoSt.impro], root = parseName(key).pc, pcs = [0,3,5,7,10].map(i => (root + i) % 12);
    const running = metroPlaying && metroState.improMode;
    return `<div class="exo-vis"><div class="exo-vis-h"><span>Tonalité</span></div>
      <div class="filters">${IMPRO_KEYS.map(([k], i) => `<button type="button" class="filt ${exoSt.impro===i?'on':''}" onclick="exoSt.impro=${i};if(metroPlaying&&metroState.improMode)improStart();exoRender()">${k} mineur (${frNote(k)})</button>`).join('')}</div>
      <button class="btn ${running ? 'btn-ghost' : 'btn-primary'} btn-sm" onclick="${running ? 'stopMetro();exoRender()' : 'improStart()'}">${running ? 'Arrêter le groupe' : 'Lancer le groupe (batterie + basse en ' + key + ')'}</button>
      <div style="margin-top:14px">${fretboardSVG(pcs, root, {range:[f, f + 3]})}</div>${LEGEND}</div>` +
      tabBlock('impro-tab', {n:key + ' mineur pentatonique, case ' + f, tab:pentaTab(f)}, ex.id);
  },
};
const EI_LVLS = [['Tierces', [3,4]], ['+ quinte & octave', [3,4,7,12]], ['Tous', [2,3,4,5,7,9,10,12]]];
const SUBS = [[1,'Noires',['1']], [2,'Croches',['1','et']], [3,'Triolets',['1','et','a']], [4,'Doubles croches',['1','e','et','a']]];
const GAPS = [[2,2],[1,1],[2,4],[1,3]];
const IMPRO_KEYS = [['A',1,5], ['E',0,0], ['G',3,3]];

function omcStart() {
  const st = exoSt.omc; st.phase = 'run'; st.left = 60; exoRender();
  const ac = audioReady(); click(ac.currentTime + .01, true);
  omcTimer = setInterval(() => {
    st.left--;
    const C = 2*Math.PI*46, r = $('omc-ring'), t = $('omc-t');
    if (r) r.setAttribute('stroke-dashoffset', C*(1 - st.left/60));
    if (t) t.textContent = st.left;
    if (st.left <= 0) {
      clearInterval(omcTimer); omcTimer = null;
      const n = audio().currentTime; [0, .18, .36].forEach(d => click(n + .01 + d, true));
      st.phase = 'done'; exoRender();
      setTimeout(() => { const i = $('omc-n'); if (i) i.focus(); }, 50);
    }
  }, 1000);
}
function omcCancel() { if (omcTimer) clearInterval(omcTimer); omcTimer = null; exoSt.omc.phase = 'idle'; exoSt.omc.left = 60; exoRender(); }
function omcSave() {
  const n = parseInt(($('omc-n') || {}).value);
  if (isNaN(n) || n < 0) { toast('Entre un nombre', true); return; }
  const key = 'omc:' + exoSt.omc.pair;
  (exoProg.hist[key] = exoProg.hist[key] || []).push({d: today(), n});
  const rec = n > (exoProg.best[key] || 0); if (rec) exoProg.best[key] = n;
  exoProg.done.omc = true; exoLog('omc'); exoSave();
  exoSt.omc.phase = 'idle'; exoSt.omc.left = 60; exoRender();
  toast(rec ? `Nouveau record : ${n} changements !` : `${n} changements enregistrés`);
}
function nfNew() {
  const nat = [0,2,4,5,7,9,11].filter(p => p !== exoSt.nf.pc);
  exoSt.nf = {pc: nat[Math.floor(Math.random()*nat.length)], show:false};
  exoLog('notefind'); exoProg.done.notefind = true; exoSave(); exoRender();
}
function eiNew() {
  const z = exoSt.ei, opts = EI_LVLS[z.lvl][1];
  z.cur = {s: opts[Math.floor(Math.random()*opts.length)], answered:false}; z.fb = 'Écoute… quelle distance ?';
  exoRender(); eiPlay();
}
function eiPlay() { if (exoSt.ei.cur) playInterval(exoSt.ei.cur.s); }
function eiAnswer(s) {
  const z = exoSt.ei, c = z.cur; if (!c) return;
  const good = s === c.s;
  if (!c.answered) { z.n++; if (good) z.ok++; c.answered = true; exoLog('earint'); exoProg.done.earint = true; exoSave(); }
  z.fb = good ? `<b class="ok">Bravo !</b> ${INTERVALS[c.s][1]} (${c.s} cases) — ${INTERVALS[c.s][2]}`
              : `<b class="ko">Non :</b> c’était une ${INTERVALS[c.s][1].toLowerCase()} (${c.s} cases), pas une ${INTERVALS[s][1].toLowerCase()}. Réécoute.`;
  exoRender();
}
function exoPlaySub(n) {
  exoLoop('sd' + n, 60 / exoBpmOf('subdiv') / n, k => {
    const i = k % (4*n), t = audio().currentTime + .01;
    click(t, i % n === 0);
    for (let j = 0; j < 4*n; j++) { const el = $(`sd${n}-${j}`); if (el) el.classList.toggle('exo-now', j === i); }
  });
}
function gapStart() {
  const [on, off] = GAPS[exoSt.gap];
  if (metroPlaying) stopMetro();
  metroState.gap = {on, off};
  if (!metroState.improMode) metroState.layers.click = true;
  metroState.bpm = exoBpmOf('gap');
  startMetro(); exoLog('gap'); exoProg.done.gap = true; exoSave(); exoRender();
}
function gapStop() { stopMetro(); metroState.gap = null; exoRender(); }
function improStart() {
  const [, bs] = IMPRO_KEYS[exoSt.impro];
  if (metroPlaying) stopMetro();
  metroState.gap = null;
  metroSetImpro(true);
  metroState.bassString = bs;
  metroState.bpm = exoBpmOf('impro');
  startMetro(); exoLog('impro'); exoProg.done.impro = true; exoSave(); exoRender();
}

/* ── actions ── */
function exoTempo(id, d) {
  exoBpm[id] = Math.max(30, Math.min(240, exoBpmOf(id) + d));
  if (metroPlaying) metroState.bpm = exoBpm[id];
  if (exoPlaying) exoStop();
  exoRender();
}
function exoMetro(id) {
  if (metroPlaying) stopMetro();
  else {
    metroState.gap = null;
    if (metroState.improMode) metroSetImpro(false);
    metroState.bpm = exoBpmOf(id);
    startMetro();
  }
  exoRender();
}
function exoRecord(id) {
  const bpm = exoBpmOf(id), rec = bpm > (exoProg.best[id] || 0);
  if (rec) exoProg.best[id] = bpm;
  (exoProg.hist[id] = exoProg.hist[id] || []).push({d: today(), n: bpm});
  exoProg.done[id] = true; exoLog(id); exoSave();
  toast(rec ? `Record : ${bpm} BPM !` : `Séance notée à ${bpm} BPM`);
  if (rec && EXO[id].bpm && bpm >= EXO[id].bpm[1]) setTimeout(() => toast('Objectif atteint, bravo !'), 1500);
  exoRender();
}
function exoMarkDone(id) { exoProg.done[id] = true; exoLog(id); exoSave(); toast('Séance notée'); exoRender(); }
function exoOpen(id, param) {
  if (param && id === 'omc') exoSt.omc.pair = param;
  if (param && id === 'anchor') exoSt.anchor = param;
  exoCur = id;
  if ($('v-exo').classList.contains('on')) { exoStop(); exoRender(); window.scrollTo(0, 0); }
  else { exoRet = $('v-cours').classList.contains('on') ? 'cours' : null; go('exo'); }
}
function exoBack() { exoStop(); exoCur = null; if (exoRet) { exoRet = null; go('cours'); return; } exoRender(); window.scrollTo(0, 0); }
function exoHome() { rccStop(); feelStop(); exoMode = 'feel'; exoRender(); window.scrollTo(0, 0); }
function coursGo(k) { coursCur = k; coursView = 'lesson'; go('cours'); }
let exoRet = null;   // d'où l'on vient quand un exercice s'ouvre depuis le Cours (parcours, leçon)

/* ── rendering ── */
const lvlDots = l => '●'.repeat(l) + '○'.repeat(3 - l);
function exoCard(ex) {
  const ax = AXIS[ex.ax], best = exoProg.best[ex.id];
  return `<div class="exo-card" style="--ax:${ax.c}" onclick="exoOpen('${ex.id}')">
    <div class="ec-top"><span class="ec-ax">${ax.n}</span>${exoProg.done[ex.id] ? '<span class="ec-done">✓</span>' : ''}</div>
    <div class="ec-n">${ex.n}</div>
    <div class="ec-why">${ex.why.replace(/<[^>]+>/g, '').split(/(?<=[.:!])\s/)[0]}</div>
    <div class="ec-meta"><span class="lvl" title="Niveau">${lvlDots(ex.lvl)}</span><span>${ex.dur}</span>
      ${ex.bpm ? `<span>${ex.bpm[0]} → ${ex.bpm[1]} BPM</span>` : ''}${best ? `<span class="tag gold">record ${best}</span>` : ''}</div></div>`;
}
function exoStatsHTML() {
  const done = EXOS.filter(e => exoProg.done[e.id]).length;
  const total = PC_STEPS.length, pdone = pcCur();
  const days = new Set(exoProg.log.map(l => l.d)).size;
  if (!days && !done && !pdone) return '';   // pas de stats à zéro
  return `<div class="exo-stats">
    <div class="sv-stat"><div class="v">${exoStreak()}</div><div class="l">Jours d’affilée</div></div>
    <div class="sv-stat"><div class="v">${days}</div><div class="l">Jours de pratique</div></div>
    <div class="sv-stat"><div class="v">${done}/${EXOS.length}</div><div class="l">Exercices essayés</div></div>
    <div class="sv-stat"><div class="v">${Math.round(pdone/total*100)}%</div><div class="l">Parcours guidé</div></div></div>`;
}
function axesHTML() {
  const list = exoAxis === 'all' ? AXES : AXES.filter(a => a.k === exoAxis);
  return `<div class="filters"><button type="button" class="filt ${exoAxis==='all'?'on':''}" onclick="exoAxis='all';exoRender()">Tous les axes</button>${AXES.map(a =>
      `<button type="button" class="filt ${exoAxis===a.k?'on':''}" onclick="exoAxis='${a.k}';exoRender()">${a.n}</button>`).join('')}</div>` +
    list.map(a => `<div class="axis-sec"><div class="axis-t"><i style="background:${a.c}"></i>${a.n}</div><div class="axis-d">${a.d}</div>
      <div class="exo-grid">${EXOS.filter(e => e.ax === a.k).map(exoCard).join('')}</div></div>`).join('');
}
function exoDetailHTML(ex) {
  const ax = AXIS[ex.ax], best = exoProg.best[ex.id];
  const lesson = ex.course && COURS.find(c => c.k === ex.course);
  const related = EXOS.filter(e => e.ax === ex.ax && e.id !== ex.id);
  let tempo = '';
  if (ex.bpm) {
    const [a, b] = ex.bpm, bpm = exoBpmOf(ex.id), pct = best ? Math.min(100, Math.max(3, (best - a)/(b - a)*100)) : 0;
    tempo = `<div class="tempo-ctrl">
      <button type="button" class="btn-icon" onclick="exoTempo('${ex.id}',-4)" title="−4 BPM">−</button>
      <div class="tc-v">${bpm}<small>BPM</small></div>
      <button type="button" class="btn-icon" onclick="exoTempo('${ex.id}',4)" title="+4 BPM">+</button>
      <button type="button" class="btn btn-ghost btn-xs" onclick="exoMetro('${ex.id}')">${metroPlaying ? 'Stop métronome' : 'Métronome seul'}</button>
      <button type="button" class="btn btn-primary btn-xs" onclick="exoRecord('${ex.id}')">✓ Propre à ce tempo</button>
      <div class="tc-prog"><div class="tc-bar"><i style="width:${pct}%"></i></div>
        <div class="tc-l">Départ ${a} · <b style="color:var(--gold2)">record ${best || '—'}</b> · objectif ${b} BPM</div></div></div>`;
  }
  return `<button type="button" class="btn btn-ghost btn-sm exo-back" onclick="exoBack()">&#8592; ${exoRet ? 'Cours' : exoMode === 'axes' ? 'Entraînement ciblé' : 'Exercices'}</button>
    <div class="pv-block on" style="--ax:${ax.c}">
      <div class="pv-hdr"><div class="pv-dot" style="background:${ax.c}"></div><div class="pv-name">${ax.n}</div></div>
      <div class="pv-body">
        <div class="exo-h">${ex.n}</div>
        <div class="sv-badges"><span class="badge">Niveau ${lvlDots(ex.lvl)}</span><span class="badge sage">${ex.dur}</span>
          ${ex.bpm ? `<span class="badge mauve">${ex.bpm[0]} → ${ex.bpm[1]} BPM</span>` : ''}${exoProg.done[ex.id] ? '<span class="badge sage">✓ déjà travaillé</span>' : ''}</div>
        ${tempo}
        <div class="exo-why">${ex.why}</div>
        ${exoVis(ex)}
        <div class="exo-cols">
          <div><div class="exo-sec-t">Comment faire</div><ol class="exo-steps">${ex.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>
          <div><div class="exo-sec-t">Erreurs fréquentes</div><div class="exo-err">${ex.errors.map(e => `<div>${e}</div>`).join('')}</div>
            <div class="exo-sec-t">C’est réussi quand…</div><div class="exo-ok">${ex.ok}</div></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px">
          ${!ex.bpm ? `<button type="button" class="btn btn-primary btn-sm" onclick="exoMarkDone('${ex.id}')">✓ J’ai fait cet exercice aujourd’hui</button>` : ''}
          ${lesson ? `<button type="button" class="btn btn-ghost btn-sm" onclick="coursGo('${lesson.k}')">Comprendre : leçon ${COURS.indexOf(lesson) + 1} · ${lesson.t}</button>` : ''}
        </div>
        ${related.length ? `<div class="practice"><div class="exo-sec-t">Dans le même axe</div><div class="filters">${related.map(e => `<button type="button" class="filt" onclick="exoOpen('${e.id}')">${e.n}</button>`).join('')}</div></div>` : ''}
      </div></div>`;
}
/* « Aller plus loin » : deux entrées, sous la grille des ambiances */
function exoMoreHTML() {
  const row = (ic, t, d, mode) => `<button type="button" class="row-go" onclick="rccStop();feelStop();exoMode='${mode}';exoRender();window.scrollTo(0,0)"><span class="rg-ic">${ic}</span><span><b>${t}</b><small>${d}</small></span><i>›</i></button>`;
  return `<div class="cl-t">Rythmes et exercices</div>` + row('↓↑', 'Apprendre les rythmes', RH_COURSE.length + ' rythmes, un par un', 'rhy') + row('◎', 'Entraînement ciblé', 'Accords, passages, effets, arpèges', 'axes');
}
function exoRender() {
  const body = $('exo-body'); if (!body) return;
  $('v-exo').classList.toggle('fl-solo', !exoCur && exoMode === 'feel' && !!feel.prog);   // lecteur d'une suite : écran épuré
  if (exoCur && EXO[exoCur]) { body.innerHTML = exoDetailHTML(EXO[exoCur]); return; }
  const back = exoMode === 'axes' || exoMode === 'rhy' && rcz.cur == null ? `<button type="button" class="btn btn-ghost btn-sm exo-back" onclick="exoHome()">&#8592; Exercices</button>` : '';
  body.innerHTML = (exoMode === 'axes' ? back + exoStatsHTML() : exoMode === 'rhy' ? back : '') +
    (exoMode === 'rhy' ? rccHTML() : exoMode === 'axes' ? axesHTML() : feelHTML() + (!feel.amb ? exoMoreHTML() : ''));
  if (exoMode === 'feel') feelAfter();
  if (exoMode === 'rhy') rccAfter();
}

/* ═══ cours : visuels et liens vers les exercices ═══ */
const LESSON_EXOS = {notes:['tune5','notefind','spider'], intervals:['earint','bend'], build:['anchor','omc'], colors:['earchords','dyn'],
  dissect:['anchor','pima','combo'], key:['majscale','notefind'], progs:['oldfaithful','omc','impro'], tension:['silent','sing'],
  capo:['omc'], barre:['barre','pm'], inv:['travis','pickarp'], ear:['earint','earchords']};
function practiceChips(k) {
  const ids = LESSON_EXOS[k] || []; if (!ids.length) return '';
  return `<div class="practice"><div class="exo-sec-t">Pour pratiquer</div><div class="filters">${ids.map(id =>
    `<button type="button" class="filt" onclick="exoOpen('${id}')"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${AXIS[EXO[id].ax].c};margin-right:6px"></i>${EXO[id].n}</button>`).join('')}</div></div>`;
}
function pianoSVG() {
  const ww = 44, wh = 128, bw = 28, bh = 78, whites = [0,2,4,5,7,9,11,12], blacks = [[1,0],[3,1],[6,3],[8,4],[10,5]];
  const W = ww*8 + 2, H = wh + 40;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">`;
  for (let i = 0; i < 7; i++) {
    const a = whites[i], b = whites[i + 1], semi = b - a === 1, x = 1 + (i + 1)*ww;
    s += `<text x="${x}" y="12" text-anchor="middle" font-size="10" font-weight="800" fill="${semi ? 'var(--terra)' : 'var(--cream3)'}" font-family="Inter,system-ui,sans-serif">${semi ? '½' : '1'}</text>`;
  }
  whites.forEach((pc, i) => {
    const n = NOTE_NAMES[pc % 12], x = 1 + i*ww;
    s += `<g style="cursor:pointer" onclick="playNote(${48 + pc})"><rect x="${x}" y="18" width="${ww - 2}" height="${wh}" rx="5" fill="#f7efdc" stroke="#8f7a5c"/>
      <text x="${x + ww/2 - 1}" y="${wh + 2}" text-anchor="middle" font-size="13" font-weight="800" fill="#241a11" font-family="Inter,system-ui,sans-serif">${n}</text>
      <text x="${x + ww/2 - 1}" y="${wh + 14}" text-anchor="middle" font-size="9" fill="#7a6142" font-family="Inter,system-ui,sans-serif">${frNote(n)}</text></g>`;
  });
  blacks.forEach(([pc, wi]) => {
    const x = 1 + (wi + 1)*ww - bw/2 - 1;
    s += `<g style="cursor:pointer" onclick="playNote(${48 + pc})"><rect x="${x}" y="18" width="${bw}" height="${bh}" rx="4" fill="#241a11"/>
      <text x="${x + bw/2}" y="${18 + bh - 10}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#f5b870" font-family="Inter,system-ui,sans-serif">${NOTE_NAMES[pc]}</text></g>`;
  });
  return `<div class="piano-wrap">${s}</svg></div>`;
}
function intervalRuler() {
  const tags = {0:'départ', 3:'tierce min.', 4:'tierce maj.', 7:'quinte', 12:'octave'};
  return `<div class="iv-ruler">${Array.from({length:13}, (_, i) => {
    const c = i === 0 || i === 12 ? 'var(--gold)' : (i === 3 || i === 4) ? 'var(--sage)' : i === 7 ? 'var(--mauve)' : '';
    return `<div class="iv-cell" style="${c ? `border-color:${c};background:color-mix(in srgb, ${c} 16%, transparent)` : ''}" onclick="${i ? `playInterval(${i})` : 'playNote(52)'}"><b>${i}</b><span>${pcName(4 + i)}${tags[i] ? '<br>' + tags[i] : ''}</span></div>`;
  }).join('')}</div>`;
}
function stackHTML(root, q) {
  const iv = QUAL[q].iv.filter(i => i !== 12);
  let h = '';
  iv.forEach((v, k) => {
    const d = DEG[v % 12];
    if (k) h += `<div class="stack-gap">+${v - iv[k-1]} cases${v - iv[k-1] === 3 ? ' (tierce min.)' : v - iv[k-1] === 4 ? ' (tierce maj.)' : ''}</div>`;
    h += `<div class="stack-n" style="background:${degColor(d)}">${pcName(root + v)} <small>${DEG_ROLE[d]}</small></div>`;
  });
  return `<div class="stack">${h}</div>`;
}
function scaleSteps(key) {
  const flats = keyFlats(key), kp = parseName(key).pc, deg = SCALE.concat(12);
  return `<div class="scale-steps">${deg.map((iv, i) => {
    const n = pcName(kp + iv, flats);
    let h = `<div class="ss-note" id="sc-${i}">${n}<small>${i < 7 ? ROMAN[i] : 'I'}</small></div>`;
    if (i < 7) { const g = deg[i+1] - iv; h += `<div class="ss-gap ${g === 1 ? 'h' : 't'}">${g === 1 ? '½' : 'T'}</div>`; }
    return h;
  }).join('')}</div>`;
}
const CIRC = ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'];
function circleSVG(key) {
  const idx = CIRC.indexOf(key), W = 300, cx = 150, cy = 150, Ro = 112, Ri = 70;
  const minor = i => pcName(parseName(CIRC[i]).pc + 9, keyFlats(CIRC[i])) + 'm';
  const role = i => { const d = (i - idx + 12) % 12; return d === 0 ? 'I' : d === 1 ? 'V' : d === 11 ? 'IV' : null; };
  const roleM = i => { const d = (i - idx + 12) % 12; return d === 0 ? 'vi' : d === 1 ? 'iii' : d === 11 ? 'ii' : null; };
  let s = `<svg width="${W}" height="${W}" viewBox="0 0 ${W} ${W}" style="display:block;margin:0 auto">`;
  s += `<circle cx="${cx}" cy="${cy}" r="${Ro + 24}" fill="var(--bg2)" stroke="var(--border)"/><circle cx="${cx}" cy="${cy}" r="${Ri + 21}" fill="none" stroke="var(--border)"/>`;
  if (idx >= 0) {
    const a0 = ((idx - 1.5)*30 - 90) * Math.PI/180, a1 = ((idx + 1.5)*30 - 90) * Math.PI/180, R = Ro + 24, r = Ri - 20;
    s += `<path d="M ${cx + r*Math.cos(a0)} ${cy + r*Math.sin(a0)} L ${cx + R*Math.cos(a0)} ${cy + R*Math.sin(a0)} A ${R} ${R} 0 0 1 ${cx + R*Math.cos(a1)} ${cy + R*Math.sin(a1)} L ${cx + r*Math.cos(a1)} ${cy + r*Math.sin(a1)} A ${r} ${r} 0 0 0 ${cx + r*Math.cos(a0)} ${cy + r*Math.sin(a0)} Z" fill="rgba(200,120,58,.14)" stroke="var(--gold)" stroke-width="1.5"/>`;
  }
  CIRC.forEach((k, i) => {
    const a = (i*30 - 90) * Math.PI/180, x = cx + Ro*Math.cos(a), y = cy + Ro*Math.sin(a), xi = cx + Ri*Math.cos(a), yi = cy + Ri*Math.sin(a);
    const r = role(i), rm = roleM(i);
    s += `<g style="cursor:pointer" onclick="coursSetKey('${k}')"><circle cx="${x}" cy="${y}" r="19" fill="${r === 'I' ? 'var(--gold)' : r ? 'var(--sage)' : 'var(--card2)'}"/>
      <text x="${x}" y="${y + (r ? 1 : 4)}" text-anchor="middle" font-size="12" font-weight="800" fill="${r ? 'var(--ink)' : 'var(--cream)'}" font-family="Inter,system-ui,sans-serif">${k}</text>
      ${r ? `<text x="${x}" y="${y + 11}" text-anchor="middle" font-size="8" font-weight="800" fill="var(--ink)" font-family="Inter,system-ui,sans-serif">${r}</text>` : ''}</g>`;
    s += `<circle cx="${xi}" cy="${yi}" r="16" fill="${rm ? 'var(--mauve)' : 'transparent'}"/>
      <text x="${xi}" y="${yi + (rm ? 1 : 3.5)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${rm ? 'var(--ink)' : 'var(--cream3)'}" font-family="Inter,system-ui,sans-serif">${minor(i)}</text>
      ${rm ? `<text x="${xi}" y="${yi + 10}" text-anchor="middle" font-size="7.5" font-weight="800" fill="var(--ink)" font-family="Inter,system-ui,sans-serif">${rm}</text>` : ''}`;
  });
  return s + '</svg>';
}
function voiceLeadSVG() {
  const L = [['F','♭7 · triton',-1,'E'], ['D','5',-2,'C'], ['B','3 · triton',1,'C'], ['G','R',0,'G']];
  let s = `<svg width="300" height="190" viewBox="0 0 300 190" style="display:block;max-width:100%">`;
  s += `<text x="55" y="16" text-anchor="middle" font-size="13" font-weight="800" fill="var(--cream)" font-family="Inter,system-ui,sans-serif">G7</text><text x="245" y="16" text-anchor="middle" font-size="13" font-weight="800" fill="var(--cream)" font-family="Inter,system-ui,sans-serif">C</text>`;
  L.forEach(([a, role, mv, b], i) => {
    const y = 40 + i*40, hot = role.includes('triton');
    s += `<rect x="20" y="${y - 14}" width="70" height="26" rx="8" fill="${hot ? 'var(--terra)' : 'var(--card3)'}"/><text x="55" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="${hot ? '#fff' : 'var(--cream)'}" font-family="Inter,system-ui,sans-serif">${a}</text>`;
    s += `<text x="55" y="${y + 24}" text-anchor="middle" font-size="8" fill="var(--cream3)">${role}</text>`;
    s += `<rect x="210" y="${y - 14}" width="70" height="26" rx="8" fill="${hot ? 'var(--sage)' : 'var(--card3)'}"/><text x="245" y="${y + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="${hot ? 'var(--ink)' : 'var(--cream)'}" font-family="Inter,system-ui,sans-serif">${b}</text>`;
    s += `<line x1="94" y1="${y}" x2="204" y2="${y}" stroke="${hot ? 'var(--gold2)' : 'var(--border2)'}" stroke-width="${hot ? 2.2 : 1.4}" marker-end="url(#vl-ar)"/>`;
    s += `<text x="150" y="${y - 5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${hot ? 'var(--gold2)' : 'var(--cream3)'}" font-family="Inter,system-ui,sans-serif">${mv === 0 ? 'reste' : (mv > 0 ? '+' : '−') + Math.abs(mv) + (Math.abs(mv) === 1 ? ' demi-ton' : ' demi-tons')}</text>`;
  });
  s += `<defs><marker id="vl-ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--gold2)"/></marker></defs>`;
  return s + '</svg>';
}
function capoSVG(c) {
  const W = 330, H = 104, x0 = 20, fw = 44, top = 14, sp = 15;
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;max-width:100%">`;
  s += `<rect x="${x0}" y="${top - 4}" width="${fw*7}" height="${sp*5 + 8}" rx="4" fill="var(--card3)"/>`;
  for (let f = 0; f <= 7; f++) s += `<line x1="${x0 + f*fw}" y1="${top - 4}" x2="${x0 + f*fw}" y2="${top + sp*5 + 4}" stroke="${f === 0 ? 'var(--cream2)' : 'var(--cream4)'}" stroke-width="${f === 0 ? 4 : 1.5}"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${x0}" y1="${top + i*sp}" x2="${x0 + fw*7}" y2="${top + i*sp}" stroke="var(--cream3)" stroke-width="${0.8 + i*0.25}"/>`;
  if (c > 0 && c <= 7) {
    const x = x0 + c*fw - 13;
    s += `<rect x="${x}" y="${top - 10}" width="12" height="${sp*5 + 20}" rx="5" fill="var(--gold)"/>`;
    s += `<rect x="${x0}" y="${top - 4}" width="${x - x0}" height="${sp*5 + 8}" fill="var(--bg)" opacity=".55"/>`;
    s += `<text x="${x + 6}" y="${H - 2}" text-anchor="middle" font-size="9.5" font-weight="800" fill="var(--gold2)" font-family="Inter,system-ui,sans-serif">capo ${c} = nouveau sillet</text>`;
  } else s += `<text x="${x0}" y="${H - 2}" font-size="9.5" fill="var(--cream3)" font-family="Inter,system-ui,sans-serif">sans capo : le sillet d’origine</text>`;
  for (let f = 1; f <= 7; f++) s += `<text x="${x0 + (f - .5)*fw}" y="${top - 7}" text-anchor="middle" font-size="8" fill="var(--cream4)" font-family="Inter,system-ui,sans-serif">${f}</text>`;
  return s + '</svg>';
}


/* ═══════ AU FEELING — choisir une ambiance, jouer sa suite d'accords en boucle ═══════
   Données (AMBIANCES, FEEL_PROGS, ARPS, EFFECTS) + un lecteur qui s'appuie sur le moteur rhStart :
   1 accord = 1 mesure, le rythme (RHYTHMS) ou l'arpège (ARPS, écrit en rôles de cordes) s'applique à chaque accord,
   un effet (EFFECTS) vient s'ajouter en fin de mesure. Tout se combine ; rien n'est stocké (état en mémoire). */
const AMBIANCES = [
  {id:'joyeux',       n:'Joyeux',        d:'Lumineux, qui donne le sourire'},
  {id:'triste',       n:'Triste',        d:'Mineur, qui serre le cœur'},
  {id:'melancolique', n:'Mélancolique',  d:'Doux-amer, nostalgique'},
  {id:'energique',    n:'Énergique',     d:'Rock, ça pousse'},
  {id:'feu',          n:'Feu de camp',   d:'Tout le monde chante'},
  {id:'reveur',       n:'Rêveur',        d:'Planant, accords colorés'},
  {id:'blues',        n:'Blues',         d:'Le 12 mesures, shuffle'},
  {id:'epique',       n:'Épique',        d:'Grandiose, cinématique'},
  {id:'romantique',   n:'Romantique',    d:'Slow, tendre, à deux'},
  {id:'latino',       n:'Latino',        d:'Chaud, dansant, bossa et rumba'},
  {id:'roadtrip',     n:'Road trip',     d:'Vitres ouvertes, radio à fond'},
];

const FEEL_PROGS = [
 // ── JOYEUX
 {id:'j1', amb:'joyeux', n:'La pop qui marche', ton:'G', deg:['I','V','vi','IV'], ch:['G','D','Em','C'], bpm:[90,120], rh:['feucamp','croches','chuck'], niv:1},
 {id:'j2', amb:'joyeux', n:'Les quatre accords', ton:'C', deg:['I','V','vi','IV'], ch:['C','G','Am','F'], facile:['C','G','Am','Fmaj7'], bpm:[80,110], rh:['feucamp','ballade','croches'], niv:2, ex:['Let It Be']},
 {id:'j3', amb:'joyeux', n:'Trois accords, zéro prise de tête', ton:'G', deg:['I','IV','I','V'], ch:['G','C','G','D'], bpm:[90,130], rh:['croches','feucamp','noires'], niv:1},
 {id:'j4', amb:'joyeux', n:'Doo-wop ensoleillé', ton:'A', deg:['I','vi','IV','V'], ch:['A','F#m','D','E'], bpm:[85,115], rh:['ballade','croches','feucamp'], niv:2, ex:['Stand By Me']},

 // ── TRISTE
 {id:'t1', amb:'triste', n:'Le grand classique triste', ton:'G', deg:['vi','IV','I','V'], ch:['Em','C','G','D'], bpm:[70,95], rh:['ballade','noires','feucamp'], niv:1, ex:['Zombie']},
 {id:'t2', amb:'triste', n:'Mineur pop', ton:'C', deg:['vi','IV','I','V'], ch:['Am','F','C','G'], facile:['Am','Fmaj7','C','G'], bpm:[65,90], rh:['ballade','six8','noires'], niv:2},
 {id:'t3', amb:'triste', n:'Cadence andalouse', ton:'Am', deg:['i','VII','VI','V'], ch:['Am','G','F','E'], bpm:[70,100], rh:['feucamp','croches','noires'], niv:2},
 {id:'t4', amb:'triste', n:'Larmes en ré mineur', ton:'F', deg:['vi','IV','I','V'], ch:['Dm','Bb','F','C'], bpm:[65,90], rh:['ballade','six8','noires'], niv:3},

 // ── MÉLANCOLIQUE
 {id:'m1', amb:'melancolique', n:'Le retour en boucle', ton:'C', deg:['vi','ii','V','I'], ch:['Am','Dm','G','C'], bpm:[70,100], rh:['ballade','six8','feucamp'], niv:1},
 {id:'m2', amb:'melancolique', n:'Descente douce en sol', ton:'G', deg:['vi','ii','V','I'], ch:['Em','Am','D','G'], bpm:[70,100], rh:['ballade','feucamp','valse'], niv:1},
 {id:'m3', amb:'melancolique', n:'Brume', ton:'C', deg:['vi','iii','IV','I'], ch:['Am','Em','Fmaj7','C'], bpm:[60,85], rh:['ballade','six8','noires'], niv:1},
 {id:'m4', amb:'melancolique', n:'Ballade en la mineur (8 mesures)', ton:'Am', deg:['i','III','IV','VI','i','III','V','V'], ch:['Am','C','D','F','Am','C','E','E'], bpm:[70,100], rh:['six8','ballade','valse'], niv:2, ex:['The House of the Rising Sun']},

 // ── ÉNERGIQUE
 {id:'e1', amb:'energique', n:'Rock 1-4-5', ton:'E', deg:['I','IV','V','I'], ch:['E','A','B7','E'], facile:['E','A','B7','E'], bpm:[110,150], rh:['rock8','croches','chuck'], niv:1},
 {id:'e2', amb:'energique', n:'Mixolydien (♭VII)', ton:'D', deg:['I','♭VII','IV','I'], ch:['D','C','G','D'], bpm:[100,140], rh:['rock8','croches','feucamp'], niv:1, ex:['Sweet Home Alabama']},
 {id:'e3', amb:'energique', n:'Montée de rage', ton:'Am', deg:['i','♭VII','♭VI','♭VII'], ch:['Am','G','F','G'], bpm:[100,140], rh:['rock8','chuck','croches'], niv:2},
 {id:'e4', amb:'energique', n:'La, en avant', ton:'A', deg:['I','♭VII','IV','I'], ch:['A','G','D','A'], bpm:[110,150], rh:['rock8','croches','chuck'], niv:1},

 // ── FEU DE CAMP
 {id:'f1', amb:'feu', n:'Le tube autour du feu', ton:'G', deg:['I','vi','IV','V'], ch:['G','Em','C','D'], bpm:[80,110], rh:['feucamp','croches','ballade'], niv:1},
 {id:'f2', amb:'feu', n:'Do-la-fa-sol', ton:'C', deg:['I','vi','IV','V'], ch:['C','Am','F','G'], facile:['C','Am','Fmaj7','G'], bpm:[80,105], rh:['feucamp','ballade','valse'], niv:2},
 {id:'f3', amb:'feu', n:'Ré-sol-la', ton:'D', deg:['I','IV','V','I'], ch:['D','G','A','D'], bpm:[90,120], rh:['feucamp','croches','noires'], niv:1},
 {id:'f4', amb:'feu', n:'Sol-ré-do', ton:'G', deg:['I','V','IV','I'], ch:['G','D','C','G'], bpm:[85,115], rh:['feucamp','valse','reggae'], niv:1, ex:["Knockin' on Heaven's Door (G D Am / G D C)"]},

 // ── RÊVEUR
 {id:'r1', amb:'reveur', n:'Nuage jazzy', ton:'C', deg:['Imaj7','vi7','ii7','V7'], ch:['Cmaj7','Am7','Dm7','G7'], bpm:[70,100], rh:['ballade','six8','reggae'], niv:1},
 {id:'r2', amb:'reveur', n:'Couleurs add9', ton:'G', deg:['Iadd9','vi7','IVadd9','Vsus4'], ch:['Gadd9','Em7','Cadd9','Dsus4'], bpm:[70,100], rh:['ballade','feucamp','six8'], niv:2},
 {id:'r3', amb:'reveur', n:'Matin en ré', ton:'D', deg:['Imaj7','vi7','IVmaj7','V'], ch:['Dmaj7','Bm7','Gmaj7','A'], bpm:[70,100], rh:['ballade','six8','croches'], niv:2, note:'Bm7 = doigté à ajouter (section 0)'},
 {id:'r4', amb:'reveur', n:'Escalier descendant', ton:'C', deg:['IVmaj7','iii7','ii7','Imaj7'], ch:['Fmaj7','Em7','Dm7','Cmaj7'], bpm:[60,90], rh:['six8','ballade','valse'], niv:1},

 // ── BLUES (12 mesures, 1 accord par mesure dans `ch`)
 {id:'b1', amb:'blues', n:'Blues en mi', ton:'E', deg:['I7','I7','I7','I7','IV7','IV7','I7','I7','V7','IV7','I7','V7'], ch:['E7','E7','E7','E7','A7','A7','E7','E7','B7','A7','E7','B7'], bpm:[70,110], rh:['shuffle','rock8','reggae'], niv:1},
 {id:'b2', amb:'blues', n:'Blues en la', ton:'A', deg:['I7','I7','I7','I7','IV7','IV7','I7','I7','V7','IV7','I7','V7'], ch:['A7','A7','A7','A7','D7','D7','A7','A7','E7','D7','A7','E7'], bpm:[70,110], rh:['shuffle','rock8','reggae'], niv:1},
 {id:'b3', amb:'blues', n:'Blues en sol', ton:'G', deg:['I7','I7','I7','I7','IV7','IV7','I7','I7','V7','IV7','I7','V7'], ch:['G7','G7','G7','G7','C7','C7','G7','G7','D7','C7','G7','D7'], bpm:[70,100], rh:['shuffle','rock8'], niv:1},
 {id:'b4', amb:'blues', n:'Blues mineur', ton:'Am', deg:['i7','i7','i7','i7','iv7','iv7','i7','i7','V7','iv7','i7','V7'], ch:['Am7','Am7','Am7','Am7','Dm7','Dm7','Am7','Am7','E7','Dm7','Am7','E7'], bpm:[60,90], rh:['shuffle','ballade','six8'], niv:2},

 // ── ÉPIQUE
 {id:'p1', amb:'epique', n:'Marche en mi mineur', ton:'Em', deg:['i','♭VI','♭VII','i'], ch:['Em','C','D','Em'], bpm:[80,110], rh:['noires','rock8','six8'], niv:1},
 {id:'p2', amb:'epique', n:'Grandeur en ré mineur', ton:'Dm', deg:['i','♭VI','♭VII','i'], ch:['Dm','Bb','C','Dm'], bpm:[75,105], rh:['noires','rock8','six8'], niv:3},
 {id:'p3', amb:'epique', n:'Odyssée', ton:'Am', deg:['i','♭VI','♭VII','i'], ch:['Am','F','G','Am'], bpm:[75,105], rh:['noires','six8','rock8'], niv:2},
 {id:'p4', amb:'epique', n:'Envolée en ré', ton:'D', deg:['vi','IV','I','V'], ch:['Bm','G','D','A'], bpm:[80,110], rh:['croches','noires','six8'], niv:2},

 // ── JOYEUX
 {id:'j5', amb:'joyeux', n:'Soleil en do', ton:'C', deg:['I','IV','V','IV'], ch:['C','F','G','F'], facile:['C','Fmaj7','G','Fmaj7'], bpm:[85,120], rh:['folk2','motown','croches'], niv:2},
 {id:'j6', amb:'joyeux', n:'Ré-la-sol', ton:'D', deg:['I','V','IV','I'], ch:['D','A','G','D'], bpm:[95,130], rh:['boomchick','feucamp','trous'], niv:1},
 {id:'j7', amb:'joyeux', n:'Pop en la', ton:'A', deg:['I','V','vi','IV'], ch:['A','E','F#m','D'], bpm:[90,125], rh:['popsync','feu2','croches'], niv:2},
 {id:'j8', amb:'joyeux', n:'Ça balance en mi', ton:'E', deg:['I','IV','V7','IV'], ch:['E','A','B7','A'], bpm:[100,140], rh:['rockaere','croches','shufflechuck'], niv:1},
 {id:'j9', amb:'joyeux', n:'Soul lumineuse', ton:'C', deg:['I','vi','ii','V'], ch:['C','Am','Dm','G'], bpm:[85,115], rh:['motown','trous','croches'], niv:1},

 // ── TRISTE
 {id:'t5', amb:'triste', n:'Pluie fine', ton:'Am', deg:['i','III','VII','VI'], ch:['Am','C','G','F'], facile:['Am','C','G','Fmaj7'], bpm:[65,90], rh:['douce','six8b','ballade'], niv:2},
 {id:'t6', amb:'triste', n:'Chute lente', ton:'Am', deg:['i','iv','i','V'], ch:['Am','Dm','Am','E'], bpm:[65,95], rh:['douce','ballade','noires'], niv:1},
 {id:'t7', amb:'triste', n:'Soupir en mi mineur', ton:'Em', deg:['i','iv','VI','V7'], ch:['Em','Am','C','B7'], bpm:[65,95], rh:['douce','six8b','ballade'], niv:1},
 {id:'t8', amb:'triste', n:'Ritournelle sombre', ton:'Em', deg:['i','VI','iv','V7'], ch:['Em','C','Am','B7'], bpm:[65,95], rh:['ballade','douce','feucamp'], niv:1},

 // ── MÉLANCOLIQUE
 {id:'m5', amb:'melancolique', n:'Souvenirs', ton:'C', deg:['I','iii','vi','IV'], ch:['C','Em','Am','F'], facile:['C','Em','Am','Fmaj7'], bpm:[70,100], rh:['douce','ballade','six8'], niv:2},
 {id:'m6', amb:'melancolique', n:'Fin d\'été', ton:'G', deg:['I','iii','IV','V'], ch:['G','Bm','C','D'], facile:['G','Bm7','C','D'], bpm:[70,100], rh:['douce','feucamp','valse3'], niv:2},
 {id:'m7', amb:'melancolique', n:'Pluie sur la vitre', ton:'Em', deg:['i','♭VII','♭VI','♭VII'], ch:['Em','D','C','D'], bpm:[70,100], rh:['douce','ballade','six8b'], niv:1},
 {id:'m8', amb:'melancolique', n:'Fin de soirée', ton:'D', deg:['I','vi','ii','V'], ch:['D','Bm','Em','A'], facile:['D','Bm7','Em','A'], bpm:[70,100], rh:['douce','ballade','slow12'], niv:2},

 // ── ÉNERGIQUE
 {id:'e5', amb:'energique', n:'Power en ré', ton:'D', deg:['I','IV','V','IV'], ch:['D','G','A','G'], bpm:[110,150], rh:['rock8','rockgal','grunge'], niv:1},
 {id:'e6', amb:'energique', n:'Cap à l\'ouest', ton:'G', deg:['I','♭VII','IV','I'], ch:['G','F','C','G'], facile:['G','Fmaj7','C','G'], bpm:[100,140], rh:['rock8','rockaere','chuck'], niv:2},
 {id:'e7', amb:'energique', n:'Poursuite', ton:'Em', deg:['i','♭VII','♭VI','♭III'], ch:['Em','D','C','G'], bpm:[105,145], rh:['grunge','rock8','rockgal'], niv:1},
 {id:'e8', amb:'energique', n:'Pogo', ton:'A', deg:['I','IV','V','IV'], ch:['A','D','E','D'], bpm:[120,160], rh:['rock8','rockgal','croches'], niv:1},
 {id:'e9', amb:'energique', n:'Funk dorien', ton:'Am', deg:['i7','IV7','i7','IV7'], ch:['Am7','D7','Am7','D7'], bpm:[85,105], rh:['funk16','shufflechuck','chuck'], niv:2},

 // ── FEU DE CAMP
 {id:'f5', amb:'feu', n:'Voyage', ton:'G', deg:['I','IV','vi','V'], ch:['G','C','Em','D'], bpm:[85,115], rh:['feu2','boomchick','feucamp'], niv:1},
 {id:'f6', amb:'feu', n:'Feu rapide', ton:'D', deg:['I','vi','IV','V'], ch:['D','Bm','G','A'], facile:['D','Bm7','G','A'], bpm:[90,125], rh:['feucamp','folk2','feu2'], niv:2},
 {id:'f7', amb:'feu', n:'Cow-boy', ton:'D', deg:['I','IV','I','V'], ch:['D','G','D','A'], bpm:[90,125], rh:['boomchick','trous','folk2'], niv:1},
 {id:'f8', amb:'feu', n:'Crooner de plage', ton:'G', deg:['I','vi','ii','V'], ch:['G','Em','Am','D'], bpm:[85,115], rh:['feu2','ballade','motown'], niv:1},

 // ── RÊVEUR
 {id:'r5', amb:'reveur', n:'Lent berceau', ton:'G', deg:['Imaj7','IVadd9','Imaj7','vi7'], ch:['Gmaj7','Cadd9','Gmaj7','Em7'], bpm:[60,90], rh:['six8','douce','ballade'], niv:1},
 {id:'r6', amb:'reveur', n:'Eaux calmes', ton:'A', deg:['Isus2','IVmaj7','Isus2','V'], ch:['Asus2','Dmaj7','Asus2','E'], bpm:[65,95], rh:['douce','six8b','ballade'], niv:1},
 {id:'r7', amb:'reveur', n:'Flottement', ton:'C', deg:['Iadd9','iii7','IVmaj7','Vadd9'], ch:['Cadd9','Em7','Fmaj7','Gadd9'], bpm:[70,100], rh:['douce','bossa','six8'], niv:1},
 {id:'r8', amb:'reveur', n:'Marée', ton:'G', deg:['vi7','IVmaj7','Iadd9','Vsus4'], ch:['Em7','Cmaj7','Gadd9','Dsus4'], bpm:[65,95], rh:['douce','ballade','six8b'], niv:1},

 // ── BLUES
 {id:'b5', amb:'blues', n:'Blues rapide en mi (quick change)', ton:'E', deg:['I7','IV7','I7','I7','IV7','IV7','I7','I7','V7','IV7','I7','V7'], ch:['E7','A7','E7','E7','A7','A7','E7','E7','B7','A7','E7','B7'], bpm:[70,110], rh:['shuffle','shufflechuck','rock8'], niv:1},
 {id:'b6', amb:'blues', n:'Blues en ré', ton:'D', deg:['I7','I7','I7','I7','IV7','IV7','I7','I7','V7','IV7','I7','V7'], ch:['D7','D7','D7','D7','G7','G7','D7','D7','A7','G7','D7','A7'], bpm:[70,110], rh:['shuffle','shufflechuck','slow12'], niv:1},
 {id:'b7', amb:'blues', n:'Blues lent mineur en mi', ton:'Em', deg:['i7','i7','i7','i7','iv7','iv7','i7','i7','V7','iv7','i7','V7'], ch:['Em7','Em7','Em7','Em7','Am7','Am7','Em7','Em7','B7','Am7','Em7','B7'], bpm:[55,85], rh:['slow12','shuffle','ballade'], niv:1},
 {id:'b8', amb:'blues', n:'Blues en 8 mesures', ton:'E', deg:['I7','V7','IV7','IV7','I7','V7','I7','V7'], ch:['E7','B7','A7','A7','E7','B7','E7','B7'], bpm:[70,100], rh:['shuffle','rock8','boomchick'], niv:1},

 // ── ÉPIQUE
 {id:'p5', amb:'epique', n:'Marche en mi mineur (2)', ton:'Em', deg:['i','III','VII','VI'], ch:['Em','G','D','C'], bpm:[80,110], rh:['noires','rock8','six8'], niv:1},
 {id:'p6', amb:'epique', n:'Armée en marche', ton:'Em', deg:['i','v','♭VI','♭VII'], ch:['Em','Bm','C','D'], facile:['Em','Bm7','C','D'], bpm:[80,110], rh:['noires','rock8','grunge'], niv:2},
 {id:'p7', amb:'epique', n:'Quête', ton:'Am', deg:['i','iv','V','i'], ch:['Am','Dm','E','Am'], bpm:[70,100], rh:['noires','six8','rock8'], niv:1},

 // ── ROMANTIQUE
 {id:'ro1', amb:'romantique', n:'Première danse', ton:'C', deg:['I','IV','ii','V'], ch:['C','F','Dm','G'], facile:['C','Fmaj7','Dm','G'], bpm:[70,100], rh:['douce','bossa','ballade'], niv:2},
 {id:'ro2', amb:'romantique', n:'Tendre en sol', ton:'G', deg:['I','iii','vi','IV'], ch:['G','Bm','Em','C'], facile:['G','Bm7','Em','C'], bpm:[70,100], rh:['ballade','douce','six8'], niv:2},
 {id:'ro3', amb:'romantique', n:'Nuit étoilée', ton:'D', deg:['Imaj7','vi7','ii7','V'], ch:['Dmaj7','Bm7','Em7','A'], bpm:[65,95], rh:['bossa','douce','six8b'], niv:1},
 {id:'ro4', amb:'romantique', n:'Le Canon (8 mesures)', ton:'G', deg:['I','V','vi','iii','IV','I','IV','V'], ch:['G','D','Em','Bm','C','G','C','D'], facile:['G','D','Em','Bm7','C','G','C','D'], bpm:[60,90], rh:['douce','ballade','six8b'], niv:2, ex:['Canon de Pachelbel (écrit en ré, ici transposé en sol)']},

 // ── LATINO
 {id:'la1', amb:'latino', n:'Bossa simple', ton:'C', deg:['Imaj7','ii7','V7','Imaj7'], ch:['Cmaj7','Dm7','G7','Cmaj7'], bpm:[90,125], rh:['bossa','douce','trous'], niv:1},
 {id:'la2', amb:'latino', n:'Habanera', ton:'Am', deg:['i','V7','i','V7'], ch:['Am','E7','Am','E7'], bpm:[90,120], rh:['rumba','bossa','boomchick'], niv:1},
 {id:'la3', amb:'latino', n:'Bossa nostalgique', ton:'C', deg:['vi7','ii7','V7','Imaj7'], ch:['Am7','Dm7','G7','Cmaj7'], bpm:[90,125], rh:['bossa','douce','trous'], niv:1},
 {id:'la4', amb:'latino', n:'Fiesta', ton:'A', deg:['I','IV','V7','I'], ch:['A','D','E7','A'], bpm:[110,140], rh:['rumba','folk2','motown'], niv:1},

 // ── ROAD TRIP
 {id:'rt1', amb:'roadtrip', n:'Fenêtre ouverte', ton:'D', deg:['I','V','ii','IV'], ch:['D','A','Em','G'], bpm:[90,125], rh:['folk2','popsync','boomchick'], niv:1},
 {id:'rt2', amb:'roadtrip', n:'Radio', ton:'C', deg:['I','V','IV','V'], ch:['C','G','F','G'], facile:['C','G','Fmaj7','G'], bpm:[85,120], rh:['rockaere','motown','feucamp'], niv:2},
 {id:'rt3', amb:'roadtrip', n:'Station-service', ton:'E', deg:['I','♭VII','IV','I'], ch:['E','D','A','E'], bpm:[100,135], rh:['rockaere','rock8','grunge'], niv:1},
 {id:'rt4', amb:'roadtrip', n:'Coucher de soleil', ton:'D', deg:['I','IV','vi','V'], ch:['D','G','Bm','A'], facile:['D','G','Bm7','A'], bpm:[85,115], rh:['feu2','popsync','douce'], niv:2},
];
/* 2-3 rythmes par suite, le 1er = défaut (★) ; prioritaires sur les rh de FEEL_PROGS */
// Toutes les suites sont en 4/4 (aucune 3/4 ni 6/8 dans FEEL_PROGS) : uniquement des rythmes 4/4.
const FEEL_RH = {
 j1:['feucamp','croches','chuck'], j2:['feucamp','ballade','croches'], j3:['croches','feucamp','noires'], j4:['ballade','motown','croches'],
 j5:['folk2','motown','croches'], j6:['boomchick','folk2','feucamp'], j7:['popsync','feu2','croches'], j8:['rockaere','croches','shufflechuck'], j9:['motown','trous','croches'],
 t1:['ballade','douce','noires'], t2:['ballade','douce','noires'], t3:['feucamp','ballade','noires'], t4:['douce','ballade','noires'],
 t5:['douce','ballade'], t6:['douce','ballade','noires'], t7:['douce','ballade'], t8:['ballade','douce','feucamp'],
 m1:['ballade','douce','feucamp'], m2:['ballade','douce','feucamp'], m3:['douce','ballade','noires'], m4:['ballade','douce','feucamp'],
 m5:['douce','ballade'], m6:['douce','ballade','feucamp'], m7:['douce','ballade'], m8:['douce','ballade','slow12'],
 e1:['rock8','rockaere','chuck'], e2:['rock8','rockaere','croches'], e3:['rock8','chuck','grunge'], e4:['rock8','rockaere','croches'],
 e5:['rock8','rockgal','grunge'], e6:['rock8','rockaere','chuck'], e7:['grunge','rock8','rockgal'], e8:['rock8','rockgal','croches'], e9:['funk16','chuck','shufflechuck'],
 f1:['feucamp','croches','ballade'], f2:['feucamp','ballade','feu2'], f3:['feucamp','folk2','croches'], f4:['feucamp','feu2','boomchick'],
 f5:['feu2','feucamp','boomchick'], f6:['feucamp','folk2','feu2'], f7:['boomchick','folk2','trous'], f8:['feu2','ballade','motown'],
 r1:['ballade','douce','reggae'], r2:['ballade','douce','feucamp'], r3:['ballade','douce','bossa'], r4:['douce','ballade','noires'],
 r5:['douce','ballade','noires'], r6:['douce','ballade'], r7:['douce','bossa','ballade'], r8:['douce','ballade','reggae'],
 b1:['shuffle','shufflechuck','slow12'], b2:['shuffle','shufflechuck','rock8'], b3:['shuffle','shufflechuck','rock8'], b4:['slow12','shuffle','ballade'],
 b5:['shuffle','shufflechuck','rock8'], b6:['shuffle','shufflechuck','slow12'], b7:['slow12','shuffle','ballade'], b8:['shuffle','shufflechuck','boomchick'],
 p1:['noires','rock8','grunge'], p2:['noires','rock8','grunge'], p3:['noires','rock8','ballade'], p4:['croches','noires','rock8'],
 p5:['noires','rock8','rockaere'], p6:['noires','rock8','grunge'], p7:['noires','ballade','rock8'],
 ro1:['douce','bossa','ballade'], ro2:['ballade','douce','motown'], ro3:['bossa','douce','ballade'], ro4:['douce','ballade','noires'],
 la1:['bossa','douce','trous'], la2:['rumba','bossa','boomchick'], la3:['bossa','douce','trous'], la4:['rumba','folk2','motown'],
 rt1:['folk2','popsync','boomchick'], rt2:['rockaere','motown','feucamp'], rt3:['rockaere','rock8','grunge'], rt4:['feu2','popsync','douce'],
};
FEEL_PROGS.forEach(p => { if (FEEL_RH[p.id]) p.rh = FEEL_RH[p.id].slice(); });

/* ── Riffs entre les accords + Accords ouverts : deux sections de Exercices, même lecteur que Au feeling ──
   RIFF_PROGS : 1 accord par mesure (mes:2 = 2 mesures par accord, le fill n'arrive qu'à la 2e) ; fills[i] relie accords[i] à accords[i+1] ;
   debut = 1re case du rythme remplacée par le fill (res cases par mesure), sub = colonnes de tab par temps (2 croches, 3 triolet, 4 doubles).
   OPEN_PROGS : comme FEEL_PROGS + ancre (doigt commun, surligné sur les diagrammes) et vides (cordes à vide qui résonnent, 6 = grave). */
const RIFF_PROGS = [
 {id:'rf1', nom:'Folk en sol, la basse relie', style:'folk', niveau:1, tonalite:'G', bpm:[90,110], accords:['G','C','G','D'], rythme:'folk2', mes:1, res:8,
  fills:[
   {de:'G', vers:'C', temps:'4 et', debut:6, sub:2, tab:'6.3 5.2'},
   {de:'C', vers:'G', temps:'4 et', debut:6, sub:2, tab:'4.2 3.0'},
   {de:'G', vers:'D', temps:'4 et', debut:6, sub:2, tab:'5.2 p 5.0'},
   {de:'D', vers:'G', temps:'4 et', debut:6, sub:2, tab:'3.2 p 3.0'}],
  conseil:'Garde la forme de l\'accord posée : le fill ne joue que des notes déjà sous tes doigts ou des cordes à vide.'},
 {id:'rf2', nom:'Pop en sol, la basse qui chante', style:'pop', niveau:1, tonalite:'G', bpm:[85,105], accords:['G','D','Em','C'], rythme:'feucamp', mes:1, res:8,
  fills:[
   {de:'G', vers:'D', temps:'4 et', debut:6, sub:2, tab:'6.3 4.0'},
   {de:'D', vers:'Em', temps:'4 et', debut:6, sub:2, tab:'3.2 p 3.0'},
   {de:'Em', vers:'C', temps:'4 et', debut:6, sub:2, tab:'2.0 h 2.1'},
   {de:'C', vers:'G', temps:'4 et', debut:6, sub:2, tab:'4.2 3.0'}],
  conseil:'Sur Em, le hammer-on de la corde de si pose déjà ton doigt 1 pour le C qui arrive.'},
 {id:'rf3', nom:'Ballade qui s\'écoule', style:'ballade', niveau:1, tonalite:'C', bpm:[70,88], accords:['C','Am','Dm','G'], rythme:'ballade', mes:1, res:8,
  fills:[
   {de:'C', vers:'Am', temps:'4 et', debut:6, sub:2, tab:'5.3 p 5.0'},
   {de:'Am', vers:'Dm', temps:'4 et', debut:6, sub:2, tab:'4.2 3.2'},
   {de:'Dm', vers:'G', temps:'4 et', debut:6, sub:2, tab:'3.2 p 3.0'},
   {de:'G', vers:'C', temps:'4 et', debut:6, sub:2, tab:'6.3 5.2'}],
  conseil:'Joue le fill très doux, comme une respiration entre deux accords.'},
 {id:'rf4', nom:'Country en ré', style:'country', niveau:1, tonalite:'D', bpm:[100,120], accords:['D','G','D','A'], rythme:'boomchick', mes:1, res:8,
  fills:[
   {de:'D', vers:'G', temps:'4 et', debut:6, sub:2, tab:'3.2 p 3.0'},
   {de:'G', vers:'D', temps:'4 et', debut:6, sub:2, tab:'5.2 4.0'},
   {de:'D', vers:'A', temps:'4 et', debut:6, sub:2, tab:'4.0 5.0'},
   {de:'A', vers:'D', temps:'4 et', debut:6, sub:2, tab:'4.2 p 4.0'}],
  conseil:'Le « chick » du 4 est remplacé par le fill : la basse reprend la main avant le boom suivant.'},
 {id:'rf5', nom:'Rock en la', style:'rock', niveau:2, tonalite:'A', bpm:[105,125], accords:['A','D','E','D'], rythme:'rockaere', mes:1, res:8,
  fills:[
   {de:'A', vers:'D', temps:'4 et', debut:6, sub:2, tab:'4.2 p 4.0'},
   {de:'D', vers:'E', temps:'4 et', debut:6, sub:2, tab:'2.3 p 2.0'},
   {de:'E', vers:'D', temps:'4 et', debut:6, sub:2, tab:'4.2 p 4.0'},
   {de:'D', vers:'A', temps:'4 et', debut:6, sub:2, tab:'4.0 5.0'}],
  conseil:'Trois bas carrés, puis le fill remplace le dernier coup : reste sec, pas de grattage dans la transition.'},
 {id:'rf6', nom:'Blues en mi, shuffle', style:'blues', niveau:2, tonalite:'E', bpm:[70,90], accords:['E7','A7','E7','B7'], rythme:'shuffle', mes:1, res:12,
  fills:[
   {de:'E7', vers:'A7', temps:'4', debut:9, sub:3, tab:'4.0 3.1 5.0'},
   {de:'A7', vers:'E7', temps:'4', debut:9, sub:3, tab:'3.0 4.2 6.0'},
   {de:'E7', vers:'B7', temps:'4', debut:9, sub:3, tab:'4.0 3.1 5.2'},
   {de:'B7', vers:'E7', temps:'4', debut:9, sub:3, tab:'3.2 2.0 6.0'}],
  conseil:'Trois notes en triolet sur le 4e temps (1-tri-ple) : swingue-les comme le shuffle.'},
 {id:'rf7', nom:'Andalouse avec liaisons', style:'ballade', niveau:3, tonalite:'Am', bpm:[75,95], accords:['Am','G','F','E'], rythme:'feucamp', mes:1, res:8,
  fills:[
   {de:'Am', vers:'G', temps:'4 et', debut:6, sub:2, tab:'3.2 p 3.0'},
   {de:'G', vers:'F', temps:'4 et', debut:6, sub:2, tab:'5.2 p 5.0'},
   {de:'F', vers:'E', temps:'4 et', debut:6, sub:2, tab:'5.3 \\ 5.2'},
   {de:'E', vers:'Am', temps:'4 et', debut:6, sub:2, tab:'3.1 4.2'}],
  conseil:'Sur F, garde le barré en place : le slide 5.3 vers 5.2 se fait avec le doigt 3 sans lâcher l\'accord.'},
 {id:'rf8', nom:'Pop motown en do', style:'pop', niveau:1, tonalite:'C', bpm:[90,110], accords:['C','G','Am','Em'], rythme:'motown', mes:1, res:8,
  fills:[
   {de:'C', vers:'G', temps:'4 et', debut:6, sub:2, tab:'4.2 3.0'},
   {de:'G', vers:'Am', temps:'4 et', debut:6, sub:2, tab:'5.2 p 5.0'},
   {de:'Am', vers:'Em', temps:'4 et', debut:6, sub:2, tab:'3.2 p 3.0'},
   {de:'Em', vers:'C', temps:'4 et', debut:6, sub:2, tab:'4.2 3.0'}],
  conseil:'Le fill remplace les deux derniers coups : garde le tambourin (hauts légers) sur les temps 1 à 3.'},
 {id:'rf9', nom:'Folk jazzy, 2 mesures par accord', style:'folk', niveau:2, tonalite:'G', bpm:[70,90], accords:['Am7','D7','Gmaj7','Cmaj7'], rythme:'ballade', mes:2, res:8,
  fills:[
   {de:'Am7', vers:'D7', temps:'4 et', debut:6, sub:2, tab:'3.0 4.0'},
   {de:'D7', vers:'Gmaj7', temps:'4 et', debut:6, sub:2, tab:'1.2 3.0'},
   {de:'Gmaj7', vers:'Cmaj7', temps:'4 et', debut:6, sub:2, tab:'2.0 3.0'},
   {de:'Cmaj7', vers:'Am7', temps:'4 et', debut:6, sub:2, tab:'4.2 5.0'}],
  conseil:'Première mesure : strum complet ; deuxième mesure : strum puis fill. Le fill ne vient qu\'une fois sur deux.'},
 {id:'rf10', nom:'Rock en mi mineur', style:'rock', niveau:2, tonalite:'Em', bpm:[100,125], accords:['Em','G','D','A'], rythme:'rock8', mes:1, res:8,
  fills:[
   {de:'Em', vers:'G', temps:'4 et', debut:6, sub:2, tab:'6.0 5.2'},
   {de:'G', vers:'D', temps:'4 et', debut:6, sub:2, tab:'5.2 4.0'},
   {de:'D', vers:'A', temps:'4 et', debut:6, sub:2, tab:'4.0 5.0'},
   {de:'A', vers:'Em', temps:'4 et', debut:6, sub:2, tab:'4.2 6.0'}],
  conseil:'Six bas puis deux notes seules de basse : le contraste fait l\'effet.'},
 {id:'rf11', nom:'Arpège de liaison en sol', style:'ballade', niveau:2, tonalite:'G', bpm:[70,90], accords:['G','Em','C','D'], rythme:'douce', mes:1, res:8,
  fills:[
   {de:'G', vers:'Em', temps:'4', debut:6, sub:4, tab:'1.3 p 1.0 2.0 3.0'},
   {de:'Em', vers:'C', temps:'4', debut:6, sub:4, tab:'1.0 2.0 3.0 4.2'},
   {de:'C', vers:'D', temps:'4', debut:6, sub:4, tab:'2.1 3.0 4.2 p 4.0'},
   {de:'D', vers:'G', temps:'4', debut:6, sub:4, tab:'1.2 2.3 3.2 p 3.0'}],
  conseil:'Quatre notes en doubles croches sur le 4e temps : un petit arpège qui descend ou monte dans l\'accord.'},
 {id:'rf12', nom:'Folk rock en mi', style:'rock', niveau:2, tonalite:'E', bpm:[95,115], accords:['E','A','D','A'], rythme:'feu2', mes:1, res:8,
  fills:[
   {de:'E', vers:'A', temps:'4 et', debut:6, sub:2, tab:'5.2 p 5.0'},
   {de:'A', vers:'D', temps:'4 et', debut:6, sub:2, tab:'4.2 p 4.0'},
   {de:'D', vers:'A', temps:'4 et', debut:6, sub:2, tab:'4.0 5.0'},
   {de:'A', vers:'E', temps:'4 et', debut:6, sub:2, tab:'4.2 6.0'}],
  conseil:'E-A-D-A : le « I-IV-bVII-IV » du rock ; le pull-off tombe tout seul sur la corde à vide suivante.'},
];
const OPEN_PROGS = [
 {id:'o1',  amb:'joyeux',       n:'Folk lumineux', ton:'G', deg:['I','IVadd9','I','Vsus4'], ch:['G','Cadd9','G','Dsus4'], bpm:[90,115], rh:['folk2','feucamp','croches'], niv:2,
  ancre:'Le petit doigt reste sur le mi aigu, case 3, pour les quatre accords.', vides:[], conseil:'Ne lève jamais le petit doigt : G, Cadd9 et Dsus4 le partagent.'},
 {id:'o2',  amb:'feu',          n:'La basse qui descend', ton:'G', deg:['I','V/3','vi add9','IVadd9'], ch:['G','D/F#','Emadd9','Cadd9'], bpm:[80,105], rh:['ballade','feucamp','folk2'], niv:2,
  ancre:'Pas de doigt commun : suis la basse, sol, fa#, mi, do (corde 6 : 3, 2, 0 puis corde 5 : 3).', vides:[], conseil:'Sur Emadd9 et D/F#, écoute la ligne de basse descendre avant de chanter par-dessus.'},
 {id:'o3',  amb:'reveur',       n:'Planant en ré', ton:'D', deg:['Isus2','Vsus4(7)','ii7','Vsus4(7)'], ch:['Dsus2','A7sus4','Em7','A7sus4'], bpm:[70,95], rh:['douce','reggae','ballade'], niv:2,
  ancre:'Le doigt sur la corde de si (2), case 3, ne bouge pas, et le mi aigu (1) reste à vide.', vides:[1], conseil:'Un ou deux doigts bougent à chaque changement : laisse sonner le mi aigu à vide.'},
 {id:'o4',  amb:'melancolique', n:'Descente en la mineur', ton:'Am', deg:['i7','VII6','VImaj7','v7'], ch:['Am7','G6','Fmaj7','Em7'], bpm:[65,90], rh:['douce','ballade','feucamp'], niv:2,
  ancre:'La corde de mi aigu reste à vide dans les quatre accords.', vides:[1], conseil:'La basse descend la, sol, fa, mi : fais-la ressortir avec le pouce.'},
 {id:'o5',  amb:'triste',       n:'Mi mineur ouvert', ton:'Em', deg:['i','VImaj7','iv7','VIIsus2'], ch:['Em','Cmaj7','Am7','Dsus2'], bpm:[65,90], rh:['douce','ballade','noires'], niv:1,
  ancre:'La corde de mi aigu reste à vide dans les quatre accords.', vides:[1], conseil:'Trois doigts ou moins par accord : laisse sonner, ne gratte pas fort.'},
 {id:'o6',  amb:'joyeux',       n:'Folk soleil en la', ton:'A', deg:['I','IVsus2','Isus2','Vsus4'], ch:['A','Dsus2','Asus2','Esus4'], bpm:[90,115], rh:['folk2','feu2','croches'], niv:2,
  ancre:'Un doigt reste sur la corde de sol (3), case 2, et le mi aigu (1) reste à vide, pour les quatre accords.', vides:[1], conseil:'Les accords sus sonnent ouverts : joue sans peur sur toutes les cordes (sauf la corde 6 sur A, Asus2, Dsus2).'},
 {id:'o7',  amb:'latino',       n:'Bossa douce en do', ton:'C', deg:['Imaj7','iii7','IVmaj7','V6'], ch:['Cmaj7','Em7','Fmaj7','G6'], bpm:[85,110], rh:['bossa','douce','reggae'], niv:2,
  ancre:'La corde de mi aigu reste à vide dans les quatre accords.', vides:[1], conseil:'Touché léger, sans accent : ces accords n\'ont pas besoin de force pour être jolis.'},
 {id:'o8',  amb:'energique',    n:'Em7 – G – Dsus4 – A7sus4', ton:'G', deg:['vi7','I','Vsus4','II7sus4'], ch:['Em7 (ancre)','G (ancre)','Dsus4','A7sus4 (ancre)'], bpm:[80,100], rh:['popsync','folk2','chuck'], niv:2,
  ancre:'Annulaire et petit doigt restent sur la corde 2 et la corde 1, case 3 (si et mi aigus), pendant les quatre accords.', vides:[], ex:['Wonderwall (capo 2)'], conseil:'Deux doigts fixes, les autres bougent : le célèbre mur de son des accords sus.'},
 {id:'o9',  amb:'romantique',   n:'La basse qui monte en ré', ton:'D', deg:['I','I/3','IV','V'], ch:['D','D/F#','G','A'], bpm:[70,95], rh:['ballade','douce','feu2'], niv:2,
  ancre:'La corde de ré (4) reste à vide pour D, D/F# et G.', vides:[4], conseil:'Fais monter la basse ré, fa#, sol, la : c\'est elle qui crée l\'élan.'},
 {id:'o10', amb:'epique',       n:'Grand ciel ouvert', ton:'G', deg:['Isus2','vi7','IVadd9','Vsus4'], ch:['Gsus2','Em7 (ancre)','Cadd9','Dsus4'], bpm:[75,100], rh:['noires','folk2','rock8'], niv:2,
  ancre:'Deux doigts restent sur les cordes 2 et 1, case 3 (si et mi aigus), pendant les quatre accords.', vides:[], conseil:'Les deux cordes aiguës en case 3 sonnent comme un carillon qui ne bouge pas.'},
 {id:'o11', amb:'feu',          n:'Pédale de sol', ton:'G', deg:['I','IV/5','vi7','Vsus4'], ch:['G','C/G','Em7','Dsus4'], bpm:[80,105], rh:['feucamp','folk2','ballade'], niv:2,
  ancre:'Le mi grave, case 3 (sol), reste appuyé de G à C/G : la basse ne bouge pas.', vides:[], conseil:'Garde le sol grave de G à C/G : la basse tient et l\'accord change au-dessus.'},
 {id:'o12', amb:'joyeux',       n:'Le D qui respire', ton:'D', deg:['I','Isus4','I','Isus2'], ch:['D','Dsus4','D','Dsus2'], bpm:[85,115], rh:['folk2','feucamp','croches'], niv:1,
  ancre:'Les doigts sur les cordes 3 et 2 (cases 2 et 3) ne bougent pas : seule la corde de mi aigu change (2, puis 3, puis à vide).', vides:[4], conseil:'Un seul doigt travaille : à toi de faire respirer le D.'},
];
const FEEL_SECS = [
  {id:'riffs',   n:'Riffs entre les accords', d:'Une petite phrase de basse qui relie un accord au suivant', em:'🎸'},
  {id:'ouverts', n:'Accords ouverts',         d:'Sus, slash, add9 : un doigt fixe, des cordes à vide qui sonnent', em:'✨'},
];
const STYLE_FR = {folk:'Folk', pop:'Pop', ballade:'Ballade', country:'Country', rock:'Rock', blues:'Blues'};
RIFF_PROGS.forEach(p => { p.sec = 'riffs'; p.amb = 'riffs'; p.ch = p.accords; p.rh = [p.rythme]; p.deg = []; p.sub = `${STYLE_FR[p.style] || p.style} · en ${p.tonalite}`; });
OPEN_PROGS.forEach(p => { p.sec = 'ouverts'; });
OPEN_PROGS.find(p => p.id === 'o11').anc = [[0, 3]];   // pas de doigt commun aux 4 accords : seule la basse sol (corde 6, case 3) reste de G à C/G
const OPEN_STR = {1:'mi aigu', 2:'si', 3:'sol', 4:'ré', 5:'la', 6:'mi grave'};
/* ancre d'une suite : positions [corde 0=grave, case] tenues par TOUS les accords (ou p.anc), + cordes à vide `vides` */
function openHl(p) {
  if (p.hl) return p.hl;
  let anc = p.anc;
  if (!anc) {
    const cs = p.ch.map(n => findChord(n)).filter(Boolean);
    anc = cs.length ? cs[0].f.map((f, i) => [i, f]).filter(a => a[1] > 0 && cs.every(c => c.f[a[0]] === a[1])) : [];
  }
  return p.hl = {anc, vides: (p.vides || []).map(n => 6 - n)};
}

const ARPS = [
 {id:'montee',   n:'Montée',                mes:'4/4', sub:2, motif:'B 3 2 1 B 3 2 1',     bpm:[60,100], niv:1, doigts:'p i m a p i m a'},
 {id:'allerret', n:'Aller-retour',          mes:'4/4', sub:2, motif:'B 3 2 1 2 3 2 1',     bpm:[60,100], niv:1, doigts:'p i m a m i m a'},
 {id:'travis',   n:'Folk (basse alternée)', mes:'4/4', sub:2, motif:'B 2 B2 3 B 2 B2 3',   bpm:[70,110], niv:2, doigts:'p m p i p m p i', note:'le pouce alterne B / B2, comme dans les exercices existants'},
 {id:'pince',    n:'Pincé (chanson douce)', mes:'4/4', sub:2, motif:'B+1 3 2 3 B2+1 3 2 3',bpm:[60,95],  niv:2, doigts:'p+a i m i p+a i m i'},
 {id:'ballade68',n:'Ballade 6/8',           mes:'6/8', sub:3, motif:'B 3 2 1 2 3',         bpm:[50,80],  niv:1, doigts:'p i m a m i'},
 {id:'valse34',  n:'Valse 3/4',             mes:'3/4', sub:2, motif:'B 3+2+1 3+2+1',       bpm:[80,130], niv:1, doigts:'p (i m a) (i m a)', note:'1 case = 1 noire (sub:1)'},
];

const EFFECTS = [
 {id:'hammer', n:'Hammer-on : Asus2 → A', acc:'Asus2→A', tab:'2.0 h 2.2', ou:'fin de mesure, avant de changer', niv:1,
  expl:'Doigt posé sec sur la corde de si (case 2) : l\'accord s\'ouvre en La majeur.'},
 {id:'pull',   n:'Pull-off : D → Dsus2', acc:'D→Dsus2', tab:'1.2 p 1.0', ou:'temps 4 ou sur le "et" de 4', niv:1,
  expl:'Retire l\'annulaire de la corde de mi aigu en tirant légèrement vers le bas.'},
 {id:'slide',  n:'Slide d\'entrée', acc:'→G', tab:'6.2 / 6.3', ou:'juste avant le temps 1 de la mesure suivante', niv:2,
  expl:'Glisse la note grave depuis une case en dessous vers la note de l\'accord.'},
 {id:'sus4',   n:'Sus4 : D → Dsus4 → D', acc:'D', tab:'1.2 h 1.3 p 1.2', ou:'sur 2 temps vides de rythme (ex. fin de phrase)', niv:2,
  expl:'Petit doigt posé puis relâché sur la corde de mi aigu (case 3). Même idée : A → Asus4 : 2.2 h 2.3 p 2.2.'},
 {id:'palm',   n:'Palm mute', acc:'E5 / A5', tab:'6.0+5.2@PM 6.0+5.2@PM 6.0+5.2@PM 6.0+5.2@PM 6.0+5.2@PM 6.0+5.2@PM 6.0+5.2@PM 6.0+5.2@PM', ou:'tout le couplet, puis relâche au refrain', niv:2,
  expl:'Tranche de la main droite posée sur les cordes près du chevalet. Idéal avec rock8.'},
 {id:'ghost',  n:'Note fantôme (étouffé)', acc:'tous', pat:'DUXUDUXU', ou:'temps 2 et 4', niv:2,
  expl:'Main gauche relâche l\'accord, la main droite frappe quand même : le "chuck" qui donne le groove. Dans une tab : label @x.'},
];
const AMB_LOOK = {joyeux:['☀️','#e0a030'], triste:['🌧️','#5f86b0'], melancolique:['🍂','#b8743a'], energique:['⚡','#c8503a'],
  feu:['🔥','#d0602a'], reveur:['☁️','#9c86ae'], blues:['🎷','#4f7f9a'], epique:['⛰️','#7c8a5c'],
  romantique:['🌹','#c4607a'], latino:['💃','#d08a2a'], roadtrip:['🚗','#4f8f8a'], riffs:['🎸','#c8783a'], ouverts:['✨','#8a7aaa']};
const feel = {amb:null, prog:null, easy:{}, kind:'rh', rh:'feucamp', arp:'montee', fx:null, bpm:90, click:true, bar:-1, rf:'all', rm:'both'};
const feelNames = p => (feel.easy[p.id] && p.facile) ? p.facile : p.ch;
const feelAmbOf = id => AMBIANCES.find(a => a.id === id) || FEEL_SECS.find(a => a.id === id);
const feelAllProgs = () => FEEL_PROGS.concat(RIFF_PROGS, OPEN_PROGS);
const feelProg = () => feelAllProgs().find(p => p.id === feel.prog);
const feelSecList = id => id === 'riffs' ? RIFF_PROGS : id === 'ouverts' ? OPEN_PROGS : FEEL_PROGS.filter(p => p.amb === id);
const feelHead = p => p.sec ? feelAmbOf(p.sec) : feelAmbOf(p.amb);   // en-tête affiché : section ou ambiance
const feelRhy = () => RHYTHMS.find(r => r.id === feel.rh);
const feelArp = () => ARPS.find(a => a.id === feel.arp);
/* mesure / résolution effectives de la façon de jouer */
function feelMeter() {
  if (feel.kind === 'arp') { const a = feelArp(); return {mes:a.mes, res: a.mes === '3/4' ? 4 : 8}; }
  const r = feelRhy(); return {mes:r.mes, res:r.res};
}
/* rythme "fantôme" : temps 2 et 4 étouffés (4/4 en croches seulement) */
function feelPat() {
  const r = feelRhy();
  if (feel.fx !== 'ghost' || r.mes !== '4/4' || r.res !== 8) return r.pat;
  return r.pat.split('').map((c, i) => i === 2 || i === 6 ? 'X' : c).join('');
}
/* rôles de cordes → notes d'un accord ; B = grave la plus basse, B2 = 2e corde grave (cordes 4-6), 3/2/1 = sol/si/mi aigu */
function arpNotes(tok, chord) {
  if (tok === '-') return [];
  const pl = [0,1,2,3,4,5].filter(i => chord.frets[i] >= 0), B = pl[0], low = pl.filter(i => i <= 2), B2 = low[1] != null ? low[1] : B;
  return tok.split('+').map(r => ({B, B2, '3':3, '2':4, '1':5})[r]).filter(si => si != null && chord.frets[si] >= 0).map(si => ({si, fret:chord.frets[si]}));
}
const arpTabStr = (a, chord) => a.motif.split(' ').map(t => { const n = arpNotes(t, chord); return n.length ? n.map(o => `${6 - o.si}.${o.fret}`).join('+') : '-'; }).join(' ');
/* un effet s'applique-t-il à la suite en cours ? */
function fxApplies(fx, names) {
  const m = feelMeter();
  if (fx.id === 'hammer') return names.some(n => n === 'A' || n === 'Asus2');
  if (fx.id === 'pull') return names.includes('D');
  if (fx.id === 'sus4') return names.some(n => n === 'D' || n === 'A');
  if (fx.id === 'palm') return feel.kind === 'rh';
  if (fx.id === 'ghost') return feel.kind === 'rh' && m.mes === '4/4' && m.res === 8;
  return true;
}
/* notes d'ornement : [{pos de fin de mesure (1 = dernière case), si, fret}] pour la mesure `bar` */
function fxNotes(fx, names, bar) {
  const cur = names[bar % names.length], nxt = findChord(names[(bar + 1) % names.length]);
  if (fx === 'hammer' && (cur === 'A' || cur === 'Asus2')) return [[2, 4, 0], [1, 4, 2]];
  if (fx === 'pull' && cur === 'D') return [[2, 5, 2], [1, 5, 0]];
  if (fx === 'sus4' && (cur === 'D' || cur === 'A')) return cur === 'D' ? [[3, 5, 2], [2, 5, 3], [1, 5, 2]] : [[3, 4, 2], [2, 4, 3], [1, 4, 2]];
  if (fx === 'slide' && nxt) { const si = nxt.f.findIndex(f => f >= 0); return nxt.f[si] > 0 ? [[2, si, nxt.f[si] - 1], [1, si, nxt.f[si]]] : []; }
  return [];
}

/* ── écrans ── */
function feelStop() { if (rhPlaying('feel')) rhStop(); }
function feelBack() { feelStop(); if (feel.prog) feel.prog = null; else feel.amb = null; exoRender(); window.scrollTo(0, 0); }
function feelPickAmb(id) { feelStop(); feel.amb = id; feel.prog = null; exoRender(); window.scrollTo(0, 0); }
function feelPickProg(id) {
  feelStop(); feel.prog = id; const p = feelProg();
  feel.rh = p.rh[0]; feel.kind = 'rh'; feel.fx = null;
  feel.bpm = Math.round((p.bpm[0] + p.bpm[1])/2); feelFixBpm(); feel.rm = 'both';
  exoLog('feel'); exoSave(); exoRender(); window.scrollTo(0, 0);
}
/* 🎲 une suite au hasard + un de ses rythmes conseillés, tempo dans la fourchette, et c'est parti */
function feelSurprise() {
  feelStop();
  const pool = FEEL_PROGS.filter(p => p.id !== feel.prog), p = pool[Math.floor(Math.random()*pool.length)];
  feel.amb = p.amb; feelPickProg(p.id);
  const ok = p.rh.filter(id => RHYTHMS.some(r => r.id === id));
  feel.rh = ok[Math.floor(Math.random()*ok.length)]; feel.kind = 'rh'; feel.fx = null;
  feel.bpm = Math.round((p.bpm[0] + Math.random()*(p.bpm[1] - p.bpm[0]))/5)*5; feelFixBpm();
  exoRender(); feelPlay();
}
function feelRf(v) { feel.rf = v; exoRender(); }
function feelFixBpm() { const m = feelMeter(); if (m.mes === '6/8' && feel.bpm > 85) feel.bpm = 66; if (m.mes !== '6/8' && feel.bpm < 50) feel.bpm = 70; }
function feelEasy(id, e) {
  if (e) e.stopPropagation();
  const was = rhPlaying('feel'); feelStop(); feel.easy[id] = !feel.easy[id]; exoRender(); if (was) feelPlay();
}
function feelWay(kind, id) {
  const was = rhPlaying('feel'); feelStop();
  feel.kind = kind; feel[kind === 'rh' ? 'rh' : 'arp'] = id; feelFixBpm();
  const fx = EFFECTS.find(f => f.id === feel.fx); if (fx && !fxApplies(fx, feelNames(feelProg()))) feel.fx = null;
  exoRender(); if (was) feelPlay();
}
function feelFx(id) {
  const was = rhPlaying('feel'); feelStop(); feel.fx = feel.fx === id ? null : id; exoRender(); if (was) feelPlay();
}
function feelTempo(d) {
  feel.bpm = Math.max(30, Math.min(240, feel.bpm + d));
  if (rhPlaying('feel')) rhSetBpm(feel.bpm);
  const e = $('fl-bpm'); if (e) e.firstChild.nodeValue = feel.bpm;
}
function feelClick() {
  feel.click = !feel.click; if (rhP && rhP.key === 'feel') rhP.mute = !feel.click;
  const b = $('fl-click'); if (b) { b.classList.toggle('on', feel.click); b.textContent = feel.click ? 'Métronome : oui' : 'Métronome : non'; }
}

const feelDia = (n, sz, p) => chordSVG(newChord(n), {size:sz, hl: p && p.sec === 'ouverts' ? openHl(p) : null});
function feelCard(p) {   // refonte : les accords en gros, le nom, le tempo, un ▶
  const names = feelNames(p), u = [...new Set(names)].slice(0, 4).join(' ');
  const niv = p.niv === 1 ? 'facile' : p.niv === 2 ? 'moyen' : 'costaud';
  return `<div class="fl-card fl-c2" role="button" tabindex="0" onclick="feelPickProg('${p.id}')" onkeydown="if(event.key==='Enter')feelPickProg('${p.id}')">
    <div class="fl-c2t"><span class="fl-c2c">${esc(u)}</span><b>${esc(p.n)}</b><small>${p.bpm[0]} à ${p.bpm[1]} BPM, ${niv}</small></div>
    <span class="fl-c2p" aria-hidden="true">${PLAY_I}</span></div>`;
}
// la rangée des ambiances (puces)
function feelChips() {
  return `<div class="fl-chips">${AMBIANCES.map(a => `<button type="button" class="${feel.amb === a.id ? 'on' : ''}" aria-pressed="${feel.amb === a.id}" onclick="feelPickAmb('${a.id}')">${esc(a.n)}</button>`).join('')}</div>`;
}
function feelTiles() {
  return `${mediBulle('clin', 'Envie de quoi ce soir ? Choisis une ambiance, je te sors des suites qui sonnent.', {size: 50, cls: 'fl-medi'})}
    ${feelChips()}
    <button type="button" class="fl-rand" onclick="feelSurprise()">Au hasard : une suite et un rythme</button>
    <div class="fl-secs">${FEEL_SECS.map(a => `<button type="button" class="fl-sec" onclick="feelPickAmb('${a.id}')">
      <span><b>${esc(a.n)}</b><small>${esc(a.d)}, ${feelSecList(a.id).length} suites</small></span><svg class="chev" viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2 L8 8 L2 14"/></svg></button>`).join('')}</div>`;
}
function feelList() {
  const a = feelAmbOf(feel.amb), list = feelSecList(a.id);
  return `${a.em ? `<button type="button" class="btn btn-ghost btn-sm exo-back" onclick="feelBack()">&#8592; Suites d’accords</button><h2 class="fl-sh">${esc(a.n)}</h2>` : feelChips()}
    <div class="fl-cards fl-c2s">${list.map(feelCard).join('')}</div>`;
}
function feelPlayerHTML() {
  const p = feelProg(), a = feelHead(p), names = feelNames(p), m = feelMeter(), isR = p.sec === 'riffs', isO = p.sec === 'ouverts';
  const fxs = EFFECTS.map(f => ({f, ok: fxApplies(f, names)}));
  const fx = EFFECTS.find(f => f.id === feel.fx);
  const chip = (on, ok, click, label, rec) => `<button type="button" class="filt ${on ? 'on' : ''} ${ok === false ? 'off' : ''}" ${ok === false ? 'disabled title="Ne s’applique pas à cette suite"' : `onclick="${click}"`}>${label}${rec ? ' <i class="fl-rec">★</i>' : ''}</button>`;
  const rfOk = r => feel.rf === 'all' || r.id === feel.rh || p.rh.includes(r.id) && feel.rf === 'rec' || feel.rf === 'amb' && (r.amb || []).includes(p.amb) || feel.rf === r.niv;
  const rhs = RHYTHMS.filter(rfOk).sort((x, y) => (p.rh.includes(y.id) ? 1 : 0) - (p.rh.includes(x.id) ? 1 : 0));
  const rfs = [['all', 'Tous (' + RHYTHMS.length + ')'], ['rec', '★ Conseillés'], ['amb', a.n], [1, '● Facile'], [2, '●● Moyen'], [3, '●●● Costaud']];
  // rythmes ★ de la suite (+ le rythme choisi dans le repli s'il n'en fait pas partie) : un choix simple, le choisi est déplié
  const ids = p.rh.slice(); if (feel.kind === 'rh' && !ids.includes(feel.rh)) ids.push(feel.rh);
  const rcard = r => {
    const on = feel.kind === 'rh' && feel.rh === r.id, rec = p.rh.includes(r.id);
    return `<div class="fl-rh ${on ? 'on' : ''}"><button type="button" class="fl-rhh" role="radio" aria-checked="${on}" onclick="feelWay('rh','${r.id}')"><i class="fl-dot"></i><b>${esc(r.n)}</b>${rec ? '<i class="fl-rec">★</i>' : ''}${on ? '' : `<span class="fl-mini">${r.pat.slice(0, 8).split('').map(strumGlyph).join('')}</span>`}</button>
      ${on ? `<div class="fl-rhb">${rhythmSVG(rhFromPat(feelPat(), r.mes, r.res, 1), false, {idp: 'fl-c'})}${r.tip ? `<div class="fl-tip">${esc(r.tip)}</div>` : ''}${feel.fx === 'palm' ? '<div class="exo-note">Coups étouffés à la paume.</div>' : ''}</div>` : ''}</div>`;
  };
  const arpOn = feel.kind === 'arp';
  return `<div class="fl-top"><button type="button" class="fl-back" onclick="feelBack()" aria-label="Retour : ${esc(a.n)}">&#8249;</button>
      <div class="fl-ttl"><small>${esc(a.n)}</small><h2>${esc(p.n)}</h2></div>
      <button type="button" class="btn btn-ghost btn-sm" onclick="feelSurprise()">🎲 Surprends-moi</button></div>
    <div class="fl-sub"><span>${isR ? `${p.sub ? esc(p.sub) + ' · ' : ''}${p.mes > 1 ? p.mes + ' mesures par accord' : 'un accord par mesure'}` : p.deg.map(esc).join(' · ') + ' · un accord par mesure'}</span>${p.facile ? `<button type="button" class="filt sm ${feel.easy[p.id] ? 'on' : ''}" onclick="feelEasy('${p.id}',event)">Version facile</button>` : ''}</div>
    <div class="fl-chs" style="--n:${Math.min(names.length, 4)}">${names.map((n, i) => `<div class="fl-ch" id="fl-ch${i}"><div class="cn">${esc(n)}</div>${feelDia(n, names.length > 4 ? .8 : .95, p)}</div>`).join('')}</div>
    ${isO ? feelOpenInfo(p) : ''}${isR ? feelRiffMid(p) : `<div class="fl-lbl fl-lblr"><span>Rythme</span><span>★ conseillés pour cette suite</span></div>
    ${arpOn ? `<div class="fl-rh on"><div class="fl-rhh"><i class="fl-dot"></i><b>Arpège : ${esc(feelArp().n)}</b></div><div class="fl-rhb"><div class="fl-pat" id="fl-pat"></div></div></div>` : ''}
    <div class="fl-rhs" role="radiogroup" aria-label="Rythme">${ids.map(id => RHYTHMS.find(r => r.id === id)).filter(Boolean).map(rcard).join('')}</div>
    <details class="fl-allrh"${feel.rf !== 'all' || arpOn || feel.fx || (feel.kind === 'rh' && !p.rh.includes(feel.rh)) ? ' open' : ''}><summary><span>Tous les rythmes, arpèges, effets</span><span>${RHYTHMS.length} ›</span></summary>
      <div class="fl-lbl">Rythme (main droite)</div>
      <div class="filters fl-rf">${rfs.map(([v, l]) => `<button type="button" class="filt sm ${feel.rf === v ? 'on' : ''}" onclick="feelRf(${typeof v === 'number' ? v : `'${v}'`})">${esc(l)}</button>`).join('')}</div>
      <div class="filters">${rhs.map(r => chip(feel.kind === 'rh' && feel.rh === r.id, true, `feelWay('rh','${r.id}')`, esc(r.n), p.rh.includes(r.id))).join('')}</div>
      <div class="fl-lbl">Ou arpège (une note après l’autre)</div>
      <div class="filters">${ARPS.map(r => chip(feel.kind === 'arp' && feel.arp === r.id, true, `feelWay('arp','${r.id}')`, esc(r.n))).join('')}</div>
      <div class="fl-lbl">Un effet en plus (facultatif)</div>
      <div class="filters">${fxs.map(o => chip(feel.fx === o.f.id, o.ok, `feelFx('${o.f.id}')`, esc(o.f.n.split(':')[0]))).join('')}</div>
      ${fx ? feelFxHTML(fx) : ''}
      <div class="fl-lbl">Métronome</div>
      <div class="filters"><button type="button" class="filt ${feel.click ? 'on' : ''}" id="fl-click" onclick="feelClick()">${feel.click ? 'Métronome : oui' : 'Métronome : non'}</button></div>
      <div class="exo-note">★ = conseillé pour cette suite · ${m.mes} · tout se combine, même en pleine lecture.</div></details>`}
    ${isR ? feelRiffSon(p) : arpOn ? '' : `<div class="fl-lbl fl-lblr"><span>Son</span><span>${mmOn('feel') ? 'étouffé = on travaille juste la main droite' : 'le rythme sonne sur les accords'}</span></div>
    <div class="fl-seg" id="fl-seg" role="radiogroup" aria-label="Son"><button type="button" role="radio" aria-checked="${mmOn('feel')}" class="${mmOn('feel') ? 'on' : ''}" onclick="feelSon(true)">Étouffé</button><button type="button" role="radio" aria-checked="${!mmOn('feel')}" class="${mmOn('feel') ? '' : 'on'}" onclick="feelSon(false)">Accords</button></div>`}
    ${isR ? '' : `<div class="fl-mk"><button type="button" class="btn btn-ghost btn-sm" onclick="feelMakeSheet()">Créer une fiche avec cette suite ›</button></div>`}
    <div class="fl-dock"><div class="fl-dk"><div class="fl-bpm"><button type="button" onclick="feelTempo(-4)" aria-label="−4 BPM">−</button><div class="fl-bpmv" id="fl-bpm">${feel.bpm}</div><button type="button" onclick="feelTempo(4)" aria-label="+4 BPM">+</button></div><small>BPM</small></div>
      <div class="fl-dk"><button type="button" class="fl-play" id="fl-playbtn" onclick="feelPlay()" aria-label="Jouer en boucle"></button><small id="fl-playlbl">Jouer</small></div></div>`;
}
function feelSon(mute) {
  if (mmOn('feel') !== mute) mmToggle('feel');
  const g = $('fl-seg'); if (!g) return;
  [...g.children].forEach((b, i) => { const on = (i === 0) === mute; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
}
/* Accords ouverts : ancre (doigt commun), cordes à vide, conseil, légende des couleurs des diagrammes */
function feelOpenInfo(p) {
  const hl = openHl(p), vi = (p.vides || []).map(n => OPEN_STR[n]);
  return `<div class="fl-anc"><div><b>⚓ Ancre</b> · ${esc(p.ancre)}</div>
    ${vi.length ? `<div><b>○ Cordes à vide</b> · ${vi.map(esc).join(', ')} : laisse-les sonner.</div>` : ''}
    <div><span class="fl-key a"></span>${hl.anc.length ? 'doigt qui ne bouge pas' : 'pas de doigt commun'}${hl.anc.length && vi.length ? '' : ''}${vi.length ? ' <span class="fl-key v" style="margin-left:10px"></span>corde à vide qui résonne' : ''}</div></div>
    <div class="fl-tip">${esc(p.conseil)}${p.ex ? ' <i>(' + p.ex.map(esc).join(', ') + ')</i>' : ''}</div>`;
}
/* Riffs : tab du fill en cours + rythme (cases du fill vides) + conseil ; « fills seuls » ne montre pas le rythme */
function feelRiffMid(p) {
  const r = RHYTHMS.find(x => x.id === p.rythme), d = p.fills[0].debut, pat = r.pat.slice(0, d) + '-'.repeat(p.res - d), both = feel.rm !== 'fills';
  return `<div class="fl-lbl fl-lblr"><span>Le fill</span><span>remplace la fin du rythme</span></div>
    <div class="fl-fill" id="fl-fill"></div>
    ${both ? `<div class="fl-lbl fl-lblr"><span>Rythme</span><span>★ conseillé pour cette suite</span></div>
    <div class="fl-rh on"><div class="fl-rhh"><i class="fl-dot"></i><b>${esc(r.n)}</b><i class="fl-rec">★</i></div>
      <div class="fl-rhb">${rhythmSVG(rhFromPat(pat, r.mes, r.res, 1), false, {idp: 'fl-c'})}<div class="exo-note">Les cases vides : le fill prend la place.</div></div></div>` : ''}
    <div class="fl-tip">${esc(p.conseil)}</div>`;
}
function feelRiffSon(p) {
  const both = feel.rm !== 'fills';
  return `<div class="fl-lbl fl-lblr"><span>Je travaille</span><span>${both ? 'le rythme et le fill, en boucle' : 'seulement les notes de liaison'}</span></div>
    <div class="fl-seg" role="radiogroup" aria-label="Je travaille"><button type="button" role="radio" aria-checked="${both}" class="${both ? 'on' : ''}" onclick="feelRm('both')">Rythme + fills</button><button type="button" role="radio" aria-checked="${!both}" class="${both ? '' : 'on'}" onclick="feelRm('fills')">Fills seuls</button></div>
    ${both ? `<div class="fl-lbl fl-lblr"><span>Son</span><span>${mmOn('feel') ? 'rythme étouffé, fills en vraies notes' : 'le rythme sonne sur les accords'}</span></div>
    <div class="fl-seg" id="fl-seg" role="radiogroup" aria-label="Son"><button type="button" role="radio" aria-checked="${mmOn('feel')}" class="${mmOn('feel') ? 'on' : ''}" onclick="feelSon(true)">Étouffé</button><button type="button" role="radio" aria-checked="${!mmOn('feel')}" class="${mmOn('feel') ? '' : 'on'}" onclick="feelSon(false)">Accords</button></div>` : ''}`;
}
function feelRm(v) { const was = rhPlaying('feel'); feelStop(); feel.rm = v; exoRender(); if (was) feelPlay(); }
function feelFxHTML(fx) {
  const tab = fx.tab ? `<div class="scroll-x">${tabSVG('fl-fx', tabParse(fx.tab)).svg}</div>` : `<div class="fl-fxpat">${fx.pat.split('').map((c, i) => `<span>${strumGlyph(c, i)}</span>`).join('')}</div>`;
  return `<div class="fl-fx"><div class="fl-fxn">${esc(fx.n)}</div>${tab}<div class="exo-note">${esc(fx.expl)} <b>Quand :</b> ${esc(fx.ou)}.</div></div>`;
}
/* affichage de la mesure `bar` : accord courant en cuivre dans la suite, tablature de l'arpège */
function feelShowBar(bar) {
  const p = feelProg(); if (!p || !$('fl-ch0')) return;
  const names = feelNames(p), n = names.length, mes = p.mes || 1, ci = Math.floor(bar/mes) % n, cur = names[ci];
  feel.bar = bar;
  names.forEach((c, i) => { const e = $('fl-ch' + i); if (e) e.classList.toggle('cur', i === ci); });
  if (p.sec === 'riffs') feelFillShow(p, ci, bar);
  if (feel.kind === 'arp' && $('fl-pat')) {
    const r = tabSVG('fl-tab', tabParse(arpTabStr(feelArp(), newChord(cur))));
    FEEL_TAB = r.pos; $('fl-pat').innerHTML = `<div class="scroll-x">${r.svg}</div><div class="exo-note">${esc(feelArp().n)} sur ${esc(cur)}${feelArp().note ? ' · ' + esc(feelArp().note) : ''}</div>`;
  }
}
let FEEL_TAB = [], FILL_POS = [], FILLQ = [], FILL_RAF = 0;
/* Riffs — colonnes du fill (comptage sous la tab : 4, et / 4, e, et, a / 4, tri, ple), affichage, notes planifiées */
const FILL_CNT = {2:['', 'et'], 3:['', 'tri', 'ple'], 4:['', 'e', 'et', 'a']};
function riffCols(p, f) {
  const cols = tabParse(f.tab).filter(c => !c.bar), b0 = Math.floor(f.debut/(p.res/4)) + 1;
  cols.forEach((c, j) => { c.lbl = j % f.sub === 0 ? String(b0 + j/f.sub) : (FILL_CNT[f.sub] || [])[j % f.sub] || ''; });
  return cols;
}
function feelFillShow(p, ci, bar) {
  const el = $('fl-fill'); if (!el) return;
  const f = p.fills[ci], mes = p.mes || 1, r = tabSVG('fl-fill', riffCols(p, f)); FILL_POS = r.pos;
  const note = mes > 1 ? (bar % mes === mes - 1 ? 'mesure ' + mes + ' sur ' + mes + ' : le fill arrive' : 'mesure ' + (bar % mes + 1) + ' sur ' + mes + ' : strum complet') : 'sur le ' + f.temps;
  el.innerHTML = `<div class="fl-fh"><span><b>${esc(f.de)}</b> <i>→</i> <b>${esc(f.vers)}</b></span><small>${esc(note)}</small></div><div class="scroll-x">${r.svg}</div>`;
}
/* notes d'un fill [{t, j, freq, vol, dur}] : colonne j à t0 + j × pas (les cases restantes de la mesure sont réparties sur les colonnes) ; la 2e note d'une liaison (h, p, \) est plus douce */
function riffFillNotes(f, t0, cd, per) {
  const cols = tabParse(f.tab).filter(c => !c.bar), step = (per - f.debut)/cols.length*cd, out = [];
  cols.forEach((c, j) => c.notes.forEach(n => {
    const fr = parseInt(n.txt); if (isNaN(fr)) return;
    out.push({t: t0 + j*step, j, freq: fretFreq(6 - n.s, fr, 0), vol: c.conn ? .1 : .14, dur: j === cols.length - 1 ? 1.1 : .55});
  }));
  return out;
}
function feelFillLoop() {
  if (!rhPlaying('feel')) { FILLQ.length = 0; return; }
  const now = audio().currentTime; let cur = null;
  while (FILLQ.length && FILLQ[0].t <= now) cur = FILLQ.shift();
  if (cur) { const e = $('fl-fill-cur'); if (e && FILL_POS[cur.j] != null) { e.setAttribute('x', FILL_POS[cur.j] - 12); e.setAttribute('opacity', '.4'); } }   // la note jouée s'allume
  FILL_RAF = requestAnimationFrame(feelFillLoop);
}
function feelBtn() {
  const b = $('fl-playbtn'); if (!b) return;
  const on = rhPlaying('feel'); b.classList.toggle('on', on);
  const lb = $('fl-playlbl'); if (lb) lb.textContent = on ? 'Stop' : 'Jouer';
  b.innerHTML = on ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>';
}
function feelPlay() {
  if (rhPlaying('feel')) { rhStop(); return; }
  const p = feelProg(); if (!p) return;
  if (metroPlaying) stopMetro();
  const names = feelNames(p), m = feelMeter(), riff = p.sec === 'riffs', mes = p.mes || 1, fOnly = riff && feel.rm === 'fills';
  const chs = names.flatMap(n => { const c = newChord(n); return Array(riff ? mes : 1).fill(c); });   // mes:2 → chaque accord dure 2 mesures
  const per = rhPerBar(m.mes, m.res), arp = feel.kind === 'arp' ? feelArp() : null, fxId = feel.fx;
  const rh = arp ? {v:2, mes:m.mes, res:m.res, bars:1, swing:0, cells:Array.from({length:per}, () => ({d:'D', a:1}))}
                 : rhFromPat(feelPat(), m.mes, m.res, 1);
  const toks = arp ? arp.motif.split(' ') : null;
  const cellFn = (c, t, ch, i, k, P) => {
    const bar = Math.floor(k/per), pos = i % per, cur = chs[bar % chs.length];
    if (riff) {
      const F = p.fills[Math.floor(bar/mes) % p.fills.length];
      if (bar % mes === mes - 1 && pos >= F.debut) {   // dernière mesure de l'accord : le fill remplace la fin du rythme
        if (pos === F.debut) riffFillNotes(F, t, rhCellDur(P.rh, P.bpm), per).forEach(o => { pluck(o.freq, o.t, o.dur, o.vol); FILLQ.push({t: o.t, j: o.j}); });
      } else if (!fOnly) rhPlayCell(c, t, cur, 0, false, mmOn('feel'));
      return;
    }
    if (arp) arpNotes(toks[pos], cur).forEach((o, j) => pluck(fretFreq(o.si, o.fret, 0), t + j*.012, 1.1, .13));
    else rhPlayCell(c, t, cur, 0, fxId === 'palm', mmOn('feel'));
    if (fxId) fxNotes(fxId, names, bar).forEach(([back, si, fret]) => { if (pos === per - back) pluck(fretFreq(si, fret, 0), t, .5, .12); });
  };
  let lastBar = -1, lastPos = -1;
  FILLQ.length = 0; cancelAnimationFrame(FILL_RAF);
  rhStart(rh, feel.bpm, null, 0, (i, k) => {
    const prev = lastPos >= 0 ? $('fl-c-' + lastPos) : null; if (prev) prev.classList.remove('exo-now');
    const tc = $('fl-tab-cur');
    if (i == null) { lastBar = -1; lastPos = -1; feelBtn(); if (feelProg()) { feelShowBar(0); if (tc) tc.setAttribute('opacity', '0'); } return; }
    const pos = i % per, bar = Math.floor(k/per) % chs.length;
    if (bar !== lastBar) { lastBar = bar; feelShowBar(bar); }
    lastPos = pos; const el = $('fl-c-' + pos); if (el) el.classList.add('exo-now');
    const tc2 = $('fl-tab-cur'); if (tc2 && FEEL_TAB[pos] != null) { tc2.setAttribute('x', FEEL_TAB[pos] - 12); tc2.setAttribute('opacity', '.25'); }
  }, {key:'feel', chords:chs, cellFn, mute:!feel.click});
  if (riff) FILL_RAF = requestAnimationFrame(feelFillLoop);
  feelBtn();
}
function feelMakeSheet() {
  const p = feelProg(), a = feelHead(p); if (!p) return;
  feelStop();
  const names = feelNames(p), rhy = feel.kind === 'rh' ? feelRhy() : RHYTHMS.find(r => r.id === p.rh[0]);
  draft = newSheet_();
  draft.color = COLORS[sheets.length % COLORS.length][0];
  let title = `Suite ${a.n} ${feelSecList(p.sec || p.amb).indexOf(p) + 1}`;
  if (titleTaken(title)) title = uniqueTitle(title);
  draft.title = title; draft.artist = '';
  draft.bpm = feel.bpm; draft.difficulty = ['Debutant', 'Intermediaire', 'Avance'][p.niv - 1] || ''; draft.blocks.diff = true;
  const part = draft.parts[0]; part.chords = names.map(n => newChord(n));
  part.rhythm = rhFromPat(rhy.pat, rhy.mes, rhy.res, 1);
  openEditor('Nouvelle fiche');
  toast('Fiche pré-remplie : ajuste puis enregistre');
}
function feelHTML() {
  return !feel.amb ? feelTiles() : !feel.prog ? feelList() : feelPlayerHTML();
}
/* après rendu : remplit la scène du lecteur */
function feelAfter() {
  if (!feel.prog) return;
  feelBtn(); feelShowBar(0);
}


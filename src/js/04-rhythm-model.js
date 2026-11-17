/* ═══════ RHYTHM MODEL ═══════
   rhythm = {v:2, mes:'4/4'|'3/4'|'6/8', res:8|12|16, bars:1|2, swing:0, cells:[{d:'D'|'U'|'X', a:0|1|2} | null]}
   Une case = une subdivision ; cellules par mesure = temps × subdivisions par temps (spb).
   4/4, 3/4 : spb = res/4 (croches 2, triolets 3, doubles 4) ; 6/8 : 2 temps (noires pointées), spb 3 (croches) ou 6 (doubles).
   null = la main passe sans toucher ; 'X' = coup étouffé ; a = doux / normal / accent.
   Les anciens {strokes:[{dir,force}]} sont migrés à la volée par rhNorm (une stroke = une croche, complété en mesures de 4/4). */
const RH_BEATS = {'4/4':4, '3/4':3, '6/8':2};
const rhSpb = (mes, res) => mes === '6/8' ? (res === 16 ? 6 : 3) : res/4;
const rhPerBar = (mes, res) => RH_BEATS[mes] * rhSpb(mes, res);
function rhFromPat(pat, mes, res, bars) {
  mes = mes || '4/4'; res = res || 8;
  const per = rhPerBar(mes, res), n = per * (bars || Math.max(1, Math.ceil(pat.length/per)));
  const cells = [];
  for (let i = 0; i < n; i++) {
    const ch = pat[i] || '-';
    if (ch === 'X' || ch === 'x') cells.push({d:'X', a:1});
    else if ('DdUu'.includes(ch)) cells.push({d: ch.toUpperCase(), a: ch === ch.toLowerCase() ? 0 : (i === 0 && ch === 'D' ? 2 : 1)});
    else cells.push(null);
  }
  return {v:2, mes, res, bars: n/per, swing:0, cells};
}
const rhHas = r => !!(r && ((r.cells && r.cells.some(Boolean)) || (r.strokes && r.strokes.length)));
function rhNorm(r) {
  if (!r) return null;
  if (r.v === 2 && Array.isArray(r.cells)) return r;
  const st = r.strokes || [];
  const cells = st.map(s => s.dir === 'D' || s.dir === 'U' ? {d:s.dir, a: s.force >= .9 ? 2 : s.force >= .5 ? 1 : 0} : null);
  while (cells.length % 8 || !cells.length) cells.push(null);
  delete r.strokes;
  return Object.assign(r, {v:2, mes:'4/4', res:8, bars: cells.length/8, swing:0, cells});
}
// Changer signature / résolution / nombre de mesures : on garde les cases par position, on complète par du vide
function rhReshape(r, mes, res, bars) {
  const per = rhPerBar(mes, res), n = per*bars, old = r.cells;
  r.mes = mes; r.res = res; r.bars = bars;
  r.cells = Array.from({length:n}, (_, i) => old[i] || null);
}
const RHYTHMS = [
  {id:'noires',  n:'Noires (les bases)',  mes:'4/4', res:8,  pat:'D-D-D-D-', niv:1, bpm:[50,100], amb:['feu','epique','triste'], tip:'Un bas sur chaque temps : compte 1-2-3-4 à voix haute, la base de tout.'},
  {id:'croches', n:'Croches (balancier)', mes:'4/4', res:8,  pat:'DUDUDUDU', niv:1, bpm:[60,120], amb:['joyeux','feu','energique'], tip:'La main balance sans s\'arrêter : bas sur le temps, haut sur le « et ».'},
  {id:'feucamp', n:'Feu de camp',         mes:'4/4', res:8,  pat:'D-DU-UDU', niv:1, bpm:[80,115], amb:['feu','joyeux','triste'], tip:'Le rythme classique : le temps 3 est muet, mais la main continue à balancer.'},
  {id:'ballade', n:'Ballade',             mes:'4/4', res:8,  pat:'D-DUD-DU', niv:1, bpm:[65,95], amb:['melancolique','triste','reveur','romantique'], tip:'Bas appuyé au temps 1, le reste plus léger : laisse respirer l\'accord.'},
  {id:'chuck',   n:'Chuck (backbeat)',    mes:'4/4', res:8,  pat:'DUXUDUXU', niv:2, bpm:[70,100], amb:['energique','joyeux'], tip:'Sur les temps 2 et 4, étouffe l\'accord (X) : le « tchak » qui fait groover.'},
  {id:'reggae',  n:'Reggae (contretemps)',mes:'4/4', res:8,  pat:'-U-U-U-U', niv:2, bpm:[70,100], amb:['reveur','joyeux','latino'], tip:'Seuls les hauts sur les « et » sonnent : le temps reste vide.'},
  {id:'rock8',   n:'Rock en croches',     mes:'4/4', res:8,  pat:'DDDDDDDD', niv:1, bpm:[100,150], amb:['energique','epique','roadtrip'], tip:'Huit bas réguliers, bien carrés : le moteur du rock.'},
  {id:'valse',   n:'Valse',               mes:'3/4', res:8,  pat:'D-d-d-', niv:1, bpm:[80,120], amb:['melancolique','romantique'], tip:'Compte 1-2-3 : un bas fort, puis deux bas doux.'},
  {id:'valse2',  n:'Valse chantante',     mes:'3/4', res:8,  pat:'D-dUdU', niv:2, bpm:[80,115], amb:['joyeux','romantique'], tip:'Comme la valse, avec des petits hauts qui la font chanter.'},
  {id:'six8',    n:'Six-huit (berceuse)', mes:'6/8', res:8,  pat:'D-UD-U', niv:1, bpm:[50,80], amb:['reveur','melancolique','epique'], tip:'Compte 1-2-3 4-5-6 : deux gros temps de trois croches, comme une berceuse.'},
  {id:'shuffle', n:'Shuffle (blues)',     mes:'4/4', res:12, pat:'D-UD-UD-UD-U', niv:2, bpm:[60,100], amb:['blues'], tip:'Chaque temps a 3 pulsations : tu joues la 1re et la 3e (bas, trou, haut).'},
  {id:'folk2',     n:'Folk marche',          mes:'4/4', res:8,  pat:'D-D-DUDU',  niv:1, bpm:[80,120],  amb:['feu','joyeux','roadtrip'], tip:'Deux bas bien posés, puis les croches qui s\'enchaînent : le moteur des chansons à chanter.'},
  {id:'feu2',      n:'Feu de camp plein',    mes:'4/4', res:8,  pat:'D-DUDUDU',  niv:1, bpm:[80,115],  amb:['feu','joyeux','romantique'], tip:'Comme le feu de camp, mais la main ne laisse plus de trou après le temps 2.'},
  {id:'popsync',   n:'Pop syncopée',         mes:'4/4', res:8,  pat:'D--U-UDU',  niv:2, bpm:[85,120],  amb:['joyeux','roadtrip'], tip:'Les temps 2 et 3 sont muets : la main balance quand même et ne touche que les « et ».'},
  {id:'douce',     n:'Ballade douce',        mes:'4/4', res:8,  pat:'D-du-udu',  niv:1, bpm:[60,85],   amb:['melancolique','triste','romantique','reveur'], tip:'Un seul bas appuyé, tout le reste caressé : joue avec le bout des doigts ou un médiator souple.'},
  {id:'rockaere',  n:'Rock aéré',            mes:'4/4', res:8,  pat:'D-D-D-DU',  niv:1, bpm:[100,140], amb:['energique','roadtrip'], tip:'Trois bas carrés, le petit haut final relance la mesure suivante.'},
  {id:'rockgal',   n:'Rock sautillant',      mes:'4/4', res:8,  pat:'D-DDD-DD',  niv:2, bpm:[110,150], amb:['energique'], tip:'Trois bas d\'affilée, une respiration (case 3&), puis deux bas : ne ferme pas la main, elle continue à balancer.'},
  {id:'funk16',    n:'Funk 16es',            mes:'4/4', res:16, pat:'D--UX-UD-UDUX-U-', niv:3, bpm:[80,105], amb:['energique'], tip:'La main balance en 16es sans jamais s\'arrêter ; tu ne touches que les cases marquées, X = accord relâché.'},
  {id:'slow12',    n:'Slow 12/8',            mes:'4/4', res:12, pat:'D--D-UD--D-U', niv:2, bpm:[50,70], amb:['blues','melancolique','romantique'], tip:'Chaque temps = 3 pulsations (1-2-3, 2-2-3...). Compte-les dans ta tête, le bas tombe sur la première.'},
  {id:'valse3',    n:'Valse accentuée',      mes:'3/4', res:8,  pat:'D-D-DU',    niv:1, bpm:[90,130],  amb:['joyeux','feu','romantique'], tip:'Compte 1-2-3 : bas sur chaque temps, petit haut avant de repartir.'},
  {id:'valsecr',   n:'Valse en croches',     mes:'3/4', res:8,  pat:'DUDUDU',    niv:1, bpm:[80,110],  amb:['joyeux','feu'], tip:'Balancement continu en 3 temps : 1-et-2-et-3-et.'},
  {id:'jig',       n:'Jig irlandais',        mes:'6/8', res:8,  pat:'DUDDUD',    niv:2, bpm:[80,110],  amb:['joyeux','feu','energique'], tip:'Deux groupes de trois croches (D U D / D U D) : accent sur la 1re et la 4e.'},
  {id:'six8b',     n:'Six-huit lent',        mes:'6/8', res:8,  pat:'D--D-U',    niv:1, bpm:[50,75],   amb:['melancolique','romantique','reveur'], tip:'Deux gros temps de trois : un bas sur le 1, un bas sur le 4, et le haut de fin qui porte vers le suivant.'},
  {id:'shufflechuck', n:'Shuffle chuck',     mes:'4/4', res:12, pat:'D-UX-UD-UX-U', niv:2, bpm:[70,100], amb:['blues','energique'], tip:'Comme le shuffle, mais sur les temps 2 et 4 l\'accord est étouffé : le « tchak » du blues.'},
  {id:'bossa',     n:'Bossa (adaptée)',      mes:'4/4', res:8,  pat:'D--UD--U',  niv:2, bpm:[90,130],  amb:['latino','romantique','reveur'], tip:'Version strum simplifiée (la vraie bossa se joue aux doigts) : toucher léger, syncopes bien nettes.'},
  {id:'boomchick', n:'Boom-chick (country)', mes:'4/4', res:8,  pat:'D-d-D-d-',  niv:1, bpm:[90,130],  amb:['feu','joyeux','roadtrip'], tip:'Sur D (boom) tape surtout les cordes graves ; sur d (chick) gratte les aiguës, doux.'},
  {id:'rumba',     n:'Rumba simplifiée',     mes:'4/4', res:8,  pat:'D-DUXUDU',  niv:2, bpm:[90,120],  amb:['latino','joyeux'], tip:'X = golpe : petit coup sec de la paume ou de l\'accord étouffé qui sonne comme une percussion. Version simplifiée du rythme flamenco.'},
  {id:'disco',     n:'Disco 16es',           mes:'4/4', res:16, pat:'D-UUD-UUD-UUD-UU', niv:2, bpm:[100,120], amb:['energique','joyeux'], tip:'Quatre fois « bas, trou, haut, haut » : main souple, poignet qui ne s\'arrête jamais.'},
  {id:'motown',    n:'Motown (tambourin)',   mes:'4/4', res:8,  pat:'DuDuDuDu',  niv:1, bpm:[90,120],  amb:['joyeux','romantique','roadtrip'], tip:'Bas francs, hauts à peine effleurés : l\'effet tambourin qui fait danser.'},
  {id:'grunge',    n:'Grunge lourd',         mes:'4/4', res:8,  pat:'D--D-DD-',  niv:2, bpm:[90,130],  amb:['energique'], tip:'Lourd, un peu en retard sur le temps : laisse sonner, ne cherche pas à être propre.'},
  {id:'trous',     n:'Croches à trous',      mes:'4/4', res:8,  pat:'DUD-DUD-',  niv:1, bpm:[60,100],  amb:['feu','joyeux','latino'], tip:'Un trou = la main passe sans toucher les cordes. Elle ne s\'arrête jamais, seul le son manque.'},
  {id:'doubles',   n:'Doubles croches',      mes:'4/4', res:16, pat:'DUDUDUDUDUDUDUDU', niv:3, bpm:[50,80], amb:['energique'], tip:'Quatre coups par temps : poignet détendu, petits mouvements.'},
];


/* ═══════ FAÇON DE JOUER D'UNE PARTIE : rythme OU arpège ═══════
   p.way : 'rh' (défaut) | 'arp' | 'none' ; p.rhythm = modèle rythme (ci-dessus) ; p.arp = {v:1, mes:'4/4', bass:'auto'|6|5|4, motif:id|'', steps:[[rôles]×8]}.
   Rôles d'arpège : 'B' = basse, '3' '2' '1' = cordes sol, si, mi aigu. Une colonne = une croche, 1 accord = 1 mesure (comme le rythme).
   Les anciennes fiches (sans arp ni way) sont lues comme « rythme » ou « aucun ». */
const ARP_ROW = {'1': 0, '2': 1, '3': 2, 'B': 3};   // ligne, de haut en bas : la corde la plus aiguë est en haut
const ARP_MOTIFS = [
  {id:'classique', n:'Classique', motif:'B 3 2 3 B 3 2 3'},
  {id:'montant',   n:'Montant',   motif:'B 3 2 1 B 3 2 1'},
  {id:'ballade',   n:'Ballade',   motif:'B 1 2 3 B 1 2 3'},
  {id:'alterne',   n:'Alterné',   motif:'B 3 2 3 B 2 3 2'},
];
const arpSteps = m => m.motif.split(' ').map(t => t === '-' ? [] : t.split('+'));
const arpEmpty = () => ({v:1, mes:'4/4', bass:'auto', motif:'', steps: Array.from({length: 8}, () => [])});
const arpHas = a => !!(a && Array.isArray(a.steps) && a.steps.some(s => s.length));
const arpMotifOf = a => ARP_MOTIFS.find(m => JSON.stringify(arpSteps(m)) === JSON.stringify(a.steps));
function pWay(p) {
  if (!p || p.way === 'none') return 'none';
  if (p.way === 'arp') return arpHas(p.arp) ? 'arp' : 'none';
  return rhHas(p.rhythm) ? 'rh' : 'none';
}
const pHas = p => pWay(p) !== 'none';
// rythme jouable de la partie : pour un arpège, 8 croches « vides » qui cadencent le moteur (1 mesure par accord)
const arpRh = () => ({v:2, mes:'4/4', res:8, bars:1, swing:0, cells: Array.from({length: 8}, () => ({d:'D', a:1}))});
const pRh = p => pWay(p) === 'arp' ? arpRh() : p.rhythm;
// corde de la basse : la plus grave jouée (auto) ou la 6 / 5 / 4 demandée si l'accord la joue
function arpBassSi(chord, bass) {
  const pl = [0,1,2,3,4,5].filter(i => chord && chord.frets[i] >= 0); if (!pl.length) return 0;
  const si = bass === 'auto' || !bass ? pl[0] : 6 - bass;
  return chord.frets[si] >= 0 ? si : pl[0];
}
function arpStepNotes(roles, chord, bass) {
  if (!chord || !chord.frets) return [];
  const out = [];
  (roles || []).forEach(r => {
    const si = r === 'B' ? arpBassSi(chord, bass) : ({'3': 3, '2': 4, '1': 5})[r];
    if (si != null && chord.frets[si] >= 0) out.push({si, fret: chord.frets[si], bs: r === 'B'});
  });
  return out;
}
function arpPlay(a, i, ch, t, capo) {
  arpStepNotes(a.steps[i], ch, a.bass).forEach((o, j) => pluck(fretFreq(o.si, o.fret, capo), t + j*.012, o.bs ? 1.4 : 1.1, o.bs ? .16 : .13));
}
const arpCellFn = (a, capo) => (c, t, ch, i) => arpPlay(a, i, ch, t, capo);
// pastilles numérotées d'une colonne (--r = ligne) ; bn = n° de la corde de basse
const arpBubbles = (roles, bn) => (roles || []).map(r => `<i class="nb${r === 'B' ? ' bs' : ''}" style="--r:${ARP_ROW[r]}">${r === 'B' ? bn : r}</i>`).join('');
// opt = {cursor: colonne en lecture, mini: taille réduite, chord: accord dont on affiche la basse}
function arpRibbonHTML(a, light, opt) {
  opt = opt || {}; a = a || arpEmpty();
  const bn = opt.chord ? 6 - arpBassSi(opt.chord, a.bass) : (a.bass === 'auto' || !a.bass ? 5 : +a.bass);
  let h = `<div class="rg arp${light ? ' light' : ''}${opt.mini ? ' mini' : ''}" role="img" aria-label="Arpège sur 4 temps"><div class="rg-row bar">`;
  for (let b = 0; b < 4; b++) {
    h += `<div class="rgb"><div class="rgn">${b + 1}</div><div class="rgcs">`;
    for (let j = 0; j < 2; j++) { const k = b*2 + j;
      h += `<div class="rgc${k === opt.cursor ? ' lit' : ''}" data-k="${k}"><div class="arb">${arpBubbles(a.steps[k], bn)}</div><span class="rgl">${j ? 'et' : ''}</span></div>`;
    }
    h += '</div></div>';
  }
  return h + '</div></div>';
}
// façon de jouer d'une partie, rendue comme dans la fiche (rythme en ruban ou arpège), light = impression
function pWayHTML(p, light, opt) {
  const w = pWay(p);
  return w === 'arp' ? arpRibbonHTML(p.arp, light, opt) : w === 'rh' ? rhythmSVG(p.rhythm, light, opt) : '';
}


/* ═══════ RYTHME : RANGÉE DE CASES ═══════
   Une case par subdivision, alignées sur la mesure, comptage dessous (1 et 2 et… ; 6/8 : 1 à 6 ; triolets : 1 tri ple ; doubles : 1 e et a).
   Composant Grille (26/11, « la direction ») : une case par coup, les temps en grandes cases, les « et » en petites, le compte
   au-dessus ; flèche orange ↓ / ↑, ✕ = étouffé, petit point = la main passe sans toucher ; accent = flèche plus épaisse, doux = pâle.
   Le même rendu sert la fiche, le mode jeu, Créer, l'éditeur, les rythmes, Au feeling et les exercices (styles : 24-direction.css).
   rhythmSVG garde son nom historique mais renvoie une grille HTML ; opt = {cursor: case en lecture, edit: cases cliquables, pos: prochaine case}. */
function rhLabel(mes, spb, j, b) {
  if (mes === '6/8') return spb === 6 ? (j % 2 ? 'e' : String(b*3 + j/2 + 1)) : String(b*3 + j + 1);
  if (spb === 3) return j === 0 ? String(b + 1) : j === 1 ? 'tri' : 'ple';
  if (spb === 4) return j === 0 ? String(b + 1) : ['', 'e', 'et', 'a'][j];
  return j === 0 ? String(b + 1) : 'et';
}
function rhArrow(d, a) {
  if (d === 'X') return `<svg class="rga" viewBox="0 0 24 40" aria-hidden="true"><path d="M5 11L19 29M19 11L5 29" stroke-width="${a === 2 ? 4.6 : a === 0 ? 2.4 : 3.4}"/></svg>`;
  const w = a === 2 ? 4.4 : a === 0 ? 2.2 : 3.2;
  const head = a === 2 ? '<path d="M3.5 22L12 36.5L20.5 22Z" fill="currentColor" stroke-width="1.6"/>' : `<path d="M4.5 23.5L12 35L19.5 23.5" stroke-width="${w}"/>`;
  return `<svg class="rga${a === 0 ? ' soft' : ''}" viewBox="0 0 24 40" aria-hidden="true"><g${d === 'U' ? ' transform="rotate(180 12 20)"' : ''}><path d="M12 4V${a === 2 ? 26 : 33}" stroke-width="${w}"/>${head}</g></svg>`;
}
// cases par ligne de saisie : une mesure tient sur une ligne (≤ 9 cases), sinon on coupe sur un temps (16 cases → 2 lignes de 8)
/* Vue du rythme « ruban dans des blocs » : un bloc arrondi par temps (le chiffre dessus), et dedans la vague de la main —
   chaque case est un demi-trait (↓ = la vague descend, ↑ = elle remonte), la flèche en est la pointe, ✕ = étouffé,
   pointillé = la main passe sans jouer. Une case = un petit SVG (viewBox fixe, mis à l'échelle par la largeur) pour que
   le surlignage du coup en cours soit un simple changement de classe (.lit). */
const rhGeo = (mini, edit) => mini ? {W:32, H:34, yT:5, yB:29, l:6, x:3.4, w:[1.5, 2.2, 3]} : edit ? {W:44, H:60, yT:9, yB:51, l:9, x:4.8, w:[2.2, 3.2, 4.4]} : {W:32, H:56, yT:8, yB:48, l:8, x:4.4, w:[1.9, 2.8, 3.8]};
const rhN = v => Math.round(v*100)/100;
const rhLerp = (a, b, t) => [a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t];
function rhCellSVG(c, dir, g) {   // une flèche droite par case : ↓ bas, ↑ haut, ✕ étouffé ; case vide = petit repère
  const {W, H, yT, yB} = g, x = W/2, hd = Math.min(W*.24, 7);
  let s = `<svg class="rgs" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  const arrow = (d, cls, w) => d === 'U' ? `<path class="${cls}" stroke-width="${w}" d="M${x} ${yB}V${yT}m${-hd} ${hd*1.1}l${hd} ${-hd*1.1}l${hd} ${hd*1.1}"/>` : `<path class="${cls}" stroke-width="${w}" d="M${x} ${yT}V${yB}m${-hd} ${-hd*1.1}l${hd} ${hd*1.1}l${hd} ${-hd*1.1}"/>`;
  if (!c) return s + `<circle class="rgo" cx="${x}" cy="${(yT + yB)/2}" r="${rhN(W*.075)}"/></svg>`;   // la main passe sans toucher : un petit point
  const a = c.a === 2 ? 2 : c.a === 0 ? 0 : 1, w = g.w[a], m = g.x;
  if (c.d === 'X') s += `<path class="rgp" stroke-width="${w}" d="M${x - m} ${(yT + yB)/2 - m}l${2*m} ${2*m}m0 ${-2*m}l${-2*m} ${2*m}"/>`;
  else s += arrow(c.d === 'U' ? 'U' : 'D', 'rgp' + (a === 0 ? ' soft' : ''), w);
  return s + '</svg>';
}
/* Retrouver le rythme d'une prise : on repère les attaques, on les cale sur une grille de croches (tempo de la fiche,
   sinon estimé d'après l'écart le plus courant), et on applique la règle du grattage : ↓ sur le temps, ↑ entre les temps.
   C'est une proposition : chaque flèche se corrige ensuite à la main. Renvoie {rhythm, bpm} ou null. */
function rhFromTake(buf, bpm) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, hop = Math.round(sr*.006), n = Math.floor(d.length/hop);
  if (n < 20) return null;
  const en = new Float32Array(n); for (let i = 0; i < n; i++) { let e = 0; for (let k = i*hop, m = k + hop; k < m; k++) e += d[k]*d[k]; en[i] = Math.sqrt(e/hop); }
  const fl = new Float32Array(n); let mx = 0; for (let i = 2; i < n; i++) { fl[i] = Math.max(0, en[i] - Math.max(en[i-1], en[i-2])); if (fl[i] > mx) mx = fl[i]; }
  if (mx < .004) return null;
  const on = [], gap = Math.round(.09/.006); let last = -gap;
  for (let i = 2; i < n - 1; i++) if (fl[i] > mx*.16 && fl[i] >= fl[i-1] && fl[i] >= fl[i+1] && i - last >= gap) { on.push(i*hop/sr); last = i; }
  if (on.length < 2) return null;
  let cell = bpm ? 30/bpm : 0;
  if (!cell) { const io = on.slice(1).map((t, i) => t - on[i]).sort((a, b) => a - b); cell = Math.max(.17, Math.min(.5, io[Math.floor(io.length*.25)])); bpm = Math.round(30/cell); }
  const ks = [...new Set(on.map(t => Math.round((t - on[0])/cell)))].filter(k => k < 16);
  const bars = Math.max(1, Math.min(2, Math.ceil((Math.max(...ks) + 1)/8))), cells = Array(bars*8).fill(null);
  ks.forEach(k => { cells[k] = {d: k % 2 ? 'U' : 'D', a: k === 0 ? 2 : 1}; });
  return {rhythm: {v:2, mes:'4/4', res:8, bars, swing:0, cells}, bpm};
}
// direction d'un coup « automatique » : ↓ sur le temps, ↑ entre les temps (triolets : ↓ puis ↑)
const rhAutoDir = (spb, j) => spb === 3 ? (j ? 'U' : 'D') : (j % 2 ? 'U' : 'D');
// opt = {cursor: case en lecture, mini: taille réduite, idp: préfixe d'id des cases (exercices), edit: saisie (cases vides fantômes), rowB: temps par ligne}
function rhythmSVG(rh, light, opt) {
  opt = opt || {}; rh = rhNorm(rh);
  if (!rhHas(rh) && !opt.edit) return `<div style="font-size:11px;color:${light ? '#999' : 'var(--cream4)'};padding:4px 0">Aucun coup</div>`;
  const cells = rh.cells, spb = rhSpb(rh.mes, rh.res), per = rhPerBar(rh.mes, rh.res), nB = RH_BEATS[rh.mes], g = rhGeo(opt.mini, opt.edit);
  const flat = rh.mes !== '6/8' && spb === 3;           // triolets : bas, (passage), haut
  const rowB = opt.rowB || (rh.mes === '4/4' && spb >= 4 ? 2 : nB);   // doubles croches : 2 temps par ligne ; opt.rowB : saisie sur petit écran
  let h = `<div class="rg${light ? ' light' : ''}${opt.mini ? ' mini' : ''}${spb >= 4 ? ' dense' : ''}" role="img" aria-label="Rythme : ${rh.mes}, ${rh.bars} mesure${rh.bars > 1 ? 's' : ''}">`;
  for (let b = 0; b < rh.bars; b++) for (let t0 = 0; t0 < nB; t0 += rowB) {
    h += `<div class="rg-row${t0 === 0 ? ' bar' : ''}">`;
    for (let t = t0; t < Math.min(nB, t0 + rowB); t++) {
      h += `<div class="rgb"><div class="rgn">${rhLabel(rh.mes, spb, 0, t)}</div><div class="rgcs">`;
      for (let j = 0; j < spb; j++) {
        const k = b*per + t*spb + j, c = cells[k];
        const gh = opt.edit && !c;   // saisie : une case vide est une flèche fantôme (la direction que poserait « Coup »)
        const dir = gh ? rhAutoDir(spb, j) : c ? (c.d === 'U' ? 'U' : 'D') : flat && j === 1 ? 'F' : j % 2 ? 'U' : 'D';
        h += `<div class="rgc${j ? '' : ' b'}${k === opt.cursor ? ' lit' : ''}${c ? ' ' + c.d + ' a' + c.a : ''}${gh ? ' gh' : ''}" data-k="${k}"${opt.idp ? ` id="${opt.idp}-${k}"` : ''}>${rhCellSVG(gh ? {d: dir, a: 1} : c, dir, g)}<span class="rgl${j ? '' : ' n'}">${rhLabel(rh.mes, spb, j, t)}</span></div>`;
      }
      h += '</div></div>';
    }
    h += '</div>';
  }
  return h + '</div>';
}


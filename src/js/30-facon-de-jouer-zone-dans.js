/* ═══════ FAÇON DE JOUER : ZONE DANS LA CARTE + ÉDITEURS DE RYTHME ET D'ARPÈGE ═══════
   rbHTML(ctx, i) : un seul composant pour l'éditeur de fiche (ctx 'draft') et le panneau Fiche de l'Atelier (ctx 'at').
   Segment Rythme | Arpège | Aucun (une partie a l'un OU l'autre), puis le ruban cerclé de pointillés cuivre qui ouvre l'éditeur, + ▶ Écouter
   et « Même rythme que la partie d'avant ».
   Éditeurs (weOpen) : feuille plein écran sur mobile, panneau à droite sur PC. Rythme : le ruban en grand EST l'éditeur (cases vides =
   flèche fantôme ; pinceaux Coup / Fort / Étouffé / Gomme ; toucher = poser, glisser = poser en série). Arpège : 4 motifs tout faits,
   « Affiner » (grille Basse / 3 / 2 / 1 × 8 colonnes), basse Auto / 6 / 5 / 4. Les deux montrent « Dans la fiche » en direct ;
   ✕ annule tout (on rétablit l'état d'ouverture), OK garde. La boucle d'écoute lit les données en direct. */
const rbSheet = ctx => ctx === 'at' ? at.s : draft;
const rbPart = (ctx, i) => { const s = rbSheet(ctx); return s && s.parts[i]; };
const rbId = (ctx, i) => `rb-${ctx}-${i}`;
const rbKey = (ctx, i) => 'rb' + ctx + i;
const wayOf = p => p.way || 'rh';
let rbLit = null;
const rbEmpty = () => rhFromPat('', '4/4', 8, 1);
const rbRN = {8: 'croches', 12: 'triolets', 16: 'doubles croches'};
const rbLitK = (ctx, i) => rbLit && rbLit.ctx === ctx && rbLit.i === i ? rbLit.k : -1;
function rbHTML(ctx, i) {
  const p = rbPart(ctx, i), w = wayOf(p), a = `'${ctx}',${i}`, id = rbId(ctx, i), l = rbLitK(ctx, i);
  let h = `<div class="rb" id="${id}" data-live="${ctx}-${i}"><div class="rb-seg" role="group" aria-label="Façon de jouer de la partie">${[['rh', 'Rythme'], ['arp', 'Arpège'], ['none', 'Aucun']].map(([k, t]) =>
    `<button type="button" class="${w === k ? 'on' : ''}" aria-pressed="${w === k}" onclick="rbWay(${a},'${k}')">${t}</button>`).join('')}</div>`;
  if (w !== 'none') {
    const arp = w === 'arp', has = arp ? arpHas(p.arp) : rhHas(p.rhythm);
    const prev = i > 0 && rbPart(ctx, i - 1), pk = arp ? 'arp' : 'rhythm';
    h += `<div class="rb-lane"><div class="rb-rib" role="button" tabindex="0" onclick="rbRibTap(event,${a})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();weOpen(${a})}" aria-label="${has ? 'Modifier' : 'Saisir'} ${arp ? 'l’arpège' : 'le rythme'} de la partie">
      <span class="rb-ll">${arp ? 'Arpège' : 'Rythme'}<i>✎</i></span>
      ${has ? `<div class="rb-view">${arp ? arpRibbonHTML(p.arp, false, {mini: true, cursor: l, chord: p.chords[0]}) : rhythmSVG(p.rhythm, false, {mini: true, cursor: l})}</div>`
            : `<span class="rb-emp">Pas encore ${arp ? 'd’arpège' : 'de rythme'}<b>Saisir ›</b></span>`}</div>
      ${has ? `<button type="button" class="rb-play rb-pl-r" data-ctx="${ctx}" data-i="${i}" id="${id}-play" onclick="rbPlay(${a})" aria-label="Écouter"></button>` : ''}</div>`;
    if (!arp && has && p.rhAuto) h += `<p class="rb-auto">Flèches devinées d’après ta prise : touche une case pour la corriger.</p>`;
    if (prev && pWay(prev) === (arp ? 'arp' : 'rh') && JSON.stringify(prev[pk]) !== JSON.stringify(p[pk]))
      h += `<button type="button" class="rb-same" onclick="rbSame(${a})">Même ${arp ? 'arpège' : 'rythme'} que la partie d’avant</button>`;
  }
  if (ctx === 'at') {   // l'éditeur de fiche a sa grande barre ⏺ en bas ; l'Atelier garde un accès discret
    h += p.rec
      ? `<div class="rb-take"><b>Ma prise · ${(p.rec.end - p.rec.start).toFixed(1).replace('.', ',')} s</b>
        <button type="button" class="btn btn-ghost btn-sm rb-takeb" data-ctx="${ctx}" data-i="${i}" onclick="recPlayToggle(${i},'${ctx}')"></button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="rcOpen(${i},'trim','${ctx}')">Rogner</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="rcDelete(${i},'${ctx}')">Supprimer</button></div>`
      : `<button type="button" class="rb-lnk rb-recl" onclick="rbRec(${a})"><span class="rb-rd"></span>Je le joue à la guitare<small>l’app garde ta prise et la rejoue en boucle</small></button>`;
  }
  return h + '</div>';
}
// Aperçu du rythme : toucher une case la corrige sur place (vide → ↓/↑ → l'autre sens → vide) ; le reste (« Rythme ✎ ») ouvre l'éditeur complet
function rbRibTap(e, ctx, i) {
  const p = rbPart(ctx, i), c = e.target.closest('.rb-view .rgc[data-k]');
  if (!p || !c || wayOf(p) !== 'rh' || !rhHas(p.rhythm)) { weOpen(ctx, i); return; }
  const r = rhNorm(p.rhythm), k = +c.dataset.k, spb = rhSpb(r.mes, r.res), x = r.cells[k];
  const auto = rhAutoDir(spb, k % spb), other = auto === 'D' ? 'U' : 'D';
  r.cells[k] = !x ? {d: auto, a: 1} : x.d === auto ? {d: other, a: x.a} : null;
  p.rhAuto = false;   // corrigé à la main : une nouvelle prise ne l'écrasera plus
  if (ctx === 'at') atMark();
  const el = $(rbId(ctx, i)); if (el) { el.outerHTML = rbHTML(ctx, i); rbSyncAll(); }
  const n = document.querySelector(`#${rbId(ctx, i)} .rb-view .rgc[data-k="${k}"]`); if (n) mAnim(n, [{transform: 'scale(.8)'}, {transform: 'none'}], {duration: 160, easing: 'cubic-bezier(.22,.8,.3,1)'});
}
function rbSyncAll() {
  rbSyncPlay(); rbSyncRec();
}
function rbSyncPlay() {
  document.querySelectorAll('.rb-play').forEach(b => {
    const on = rhPlaying(rbKey(b.dataset.ctx, b.dataset.i));
    b.classList.toggle('on', on);
    b.innerHTML = `<i>${on ? RH_STOP_SVG : RH_PLAY_SVG}</i><span>${on ? 'Arrêter' : 'Écouter'}</span>`;
  });
}
function rbSyncRec() {
  document.querySelectorAll('.rb-takeb').forEach(b => {
    const on = recPlay && recPlay.part === +b.dataset.i && recPlay.ctx === b.dataset.ctx;
    b.innerHTML = (on ? RH_STOP_SVG : RH_PLAY_SVG) + (on ? 'Stop' : 'Écouter');
  });
  if (typeof edBarPlay === 'function') edBarPlay();
}
// la zone de la carte est refaite (segment, ruban, ▶) ; dans l'Atelier, tout changement déclenche l'enregistrement auto
function rbChanged(ctx, i) {
  if (ctx === 'at') atMark();
  const el = $(rbId(ctx, i)); if (!el) return;
  el.outerHTML = rbHTML(ctx, i);
  rbSyncPlay();
}
function rbWay(ctx, i, k) {
  const p = rbPart(ctx, i); if (!p) return;
  if (rhPlaying(rbKey(ctx, i))) rhStop();
  p.way = k;
  rbChanged(ctx, i);
  if (ctx === 'draft') edRpSet(i);
}
function rbSame(ctx, i) {
  const p = rbPart(ctx, i), q = rbPart(ctx, i - 1); if (!p || !q) return;
  if (rhPlaying(rbKey(ctx, i))) rhStop();
  if (pWay(q) === 'arp') { p.arp = clone(q.arp); p.way = 'arp'; } else { p.rhythm = clone(q.rhythm); p.way = 'rh'; }
  rbChanged(ctx, i);
  toast('C’est le même que la partie d’avant');
}
// écoute en boucle (accords de la partie, vrai son) ; la case / colonne en cours s'allume partout où elle apparaît (zone, éditeur, aperçu)
function rbStep(ctx, i) {
  const sel = `[data-live="${ctx}-${i}"]`;
  return k => {
    const old = rbLit; rbLit = k == null ? null : {ctx, i, k};
    if (old) document.querySelectorAll(`[data-live="${old.ctx}-${old.i}"] .lit`).forEach(e => e.classList.remove('lit'));
    if (k == null) { rbSyncPlay(); return; }
    document.querySelectorAll(`${sel} [data-k="${k}"]`).forEach(e => { e.classList.add('lit'); mPulse(e); });
  };
}
function rbPlay(ctx, i) {
  const key = rbKey(ctx, i);
  if (rhPlaying(key)) { rhStop(); return; }
  const p = rbPart(ctx, i), s = rbSheet(ctx); if (!p) return;
  const chs = p.chords.length ? p.chords : [newChord('Em')];
  if (wayOf(p) === 'arp') {
    if (!arpHas(p.arp)) { toast('Choisis un motif d’abord', true); return; }
    stopPlay();
    rhStart(arpRh(), s.bpm || 90, chs[0], s.capo, rbStep(ctx, i), {key, chords: chs, cellFn: arpCellFn(p.arp, s.capo)});
  } else {
    const r = p.rhythm && rhNorm(p.rhythm); if (!r || !rhHas(r)) { toast('Ajoute quelques coups d’abord', true); return; }
    stopPlay();
    rhStart(r, s.bpm || 90, chs[0], s.capo, rbStep(ctx, i), {key, chords: chs, mm: 'learn'});
  }
  rbSyncPlay();
}
function rbRec(ctx, i) { stopPlay(); rcOpen(i, null, ctx); }
// mode jeu → « Créer / Changer le rythme » : on ouvre l'éditeur de la fiche, puis l'éditeur de la partie
function rbEditCur(i) {
  stopPlay(); editSheet(cur.id);
  if (draft.parts[i]) { draft.parts[i].collapsed = false; renderParts(); }
  setTimeout(() => weOpen('draft', i), 80);
}

/* ── éditeurs plein écran ── */
let we = null;   // {ctx, i, kind:'rh'|'arp', tool, snap, drag, sets}
const wePart = () => we && rbPart(we.ctx, we.i);
const weSheet = () => we && rbSheet(we.ctx);
const WE_START = [['folk2', 'Folk'], ['popsync', 'Pop'], ['ballade', 'Ballade'], ['feucamp', 'Feu de camp'], ['', 'Vide']];
const WE_TOOLS = [['coup', 'Coup', rhArrow('D', 1)], ['fort', 'Fort', rhArrow('D', 2)], ['etouffe', 'Étouffé', rhArrow('X', 1)],
  ['gomme', 'Gomme', '<svg class="rga" viewBox="0 0 24 40" aria-hidden="true"><circle cx="12" cy="20" r="7" stroke-dasharray="3 3.6" stroke-width="2.2"/></svg>']];
function weOpen(ctx, i) {
  const p = rbPart(ctx, i); if (!p) return;
  stopPlay();
  const kind = wayOf(p) === 'arp' ? 'arp' : 'rh';
  we = {ctx, i, kind, tool: 'coup', snap: clone({way: p.way === undefined ? null : p.way, rhythm: p.rhythm || null, arp: p.arp || null}), drag: null, sets: false};
  if (kind === 'arp') { if (!p.arp) p.arp = arpEmpty(); p.way = 'arp'; }
  else { p.rhythm = p.rhythm ? rhNorm(p.rhythm) : rbEmpty(); p.way = 'rh'; }
  $('we').hidden = false; document.body.classList.add('we-open');
  weRender();
  const sh = $('we-sheet'); sh.scrollTop = 0;
  setTimeout(() => { const b = document.querySelector('#we .we-ok'); if (b) b.focus({preventScroll: true}); }, 40);
}
function weClose(ok) {
  if (!we) return;
  const {ctx, i} = we, p = wePart();
  stopPlay();
  if (!ok && p) { p.way = we.snap.way === null ? undefined : we.snap.way; if (p.way === undefined) delete p.way; p.rhythm = we.snap.rhythm; p.arp = we.snap.arp; }
  we = null; $('we').hidden = true; document.body.classList.remove('we-open');
  if (ctx === 'at') { if (ok) atMark(); atRenderFiche(); } else renderParts();
  const r = document.querySelector(`#${rbId(ctx, i)} .rb-rib`); if (r) r.focus({preventScroll: true});
}
document.addEventListener('keydown', e => { if (we && e.key === 'Escape') { e.preventDefault(); weClose(false); } });
const weChanged = () => { if (we && we.ctx === 'at') atMark(); };
function weTop(p) {
  return `<div class="we-top"><button type="button" class="we-x" onclick="weClose(false)" aria-label="Annuler et fermer"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${we.kind === 'arp' ? 'Arpège' : 'Rythme'}${p.name ? ' · ' + esc(p.name) : ''}</h2><button type="button" class="we-ok" onclick="weClose(true)">OK</button></div>`;
}
function weRender() {
  const p = wePart(), s = weSheet(); if (!p) return;
  const sh = $('we-sheet'), a = `'${we.ctx}',${we.i}`;
  const play = `<div class="we-play"><button type="button" class="rb-play we-listen" data-ctx="${we.ctx}" data-i="${we.i}" onclick="rbPlay(${a})"></button>
    <div class="we-bpm" role="group" aria-label="Tempo"><button type="button" onclick="weBpm(-1)" aria-label="Plus lent">−</button><b id="we-bpm">${s.bpm || 90}</b><button type="button" onclick="weBpm(1)" aria-label="Plus vite">+</button></div></div>`;
  let h = weTop(p) + `<div class="we-body" data-live="${we.ctx}-${we.i}">`;
  if (we.kind === 'rh') {
    const r = rhNorm(p.rhythm);
    h += `<div class="we-chips" role="group" aria-label="Partir d’un rythme tout fait">${WE_START.map(([id, t]) => `<button type="button" class="we-chip" onclick="weStart('${id}')">${t}</button>`).join('')}</div>
      <div class="we-sec">Pose tes coups</div>
      <div class="we-card"><div class="we-rib" id="we-rib" onpointerdown="weRibDown(event)" onpointermove="weRibMove(event)" onpointerup="weRibUp()" onpointercancel="weRibUp()" onkeydown="weRibKey(event)"></div>
        <div class="we-meta"><button type="button" class="we-lnk" onclick="we.sets=!we.sets;$('we-sets').hidden=!we.sets" aria-expanded="${we.sets}">${r.mes} · ${rbRN[r.res]}</button>
          <button type="button" class="we-lnk acc" onclick="weBars(${r.bars > 1 ? -1 : 1})">${r.bars > 1 ? '− mesure' : '+ mesure'}</button></div>
        <div class="rb-sels" id="we-sets" ${we.sets ? '' : 'hidden'}>
          <label>Mesure<select onchange="weOpt('mes',this.value)">${['4/4', '3/4', '6/8'].map(m => `<option ${r.mes === m ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
          <label>Subdivision<select onchange="weOpt('res',+this.value)">${[[8, 'Croches'], [12, 'Triolets'], [16, 'Doubles croches']].map(([v, t]) => `<option value="${v}" ${r.res === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div></div>
      <div class="we-hint">${we.heard ? '<b>Voilà ce que j’ai entendu.</b> Une flèche ne colle pas ? ' : ''}<b>Touche</b> une case : bas, puis haut, puis rien. <b>Glisse</b> pour en poser plusieurs.</div>
      <div class="we-tools" role="group" aria-label="Pinceau">${WE_TOOLS.map(([k, t, ic]) => `<button type="button" class="we-tool${we.tool === k ? ' on' : ''}" aria-pressed="${we.tool === k}" onclick="weTool('${k}')"><span>${ic}</span>${t}</button>`).join('')}</div>
      ${play}<div class="we-mm"><span>Son</span>${mmBtn('learn')}</div>`;
  } else {
    h += `<div class="we-sec">Choisis un motif</div><div class="we-motifs" id="we-motifs"></div>
      <div class="we-sec">Affiner (touche une case)</div><div class="we-card" id="we-grid"></div>
      <div class="we-bass"><span>Basse</span><div class="rb-seg sm" role="group" aria-label="Corde de la basse" id="we-bass"></div></div>
      <p class="we-note">Auto : la corde grave de l’accord (Do = 5, Mi = 6…).</p>${play}`;
  }
  h += `<div class="we-sec">Dans la fiche</div><div id="we-prev"></div></div>`;
  sh.innerHTML = h;
  if (we.kind === 'rh') weRibRefresh(); else weArpRefresh();
  rbSyncPlay();
}
/* aperçu « Dans la fiche » : la même carte qu'en lecture (nom, capo, accords, rythme ou arpège) */
function wePrevHTML() {
  const p = wePart(), s = weSheet(), col = (COLORS.find(c => c[0] === s.color) || COLORS[0])[1];
  const way = pWayHTML(p, false, {mini: true, chord: p.chords[0], cursor: rbLitK(we.ctx, we.i)});
  return `<div class="wpc" style="--c:${col}"><div class="wpc-h"><b>${esc(p.name || 'Partie')}</b>${we.i === 0 && s.capo > 0 ? `<span class="pv-capo">Capo ${s.capo}</span>` : ''}</div>
    <div class="wpc-ch">${p.chords.length ? p.chords.map(c => `<span>${esc(c.name || '?')}</span>`).join('') : '<em>Ajoute des accords à la partie</em>'}</div>
    <div class="wpc-way">${way || `<em>${we.kind === 'arp' ? 'L’arpège' : 'Le rythme'} apparaît ici.</em>`}</div></div>`;
}
const weBpm = d => {
  const s = weSheet(); if (!s) return;
  s.bpm = Math.max(30, Math.min(240, (s.bpm || 90) + d));
  const e = $('we-bpm'); if (e) e.textContent = s.bpm;
  if (rhP) rhSetBpm(s.bpm);
  weChanged();
};
/* ── rythme : le ruban est l'éditeur ── */
function weRowB(r) {   // temps par ligne : on coupe pour que chaque case reste ≥ 44 px
  const nB = RH_BEATS[r.mes], spb = rhSpb(r.mes, r.res), box = $('we-rib');
  const W = box && box.clientWidth ? box.clientWidth : Math.min(innerWidth, 560) - 56;
  for (const n of [nB, nB/2, 1]) if (Number.isInteger(n) && n >= 1 && (W - 8*(n - 1))/n - 6 >= 44*spb) return n;
  return 1;
}
function weRibRefresh() {
  const box = $('we-rib'), p = wePart(); if (!box || !p) return;
  const r = rhNorm(p.rhythm);
  box.innerHTML = rhythmSVG(r, false, {edit: true, rowB: weRowB(r), cursor: rbLitK(we.ctx, we.i)});
  box.querySelectorAll('.rgc[data-k]').forEach(c => { c.tabIndex = 0; c.setAttribute('role', 'button'); c.setAttribute('aria-label', `Case ${+c.dataset.k + 1}`); });
  const pv = $('we-prev'); if (pv) pv.innerHTML = wePrevHTML();
}
function weTool(k) {
  we.tool = k;
  document.querySelectorAll('#we .we-tool').forEach((b, j) => { const on = WE_TOOLS[j][0] === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
// ce que poserait le pinceau sur la case k (null = gomme)
function weBrush(r, k) {
  if (we.tool === 'gomme') return null;
  if (we.tool === 'etouffe') return {d: 'X', a: 1};
  return {d: rhAutoDir(rhSpb(r.mes, r.res), k % rhSpb(r.mes, r.res)), a: we.tool === 'fort' ? 2 : 1};
}
function weRibDown(e) {
  const c = e.target.closest('.rgc[data-k]'); if (!c) return;
  e.preventDefault();
  const r = rhNorm(wePart().rhythm), k = +c.dataset.k, b = weBrush(r, k), x = r.cells[k];
  we.drag = {erase: !b || !!(x && x.d === b.d && x.a === b.a), seen: new Set(), cyc: we.tool === 'coup' ? k : -1};   // « Coup » : toucher une case la fait tourner (vide → ↓/↑ → l'autre sens → vide)
  weApplyCell(k);
  try { $('we-rib').setPointerCapture(e.pointerId); } catch (er) {}
}
function weRibMove(e) {
  if (!we || !we.drag) return;
  const el = document.elementFromPoint(e.clientX, e.clientY), c = el && el.closest && el.closest('#we-rib .rgc[data-k]');
  if (c) weApplyCell(+c.dataset.k);
}
function weRibUp() { if (we) we.drag = null; }
function weApplyCell(k) {
  const d = we.drag; if (!d || d.seen.has(k)) return;
  d.seen.add(k);
  const r = rhNorm(wePart().rhythm); wePart().rhAuto = false;
  if (k === d.cyc && d.seen.size === 1) {   // la case touchée tourne ; si on glisse ensuite, les autres cases prennent le même sort (posé ou vidé)
    const x = r.cells[k], auto = weBrush(r, k).d, other = auto === 'D' ? 'U' : 'D';
    r.cells[k] = !x ? {d: auto, a: 1} : x.d === auto ? {d: other, a: x.a} : null;
    d.erase = !r.cells[k];
  } else r.cells[k] = d.erase ? null : weBrush(r, k);
  weRibRefresh(); weChanged();
  if (d.seen.size === 1) mAnim(document.querySelector(`#we-rib [data-k="${k}"]`), [{transform: 'scale(.86)'}, {transform: 'none'}], {duration: 150, easing: 'cubic-bezier(.22,.8,.3,1)'});
}
function weRibKey(e) {   // clavier : Entrée / Espace = poser (ou enlever) avec le pinceau actif
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const c = e.target.closest('.rgc[data-k]'); if (!c) return;
  e.preventDefault();
  const r = rhNorm(wePart().rhythm), k = +c.dataset.k, b = weBrush(r, k), x = r.cells[k];
  we.drag = {erase: !b || !!(x && x.d === b.d && x.a === b.a), seen: new Set()}; weApplyCell(k); we.drag = null;
  const n = document.querySelector(`#we-rib [data-k="${k}"]`); if (n) n.focus();
}
function weStart(id) {   // départs rapides : un tap pose le rythme et l'écoute tout de suite
  const p = wePart(), r = rhNorm(p.rhythm), x = RHYTHMS.find(z => z.id === id);
  if (rhPlaying(rbKey(we.ctx, we.i))) rhStop();
  p.rhythm = x ? rhFromPat(x.pat, x.mes, x.res, 1) : rhFromPat('', r.mes, r.res, r.bars);
  weChanged(); weRender();
  if (x) rbPlay(we.ctx, we.i);
}
function weBars(d) {
  const r = rhNorm(wePart().rhythm);
  rhReshape(r, r.mes, r.res, Math.max(1, Math.min(2, r.bars + d)));
  weChanged(); weRender();
}
function weOpt(key, v) {
  const r = rhNorm(wePart().rhythm), m = {mes: r.mes, res: r.res, bars: r.bars}; m[key] = v;
  if (m.mes === '6/8' && m.res === 12) m.res = 8;
  rhReshape(r, m.mes, m.res, m.bars);
  weChanged(); weRender();
}
/* ── arpège : motifs, grille, basse ── */
function weArpMini(steps, bn) { return `<div class="arm">${steps.map(st => `<div class="arb">${arpBubbles(st, bn)}</div>`).join('')}</div>`; }
function weArpRefresh() {
  const p = wePart(), a = p.arp, mo = arpMotifOf(a), ch = p.chords[0];
  const bn = ch ? 6 - arpBassSi(ch, a.bass) : (a.bass === 'auto' ? 5 : +a.bass);
  $('we-motifs').innerHTML = ARP_MOTIFS.map(m => `<button type="button" class="we-motif${mo && mo.id === m.id ? ' on' : ''}" aria-pressed="${!!(mo && mo.id === m.id)}" onclick="weArpMotif('${m.id}')"><span class="t">${m.n}${mo && mo.id === m.id ? '<i>✓</i>' : ''}</span>${weArpMini(arpSteps(m), bn)}</button>`).join('');
  const rows = ['1', '2', '3', 'B'];
  let g = `<div class="wag" id="we-gridi"><div class="wag-l">${['1', '2', '3', 'Basse'].map(t => `<span>${t}</span>`).join('')}</div><div class="wag-bs">`;
  for (let b = 0; b < 4; b++) {
    g += '<div class="wag-b">';
    for (let j = 0; j < 2; j++) { const k = b*2 + j;
      g += `<div class="wag-c${k === rbLitK(we.ctx, we.i) ? ' lit' : ''}" data-k="${k}">${rows.map(r => { const on = (a.steps[k] || []).includes(r);
        return `<button type="button" class="wag-i${on ? (r === 'B' ? ' bs' : ' on') : ''}" aria-pressed="${on}" aria-label="Temps ${b + 1}${j ? ' et' : ''}, ${r === 'B' ? 'basse' : 'corde ' + r}" onclick="weArpCell(${k},'${r}')"></button>`; }).join('')}</div>`;
    }
    g += '</div>';
  }
  $('we-grid').innerHTML = g + '</div></div>';
  $('we-bass').innerHTML = [['auto', 'Auto'], [6, '6'], [5, '5'], [4, '4']].map(([v, t]) => `<button type="button" class="${a.bass === v || (v === 'auto' && !a.bass) ? 'on' : ''}" aria-pressed="${a.bass === v}" onclick="weBass('${v}')">${t}</button>`).join('');
  const pv = $('we-prev'); if (pv) pv.innerHTML = wePrevHTML();
}
function weArpMotif(id) {
  const m = ARP_MOTIFS.find(x => x.id === id), a = wePart().arp; if (!m) return;
  a.steps = arpSteps(m); a.motif = id;   // sur place : la boucle d'écoute en cours suit
  weChanged(); weArpRefresh();
  if (!rhPlaying(rbKey(we.ctx, we.i))) rbPlay(we.ctx, we.i);
}
function weArpCell(k, r) {
  const a = wePart().arp, st = a.steps[k], x = st.indexOf(r);
  if (x >= 0) st.splice(x, 1); else st.push(r);
  st.sort((u, v) => ARP_ROW[v] - ARP_ROW[u]);
  const mo = arpMotifOf(a); a.motif = mo ? mo.id : '';
  weChanged(); weArpRefresh();
  const n = document.querySelector(`#we-grid [data-k="${k}"] .wag-i:nth-child(${['1', '2', '3', 'B'].indexOf(r) + 1})`); if (n) { n.focus({preventScroll: true}); mAnim(n, [{transform: 'scale(.85)'}, {transform: 'none'}], {duration: 150, easing: 'cubic-bezier(.22,.8,.3,1)'}); }
}
function weBass(v) { const a = wePart().arp; a.bass = v === 'auto' ? 'auto' : +v; weChanged(); weArpRefresh(); }


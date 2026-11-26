/* ═══════ PRINT ═══════ */
function printOne() { printSheet(cur.id); }
let printOpts = null;
function openPrintModal() {
  printOpts = printOpts || {};
  printOpts.mode = printOpts.mode || 1;
  printOpts.toc = printOpts.toc != null ? printOpts.toc : selIds.size > 2;
  printOpts.num = printOpts.num != null ? printOpts.num : true;
  printOpts.style = printOpts.style || 'fiche';
  printOpts.theme = printOpts.theme || 'app';
  printOpts.size = printOpts.size || 'compacte';   // 'app' : comme l'appli (fond sombre) ; 'nb' : noir et blanc, pour économiser l'encre
  // les accords : toujours les lettres dans les parties et les doigtés une fois en haut (tri de Lucas, 26/11 : pas trop d'options)
  ppSay = null;
  document.querySelector('#m-print .modal').classList.add('wide', 'ppm-modal');
  renderPrintModal();
  $('m-print').classList.remove('hide');
}
/* Médi prépare la fiche à imprimer (26/11, demande de Lucas) : il pose les questions, on choisit sur des cartes,
   sa bulle réagit au dernier choix et l'aperçu suit en direct (sur téléphone : l'aperçu reste visible en bas). */
const ppMini = {
  toc: '<span class="ppm-v pgt"><i></i><i></i><i></i></span>', num: '<span class="ppm-v pgn"><i>1</i></span>',
  app: '<span class="ppm-v sw sw-a"><i></i></span>', nb: '<span class="ppm-v sw sw-b"><i></i></span>',
  compacte: '<span class="ppm-v pg2"><i></i><i></i><i></i><i></i><i></i></span>', grande: '<span class="ppm-v pg1"><i></i><i></i><i></i></span>',
  fiche: '<span class="ppm-v pg1"><i></i><i></i><i></i></span>', cahier: '<span class="ppm-v pg2"><i></i><i></i><i></i><i></i><i></i></span>',
  1: '<span class="ppm-v n1"><i></i></span>', 2: '<span class="ppm-v n2"><i></i><i></i></span>'
};
// un seul format (Lucas, 26/11 : « entre compact et détaillé », seule la couleur change ; les morceaux se suivent)
const PP_Q = [
  {k: 'theme', q: 'Quelles couleurs ?', o: [['app', 'Comme l’appli', 'fond sombre'], ['nb', 'Noir et blanc', 'moins d’encre']]},
  // même mise en page, la grande est juste plus grosse (Lucas, 26/11) : moins de morceaux par page, accords et rythme mieux lisibles
  {k: 'size', q: 'Quelle taille ?', o: [['compacte', 'Compacte', 'plus de morceaux par page'], ['grande', 'Grande', 'accords et rythme en grand']]}
];
const PP_SAY = {
  start: 'Je te prépare ta fiche. Choisis comment tu la veux, l’aperçu suit.',
  app: 'Comme dans l’appli, sur fond sombre. Ça claque, mais ça boit de l’encre.',
  nb: 'Noir et blanc : ton imprimante te dit merci.',
  fiche: 'La fiche complète, avec la tablature, les notes et les paroles.',
  compacte: 'Compacte : un max de morceaux par page, tout reste lisible.', grande: 'En grand : les accords et le rythme se lisent de loin, au pupitre.',
  cahier: 'Version cahier : une ligne par partie, tout le morceau d’un coup d’œil.',
  1: 'Une fiche par page, bien lisible au pupitre.', 2: 'Deux fiches par page : parfait pour un carnet de poche.',
  toc1: 'Un sommaire au début : tu retrouves ton morceau tout de suite.', toc0: 'Pas de sommaire : on file direct aux fiches.',
  num1: 'Les pages numérotées : rien ne se mélange.', num0: 'Sans numéros : plus épuré.'
};
// les options en plus, en cartes comme les autres choix (on / off)
const PP_T = [{k: 'toc', l: 'Un sommaire', sub: 'au début du carnet', many: 1}];   // les numéros : toujours (on voit que ça vient de l'app)
let ppSay = null;
const ppOn = (k, v) => String(printOpts[k]) === String(v);
function renderPrintModal() {
  const n = selIds.size;
  $('m-print-body').innerHTML = `<div class="ppm">
    <div class="ppm-l">
      <div class="modal-t">${n > 1 ? `Ton PDF · ${n} fiches` : 'Ta fiche en PDF'}</div>
      ${mediBulle(ppSay ? 'contente' : 'clin', `<span id="ppm-say">${PP_SAY[ppSay || 'start']}</span>`, {size: 46, cls: 'ppm-medi'})}
      ${PP_Q.map(q => `<div class="ppm-q"><div class="ppm-os" role="radiogroup" aria-label="${q.q}">${q.o.map(([v, l, sub]) => {
        const m = typeof ppMini[v] === 'function' ? ppMini[v]() : ppMini[v];
        return `<button type="button" class="ppm-o${ppOn(q.k, v) ? ' on' : ''}" role="radio" aria-checked="${ppOn(q.k, v)}" data-pp="${q.k}" data-v="${v}" onclick="ppPick('${q.k}','${v}')">${m}<span class="ppm-ot"><b>${l}</b><small>${sub}</small></span></button>`;
      }).join('')}</div></div>`).join('')}
      ${n < 2 ? '' : `<div class="ppm-q"><div class="ppm-os">${PP_T.filter(t => !t.many || n > 1).map(t =>
        `<button type="button" class="ppm-o ppm-t${printOpts[t.k] ? ' on' : ''}" role="switch" aria-checked="${!!printOpts[t.k]}" data-pt="${t.k}" onclick="ppToggle('${t.k}')">${ppMini[t.k]}<span class="ppm-ot"><b>${t.l}</b><small>${t.sub}</small></span><i class="ppm-tg" aria-hidden="true"></i></button>`).join('')}</div></div>`}
    </div>
    <div class="ppm-r"><div class="ppm-pl"><b>Aperçu</b><span id="pp-count"></span></div><div class="ppm-pv" onclick="ppBig()"><div id="pp-preview"></div></div>
      <p class="pp-tip">Ensuite, choisis « Enregistrer en PDF » (ou imprime).</p></div>
  </div>
  <div class="modal-f">
    <button class="btn btn-ghost btn-sm" onclick="closePrintModal()">Fermer</button>
    <button class="btn btn-primary btn-sm" onclick="doPrint()">Créer le PDF</button>
  </div>`;
  refreshPrintPreview();
}
function ppPick(k, v) {
  printOpts[k] = k === 'mode' ? +v : v; ppSay = v;
  document.querySelectorAll(`#m-print [data-pp="${k}"]`).forEach(b => { const on = ppOn(k, b.dataset.v); b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
  const say = $('ppm-say'); if (say) say.textContent = PP_SAY[v] || '';
  const md = document.querySelector('#m-print .ppm-medi .medi'); if (md && md.animate && !mReduced()) md.animate([{transform: 'none'}, {transform: 'translateY(-8px) rotate(-6deg)'}, {transform: 'none'}], {duration: 380, easing: 'ease-out'});
  refreshPrintPreview();
}
function ppToggle(k) {
  printOpts[k] = !printOpts[k]; ppSay = k + (printOpts[k] ? 1 : 0);
  const b = document.querySelector(`#m-print [data-pt="${k}"]`); if (b) { b.classList.toggle('on', printOpts[k]); b.setAttribute('aria-checked', printOpts[k]); }
  const say = $('ppm-say'); if (say) say.textContent = PP_SAY[ppSay] || '';
  refreshPrintPreview();
}
// sur téléphone, toucher l'aperçu l'agrandit (et le rétrécit)
function ppBig() { if (innerWidth < 900) document.querySelector('#m-print .ppm').classList.toggle('pv-big'); }
function ppFit() {
  const pv = $('pp-preview'), box = pv && pv.parentElement; if (!box || !box.clientWidth) return;
  pv.style.zoom = Math.min(.6, (box.clientWidth - 24) / (210 * MM + 2));
}
addEventListener('resize', () => { if (!$('m-print').classList.contains('hide')) ppFit(); });
function refreshPrintPreview() {
  const pv = $('pp-preview'); pv.innerHTML = buildPrintPages();
  const n = pv.querySelectorAll('.pg').length, c = $('pp-count'); if (c) c.textContent = n + (n > 1 ? ' pages' : ' page');
  // le choix se voit tout de suite : l'aperçu revient en haut et s'allume un instant
  const box = pv.parentElement; box.scrollTop = 0;
  ppFit(); requestAnimationFrame(ppFit);   // la page A4 tient dans la largeur de l'aperçu (une fois la fenêtre affichée)
  if (box.animate && !mReduced()) box.animate([{boxShadow: '0 0 0 2px var(--gold)'}, {boxShadow: '0 0 0 2px transparent'}], {duration: 600, easing: 'ease-out'});
}
/* Fiche imprimée (refaite le 26/11, retours de Lucas : « qu'elle ressemble à l'appli » + option noir et blanc) :
   deux thèmes, printOpts.theme = 'app' (fond sombre, cartes, Grille de rythme et doigtés comme à l'écran, pleine page) ou
   'nb' (papier blanc, noir et gris, Médi au trait). En-tête avec Médi, doigtés une seule fois, chaque partie avec ses accords
   en grand et son rythme, les notes dans la bulle de Médi, pied de page avec Médi. Styles : 26-impression.css. */
const pLight = () => (!printOpts || printOpts.theme === 'nb') && 'nb';   // 'nb' : les doigtés au trait noir (02-, 03-)
// les accords d'une partie : leurs noms en grand (les doigtés sont une fois en haut de la fiche)
const pSeq = (p, sm) => !p.chords.length ? '' : `<div class="pf-seq${sm ? ' sm' : ''}">${p.chords.map(c => `<span>${esc(c.name)}</span>`).join('')}</div>`;
const pMedi = (expr, size) => mediSVG(expr, {size, anim: 'still'});
const pFoot = (left, n) => `<div class="pf-foot"><span class="pf-brand">${pMedi('contente', 18)}<b>Guitar Memory</b>${left ? `<i>${esc(left)}</i>` : ''}</span>${n ? `<span class="pf-n">${n}</span>` : ''}</div>`;
function buildPrintPages() {
  const {toc} = printOpts;
  const list = sheets.filter(s => selIds.has(s.id)), th = (pLight() ? 'pf-nb' : 'pf-app') + ' pf2' + (printOpts.size === 'grande' ? ' pf-big' : '');
  let pages = [], pageNo = 0;
  if (toc && list.length > 1) {
    pageNo++;
    pages.push(`<div class="pg ${th} pf-toc"><div class="pf-toc-h"><div><small>Mon carnet de guitare · ${list.length} morceaux</small><h2>Tout ce que j’ai dans les doigts</h2></div>${pMedi('clin', 84)}</div>
      <ol>${list.map((s, i) => `<li><span class="pf-i">${i + 1}</span><span class="pf-tt"><b>${esc(s.title)}</b><i>${esc(s.artist && s.artist !== '—' ? s.artist : '')}</i></span>${s.capo > 0 ? `<span class="pf-chip o">Capo ${s.capo}</span>` : ''}</li>`).join('')}</ol>
      ${pFoot('Sommaire', pageNo)}</div>`);
  }
  // les morceaux se suivent : autant par page qu'il en rentre, jamais coupés (hauteurs mesurées sur une page A4 cachée)
  const songs = list.map((s, i) => pSongHTML(s, toc && list.length > 1 ? i + 1 : 0));
  pPack(songs, th).forEach(grp => { pageNo++; pages.push(`<div class="pg ${th}">${grp.map(i => songs[i]).join('')}${pFoot('', pageNo)}</div>`); });
  return (th.includes('pf-app') ? '<style>@media print{html,body,#print-root{background:#121014!important}}</style>' : '') + pages.join('');
}
const MM = 96 / 25.4;
function pPack(songs, th) {
  const pr = document.createElement('div'); pr.className = 'pg ' + th; pr.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden';
  document.body.appendChild(pr);
  const hs = songs.map(h => { pr.innerHTML = h; return pr.firstElementChild.getBoundingClientRect().height; });
  pr.remove();
  const max = 259 * MM, gap = 7 * MM, out = []; let cur = [], used = 0;
  hs.forEach((h, i) => { if (cur.length && used + gap + h > max) { out.push(cur); cur = []; used = 0; } used += (cur.length ? gap : 0) + h; cur.push(i); });
  if (cur.length) out.push(cur);
  return out;
}
/* un morceau : en-tête, puis une ligne par partie (son nom, ses accords en doigtés avec le nom en gros, son rythme ou son arpège) */
function pSongHTML(s, no) {
  const big = printOpts.size === 'grande', parts = s.parts || [], one = parts.length === 1 && !parts[0].name;
  const chips = [s.capo > 0 ? `<span class="pf-chip o">Capo <b>${s.capo}</b></span>` : '', s.bpm ? `<span class="pf-chip">Tempo <b>${s.bpm}</b></span>` : '',
    s.tuning && s.tuning !== 'Standard' ? `<span class="pf-chip">${esc(s.tuning)}</span>` : ''].join('');
  return `<div class="pf-song">
    <div class="pf2-h">${no ? `<span class="pf-i">${no}</span>` : ''}<div class="pf2-ht"><b>${esc(s.title)}</b>${s.artist && s.artist !== '—' ? `<i>${esc(s.artist)}</i>` : ''}</div>${chips ? `<div class="pf-chips">${chips}</div>` : ''}</div>
    <div class="pf2-c">${parts.map((p, i) => {
      const rep = +(p.repeat || p.reps || 0);
      return `<div class="pf2-row">${one ? '' : `<div class="pf2-pn"><b>${esc(p.name || 'Partie ' + (i + 1))}</b>${rep > 1 ? `<span>×${rep}</span>` : ''}</div>`}
        <div class="pf2-b"><div class="pf2-line"><div class="pf2-chs">${p.chords.map(c => `<div class="pf2-ch"><b>${esc(c.name)}</b>${chordSVG(c, {size: big ? .9 : .75, light: pLight()})}</div>`).join('') || '<span class="pf2-no">—</span>'}</div>
        ${pHas(p) ? `<div class="pf2-way">${pPrintWay(p, 0, true)}</div>` : ''}</div>
        ${p.note ? `<div class="pf2-note">${esc(p.note)}</div>` : ''}</div></div>`;
    }).join('')}
    ${s.memo ? `<div class="pf2-row pf2-memo">${pMedi('neutre', 18)}<span>${esc(s.memo)}</span></div>` : ''}</div>
  </div>`;
}
function doPrint() {
  $('print-root').innerHTML = buildPrintPages();
  $('m-print').classList.add('hide');
  const t0 = document.title, one = selIds.size === 1 && sheets.find(x => selIds.has(x.id));
  document.title = one ? one.title + (one.artist && one.artist !== '—' ? ' - ' + one.artist : '') : 'Mes fiches de guitare';
  window.addEventListener('afterprint', () => { document.title = t0; }, {once: true});
  setTimeout(() => { window.print(); if (!selMode && selIds.size) { selIds.clear(); renderHome(); } }, 150);
}
/* Façon de jouer imprimée (26/11, choix de Lucas après 4 planches de croquis) :
   le rythme = des blocs là où ça gratte (les pauses les séparent), une barre neutre par coup, plus haute si le coup
   est fort, le compte dessous ; le premier et le dernier bloc en orange pâle (la fin se relie au début : aide au
   changement d'accord). Pas de flèches : le sens se déduit de la place (bas sur les chiffres, haut sur les « et »).
   L'arpège = les six cordes en lignes (1 = Mi aigu en haut … 6 = Mi grave en bas), un point par note, gros point = la basse. */
function pPrintWay(p, h, mini) {
  const w = pWay(p);
  return w === 'rh' ? pRhBlocks(p.rhythm, mini) : w === 'arp' ? pArpLines(p, mini) : '';
}
const pF = v => Math.round(v * 10) / 10;
// le compte sous une case : le chiffre sur le temps, « et » au milieu du temps, un point ailleurs (6/8 : 1 à 6)
function pCount(c, per, spb, mes) {
  const k = c % per;
  if (mes === '6/8' && spb === 3) return {t: String(k + 1), b: k % 3 === 0};
  if (k % spb === 0) return {t: String(k / spb + 1), b: true};
  return {t: spb % 2 === 0 && k % spb === spb / 2 ? 'et' : '·', b: false};
}
function pRhBlocks(rh, mini) {
  rh = rhNorm(JSON.parse(JSON.stringify(rh))); if (!rh || !rh.cells.length) return '';
  const per = rhPerBar(rh.mes, rh.res), spb = rhSpb(rh.mes, rh.res), n = rh.cells.length;
  const cw = (spb > 2 ? 20 : 34) * (mini ? .8 : 1), m0 = 4, H = mini ? 28 : 40, cy = mini ? 34 : 50;
  const W = m0 * 2 + n * cw, X = c => m0 + (c + .5) * cw, amp = a => a >= 2 ? 1 : a >= 1 ? .72 : .45;
  // les blocs : les cases jouées qui se suivent (une barre de mesure coupe aussi le bloc)
  const bl = []; let cu = null;
  rh.cells.forEach((c, i) => { if (!c) { cu = null; return; } if (cu && i % per) cu.e = i; else bl.push(cu = {s: i, e: i}); });
  let s = `<svg class="pfr${mini ? ' mini' : ''}" width="${pF(W)}" height="${cy + 4}" viewBox="0 0 ${pF(W)} ${cy + 4}" role="img" aria-label="Le rythme : des blocs là où ça gratte, une barre par coup">`;
  for (let b = 1; b < n / per; b++) s += `<line class="pfr-bar" x1="${pF(m0 + b * per * cw)}" x2="${pF(m0 + b * per * cw)}" y1="0" y2="${H}"/>`;
  bl.forEach((k, j) => {
    const x0 = X(k.s) - cw / 2 + 1.5, x1 = X(k.e) + cw / 2 - 1.5, lk = j === 0 || j === bl.length - 1;
    s += `<rect class="${lk ? 'pfr-lk' : 'pfr-b'}" x="${pF(x0)}" y="0" width="${pF(x1 - x0)}" height="${H}" rx="${mini ? 7 : 10}"/>`;
    for (let c = k.s; c <= k.e; c++) {
      const cell = rh.cells[c], x = X(c), my = H / 2;
      if (cell.d === 'X') { const r = mini ? 3.5 : 5; s += `<path class="pfr-x" d="M${pF(x - r)} ${pF(my - r)}L${pF(x + r)} ${pF(my + r)}M${pF(x + r)} ${pF(my - r)}L${pF(x - r)} ${pF(my + r)}"/>`; continue; }
      const a = amp(cell.a), bw = (3.6 + 2.4 * a) * (mini ? .8 : 1), bh = (10 + 22 * a) * (mini ? .7 : 1);
      s += `<rect class="pfr-c" x="${pF(x - bw / 2)}" y="${pF(my - bh / 2)}" width="${pF(bw)}" height="${pF(bh)}" rx="${pF(bw / 2)}"/>`;
    }
  });
  for (let c = 0; c < n; c++) { const t = pCount(c, per, spb, rh.mes); s += `<text class="pfr-n${t.b ? ' b' : ''}" x="${pF(X(c))}" y="${cy}">${t.t}</text>`; }
  return s + '</svg>';
}
// les notes d'une colonne d'arpège : sur l'accord (corde réelle), ou sans accord, la corde du rôle (la basse sur la 5)
function pArpNotes(roles, ch, bass) {
  if (ch && ch.frets) return arpStepNotes(roles, ch, bass).map(o => ({n: 6 - o.si, bs: o.bs}));
  return (roles || []).map(r => ({n: r === 'B' ? (+bass || 5) : +r, bs: r === 'B'}));
}
function pArpLines(p, mini) {
  const a = p.arp, chs = p.chords.length ? p.chords : [null], steps = a.steps.length;
  const dx = mini ? 7.5 : 14, gap = mini ? 8 : 13, L = mini ? 14 : 20, top = mini ? 14 : 18, rowN = mini ? 2 : 4;
  let out = '';
  for (let r0 = 0; r0 < chs.length; r0 += rowN) {
    const row = chs.slice(r0, r0 + rowN), W = L + row.length * steps * dx + 6, H = top + 5 * gap + 4;
    let s = `<svg class="pfa${mini ? ' mini' : ''}" width="${pF(W)}" height="${H}" viewBox="0 0 ${pF(W)} ${H}" role="img" aria-label="L'arpège sur les six cordes, un point par note">`;
    for (let k = 0; k < 6; k++) { const y = top + k * gap; s += `<text class="pfa-s" x="2" y="${pF(y + (mini ? 2.6 : 3.5))}">${k + 1}</text><line class="pfa-l" x1="${L - 6}" x2="${pF(W - 2)}" y1="${y}" y2="${y}"/>`; }
    row.forEach((ch, m) => {
      const bx = L + m * steps * dx;
      if (ch) s += `<text class="pfa-c" x="${pF(bx + 2)}" y="${top - (mini ? 5 : 8)}">${esc(ch.name)}</text>`;
      if (m) s += `<line class="pfa-m" x1="${pF(bx - dx / 2 + 4)}" x2="${pF(bx - dx / 2 + 4)}" y1="${top - 2}" y2="${top + 5 * gap + 2}"/>`;
      for (let i = 0; i < steps; i++) pArpNotes(a.steps[i], ch, a.bass).forEach(o => {
        s += `<circle class="${o.bs ? 'pfa-bs' : 'pfa-d'}" cx="${pF(bx + i * dx + 6)}" cy="${top + (o.n - 1) * gap}" r="${(o.bs ? 4.2 : 3.2) * (mini ? .8 : 1)}"/>`;
      });
    });
    out += s + '</svg>';
  }
  return `<div class="pfa-w">${out}${mini ? '' : '<div class="pfa-lg">1 = Mi aigu (en haut) … 6 = Mi grave (en bas). Gros point = la basse, au pouce.</div>'}</div>`;
}
// les accords du morceau, une seule fois (dans l'ordre d'apparition)
function pUniqueChords(s) {
  const seen = new Set(), out = [];
  (s.parts || []).forEach(p => p.chords.forEach(c => { if (!seen.has(c.name)) { seen.add(c.name); out.push(c); } }));
  return out;
}
const pBubble = (txt, lyr) => `<div class="pf-say">${pMedi('neutre', 22)}<div class="pf-b${lyr ? ' lyr' : ''}">${lyr ? lyricsPreviewHTML(txt) : esc(txt)}</div></div>`;
function pHead(s, compact) {
  const chips = [s.capo > 0 ? `<span class="pf-chip o">Capo <b>${s.capo}</b></span>` : '', s.bpm ? `<span class="pf-chip">Tempo <b>${s.bpm}</b></span>` : '',
    s.tuning && s.tuning !== 'Standard' ? `<span class="pf-chip">${esc(s.tuning)}</span>` : '', s.difficulty && !compact ? `<span class="pf-chip">${esc(dispDiff(s.difficulty))}</span>` : ''].join('');
  return `<div class="pf-head${compact ? ' sm' : ''}"><div class="pf-ht"><div class="pf-title">${esc(s.title)}</div>${s.artist && s.artist !== '—' ? `<div class="pf-artist">${esc(s.artist)}</div>` : ''}${chips ? `<div class="pf-chips">${chips}</div>` : ''}</div>${pMedi('contente', compact ? 48 : 64)}</div>`;
}
function printSheetHTML(s, compact) {
  const uniq = pUniqueChords(s);
  return `${pHead(s, compact)}
    ${uniq.length ? `<div class="pf-dg"><div class="pf-lbl">Les accords</div><div class="pf-dgs">${uniq.map(c => `<div class="pf-d">${chordSVG(c, {size: compact ? .8 : 1, light: pLight()})}<b>${esc(c.name)}</b></div>`).join('')}</div></div>` : ''}
    ${(s.parts||[]).map((p, i) => {
      const staff = pWay(p) === 'arp' ? '' : tabStaffSVG(p.chords, pLight()), rep = +(p.repeat || p.reps || 0);
      return `<div class="pf-part">
        <div class="pf-pt"><b>${esc(p.name || 'Partie ' + (i + 1))}</b>${rep > 1 ? `<span class="pf-chip">×${rep}</span>` : ''}</div>
        ${pSeq(p, compact)}
        ${pHas(p) ? `<div class="pf-way">${pPrintWay(p, compact ? 74 : 88)}</div>` : ''}
        ${staff && !compact ? `<div class="pf-tab">${staff}</div>` : ''}
        ${p.tabText && !compact ? `<div class="p-ascii">${esc(p.tabText)}</div>` : ''}
        ${typeof p.lyrics === 'string' && p.lyrics.trim() && !compact ? pBubble(p.lyrics, true) : ''}
        ${p.note ? pBubble(p.note) : ''}
      </div>`;
    }).join('')}
    ${s.memo && !compact ? pBubble(s.memo) : ''}`;
}
// le cahier : une ligne par partie (accords en grand + rythme), les doigtés en petit une seule fois
function printCahierHTML(s) {
  const uniq = pUniqueChords(s);
  return `<div class="pf-cahier">${pHead(s, true)}
    ${uniq.length ? `<div class="pf-dgs sm">${uniq.map(c => `<div class="pf-d">${chordSVG(c, {size: .55, light: pLight()})}<b>${esc(c.name)}</b></div>`).join('')}</div>` : ''}
    ${(s.parts||[]).map((p, i) => `<div class="pf-row"><span class="pf-i">${i + 1}</span><b class="pf-rn">${esc(p.name || 'Partie ' + (i + 1))}</b>
      ${pSeq(p, true) || '<div class="pf-seq sm">—</div>'}
      ${pHas(p) ? `<div class="pf-rw">${pPrintWay(p, 62, true)}</div>` : ''}</div>`).join('')}</div>`;
}

/* ═══════ PRINT ═══════ */
function printOne() { printSheet(cur.id); }
let printOpts = null;
function openPrintModal() {
  printOpts = printOpts || {};
  printOpts.mode = printOpts.mode || 1;
  printOpts.toc = printOpts.toc != null ? printOpts.toc : selIds.size > 2;
  printOpts.num = printOpts.num != null ? printOpts.num : true;
  printOpts.style = printOpts.style || 'fiche';
  printOpts.theme = printOpts.theme || 'app';   // 'app' : comme l'appli (fond sombre) ; 'nb' : noir et blanc, pour économiser l'encre
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
  fiche: '<span class="ppm-v pg1"><i></i><i></i><i></i></span>', cahier: '<span class="ppm-v pg2"><i></i><i></i><i></i><i></i><i></i></span>',
  1: '<span class="ppm-v n1"><i></i></span>', 2: '<span class="ppm-v n2"><i></i><i></i></span>'
};
const PP_Q = [
  {k: 'theme', q: 'Quelles couleurs ?', o: [['app', 'Comme l’appli', 'fond sombre'], ['nb', 'Noir et blanc', 'moins d’encre']]},
  {k: 'style', q: 'Quelle forme ?', o: [['fiche', 'Détaillée', 'tout le morceau'], ['cahier', 'Compacte', 'une ligne par partie']]},
  {k: 'mode', q: 'Combien de fiches par page ?', o: [[1, 'Une', 'bien lisible'], [2, 'Deux', 'format carnet']]}
];
const PP_SAY = {
  start: 'Je te prépare ta fiche. Choisis comment tu la veux, l’aperçu suit.',
  app: 'Comme dans l’appli, sur fond sombre. Ça claque, mais ça boit de l’encre.',
  nb: 'Noir et blanc : ton imprimante te dit merci.',
  fiche: 'La fiche complète, avec la tablature, les notes et les paroles.',
  cahier: 'Version cahier : une ligne par partie, tout le morceau d’un coup d’œil.',
  1: 'Une fiche par page, bien lisible au pupitre.', 2: 'Deux fiches par page : parfait pour un carnet de poche.',
  toc1: 'Un sommaire au début : tu retrouves ton morceau tout de suite.', toc0: 'Pas de sommaire : on file direct aux fiches.',
  num1: 'Les pages numérotées : rien ne se mélange.', num0: 'Sans numéros : plus épuré.'
};
// les options en plus, en cartes comme les autres choix (on / off)
const PP_T = [{k: 'toc', l: 'Un sommaire', sub: 'au début du carnet', many: 1}, {k: 'num', l: 'Les numéros', sub: 'en bas des pages'}];
let ppSay = null;
const ppOn = (k, v) => String(printOpts[k]) === String(v);
function renderPrintModal() {
  const n = selIds.size;
  $('m-print-body').innerHTML = `<div class="ppm">
    <div class="ppm-l">
      <div class="modal-t">${n > 1 ? `Ton PDF · ${n} fiches` : 'Ta fiche en PDF'}</div>
      ${mediBulle(ppSay ? 'contente' : 'clin', `<span id="ppm-say">${PP_SAY[ppSay || 'start']}</span>`, {size: 46, cls: 'ppm-medi'})}
      ${PP_Q.map(q => `<div class="ppm-q"><div class="ppm-ql">${q.q}</div><div class="ppm-os" role="radiogroup" aria-label="${q.q}">${q.o.map(([v, l, sub]) => {
        const m = typeof ppMini[v] === 'function' ? ppMini[v]() : ppMini[v];
        return `<button type="button" class="ppm-o${ppOn(q.k, v) ? ' on' : ''}" role="radio" aria-checked="${ppOn(q.k, v)}" data-pp="${q.k}" data-v="${v}" onclick="ppPick('${q.k}','${v}')">${m}<span class="ppm-ot"><b>${l}</b><small>${sub}</small></span></button>`;
      }).join('')}</div></div>`).join('')}
      <div class="ppm-q"><div class="ppm-ql">Et en plus ?</div><div class="ppm-os">${PP_T.filter(t => !t.many || n > 1).map(t =>
        `<button type="button" class="ppm-o ppm-t${printOpts[t.k] ? ' on' : ''}" role="switch" aria-checked="${!!printOpts[t.k]}" data-pt="${t.k}" onclick="ppToggle('${t.k}')">${ppMini[t.k]}<span class="ppm-ot"><b>${t.l}</b><small>${t.sub}</small></span><i class="ppm-tg" aria-hidden="true"></i></button>`).join('')}</div></div>
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
function refreshPrintPreview() {
  const pv = $('pp-preview'); pv.innerHTML = buildPrintPages();
  const n = pv.querySelectorAll('.pg').length, c = $('pp-count'); if (c) c.textContent = n + (n > 1 ? ' pages' : ' page');
  // le choix se voit tout de suite : l'aperçu revient en haut et s'allume un instant
  const box = pv.parentElement; box.scrollTop = 0;
  if (box.animate && !mReduced()) box.animate([{boxShadow: '0 0 0 2px var(--gold)'}, {boxShadow: '0 0 0 2px transparent'}], {duration: 600, easing: 'ease-out'});
}
/* Fiche imprimée (refaite le 26/11, retours de Lucas : « qu'elle ressemble à l'appli » + option noir et blanc) :
   deux thèmes, printOpts.theme = 'app' (fond sombre, cartes, Grille de rythme et doigtés comme à l'écran, pleine page) ou
   'nb' (papier blanc, noir et gris, Médi au trait). En-tête avec Médi, doigtés une seule fois, chaque partie avec ses accords
   en grand et son rythme, les notes dans la bulle de Médi, pied de page avec Médi. Styles : 26-impression.css. */
const pLight = () => !printOpts || printOpts.theme === 'nb';
// les accords d'une partie : leurs noms en grand (les doigtés sont une fois en haut de la fiche)
const pSeq = (p, sm) => !p.chords.length ? '' : `<div class="pf-seq${sm ? ' sm' : ''}">${p.chords.map(c => `<span>${esc(c.name)}</span>`).join('')}</div>`;
const pMedi = (expr, size) => mediSVG(expr, {size, anim: 'still'});
const pFoot = (left, n) => `<div class="pf-foot"><span class="pf-brand">${pMedi('contente', 18)}<b>Guitar Memory</b>${left ? `<i>${esc(left)}</i>` : ''}</span>${n ? `<span class="pf-n">${n}</span>` : ''}</div>`;
function buildPrintPages() {
  const {mode: perPage, toc, num, style} = printOpts;
  const list = sheets.filter(s => selIds.has(s.id)), th = pLight() ? 'pf-nb' : 'pf-app';
  let pages = [], pageNo = 0;
  if (toc) {
    pageNo++;
    pages.push(`<div class="pg ${th} pf-toc"><div class="pf-toc-h"><div><small>Mon carnet de guitare</small><h2>${list.length} morceau${list.length > 1 ? 'x' : ''} que je sais jouer</h2></div>${pMedi('clin', 96)}</div>
      <ol>${list.map((s, i) => `<li><span class="pf-i">${i + 1}</span><span class="pf-tt"><b>${esc(s.title)}</b><i>${esc(s.artist && s.artist !== '—' ? s.artist : '')}</i></span>${s.capo > 0 ? `<span class="pf-chip o">Capo ${s.capo}</span>` : ''}${s.bpm ? `<span class="pf-chip">${s.bpm} BPM</span>` : ''}</li>`).join('')}</ol>
      ${num ? pFoot('Sommaire', pageNo) : ''}</div>`);
  }
  for (let i = 0; i < list.length; i += perPage) {
    pageNo++;
    const chunk = list.slice(i, i + perPage);
    pages.push(`<div class="pg ${th}">${chunk.map(s => `<div class="${perPage===2?'p-half':''}">${
      style === 'cahier' ? printCahierHTML(s) : printSheetHTML(s, perPage===2)}</div>`).join('')}
      ${num ? pFoot('', pageNo) : ''}</div>`);
  }
  // thème de l'appli : la page entière est sombre, sans marge blanche autour
  return (th === 'pf-app' ? '<style>@media print{@page{size:A4;margin:0}html,body,#print-root{background:#121014!important}}</style>' : '') + pages.join('');
}
function doPrint() {
  $('print-root').innerHTML = buildPrintPages();
  $('m-print').classList.add('hide');
  const t0 = document.title, one = selIds.size === 1 && sheets.find(x => selIds.has(x.id));
  document.title = one ? one.title + (one.artist && one.artist !== '—' ? ' - ' + one.artist : '') : 'Mes fiches de guitare';
  window.addEventListener('afterprint', () => { document.title = t0; }, {once: true});
  setTimeout(() => { window.print(); if (!selMode && selIds.size) { selIds.clear(); renderHome(); } }, 150);
}
// façon de jouer imprimée : le rythme en cases (temps par temps), l'arpège en ruban
function pPrintWay(p, h, mini) {
  const L = pLight();
  if (pWay(p) !== 'rh') return pWayHTML(p, L, mini ? {mini: true} : undefined);
  return L ? `<div class="p-rh">${rhTimeHTML(p.rhythm)}</div>` : rhythmSVG(p.rhythm, false, {mini: true});   // l'appli : la Grille de la fiche
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
      const staff = tabStaffSVG(p.chords, pLight()), rep = +(p.repeat || p.reps || 0);
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

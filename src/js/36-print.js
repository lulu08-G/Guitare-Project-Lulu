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
  document.querySelector('#m-print .modal').classList.add('wide');
  renderPrintModal();
  $('m-print').classList.remove('hide');
}
function renderPrintModal() {
  const n = selIds.size;
  $('m-print-body').innerHTML = `
    <div class="modal-t">${n>1?`Ton PDF · ${n} fiches`:'Ta fiche en PDF'}</div>
    <div class="frow">
      <div class="fg"><label>Style</label>
        <select id="pp-style" onchange="printOpts.style=this.value;refreshPrintPreview()">
          <option value="fiche" ${printOpts.style==='fiche'?'selected':''}>Fiche détaillée</option>
          <option value="cahier" ${printOpts.style==='cahier'?'selected':''}>Cahier compact : accords et rythme sur une ligne</option>
        </select></div>
      <div class="fg"><label>Couleurs</label>
        <select id="pp-theme" onchange="printOpts.theme=this.value;refreshPrintPreview()">
          <option value="app" ${printOpts.theme==='app'?'selected':''}>Comme l’appli (fond sombre)</option>
          <option value="nb" ${printOpts.theme==='nb'?'selected':''}>Noir et blanc (moins d’encre)</option>
        </select></div>
      <div class="fg"><label>Mise en page</label>
        <select id="pp-mode" onchange="printOpts.mode=+this.value;refreshPrintPreview()">
          <option value="1" ${printOpts.mode===1?'selected':''}>1 fiche par page</option>
          <option value="2" ${printOpts.mode===2?'selected':''}>2 fiches par page</option>
        </select></div>
    </div>
    <div class="frow">
      <label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:13px;color:var(--cream2)">
        <input type="checkbox" id="pp-toc" style="width:auto" ${printOpts.toc?'checked':''} onchange="printOpts.toc=this.checked;refreshPrintPreview()"> Sommaire en première page</label>
      <label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0;font-size:13px;color:var(--cream2)">
        <input type="checkbox" id="pp-num" style="width:auto" ${printOpts.num?'checked':''} onchange="printOpts.num=this.checked;refreshPrintPreview()"> Numéroter les pages</label>
    </div>
    <p class="pp-tip">Dans la fenêtre qui s’ouvre, choisis « Enregistrer en PDF ». Tu pourras aussi l’imprimer.</p>
    <div style="background:#5a5a5a;border-radius:10px;padding:14px;overflow:auto;max-height:52vh;margin-top:8px">
      <div id="pp-preview" style="zoom:.42"></div>
    </div>
    <div class="modal-f">
      <button class="btn btn-ghost btn-sm" onclick="closePrintModal()">Fermer</button>
      <button class="btn btn-primary btn-sm" onclick="doPrint()">Créer le PDF</button>
    </div>`;
  refreshPrintPreview();
}
function refreshPrintPreview() { $('pp-preview').innerHTML = buildPrintPages(); }
/* Fiche imprimée (refaite le 26/11, retours de Lucas : « qu'elle ressemble à l'appli » + option noir et blanc) :
   deux thèmes, printOpts.theme = 'app' (fond sombre, cartes, Grille de rythme et doigtés comme à l'écran, pleine page) ou
   'nb' (papier blanc, noir et gris, Médi au trait). En-tête avec Médi, doigtés une seule fois, chaque partie avec ses accords
   en grand et son rythme, les notes dans la bulle de Médi, pied de page avec Médi. Styles : 26-impression.css. */
const pLight = () => !printOpts || printOpts.theme === 'nb';
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
        ${p.chords.length ? `<div class="pf-seq">${p.chords.map(c => `<span>${esc(c.name)}</span>`).join('')}</div>` : ''}
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
      <div class="pf-seq sm">${p.chords.map(c => `<span>${esc(c.name)}</span>`).join('') || '—'}</div>
      ${pHas(p) ? `<div class="pf-rw">${pPrintWay(p, 62, true)}</div>` : ''}</div>`).join('')}</div>`;
}

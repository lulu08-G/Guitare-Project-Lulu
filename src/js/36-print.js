/* ═══════ PRINT ═══════ */
function printOne() { printSheet(cur.id); }
let printOpts = null;
function openPrintModal() {
  printOpts = printOpts || {};
  printOpts.mode = printOpts.mode || 1;
  printOpts.toc = printOpts.toc != null ? printOpts.toc : selIds.size > 2;
  printOpts.num = printOpts.num != null ? printOpts.num : true;
  printOpts.style = printOpts.style || 'fiche';
  document.querySelector('#m-print .modal').classList.add('wide');
  renderPrintModal();
  $('m-print').classList.remove('hide');
}
function renderPrintModal() {
  const n = selIds.size;
  $('m-print-body').innerHTML = `
    <div class="modal-t">Aperçu avant impression · ${n} fiche${n>1?'s':''}</div>
    <div class="frow">
      <div class="fg"><label>Style</label>
        <select id="pp-style" onchange="printOpts.style=this.value;refreshPrintPreview()">
          <option value="fiche" ${printOpts.style==='fiche'?'selected':''}>Fiche détaillée</option>
          <option value="cahier" ${printOpts.style==='cahier'?'selected':''}>Cahier compact : accords et rythme sur une ligne</option>
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
    <div style="background:#5a5a5a;border-radius:10px;padding:14px;overflow:auto;max-height:52vh;margin-top:8px">
      <div id="pp-preview" style="zoom:.42"></div>
    </div>
    <div class="modal-f">
      <button class="btn btn-ghost btn-sm" onclick="closePrintModal()">Fermer</button>
      <button class="btn btn-primary btn-sm" onclick="doPrint()">Imprimer / PDF</button>
    </div>`;
  refreshPrintPreview();
}
function refreshPrintPreview() { $('pp-preview').innerHTML = buildPrintPages(); }
function buildPrintPages() {
  const {mode: perPage, toc, num, style} = printOpts;
  const list = sheets.filter(s => selIds.has(s.id));
  let pages = [], pageNo = 0;
  if (toc) {
    pageNo++;
    pages.push(`<div class="pg"><div class="p-toc"><h2>Cahier de guitare</h2><ol>${
      list.map(s => `<li>${esc(s.title)} <span class="a">— ${esc(s.artist||'')}${s.capo?' · capo '+s.capo:''}</span></li>`).join('')}</ol></div>
      ${num ? `<div class="p-foot"><span>Sommaire</span><span>${pageNo}</span></div>` : ''}</div>`);
  }
  for (let i = 0; i < list.length; i += perPage) {
    pageNo++;
    const chunk = list.slice(i, i + perPage);
    pages.push(`<div class="pg">${chunk.map(s => `<div class="${perPage===2?'p-half':''}">${
      style === 'cahier' ? printCahierHTML(s) : printSheetHTML(s, perPage===2)}</div>`).join('')}
      ${num ? `<div class="p-foot"><span>Guitar Memory Sheets</span><span>${pageNo}</span></div>` : ''}</div>`);
  }
  return pages.join('');
}
function doPrint() {
  $('print-root').innerHTML = buildPrintPages();
  $('m-print').classList.add('hide');
  setTimeout(() => { window.print(); if (!selMode && selIds.size) { selIds.clear(); renderHome(); } }, 150);
}
// façon de jouer imprimée : la ligne de groupes de la fiche, volontairement plus petite que les accords
function pPrintWay(p, h, mini) {
  if (pWay(p) !== 'rh') return pWayHTML(p, true, mini ? {mini: true} : undefined);
  return `<div class="p-rh">${rhTimeHTML(p.rhythm)}</div>`;
}
function printSheetHTML(s, compact) {
  return `<div class="p-head">
      <div><div class="p-title" style="${compact?'font-size:20px':''}">${esc(s.title)}</div><div class="p-artist">${esc(s.artist||'')}</div></div>
      <div class="p-meta">
        ${s.capo>0?`<div class="p-capo">CAPO ${s.capo}</div>`:''}
        ${s.tuning&&s.tuning!=='Standard'?`<div class="p-bpm">${esc(s.tuning)}</div>`:''}
        ${s.bpm?`<div class="p-bpm">&#9833; ${s.bpm} BPM</div>`:''}
        ${s.difficulty?`<div class="p-bpm">${esc(dispDiff(s.difficulty))}</div>`:''}
      </div>
    </div>
    ${(s.parts||[]).map(p => {
      const staff = tabStaffSVG(p.chords, true);
      return `<div class="p-part">
        <div class="p-part-t">${p.name ? `<span class="d"></span>${esc(p.name)}` : ''}${p.note && compact ? `<span class="c">${esc(p.note)}</span>` : ''}</div>
        ${p.chords.length ? `<div class="p-chords">${p.chords.map(c => `<div class="p-chord"><div class="cn">${esc(c.name)}</div>${chordSVG(c, {size: compact?.9:1.15, light:true})}</div>`).join('')}</div>` : ''}
        ${staff ? `<div style="margin-bottom:6px">${staff}</div>` : ''}
        ${p.tabText && !compact ? `<div class="p-ascii">${esc(p.tabText)}</div>` : ''}
        ${pPrintWay(p, compact ? 74 : 88)}
        ${typeof p.lyrics === 'string' && p.lyrics.trim() && !compact ? `<div class="p-note" style="font-style:normal">${lyricsPreviewHTML(p.lyrics)}</div>` : ''}
        ${p.note && !compact ? `<div class="p-note">${esc(p.note)}</div>` : ''}
      </div>`;
    }).join('')}
    ${s.memo && !compact ? `<div class="p-note">${esc(s.memo)}</div>` : ''}`;
}
// Senior note: "cahier" is the practical practice-room layout — a scannable strip
// of chords + rhythm curve per part, no prose, so a whole songbook fits densely.
function printCahierHTML(s) {
  return `<div class="p-head" style="margin-bottom:10px;padding-bottom:6px">
      <div><div class="p-title" style="font-size:18px">${esc(s.title)}</div><div class="p-artist" style="font-size:11px">${esc(s.artist||'')}</div></div>
      <div class="p-meta">
        ${s.capo>0?`<div class="p-capo" style="font-size:10px;padding:2px 9px">CAPO ${s.capo}</div>`:''}
        ${s.bpm?`<div class="p-bpm">&#9833; ${s.bpm}</div>`:''}
      </div>
    </div>
    ${(s.parts||[]).map(p => `<div style="margin-bottom:9px;page-break-inside:avoid">
      ${p.name ? `<div class="p-part-t" style="margin-bottom:3px"><span class="d"></span>${esc(p.name)}</div>` : ''}
      <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
        <div style="display:flex;gap:9px;flex-wrap:wrap">${
          p.chords.length ? p.chords.map(c => `<div class="p-chord"><div class="cn" style="font-size:12px">${esc(c.name)}</div>${chordSVG(c,{size:.6,light:true})}</div>`).join('')
                           : '<span style="font-size:10px;color:#999">—</span>'}</div>
        ${pHas(p) ? `<div>${pPrintWay(p, 62, true)}</div>` : ''}
      </div>
    </div>`).join('')}`;
}


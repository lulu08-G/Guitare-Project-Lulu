/* ═══════ CHORD LIBRARY VIEW ═══════ */
function renderLib() {
  const q = ($('lib-q').value || '').toLowerCase().trim();
  const body = $('lib-body');
  const card = (c, big) => `<div class="lib-card ${big?'big':''}">
    <div class="cn">${c.n}</div>${chordSVG(newChord(c.n), {size: big ? 1.28 : 1})}
    <button class="lib-play" onclick="playChord(newChord('${c.n}'), 0)" title="Écouter">
      <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></button>
  </div>`;
  if (q) {
    const hits = LIB.filter(c => c.n.toLowerCase().includes(q));
    body.innerHTML = `<div class="lib-sec"><div class="lib-sec-t">${hits.length} résultat${hits.length>1?'s':''}</div>
      <div class="lib-grid">${hits.map(c => card(c)).join('') || '<p style="color:var(--cream4);font-size:13px">Aucun accord trouve.</p>'}</div></div>`;
    return;
  }
  const rest = LIB.filter(c => !MAGIC.includes(c.n) && !ESSENTIAL.includes(c.n));
  const filtered = rest.filter(c => libFilter === 'all' ? true
    : libFilter === 'barre' ? !!c.barre
    : libFilter === '7' ? c.fam === '7'
    : c.fam === libFilter);
  body.innerHTML = `
    <div class="lib-sec">
      <div class="lib-sec-t">Les 4 magiques</div>
      <div class="lib-sec-d">G, C, D, Em — avec ces quatre-la, des centaines de morceaux tombent.</div>
      <div class="lib-grid big">${MAGIC.map(n => card(findChord(n), true)).join('')}</div>
    </div>
    <div class="lib-sec">
      <div class="lib-sec-t">Indispensables</div>
      <div class="lib-sec-d">Le second cercle : ils debloquent presque tout le reste.</div>
      <div class="lib-grid">${ESSENTIAL.map(n => card(findChord(n))).join('')}</div>
    </div>
    <div class="lib-sec">
      <div class="lib-sec-t">Le reste</div>
      <div class="lib-sec-d">${rest.length} accords — filtre par famille.</div>
      <div class="filters">
        ${[['all','Tous'],['maj','Majeurs'],['min','Mineurs'],['7','Septièmes'],['sus','Sus'],['add','Add9'],['barre','Barrés']]
          .map(([k,l]) => `<button class="filt ${libFilter===k?'on':''}" onclick="libFilter='${k}';renderLib()">${l}</button>`).join('')}
      </div>
      <div class="lib-grid">${filtered.map(c => card(c)).join('') || '<p style="color:var(--cream4);font-size:13px">Rien dans cette famille.</p>'}</div>
    </div>`;
}


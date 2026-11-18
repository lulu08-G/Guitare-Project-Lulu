/* ═══════ CHORD LIBRARY VIEW ═══════ */
function renderLib() {   // refonte : familles en puces, une grille de doigtés à écouter, Médi en conseil
  const q = ($('lib-q').value || '').toLowerCase().trim();
  const body = $('lib-body');
  if (libFilter === 'all' && !renderLib._init) { libFilter = 'ess'; renderLib._init = true; }
  const card = c => `<button type="button" class="lib-c2" onclick="playChord(newChord('${c.n}'), 0)" aria-label="Écouter ${c.n}"><b>${c.n}</b>${chordSVG(newChord(c.n), {size: 1})}</button>`;
  const grid = l => `<div class="lib-g2">${l.map(card).join('') || '<p class="lib-none">Rien ici.</p>'}</div>`;
  if (q) { const hits = LIB.filter(c => c.n.toLowerCase().includes(q)); body.innerHTML = `<p class="lib-n">${hits.length} accord${hits.length > 1 ? 's' : ''}</p>` + grid(hits); return; }
  const fams = [['ess', 'Les essentiels'], ['min', 'Mineurs'], ['7', 'Septièmes'], ['barre', 'Barrés'], ['sus', 'Sus'], ['add', 'Add9'], ['maj', 'Majeurs'], ['all', 'Tous']];
  const ess = [...MAGIC, ...ESSENTIAL].map(findChord).filter(Boolean);
  const list = libFilter === 'ess' ? ess : LIB.filter(c => libFilter === 'all' ? true : libFilter === 'barre' ? !!c.barre : libFilter === '7' ? c.fam === '7' : c.fam === libFilter);
  body.innerHTML = `<div class="lib-chips">${fams.map(([k, l]) => `<button type="button" class="${libFilter === k ? 'on' : ''}" aria-pressed="${libFilter === k}" onclick="libFilter='${k}';renderLib()">${l}</button>`).join('')}</div>
    ${mediBulle('neutre', 'Touche un accord pour l’entendre. Pas trouvé ? Dans une fiche, « Créer mon accord » : tu poses tes doigts, je le reconnais.', {size: 44, cls: 'lib-medi'})}
    ${grid(list)}`;
}


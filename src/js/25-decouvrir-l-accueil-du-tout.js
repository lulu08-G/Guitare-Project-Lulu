/* ═══════ DÉCOUVRIR : l'accueil — du tout fait (fiches prêtes, morceaux populaires, entraînement) ═══════ */
const CAT_NOTE = ' Grille simplifiée : à vérifier à l’oreille avec l’original.';
const CATALOG = [
  {t:'Mistral gagnant', a:'Renaud', capo:2, bpm:80, d:'Intermediaire', ch:['Am','Dm','G','C','F','E','Am'], pat:'D-DUD-DU', m:'Joué avec capo 2 (le morceau est en si mineur) : formes Am Dm G C F E.'},
  {t:'Dès que le vent soufflera', a:'Renaud', capo:0, bpm:80, d:'Debutant', ch:['Em','D','G','B7'], pat:'D-DU-UDU', m:'Quatre accords qui tournent.'},
  {t:'Morgane de toi', a:'Renaud', capo:0, bpm:90, d:'Debutant', ch:['Em','G','D','Am','Em','G'], pat:'D-DU-UDU', m:'Début du couplet.'},
  {t:'Les Champs-Élysées', a:'Joe Dassin', capo:4, bpm:120, d:'Debutant', ch:['G','B7','Em','G7','C','A7','D','D7'], pat:'DuDuDuDu', m:'Capo 4 : on joue des formes simples.'},
  {t:'Foule sentimentale', a:'Alain Souchon', capo:0, bpm:96, d:'Intermediaire', ch:['Em','Am','D7','B7','Em','C','Am','B7'], pat:'D-DU-UDU', m:'Introduction et couplet.'},
  {t:'Je l’aime à mourir', a:'Francis Cabrel', capo:5, bpm:76, d:'Intermediaire', ch:['C','Cmaj7','Am','Dm','F','G','C'], pat:'D-DUD-DU', m:'Capo 5. Le Cmaj7 remplace le Do avec si à la basse.'},
  {t:'Lady Melody', a:'Tom Frager', capo:2, bpm:90, d:'Intermediaire', ch:['D','A','Em','G','F#m'], pat:'-U-U-U-U', m:'Capo 2. Reggae : des coups vers le haut entre les temps. L’ordre des accords est à caler à l’oreille.'},
  {t:'How to Save a Life', a:'The Fray', capo:3, bpm:122, d:'Debutant', ch:['G','D','Em','C','G','D'], pat:'D-DU-UDU', m:'Capo 3. Couplet : G et D. Refrain : Em, C, G, D. Un Bm apparaît au pont.'}
];
const catLinks = x => { const q = encodeURIComponent(x.t + ' ' + x.a);
  return [{id:uid(), url:'https://www.youtube.com/results?search_query=' + q + '+tuto+guitare', title:'Tutos guitare : ' + x.t},
          {id:uid(), url:'https://www.google.com/search?q=' + q + '+accords+guitare', title:'Autres grilles d’accords : ' + x.t}]; };
const catFind = x => sheets.find(z => z.title.trim().toLowerCase() === x.t.toLowerCase());
async function catAdd(x) {
  const sh = newSheet_(); sh.title = x.t; sh.artist = x.a; sh.capo = x.capo; sh.bpm = x.bpm; sh.difficulty = x.d; sh.color = 'gold';
  sh.blocks = {capo: x.capo > 0, tempo:true, diff:true, coffre:true}; sh.memo = x.m + CAT_NOTE; sh.links = catLinks(x);
  const pt = newPart(''); pt.chords = x.ch.map(newChord); pt.rhythm = rhFromPat(x.pat); sh.parts = [pt];
  sheets.push(sh); await DB.put('sheets', sh); return sh;
}
async function catOpen(k) {   // ouvre la fiche prête ; l'ajoute d'abord à mes fiches si elle n'y est pas
  const x = CATALOG[k]; if (!x) return;
  let sh = catFind(x);
  if (!sh) { sh = await catAdd(x); toast('Ajoutée à tes fiches'); }
  viewSheet(sh.id);
}
const POPULAR = [['Wonderwall','Oasis'],['Knockin’ on Heaven’s Door','Bob Dylan'],['Let It Be','The Beatles'],['Stand by Me','Ben E. King'],['Hallelujah','Leonard Cohen'],['Zombie','The Cranberries'],['Riptide','Vance Joy'],['Hotel California','Eagles'],['Je te promets','Johnny Hallyday'],['Formidable','Stromae']];
function discGo(t, a) {   // un morceau : ses tutos, et la fiche qui se remplit à côté
  t = (t || '').trim(); if (!t) { toast('Écris un titre de morceau', true); return; }
  tuto.title = t; tuto.artist = a || ''; if (typeof at !== 'undefined') at.s = null;
  go('atelier'); $('at-title').value = t; $('at-artist').value = a || ''; atCommitNow();
}
function discSearch() { const q = $('disc-q').value; const m = sheets.find(z => z.title.trim().toLowerCase() === q.trim().toLowerCase()); if (m) viewSheet(m.id); else discGo(q, ''); }
// accords d'une fiche, dans l'ordre, sans doublon
const sheetChords = s => [...new Set((s.parts || []).flatMap(p => p.chords.map(c => c.name)).filter(Boolean))];
// le prochain mur à passer : le premier commencé et pas fini, sinon le premier pas fini
function blocNext() {
  const dn = blocDone(), l = BLOCS.map((b, i) => ({b, i, n: b.cards.length, f: b.cards.filter(c => dn[c.k]).length})).filter(x => x.n && x.f < x.n);
  return l.find(x => x.f > 0) || l[0] || null;
}
const ARROW_R = '<svg class="chev" viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2 L8 8 L2 14"/></svg>';
const PLAY_I = '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3 L15 9 L5 15 Z"/></svg>';
function renderDisc() {
  const opened = sheets.find(x => x.id === LS.get('gms_last'));
  const last = opened || sheets.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null;
  let hero = '';
  if (last) {
    const ch = sheetChords(last).slice(0, 4), meta = last.capo > 0 ? `capo ${last.capo}` : '';
    hero = `<section class="dc-hero">${mediBulle('clin', opened ? `Salut ! On reprend ${esc(last.title)} là où tu l’as laissé ?` : `Salut ! On joue ${esc(last.title)} ce soir ?`, {size: 70, anim: 'vivant'})}
      <button type="button" class="dc-resume" onclick="viewSheet('${last.id}')">
        <span class="dc-rt"><span class="dc-rh"><b>${esc(last.title)}</b>${last.artist && last.artist !== '—' ? `<small>${esc(last.artist)}</small>` : ''}</span>
        <span class="dc-rc">${ch.map((c, i) => `<span${i ? '' : ' class="a"'}>${esc(c)}</span>`).join('')}${meta ? `<small>${meta}</small>` : ''}</span></span>
        <span class="dc-play" aria-label="Jouer">${PLAY_I}</span></button></section>`;
  } else {
    hero = `<section class="dc-hero">${mediBulle('clin', 'Salut ! Note le premier morceau que tu sais jouer, je te le garde.', {size: 70, anim: 'vivant'})}
      <button type="button" class="btn btn-primary dc-first" onclick="createAsk(event)">Créer ma première fiche</button></section>`;
  }
  $('disc-hero').innerHTML = hero;
  const diff = d => d === 'Debutant' ? 'Facile' : d === 'Avance' ? 'Difficile' : 'Moyen';
  const ready = (x, k) => { const u = [...new Set(x.ch)].reduce((a, c) => a.length < 3 && (a.join(' ') + ' ' + c).trim().length <= 6 ? a.concat(c) : a, []).join(' ') || x.ch[0], inMine = catFind(x);
    return `<button type="button" class="dc-card" onclick="catOpen(${k})"><span class="dc-ch">${esc(u)}</span><span class="dc-ct"><b>${esc(x.t)}</b><small>${inMine ? 'Dans mes fiches' : (x.capo ? `Capo ${x.capo}, ` : '') + diff(x.d).toLowerCase()}</small></span></button>`; };
  let h = `<section class="dc-sec"><div class="dc-sh"><h2>Fiches prêtes à jouer</h2></div><div class="dc-row">${CATALOG.map(ready).join('')}</div></section>`;
  h += `<section class="dc-sec"><div class="dc-sh"><h2>Populaires à apprendre</h2></div><div class="dc-row">${POPULAR.map(([t, a]) => `<button type="button" class="dc-card dc-pop" onclick="discGo('${t.replace(/'/g, "\\'")}','${a.replace(/'/g, "\\'")}')"><span class="dc-yt">${PLAY_I}</span><span class="dc-ct"><b>${esc(t)}</b><small>${esc(a)}, tuto et fiche</small></span></button>`).join('')}</div></section>`;
  const nx = blocNext();
  if (nx) h += `<button type="button" class="dc-mur" onclick="go('blocs');blocOpen('${nx.b.id}')"><span class="dc-mi" aria-hidden="true"><svg viewBox="0 0 26 26"><rect x="3" y="6" width="9" height="6" rx="1.5"/><rect x="14" y="6" width="9" height="6" rx="1.5"/><rect class="f" x="8" y="14" width="10" height="6" rx="1.5"/></svg></span>
    <span class="dc-mt"><small>Ton prochain mur</small><b>${esc(nx.b.n)}</b><span class="dc-pg"><i style="width:${Math.round(100 * nx.f / nx.n)}%"></i></span></span>${ARROW_R}</button>`;
  $('disc-body').innerHTML = h;
}

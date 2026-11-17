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
function renderDisc() {
  const ini = t => (t || '?').trim().replace(/^(le|la|les|l’|l'|un|une|des|the)\s+/i, '').charAt(0).toUpperCase();
  const card = (on, t, a, sub, acc) => `<button type="button" class="hcard" onclick="${on}"><span class="hc-art${acc ? ' a' : ''}">${esc(ini(t))}</span><b>${esc(t)}</b><small>${esc(a)}</small><i>${sub}</i></button>`;
  const last = sheets.length ? sheets.find(x => x.id === LS.get('gms_last')) : null;
  let h = '';
  if (last) h += `<div class="sec-lbl">Reprendre</div><div class="resume" role="button" tabindex="0" onclick="viewSheet('${last.id}')"><div class="resume-tx"><b>${esc(last.title)}</b><span>${esc([last.artist && last.artist !== '—' ? last.artist : '', last.capo > 0 ? 'Capo ' + last.capo : ''].filter(Boolean).join(' · ') || 'Ma fiche')}</span></div><span class="resume-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg></span></div>`;
  h += `<div class="sec-lbl">Fiches prêtes à jouer</div><div class="hrow">${CATALOG.map((x, k) => card(`catOpen(${k})`, x.t, x.a, catFind(x) ? 'Dans mes fiches' : [...new Set(x.ch)].length + ' accords', true)).join('')}</div>`;
  h += `<div class="sec-lbl">Populaires à apprendre</div><div class="hrow">${POPULAR.map(([t, a]) => card(`discGo('${t.replace(/'/g, "\\'")}','${a.replace(/'/g, "\\'")}')`, t, a, 'Tutos + fiche')).join('')}</div>`;
  h += `<div class="sec-lbl">S’entraîner</div><div class="disc-2"><button type="button" onclick="go('exo')"><b>Suites d’accords et rythmes</b><small>Par ambiance, à ton tempo</small></button><button type="button" onclick="coursList()"><b>Cours</b><small>Notes, accords, effets</small></button></div>`;
  h += `<div class="sec-lbl">Communauté</div><div class="disc-soon"><b>Bientôt</b><span>Les fiches partagées par d’autres guitaristes arriveront ici.</span></div>`;
  $('disc-body').innerHTML = h;
}


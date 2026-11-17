/* ═══════ IMPORT: ASCII TAB / CHORD SHEET PARSER ═══════ */
const SECT_RE = /^\s*[\[\(]?\s*(intro|verse|couplet|chorus|refrain|bridge|pont|solo|outro|pre-?chorus|interlude|riff)\s*\d*\s*[\]\)]?\s*:?\s*$/i;
const TAB_RE  = /^\s*[eEBGDAa]\s*[\|:]/;
const CHORD_TOK = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add|M)?\d*((sus|add|maj|dim|aug|b|#)\d*)*(\/[A-G](#|b)?)?$/;
function isChordLine(l) {
  const t = l.trim().split(/\s+/).filter(Boolean);
  return t.length > 0 && t.length <= 12 && t.every(x => CHORD_TOK.test(x));
}
function parseTab(text) {
  const lines = text.replace(/\r/g,'').split('\n');
  const parts = [];
  let curP = null, tabBuf = [];
  const flush = () => { if (curP && tabBuf.length) { curP.tabText = tabBuf.join('\n'); tabBuf = []; } };
  const push = name => { flush(); curP = newPart(name); parts.push(curP); };
  lines.forEach(raw => {
    const l = raw.trimEnd();
    const m = l.match(SECT_RE);
    if (m) { push(m[1].charAt(0).toUpperCase() + m[1].slice(1)); return; }
    if (!l.trim()) { if (tabBuf.length) flush(); return; }
    if (!curP) push('Partie 1');
    if (TAB_RE.test(l)) { tabBuf.push(l); return; }
    if (isChordLine(l)) {
      l.trim().split(/\s+/).forEach(n => {
        if (curP.chords.some(c => c.name === n)) return;
        const c = newChord(n); c.name = n; curP.chords.push(c);
      });
    }
  });
  flush();
  return parts.filter(p => p.chords.length || p.tabText);
}
function loadTxt(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { $('imp-text').value = r.result; parseImport(); };
  r.readAsText(f); inp.value = '';
}
let impParts = null;
function parseImport() {
  const txt = $('imp-text').value;
  if (!txt.trim()) { toast('Colle une tab d’abord', true); return; }
  impParts = parseTab(txt);
  const prev = $('imp-preview');
  if (!impParts.length) {
    prev.innerHTML = `<p style="font-size:12px;color:var(--terra)">Rien de reconnu. Attendu : des lignes d’accords (Em G D) et/ou des lignes de tab (e|---0---).</p>`;
    return;
  }
  prev.innerHTML = `<div style="font-size:12px;color:var(--sage);font-weight:600;margin-bottom:10px">
      ${impParts.length} partie${impParts.length>1?'s':''} détectée${impParts.length>1?'s':''} — vérifie puis crée la fiche.</div>
    ${impParts.map(p => `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:7px">
      ${p.name ? `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--gold);margin-bottom:5px">${esc(p.name)}</div>` : ''}
      ${p.chords.length ? `<div style="font-size:12px;color:var(--cream2)">${p.chords.map(c => esc(c.name)).join(' · ')}</div>` : ''}
      ${p.tabText ? `<div class="tab-ascii mono" style="margin-top:6px;max-height:90px">${esc(p.tabText)}</div>` : ''}
    </div>`).join('')}
    <div class="frow" style="margin-top:12px">
      <div class="fg" style="margin-bottom:0"><input type="text" id="imp-title" placeholder="Titre *"></div>
      <div class="fg" style="margin-bottom:0"><input type="text" id="imp-artist" placeholder="Artiste *"></div>
    </div>
    <button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="createFromImport()">Créer la fiche</button>`;
}
function createFromImport() {
  const t = $('imp-title').value.trim(), a = $('imp-artist').value.trim();
  if (!t || !a) { toast('Titre et artiste requis', true); return; }
  draft = newSheet_();
  draft.title = t; draft.artist = a; draft.parts = impParts;
  if (pendingTabImg) { draft.tabImage = pendingTabImg; pendingTabImg = null; }
  openEditor('Fiche importee — a valider');
  toast('Fiche pre-remplie, ajuste et enregistre');
}
let pendingTabImg = null;
async function loadTabImg(inp) {
  const f = inp.files[0]; if (!f) return;
  const id = uid();
  await DB.put('media', {id, blob:f, type:f.type});
  pendingTabImg = id;
  const url = await mediaURL(id);
  $('img-preview').innerHTML = `<div class="split">
    <div class="split-pane"><img src="${url}"></div>
    <div class="split-pane"><p style="font-size:12px;color:var(--cream3);line-height:1.7">
      L’image est gardée comme référence. Ouvre l’éditeur : elle restera consultable dans la fiche pendant que tu recopies les accords.
      </p><button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="startFromImage()">Créer une fiche avec cette image</button></div>
  </div>`;
  inp.value = '';
}
function startFromImage() {
  draft = newSheet_();
  draft.tabImage = pendingTabImg;
  draft.blocks.coffre = true;
  pendingTabImg = null;
  openEditor('Nouvelle fiche (image de référence)');
}


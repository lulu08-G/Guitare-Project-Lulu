/* ═══════ EDITOR ═══════ */
const OPT_DEFS = [
  {k:'diff',   label:'Difficulté'},
  {k:'coffre', label:'Les Médias (videos, tutos, rythme)'},
];
/* Décision provisoire (Lucas) : titre seul obligatoire. Passer à true pour exiger aussi l'artiste. */
const REQUIRE_ARTIST = false;
const QUICK_CHORDS = ['Am','C','G','D','Em','F','E','A7','Dm','A'];
const QUICK_PARTS = ['Intro','Couplet','Refrain','Pont','Fin'];
// le « + » : deux façons de créer une fiche
function createAsk(e) {
  if (e) e.stopPropagation();
  let m = $('create-ask');
  if (!m) {
    m = document.createElement('div'); m.id = 'create-ask'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Créer une fiche');
    m.innerHTML = `<div class="ca-box" onclick="event.stopPropagation()"><div class="ca-grab"></div><h3>Nouvelle fiche</h3>
      <button type="button" onclick="createAskClose();newSheet()"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg><span><b>Fiche seule</b><small>Titre, accords, rythme : je la remplis moi-même</small></span></button>
      <button type="button" onclick="createAskClose();go('atelier')"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10.2 9.2l4.6 2.8-4.6 2.8z"/></svg><span><b>Fiche avec un tuto</b><small>Je cherche un morceau, je regarde et je note</small></span></button>
      <button type="button" class="ca-x" onclick="createAskClose()">Annuler</button></div>`;
    m.addEventListener('click', createAskClose); document.body.appendChild(m);
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') createAskClose(); });
  }
  m.classList.add('on');
}
function createAskClose() { const m = $('create-ask'); if (m) m.classList.remove('on'); }
function newSheet() {
  draft = newSheet_();
  draft.color = COLORS[sheets.length % COLORS.length][0]; // couleur automatique
  openEditor('Nouvelle fiche');
  setTimeout(() => { const t = $('f-title'); if (t) t.focus(); }, 60);
}
function edNext(e, id) { if (e.key === 'Enter') { e.preventDefault(); const n = $(id); if (!n) return; const d = n.closest('details'); if (d) d.open = true; n.focus(); } }
// "Em7 G, Dsus4" -> accords ajoutés à la 1re partie (inconnus = accord vide à compléter)
function parseChordLine(str) {
  return String(str||'').split(/[\s,;]+/).filter(Boolean).map(n => newChord(findChord(n) ? n : n.trim()));
}
// « Em G C » : une ligne d'accords (jamais un titre de morceau)
const looksLikeChords = s => { const w = String(s || '').trim().split(/[\s,;]+/).filter(Boolean); return w.length >= 2 && w.every(x => findChord(x)); };
function addChordLine(str) {
  const inp = $('f-chords');
  const list = parseChordLine(str != null ? str : (inp ? inp.value : ''));
  if (!list.length) return;
  if (!draft.parts.length) draft.parts.push(newPart(''));
  const pi = Math.min(cp.pi, draft.parts.length - 1);
  draft.parts[pi].chords.push(...list); edRpSet(pi);
  if (str == null && inp) { inp.value = ''; inp.focus(); }
  renderParts();
}
function quickPart(name) { if (draft.parts.length === 1 && !draft.parts[0].name) draft.parts[0].name = 'Couplet'; draft.parts.push(newPart(name)); renderParts(); }
// une fiche neuve n'a qu'une partie sans nom ; « + Ajouter une partie » la nomme « Couplet » et en ajoute une 2e
function startParts() { if (!draft.parts[0].name) draft.parts[0].name = 'Couplet'; edNaming.clear(); draft.parts.push(newPart('Refrain')); renderParts(); }
function renderQuickParts() {
  $('qc-parts').innerHTML = draft.parts.length === 1
    ? `<button type="button" class="ed-addp" onclick="startParts()">+ Ajouter une partie</button>`
    : `<span class="lbl">+ Partie :</span>` + QUICK_PARTS.map(n => `<button type="button" onclick="quickPart('${n}')">${n}</button>`).join('') + `<button type="button" onclick="quickPartCustom()">+ Autre…</button>`;
}
function quickPartCustom() {
  const n = (prompt('Nom de la partie ?', '') || '').trim();
  if (n) quickPart(n.slice(0, 40));
}
function renderQuick() {
  $('qc-sugg').innerHTML = QUICK_CHORDS.map(n => `<button type="button" onclick="addChordLine('${n}')">${n}</button>`).join('');
  $('f-capo').innerHTML = [0,1,2,3,4,5,6,7,8,9].map(i => `<option value="${i}" ${draft.capo===i?'selected':''}>${i?'Frette '+i:'Sans capo'}</option>`).join('');
  $('f-bpm').value = draft.bpm || '';
  $('f-tuning').value = draft.tuning || 'Standard';
}
function editSheet(id) {
  const s = sheets.find(x => x.id === id); if (!s) return;
  draft = clone(s);
  if (!draft.parts || !draft.parts.length) draft.parts = [newPart('')];
  openEditor('Modifier la fiche');
}
function dupSheet(id) {
  const s = sheets.find(x => x.id === id); if (!s) return;
  const c = clone(s);
  c.id = uid(); c.title = s.title + ' (copie)'; if (titleTaken(c.title)) c.title = uniqueTitle(c.title);
  c.parts.forEach(p => { delete p.rec; }); // la prise audio reste attachée à la fiche d’origine c.createdAt = c.updatedAt = Date.now();
  c.parts.forEach(p => { p.id = uid(); p.chords.forEach(ch => ch.id = uid()); });
  sheets.push(c); DB.put('sheets', c).then(() => { renderHome(); toast('Fiche dupliquée'); });
}
function openEditor(title) {
  $('ed-title').textContent = title;
  $('f-title').value = draft.title;
  $('f-artist').value = draft.artist === '—' ? '' : draft.artist;
  $('f-chords').value = '';
  $('f-orig').value = (draft.original && draft.original.url) || '';
  $('more-opts').open = false;
  cp.ed = false; cp.pi = 0; edRpI = 0; edNaming.clear(); edLv.length = 0;
  document.querySelectorAll('#v-ed .ed-row[open]').forEach(d => d.open = false);
  renderQuick(); edTlSugg(); edLinksRender();
  $('ed-del').style.display = sheets.some(s => s.id === draft.id) ? '' : 'none';
  $('color-row').innerHTML = COLORS.map(([k,c]) =>
    `<button class="btn-icon ${draft.color===k?'on':''}" data-col="${k}" onclick="pickColor('${k}')" style="background:${c};border-color:${c}"></button>`).join('');
  renderOptBlocks();
  renderParts();
  go('ed');
}
function pickColor(k) { draft.color = k; document.querySelectorAll('[data-col]').forEach(b => b.classList.toggle('on', b.dataset.col === k)); }
function delFromEditor() { if (draft && sheets.some(s => s.id === draft.id)) delSheet(draft.id); }

function renderOptBlocks() {
  // adders: only show blocks not yet active — no empty sections ever rendered
  $('opt-adders').innerHTML = OPT_DEFS.filter(o => !draft.blocks[o.k]).map(o =>
    `<button class="add-btn" style="min-height:44px" onclick="addBlock('${o.k}')">+ ${o.label}</button>`).join('')
    || '';

  let h = '';
  if (draft.blocks.diff) h += `<div class="fcard"><div class="fcard-t">Difficulté <button class="rm" onclick="rmBlock('diff')">retirer</button></div>
    <div class="fg" style="margin-bottom:0"><select onchange="draft.difficulty=this.value">
      ${['','Débutant','Intermédiaire','Avancé'].map(d => `<option value="${d}" ${dispDiff(draft.difficulty)===d?'selected':''}>${d||'--'}</option>`).join('')}</select></div></div>`;
  if (draft.blocks.coffre) h += `<div class="fcard"><div class="fcard-t">Les Médias <button class="rm" onclick="rmBlock('coffre')">retirer</button></div>
    <p style="font-size:12px;color:var(--cream4);margin-bottom:14px">Tout ce qui accompagne le morceau : tes vidéos, des tutos utiles, des variations de rythme. D’autres catégories arriveront plus tard.</p>
    <div class="fg"><label>Notes libres</label><textarea placeholder="Paroles, conseils, ce qui coince..." oninput="draft.memo=this.value">${esc(draft.memo)}</textarea></div>

    <div class="part-sub" style="margin-top:18px"><span class="part-sub-t">Tutos utiles (liens — YouTube = embed automatique)</span></div>
    <div class="link-cards" id="link-list"></div>
    <div style="display:flex;gap:7px;margin-top:8px">
      <input type="url" id="link-in" placeholder="https://youtube.com/watch?v=..." style="flex:1">
      <button class="btn btn-ghost btn-sm" onclick="addLink()">Ajouter</button>
    </div>

    <div class="part-sub" style="margin-top:18px"><span class="part-sub-t">Nos videos</span></div>
    <div class="media-list" id="draft-media-video" style="margin-bottom:8px"></div>
    <button class="add-btn" onclick="document.getElementById('media-in-video').click()">+ Ajouter une video</button>
    <input type="file" id="media-in-video" accept="video/*" style="display:none" onchange="addMediaFile(this,'video')">

    <div class="part-sub" style="margin-top:18px"><span class="part-sub-t">Variations de rythme</span></div>
    <p style="font-size:11px;color:var(--cream4);margin-bottom:8px">Chante ou joue une variante — parfois 3 secondes de voix valent mieux qu’un schéma.</p>
    <div class="media-list" id="draft-media-audio" style="margin-bottom:8px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" id="rec-btn" onclick="toggleRec()">
        <svg class="ico" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
        Enregistrer</button>
      <button class="add-btn" onclick="document.getElementById('media-in-audio').click()">+ Déposer un fichier audio</button>
      <input type="file" id="media-in-audio" accept="audio/*" style="display:none" onchange="addMediaFile(this,'audio')">
      <span id="rec-state" style="font-size:12px;color:var(--cream4)"></span>
    </div>

    <div class="part-sub" style="margin-top:18px"><span class="part-sub-t">À venir</span></div>
    <div class="coffre-soon">D’autres façons de remplir les Médias arrivent bientôt.</div>
    </div>`;
  $('opt-host').innerHTML = h;
  if (draft.blocks.coffre) { renderLinks(); renderDraftMedia(); }
}
function addBlock(k) { draft.blocks[k] = true; renderOptBlocks(); }
function rmBlock(k) {
  delete draft.blocks[k];
  if (k === 'capo') { draft.capo = 0; draft.tuning = 'Standard'; }
  if (k === 'tempo') draft.bpm = 0;
  if (k === 'diff') draft.difficulty = '';
  if (k === 'coffre') { draft.memo = ''; draft.links = []; }
  renderOptBlocks();
}
let tapTimes = [];
function tapTempo(btn) {
  const now = performance.now();
  tapTimes = tapTimes.filter(t => now - t < 3000); tapTimes.push(now);
  if (tapTimes.length >= 2) {
    const gaps = tapTimes.slice(1).map((t,i) => t - tapTimes[i]);
    const avg = gaps.reduce((a,b) => a+b, 0)/gaps.length;
    draft.bpm = Math.round(60000/avg);
    const inp = $('f-bpm');
    if (inp) inp.value = draft.bpm;
  }
  btn.textContent = tapTimes.length < 2 ? 'Encore...' : draft.bpm + ' BPM';
}
function renderLinks() {
  edLinksRender();
  const host = $('link-list'); if (!host) return;
  host.innerHTML = (draft.links||[]).map(l => `<div class="link-card">
    <svg class="ico" viewBox="0 0 24 24" style="color:${ytId(l.url)?'var(--terra)':'var(--cream4)'}">${ytId(l.url)
      ? '<polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/><rect x="2" y="4" width="20" height="16" rx="4"/>'
      : '<path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/>'}</svg>
    <span class="lc-t">${esc(l.title || l.url)}</span>
    <button class="btn-icon" style="width:26px;height:26px" onclick="rmLink('${l.id}')"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  </div>`).join('');
}
function addLink() {
  const v = $('link-in').value.trim(); if (!v) return;
  draft.links = draft.links || [];
  draft.links.push({id:uid(), url:v, title: ytId(v) ? 'Video YouTube' : v.replace(/^https?:\/\//,'').slice(0,48)});
  $('link-in').value = ''; renderLinks();
}
/* « Tutos et liens » de la création : tutos proposés d'après le titre, coller un lien, ouvrir la recherche de tutos */
function edTlSugg() {
  const h = $('ed-tl-sugg'); if (!h) return;
  const t = ($('f-title').value + ' ' + $('f-artist').value).trim();
  if (!$('f-title').value.trim()) { h.innerHTML = `<p class="ed-tl-hint">Écris le titre : des tutos te seront proposés ici.</p>`; return; }
  const q = encodeURIComponent(t), ext = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  const L = [['Tutos YouTube', 'https://www.youtube.com/results?search_query=' + q + '+tuto+guitare'], ['TikTok', 'https://www.tiktok.com/search?q=' + q + '%20guitare'], ['Grilles d’accords', 'https://www.google.com/search?q=' + q + '+accords+guitare']];
  h.innerHTML = `<p class="ed-tl-hint">Tutos proposés pour « ${esc($('f-title').value.trim())} » : ouvre, copie le lien du bon tuto, colle-le dessous.</p><div class="ed-tl-chips">${L.map(([n, u]) => `<a class="btn btn-ghost btn-sm" href="${u}" target="_blank" rel="noopener">${n}${ext}</a>`).join('')}</div>`;
}
function edLinksRender() {
  const h = $('ed-links'); if (!h || !draft) return;
  h.innerHTML = (draft.links || []).map(l => `<div class="link-card"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ytId(l.url) ? '<polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/><rect x="2" y="4" width="20" height="16" rx="4"/>' : '<path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/>'}</svg><span class="lc-t">${esc(l.title || l.url)}</span><button type="button" class="btn-icon" onclick="rmLink('${l.id}')" aria-label="Retirer ce lien"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`).join('');
}
function edAddLink() {
  const i = $('ed-link-in'), v = i.value.trim(); if (!v) return;
  if (!/^https?:\/\//i.test(v)) { toast('Colle un lien qui commence par https://', true); return; }
  draft.links = draft.links || [];
  draft.links.push({id: uid(), url: v, title: ytId(v) ? 'Tuto YouTube' : v.replace(/^https?:\/\//, '').slice(0, 48)});
  i.value = ''; renderLinks(); toast('Lien ajouté');
}
async function edTutoSearch() {
  const t = $('f-title').value.trim(), a = $('f-artist').value.trim();
  if (!t) { toast('Écris d’abord le titre', true); $('f-title').focus(); return; }
  if (edOK()) { await saveSheet(); tutoOpenFor(t, a); return; }   // la fiche est gardée avant de partir
  if (!confirm('Ta fiche n’a pas encore d’accord : elle ne sera pas gardée. Ouvrir quand même la recherche de tutos ?')) return;
  edClose(); tutoOpenFor(t, a);
}
function rmLink(id) { draft.links = (draft.links||[]).filter(l => l.id !== id); renderLinks(); }
async function renderDraftMedia() {
  const hostV = $('draft-media-video'), hostA = $('draft-media-audio');
  if (!hostV && !hostA) return;
  if (hostV) hostV.innerHTML = '';
  if (hostA) hostA.innerHTML = '';
  for (const m of (draft.media||[])) {
    const host = m.kind === 'video' ? hostV : hostA;
    if (!host) continue;
    const url = await mediaURL(m.mediaId);
    const el = document.createElement('div');
    el.className = 'media-item';
    el.innerHTML = `<span class="mi-name">${esc(m.name)}</span>
      ${url ? (m.kind === 'video' ? `<video src="${url}" controls></video>` : `<audio src="${url}" controls></audio>`) : ''}
      <button class="btn-icon" style="width:26px;height:26px" onclick="rmMedia('${m.id}')"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    host.appendChild(el);
  }
}
function rmMedia(id) {
  const m = (draft.media||[]).find(x => x.id === id);
  draft.media = (draft.media||[]).filter(x => x.id !== id);
  if (m) DB.del('media', m.mediaId);
  renderDraftMedia();
}
async function addMediaFile(inp, forceKind) {
  const f = inp.files[0]; if (!f) return;
  const mediaId = uid();
  await DB.put('media', {id:mediaId, blob:f, type:f.type});
  draft.media = draft.media || [];
  draft.media.push({id:uid(), mediaId, name:f.name, kind: forceKind || (f.type.startsWith('video') ? 'video' : 'audio')});
  inp.value = '';
  renderDraftMedia(); toast('Fichier ajoute');
}
/* ── MediaRecorder ── */
let mr = null, mrChunks = [];
async function toggleRec() {
  const btn = $('rec-btn'), st = $('rec-state');
  if (mr && mr.state === 'recording') { mr.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    mrChunks = [];
    mr = new MediaRecorder(stream);
    mr.ondataavailable = e => { if (e.data.size) mrChunks.push(e.data); };
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(mrChunks, {type: mr.mimeType || 'audio/webm'});
      const mediaId = uid();
      await DB.put('media', {id:mediaId, blob, type:blob.type});
      draft.media = draft.media || [];
      const n = draft.media.filter(m => m.kind === 'audio').length + 1;
      draft.media.push({id:uid(), mediaId, name:`Prise ${n}`, kind:'audio'});
      btn.innerHTML = 'Enregistrer'; btn.classList.remove('btn-primary');
      st.textContent = '';
      renderDraftMedia(); toast('Prise enregistrée');
    };
    mr.start();
    btn.innerHTML = 'Arrêter'; btn.classList.add('btn-primary');
    const t0 = Date.now();
    st.innerHTML = '<span class="rec-dot" style="display:inline-block;margin-right:6px"></span><span id="rec-time">0s</span>';
    const iv = setInterval(() => {
      const e = $('rec-time');
      if (!e || !mr || mr.state !== 'recording') return clearInterval(iv);
      e.textContent = Math.round((Date.now()-t0)/1000) + 's';
    }, 250);
  } catch (e) {
    toast('Micro refuse ou indisponible', true);
  }
}


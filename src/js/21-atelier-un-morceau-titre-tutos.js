/* ═══════ ATELIER — un morceau : titre → tutos → fiche, enregistrement automatique ═══════
   Une seule entité : at.s = la fiche du morceau (le même objet que dans `sheets`), créée dès le titre.
   Les deux panneaux (tutos / fiche) restent dans le DOM (bascule CSS) : la vidéo et la saisie survivent.
   Réutilise les fonctions de l'onglet Tutos (tutoPlatforms, tutoSites, tutoLoadYT, tutoKeep…) via l'état `tuto`. */
let at = {s:null, fresh:false, pi:0, tab:'tutos', play:null, sel:-1, lk:-1, ext:null, dirty:false, ytFor:'', t:0, slow:false,
  kb:{root:'', acc:'', q1:'', q2:'', q3:''}};
let atTimers = {save:null, title:null};
let atLinkList = [];
const atNarrow = () => window.innerWidth < 900;
const atOn = () => $('v-atelier') && $('v-atelier').classList.contains('on');
const atTune = s => s && s.artist === '—' ? '' : (s && s.artist) || '';
const atChordCount = () => at.s ? at.s.parts.reduce((n, p) => n + p.chords.length, 0) : 0;
const atPins = () => at.s ? (at.s.links || []).filter(l => l.kind !== 'original') : [];

/* ── ouverture / fermeture ── */
function atOpen() {
  at.tab = LS.get('gms_atelier_tab', 'tutos') === 'fiche' ? 'fiche' : 'tutos';
  const dl = $('at-dl'); if (dl) dl.innerHTML = sheets.map(s => `<option value="${esc(s.title)}"></option>`).join('');
  $('at-title').value = at.s ? at.s.title : tuto.title;
  $('at-artist').value = at.s ? atTune(at.s) : tuto.artist;
  $('at-mic').innerHTML = icon('mic', 22);
  atRenderAll();
}
function atRenderAll() { atRenderGrid(); atRenderTutos(); atRenderFiche(); atRenderCopy(); atSeg(); atStat(); }
function atRefresh() { // appelé par renderTuto() : liste des tutos + épingles, sans toucher au lecteur ni aux champs
  if (!atOn()) return;
  atRenderTutos(); atRenderPins(); atSeg();
  $('at-mic').classList.toggle('live', !!tuto.listening);
}
function atFromTuto() { // tutoSet() (reconnaissance au micro) : reprendre le morceau trouvé
  if (!atOn()) return;
  $('at-title').value = tuto.title; $('at-artist').value = tuto.artist;
  atCommitNow();
}
function atPause() { atYT('pauseVideo'); }
async function atDone() {
  await atFlush(); rhStop();
  at = Object.assign(at, {s:null, fresh:false, pi:0, play:null, sel:-1, lk:-1, ext:null, ytFor:''});
  tuto.title = ''; tuto.artist = ''; tuto.yt = null; tuto.show = false;
  $('at-player').innerHTML = ''; $('at-banner').innerHTML = '';
  go('home');
}

/* ── titre → fiche (titres uniques : un titre existant rouvre sa fiche) ── */
function atTitleInput() { clearTimeout(atTimers.title); atTimers.title = setTimeout(atCommit, 700); }
function atCommitNow() { clearTimeout(atTimers.title); atCommit(); atLoadYT(); }
function atLoadYT() {
  if (!tuto.title || !LS.get('gms_ytkey', '') || at.ytFor === tSong()) return;
  at.ytFor = tSong(); tuto.yt = null; tutoLoadYT();
}
function atEmpty(s) {
  return !s.parts.some(p => p.chords.length || rhHas(p.rhythm) || arpHas(p.arp) || typeof p.lyrics === 'string') && !(s.links || []).length && !(s.original && s.original.url) && !(s.media || []).length;
}
function atCommit() {
  clearTimeout(atTimers.title);
  const t = $('at-title').value.trim().replace(/\s+/g, ' '), a = $('at-artist').value.trim();
  if (!t) { tuto.title = at.s ? at.s.title : ''; tuto.artist = a; atRefresh(); return; }
  if (looksLikeChords(t)) { // des accords tapés dans le titre : on ne crée pas de fiche « Em G C », on les range dans la partie
    $('at-title').value = at.s ? at.s.title : '';
    if (at.s) atAdd([t]); else toast('Ça ressemble à des accords : tape d’abord le nom du morceau', true);
    return;
  }
  const same = sheets.find(x => normTitle(x.title) === normTitle(t) && x !== at.s);
  if (!at.s) {
    if (same) return atAdopt(same, true);
    const s = newSheet_();
    s.title = t; s.artist = a || '—'; s.color = COLORS[sheets.length % COLORS.length][0];
    sheets.push(s); at.s = s; at.fresh = true; at.pi = 0; at.sel = -1;
    atSyncTuto(); atMark(true); atRenderAll();
    return;
  }
  if (same) { // le titre tapé existe déjà ailleurs
    if (at.fresh && atEmpty(at.s)) { sheets = sheets.filter(x => x !== at.s); DB.del('sheets', at.s.id); return atAdopt(same, true); }
    toast(`Une fiche « ${same.title} » existe déjà : titre inchangé`, true);
    $('at-title').value = at.s.title; return;
  }
  const changed = at.s.title !== t || atTune(at.s) !== a;
  at.s.title = t; at.s.artist = a || '—';
  atSyncTuto();
  if (changed) { atMark(); atStat(); }
  atRefresh();
}
function atAdopt(s, notify) { // rouvrir une fiche existante
  at.s = s; at.fresh = false; at.pi = 0; at.sel = -1; at.ytFor = '';
  const a = $('at-artist').value.trim();
  if (a && s.artist === '—') { s.artist = a; atMark(); }
  $('at-title').value = s.title; $('at-artist').value = atTune(s);
  atSyncTuto(); atRenderAll();
  if (notify) toast(`Fiche « ${s.title} » rouverte`);
  atLoadYT();
}
function atSyncTuto() { tuto.title = at.s ? at.s.title : ''; tuto.artist = at.s ? atTune(at.s) : ''; tuto.show = !!tuto.title; }

/* ── enregistrement auto (debounce 600 ms) ── */
function atMark(now) {
  if (!at.s) return;
  at.s.updatedAt = Date.now(); at.dirty = true;
  clearTimeout(atTimers.save);
  atStat('wait');
  atTimers.save = setTimeout(atFlush, now ? 0 : 600);
}
async function atFlush() {
  clearTimeout(atTimers.save);
  if (!at.s || !at.dirty) return;
  at.dirty = false;
  try { await DB.put('sheets', clone(at.s)); atStat(); } catch (e) { at.dirty = true; atStat('err'); }
}
function atStat(k) {
  const el = $('at-stat'); if (!el) return;
  el.className = 'at-stat' + (k === 'wait' ? ' wait' : '');
  el.textContent = !at.s ? '' : k === 'wait' ? 'Enregistrement…' : k === 'err' ? 'Échec de l’enregistrement' : 'Enregistré';
}
window.addEventListener('pagehide', () => { atFlush(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') atFlush();
  else if (at.ext && atOn()) atBanner();
});

/* ── navigation Tutos | Fiche ── */
function atTab(t) {
  at.tab = t; LS.set('gms_atelier_tab', t);
  atRenderGrid(); atSeg();
  if (atNarrow()) window.scrollTo({top: 0});
}
function atSeg() {
  const n = atPins().length, c = atChordCount();
  const a = $('at-sg-tutos'), b = $('at-sg-fiche'); if (!a) return;
  a.innerHTML = `Tutos${n ? `<b aria-label="${n} tuto${n > 1 ? 's' : ''} épinglé${n > 1 ? 's' : ''}">${n}</b>` : ''}`;
  b.innerHTML = `Fiche${c ? ` · ${c} accord${c > 1 ? 's' : ''}` : ''}`;
  a.setAttribute('aria-selected', at.tab === 'tutos'); b.setAttribute('aria-selected', at.tab === 'fiche');
}
function atRenderGrid() {
  const g = $('at-grid'); if (!g) return;
  g.dataset.tab = at.tab; g.classList.toggle('copy', !!at.play); g.classList.toggle('hasplay', !!at.play);
  const pl = $('at-player');
  if (pl) pl.style.top = (at.tab === 'fiche' && atNarrow() && at.play) ? (62 + $('at-top').offsetHeight + 8) + 'px' : '';
}
(function () { // balayage horizontal = bascule (mobile)
  let x0 = 0, y0 = 0, ok = false;
  document.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; ok = atOn() && atNarrow() && !!e.target.closest('#at-grid') && !e.target.closest('.at-sc,input,textarea,select,iframe'); }, {passive:true});
  document.addEventListener('touchend', e => {
    if (!ok) return; ok = false;
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) > 70 && Math.abs(dy) < Math.abs(dx) / 2) atTab(dx < 0 ? 'fiche' : 'tutos');
  }, {passive:true});
})();

/* ── lecteur YouTube (iframe API par postMessage, sans script externe) ── */
function atPlay(id) {
  at.play = id; at.t = 0; at.slow = false;
  $('at-player').className = 'on';
  $('at-player').innerHTML = `<div class="at-pl"><div class="yt-embed"><iframe id="at-ytf" src="https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&enablejsapi=1" title="Tuto" allow="autoplay; encrypted-media" allowfullscreen onload="atYTListen()"></iframe></div>
    <button type="button" class="at-hit" onclick="atTab('tutos')" aria-label="Agrandir le lecteur"></button>
    <div class="at-pctl"><button type="button" onclick="atSeek(-10)">−10 s</button><button type="button" id="at-slow" onclick="atSlow()" aria-pressed="false">0,75×</button><button type="button" onclick="atSeek(10)">+10 s</button><button type="button" onclick="atClose()" aria-label="Fermer la vidéo">✕</button></div></div>`;
  atRenderGrid(); atRenderTutos(); atRenderCopy();
}
function atClose() { at.play = null; $('at-player').className = ''; $('at-player').innerHTML = ''; atRenderGrid(); atRenderTutos(); }
function atYT(func, args) { const f = $('at-ytf'); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({event:'command', func, args:args || []}), '*'); }
function atYTListen() { const f = $('at-ytf'); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({event:'listening', id:1, channel:'widget'}), '*'); }
window.addEventListener('message', e => {
  if (!/youtube\.com$/.test(e.origin || '')) return;
  try { const d = JSON.parse(e.data); if (d.info && typeof d.info.currentTime === 'number') at.t = d.info.currentTime; } catch (x) {}
});
function atSeek(dt) { atYT('seekTo', [Math.max(0, at.t + dt), true]); at.t = Math.max(0, at.t + dt); }
function atSlow() { at.slow = !at.slow; atYT('setPlaybackRate', [at.slow ? 0.75 : 1]); const b = $('at-slow'); if (b) { b.classList.toggle('on', at.slow); b.setAttribute('aria-pressed', at.slow); } }

/* ── panneau Tutos ── */
function atOpt(k, v) { tuto[k] = v; at.ytFor = ''; if (tuto.title && LS.get('gms_ytkey', '')) atLoadYT(); else renderTuto(); }
function atExt() { at.ext = Date.now(); }
function atLinks(i) { at.lk = at.lk === i ? -1 : i; atRenderTutos(); }
function atPinLink(i) { const [u, l] = atLinkList[i]; atKeep(u, l); }
function atKeyForm() { tuto.showKeys = true; go('tuto'); }
function atRenderTutos() {
  const h = $('at-pan-t'); if (!h) return;
  if (!tuto.title) { h.innerHTML = `<div class="at-empty"><b>Un morceau en tête ?</b>Tape son titre en haut : la fiche se crée toute seule, et les tutos arrivent ici.</div>`; return; }
  const sel = (k, map, lab) => `<select class="at-chip" aria-label="${lab}" onchange="atOpt('${k}',this.value)">${Object.entries(map).map(([v, o]) => `<option value="${v}" ${tuto[k] === v ? 'selected' : ''}>${esc(typeof o === 'string' ? o : o.n)}</option>`).join('')}</select>`;
  atLinkList = [];
  const plats = tutoPlatforms();
  let o = `<div class="at-chips3">${sel('lang', T_LANG, 'Langue')}${sel('lvl', T_LVL, 'Niveau')}${sel('kind', T_KIND, 'Type de tuto')}</div>
    <div class="at-tiles">${plats.map((p, i) => `<div class="at-tw"><a class="at-tile" style="background:${p.bg}" href="${p.links[0][1]}" target="_blank" rel="noopener" onclick="atExt()" oncontextmenu="atLinks(${i});return false"><b>${esc(p.n)}</b><small>${esc(p.links[0][0])}</small></a><button type="button" class="at-more" onclick="atLinks(${i})" aria-label="Autres liens ${esc(p.n)}" aria-expanded="${at.lk === i}">⋯</button></div>`).join('')}</div>`;
  if (at.lk >= 0 && plats[at.lk]) {
    const p = plats[at.lk];
    o += `<div class="at-links">${p.links.map(([l, u]) => { const i = atLinkList.push([u, p.n + ' · ' + l]) - 1; return `<div class="at-lk"><a href="${u}" target="_blank" rel="noopener" onclick="atExt()">${esc(l)} ↗</a><button type="button" class="at-pin" aria-pressed="${tutoPinned(u)}" aria-label="Épingler" onclick="atPinLink(${i})">${icon('pin', 18)}</button></div>`; }).join('')}</div>`;
  }
  o += `<div class="at-sc at-sites" style="margin-top:10px">${tutoSites().map(([n, d, u]) => `<a class="at-chip" href="${u}" target="_blank" rel="noopener" title="${esc(d)}" onclick="atExt()">${esc(n)}</a>`).join('')}</div>`;
  const key = LS.get('gms_ytkey', '');
  o += `<div class="at-lbl"><span>Dans l’appli (YouTube)</span></div>`;
  if (!key) o += `<div class="at-note">Pour voir les vidéos ici, <button type="button" onclick="atKeyForm()">ajoute une clé YouTube</button> (gratuite).</div>`;
  else if (tuto.ytLoading) o += `<div class="at-note">Chargement des vidéos…</div>`;
  else if (tuto.ytErr) o += `<div class="at-note" style="color:var(--terra)">${esc(tuto.ytErr)}</div>`;
  else if (!tuto.yt) o += `<button type="button" class="at-chip" onclick="at.ytFor='';atLoadYT()">Charger les vidéos</button>`;
  else if (!tuto.yt.length) o += `<div class="at-note">Aucune vidéo trouvée : élargis le niveau ou le type de tuto.</div>`;
  else o += `<div class="at-res">${tuto.yt.map((v, i) => { const u = 'https://www.youtube.com/watch?v=' + v.id, on = tutoPinned(u); return `<div class="at-card ${at.play === v.id ? 'on' : ''}" draggable="true" ondragstart="atDrag(event,${i})">
      <button type="button" class="at-th" onclick="atPlay('${v.id}')" aria-label="Lire : ${esc(v.t)}"><img src="${v.th}" alt="" loading="lazy"><span>▶</span></button>
      <div class="at-ct"><b>${esc(v.t)}</b><small>${esc(v.ch)}</small></div>
      <button type="button" class="at-pin" aria-pressed="${on}" aria-label="${on ? 'Tuto épinglé' : 'Épingler ce tuto'}" onclick="atPinYT(${i})">${icon('pin', 18)}</button>
      <button type="button" class="btn btn-primary btn-sm at-create" onclick="atCreateWith(${i})">Créer la fiche avec ce tuto</button></div>`; }).join('')}</div>`;
  h.innerHTML = o;
}
async function atCreateWith(i) {
  const v = tuto.yt && tuto.yt[i]; if (!v) return;
  if (!at.s) { toast('Commence par le titre du morceau', true); $('at-title').focus(); return; }
  await atFlush(); atSyncTuto();
  await tutoCreateWith('https://www.youtube.com/watch?v=' + v.id, 'Tuto · ' + v.ch);
}
function atPinYT(i) { const v = tuto.yt && tuto.yt[i]; if (v) atKeep('https://www.youtube.com/watch?v=' + v.id, 'Tuto · ' + v.ch); }
function atDrag(e, i) { const v = tuto.yt[i]; e.dataTransfer.setData('text/plain', 'https://www.youtube.com/watch?v=' + v.id + '\n' + 'Tuto · ' + v.ch); }
function atDrop(e) { e.preventDefault(); e.currentTarget.classList.remove('over'); const [u, l] = (e.dataTransfer.getData('text/plain') || '').split('\n'); if (u) atKeep(u, l); }
async function atKeep(url, label) {
  if (!at.s) { toast('Commence par le titre du morceau', true); $('at-title').focus(); return; }
  atSyncTuto();
  await tutoKeep(url, label);
  atMark(); atRenderPins();
}
function atLabel(u) {
  let h = ''; try { h = new URL(u).hostname.replace(/^www\./, ''); } catch (e) {}
  const m = {'tiktok.com':'TikTok','instagram.com':'Instagram','youtu.be':'YouTube','youtube.com':'YouTube'}, k = Object.keys(m).find(x => h.endsWith(x));
  return 'Tuto · ' + (k ? m[k] : h || 'lien');
}
/* retour d'un lien externe : proposer de coller le lien de la vidéo */
async function atBanner() {
  const b = $('at-banner'); if (!b) return;
  let clip = ''; try { clip = (await navigator.clipboard.readText() || '').trim(); } catch (e) {}
  const isUrl = /^https?:\/\/\S+$/.test(clip);
  if (isUrl && atPins().some(l => l.url === clip)) { at.ext = null; b.innerHTML = ''; return; }
  b.innerHTML = `<div class="at-banner" role="status">
    <span>${isUrl ? `Lien copié : <b>${esc(clip.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40))}</b>` : 'De retour ? Copie le lien de la vidéo, puis colle-le.'}</span>
    ${isUrl ? '' : '<input type="url" id="at-bn-in" placeholder="https://…" aria-label="Lien de la vidéo">'}
    <button type="button" class="btn btn-primary" style="min-height:44px" onclick="atBannerGo()">${isUrl ? 'Épingler' : 'Coller'}</button>
    <button type="button" class="at-pin" onclick="atBannerOff()" aria-label="Fermer">✕</button></div>`;
}
function atBannerOff() { at.ext = null; $('at-banner').innerHTML = ''; }
async function atBannerGo() {
  let u = ($('at-bn-in') && $('at-bn-in').value || '').trim();
  if (!u) { try { u = (await navigator.clipboard.readText() || '').trim(); } catch (e) { toast('Colle le lien dans le champ', true); return; } }
  if (!/^https?:\/\//.test(u)) { toast('Aucun lien dans le presse-papiers : copie d’abord le lien de la vidéo', true); return; }
  await atKeep(u, atLabel(u)); atBannerOff();
}
async function atMic() {
  if (!LS.get('gms_audd', '')) { toast('Reconnaissance : ajoute ta clé AudD (onglet Tutos › Options avancées)', true); return; }
  tutoRecognize();
}

/* ── panneau Fiche ── */
const atPart = () => at.s && at.s.parts[Math.min(at.pi, at.s.parts.length - 1)];
function atRenderFiche() {
  const h = $('at-pan-f'); if (!h) return;
  const s = at.s;
  if (!s) { h.innerHTML = `<div class="at-empty"><b>Ta fiche apparaît ici</b>Tape le titre du morceau en haut : elle se crée et s’enregistre toute seule.</div>`; return; }
  if (at.pi >= s.parts.length) at.pi = s.parts.length - 1;
  const p = atPart(), pi = at.pi, rh = rhHas(p.rhythm), orig = (s.original && s.original.url) || '';
  h.innerHTML = `
    <div class="at-meta">
      <label>Capo <select aria-label="Capo" onchange="at.s.capo=+this.value;atMark()">${[0,1,2,3,4,5,6,7,8,9].map(i => `<option value="${i}" ${s.capo === i ? 'selected' : ''}>${i ? i : '—'}</option>`).join('')}</select></label>
      <label>BPM <input type="number" inputmode="numeric" min="30" max="300" value="${s.bpm || ''}" placeholder="90" aria-label="BPM" oninput="at.s.bpm=+this.value||0;atMark()"></label>
    </div>
    ${soloPart(s.parts)
      ? `<div class="at-ptabs"><button type="button" class="at-chip add" onclick="atPartAdd()">+ Ajouter une partie</button></div>`
      : `<div class="at-ptabs" role="tablist" aria-label="Parties">${s.parts.map((q, i) => `<button type="button" role="tab" class="at-chip ${i === pi ? 'on' : ''}" aria-selected="${i === pi}" onclick="atPartGo(${i})">${esc(q.name || 'Partie')}</button>`).join('')}<button type="button" class="at-chip add" onclick="atPartAdd()">+ Partie</button></div>
    <div class="at-ptools"><input type="text" value="${esc(p.name)}" aria-label="Nom de la partie" onchange="atPartName(this.value)">${s.parts.length > 1 ? `<button type="button" class="at-chip" onclick="atPartDel()">Supprimer</button>` : ''}</div>`}
    <div class="at-lbl"><span>Accords</span></div>
    <div class="at-bld"></div>
    <div class="at-lbl"><span>Rythme ou arpège</span></div>
    <div class="at-rh">${rbHTML('at', pi)}</div>
    <div class="at-lbl"><span>Original</span></div>
    <div class="at-in"><input type="url" id="at-orig" inputmode="url" placeholder="Lien de la version originale" value="${esc(orig)}" aria-label="Lien de la version originale" oninput="atOrig(this.value)"><button type="button" class="btn btn-ghost" onclick="atOrigPaste()">Coller</button><button type="button" class="btn btn-ghost" onclick="atOrigSearch()">Chercher</button></div>
    <div class="at-lbl"><span>Tutos épinglés</span></div>
    <div class="at-pins" id="at-pins"></div>
    <div class="at-drop" id="at-drop" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="atDrop(event)">Dépose un tuto ici pour l’épingler</div>
    <details class="at-lyr" style="margin-top:14px"${typeof p.lyrics === 'string' && p.lyrics ? ' open' : ''}><summary>Paroles</summary><textarea aria-label="Paroles" placeholder="Paroles de la partie…" oninput="atLyrics(this.value)">${esc(p.lyrics || '')}</textarea></details>`;
  atBuildRefresh(); atRenderPins(); rbSyncAll();
}
function atRenderPins() {
  const el = $('at-pins'); if (!el) return;
  const l = atPins();
  el.innerHTML = l.length ? l.map(x => `<div class="at-pinrow"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title || x.url)} ↗</a><button type="button" onclick="atUnpin('${x.id}')" aria-label="Retirer ce tuto">✕</button></div>`).join('') : `<div class="at-note">Rien d’épinglé : appuie sur la punaise d’un tuto.</div>`;
}
function atUnpin(id) { at.s.links = at.s.links.filter(l => l.id !== id); atMark(); atRenderPins(); atRenderTutos(); atSeg(); }
function atPartGo(i) { at.pi = i; at.sel = -1; atRenderFiche(); atRenderCopy(); }
function atPartAdd() {
  const solo = soloPart(at.s.parts);
  if (solo) at.s.parts[0].name = 'Couplet';
  const used = new Set(at.s.parts.map(q => q.name)), nm = solo ? 'Refrain' : PART_NAMES.find(n => !used.has(n)) || 'Partie ' + (at.s.parts.length + 1);
  at.s.parts.push(newPart(nm)); at.pi = at.s.parts.length - 1; at.sel = -1; atMark(); atRenderFiche(); atRenderCopy();
}
function atPartName(v) { atPart().name = v.trim().slice(0, 40) || 'Partie'; atMark(); atRenderFiche(); }
function atPartDel() {
  const p = atPart(); if (p.chords.length || rhHas(p.rhythm) || arpHas(p.arp)) if (!confirm(`Supprimer la partie « ${p.name} » ?`)) return;
  at.s.parts.splice(at.pi, 1); at.pi = Math.max(0, at.pi - 1); at.sel = -1; atMark(); atRenderFiche(); atRenderCopy(); atSeg();
}
function atLyrics(v) { const p = atPart(); if (v) p.lyrics = v; else delete p.lyrics; atMark(); }
function atOrig(v) { v = v.trim(); if (v) at.s.original = {url: v}; else delete at.s.original; atMark(); }
async function atOrigPaste() {
  try { const t = (await navigator.clipboard.readText() || '').trim(); if (!t) throw 0; $('at-orig').value = t; atOrig(t); }
  catch (e) { toast('Rien à coller : copie d’abord le lien', true); }
}
function atOrigSearch() { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(tSong() + ' original'), '_blank', 'noopener'); atExt(); }

/* ── séquence d'accords + clavier (rendu partagé : panneau Fiche et mode copie) ── */
const AT_SFX = [['♯','acc','#'],['♭','acc','b'],['m','q1','m'],['7','q2','7'],['maj7','q2','maj7'],['sus4','q3','sus4'],['sus2','q3','sus2'],['add9','q3','add9'],['dim','q1','dim']];
const AT_ENH = {'E#':'F','B#':'C','Fb':'E','Cb':'B'};
/* ── sélecteur d'accords visuel (diagrammes) : partagé Atelier / éditeur de fiche ── */
const cp = {at:false, ed:false, pi:0, tab:'top', names:false};   // cp.pi : partie de l'éditeur de fiche qui reçoit les accords
const CP_TOP = ['Em','C','G','D','Am','E','A','Dm','F','A7','D7','E7','Cadd9','Dsus4'];
const CP_TABS = [['top','Les plus utilisés'],['maj','Majeurs'],['min','Mineurs'],['7','Septièmes'],['sus','Sus'],['add','Add9']];
function cpList() { return cp.tab === 'top' ? CP_TOP.map(findChord1).filter(Boolean) : LIB.filter(c => c.fam === cp.tab); }
function cpTarget(ctx) { return ctx === 'at' ? (at.s ? atPart().chords : []) : (draft && draft.parts[cp.pi] ? draft.parts[cp.pi].chords : []); }
function cpHTML(ctx) {
  if (ctx === 'at' && !at.s) return '';
  const open = cp[ctx], last = cpTarget(ctx).slice(-8).map(c => esc(c.name || '?'));
  let h = ctx === 'ed' ? '' : `<button type="button" class="cp-open" onclick="cpToggle('${ctx}')" aria-expanded="${open}">${open ? '▲ Masquer les accords' : '+ Accord'}</button>`;   // éditeur : la tuile « + Accord » ouvre le panneau
  if (!open) return h;
  h += `<div class="cp-panel"><div class="cp-added">${last.length ? 'Dans la partie : <b>' + last.join('</b> · <b>') + '</b>' : 'Touche un diagramme pour l’ajouter.'}</div>
    <div class="cp-tabs" role="tablist">${CP_TABS.map(([k, l]) => `<button type="button" role="tab" aria-pressed="${cp.tab === k}" onclick="cpTab('${ctx}','${k}')">${l}</button>`).join('')}</div>
    <div class="cp-grid">${cpList().map(c => `<button type="button" class="cp-cell" onclick="cpPick('${ctx}','${esc(c.n)}')" aria-label="Ajouter ${esc(c.n)}">${chordSVG({frets:c.f, fingers:c.g}, {size:.72})}<span>${esc(c.n)}</span></button>`).join('')}</div>
    <button type="button" class="cp-close" onclick="cpToggle('${ctx}')">Fermer</button></div>`;
  return h;
}
function cpRefresh(ctx) {
  if (ctx === 'at') { atBuildRefresh(); return; }
  renderParts();   // la grille garde son défilement (renderParts)
}
function cpToggle(ctx, pi) { if (pi != null) { if (cp[ctx] && cp.pi === pi) cp[ctx] = false; else { cp[ctx] = true; cp.pi = pi; } } else cp[ctx] = !cp[ctx]; cpRefresh(ctx); }
function cpTab(ctx, t) { cp.tab = t; cpRefresh(ctx); }
function cpPick(ctx, name) {
  try { playChord(newChord(name), ctx === 'at' ? (at.s && at.s.capo) || 0 : (draft && draft.capo) || 0, 'D'); } catch (e) {}
  if (ctx === 'at') atAdd([name]); else addChordLine(name);
}
function atKbName() { const k = at.kb; if (!k.root) return ''; const r = AT_ENH[k.root + k.acc] || k.root + k.acc; return r + k.q1 + k.q2 + k.q3; }
function atKb(f, v) {
  const k = at.kb;
  if (f === 'root') k.root = k.root === v ? '' : v;
  else {
    k[f] = k[f] === v ? '' : v;
    if (f === 'q3' && /sus/.test(k.q3)) k.q1 = '';
    if (f === 'q1' && k.q1 && /sus/.test(k.q3)) k.q3 = '';
  }
  atBuildRefresh();
}
function atKbAdd() {
  const n = atKbName(); if (!n) { toast('Choisis d’abord une note (A à G)', true); return; }
  atAdd([n]); at.kb = {root:'', acc:'', q1:'', q2:'', q3:''}; atBuildRefresh();
}
function atAdd(names) {
  if (!at.s) { toast('Commence par le titre du morceau', true); return; }   // sans déplacer le focus : sinon les accords suivants atterrissent dans le titre
  const list = parseChordLine(names.join(' ')); if (!list.length) return;
  atPart().chords.push(...list); at.sel = -1; atMark(); atBuildRefresh(); atSeg();
}
function atTxt(inp) {
  const v = inp.value; if (!v.trim()) return;
  if (!at.s) { toast('Commence par le titre du morceau', true); return; }   // les accords tapés restent dans le champ
  inp.value = ''; atAdd([v]);
  const n = [...document.querySelectorAll('.at-txt input')].find(i => i.offsetParent); if (n) n.focus();
}
function atSelChord(i) { at.sel = at.sel === i ? -1 : i; atBuildRefresh(); }
function atMove(d) {
  const c = atPart().chords, i = at.sel, j = i + d; if (i < 0 || j < 0 || j >= c.length) return;
  [c[i], c[j]] = [c[j], c[i]]; at.sel = j; atMark(); atBuildRefresh();
}
function atDelChord() {
  const c = atPart().chords; if (!c.length) return;
  c.splice(at.sel >= 0 ? at.sel : c.length - 1, 1); at.sel = -1; atMark(); atBuildRefresh(); atSeg();
}
function atBuildHTML() {
  if (!at.s) return '';
  const p = atPart(), c = p.chords, k = at.kb, nm = atKbName();
  return `<div class="at-seq" role="list" aria-label="Accords de la partie${p.name ? ' ' + esc(p.name) : ''}">${c.length ? c.map((x, i) => `<button type="button" role="listitem" class="at-ch ${i === at.sel ? 'sel' : ''} ${x.frets.every(f => f === -1) ? 'todo' : ''}" onclick="atSelChord(${i})" aria-pressed="${i === at.sel}"><span>${esc(x.name || '?')}</span>${x.frets.every(f => f === -1) ? '' : chordSVG(x, {size:.6})}</button>`).join('') : `<span class="at-seqhint">Aucun accord : touche une note, puis « Ajouter ».</span>`}</div>
    ${at.sel >= 0 && c[at.sel] ? `<div class="at-ctl"><button type="button" onclick="atMove(-1)" aria-label="Décaler à gauche">◀ Avant</button><button type="button" onclick="atMove(1)" aria-label="Décaler à droite">Après ▶</button><button type="button" onclick="atDelChord()">Retirer</button></div>` : ''}
    ${cpHTML('at')}
    <details class="cp-names"${cp.names ? ' open' : ''} ontoggle="cp.names=this.open"><summary>Je connais les noms</summary>
    <div class="at-roots">${['A','B','C','D','E','F','G'].map(r => `<button type="button" onclick="atKb('root','${r}')" aria-pressed="${k.root === r}">${r}</button>`).join('')}</div>
    <div class="at-sc at-sfx" style="margin-top:8px">${AT_SFX.map(([l, f, v]) => `<button type="button" class="at-chip" onclick="atKb('${f}','${v}')" aria-pressed="${k[f] === v}">${l}</button>`).join('')}</div>
    <div class="at-add"><button type="button" class="btn btn-ghost" onclick="atDelChord()">⌫ Effacer</button><button type="button" class="btn btn-primary" onclick="atKbAdd()" ${nm ? '' : 'disabled'}>Ajouter ${esc(nm.replace(/#/g, '♯').replace(/^([A-G])b/, '$1♭'))}</button></div>
    <div class="at-txt"><input type="text" placeholder="Ou tape : Em7 G Dsus4" autocapitalize="off" autocomplete="off" aria-label="Taper des accords" onkeydown="if(event.key==='Enter'){event.preventDefault();atTxt(this)}"><button type="button" class="btn btn-ghost" style="min-height:44px" onclick="atTxt(this.previousElementSibling)">Ajouter</button></div></details>`;
}
function atBuildRefresh() { // met à jour toutes les instances (jamais le lecteur) ; le texte en cours de saisie est conservé
  const ins = [...document.querySelectorAll('.at-txt input')], vals = ins.map(i => i.value), act = ins.indexOf(document.activeElement);
  const ys = [...document.querySelectorAll('.at-bld .cp-grid')].map(g => g.scrollTop);
  document.querySelectorAll('.at-bld').forEach(el => { el.innerHTML = atBuildHTML(); });
  document.querySelectorAll('.at-bld .cp-grid').forEach((g, n) => { g.scrollTop = ys[n] || 0; });
  atRenderCopyBar();
  const nw = [...document.querySelectorAll('.at-txt input')];
  nw.forEach((i, n) => { if (vals[n]) i.value = vals[n]; });
  if (act >= 0 && nw[act]) nw[act].focus();
}
function atRenderCopy() { // mode copie (mobile) : vidéo en haut, accords + clavier dessous
  const h = $('at-copy'); if (!h) return;
  h.innerHTML = at.play ? `<div class="at-cpbar"><span id="at-cpt"></span><button type="button" onclick="atClose()">Voir les résultats</button></div><div class="at-bld"></div>` : '';
  atBuildRefresh();
}
function atRenderCopyBar() { const t = $('at-cpt'); if (t && at.s) t.textContent = soloPart(at.s.parts) ? 'Je copie' : 'Je copie : ' + atPart().name; }


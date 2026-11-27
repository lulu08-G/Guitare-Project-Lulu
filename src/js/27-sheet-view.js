/* ═══════ SHEET VIEW ═══════ */
let svPart = 0; // partie affichée en mode jeu (en vue « Tout » : partie active pour ▶ et Enregistrer)
let svAll = false; // vue « Tout » : le morceau entier, parties empilées
const SV_COMPACT = 12; // au-delà, accords en noms seuls
// rythme d'une partie dans la fiche (en vue « Tout » la taille mini est réglée par le CSS) : seul point d'appel de l'affichage du rythme
// vue « temps par temps » pour l'impression : une case par subdivision (1 + 2 + 3 + 4 +), une flèche par case
function rhTimeHTML(rh, cursor) {
  rh = rhNorm(rh); const per = rhPerBar(rh.mes, rh.res), beats = rh.mes === '6/8' ? 6 : (parseInt(rh.mes) || 4), sub = Math.max(1, Math.round(per / beats));
  const lab = pos => pos % sub === 0 ? pos / sub + 1 : sub === 2 ? '+' : sub === 4 ? ['e', '+', 'a'][pos % sub - 1] : '·';
  let h = '<div class="rt">';
  for (let b = 0; b * per < rh.cells.length; b++) {
    h += `<div class="rt-bar" style="--n:${per}">`;
    for (let k = b * per; k < (b + 1) * per; k++) {
      const c = rh.cells[k], pos = k % per;
      const g = !c ? '<circle class="o" cx="8" cy="11" r="1.6"/>' : c.d === 'X' ? '<path class="x" d="M3.5 6.5l9 9m0 -9l-9 9"/>' : c.d === 'U' ? '<path class="u" d="M8 20v-17m-5 6l5 -7l5 7"/>' : '<path class="d" d="M8 2v17m-5 -6l5 7l5 -7"/>';
      h += `<span class="rt-c${pos % sub === 0 ? ' b' : ''}${k === cursor ? ' on' : ''}"><i>${lab(pos)}</i><svg viewBox="0 0 16 22" aria-hidden="true">${g}</svg></span>`;
    }
    h += '</div>';
  }
  return h + '</div>';
}
// rythme d'une partie dans la fiche et le mode jeu : le composant Grille (rhythmSVG) ; arpège : son ruban
const svWayHTML = (p, opt) => pWayHTML(p, false, Object.assign({mini: svAll}, opt));
const hasLyr = p => !!(p && typeof p.lyrics === 'string' && p.lyrics.trim());
async function viewSheet(id, keepPart) {
  const s = sheets.find(x => x.id === id); if (!s) return;
  if (cur && cur.id !== id && typeof stopPlay === 'function') stopPlay();
  cur = s;
  svAll = (s.parts||[]).length > 1 && keepPart == null;   // une seule partie : pas de vue « Tout »
  svPart = keepPart && keepPart < (s.parts||[]).length ? keepPart : 0;
  $('sv-title').textContent = s.title;
  $('sv-artist').textContent = s.artist && s.artist !== '—' ? s.artist : '';
  $('sv-edit').onclick = () => { svMenuClose(); editSheet(id); };
  svRenderFavBtn();

  $('sv-stats').innerHTML = `<button type="button" class="sv-bpm-b sv-chip" onclick="svTempo(event)" aria-label="Régler le tempo"><span>Tempo</span><b id="rh-bpm-meta">${s.bpm || 90}</b></button>` + (s.tuning && s.tuning !== 'Standard' ? `<span class="sv-chip">${esc(s.tuning)}</span>` : '');
  { const b = $('sv-lyr-m'); if (b) { b.style.display = (s.parts || []).some(hasLyr) ? '' : 'none'; b.textContent = s.showLyrics ? 'Masquer les paroles' : 'Afficher les paroles'; } }
  $('sv-capo').innerHTML = s.capo > 0 ? `<span class="sv-chip"><span>Capo</span>${s.capo}</span>` : '';
  svKnowRender(); svTutoRender();
  LS.set('gms_last', id); { const sn = LS.get('gms_seen', {}); sn[id] = Date.now(); LS.set('gms_seen', sn); } svMenuClose(); svAaLabel();

  const tabsHost = $('sv-tabs'), partsHost = $('sv-parts');
  const nPts = (s.parts||[]).length, nCh = (s.parts||[]).reduce((n, p) => n + p.chords.length, 0);
  $('v-sheet').classList.toggle('solo', soloPart(s.parts));   // une seule partie sans nom : pas de nom de partie
  $('v-sheet').classList.toggle('one', nPts < 2);             // une seule partie : pas d'onglets
  $('v-sheet').classList.toggle('all', svAll);
  $('v-sheet').classList.toggle('compact', nCh > SV_COMPACT);
  $('v-sheet').classList.toggle('fb', typeof fbOn === 'function' && fbOn());   // fiche bêta : accords avec leur doigté
  tabsHost.innerHTML = nPts < 2 ? '' : `<button type="button" class="sv-tab ${svAll?'on':''}" data-idx="-1" onclick="svShowPart(-1)">Tout</button>` + (s.parts||[]).map((p, i) =>
    `<button type="button" class="sv-tab ${!svAll && i===svPart?'on':''}" data-idx="${i}" onclick="svShowPart(${i})">${esc(p.name || 'Partie ' + (i+1))}</button>`).join('');
  const fbw = typeof fbOn === 'function' && fbOn();   // la fiche bêta (?beta) : 39-96 et 39-99
  partsHost.innerHTML = (s.parts||[]).map((p, i) => {
    let body = '';
    if (p.chords.length) {
      const shown = fbw && FB.simp ? p.chords.map(fsSimp) : p.chords;   // « Simplifier » : des doigtés sans barré (affichage seulement)
      body += `<div class="chords-row">` +
        shown.map((c, j) => `<div class="chord-cell${c.simp ? ' simp' : ''}"${c.simp ? ` title="À la place de ${esc(c.orig)}"` : ''}>${chordSVG(c, {size:2.2})}<div class="cn">${esc(c.name)}</div></div>`).join('') + `</div>`;
    }
    const way = pWay(p);   // rythme OU arpège : une ligne « Rythme » / « Arpège » avec son ▶
    if (fbw && (way !== 'none' || p.rec)) body += fbWayHTML(p, i);
    else if (way !== 'none') body += `<div class="pv-way"><span class="pv-wl">${way === 'arp' ? 'Arpège' : 'Rythme'}</span><div class="sv-rh" id="rh-view-${i}">${svWayHTML(p, {chord: p.chords[0]})}</div>
      <button type="button" class="pv-pl" data-i="${i}" onclick="svCardPlay(${i},event)" aria-label="${p.rec ? 'Écouter ma prise' : way === 'arp' ? 'Jouer l’arpège' : 'Jouer le rythme'}">${RH_PLAY_SVG}</button></div>`;
    let more = '';   // détails d'une partie : visibles quand elle est seule à l'écran, cachés en vue « Tout »
    if (p.note) more += `<div class="pv-note">${esc(p.note)}</div>`;
    const staff = tabStaffSVG(p.chords, false);
    if (staff) more += `<div class="pv-lbl">Tablature / arpège</div><div class="scroll-x">${staff}</div>`;
    if (p.tabText) more += `<div class="pv-lbl">Tab</div><div class="tab-ascii mono">${esc(p.tabText)}</div>`;
    if (more) body += `<div class="pv-extra">${more}</div>`;
    if (hasLyr(p)) body += `<details class="pv-lyrd"${s.showLyrics ? ' open' : ''} onclick="event.stopPropagation()"><summary><span>Paroles</span><b></b></summary><div class="pv-lyr">${lyricsPreviewHTML(p.lyrics)}</div></details>`;
    if (!body) body = `<div style="font-size:13px;color:var(--cream3)">Partie vide — ajoute des accords avec « Modifier ».</div>`;
    const rep = +(p.repeat || p.reps || 0);   // ×N si la partie se répète (champ facultatif)
    return `<div class="pv-block ${i===svPart?'on':''}" data-idx="${i}" id="pvb-${i}" ${svAll ? `onclick="svPick(${i})"` : ''}>
      <div class="pv-hdr"><div class="pv-name">${esc(p.name || 'Partie ' + (i+1))}${rep > 1 ? `<span class="pv-rep">×${rep}</span>` : ''}</div>
        ${p.rec ? `<span class="pv-take has"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/></svg>Ma prise</span>` : ''}
        ${fbw ? fsSimpBtn(p) : `<div class="hm-menu pv-menu" id="pvm-${i}"><button type="button" class="pv-edit" onclick="pvMenu(${i},event)" aria-label="Modifier cette partie" aria-haspopup="true">modifier</button>
          <div class="pop" onclick="event.stopPropagation()">
            <button type="button" onclick="pvMenuClose();editSheet(cur.id)">Changer les accords</button>
            <button type="button" onclick="pvMenuClose();rbEditCur(${i})">${pWay(p) === 'arp' ? 'Changer l’arpège' : 'Saisir le rythme à la main'}</button>
            ${p.rec ? `<button type="button" onclick="pvMenuClose();svWayPlay(${i})">Écouter la guitare de l’app</button>` : ''}
          </div></div>`}</div>
      <div class="pv-body">${body}</div>
    </div>`;
  }).join('');
  if (typeof fbOn === 'function' && fbOn()) fbAfter(s);
  $('opt-lefty').checked = document.body.classList.contains('lefty');
  $('v-sheet').classList.toggle('lyr-on', !!s.showLyrics); // paroles cachées par défaut
  $('sv-coffre').innerHTML = coffreViewHTML(s);
  { const n = (s.links || []).length + (s.media || []).length + (s.parts || []).filter(q => q.rec).length; $('sv-more').open = n > 0; $('sv-more-t').innerHTML = n ? `<b>Perso</b><span>${n} élément${n > 1 ? 's' : ''} : mes prises, enregistrements, tutos</span>` : `<b>Perso</b><span class="sv-medi">${mediSVG('curieuse', {size: 40, anim: 'blink'})}<span>Filme-toi une fois. Dans trois mois, tu sauras exactement comment tu le jouais.</span><i aria-hidden="true">+</i></span>`; }
  svSync();
  if (!$('v-sheet').classList.contains('on')) go('sheet');
  if (matchMedia('(min-width:1200px)').matches) renderHome();   // PC large : la liste reste affichée à côté, fiche en cours marquée
  await hydrateMedia(s, $('sv-coffre'));
}
// i = -1 : vue « Tout » ; sinon une seule partie en grand
function svShowPart(i) {
  stopPlay(); svPop(false);
  svAll = i < 0 && cur.parts.length > 1;
  if (i >= 0) svPart = i;
  $('v-sheet').classList.toggle('all', svAll);
  cur.parts.forEach((q, j) => { const el = $('rh-view-' + j); if (el) el.innerHTML = svWayHTML(q, {chord: q.chords[0]}); });   // taille mini en vue « Tout »
  document.querySelectorAll('#sv-tabs .sv-tab').forEach(b => b.classList.toggle('on', svAll ? +b.dataset.idx < 0 : +b.dataset.idx === svPart));
  document.querySelectorAll('#sv-parts .pv-block').forEach(b => {
    b.classList.toggle('on', +b.dataset.idx === svPart);
    if (svAll) b.setAttribute('onclick', `svPick(${b.dataset.idx})`); else b.removeAttribute('onclick');
  });
  svSync();
  window.scrollTo(0, 0);
}
// vue « Tout » : toucher une partie la rend active (▶ et Enregistrer travaillent sur elle)
function svPick(i) {
  if (i === svPart) return;
  if (rhP || recPlay) stopPlay();
  svPart = i;
  document.querySelectorAll('#sv-parts .pv-block').forEach(b => b.classList.toggle('on', +b.dataset.idx === i));
  svSync();
}
// accord touché : en mode compact (vue « Tout »), bulle avec le diagramme
function svPop(show, i, j, el) {
  const pop = $('sv-pop'); if (!pop) return;
  if (!show) { pop.classList.remove('on'); return; }
  const c = cur.parts[i].chords[j];
  pop.innerHTML = `<div class="cn">${esc(c.name)}</div>${chordSVG(c, {size:2.2})}`;
  pop.classList.add('on');
  const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  pop.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width/2 - w/2)) + 'px';
  pop.style.top = Math.max(8, r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8) + 'px';
}
document.addEventListener('click', e => { if (!e.target.closest('.chord-cell')) svPop(false); });
const REC_DOT_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="7"/></svg>';
// état des boutons de la barre du bas selon la partie affichée
// repos / lecture / enregistrement (toute la barre teintée terracotta, Stop, jauge du micro, Annuler)
function svSync() {
  if (!cur) return;
  const p = cur.parts[svPart];
  const on = rhPlaying('v' + svPart), rp = !!recPlay, recing = !!(rc && rc.stage === 'rec'), has = pHas(p);
  const bar = $('sv-bar');
  bar.classList.toggle('rec', recing); bar.classList.toggle('playing', on && !recing);
  const pl = $('sv-play'), cap = $('sv-play-cap');
  pl.classList.toggle('create', !has && !recing);
  if (recing) { pl.innerHTML = RH_STOP_SVG; cap.textContent = 'Arrêter'; pl.setAttribute('aria-label', 'Arrêter l’enregistrement'); }
  else if (has) { const ar = pWay(p) === 'arp'; pl.innerHTML = on ? RH_PAUSE_SVG : RH_PLAY_SVG; cap.textContent = on ? 'Pause' : 'Jouer'; pl.setAttribute('aria-label', on ? (ar ? 'Mettre l’arpège en pause' : 'Mettre le rythme en pause') : (ar ? 'Lancer l’arpège en boucle' : 'Lancer le rythme en boucle')); }
  else { pl.innerHTML = RH_PLUS_SVG; cap.textContent = 'Créer'; pl.setAttribute('aria-label', 'Créer un rythme ou un arpège pour cette partie'); }
  $('sv-live').textContent = (pWay(p) === 'arp' ? 'Arpège en boucle' : 'Rythme en boucle') + (p && p.name ? ' · ' + p.name : '');
  document.querySelectorAll('#sv-parts .pv-pl').forEach(b => {   // ▶ de chaque carte
    const pn = (rhPlaying('v' + b.dataset.i) || (rp && +b.dataset.i === svPart)) && !recing; if (b.dataset.on === String(pn)) return;
    b.dataset.on = String(pn); b.classList.toggle('on', pn); b.innerHTML = b.classList.contains('fs-pl') ? (pn ? fbDanceHTML() : FB_PLAYO) : pn ? RH_PAUSE_SVG : RH_PLAY_SVG;
  });
  $('sv-rec').innerHTML = REC_DOT_SVG;
  const nTk = cur.parts.filter(x => x.rec).length, tk = $('sv-takes');
  tk.innerHTML = (rp ? 'Stop prise' : 'Prises' + (nTk ? ` (${nTk})` : '')) + '<i>›</i>';
  tk.classList.toggle('on', rp);
  const ly = $('sv-lyr'), anyLyr = cur.parts.some(hasLyr);
  ly.disabled = !anyLyr;
  ly.setAttribute('aria-pressed', cur.showLyrics ? 'true' : 'false');
  ly.title = anyLyr ? (cur.showLyrics ? 'Masquer les paroles' : 'Afficher les paroles') : 'Pas de paroles dans ce morceau';
  $('rh-bpm-bar').textContent = cur.bpm || 90;
}
if (LS.get('gms_lefty', false)) document.body.classList.add('lefty');
// refonte : les noms des accords en grand ; les doigtés s'affichent à la demande (menu ⋯), ou en touchant un accord
if (LS.get('gms_diag_on', false)) document.body.classList.add('diag-on');
function toggleNames() { const on = document.body.classList.toggle('diag-on'); LS.set('gms_diag_on', on); svAaLabel(); svMenuClose(); }
function svAaLabel() { const b = $('sv-aa'); if (b) b.textContent = document.body.classList.contains('diag-on') ? 'Masquer les doigtés' : 'Afficher les doigtés'; }
function svMenu(e) { e.stopPropagation(); $('sv-menu').classList.toggle('open'); }
function svMenuClose() { const m = $('sv-menu'); if (m) m.classList.remove('open'); }
document.addEventListener('click', e => { const m = $('sv-menu'); if (m && !m.contains(e.target)) m.classList.remove('open'); });
function setLefty(v) { document.body.classList.toggle('lefty', !!v); LS.set('gms_lefty', !!v); }
// appui long sur − / + : répétition accélérée
let bpmHT = null;
function bpmHold(d, e) {
  clearBpmHold();
  rhBpmStep(d);
  let n = 0;
  bpmHT = setTimeout(function rep() { rhBpmStep(d * (++n > 12 ? 5 : 1)); bpmHT = setTimeout(rep, n > 12 ? 90 : 110); }, 450);
}
function clearBpmHold() { clearTimeout(bpmHT); bpmHT = null; }
['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, clearBpmHold));
// tap tempo : plusieurs touches sur la valeur du BPM
let tapT = [];
function bpmTap() {
  const now = performance.now();
  if (tapT.length && now - tapT[tapT.length - 1] > 2000) tapT = [];
  tapT.push(now); tapT = tapT.slice(-5);
  if (tapT.length < 2) { toast('Touche en rythme pour trouver le tempo'); return; }
  const avg = (tapT[tapT.length - 1] - tapT[0]) / (tapT.length - 1);
  rhBpmStep(Math.max(30, Math.min(240, Math.round(60000 / avg))) - (cur.bpm || 90));
}
function svTuto() { if (cur) tutoOpenFor(cur.title, cur.artist); }
// Prises (N) : écoute la prise de la partie active, sinon de la première partie qui en a une
function svTakes() {
  if (!cur) return;
  if (recPlay) { recStopPlay(); return; }
  let i = cur.parts[svPart] && cur.parts[svPart].rec ? svPart : cur.parts.findIndex(x => x.rec);
  if (i < 0) { toast('Pas encore de prise : appuie sur Enregistrer'); return; }
  if (i !== svPart) { svPart = i; svPick2(); }
  recPlayToggle(i);
}
function svPick2() { document.querySelectorAll('#sv-parts .pv-block').forEach(b => b.classList.toggle('on', +b.dataset.idx === svPart)); }
async function svToggleLyrics() {
  if (!cur) return;
  if (!cur.parts.some(hasLyr)) return;
  cur.showLyrics = !cur.showLyrics;   // les paroles de chaque carte sont repliées par défaut : le bouton les déplie / replie toutes
  document.querySelectorAll('#sv-parts .pv-lyrd').forEach(d => { d.open = !!cur.showLyrics; });
  $('v-sheet').classList.toggle('lyr-on', cur.showLyrics);
  { const b = $('sv-lyr-m'); if (b) b.textContent = cur.showLyrics ? 'Masquer les paroles' : 'Afficher les paroles'; }
  svSync();
  await DB.put('sheets', clone(cur));
}
function svPlayCur() {
  if (rc && rc.stage === 'rec') { rcStop(); return; }
  const p = cur && cur.parts[svPart]; if (!p) return;
  if (!pHas(p)) { rbEditCur(svPart); return; }
  playPartRhythm(svPart);
}
function svRecBtn() {
  if (!cur || !cur.parts[svPart]) return;
  rcOpen(svPart);   // une nouvelle prise ; écouter l'ancienne : « Prises »
}
function svExit() { stopPlay(); go('home'); }
/* Écouter l'original : lien dédié de la fiche, sinon recherche YouTube du morceau */
function origURL(u) {
  u = String(u || '').trim(); if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return /^https?:\/\/[^\s]+\.[^\s]+/i.test(u) ? u : '';
}
function svOriginal() {
  if (!cur) return;
  const u = origURL(cur.original && cur.original.url);
  if (u) { window.open(u, '_blank', 'noopener'); return; }
  const q = encodeURIComponent(`${cur.title} ${cur.artist && cur.artist !== '—' ? cur.artist : ''}`.trim());
  window.open('https://www.youtube.com/results?search_query=' + q, '_blank', 'noopener');
  toast('Pas encore de version originale : colle le lien dans « Modifier »');
}
function searchOriginal() {
  const t = ($('f-title').value + ' ' + $('f-artist').value).trim();
  if (!t) { toast('Écris d’abord le titre', true); $('f-title').focus(); return; }
  window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(t), '_blank', 'noopener');
  toast('Colle ici le lien de la bonne version');
}
let wl = null; // écran allumé pendant le jeu
async function wakeOn() { try { if (navigator.wakeLock && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) {} }
function wakeOff() { try { if (wl) wl.release(); } catch (e) {} wl = null; }
document.addEventListener('keydown', e => {
  if (!$('v-sheet').classList.contains('on') || (rc && rc.stage !== 'rec') || e.ctrlKey || e.metaKey) return;
  const t = e.target, tag = t && t.tagName;
  if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
  const n = (cur && cur.parts.length) || 0;
  if (e.key === ' ' && tag !== 'BUTTON') { e.preventDefault(); svPlayCur(); }
  else if (e.key === 'ArrowRight' && !svAll && svPart < n - 1) svShowPart(svPart + 1);
  else if (e.key === 'ArrowLeft' && !svAll && svPart > 0) svShowPart(svPart - 1);
  else if (e.key === 'l' || e.key === 'L') { if (!$('sv-lyr').disabled) svToggleLyrics(); }
  else if (e.key === '+') rhBpmStep(1);
  else if (e.key === '-') rhBpmStep(-1);
});
function svRenderFavBtn() {
  const b = $('sv-fav'); if (!b || !cur) return;
  b.classList.toggle('on', !!cur.favorite);
  const svg = b.querySelector('svg'); if (svg) svg.setAttribute('fill', cur.favorite ? 'currentColor' : 'none');
}
async function toggleFavCur() {
  if (!cur) return;
  cur.favorite = !cur.favorite;
  const i = sheets.findIndex(x => x.id === cur.id); if (i >= 0) sheets[i].favorite = cur.favorite;
  await DB.put('sheets', clone(cur));
  svRenderFavBtn();
}
async function toggleFav(id, e) {
  if (e) e.stopPropagation();
  const s = sheets.find(x => x.id === id); if (!s) return;
  s.favorite = !s.favorite;
  await DB.put('sheets', clone(s));
  renderHome();
}
/* Lecteur de rythme de la fiche : ▶/■ dans la barre du bas, tempo −/+ (le BPM est celui de la fiche, enregistré) */
const RH_PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21"/></svg>';
const RH_PAUSE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>';
const RH_PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const RH_STOP_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';
const rhLastCi = {};
function rhRenderPlayer(i, step, k) {
  const el = $('rh-view-' + i), p = cur && cur.parts[i];
  // accord en cours (1 accord = 1 mesure)
  const r = p && pHas(p) ? rhNorm(pRh(p)) : null, n = p ? p.chords.length : 0;
  const ci = (step != null && k != null && r && n) ? Math.floor(k / rhPerBar(r.mes, r.res)) % n : -1;
  if (el && p) el.innerHTML = svWayHTML(p, step == null ? {chord: p.chords[0]} : {cursor: step, chord: p.chords[ci]});   // arpège : la basse suit l'accord en cours
  document.querySelectorAll(`#pvb-${i} .chord-cell`).forEach((c, j) => c.classList.toggle('now', j === ci));
  if (step != null) {   // anim calée sur l'horloge audio : ce rendu est déclenché par la file de temps du moteur
    mPulse(el && el.querySelector('.rgc.lit'));
    if (ci !== rhLastCi[i] && rhLastCi[i] != null) { const nc = document.querySelector(`#pvb-${i} .chord-cell.now`); mAnim(nc, [{transform: 'translateX(18px) scale(.96)', opacity: .4}, {transform: 'none', opacity: 1}], {duration: 220, easing: 'cubic-bezier(.22,.8,.3,1)'}); }
    rhLastCi[i] = ci;
  } else rhLastCi[i] = null;
  if (typeof mjOnStep === 'function') mjOnStep(i, step, k, ci);
  svSync();
}
// band : la bande (Boum, Tchik, Basile sur tes accords) joue à la place du clic. ▶ arrête ce qui joue ; le bouton de la bande
// arrête la bande, ou relance la partie avec elle si elle jouait seule.
function playPartRhythm(i, band) {
  const p = cur.parts[i]; if (!p || !pHas(p)) return;
  if (rhPlaying('v' + i) && (!band || rhP.band)) { rhStop(); return; }
  const arp = pWay(p) === 'arp', chs = p.chords.length ? p.chords : [newChord('Em')];
  rhStart(pRh(p), cur.bpm || 90, chs[0], cur.capo, (step, k) => rhRenderPlayer(i, step, k), Object.assign({key: 'v' + i, chords: chs, band: !!band}, arp ? {cellFn: arpCellFn(p.arp, cur.capo)} : {}));
  svSync();
}
// la bande en petit : Médi, Boum et Basile (bouton « Bande » du mode jeu ; tri de Lucas du 26/11 : la bande sort de la fiche)
const BAND_MINI = () => `<i class="bd" aria-hidden="true">${mediSVG('contente', {size: 24, anim: 'still'})}${BOUM_SVG(true, 'bd-m')}${BASILE_SVG(true, 'bd-m')}</i>`;
// ▶ d'une carte Partie : la rend active puis lance / arrête sa façon de jouer
function svCardPlay(i, e) {   // ▶ d'une carte : ma prise si elle existe, sinon le rythme joué par la guitare de l'app
  if (e) e.stopPropagation();
  const p = cur && cur.parts[i]; if (!p) return;
  if (!p.rec) { svWayPlay(i); return; }
  if (rhP) stopPlay();
  if (recPlay && i !== svPart) recStopPlay();
  if (i !== svPart) { svPart = i; svPick2(); }
  recPlayToggle(i);
}
function pvMenu(i, e) { e.stopPropagation(); const m = $('pvm-' + i), was = m.classList.contains('open'); pvMenuClose(); m.classList.toggle('open', !was); }
function pvMenuClose() { document.querySelectorAll('.pv-menu.open').forEach(m => m.classList.remove('open')); }
document.addEventListener('click', pvMenuClose);
// tempo : petit réglage ouvert depuis le chiffre sous le titre
function svTempo(e) {
  e.stopPropagation(); let pop = $('bpm-pop');
  if (pop && pop.classList.contains('on')) { pop.classList.remove('on'); return; }
  if (!pop) {
    pop = document.createElement('div'); pop.id = 'bpm-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Tempo');
    pop.innerHTML = `<button type="button" onpointerdown="bpmHold(-1,event)" onclick="if(!event.detail)rhBpmStep(-1)" aria-label="Moins vite">&minus;</button><b id="rh-bpm-pop"></b><button type="button" onpointerdown="bpmHold(1,event)" onclick="if(!event.detail)rhBpmStep(1)" aria-label="Plus vite">+</button><button type="button" class="tap" onclick="bpmTap()">Taper le tempo</button>`;
    pop.addEventListener('click', ev => ev.stopPropagation()); document.body.appendChild(pop);
    document.addEventListener('click', () => pop.classList.remove('on'));
  }
  $('rh-bpm-pop').textContent = cur.bpm || 90;
  const r = e.currentTarget.getBoundingClientRect(); pop.style.top = Math.round(r.bottom + 8) + 'px'; pop.style.left = Math.max(8, Math.min(innerWidth - 268, Math.round(r.left - 20))) + 'px';
  pop.classList.add('on');
}
function svWayPlay(i, e) {
  if (e) e.stopPropagation();
  if (i !== svPart) { if (rhP || recPlay) stopPlay(); svPart = i; svPick2(); }
  playPartRhythm(i);
}
function rhBpmStep(d) {
  if (!cur) return;
  cur.bpm = Math.max(30, Math.min(240, (cur.bpm || 90) + d));
  document.querySelectorAll('[id^=rh-bpm-]').forEach(e => e.textContent = cur.bpm);
  if (rhP) rhSetBpm(cur.bpm);
  clearTimeout(rhBpmSave);
  rhBpmSave = setTimeout(() => { const x = sheets.find(z => z.id === cur.id); if (x) x.bpm = cur.bpm; DB.put('sheets', clone(cur)); }, 600);
}
let rhBpmSave = null;
function ytId(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
// Coffre : un seul bouton « Enregistrer » (on choisit ensuite quoi), puis la liste de mes prises de rythme
function takesHTML(s) {
  const one = (s.parts || []).length < 2;
  const rows = (s.parts || []).map((p, i) => {
    if (!p.rec) return '';
    const nm = one ? 'Le morceau' : esc(p.name || 'Partie ' + (i + 1));
    return `<div class="tk-row"><span class="tk-n">${nm}</span><span class="tk-s">Ma prise</span><span class="tk-a"><button type="button" class="btn btn-ghost btn-sm" onclick="recPlayToggle(${i})">Écouter</button><div class="hm-menu"><button type="button" class="btn-icon tk-more" onclick="this.parentNode.classList.toggle('open');event.stopPropagation()" aria-label="Gérer ma prise : ${nm}" aria-haspopup="true"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button><div class="pop" onclick="event.stopPropagation();this.parentNode.classList.remove('open')"><button type="button" onclick="rcOpen(${i},'trim')">Rogner ma prise</button><button type="button" onclick="rcOpen(${i})">Refaire ma prise</button><button type="button" class="danger" onclick="rcDelete(${i})">Supprimer ma prise</button></div></div></span></div>`;
  }).join('');
  return `<button type="button" class="btn btn-primary tk-main" onclick="svRecChoose()"><u></u>Enregistrer</button>`
    + (rows ? `<div class="coffre-sec"><div class="coffre-sec-t">Mes prises de rythme</div>${rows}</div>` : '');
}
/* Choix de l'enregistrement : le rythme d'une partie, le morceau en entier (audio) ou une vidéo */
let svFull = null;
function svRecChoose(step) {
  if (!cur) return;
  const m = $('m-media'), b = $('m-media-body'), ps = cur.parts || [];
  const opt = (fn, t, d, ico) => `<button type="button" class="rcc-opt" onclick="${fn}"><span class="rcc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${ico}</svg></span><span><b>${t}</b><small>${d}</small></span></button>`;
  let h;
  if (step === 'parts') {
    h = `<div class="modal-t">Le rythme de quelle partie ?</div><div class="rcc-list">` + ps.map((p, i) => opt(`svRecClose();rcOpen(${i})`, esc(p.name || 'Partie ' + (i + 1)), p.rec ? 'Remplace ma prise actuelle' : (p.chords.map(c => esc(c.name)).join(' ') || 'Partie vide'), '<path d="M8 4v15M4 15l4 4 4-4"/><path d="M16 20V5M12 9l4-4 4 4"/>')).join('') + `</div>`
      + `<div class="modal-f"><button type="button" class="btn btn-ghost" onclick="svRecChoose()">Retour</button></div>`;
  } else if (step === 'full') {
    h = `<div class="modal-t">Le morceau en entier</div><p class="rcc-p">Joue tout le morceau : l’enregistrement est rangé dans tes médias.</p>
      <div class="rcc-full"><span class="rec-dot"></span><span id="svf-t">0 s</span></div>
      <div class="modal-f"><button type="button" class="btn btn-ghost" onclick="svFullStop(false)">Annuler</button><button type="button" class="btn btn-primary" onclick="svFullStop(true)">Arrêter et garder</button></div>`;
  } else {
    h = `<div class="modal-t">Enregistrer</div><div class="rcc-list">`
      + opt(ps.length > 1 ? "svRecChoose('parts')" : 'svRecClose();rcOpen(0)', 'Le rythme d’une partie', 'Ta prise remplace la guitare de l’app sur le ▶ de la partie', '<path d="M8 4v15M4 15l4 4 4-4"/><path d="M16 20V5M12 9l4-4 4 4"/>')
      + opt('svFullStart()', 'Le morceau en entier', 'Un enregistrement audio, rangé dans tes médias', '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>')
      + opt("$('svm-video').click()", 'En vidéo', 'Filme-toi avec l’appareil photo', '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10l5-3v10l-5-3"/>')
      + `</div><input type="file" id="svm-video" accept="video/*" capture="user" hidden onchange="svAddVideo(this)">
      <div class="modal-f"><button type="button" class="btn btn-ghost" onclick="svRecClose()">Fermer</button></div>`;
  }
  b.innerHTML = h; m.classList.remove('hide');
}
function svRecClose() { if (svFull) svFullStop(false); $('m-media').classList.add('hide'); }
async function svMediaAdd(blob, kind, name) {
  const mediaId = uid();
  await DB.put('media', {id: mediaId, blob, type: blob.type});
  cur.media = cur.media || [];
  cur.media.push({id: uid(), mediaId, name, kind});
  cur.updatedAt = Date.now(); await DB.put('sheets', clone(cur));
  viewSheet(cur.id, svAll ? null : svPart);
}
async function svAddVideo(inp) {
  const f = inp.files[0]; inp.value = ''; if (!f || !cur) return;
  const n = (cur.media || []).filter(m => m.kind === 'video').length + 1;
  svRecClose(); await svMediaAdd(f, 'video', `Ma vidéo ${n}`); toast('Vidéo gardée dans tes médias');
}
async function svFullStart() {
  if (!window.MediaRecorder) { toast('Enregistrement audio non disponible ici', true); return; }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({audio: true}); } catch (e) { toast('Micro refusé ou indisponible', true); return; }
  stopPlay();
  const chunks = [], r = new MediaRecorder(stream), t0 = Date.now();
  svFull = {r, stream, chunks, keep: false};
  r.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  r.onstop = async () => {
    const F = svFull; svFull = null; clearInterval(F.iv);
    stream.getTracks().forEach(t => t.stop());
    if (!F.keep || !chunks.length) return;
    const n = (cur.media || []).filter(m => m.kind === 'audio').length + 1;
    await svMediaAdd(new Blob(chunks, {type: r.mimeType || 'audio/webm'}), 'audio', `Morceau entier ${n}`);
    toast('Enregistrement gardé dans tes médias');
  };
  r.start();
  svRecChoose('full');
  svFull.iv = setInterval(() => { const e = $('svf-t'); if (e) { const s = Math.round((Date.now() - t0) / 1000); e.textContent = s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0'); } }, 250);
}
function svFullStop(keep) {
  if (!svFull) return;
  svFull.keep = keep;
  try { svFull.r.stop(); } catch (e) {}
  $('m-media').classList.add('hide');
}
function coffreViewHTML(s) {
  const videos = (s.media||[]).filter(m => m.kind === 'video');
  const audios = (s.media||[]).filter(m => m.kind === 'audio');
  const links = s.links||[];
  let h = `<div class="coffre-block">
    <div class="coffre-hdr">
      <div class="ico-wrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M2 7l3-4h14l3 4"/><path d="M9 12h6"/></svg></div>
      <div class="t">Les Médias</div>
    </div>
    <div class="coffre-body">`;
  if (s.memo) h += `<div class="pv-note" style="margin-top:0;margin-bottom:18px">${esc(s.memo)}</div>`;
  h += takesHTML(s);

  h += `<div class="coffre-sec"><div class="coffre-sec-t">Mes vidéos</div>`;
  h += videos.length ? `<div class="media-list" data-media-host="video"></div>` : `<div class="coffre-empty">Aucune vidéo pour l’instant.</div>`;
  h += `</div>`;

  h += `<div class="coffre-sec"><div class="coffre-sec-t">Tutos utiles</div>`;
  if (links.length) {
    const top = svTutoLink(s);
    h += links.map(l => {
      const id = ytId(l.url);
      if (top && l === top) return `<div class="coffre-empty">${esc(l.title && l.title !== 'Video' ? l.title : 'Le tuto')} se lit en haut de la fiche.</div>`;
      return id
        ? `<div class="yt-embed" style="margin-bottom:10px"><iframe src="https://www.youtube.com/embed/${id}" title="${esc(l.title||'Video')}" allowfullscreen loading="lazy"></iframe></div>`
        : `<a class="link-card" href="${esc(l.url)}" target="_blank" rel="noopener"><svg class="ico" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/></svg><span class="lc-t">${esc(l.title || l.url)}</span></a>`;
    }).join('');
  } else h += `<div class="coffre-empty">Aucun tuto enregistré.</div>`;
  h += resourcesHTML(s) + `</div>`;

  h += `<div class="coffre-sec"><div class="coffre-sec-t">Mes enregistrements</div>`;
  h += audios.length ? `<div class="media-list" data-media-host="audio"></div>` : `<div class="coffre-empty">Aucun enregistrement pour l’instant.</div>`;
  h += `</div>`;

  if (s.tabImage) h += `<div class="coffre-sec"><div class="coffre-sec-t">Image de tab</div><div data-tabimg="1"></div></div>`;

  return h + `</div></div>`;
}
function resourcesHTML(s) {
  if (!s.title) return '';
  const q = encodeURIComponent(`${s.title} ${s.artist||''}`.trim());
  const L = [
    ['YouTube tuto', `https://www.youtube.com/results?search_query=${q}+guitar+tutorial`],
    ['Ultimate Guitar', `https://www.ultimate-guitar.com/search.php?search_type=title&value=${q}`],
    ['Songsterr', `https://www.songsterr.com/?pattern=${q}`],
    ['Google "tab"', `https://www.google.com/search?q=${q}+guitar+tab`],
  ];
  // discret : un simple lien sous les tutos, qui déplie les recherches pré-remplies
  return `<details class="res-more"><summary>Chercher d’autres tutos</summary>
    <div class="res-links"><button type="button" class="btn btn-ghost btn-sm" onclick="tutoOpenFor(cur.title, cur.artist)">Tous les tutos de ce morceau</button>${L.map(([t,u]) => `<a class="btn btn-ghost btn-sm" href="${u}" target="_blank" rel="noopener">${t}
      <svg class="ico" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`).join('')}</div>
  </details>`;
}
async function hydrateMedia(s, host) {
  for (const kind of ['video','audio']) {
    const mh = host.querySelector(`[data-media-host="${kind}"]`);
    if (!mh) continue;
    mh.innerHTML = '';
    for (const m of (s.media||[]).filter(m => m.kind === kind)) {
      const url = await mediaURL(m.mediaId);
      const el = document.createElement('div');
      el.className = 'media-item';
      const tag = m.kind === 'video' ? `<video src="${url}" controls></video>` : `<audio src="${url}" controls></audio>`;
      el.innerHTML = `<span class="mi-name">${esc(m.name)}</span>${url ? tag : '<span style="font-size:11px;color:var(--terra)">media introuvable</span>'}`;
      mh.appendChild(el);
    }
  }
  const ti = host.querySelector('[data-tabimg]');
  if (ti && s.tabImage) {
    const url = await mediaURL(s.tabImage);
    if (url) ti.innerHTML = `<img src="${url}" style="width:100%;border-radius:8px;border:1px solid var(--border)">`;
  }
}
async function mediaURL(id) {
  if (!id) return null;
  if (mediaURLs[id]) return mediaURLs[id];
  const rec = await DB.get('media', id);
  if (!rec) return null;
  const url = URL.createObjectURL(rec.blob);
  mediaURLs[id] = url;
  return url;
}


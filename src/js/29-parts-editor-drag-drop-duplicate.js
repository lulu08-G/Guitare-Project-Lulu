/* ═══════ PARTS EDITOR (drag & drop, duplicate, collapse) ═══════ */
function dupPart(i) {
  const c = clone(draft.parts[i]);
  c.id = uid(); c.chords.forEach(ch => ch.id = uid());
  c.name = c.name.match(/\d+$/) ? c.name.replace(/\d+$/, m => (+m + 1)) : c.name + ' 2';
  draft.parts.splice(i + 1, 0, c);
  renderParts(); toast('Partie dupliquée');
}
function rmPart(i) {
  if (draft.parts.length <= 1) { toast('Il faut au moins une partie', true); return; }
  draft.parts.splice(i, 1); renderParts();
}
function togglePart(i) { draft.parts[i].collapsed = !draft.parts[i].collapsed; renderParts(); }

const edNaming = new Set();   // parties dont le nom se saisit (« Nommer › »)
const edMoreOpen = new Set(); // parties dont « Paroles, note… » est ouvert
let edRpI = 0;                // partie visée par la grande barre ⏺ (la dernière touchée)
const edRp = () => Math.max(0, Math.min(edRpI, draft.parts.length - 1));
function edRpSet(i) { if (i !== edRpI) { edRpI = i; if (!(rc && rc.inline)) edBar(); } }
function edRpPick(i) { edRpI = i; edBar(); }
function edMoreT(id, on) { on ? edMoreOpen.add(id) : edMoreOpen.delete(id); }
function edPartName(i, n) {   // pastille de nom : une partie unique peut rester sans nom (re-toucher le nom l'enlève)
  const p = draft.parts[i]; edNaming.delete(p.id);
  p.name = p.name === n && draft.parts.length === 1 ? '' : n;
  renderParts();
}
function edNameStart(i) { edNaming.add(draft.parts[i].id); renderParts(); const n = document.querySelector(`#parts-ed [data-i="${i}"] .pc-name`); if (n) n.focus(); }
function edCapoSync() {
  const v = draft.capo || 0;
  $('f-capo').value = v;
  document.querySelectorAll('.ed-capo').forEach(l => {
    l.classList.toggle('on', v > 0); l.querySelector('b').textContent = v || '—';
    const b = l.querySelectorAll('button'); b[0].disabled = v <= 0; b[1].disabled = v >= 9;
  });
}
function edCapoStep(d) { draft.capo = Math.max(0, Math.min(9, (draft.capo || 0) + d)); edCapoSync(); }
// capo : − / + (frette 0 à 9, « — » = sans capo)
// Tempo : petit bouton tant qu'il n'est pas réglé ; un toucher le déplie en champ
let edTempoOpen = false;
function edTempoShow() { edTempoOpen = true; renderParts(); const i = document.querySelector('#ed-meta .ed-tempo input'); if (i) i.focus(); }
function edCapoHTML() {
  const v = draft.capo || 0;
  return `<div class="ed-capo${v ? ' on' : ''}" role="group" aria-label="Capo"><small>Capo</small>
    <button type="button" onclick="edCapoStep(-1)" aria-label="Capo plus bas" ${v <= 0 ? 'disabled' : ''}>−</button>${v ? `<b>${v}</b>` : '<b class="none" aria-label="sans capo">ø</b>'}
    <button type="button" onclick="edCapoStep(1)" aria-label="Capo plus haut" ${v >= 9 ? 'disabled' : ''}>+</button></div>`;
}
// « Liens et enregistrements » : ouvre les Médias (vidéos, tutos, prises audio) dans « Plus d'options » et y amène
function edOpenCoffre(target) {
  if (!draft.blocks.coffre) { draft.blocks.coffre = true; renderOptBlocks(); }
  $('more-opts').open = true;
  setTimeout(() => { const t = $(target); if (t) { t.scrollIntoView({block: 'center', behavior: 'smooth'}); if (t.tagName === 'INPUT') t.focus(); } }, 60);
}
function edClose() { rcCleanup(); stopPlay(); edBarReset(); go('home'); }
const edOK = () => !!($('f-title').value.trim() && draft && draft.parts.some(p => p.chords.length));
function edSyncSave() {
  const b = $('ed-save'); if (!b) return;
  const ok = edOK(); b.classList.toggle('off', !ok); b.setAttribute('aria-disabled', ok ? 'false' : 'true');
}
function edSaveTap() {
  if (edOK()) { saveSheet(); return; }
  const noT = !$('f-title').value.trim();
  toast(noT ? 'Ajoute le titre du morceau' : 'Ajoute au moins un accord', true);
  if (noT) $('f-title').focus();
}
function edChordsHTML(p, i) {
  const open = cp.ed && cp.pi === i;
  return `<div class="ed-chs">${p.chords.map((c, ci) => {
      const todo = c.frets.every(f => f === -1);
      return `<div class="ed-ct${todo ? ' todo' : ''}" data-cid="${esc(c.id || '')}" role="button" tabindex="0" onclick="edRpSet(${i});openChordEditor(${i},${ci})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openChordEditor(${i},${ci})}" title="Modifier l’accord">
        <button type="button" class="ed-ctx" onclick="event.stopPropagation();rmChord(${i},${ci})" aria-label="Retirer ${esc(c.name || 'l’accord')}"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button>
        <b>${esc(c.name || '?')}</b>${chordSVG(c, {size:.86})}
        ${todo ? '<em>à compléter</em>' : c.arp && c.arp.length ? '<em>arpège</em>' : ''}</div>`; }).join('')}
    <button type="button" class="ed-ct add" onclick="edRpSet(${i});cpToggle('ed',${i})" aria-expanded="${open}"><span>${open ? '×' : '+'}</span>${open ? 'Fermer' : 'Accord'}</button></div>${i === Math.min(cp.pi, draft.parts.length - 1) ? '<div class="qc-sugg" id="qc-sugg"></div>' : ''}`;   // la grille d'accords s'ouvre en panneau du bas (edCpSheet)
}
function edMoreHTML(p, i) {
  const hasLyr = typeof p.lyrics === 'string';
  const has = hasLyr || p.note || p.tabText || p.chords.length;
  if (!has) return '';
  const key = p.id || i;
  return `<details class="pc-more" ${edMoreOpen.has(key) || hasLyr && p.lyrics || p.note ? 'open' : ''} ontoggle="edMoreT('${key}',this.open)"><summary>Paroles, note, tablature</summary>
    ${p.chords.length ? `<div class="part-sub"><span class="part-sub-t">Tablature (aperçu)</span></div>
      <div class="scroll-x">${tabStaffSVG(p.chords, false) || '<span style="font-size:11px;color:var(--cream4)">Ouvre un accord et clique sa timeline d’arpège pour dessiner la tab.</span>'}</div>` : ''}
    <div class="part-sub"><span class="part-sub-t">Paroles</span>
      ${hasLyr ? `<button class="btn btn-ghost btn-xs" onclick="draft.parts[${i}].lyrics=undefined;renderParts()">retirer</button>`
               : `<button class="add-btn" onclick="draft.parts[${i}].lyrics='';edMoreOpen.add('${key}');renderParts()">+ Paroles</button>`}
    </div>
    ${hasLyr ? lyricsEditorHTML(i, p) : ''}
    <div class="part-sub"><span class="part-sub-t">Note</span></div>
    <textarea rows="2" placeholder="x2, plus doux, laisser sonner..." oninput="draft.parts[${i}].note=this.value">${esc(p.note)}</textarea>
    ${p.tabText ? `<div class="part-sub"><span class="part-sub-t">Tab importée</span><button class="btn btn-ghost btn-xs" onclick="draft.parts[${i}].tabText='';renderParts()">retirer</button></div>
      <div class="tab-ascii mono">${esc(p.tabText)}</div>` : ''}</details>`;
}
let edSeen = new Set(), edSeenFor = null;
function renderParts() {
  const host = $('parts-ed'), solo = draft.parts.length === 1;
  const g0 = document.querySelector('#cp-sheet .cp-sheet-in'), gy = g0 ? g0.scrollTop : 0;
  host.innerHTML = draft.parts.map((p, i) => {
    const nC = p.chords.length;
    const summary = p.collapsed
      ? `<span class="pc-sum">${nC ? nC + ' accord' + (nC > 1 ? 's' : '') : ''}${pWay(p) === 'arp' ? ' · arpège' : rhHas(p.rhythm) ? ' · rythme' : ''}</span>` : '';
    const custom = !!p.name && !PC_NAMES.includes(p.name), nameOn = custom || edNaming.has(p.id);
    const nameInp = `<input class="pc-name" value="${esc(p.name)}" oninput="draft.parts[${i}].name=this.value" onchange="renderParts()" placeholder="Nom de la partie" aria-label="Nom de la partie">`;
    const chips = `<div class="pc-names" role="group" aria-label="Nom de la partie">${PC_NAMES.map(n => `<button type="button" class="pc-chip${p.name === n ? ' on' : ''}" aria-pressed="${p.name === n}" onclick="edPartName(${i},'${n}')">${n}</button>`).join('')}<button type="button" class="pc-chip${nameOn ? ' on' : ''}" aria-pressed="${nameOn}" onclick="edNameStart(${i})">${custom ? esc(p.name) : 'Autre…'}</button></div>${nameOn ? nameInp : ''}`;
    const title = esc(p.name || (solo ? 'Partie du morceau' : 'Partie ' + (i + 1)));
    const bare = wayOf(p) === 'rh' && !rhHas(p.rhythm);   // pas encore de rythme : le gros bouton « Enregistrer mon rythme » suffit
    const head = solo
      ? (p.name ? `<div class="pc-h"><b class="pc-t">${title}</b></div>${chips}` : '')
      : `<div class="pc-h"><span class="drag-handle" title="Glisser pour réordonner"><svg class="ico" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="currentColor" stroke="none"/></svg></span>
        <b class="pc-t">${title}</b>${summary}
        <div class="part-tools">
          <button onclick="togglePart(${i})" title="Replier" aria-label="Replier la partie"><svg class="ico collapse-ico" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></button>
          <button onclick="dupPart(${i})" title="Dupliquer" aria-label="Dupliquer la partie"><svg class="ico" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
          <button class="danger" onclick="rmPart(${i})" title="Supprimer" aria-label="Supprimer la partie"><svg class="ico" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div></div>${chips}`;
    return `<div class="part-card pc ${p.collapsed ? 'collapsed' : ''} ${solo ? 'solo' : ''}" data-i="${i}">${head}
      <div class="pc-b">
        ${edChordsHTML(p, i)}
        ${bare || solo ? '' : `<div class="ed-lab in"><b>Rythme</b></div>${rbHTML('draft', i)}`}
        ${edMoreHTML(p, i)}
      </div></div>`;
  }).join('');
  $('ed-solo-rh').innerHTML = '';
  { const p0 = draft.parts[0]; $('ed-solo-way').innerHTML = solo && p0 && !(wayOf(p0) === 'rh' && !rhHas(p0.rhythm)) ? rbHTML('draft', 0) : ''; }   // une seule partie : l'aperçu se pose sous « Rythme », au-dessus de l'enregistreur
  $('ed-meta').innerHTML = edCapoHTML() + (edTempoOpen || draft.bpm ? `<label class="ed-tempo">Tempo<input type="number" inputmode="numeric" min="30" max="300" value="${draft.bpm || ''}" placeholder="?" aria-label="Tempo en BPM" oninput="draft.bpm=+this.value||0;$('f-bpm').value=this.value"></label>` : `<button type="button" class="ed-tempo-mini" onclick="edTempoShow()" aria-label="Régler le tempo">Tempo</button>`) + `<small>pour tout le morceau</small>`;
  initDnD(host);
  edCpSheet(gy); renderQuickSugg();
  // un accord ajouté se pose (les accords déjà vus ne rejouent rien)
  if (edSeenFor !== draft) { edSeenFor = draft; edSeen = new Set(); host.querySelectorAll('.ed-ct[data-cid]').forEach(e => edSeen.add(e.dataset.cid)); }
  else host.querySelectorAll('.ed-ct[data-cid]').forEach(e => { if (!edSeen.has(e.dataset.cid)) { edSeen.add(e.dataset.cid); if (!mReduced()) e.classList.add('landing'); } });
  renderQuickParts(); rbSyncAll(); edSyncSave(); edBar();
}
/* ── grande barre ⏺ « Enregistrer mon rythme » (éditeur de fiche) : collée en bas, suit la page ──
   4 états : repos (gros bouton rouge) → décompte → enregistrement (chrono + onde + ■ Arrêter) → prise faite (▶ Réécouter / ↺ Refaire).
   Même flux rc* que le mode jeu, sans fenêtre : l'arrêt garde la prise entière (« Rogner » reste possible). */
const edLv = [];              // niveaux récents du micro (onde en direct)
const edPkC = {};             // mediaId -> pics de la prise (onde statique)
const ED_WAVE_N = 40;
const edWaveBars = (vals, cls) => `<div class="ed-wave ${cls || ''}" aria-hidden="true">${Array.from({length: ED_WAVE_N}, (_, k) => `<i style="height:${Math.round(5 + 34*Math.min(1, vals[k] || 0))}px"></i>`).join('')}</div>`;
let edBarSt = '';
function edBarReset() { const h = $('ed-recbar'); if (h) h.innerHTML = ''; edBarSt = ''; }
function edBar() {
  const host = $('ed-recbar'); if (!host || !draft) return;
  const i = edRp(), p = draft.parts[i], multi = draft.parts.length > 1;
  const pick = multi ? `<label class="ed-rp">Rythme pour la partie <select aria-label="Partie à enregistrer" onchange="edRpPick(+this.value)">${draft.parts.map((q, j) => `<option value="${j}" ${j === i ? 'selected' : ''}>${esc(q.name || 'Partie ' + (j + 1))}</option>`).join('')}</select></label>` : '';
  let h;
  if (rc && rc.inline && rc.stage === 'count') {
    h = `<div class="ed-rc"><div class="ed-rc-h"><b>Prépare-toi…</b><span class="ed-rc-n" id="ed-rc-n">4</span></div>
      <p class="ed-rc-s">Quatre clics, puis gratte ton rythme.</p>
      <button type="button" class="ed-rcb ghost" onclick="edRecCancel()">Annuler</button></div>`;
  } else if (rc && rc.inline && rc.stage === 'rec') {
    h = `<div class="ed-rc live"><div class="ed-rc-h"><i class="ed-gauge" aria-hidden="true"></i><span class="ed-dot"></span><b>Enregistrement…</b><span class="ed-rc-t" id="ed-rc-t">0:00</span></div>
      ${edLiveHTML()}
      <button type="button" class="ed-rcb stop" onclick="rcStop()"><i>${RH_STOP_SVG}</i>Arrêter</button></div>`;
  } else if (p && p.rec) {
    const d = (p.rec.end - p.rec.start).toFixed(1).replace('.', ',');
    h = `<div class="ed-rc done"><div class="ed-rc-h"><span class="ed-ok"><svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg></span><b>Mon rythme enregistré</b><span class="ed-rc-m">${d} s · boucle</span></div>
      <div id="ed-pk">${edWaveBars([], 'done')}</div>
      <div class="ed-rc-r"><button type="button" class="ed-rcb play" id="ed-reco" onclick="recPlayToggle(${i},'draft')"></button>
        <button type="button" class="ed-rcb sand" onclick="edRecStart()"><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 108.5-8.5c-2.4 0-4.6 1-6.2 2.7L3.5 8.5"/><path d="M3.5 3.5v5h5"/></svg></i>Refaire</button></div>
      <div class="ed-rc-l"><button type="button" onclick="rcOpen(${i},'trim','draft')">Rogner</button><button type="button" onclick="rcDelete(${i},'draft')">Supprimer</button></div></div>`;
    edPeaks(p.rec.mediaId).then(pk => { const e = $('ed-pk'); if (e && pk && draft && edRp() === i) e.innerHTML = edWaveBars(pk, 'done'); });
  } else {
    const bareP = p && wayOf(p) === 'rh' && !rhHas(p.rhythm);
    h = `<div class="ed-rcard">${mediBulle('concentree', 'Gratte deux mesures comme tu le sens. J’écoute et je te le note.', {size: 64, anim: 'tilt'})}
      <button type="button" class="ed-rec" onclick="edRecStart()"><span class="ed-rec-dot" aria-hidden="true"></span><b>Enregistrer mon rythme</b></button>
      <div class="ed-cells" aria-hidden="true">${['1','et','2','et','3','et','4','et'].map((c, k) => `<span class="${k % 2 ? 'o' : ''}"><i></i>${c}</span>`).join('')}</div>
      ${bareP ? `<div class="ed-alt"><button type="button" onclick="weOpen('draft',${i})">Saisir à la main</button><button type="button" onclick="weOpen('draft',${i},'arp')">Arpège</button></div>` : ''}</div>`;
  }
  host.innerHTML = pick + h;
  const st = rc && rc.inline && (rc.stage === 'count' || rc.stage === 'rec') ? rc.stage : (p && p.rec ? 'done' : 'idle');
  if (st !== edBarSt && edBarSt !== '') {   // changement d'état : la barre entre, la coche se trace
    const bar = host.querySelector('.ed-rc,.ed-rcard'); if (bar && !mReduced()) bar.classList.add('enter');
  }
  edBarSt = st;
  if (st === 'rec' && rc.t0) {   // jauge de la prise (garde-fou 90 s), reprise à l'instant écoulé
    const a = mAnim(host.querySelector('.ed-gauge'), [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: 90000, easing: 'linear', fill: 'forwards'});
    if (a) a.currentTime = performance.now() - rc.t0;
  }
  edBarPlay();
  if (st === 'rec') edLiveRun();
  $('v-ed').style.setProperty('--dock-h', host.offsetHeight + 'px');
}
/* Enregistreur « les coups tombent » : pendant la prise, chaque coup entendu tombe dans sa case
   (une mesure de 4/4 en croches, calée sur le tempo et le décompte ; ↓ sur le temps, ↑ entre les temps, comme rhFromTake) */
const ED_CNT = ['1', 'et', '2', 'et', '3', 'et', '4', 'et'];
const ED_AR = '<svg viewBox="0 0 16 28" aria-hidden="true"><path d="M8 2v23"/><path d="M2 18l6 7 6-7"/></svg>';
function edLiveHTML() {
  return `<div class="ed-live" id="ed-live" aria-hidden="true"><div class="ed-live-bar">${ED_CNT.map((n, k) => `<div class="ed-lc${k % 2 ? '' : ' b'}" data-k="${k}"><span class="ed-la"></span><i>${n}</i></div>`).join('')}<span class="ed-lh" id="ed-lh"></span></div></div>`;
}
let edLiveRaf = 0;
function edLiveRun() {
  cancelAnimationFrame(edLiveRaf);
  const me = rc; if (!me || !me.inline) return;
  const bpm = (draft && draft.bpm) || 90, cell = 30000 / bpm, bar = cell * 8;
  const buf = me.an ? new Uint8Array(me.an.fftSize) : null;
  let env = 0, lastHit = -1e9, lastK = -1;
  const step = () => {
    if (rc !== me || me.stage !== 'rec') return;
    const box = $('ed-live');
    if (box && me.t0) {
      const t = performance.now() - me.t0, b = Math.floor(t / bar), pos = (t % bar) / bar, kNow = Math.floor(pos * 8);
      const h = $('ed-lh'); if (h) h.style.left = (pos * 100) + '%';
      if (kNow !== lastK) {   // le curseur entre dans une case : un coup d'une mesure précédente s'efface
        lastK = kNow; const a = box.querySelector(`[data-k="${kNow}"] .ed-la`);
        if (a && a.dataset.b !== undefined && +a.dataset.b < b) { a.innerHTML = ''; delete a.dataset.b; }
      }
      if (buf) {
        me.an.getByteTimeDomainData(buf); let m = 0;
        for (let k = 0; k < buf.length; k++) m = Math.max(m, Math.abs(buf[k] - 128));
        const lv = Math.min(1, m / 128 * 1.6);
        if (lv > .1 && lv > env * 1.5 && t - lastHit > 110) {   // une attaque : on la cale sur la croche la plus proche
          lastHit = t;
          const idx = Math.round(t / cell), k = ((idx % 8) + 8) % 8, a = box.querySelector(`[data-k="${k}"] .ed-la`);
          if (a) { a.dataset.b = Math.floor(idx / 8); a.innerHTML = `<b class="${k % 2 ? 'u' : 'd'}">${ED_AR}</b>`; }
        }
        env = Math.max(lv, env * .9);
      }
    }
    edLiveRaf = requestAnimationFrame(step);
  };
  edLiveRaf = requestAnimationFrame(step);
}
function edBarPlay() {
  const b = $('ed-reco'); if (!b) return;
  const on = recPlay && recPlay.ctx === 'draft' && recPlay.part === edRp();
  b.innerHTML = `<i>${on ? RH_STOP_SVG : RH_PLAY_SVG}</i>${on ? 'Arrêter' : 'Réécouter'}`;
}
async function edPeaks(mediaId) {
  if (edPkC[mediaId]) return edPkC[mediaId];
  try {
    const raw = rcPeaks(await recBuffer(mediaId)), n = ED_WAVE_N;
    return (edPkC[mediaId] = Array.from({length: n}, (_, k) => Math.max(...raw.slice(Math.floor(k*raw.length/n), Math.floor((k + 1)*raw.length/n)))));
  } catch (e) { return null; }
}
async function edRecStart() {
  if (!draft) return;
  const i = edRp(); rcCleanup(); stopPlay(); edLv.length = 0;
  rc = {ctx: 'draft', part: i, stage: 'idle', start: 0, end: 0, isNew: true, inline: true, count: LS.get('gms_rec_count', true) !== false};
  await rcStart();
}
function edRecCancel() { rcClose(); edBar(); }
// pendant la prise : chrono + onde (appelé par la boucle de rcStart)
function edRecTick(sec, level) {
  const t = $('ed-rc-t'); if (t) t.textContent = Math.floor(sec/60) + ':' + String(sec % 60).padStart(2, '0');
  edLv.push(level); if (edLv.length > 200) edLv.splice(0, 100);
  const w = document.querySelector('#ed-recbar .ed-wave.live');
  if (w) { const v = edLv.slice(-ED_WAVE_N); [...w.children].forEach((b, k) => { b.style.height = Math.round(5 + 34*Math.min(1, v[k] || 0)) + 'px'; }); }
}

function rmChord(pi, ci) { draft.parts[pi].chords.splice(ci, 1); renderParts(); }

function initDnD(host) {
  host.querySelectorAll('.part-card').forEach(card => {
    const h = card.querySelector('.drag-handle'); if (!h) return;
    h.addEventListener('pointerdown', () => { card.draggable = true; });
    card.addEventListener('dragstart', e => { card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging'); card.draggable = false;
      const order = [...host.querySelectorAll('.part-card')].map(c => +c.dataset.i);
      draft.parts = order.map(i => draft.parts[i]);
      renderParts();
    });
  });
  host.ondragover = e => {
    e.preventDefault();
    const dragging = host.querySelector('.dragging'); if (!dragging) return;
    const after = [...host.querySelectorAll('.part-card:not(.dragging)')].reduce((closest, child) => {
      const b = child.getBoundingClientRect(), offset = e.clientY - b.top - b.height/2;
      return (offset < 0 && offset > closest.offset) ? {offset, el:child} : closest;
    }, {offset:-Infinity}).el;
    after ? host.insertBefore(dragging, after) : host.appendChild(dragging);
  };
}


/* ── Ajouter un accord (19/11) : un panneau monte du bas, on touche un accord, il se ferme
   et l'accord vole dans la ligne. Plus de champ texte pour les accords. ── */
function edCpSheet(gy) {
  let host = $('cp-sheet');
  if (!host) { host = document.createElement('div'); host.id = 'cp-sheet'; document.body.appendChild(host); }
  const open = cp.ed && curView === 'ed';
  host.classList.toggle('on', open);
  if (!open) { host.innerHTML = ''; return; }
  host.innerHTML = `<div class="cp-back" onclick="cpToggle('ed')"></div><div class="cp-sheet-in" role="dialog" aria-modal="true" aria-label="Ajouter un accord"><span class="cp-grab" aria-hidden="true"></span><h3>Touche un accord</h3>${cpHTML('ed')}</div>`;
  if (gy) host.querySelector('.cp-sheet-in').scrollTop = gy;
}
// l'accord ajouté arrive d'en bas, en tournant un peu, puis se pose
function edChordFly(pi) {
  const row = document.querySelectorAll('#parts-ed .ed-chs')[pi]; if (!row) return;
  const tiles = row.querySelectorAll('.ed-ct:not(.add)'), t = tiles[tiles.length - 1];
  if (!t || !t.animate || mReduced()) return;
  t.animate([{transform: 'translateY(240px) scale(.5) rotate(-14deg)', opacity: .2, background: 'var(--gold)'},
    {transform: 'translateY(-8px) scale(1.06) rotate(3deg)', opacity: 1, background: 'var(--gold)', offset: .7},
    {transform: 'none', opacity: 1}], {duration: 520, easing: 'cubic-bezier(.2,.9,.3,1.2)'});
}
function edAddChordFly(name) {
  const pi = Math.min(cp.pi, Math.max(0, draft.parts.length - 1));
  cp.ed = false; addChordLine(name); edChordFly(pi);
}
// « Souvent ensuite » : 3 accords qui suivent souvent le dernier, ajoutés d'un geste
const ED_NEXT = {G: ['D', 'C', 'Em'], C: ['G', 'F', 'Am'], D: ['G', 'A', 'Em'], Em: ['C', 'G', 'D'], Am: ['F', 'C', 'G'], F: ['C', 'G', 'Dm'],
  E: ['A', 'B7', 'C#m'], A: ['D', 'E', 'F#m'], Dm: ['G', 'C', 'Am'], Bm: ['G', 'A', 'D'], 'F#m': ['D', 'A', 'E'], B7: ['E', 'Em', 'A'],
  Em7: ['G', 'Dsus4', 'A7sus4'], Dsus4: ['A7sus4', 'Em7', 'G'], A7sus4: ['Em7', 'G', 'C'], Cadd9: ['G', 'D', 'Em']};
function renderQuickSugg() {
  const h = $('qc-sugg'); if (!h || !draft) return;
  const p = draft.parts[Math.min(cp.pi, draft.parts.length - 1)], last = p && p.chords.length ? p.chords[p.chords.length - 1].name : '';
  const base = last ? (ED_NEXT[last] || ED_NEXT[last.replace(/7|maj7|sus\d|add9/g, '')] || ['G', 'C', 'D']) : ['G', 'C', 'D', 'Em', 'Am'];
  const list = base.filter(n => n !== last).slice(0, last ? 3 : 5);
  h.innerHTML = `<span class="qc-lbl">${last ? 'Souvent ensuite' : 'Les plus joués'}</span>` + list.map(n => `<button type="button" onclick="edAddChordFly('${n}')">+ ${esc(n)}</button>`).join('');
}

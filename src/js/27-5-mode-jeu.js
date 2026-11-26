/* ═══════ MODE JEU (refonte du 18/11/2026) : au ▶ « Mode jeu », l'accord en cours en très grand,
   le suivant dessous, les cases du rythme qui s'allument, Médi qui danse sur le tempo.
   Le son est celui du rythme de la partie (guitare de l'app) ; sans rythme, rien ne défile. */
let mj = null;   // {i: partie jouée}
function mjOpen(i) {
  if (!cur) return;
  const parts = cur.parts || [];
  if (i == null) { const ok = q => q && q.chords.length && pHas(q); i = ok(parts[svPart]) && !svAll ? svPart : parts.findIndex(ok); if (i < 0) i = Math.max(0, parts.findIndex(q => q.chords.length)); }
  stopPlay();
  let el = $('mj');
  if (!el) { el = document.createElement('div'); el.id = 'mj'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Mode jeu'); document.body.appendChild(el); }
  mj = {i, on: false};
  el.classList.add('on'); document.body.classList.add('mj-on');
  mjRender(); mjShow(0, null);
  if (parts[i] && pHas(parts[i])) mjToggle();
}
function mjRender() {
  const p = cur.parts[mj.i], bpm = cur.bpm || 90, multi = cur.parts.length > 1;
  const meta = [multi ? (p.name || 'Partie ' + (mj.i + 1)) : '', cur.capo > 0 ? 'capo ' + cur.capo : ''].filter(Boolean).join(', ');
  $('mj').innerHTML = `<div class="mj-in" style="--beat:${(60 / bpm).toFixed(3)}s">
    <div class="mj-top">
      <button type="button" class="mj-x" onclick="mjClose()" aria-label="Quitter le mode jeu"><svg viewBox="0 0 16 16"><path d="M3 3 L13 13 M13 3 L3 13"/></svg></button>
      <div class="mj-t"><b>${esc(cur.title)}</b>${meta ? `<small>${esc(meta)}</small>` : ''}</div>
      ${mediSVG('contente', {size: 52, anim: 'dance', label: 'Médi danse sur le tempo'})}
      ${hasLyr(p) ? `<button type="button" class="mj-lyr${cur.showLyrics ? ' on' : ''}" onclick="mjLyrics()" aria-pressed="${!!cur.showLyrics}">Paroles</button>` : ''}
    </div>
    ${multi ? `<div class="mj-parts">${cur.parts.map((q, j) => `<button type="button" class="${j === mj.i ? 'on' : ''}" onclick="mjPart(${j})">${esc(q.name || 'Partie ' + (j + 1))}</button>`).join('')}</div>` : ''}
    <div class="mj-prog" id="mj-prog">${p.chords.map((c, j) => `<span data-j="${j}">${esc(c.name)}</span>`).join('')}</div>
    <div class="mj-now" id="mj-now"></div>
    ${hasLyr(p) && cur.showLyrics ? `<div class="mj-lyrics">${lyricsPreviewHTML(p.lyrics)}</div>` : ''}
    <div class="mj-rh" id="mj-rh">${pHas(p) ? svWayHTML(p, {chord: p.chords[0]}) : '<p class="mj-norh">Pas encore de rythme pour cette partie.</p>'}</div>
    <div class="mj-bar">
      <div class="mj-bpm"><button type="button" onclick="rhBpmStep(-1);mjBeat()" aria-label="Moins vite">−</button><span><b id="rh-bpm-mj">${bpm}</b><small>BPM</small></span><button type="button" onclick="rhBpmStep(1);mjBeat()" aria-label="Plus vite">+</button></div>
      <button type="button" class="mj-band${mjBandOn() ? ' on' : ''}" id="mj-band" onclick="mjBandToggle()" aria-pressed="${mjBandOn()}" aria-label="La bande joue avec toi"${pHas(p) ? '' : ' disabled'}>${BAND_MINI()}<span>Bande</span></button>
      <button type="button" class="mj-play" id="mj-play" onclick="mjToggle()"${pHas(p) ? '' : ' disabled'}></button>
    </div></div>`;
  mjSyncBtn();
}
function mjShow(ci, step) {
  const p = cur.parts[mj.i], n = p.chords.length; if (!n) { $('mj-now').innerHTML = ''; return; }
  ci = Math.max(0, ci) % n;
  if (mj.ci !== ci) {
    mj.ci = ci;
    const c = p.chords[ci], nx = p.chords[(ci + 1) % n];
    $('mj-now').innerHTML = `<div class="mj-big">${esc(c.name)}</div>${chordSVG(c, {size: 1.6})}${n > 1 ? `<div class="mj-next">ensuite <b>${esc(nx.name)}</b></div>` : ''}`;
    document.querySelectorAll('#mj-prog span').forEach(e => e.classList.toggle('on', +e.dataset.j === ci));
  }
  if (step != null && pHas(p)) $('mj-rh').innerHTML = svWayHTML(p, {cursor: step, chord: p.chords[ci]});
}
function mjOnStep(i, step, k, ci) { if (mj && i === mj.i && $('mj')) mjShow(ci < 0 ? 0 : ci, step); }
function mjToggle() {
  const p = cur.parts[mj.i]; if (!pHas(p)) return;
  if (rhPlaying('v' + mj.i)) { rhStop(); mj.on = false; } else { playPartRhythm(mj.i, mjBandOn()); mj.on = true; }
  mjSyncBtn();
}
// la bande remplace le clic en mode jeu si on l'allume (réglage retenu sur l'appareil, éteint par défaut)
const mjBandOn = () => LS.get('gms_mj_band', false) === true;
function mjBandToggle() {
  const on = !mjBandOn(); LS.set('gms_mj_band', on);
  const b = $('mj-band'); if (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }
  if (mj && rhPlaying('v' + mj.i)) { rhStop(); playPartRhythm(mj.i, on); mjSyncBtn(); }
}
function mjSyncBtn() {
  const b = $('mj-play'); if (!b) return;
  const on = mj && rhPlaying('v' + mj.i);
  b.innerHTML = (on ? RH_PAUSE_SVG : RH_PLAY_SVG) + (on ? 'Pause' : 'Jouer');
  $('mj').classList.toggle('playing', !!on);
}
function mjBeat() { const el = document.querySelector('#mj .mj-in'); if (el) el.style.setProperty('--beat', (60 / (cur.bpm || 90)).toFixed(3) + 's'); }
function mjPart(j) { const was = rhPlaying('v' + mj.i); stopPlay(); mj = {i: j}; mjRender(); mjShow(0, null); if (was) mjToggle(); }
function mjLyrics() { cur.showLyrics = !cur.showLyrics; const was = rhPlaying('v' + mj.i); mjRender(); mj.ci = -1; mjShow(0, null); mjSyncBtn(); if (was) mjSyncBtn(); }
function mjClose() { stopPlay(); mj = null; const el = $('mj'); if (el) el.classList.remove('on'); document.body.classList.remove('mj-on'); }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && mj) mjClose(); });

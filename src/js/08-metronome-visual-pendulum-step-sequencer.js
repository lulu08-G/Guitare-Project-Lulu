/* ═══════ METRONOME — visual pendulum + step-sequencer backing band ═══════
   Senior note: setInterval alone drifts (JS event loop jitter), which is
   unacceptable for something claiming to be a real metronome. This uses the
   standard Web Audio "lookahead scheduler" pattern: a cheap setTimeout tick
   scans ahead and books precise audio-clock times, while a matched setTimeout
   fires the *visual* update at the wall-clock delay to that same instant —
   audio timing stays sample-accurate, visuals stay close enough to be felt
   as in-sync. The metronome deliberately keeps running when you leave this
   tab: it's meant to double as a backing loop while you look at a chord
   sheet elsewhere, which is the whole point of "mode impro". */
const METRO_SIGS = {
  '4/4': {beats:4, sub:4},
  '3/4': {beats:3, sub:4},
  '2/4': {beats:2, sub:4},
  '6/8': {beats:6, sub:2},
};
const METRO_PRESETS = {
  rock:   {name:'Rock', base:[
    {k:1,s:0,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},
    {k:0,s:1,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},
    {k:1,s:0,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},
    {k:0,s:1,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0}]},
  pop:    {name:'Pop', base:[
    {k:1,s:0,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1},{k:1,s:0,h:1},
    {k:0,s:1,h:1},{k:0,s:0,h:1},{k:1,s:0,h:1},{k:0,s:0,h:1},
    {k:1,s:0,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1},{k:1,s:0,h:1},
    {k:0,s:1,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1}]},
  reggae: {name:'Reggae (offbeat)', base:[
    {k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},
    {k:0,s:0,h:0},{k:0,s:0,h:1},{k:1,s:1,h:0},{k:0,s:0,h:1},
    {k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},
    {k:0,s:0,h:0},{k:0,s:0,h:1},{k:1,s:1,h:0},{k:0,s:0,h:1}]},
  valse:  {name:'Valse', base:[
    {k:1,s:0,h:0},{k:0,s:0,h:0},{k:0,s:0,h:0},{k:0,s:0,h:0},
    {k:0,s:1,h:1},{k:0,s:0,h:0},{k:0,s:0,h:0},{k:0,s:0,h:0},
    {k:0,s:1,h:1},{k:0,s:0,h:0},{k:0,s:0,h:0},{k:0,s:0,h:0}]},
  shuffle:{name:'Shuffle', base:[
    {k:1,s:0,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},
    {k:0,s:1,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:1,s:0,h:0},
    {k:1,s:0,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0},
    {k:0,s:1,h:1},{k:0,s:0,h:0},{k:0,s:0,h:1},{k:0,s:0,h:0}]},
  funk:   {name:'Funk', base:[
    {k:1,s:0,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1},{k:1,s:0,h:1},
    {k:0,s:1,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1},{k:0,s:0,h:1},
    {k:0,s:0,h:1},{k:1,s:0,h:1},{k:0,s:0,h:1},{k:1,s:0,h:1},
    {k:0,s:1,h:1},{k:0,s:0,h:1},{k:1,s:0,h:1},{k:0,s:0,h:1}]},
};
let metroState = {
  bpm: 100, sig: '4/4', preset: 'rock', improMode: false, bassString: 0,
  layers: {click:true, kick:false, snare:false, hihat:false, bass:false},
  pattern: null, sigCfg: METRO_SIGS['4/4'], gap: null,
};
let metroStepTotal = 0;
let metroPlaying = false, metroTimerId = null, metroCtxRef = null, metroNextTime = 0, metroStepIdx = 0;
let metroTapTimes = [];

function buildMetroPattern() {
  const sigCfg = METRO_SIGS[metroState.sig];
  const total = sigCfg.beats * sigCfg.sub;
  const preset = METRO_PRESETS[metroState.preset] || METRO_PRESETS.rock;
  const steps = [];
  for (let i = 0; i < total; i++) {
    const b = preset.base[i % preset.base.length];
    steps.push({k: !!b.k, s: !!b.s, h: !!b.h, b: b.b != null ? !!b.b : !!b.k}); // b : notes de Basile (par défaut sur la grosse caisse)
  }
  metroState.pattern = steps; metroState.custom = false;
  metroState.sigCfg = sigCfg;
}

/* ── sound synthesis (all synthetic, no samples) ── */
function metroClick(t, accent) {
  const ac = audio(), o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = accent ? 1600 : 1000;
  g.gain.setValueAtTime(accent ? .17 : .09, t);
  g.gain.exponentialRampToValueAtTime(.0001, t + 0.045);
  o.connect(g); g.connect(OUT(ac)); o.start(t); o.stop(t + 0.05);
}
function metroKick(t) {
  const ac = audio(), o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(.9, t);
  g.gain.exponentialRampToValueAtTime(.001, t + 0.28);
  o.connect(g); g.connect(OUT(ac)); o.start(t); o.stop(t + 0.3);
}
function metroSnare(t) {
  const ac = audio(), n = Math.floor(ac.sampleRate * 0.18);
  const buf = ac.createBuffer(1, n, ac.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/n, 2);
  const src = ac.createBufferSource(); src.buffer = buf;
  const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = .7;
  const g = ac.createGain(); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .18);
  src.connect(bp); bp.connect(g); g.connect(OUT(ac)); src.start(t); src.stop(t + .2);
  const o = ac.createOscillator(), g2 = ac.createGain();
  o.type = 'triangle'; o.frequency.value = 180;
  g2.gain.setValueAtTime(.22, t); g2.gain.exponentialRampToValueAtTime(.001, t + .08);
  o.connect(g2); g2.connect(OUT(ac)); o.start(t); o.stop(t + .09);
}
function metroHihat(t) {
  const ac = audio(), dur = 0.05, n = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/n, 1.4);
  const src = ac.createBufferSource(); src.buffer = buf;
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
  const g = ac.createGain(); g.gain.setValueAtTime(.26, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  src.connect(hp); hp.connect(g); g.connect(OUT(ac)); src.start(t); src.stop(t + dur + .02);
}
function metroBass(t) { pluck(fretFreq(metroState.bassString, 0, 0)/2, t, 0.7, .16); }

/* ── scheduler ── */
function toggleMetro() { metroPlaying ? stopMetro() : startMetro(); }
function startMetro() {
  if (!metroState.pattern) buildMetroPattern();
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  metroCtxRef = ac; metroStepIdx = 0; metroStepTotal = 0; metroNextTime = ac.currentTime + 0.05;
  metroPlaying = true;
  metroRenderToggleBtn();
  metroSchedulerTick();
}
function stopMetro() {
  metroPlaying = false;
  if (metroTimerId) clearTimeout(metroTimerId);
  metroTimerId = null;
  metroRenderToggleBtn();
  document.querySelectorAll('#v-metro .mtg-c.now').forEach(e => e.classList.remove('now'));
}
function metroRenderToggleBtn() {
  const b = $('metro-toggle'); if (!b) return;
  const band = metroState.improMode;
  b.innerHTML = metroPlaying
    ? '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>Stop'
    : '<svg viewBox="0 0 24 24"><path d="M8 5.2v13.6a.6.6 0 00.92.5l10.6-6.8a.6.6 0 000-1L8.92 4.7A.6.6 0 008 5.2z" fill="currentColor"/></svg>' + (band ? 'Lancer la bande' : 'Jouer');
  b.classList.toggle('on', metroPlaying);
  b.setAttribute('aria-label', metroPlaying ? 'Arrêter' : band ? 'Lancer la bande' : 'Démarrer le métronome');
  const st = $('mt-stage'); if (st) st.classList.toggle('playing', metroPlaying);
  const v = $('v-metro'); if (v) v.classList.toggle('playing', metroPlaying);
  if (band) renderMetroBand();
  if (metroPlaying) { if (!metroRaf) metroRaf = requestAnimationFrame(metroVisLoop); }
  else { metroVis = []; metroDialReset(); document.querySelectorAll('#v-metro .mt-beats i.on,#v-metro .mtg-c.now').forEach(e => e.classList.remove('on', 'now')); }
}
function metroSchedulerTick() {
  if (!metroPlaying) return;
  while (metroNextTime < metroCtxRef.currentTime + 0.12) {
    scheduleMetroStep(metroStepIdx, metroNextTime, metroStepTotal++);
    const stepDur = (60 / metroState.bpm) / metroState.sigCfg.sub;
    metroNextTime += stepDur;
    metroStepIdx = (metroStepIdx + 1) % metroState.pattern.length;
  }
  metroTimerId = setTimeout(metroSchedulerTick, 25);
}
function scheduleMetroStep(step, time, total) {
  const st = metroState, sig = st.sigCfg, p = st.pattern[step];
  const isBeatStart = step % sig.sub === 0;
  const beatIdx = Math.floor(step / sig.sub);
  const accent = isBeatStart && beatIdx === 0;
  // gap click: the metronome falls silent for some bars so you keep time alone
  const bar = Math.floor((total || 0) / st.pattern.length);
  metroVis.push({t: time, step, d: (60 / st.bpm) / sig.sub}); if (metroVis.length > 64) metroVis.shift();
  const muted = !!st.gap && (bar % (st.gap.on + st.gap.off)) >= st.gap.on;
  if (st.gap && step === 0) setTimeout(() => {
    document.querySelectorAll('#gap-bars .gb').forEach((e, i) => e.classList.toggle('now', i === bar % (st.gap.on + st.gap.off)));
  }, Math.max(0, (time - metroCtxRef.currentTime) * 1000));
  if (muted) return;
  if (st.layers.click && isBeatStart) metroClick(time, accent);
  if (st.layers.kick && p.k) metroKick(time);
  if (st.layers.snare && p.s) metroSnare(time);
  if (st.layers.hihat && p.h) metroHihat(time);
  if (st.layers.bass && p.b) metroBass(time);
  const delay = Math.max(0, (time - metroCtxRef.currentTime) * 1000);
  setTimeout(() => {
    flashMetroStep(step);
    if (isBeatStart) flashMetroBeat(beatIdx, accent, 60 / st.bpm);
    metroBandHit(p, (60 / st.bpm) / sig.sub);
  }, delay);
}
function flashMetroStep(step) {
  document.querySelectorAll('#v-metro .mtg-c.now').forEach(e => e.classList.remove('now'));
  document.querySelectorAll(`#v-metro .mtg-c[data-i="${step}"]`).forEach(e => e.classList.add('now'));
}
// un saut calé sur le son (Médi sur les temps, Boum et Basile sur leurs coups)
function metroBump(el, h, ms, sq) {
  if (!el || !el.animate || mReduced()) return;
  el.animate([{transform: `translateY(0) scale(${1 + sq},${1 - sq})`}, {transform: `translateY(${-h}px) scale(.97,1.04)`, offset: .4}, {transform: 'none'}],
    {duration: ms, easing: 'cubic-bezier(.3,.7,.4,1)'});
}
function metroBandHit(p, stepSec) {
  if (!metroState.improMode) return;
  const L = metroState.layers, ms = Math.max(140, Math.min(380, stepSec * 1800));
  if ((L.kick && p.k) || (L.snare && p.s)) metroBump(document.querySelector('#mt-floor .boum .pv'), p.s ? 16 : 9, ms, p.k ? .14 : .06);
  if (L.bass && p.b) metroBump(document.querySelector('#mt-floor .basile .pv'), 10, ms, .1);
}
function flashMetroBeat(beatIdx, accent, beatDurSec) {
  document.querySelectorAll('#mt-svg .mt-arc').forEach((a, i) => a.classList.toggle('done', i < beatIdx));
  document.querySelectorAll('#mt-svg .mt-mark').forEach((m, i) => { m.classList.remove('hit'); if (i === beatIdx) { void m.getBoundingClientRect(); m.classList.add('hit'); } });
  document.querySelectorAll('#mt-svg .mt-num').forEach((n, i) => n.classList.toggle('on', i === beatIdx));
  document.querySelectorAll('#v-metro .mt-beats i').forEach((d, i) => { d.classList.toggle('on', i === beatIdx); });
  document.querySelectorAll('#mt-medi .mv, #mt-floor .lead .mv').forEach(m => metroBump(m, accent ? 26 : 16, Math.min(420, beatDurSec * 900), accent ? .16 : .1));
  const core = $('mt-core');
  if (core && core.animate && !mReduced()) core.animate(
    [{transform: `scale(${accent ? 1.075 : 1.04})`}, {transform: 'scale(1)'}],
    {duration: Math.min(320, beatDurSec * 700), easing: 'cubic-bezier(.22,.8,.3,1)'});
}
/* le point lumineux fait le tour du cadran en une mesure, calé sur l'horloge audio */
let metroVis = [], metroRaf = null;
function metroVisLoop() {
  metroRaf = null;
  if (!metroPlaying || !metroCtxRef) return;
  const orb = $('mt-orb');
  if (orb && $('v-metro').classList.contains('on')) {
    const now = metroCtxRef.currentTime;
    while (metroVis.length > 1 && metroVis[1].t <= now) metroVis.shift();
    const cur = metroVis[0];
    if (cur && cur.t <= now) {
      const nx = metroVis[1], dur = nx ? nx.t - cur.t : cur.d, f = Math.min(1, (now - cur.t) / (dur || 1));
      orb.style.transform = `rotate(${((cur.step + f) / metroState.pattern.length) * 360}deg)`;
    }
  }
  metroRaf = requestAnimationFrame(metroVisLoop);
}
function metroDialReset() {
  document.querySelectorAll('#mt-svg .mt-arc,#mt-svg .mt-num,#mt-svg .mt-mark').forEach(a => a.classList.remove('on', 'done', 'hit'));
  const orb = $('mt-orb'); if (orb) orb.style.transform = 'rotate(0deg)';
}
/* ── controls ── */
const METRO_TEMPI = [[60,'Largo'],[76,'Adagio'],[108,'Andante'],[120,'Moderato'],[156,'Allegro'],[176,'Vivace'],[999,'Presto']];
function metroPaintBpm() {
  const v = metroState.bpm, r = $('metro-bpm-range');
  if ($('mt-bpm')) $('mt-bpm').textContent = v;
  document.querySelectorAll('#v-metro [data-bpm]').forEach(e => e.textContent = v);
  const vm = $('v-metro'); if (vm) vm.style.setProperty('--beat', (60 / v).toFixed(3) + 's');
  if ($('mt-name')) $('mt-name').textContent = METRO_TEMPI.find(([m]) => v < m)[1];
  if (r) { r.value = v; r.style.setProperty('--p', ((v - 30) / 250 * 100) + '%'); r.setAttribute('aria-valuetext', v + ' battements par minute'); }
}
function metroSetBpm(v) { metroState.bpm = Math.max(30, Math.min(280, Math.round(+v) || 100)); metroPaintBpm(); }
function metroSetBpmFromRange(v) { metroSetBpm(v); }
function metroBpmStep(d) { metroSetBpm(metroState.bpm + d); }
function metroHold(d) {   // appui long sur − / + : répétition accélérée (relâcher = clearBpmHold, écouté sur window)
  clearBpmHold(); metroBpmStep(d);
  let n = 0;
  bpmHT = setTimeout(function rep() { metroBpmStep(d * (++n > 12 ? 5 : 1)); bpmHT = setTimeout(rep, n > 12 ? 90 : 110); }, 450);
}
function metroTapTempo() {
  const now = performance.now();
  metroTapTimes = metroTapTimes.filter(t => now - t < 3000); metroTapTimes.push(now);
  const core = $('mt-core');
  if (core && core.animate && !mReduced()) core.animate([{transform: 'scale(.965)'}, {transform: 'scale(1)'}], {duration: 180, easing: 'cubic-bezier(.22,.8,.3,1)'});
  if (metroTapTimes.length >= 2) {
    const gaps = metroTapTimes.slice(1).map((t,i) => t - metroTapTimes[i]);
    metroSetBpm(60000 / (gaps.reduce((a,b) => a+b, 0) / gaps.length));
  }
}
function metroChangeSig(sig) { metroState.sig = sig; buildMetroPattern(); metroVis = []; renderMetroLights(); renderMetroGrid(); }
function metroSelectPreset(key) { metroState.preset = key; buildMetroPattern(); renderMetroPresetSelect(); renderMetroGrid(); }
function metroToggleCell(i, key) { metroState.pattern[i][key] = !metroState.pattern[i][key]; renderMetroGrid(); }
function metroToggleLayer(key) { metroState.layers[key] = !metroState.layers[key]; renderMetroLayerButtons(); renderMetroGrid(); }
function metroSetImpro(on) {
  metroState.improMode = on;
  metroState.layers = on
    ? {click:false, kick:true, snare:true, hihat:true, bass:true}
    : {click:true, kick:false, snare:false, hihat:false, bass:false};
  const v = $('v-metro'); if (v) v.classList.toggle('band', on);
  renderMetroLayerButtons(); renderMetroGrid(); metroRenderToggleBtn(); window.scrollTo(0, 0);
}
function metroChangeBassString(i) { metroState.bassString = +i; renderMetroBand(); }

/* ── rendering ── */
function renderMetroLights() {   // le cadran : un arc par temps, des repères par subdivision, un point qui tourne
  const svg = $('mt-svg'); if (!svg) return;
  const N = metroState.sigCfg.beats, total = metroState.pattern.length, R = 134, gap = N > 4 ? 5 : 7;
  const pt = (deg, r) => { const a = (deg - 90) * Math.PI / 180; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)]; };
  let h = '', marks = '';
  for (let i = 0; i < N; i++) {
    const a0 = i * 360 / N + gap / 2, a1 = (i + 1) * 360 / N - gap / 2, [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
    h += `<path class="mt-arc${i === 0 ? ' first' : ''}" d="M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}"/>`;
    const [mx, my] = pt(i * 360 / N, R), [nx, ny] = pt(i * 360 / N, R - 26);
    marks += `<circle class="mt-mark${i === 0 ? ' first' : ''}" cx="${mx.toFixed(2)}" cy="${my.toFixed(2)}" r="${i === 0 ? 8 : 6.5}"/>`;
    h += `<text class="mt-num" x="${nx.toFixed(1)}" y="${ny.toFixed(1)}">${i + 1}</text>`;
  }
  for (let k = 0; k < total; k++) { const b = k % metroState.sigCfg.sub === 0, [x, y] = pt(k * 360 / total, R + 13); h += `<circle class="mt-tick${b ? ' b' : ''}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${b ? 2.6 : 1.5}"/>`; }
  h += marks + `<g id="mt-orb"><circle cx="150" cy="${150 - R}" r="5"/></g>`;
  svg.innerHTML = h;
  const beats = Array.from({length: N}, (_, i) => `<i class="${i ? '' : 'a'}">${i + 1}</i>`).join('');
  ['mt-dots', 'mt-beats-b'].forEach(id => { const dt = $(id); if (dt) dt.innerHTML = beats; });
  const sg = $('mt-sigs'); if (sg) sg.innerHTML = Object.keys(METRO_SIGS).sort().map(k => `<button type="button" class="${metroState.sig === k ? 'on' : ''}" aria-pressed="${metroState.sig === k}" onclick="metroChangeSig('${k}')">${k}</button>`).join('');
}
// le motif de la bande : Boum (rien → grosse caisse → caisse claire) et Basile (note ou rien), une case par double-croche
function renderMetroGrid() {
  const host = $('metro-grid-host'); if (!host || !metroState.pattern) return;
  const pat = metroState.pattern, sub = metroState.sigCfg.sub, total = pat.length;
  const per = total > 8 ? total / 2 : total, SUBN = sub === 4 ? ['', 'e', 'et', 'a'] : ['', 'et'];
  let h = '';
  for (let a = 0; a < total; a += per) {
    const idx = Array.from({length: per}, (_, j) => a + j), bt = i => i % sub ? '' : ' bt';
    h += `<div class="mtg" style="--n:${per}"><span></span>${idx.map(i => `<span class="mtg-h${bt(i)}">${i % sub ? SUBN[i % sub] : i / sub + 1}</span>`).join('')}`
      + `<span class="mtg-l boum">Boum</span>${idx.map(i => { const p = pat[i], v = p.k ? 'k' : p.s ? 's' : ''; return `<button type="button" class="mtg-c d ${v}${bt(i)}" data-i="${i}" aria-label="Boum, case ${i + 1} : ${v === 'k' ? 'grosse caisse' : v === 's' ? 'caisse claire' : 'rien'}" onclick="metroDrumCycle(${i})"><i></i></button>`; }).join('')}`
      + `<span class="mtg-l basile">Basile</span>${idx.map(i => `<button type="button" class="mtg-c b${pat[i].b ? ' on' : ''}${bt(i)}" data-i="${i}" aria-pressed="${pat[i].b}" aria-label="Basile, case ${i + 1}" onclick="metroBassCell(${i})"><i></i></button>`).join('')}</div>`;
  }
  host.innerHTML = h;
}
function metroDrumCycle(i) {
  const p = metroState.pattern[i];
  if (p.k) { p.k = false; p.s = true; } else if (p.s) p.s = false; else p.k = true;
  metroState.custom = true; renderMetroPresetSelect(); renderMetroGrid();
  if (!metroPlaying && (p.k || p.s)) { const t = audio().currentTime + .01; p.k ? metroKick(t) : metroSnare(t); metroState.improMode && metroBandHit({k: p.k, s: p.s}, .15); }
}
function metroBassCell(i) {
  const p = metroState.pattern[i]; p.b = !p.b;
  metroState.custom = true; renderMetroPresetSelect(); renderMetroGrid();
  if (!metroPlaying && p.b) { metroBass(audio().currentTime + .01); metroBandHit({b: true}, .15); }
}
function renderMetroPresetSelect() {
  const h = $('mt-styles'); if (!h) return;
  h.innerHTML = Object.entries(METRO_PRESETS).map(([k,v]) =>
    `<button type="button" class="${metroState.preset===k&&!metroState.custom?'on':''}" aria-pressed="${metroState.preset===k&&!metroState.custom}" onclick="metroSelectPreset('${k}')">${v.name.replace(/ \(.*\)/, '')}</button>`).join('')
    + (metroState.custom ? '<button type="button" class="on" aria-pressed="true" disabled>Le mien</button>' : '');
}
function renderMetroLayerButtons() {
  const defs = [['click','Clic'],['kick','Grosse caisse'],['snare','Caisse claire'],['hihat','Charleston'],['bass','Basse']];
  $('metro-layers').innerHTML = defs.map(([k,l]) =>
    `<button type="button" class="${metroState.layers[k]?'on':''}" aria-pressed="${!!metroState.layers[k]}" onclick="metroToggleLayer('${k}')">${l}</button>`).join('');
  $('metro-mode-simple').classList.toggle('on', !metroState.improMode);
  $('metro-mode-impro').classList.toggle('on', metroState.improMode);
  $('mt-band').style.display = metroState.improMode ? '' : 'none';
  renderMetroBand();
  $('metro-bass-row').style.display = metroState.layers.bass ? '' : 'none';
}
function renderMetroBassSelect() {
  $('metro-bass-note').innerHTML = STRINGS.map((n,i) =>
    `<option value="${i}" ${metroState.bassString===i?'selected':''}>${n} — ${STRING_LABELS_FULL[i]}</option>`).join('');
}
// La bande : Boum (batterie) et Basile (basse) ; les toucher les fait taire ou revenir
const BOUM_SVG = (on, cls) => `<svg class="mt-pal ${cls || ''}" viewBox="0 0 200 200" aria-hidden="true"><g class="pv"><rect x="24" y="56" width="152" height="128" rx="30" fill="#8b95ff"/><ellipse cx="100" cy="58" rx="76" ry="22" fill="#c9ceff"/>${on ? '<rect x="70" y="96" width="18" height="36" rx="9" fill="#1a0d02"/><rect x="112" y="96" width="18" height="36" rx="9" fill="#1a0d02"/>' : '<path d="M70 116 H88 M112 116 H130" stroke="#1a0d02" stroke-width="8" stroke-linecap="round"/>'}</g></svg>`;
const BASILE_SVG = (on, cls) => `<svg class="mt-pal ${cls || ''}" viewBox="20 0 160 250" aria-hidden="true"><g class="pv"><circle cx="52" cy="62" r="11" fill="#2f9e8a"/><circle cx="148" cy="62" r="11" fill="#2f9e8a"/><rect x="52" y="30" width="96" height="210" rx="48" fill="#45cbb2"/>${on ? '<rect x="74" y="92" width="18" height="36" rx="9" fill="#1a0d02"/><rect x="108" y="92" width="18" height="36" rx="9" fill="#1a0d02"/>' : '<path d="M74 112 H92 M108 112 H126" stroke="#1a0d02" stroke-width="8" stroke-linecap="round"/>'}</g></svg>`;
function metroBandToggle(who) {
  const L = metroState.layers;
  if (who === 'boum') { const on = !(L.kick || L.snare || L.hihat); L.kick = L.snare = L.hihat = on; }
  else L.bass = !L.bass;
  renderMetroGrid(); renderMetroBand();
}
function renderMetroBand() {
  const fl = $('mt-floor'); if (!fl) return;
  const L = metroState.layers, boum = !!(L.kick || L.snare || L.hihat), basile = !!L.bass;
  fl.innerHTML = `<button type="button" class="mt-mate${boum ? '' : ' off'}" aria-pressed="${boum}" aria-label="Boum, la batterie" onclick="metroBandToggle('boum')">${BOUM_SVG(boum, 'boum')}<b>Boum</b><small>${boum ? 'batterie' : 'se tait'}</small></button>
    <div class="mt-mate lead">${mediSVG('contente', {size: 110, anim: 'still', label: 'Médi compte les temps'})}<b>Médi</b><small>les temps</small></div>
    <button type="button" class="mt-mate${basile ? '' : ' off'}" aria-pressed="${basile}" aria-label="Basile, la basse" onclick="metroBandToggle('basile')">${BASILE_SVG(basile, 'basile')}<b>Basile</b><small>${basile ? 'basse' : 'se tait'}</small></button>`;
  const bb = $('mt-bb'); if (bb) bb.textContent = !metroPlaying ? 'J’ai appelé Boum et Basile. Lance la bande et joue par-dessus.' : !boum && !basile ? 'Plus personne ne joue. Rappelle Boum ou Basile.' : 'Je compte les temps, eux dansent sur leurs coups. Touche un pote pour le faire taire.';
  const bc = $('mt-bass-chips'); if (bc) bc.innerHTML = ['Mi', 'La', 'Ré', 'Sol'].map((n, i) => `<button type="button" class="${metroState.bassString === i ? 'on' : ''}" aria-pressed="${metroState.bassString === i}" onclick="metroChangeBassString(${i})">${n}</button>`).join('');
  const mm = $('mt-mates'); if (mm && !mm.innerHTML) mm.innerHTML = BOUM_SVG(true) + BASILE_SVG(true);
}
function renderMetroAll() {
  { const m = $('mt-medi'); if (m && !m.innerHTML) m.innerHTML = mediSVG('neutre', {size: 110, anim: 'still', label: 'Médi saute sur chaque temps'}); }
  if (!metroState.pattern) buildMetroPattern();
  renderMetroPresetSelect(); renderMetroLights(); renderMetroGrid();
  renderMetroLayerButtons(); renderMetroBassSelect(); metroRenderToggleBtn(); metroPaintBpm();
}

/* ═══════ LABO : LE SON DE TES PRISES (27/11, caché : ?beta) ═══════
   Lucas : « un son qui est bien sur les réseaux, sans abuser, plutôt que brut ». 1er test du Labo (carte en haut de son accueil).
   Toutes les prises de l'appli (rythmes des fiches, autres prises du rythme, Mes prises audio et vidéo), écoutées brutes ou traitées.
   La chaîne (Web Audio, en direct) : passe-haut (le grondement), −3 dB vers 320 Hz (le « carton » du micro de téléphone),
   présence vers 3,5 kHz et air au-dessus de 9,5 kHz (la clarté), compresseur doux (les écarts tassés), une petite salle
   (réverbe courte générée, en stéréo), puis le volume et un limiteur. Trois doses : Léger · Réseaux · Plus de salle.
   Comparaison honnête : la prise est mesurée (et passée dans la chaîne hors ligne), brut et traité jouent au même volume
   (celui des réseaux, ≈ −14 LUFS, ou moins si le brut saturerait). Les deux jouent en même temps : on passe de l'un à l'autre sans couper. */
const LAB_TESTS27 = [{id: 'l27-son', t: 'Le son de tes prises', d: 'Brut ou traité, au même volume : laquelle tu posterais ?', ask: ['Brut', 'Léger', 'Réseaux', 'Plus de salle'], askq: 'Laquelle tu posterais ?'}];
const LSN_DOSE = {
  leger: {l: 'Léger', hp: 70, mud: -2, pres: 1.5, air: 2, thr: -22, ratio: 2, rev: .08, len: 1.1},
  reseaux: {l: 'Réseaux', hp: 80, mud: -3, pres: 2.5, air: 3, thr: -26, ratio: 3, rev: .15, len: 1.4},
  salle: {l: 'Plus de salle', hp: 80, mud: -3.5, pres: 2, air: 3.5, thr: -26, ratio: 3, rev: .3, len: 2.1}
};
const LSN_TARGET = -16;   // volume efficace visé (dBFS), à peu près celui des réseaux
const LSN = {sel: null, mode: 'wet', dose: 'reseaux', meas: {}, P: null, raf: 0, tok: 0};
const lsnDb = g => 20 * Math.log10(Math.max(1e-6, g)), lsnG = db => Math.pow(10, db / 20), lsnClamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ── toutes les prises de l'appli ── */
function lsnTakes() {
  const out = [], seen = new Set();
  const add = o => { if (!o.mid || seen.has(o.mid)) return; seen.add(o.mid); out.push(o); };
  (sheets || []).forEach(s => {
    const st = s.title || 'Sans titre';
    (s.parts || []).forEach((p, i) => {
      const pn = (s.parts.length > 1 && (p.name || 'partie ' + (i + 1))) || '';
      [p.rec, ...(p.recAlt || [])].filter(Boolean).forEach((t, k) => add({mid: t.mediaId, kind: 'audio', name: t.name || (k ? 'Prise ' + (k + 1) : 'Ma prise'),
        what: 'Rythme' + (pn ? ' · ' + pn : ''), sheet: st, a: t.start || 0, b: t.end || 0, dur: Math.max(0, (t.end || t.dur || 0) - (t.start || 0)), at: t.at || 0}));
    });
    (s.media || []).forEach(m => { if (m.kind === 'audio' || m.kind === 'video') add({mid: m.mediaId, kind: m.kind, name: m.name || (m.kind === 'video' ? 'Ma vidéo' : 'Mon audio'),
      what: m.kind === 'video' ? 'Vidéo' : 'Audio', sheet: st, a: 0, b: 0, dur: m.dur || 0, at: m.at || 0}); });
  });
  return out.sort((x, y) => (y.at || 0) - (x.at || 0));
}
const lsnCur = () => lsnTakes().find(t => t.mid === LSN.sel);

/* ── la chaîne ── */
function lsnRand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; }; }
function lsnIR(ac, len) {   // une petite salle : bruit qui s'éteint et s'assombrit, gauche et droite différents (de la largeur)
  const sr = ac.sampleRate, n = Math.floor(sr * len), b = ac.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c), r = lsnRand(7 + c * 101); let lp = 0;
    for (let i = 0; i < n; i++) { const x = i / n; lp += (r() - lp) * (.7 - .5 * x); d[i] = lp * Math.pow(1 - x, 2.2) * Math.exp(-3 * x); }
    [.011, .017, .023, .031].forEach((t, k) => { const j = Math.floor((t + c * .003) * sr); if (j < n) d[j] += (k % 2 ? -.5 : .6) * (1 - k * .15); });   // premières réflexions
  }
  return b;
}
function lsnChain(ac, D, lim) {
  const f = (type, fr, q, g) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = fr; if (q != null) n.Q.value = q; if (g != null) n.gain.value = g; return n; };
  const inp = ac.createGain(), hp = f('highpass', D.hp, .7), mud = f('peaking', 320, 1, D.mud), pres = f('peaking', 3500, .8, D.pres), air = f('highshelf', 9500, null, D.air);
  const cmp = ac.createDynamicsCompressor();
  cmp.threshold.value = D.thr; cmp.knee.value = 10; cmp.ratio.value = D.ratio; cmp.attack.value = .015; cmp.release.value = .25;
  const pre = ac.createDelay(.1); pre.delayTime.value = .02;
  const cv = ac.createConvolver(); cv.buffer = lsnIR(ac, D.len);
  const wet = ac.createGain(); wet.gain.value = D.rev;
  const sum = ac.createGain(), mk = ac.createGain();
  inp.connect(hp); hp.connect(mud); mud.connect(pres); pres.connect(air); air.connect(cmp);
  cmp.connect(sum); cmp.connect(pre); pre.connect(cv); cv.connect(wet); wet.connect(sum); sum.connect(mk);
  let out = mk;
  if (lim) { const L = ac.createDynamicsCompressor(); L.threshold.value = -2; L.knee.value = 0; L.ratio.value = 20; L.attack.value = .002; L.release.value = .1; mk.connect(L); out = L; }
  return {inp, out, mk};
}
// le volume efficace d'un passage (blocs de 0,4 s, on oublie les silences : comme les mesures des réseaux)
function lsnLoud(buf, a, b) {
  const sr = buf.sampleRate, i0 = Math.floor((a || 0) * sr), i1 = Math.min(buf.length, Math.floor((b || buf.duration) * sr)), blk = Math.floor(sr * .4), hop = Math.floor(blk / 4);
  const ch = []; for (let c = 0; c < buf.numberOfChannels; c++) ch.push(buf.getChannelData(c));
  const E = [];
  for (let s = i0; s + blk <= i1; s += hop) { let e = 0; for (const d of ch) for (let i = s; i < s + blk; i += 2) e += d[i] * d[i]; E.push(e / (blk / 2) / ch.length); }
  const g1 = E.filter(e => e > 1e-7); if (!g1.length) return -60;
  const m = g1.reduce((x, y) => x + y, 0) / g1.length, g2 = g1.filter(e => e > m * .1);
  return 10 * Math.log10(g2.reduce((x, y) => x + y, 0) / g2.length);
}
function lsnPeak(buf, a, b) {
  const sr = buf.sampleRate, i0 = Math.floor((a || 0) * sr), i1 = Math.min(buf.length, Math.floor((b || buf.duration) * sr)); let m = 0;
  for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = i0; i < i1; i++) { const x = d[i] < 0 ? -d[i] : d[i]; if (x > m) m = x; } }
  return m;
}
function lsnRms(buf, a, b, n) {   // une barre par morceau du passage, à l'échelle réelle
  const sr = buf.sampleRate, d = buf.getChannelData(0), i0 = Math.floor((a || 0) * sr), i1 = Math.min(d.length, Math.floor((b || buf.duration) * sr)), st = Math.max(1, Math.floor((i1 - i0) / n)), out = [];
  for (let k = 0; k < n; k++) { let e = 0, c = 0; for (let j = i0 + k * st, z = Math.min(i1, j + st); j < z; j += 3) { e += d[j] * d[j]; c++; } out.push(c ? Math.sqrt(e / c) : 0); }
  return out;
}
// mesure de la prise + passage dans la chaîne hors ligne (une fois par prise et par dose)
async function lsnMeasure(T, dose) {
  const key = T.mid + '|' + dose; if (LSN.meas[key]) return LSN.meas[key];
  let buf = null; try { buf = await recBuffer(T.mid); } catch (e) {}
  if (!buf) return (LSN.meas[key] = {ok: false, g0: lsnG(10), mk: 1, dry: 1});
  const a = Math.min(T.a || 0, buf.duration), b = Math.min(T.b || buf.duration, buf.duration);
  const Lr = lsnLoud(buf, a, b), pk = lsnPeak(buf, a, Math.min(b, a + 240)), g0 = lsnG(lsnClamp(-20 - Lr, -12, 30));
  const e = Math.min(b, a + 90), sr = buf.sampleRate, oc = new OfflineAudioContext(2, Math.max(1, Math.floor((e - a) * sr)), sr), src = oc.createBufferSource();
  src.buffer = buf; const C = lsnChain(oc, LSN_DOSE[dose], false); C.inp.gain.value = g0; src.connect(C.inp); C.out.connect(oc.destination); src.start(0, a, e - a);
  const r = await oc.startRendering(), Lp = lsnLoud(r, 0, r.duration);
  const Lm = Math.min(LSN_TARGET, Lr + lsnDb(lsnG(-1) / Math.max(1e-4, pk)));   // le brut ne doit pas saturer : sinon les deux descendent
  return (LSN.meas[key] = {ok: true, g0, mk: lsnG(lsnClamp(Lm - Lp, -12, 30)), dry: lsnG(lsnClamp(Lm - Lr, -20, 30)), buf, wet: r, a, b, Lm});
}

/* ── l'écran ── */
const LSN_I = {
  audio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>',
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5 21 8v8l-5-2.5"/></svg>'
};
function lsnCardHTML() {   // la carte en haut de la 1re page du Labo
  const done = !!labAns()['l27-son'];
  return `<button type="button" class="lsn-card${done ? ' done' : ''}" onclick="labGo('l27-son')"><span class="lsn-ci">${LSN_I.audio}</span><span class="lsn-cc"><small>${done ? 'Test fait · le refaire' : 'Nouveau test'}</small><b>Le son de tes prises</b><small>Brut ou traité, comme pour les réseaux</small></span><i aria-hidden="true">›</i></button>`;
}
function lsnHTML() {
  const L = lsnTakes();
  if (!L.find(t => t.mid === LSN.sel)) LSN.sel = L[0] ? L[0].mid : null;
  const T = L.find(t => t.mid === LSN.sel);
  const top = `<div class="rp-top"><button type="button" class="mt-back" onclick="labGo('home')" aria-label="Retour à S’entraîner">${RP_BACK}</button><div><small>Labo · nouveau test</small><h1>Le son de tes prises</h1></div></div>`;
  if (!T) return top + mediBulle('curieuse', 'Tu n’as encore aucune prise. Enregistre un rythme ou une vidéo dans une fiche, puis reviens ici.', {size: 56, cls: 'lab-medi-b'})
    + `<div class="lab-acts"><button type="button" class="btn btn-primary" onclick="go('home')">Ouvrir mes fiches</button></div>`;
  const doses = Object.keys(LSN_DOSE).map(k => `<button type="button" class="${LSN.dose === k ? 'on' : ''}" aria-pressed="${LSN.dose === k}" onclick="lsnDose('${k}')">${LSN_DOSE[k].l}</button>`).join('');
  const row = t => `<button type="button" class="lsn-tk${t.mid === LSN.sel ? ' on' : ''}" onclick="lsnPick('${t.mid}')"><span class="lsn-ti">${LSN_I[t.kind]}</span><span class="lsn-tc"><b>${esc(t.name)}</b><small>${esc(t.sheet)} · ${t.what}</small></span><span class="lsn-td">${t.dur ? fpDur(t.dur) : ''}</span></button>`;
  return top + mediBulle('concentree', 'Je traite ta prise comme pour la poster : moins de grondement, plus de clarté, les écarts tassés, un soupçon de salle. Les deux jouent au même volume : tu n’entends que le traitement.', {size: 56, cls: 'lab-medi-b'})
    + `<section class="lsn-pl${T.kind === 'video' ? ' vid' : ''}">
      <div class="lsn-hd"><b>${esc(T.name)}</b><small>${esc(T.sheet)} · ${T.what}</small></div>
      ${T.kind === 'video' ? '<div class="lsn-media" id="lsn-media"></div>' : ''}
      <div class="lsn-wave" id="lsn-wave" onpointerdown="lsnScrub(event)"><svg class="g" viewBox="0 0 240 46" preserveAspectRatio="none" aria-hidden="true"></svg><div class="lsn-prog" id="lsn-prog"><svg class="o" viewBox="0 0 240 46" preserveAspectRatio="none" aria-hidden="true"></svg></div></div>
      <div class="lsn-row"><button type="button" class="fp-pp lsn-pp" id="lsn-pp" onclick="lsnToggle()" aria-label="Écouter">${FP_PLAY}</button><span class="lsn-t" id="lsn-t">0:00</span>
        <div class="lsn-ab" role="group" aria-label="Comparer"><button type="button" data-m="dry" class="${LSN.mode === 'dry' ? 'on' : ''}" onclick="lsnMode('dry')">Brut</button><button type="button" data-m="wet" class="${LSN.mode === 'wet' ? 'on' : ''}" onclick="lsnMode('wet')">Traité</button></div></div>
      <div class="lsn-dose" role="group" aria-label="La dose">${doses}</div>
      <p class="lsn-note" id="lsn-note">Médi règle le volume…</p>
    </section>
    <h2 class="lsn-h">Tes prises <small>${L.length}</small></h2>
    <div class="lsn-list">${L.map(row).join('')}</div>`
    + labFormHTML(LAB_TESTS27[0]);
}
function lsnAfter() { lsnLoad(); }

/* ── le lecteur ── */
function lsnStop() {
  cancelAnimationFrame(LSN.raf); LSN.raf = 0; LSN.tok++;
  const P = LSN.P; LSN.P = null; if (!P) return;
  try { P.el.pause(); } catch (e) {}
  try { P.src.disconnect(); P.dry.disconnect(); P.wetG.disconnect(); P.C.out.disconnect(); } catch (e) {}
  P.el.removeAttribute('src'); try { P.el.load(); } catch (e) {}
}
async function lsnLoad() {
  lsnStop();
  const T = lsnCur(); if (!T) return;
  const tok = LSN.tok, url = await mediaURL(T.mid); if (tok !== LSN.tok) return;
  if (!url) { lsnNote('Cette prise est introuvable.'); return; }
  const ac = audio(), el = T.kind === 'video' ? document.createElement('video') : new Audio();
  el.preload = 'auto'; el.playsInline = true; el.setAttribute('playsinline', ''); el.src = url;
  if (T.kind === 'video') { const box = $('lsn-media'); if (box) { box.appendChild(el); el.addEventListener('loadedmetadata', () => { if (el.videoWidth && el.videoHeight) box.style.aspectRatio = el.videoWidth + ' / ' + el.videoHeight; if (el.videoHeight > el.videoWidth) { box.style.width = Math.round(Math.min(innerHeight * .42, 380) * el.videoWidth / el.videoHeight) + 'px'; box.style.margin = '0 auto'; } }, {once: true}); el.onclick = () => lsnToggle(); } }
  const src = ac.createMediaElementSource(el), dry = ac.createGain(), wetG = ac.createGain();
  const P = LSN.P = {T, el, src, dry, wetG, C: null, M: null, a: T.a || 0, b: T.b || 0};
  dry.gain.value = 0; wetG.gain.value = 0; dry.connect(ac.destination); wetG.connect(ac.destination); src.connect(dry);
  el.addEventListener('loadedmetadata', () => { if (LSN.P === P) { if (!P.b && isFinite(el.duration)) P.b = el.duration; try { el.currentTime = P.a; } catch (e) {} lsnPaint(); } }, {once: true});
  el.addEventListener('ended', () => { if (LSN.P === P) { try { el.currentTime = P.a; } catch (e) {} lsnBtn(false); } });
  await lsnSetDose(LSN.dose);
}
async function lsnSetDose(k) {
  const P = LSN.P; if (!P) return;
  const ac = audio(), D = LSN_DOSE[k];
  if (P.C) { try { P.src.disconnect(P.C.inp); P.C.out.disconnect(); } catch (e) {} }
  const C = P.C = lsnChain(ac, D, true); C.out.connect(P.wetG); P.src.connect(C.inp);
  lsnNote('Médi règle le volume…');
  const M = await lsnMeasure(P.T, k); if (LSN.P !== P || P.C !== C) return;
  P.M = M; C.inp.gain.value = M.g0; C.mk.gain.value = M.mk;
  if (M.ok && !P.b) P.b = M.b;
  lsnGains(true); lsnWave(); lsnPaint();
  lsnNote(M.ok ? 'Même volume pour les deux. Touche Brut / Traité pendant l’écoute.' : 'Je n’ai pas pu mesurer cette prise : les volumes ne sont pas égalisés.');
}
function lsnGains(now) {
  const P = LSN.P; if (!P || !P.M) return;
  const ac = audio(), t = ac.currentTime, w = LSN.mode === 'wet';
  [[P.dry.gain, w ? 0 : P.M.dry], [P.wetG.gain, w ? 1 : 0]].forEach(([g, v]) => { g.cancelScheduledValues(t); if (now) g.value = v; else { g.setValueAtTime(g.value, t); g.setTargetAtTime(v, t, .025); } });
}
function lsnNote(s) { const n = $('lsn-note'); if (n) n.textContent = s; }
function lsnWave() {   // la forme du son, brut ou traité, à la même échelle (le traité est plus égal)
  const P = LSN.P, w = $('lsn-wave'); if (!P || !P.M || !P.M.ok || !w) return;
  const M = P.M, n = 48, raw = lsnRms(M.buf, M.a, Math.min(M.b, M.a + 90), n).map(x => x * M.dry), wet = lsnRms(M.wet, 0, M.wet.duration, n).map(x => Math.min(.9, x * M.mk));
  const pk = LSN.mode === 'wet' ? wet : raw, mx = Math.max(.02, ...raw, ...wet);
  const bars = fpBars(pk.map(x => x / mx), 240, 46);
  w.querySelector('.g').innerHTML = bars; w.querySelector('.o').innerHTML = bars;
  const o = w.querySelector('.o'), sync = () => { o.style.width = w.clientWidth + 'px'; }; sync(); requestAnimationFrame(sync);
}
function lsnBtn(on) { const b = $('lsn-pp'); if (!b) return; b.innerHTML = on ? FB_PAUSEO : FP_PLAY; b.setAttribute('aria-label', on ? 'Pause' : 'Écouter'); b.classList.toggle('on', on); }
function lsnPaint() {
  const P = LSN.P; if (!P) return;
  const len = Math.max(.01, (P.b || P.el.duration || 1) - P.a), t = Math.max(0, P.el.currentTime - P.a);
  const pr = $('lsn-prog'); if (pr) pr.style.width = Math.min(100, t / len * 100) + '%';
  const c = $('lsn-t'); if (c) c.textContent = fpDur(t) + ' / ' + fpDur(len);
}
function lsnToggle() {
  const P = LSN.P; if (!P) return;
  if (!P.el.paused) { P.el.pause(); lsnBtn(false); cancelAnimationFrame(LSN.raf); return; }
  stopPlay(); audioReady();
  if (P.b && P.el.currentTime >= P.b - .05) P.el.currentTime = P.a;
  lsnGains(true);
  const pr = P.el.play(); if (pr && pr.catch) pr.catch(() => {});
  lsnBtn(true);
  const loop = () => { const Q = LSN.P; if (!Q || Q.el.paused) return; if (Q.b && Q.el.currentTime >= Q.b) Q.el.currentTime = Q.a; lsnPaint(); LSN.raf = requestAnimationFrame(loop); };
  cancelAnimationFrame(LSN.raf); LSN.raf = requestAnimationFrame(loop);
}
function lsnScrub(e) {
  const P = LSN.P, w = $('lsn-wave'); if (!P || !w) return;
  const set = ev => { const r = w.getBoundingClientRect(), x = lsnClamp((ev.clientX - r.left) / r.width, 0, 1), b = P.b || P.el.duration || 0; try { P.el.currentTime = P.a + x * (b - P.a); } catch (er) {} lsnPaint(); };
  set(e);
  const mv = ev => set(ev), up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up);
}
function lsnMode(m) {
  LSN.mode = m;
  document.querySelectorAll('.lsn-ab button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
  lsnGains(false); lsnWave();
}
function lsnDose(k) {
  LSN.dose = k; if (LSN.mode !== 'wet') lsnMode('wet');
  document.querySelectorAll('.lsn-dose button').forEach(b => { const on = b.getAttribute('onclick').includes(`'${k}'`); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const P = LSN.P, was = P && !P.el.paused;
  lsnSetDose(k).then(() => { if (was && LSN.P === P) lsnGains(false); });
}
function lsnPick(mid) {
  if (mid === LSN.sel) return;
  LSN.sel = mid; lsnStop();
  const h = $('lab-body'); if (!h) return;
  h.innerHTML = lsnHTML(); lsnAfter(); window.scrollTo(0, 0);
}

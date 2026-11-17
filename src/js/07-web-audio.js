/* ═══════ WEB AUDIO ═══════ */
/* Moteur de guitare : vrais échantillons de guitare acoustique (bloc SAMPLES GUITARE en fin de fichier, décodés une fois
   au premier geste), joués à la bonne hauteur par playbackRate ; grattage réaliste (cordes décalées, humanisation),
   amortissement des cordes qui sonnent quand le coup suivant arrive. Karplus-Strong = secours (avant chargement / si le
   décodage échoue). Tout est embarqué : hors ligne OK. */
let AC = null;
/* Volume général : un gain maître entre tous les sons et les haut-parleurs (réglage mémorisé) */
let masterG = null, VOL = 1, VOL_MUTE = false;
try { const sv = localStorage.getItem('gms_vol'); if (sv != null && !isNaN(+JSON.parse(sv))) VOL = Math.min(1, Math.max(0, +JSON.parse(sv))); VOL_MUTE = localStorage.getItem('gms_mute') === 'true'; } catch (e) {}
const volGain = () => VOL_MUTE ? 0 : VOL * VOL;   // courbe douce : le milieu du curseur est déjà confortable
const OUT = ac => { if (!masterG || masterG.context !== ac) { masterG = ac.createGain(); masterG.gain.value = volGain(); masterG.connect(ac.destination); } return masterG; };
function volApply() { if (masterG) masterG.gain.setTargetAtTime(volGain(), masterG.context.currentTime, .015); volIcons(); }
const VOL_ICON = (m, v) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h4l5 4v-13l-5 4z"/>${m || v === 0 ? '<path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>' : v < .5 ? '<path d="M16.5 9.5a3.5 3.5 0 010 5"/>' : '<path d="M16.5 9a4.5 4.5 0 010 6M19 6.5a8 8 0 010 11"/>'}</svg>`;
function volIcons() { document.querySelectorAll('.vol-btn').forEach(b => { b.innerHTML = VOL_ICON(VOL_MUTE, VOL); b.classList.toggle('off', VOL_MUTE || VOL === 0); }); }
function volSave() { try { localStorage.setItem('gms_vol', JSON.stringify(VOL)); localStorage.setItem('gms_mute', String(VOL_MUTE)); } catch (e) {} }
function volSet(v) { VOL = Math.min(1, Math.max(0, v / 100)); if (VOL > 0) VOL_MUTE = false; volSave(); volApply(); const r = document.getElementById('vol-range'); if (r && +r.value !== Math.round(VOL * 100)) r.value = Math.round(VOL * 100); }
function volMuteToggle() { VOL_MUTE = !VOL_MUTE; if (!VOL_MUTE && VOL === 0) VOL = .6; volSave(); volApply(); const r = document.getElementById('vol-range'); if (r) r.value = Math.round(VOL * 100); }
function volPop(btn, e) {
  if (e) e.stopPropagation();
  let pop = document.getElementById('vol-pop');
  if (pop && pop.classList.contains('on') && pop._for === btn) { pop.classList.remove('on'); return; }
  if (!pop) {
    pop = document.createElement('div'); pop.id = 'vol-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Volume');
    pop.innerHTML = '<button type="button" class="vol-btn vol-mute" onclick="volMuteToggle()" aria-label="Couper le son"></button><input type="range" id="vol-range" min="0" max="100" step="1" aria-label="Volume" oninput="volSet(+this.value)"><output id="vol-out"></output>';
    pop.addEventListener('click', ev => ev.stopPropagation()); document.body.appendChild(pop);
  }
  pop._for = btn; document.getElementById('vol-range').value = Math.round(VOL * 100);
  const r = btn.getBoundingClientRect(), below = r.bottom + 70 < innerHeight, onLeft = r.left < innerWidth / 2;   // la bulle s'ouvre du côté où il y a de la place
  pop.style.top = below ? Math.round(r.bottom + 8) + 'px' : 'auto'; pop.style.bottom = below ? 'auto' : Math.round(innerHeight - r.top + 8) + 'px';
  pop.style.left = onLeft ? Math.max(8, Math.round(r.left)) + 'px' : 'auto'; pop.style.right = onLeft ? 'auto' : Math.max(8, Math.round(innerWidth - r.right)) + 'px';
  pop.classList.add('on'); volIcons();
}
document.addEventListener('click', () => { const p = document.getElementById('vol-pop'); if (p) p.classList.remove('on'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const p = document.getElementById('vol-pop'); if (p) p.classList.remove('on'); } });
document.addEventListener('DOMContentLoaded', volIcons);
const audio = () => { if (!AC) { AC = new (window.AudioContext || window.webkitAudioContext)(); gtrLoad(AC); } return AC; };
document.addEventListener('pointerdown', () => { try { audio(); } catch (e) {} }, {once: true});   // précharge les samples dès le 1er toucher
// samples : MIDI -> AudioBuffer (une note tous les 3 demi-tons ; les autres par playbackRate depuis la plus proche)
const GTR = {bufs: {}, keys: [], cents: {}, ready: false, started: false};
async function gtrLoad(ac) {
  const SRC = window.GTR_B64;
  if (GTR.started || !SRC) return; GTR.started = true;
  const bufs = {};
  try {
    await Promise.all(Object.keys(SRC).map(async k => {
      const bin = atob(SRC[k]), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const b = await ac.decodeAudioData(u8.buffer);
      let pk = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); }
      if (pk > 0) for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] /= pk; }
      bufs[k] = b;
    }));
    GTR.bufs = bufs; GTR.keys = Object.keys(bufs).map(Number).sort((a, b) => a - b);
    GTR.cents = window.GTR_CENTS || {}; GTR.ready = true;
  } catch (e) { GTR.started = false; if (!GTR.keys.length) GTR.ready = false; }    // échec : Karplus-Strong reste en service
}
function gtrSample(freq) {
  const m = 12*Math.log2(freq/440) + 69, ks = GTR.keys; if (!ks.length) return null;
  let base = ks[0]; for (const k of ks) if (Math.abs(k - m) < Math.abs(base - m)) base = k;
  const b = GTR.bufs[base]; return b ? {buf: b, rate: freq/(440*Math.pow(2, (base + (GTR.cents[base] || 0)/100 - 69)/12))} : null;
}
const KS_CACHE = new Map(), AUD = new WeakMap(), MAX_VOICES = 40;
let KS_NOISE = null;
function ksBuffer(ac, freq) {
  const sr = ac.sampleRate, key = sr + ':' + Math.round(freq*10);
  let b = KS_CACHE.get(key); if (b) return b;
  const len = Math.floor(sr*(freq < 150 ? 3 : 2.2)), N = sr/freq, D = N - .5, P = Math.floor(D), fr = D - P;
  const y = new Float32Array(len), rho = Math.pow(.001, 1/(4.5*freq));   // ~4,5 s de T60 hors pertes du filtre
  let seed = (Math.round(freq*10)*2654435761) >>> 0, lp = 0, prev = 0;
  const rnd = () => ((seed = (seed*1664525 + 1013904223) >>> 0) / 2147483648) - 1;
  const ex = new Float32Array(P + 2);
  for (let i = 0; i < ex.length; i++) { lp += .55*(rnd() - lp); ex[i] = lp; }       // excitation adoucie (bruit passe-bas)
  const pk = Math.floor(ex.length*.18);                                           // position du médiator : peigne -> timbre
  for (let i = ex.length - 1; i >= pk; i--) ex[i] -= .6*ex[i - pk];
  let mx = 0; for (let i = 0; i < ex.length; i++) mx = Math.max(mx, Math.abs(ex[i]));
  for (let i = 0; i < len; i++) {
    const a = i < P + 2 ? ex[i]/mx : 0, d1 = i >= P ? y[i-P] : 0, d2 = i >= P + 1 ? y[i-P-1] : 0;
    const s = (1 - fr)*d1 + fr*d2, o = rho*.5*(s + prev); prev = s; y[i] = a + o;
  }
  const fade = Math.floor(sr*.25); for (let i = 0; i < fade; i++) y[len - 1 - i] *= i/fade;
  let pe = 0; for (let i = 0; i < len; i++) pe = Math.max(pe, Math.abs(y[i])); for (let i = 0; i < len; i++) y[i] /= pe;
  b = ac.createBuffer(1, len, sr); b.getChannelData(0).set(y); KS_CACHE.set(key, b); return b;
}
function noiseBuf(ac) {
  if (KS_NOISE && KS_NOISE.sampleRate === ac.sampleRate) return KS_NOISE;
  const n = Math.floor(ac.sampleRate*.3), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random()*2 - 1;
  return (KS_NOISE = b);
}
function audioBus(ac) {
  let B = AUD.get(ac); if (B) return B;
  const inp = ac.createGain(), mk = (type, f, q, g) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; if (g != null) n.gain.value = g; return n; };
  // léger conformateur (les samples ont déjà leur corps) ; réverb très discrète
  const chain = [mk('highpass', 70, .7), mk('peaking', 100, 1.6, 1.5), mk('peaking', 215, 1.4, 1), mk('peaking', 480, 1, -1), mk('peaking', 2400, .9, 1), mk('highshelf', 2600, .7, 8), mk('lowpass', 9000, .6)];
  chain.reduce((a, n) => (a.connect(n), n), inp);
  const dry = ac.createGain(), wet = ac.createGain(), conv = ac.createConvolver(), comp = ac.createDynamicsCompressor();
  const n = Math.floor(ac.sampleRate*.22), ir = ac.createBuffer(2, n, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let l = 0; for (let i = 0; i < n; i++) { l += .35*((Math.random()*2 - 1) - l); d[i] = l*Math.pow(1 - i/n, 3.5); } }
  conv.buffer = ir; dry.gain.value = 1; wet.gain.value = .1;
  const last = chain[chain.length - 1]; last.connect(dry); last.connect(conv); conv.connect(wet);
  comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .2;
  dry.connect(comp); wet.connect(comp); comp.connect(OUT(ac));
  B = {inp, voices: []}; AUD.set(ac, B); return B;
}
// amortit (≈ main qui étouffe) les voix encore actives à l'instant t ; tau = vitesse d'extinction
function audioDamp(ac, t, tau, onlyStrum) {
  const B = audioBus(ac);
  B.voices = B.voices.filter(v => v.end > t - .05);
  B.voices.forEach(v => { if (v.t <= t && v.end > t && !v.damped && (!onlyStrum || v.strum)) { v.damped = 1; v.damp.gain.setTargetAtTime(0, t, tau); v.end = t + tau*6; try { v.src.stop(t + tau*6 + .02); } catch (e) {} } });
}
function pluck(freq, t, dur, vol, o) {
  const ac = audio(), B = audioBus(ac); o = o || {};
  const pm = dur <= .3 || o.pm, v = vol || .14;
  B.voices = B.voices.filter(x => x.end > t - .05);
  if (B.voices.length >= MAX_VOICES) { const old = B.voices.shift(); old.damp.gain.setTargetAtTime(0, Math.max(t, ac.currentTime), .02); try { old.src.stop(Math.max(t, ac.currentTime) + .12); } catch (e) {} }
  const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), env = ac.createGain(), damp = ac.createGain();
  const sm = GTR.ready ? gtrSample(freq) : null;
  lp.type = 'lowpass'; lp.Q.value = .5;
  if (sm) {   // vrai échantillon : son naturel, filtre seulement pour l'étouffé / les coups doux
    src.buffer = sm.buf; src.playbackRate.value = sm.rate;
    lp.frequency.setValueAtTime(o.lp || (pm ? 1500 : Math.min(14000, 4500 + v*30000*(o.bright || 1))), t);
  } else {
    src.buffer = ksBuffer(ac, freq);
    lp.frequency.setValueAtTime(pm ? 1200 : Math.min(9000, 2200 + v*14000*(o.bright || 1)), t);
    if (!pm) lp.frequency.exponentialRampToValueAtTime(1800, t + Math.min(dur, 1.5));
  }
  const g = v*(sm ? 2 : 1.5), hold = pm ? dur*.5 : dur*.6, end = t + dur + (pm ? .05 : .25);
  env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(g, t + .002);
  env.gain.setValueAtTime(g, t + hold); env.gain.exponentialRampToValueAtTime(.0008, end);
  src.connect(lp); lp.connect(env); env.connect(damp); damp.connect(B.inp);
  src.start(t); src.stop(end + .05);
  const voice = {t, end: end + .05, src, damp, strum: !!o.strum};
  B.voices.push(voice);
  src.onended = () => { try { src.disconnect(); lp.disconnect(); env.disconnect(); damp.disconnect(); } catch (e) {} };
}
// bruit de médiator / étouffé : court burst filtré
function pickNoise(t, vol, f, q, dur, type) {
  const ac = audio(), B = audioBus(ac), src = ac.createBufferSource(), flt = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noiseBuf(ac); flt.type = type || 'bandpass'; flt.frequency.value = f; flt.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
  src.connect(flt); flt.connect(g); g.connect(B.inp); src.start(t, Math.random()*.15); src.stop(t + dur + .02);
  src.onended = () => { try { src.disconnect(); flt.disconnect(); g.disconnect(); } catch (e) {} };
}
const fretFreq = (si, fret, capo) => 440 * Math.pow(2, ((OPEN_MIDI[si] + fret + (capo||0)) - 69)/12);
const hum = (x, a) => x*(1 + (Math.random()*2 - 1)*a);
// vrai grattage : dir 'D' (grave→aigu) ou 'U' (aigu→grave, plus léger, cordes aiguës), lvl 0..2 (doux, moyen, accent)
function strumChord(chord, capo, dir, t, lvl, pm) {
  const ac = audio(); lvl = lvl == null ? 1 : lvl;
  const idx = [0,1,2,3,4,5].filter(k => chord.frets[k] >= 0), up = dir === 'U' || dir === 'u';
  const ord = up ? idx.slice().reverse().slice(0, lvl === 2 ? 5 : 4) : idx;
  const gap = [.0085, .0105, .0125][lvl]*(up ? .8 : 1), vol = [.05, .085, .125][lvl]*(up ? .72 : 1);
  audioDamp(ac, t, pm ? .012 : .035, true);                    // la main arrête les cordes du coup précédent
  pickNoise(t, vol*(GTR.ready ? .3 : .9), up ? 4800 : 3200, .8, .035);
  ord.forEach((si, n) => {
    const w = hum(vol*(up ? 1 : 1 - n*.025), .1), tt = t + n*gap + (Math.random()*.003 - .0015)*(n ? 1 : 0);
    pluck(fretFreq(si, chord.frets[si], capo), Math.max(tt, t), pm ? .18 : (up ? .55 : .9) + lvl*.1, w, {strum: 1, pm, bright: up ? 1.1 : .9});
  });
}
function chuckSound(t, chord, capo) {
  const ac = audio(); audioDamp(ac, t, .01, true);
  const s = GTR.ready;   // avec samples : cordes étouffées (attaque courte, coupure rapide, passe-bas) + un peu de bruit percussif
  pickNoise(t, s ? .22 : .3, 1100, .9, .06); pickNoise(t, s ? .15 : .2, 220, .7, .05, 'lowpass');
  if (chord) [0,1,2,3,4,5].filter(k => chord.frets[k] >= 0).forEach((si, n) => pluck(fretFreq(si, chord.frets[si], capo), t + n*.006, .06, hum(s ? .06 : .035, .2), {strum: 1, pm: 1, lp: s ? 900 : 0}));
}
/* Grattage sur cordes étouffées (main gauche posée à plat sur les cordes) : pas de note, un « tchick » percussif.
   Construit sur les vrais samples : attaque seule (~40 ms) de chaque corde, décalées comme un vrai grattage, rejouée plus grave
   (la hauteur disparaît), passe-bande serré, enveloppe très sèche ; + bruit de cordes filtré et un petit « thump » de la main.
   Coup bas = cordes graves→aiguës, plus sombre ; coup haut = 4 cordes aiguës, plus clair et léger ; lvl 0..2 = doux / moyen / accent.
   o.x = coup mort (✕) : plus court, plus sourd. Préférence « Cordes étouffées / Sur les accords » : mmOn(ctx) ci-dessous. */
function muteString(freq, t, vol, bright, len) {
  const ac = audio(), B = audioBus(ac), src = ac.createBufferSource(), hp = ac.createBiquadFilter(), lp = ac.createBiquadFilter(), env = ac.createGain();
  const sm = GTR.ready ? gtrSample(freq) : null;
  if (sm) { src.buffer = sm.buf; src.playbackRate.value = sm.rate*.72; } else { src.buffer = ksBuffer(ac, freq); src.playbackRate.value = .72; }
  hp.type = 'highpass'; hp.frequency.value = 170; hp.Q.value = .7;
  lp.type = 'lowpass'; lp.frequency.value = bright; lp.Q.value = 1.1;
  const g = vol*(sm ? 2.6 : 2);
  env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(g, t + .0012);
  env.gain.setValueAtTime(g, t + len*.15); env.gain.exponentialRampToValueAtTime(.0006, t + len);
  src.connect(hp); hp.connect(lp); lp.connect(env); env.connect(B.inp);
  src.start(t); src.stop(t + len + .03);
  src.onended = () => { try { src.disconnect(); hp.disconnect(); lp.disconnect(); env.disconnect(); } catch (e) {} };
}
function muteHit(t, chord, capo, dir, lvl, o) {
  const ac = audio(); o = o || {}; lvl = lvl == null ? 1 : lvl;
  const up = dir === 'U' || dir === 'u', ch = chord || newChord('Em');
  const idx = [0,1,2,3,4,5].filter(k => ch.frets[k] >= 0);
  let ord = up ? idx.slice().reverse().slice(0, lvl === 2 ? 5 : 4) : idx.slice(0, lvl === 0 ? 4 : 6);
  if (o.x) ord = idx.slice(0, 4);
  audioDamp(ac, t, .01, true);                                  // la main arrête tout ce qui sonnait
  const gap = (up ? .0055 : .0075)*(lvl === 2 ? 1.1 : 1), vol = [.05, .08, .125][lvl]*(up ? .7 : 1)*(o.x ? .8 : 1);
  const len = o.x ? .03 : up ? .036 : .046, br = (o.x ? 800 : up ? 2100 : 1250) + lvl*260;
  ord.forEach((si, n) => {
    const tt = t + n*gap + (n ? Math.random()*.002 : 0);
    muteString(fretFreq(si, ch.frets[si], capo), tt, hum(vol*(up ? 1 - n*.06 : 1 - n*.05), .12), br, len*hum(1, .12));
  });
  const nz = GTR.ready ? 1 : 1.5;
  pickNoise(t, vol*1.1*nz, up ? 3600 : 2500, .75, up ? .028 : .04);                // frottement des cordes étouffées
  if (!up || o.x) pickNoise(t, vol*(o.x ? 1.8 : 1.2)*nz, 170, .8, .05, 'lowpass');  // le « thump » de la paume / de la main gauche
  pickNoise(t + .004, vol*.5*nz, 5200, .9, .016);                                    // petit claquement aigu
}
// Préférence : le rythme sonne sur cordes étouffées ('mute') ou sur les accords ('chords'), par contexte.
// learn = Apprendre les rythmes / exercices de rythme / éditeur de rythme (défaut étouffé) ; feel = Au feeling (défaut accords)
const MM_DEF = {learn: 'mute', feel: 'chords'};
function mmOn(ctx) {
  if (!ctx) return false;
  let v = null; try { v = localStorage.getItem('gms_mm_' + ctx); } catch (e) {}
  return (v === 'mute' || v === 'chords' ? v : MM_DEF[ctx]) === 'mute';
}
function mmBtn(ctx, cls) { const on = mmOn(ctx); return `<button type="button" class="filt mm-btn ${on ? 'on' : ''} ${cls || ''}" data-mm="${ctx}" onclick="mmToggle('${ctx}')" aria-pressed="${on}" title="Le rythme se joue sur des cordes étouffées (sans note) ou sur les accords">${on ? 'Cordes étouffées' : 'Sur les accords'}</button>`; }
function mmToggle(ctx) {
  const v = mmOn(ctx) ? 'chords' : 'mute';
  try { localStorage.setItem('gms_mm_' + ctx, v); } catch (e) {}
  document.querySelectorAll(`[data-mm="${ctx}"]`).forEach(b => { const on = v === 'mute'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? 'Cordes étouffées' : 'Sur les accords'; });
  if (v === 'mute') { try { muteHit(audio().currentTime + .03, newChord('Em'), 0, 'D', 2); } catch (e) {} }   // aperçu
}
function playChord(ch, capo, dir, when) {
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  strumChord(ch, capo, dir === 'U' ? 'U' : 'D', when || ac.currentTime + 0.02, 2);
}
function click(t, hi) {
  const ac = audio();
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = hi ? 1500 : 900;
  g.gain.setValueAtTime(.09, t); g.gain.exponentialRampToValueAtTime(.0001, t+0.04);
  o.connect(g); g.connect(OUT(ac)); o.start(t); o.stop(t+0.05);
}
let rhP = null; // lecture en cours : {key, ctx, rh, bpm, chord, capo, k, k0, t0, timer, raf, q, onStep, click}
function stopPlay() {
  rhStop(); recStopPlay();
  document.querySelectorAll('.play-on').forEach(e => e.classList.remove('play-on'));
}
/* Moteur de rythme : planificateur à anticipation sur l'horloge Web Audio (même principe que le métronome :
   timer 25 ms, fenêtre 120 ms), temps absolu t = t0 + (k-k0) × durée de case → aucune dérive cumulée.
   Boucle sans fin jusqu'à rhStop(). Points d'extension : rhPlayCell (rendu d'une case) et opt.onCell (hook
   appelé par case planifiée, avec son temps audio) pour l'enregistrement au tap / le mode jeu. */
const rhCellDur = (rh, bpm) => 60 / bpm / rhSpb(rh.mes, rh.res);
const rhCellTime = (P, k) => {
  const rh = P.rh, off = (rh.swing && rhSpb(rh.mes, rh.res) === 2 && k % 2 === 1) ? rh.swing*rhCellDur(rh, P.bpm) : 0;
  return P.t0 + (k - P.k0)*rhCellDur(rh, P.bpm) + off;
};
function rhPlayCell(c, t, chord, capo, pm, mm) {
  if (!c) return;
  if (c.d === 'X') { if (mm) muteHit(t, chord, capo, 'D', 1, {x: 1}); else chuckSound(t, chord, capo); return; }
  if (!chord) return;
  if (mm) { muteHit(t, chord, capo, c.d, c.a); return; }   // mm = cordes étouffées
  strumChord(chord, capo, c.d, t, c.a, pm);   // pm = palm mute : sustain court, passe-bas
}
function rhStart(rh, bpm, chord, capo, onStep, opt) {
  rhStop();
  rh = rhNorm(rh); if (!rhHas(rh)) return false;
  opt = opt || {};
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  recStopPlay();
  const P = rhP = {key: opt.key || '', ctx: ac, rh, chords: opt.chords && opt.chords.length ? opt.chords : null, bpm: bpm || 90, chord: chord || findChord('Em'), capo: capo || 0,
    k: 0, k0: 0, t0: ac.currentTime + 0.08, q: [], onStep, onCell: opt.onCell, mute: !!opt.mute, timer: null, raf: 0};
  const tick = () => {
    if (rhP !== P) return;
    const per = rhPerBar(rh.mes, rh.res), spb = rhSpb(rh.mes, rh.res);
    while (rhCellTime(P, P.k) < ac.currentTime + 0.12) {
      const i = P.k % rh.cells.length, t = rhCellTime(P, P.k), inBar = i % per;
      if (!P.mute && inBar % spb === 0) click(t, inBar === 0);
      // 1 accord = 1 mesure : la suite d'accords de la partie défile, mesure après mesure
      const ch = P.chords ? P.chords[Math.floor(P.k/per) % P.chords.length] : P.chord;
      if (opt.cellFn) opt.cellFn(rh.cells[i], t, ch, i, P.k, P); else rhPlayCell(rh.cells[i], t, ch, P.capo, false, mmOn(opt.mm));
      if (P.onCell) P.onCell(i, t, P.k);
      P.q.push({i, t, k: P.k}); P.k++;
    }
    P.timer = setTimeout(tick, 25);
  };
  const draw = () => {
    if (rhP !== P) return;
    let cur = null;
    while (P.q.length && P.q[0].t <= ac.currentTime) cur = P.q.shift();
    if (cur && P.onStep) P.onStep(cur.i, cur.k);
    P.raf = requestAnimationFrame(draw);
  };
  tick(); draw();
  return true;
}
// Changer le tempo en cours de lecture sans saut : on ré-ancre la grille sur la prochaine case à planifier
function rhSetBpm(bpm) {
  const P = rhP; if (!P) return;
  P.t0 = rhCellTime(P, P.k); P.k0 = P.k; P.bpm = bpm;
}
function rhStop() {
  const P = rhP; if (!P) return;
  rhP = null;
  clearTimeout(P.timer); cancelAnimationFrame(P.raf);
  if (P.onStep) P.onStep(null);
}
const rhPlaying = key => !!rhP && rhP.key === key;
document.addEventListener('visibilitychange', () => { if (document.hidden) rhStop(); });


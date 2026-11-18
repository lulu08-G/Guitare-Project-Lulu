/* ═══════ TUNER — mic input, autocorrelation pitch detection ═══════
   Senior note: FFT peak-picking is too coarse for a single plucked string
   (harmonics fool it easily). Time-domain autocorrelation with parabolic
   interpolation is the standard choice for monophonic guitar tuners and is
   cheap enough to run several times a second in plain JS. */
const STRING_LABELS_FULL = ['Mi grave (6e)','La (5e)','Ré (4e)','Sol (3e)','Si (2e)','Mi aigu (1re)'];
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
let tunerStream = null, tunerAnalyser = null, tunerBuf = null, tunerRAF = null, tunerLastRun = 0;

function tunerTargets() { return STRINGS.map((n, i) => ({name:n, freq: fretFreq(i, 0, 0), si:i})); }

const TN_FR = ['Mi', 'La', 'Ré', 'Sol', 'Si', 'Mi'];
const TN_MIC_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>Arrêter l’écoute';
const TN_MIC_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3"/></svg>Écouter ma guitare';
// état de l'accordeur : auto (corde la plus proche) ou corde choisie ; cordes justes ; aide de Médi
const tn = {init: false, auto: true, target: 0, tuned: new Set(), wrong: 0, wrongT: 0, okT: 0, silentT: 0, expr: '', helpK: '', helpOff: false, helped: {}};
async function toggleTuner() {
  if (tunerStream) { stopTuner(); return; }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}});
  } catch (e) { toast('Micro refusé ou indisponible', true); return; }
  tunerStream = stream;
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  const src = ac.createMediaStreamSource(stream);
  tunerAnalyser = ac.createAnalyser();
  tunerAnalyser.fftSize = 4096;
  src.connect(tunerAnalyser);
  tunerBuf = new Float32Array(tunerAnalyser.fftSize);
  $('tuner-toggle').innerHTML = TN_MIC_ON; $('tuner-toggle').classList.add('on');
  tunerLastRun = 0; tn.silentT = performance.now();
  tnSay('Joue une corde, j’écoute.', 'concentree', 'tilt');
  tunerRAF = requestAnimationFrame(tunerLoop);
}
function stopTuner() {
  if (tunerRAF) cancelAnimationFrame(tunerRAF);
  tunerRAF = null;
  if (tunerStream) tunerStream.getTracks().forEach(t => t.stop());
  tunerStream = null; tunerAnalyser = null;
  const btn = $('tuner-toggle'); if (btn) { btn.innerHTML = TN_MIC_OFF; btn.classList.remove('on'); }
}
function tunerLoop(ts) {
  tunerRAF = requestAnimationFrame(tunerLoop);
  if (ts - tunerLastRun < 80) return; // ~12/s is plenty for a tuner, keeps CPU light
  tunerLastRun = ts;
  tunerAnalyser.getFloatTimeDomainData(tunerBuf);
  renderTunerReading(autoCorrelate(tunerBuf, audio().sampleRate));
}
function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i]*buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // silence / noise floor

  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE/2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE/2; i++) if (Math.abs(buf[SIZE-i]) < thres) { r2 = SIZE - i; break; }
  const b = buf.slice(r1, r2);
  const n = b.length;
  if (n < 8) return null;

  const c = new Float32Array(n);
  for (let lag = 0; lag < n; lag++) { let sum = 0; for (let i = 0; i < n - lag; i++) sum += b[i]*b[i+lag]; c[lag] = sum; }
  let d = 0; while (d < n-1 && c[d] > c[d+1]) d++;
  let maxVal = -1, T0 = -1;
  for (let i = d; i < n; i++) if (c[i] > maxVal) { maxVal = c[i]; T0 = i; }
  if (T0 <= 0) return null;
  if (T0 > 0 && T0 < n-1) { // parabolic interpolation for sub-sample precision
    const x1 = c[T0-1], x2 = c[T0], x3 = c[T0+1];
    const a = (x1 + x3 - 2*x2)/2, bb = (x3 - x1)/2;
    if (a) T0 = T0 - bb/(2*a);
  }
  const freq = sampleRate / T0;
  return (freq > 50 && freq < 1200) ? freq : null;
}
function freqToNote(freq) {
  const midi = 69 + 12*Math.log2(freq/440);
  const rounded = Math.round(midi);
  const cents = Math.round((midi - rounded)*100);
  return {name: NOTE_NAMES[((rounded%12)+12)%12] + (Math.floor(rounded/12)-1), cents};
}
function closestString(freq) {
  let best = null, bestDiff = Infinity;
  tunerTargets().forEach(t => { const diff = Math.abs(12*Math.log2(freq/t.freq)); if (diff < bestDiff) { bestDiff = diff; best = t; } });
  return best;
}
// Médi : son expression et son animation (ne redessine que si ça change)
function tnMedi(expr, anim) {
  const el = $('tn-medi'); if (!el) return;
  const k = expr + '/' + anim; if (tn.expr === k) return; tn.expr = k;
  el.innerHTML = mediSVG(expr, {size: 140, anim, label: 'Médi suit l’aiguille'});
}
function tnSay(txt, expr, anim) {
  const h = $('tn-help'); if (!h) return;
  if (tn.helpK) return;   // l'aide reste affichée tant qu'on ne l'a pas fermée
  h.innerHTML = `<div class="bulle tn-b">${txt}</div>`;
  if (expr) tnMedi(expr, anim || 'breathe');
}
// guitare vue par le joueur : la corde du haut est la plus grosse (Mi grave)
function tnGuitarSVG(si) {
  const ys = [40, 50, 60, 70, 80, 90], w = [2.6, 2.2, 1.8, 1.5, 1.3, 1.1];
  return `<svg class="tn-gtr" viewBox="0 0 322 128" role="img" aria-label="Ta guitare vue d’en haut : la corde ${TN_FR[si]}${si === 0 ? ' grave' : si === 5 ? ' aiguë' : ''} est allumée">
    <path d="M170 8 C220 -4 285 4 318 20 V112 C285 128 220 134 170 120 Z" fill="var(--bg)"/>
    <rect x="0" y="32" width="186" height="66" rx="6" fill="var(--bg)"/>
    <path d="M40 32 V98 M82 32 V98 M122 32 V98 M160 32 V98" stroke="var(--card3)" stroke-width="2"/>
    <circle cx="250" cy="65" r="22" fill="#0a090b" stroke="var(--card3)" stroke-width="2"/>
    ${ys.map((y, i) => i === si ? '' : `<path d="M0 ${y} H296" stroke="var(--cream2)" stroke-width="${w[i]}"/>`).join('')}
    <g class="tn-vib"><path d="M0 ${ys[si]} H296" stroke="var(--gold)" stroke-width="10" opacity=".25"/><path d="M0 ${ys[si]} H296" stroke="var(--gold)" stroke-width="3.5"/></g>
    <text x="4" y="${si < 3 ? 116 : 18}" class="tn-gl">${si === 0 ? 'en haut, la plus grosse' : si === 5 ? 'en bas, la plus fine' : 'la ' + ['', '2e', '3e', '4e', '5e'][si] + ' en partant du haut'}</text>
    <text x="4" y="${si < 3 ? 18 : 116}" class="tn-gs">ta guitare, vue d’en haut</text>
  </svg>`;
}
// l'aide de Médi : sort de sa bulle, une fois par sujet, jamais en fenêtre
function tnHelp(k, si, txt) {
  if (tn.helpOff || tn.helped[k]) return;
  tn.helped[k] = true; tn.helpK = k;
  tnMedi('curieuse', 'tilt');
  $('tn-help').innerHTML = `<section class="bulle tn-aide" aria-label="Aide de Médi"><p>${txt}</p>${si != null ? tnGuitarSVG(si) : ''}
    <div class="tn-aide-b"><button type="button" class="btn btn-primary btn-sm" onclick="tnHelpClose()">Compris</button><button type="button" class="tn-off" onclick="tnHelpOff()">Ne plus m’aider ici</button></div></section>`;
}
function tnHelpClose() { tn.helpK = ''; tn.expr = ''; tnSay(tunerStream ? 'Joue une corde, j’écoute.' : 'Touche « Écouter ma guitare » et joue une corde.', 'concentree', 'tilt'); }
function tnHelpOff() { tn.helpOff = true; LS.set('gms_tn_helpoff', true); tnHelpClose(); }
function tnPoint(cents) {   // aiguille et Médi penchent ensemble
  const c = Math.max(-50, Math.min(50, cents)), a = c / 50 * 34;
  const d = $('tn-dot'); if (d) d.style.transform = `rotate(${a.toFixed(1)}deg)`;
  const m = $('tn-medi'); if (m) m.style.transform = `rotate(${(a * .45).toFixed(1)}deg)`;
}
function renderTunerReading(freq) {
  const now = performance.now();
  if (!freq) {
    if (now - tn.silentT > 10000) { tn.silentT = now; tnHelp('silence', null, 'Je n’entends rien. Approche le téléphone de la guitare et gratte une seule corde, bien franchement.'); }
    return;
  }
  tn.silentT = now;
  const str = tn.auto ? closestString(freq) : tunerTargets()[tn.target];
  const cents = Math.round(1200 * Math.log2(freq / str.freq));
  const name = TN_FR[str.si], sub = str.si === 0 ? 'grave' : str.si === 5 ? 'aigu' : '';
  const note = $('tn-note');
  // corde choisie à la main, mais on en joue une autre
  if (!tn.auto && Math.abs(cents) > 150) {
    const heard = closestString(freq);
    note.innerHTML = `<span class="tn-n off">${TN_FR[heard.si]}</span><span class="tn-s">Tu joues le ${TN_FR[heard.si]}.<b>On cherche le ${name}${sub ? ' ' + sub : ''}.</b></span>`;
    tnPoint(cents > 0 ? 50 : -50); tnMedi('curieuse', 'tilt');
    if (now - tn.wrongT > 1200) { tn.wrongT = now; tn.wrong++; }
    if (tn.wrong >= 2) tnHelp('corde' + str.si, str.si, `Pas celle-là. Le ${name}${sub ? ' ' + sub : ''}, c’est ${str.si === 0 ? 'la plus grosse corde : celle du haut, la plus près de ton visage' : str.si === 5 ? 'la plus fine : celle du bas' : 'la ' + (str.si + 1) + 'e corde en partant du haut'}.`);
    return;
  }
  tn.wrong = 0;
  tnPoint(cents);
  const inTune = Math.abs(cents) <= 5;
  note.innerHTML = `<span class="tn-n${inTune ? ' ok' : ''}">${name}</span><span class="tn-s">${sub}<b class="${inTune ? '' : 'c'}">${inTune ? 'juste' : (cents > 0 ? '+' : '−') + Math.abs(cents)}</b></span>`;
  if (inTune) {
    if (!tn.okT) tn.okT = now;
    if (now - tn.okT > 450 && !tn.tuned.has(str.si)) tnJuste(str.si);
  } else {
    tn.okT = 0;
    tnSay(Math.abs(cents) > 25 ? `Encore trop ${cents > 0 ? 'haut' : 'bas'}. ${cents > 0 ? 'Desserre' : 'Serre'} un peu plus la mécanique.` : `Un peu trop ${cents > 0 ? 'haut' : 'bas'}. ${cents > 0 ? 'Desserre' : 'Serre'} doucement la mécanique.`, 'concentree', 'look');
  }
}
function tnJuste(si) {
  tn.tuned.add(si);
  const nx = [0, 1, 2, 3, 4, 5].find(i => !tn.tuned.has(i));
  if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
  const r = $('tn-ring'); if (r) { r.classList.remove('go'); void r.getBoundingClientRect(); r.classList.add('go'); }
  tn.expr = ''; tnMedi('contente', 'jump');
  if (!tn.helpK) $('tn-help').innerHTML = `<div class="bulle tn-b">${nx == null ? 'Tout est juste. Ta guitare est prête !' : `Juste ! On passe au ${TN_FR[nx]}${nx === 5 ? ' aigu' : ''}.`}</div>`;
  if (!tn.auto && nx != null) tn.target = nx;
  renderTunerStrings();
}
function tnAutoToggle() {
  tn.auto = !tn.auto; LS.set('gms_tn_auto', tn.auto);
  const b = $('tn-auto'); b.setAttribute('aria-pressed', tn.auto); b.classList.toggle('on', tn.auto);
  renderTunerStrings();
}
function tnPick(i) {   // toucher une corde : on l'accorde (mode manuel) et on entend la note juste
  tn.target = i; if (tn.auto) { tn.auto = false; LS.set('gms_tn_auto', false); const b = $('tn-auto'); b.setAttribute('aria-pressed', false); b.classList.remove('on'); }
  tn.wrong = 0; playRefString(i); renderTunerStrings();
}
let tnPress = null;
function tnDown(i) { clearTimeout(tnPress); tnPress = setTimeout(() => { tnPress = 'long'; tn.helped['corde' + i] = false; const sv = tn.helpOff; tn.helpOff = false; tnHelp('corde' + i, i, `Le ${TN_FR[i]}${i === 0 ? ' grave' : i === 5 ? ' aigu' : ''}, c’est ${i === 0 ? 'la plus grosse corde : celle du haut' : i === 5 ? 'la plus fine : celle du bas' : 'la ' + (i + 1) + 'e corde en partant du haut'}.`); tn.helpOff = sv; }, 550); }
function tnUp(i, e) { if (tnPress === 'long') { tnPress = null; e.preventDefault(); return; } clearTimeout(tnPress); tnPress = null; tnPick(i); }
function renderTunerStrings() {
  const host = $('tuner-strings'); if (!host) return;
  if (!tn.init) { tn.init = true; tn.auto = LS.get('gms_tn_auto', true); tn.helpOff = LS.get('gms_tn_helpoff', false); }
  const b = $('tn-auto'); if (b) { b.setAttribute('aria-pressed', tn.auto); b.classList.toggle('on', tn.auto); }
  host.innerHTML = tunerTargets().map((t, i) => {
    const on = !tn.auto && tn.target === i, ok = tn.tuned.has(i);
    return `<button type="button" class="${on ? 'on' : ''}${ok ? ' ok' : ''}" aria-label="${STRING_LABELS_FULL[i]}${ok ? ', juste' : ''} (appui long : où est-elle ?)" aria-pressed="${on}" onpointerdown="tnDown(${i})" onpointerup="tnUp(${i},event)" onpointerleave="clearTimeout(tnPress)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();tnPick(${i})}"><b>${TN_FR[i]}</b>${ok ? '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1.5 5 L4.5 8 L10.5 2"/></svg>' : `<small>${6 - i}</small>`}</button>`;
  }).join('');
  if (!$('tuner-toggle').innerHTML) $('tuner-toggle').innerHTML = tunerStream ? TN_MIC_ON : TN_MIC_OFF;
  if (!$('tn-medi').innerHTML) { tnMedi('concentree', 'tilt'); tnSay('Touche « Écouter ma guitare » et joue une corde.'); }
}
function playRefString(i) {
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  pluck(fretFreq(i, 0, 0), ac.currentTime + 0.02, 2.2, .16);
}


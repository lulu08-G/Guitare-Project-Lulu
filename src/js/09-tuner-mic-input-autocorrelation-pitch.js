/* ═══════ TUNER — mic input, pitch detection (YIN since 19/11) ═══════
   FFT peak-picking is too coarse for a single plucked string (harmonics fool it).
   YIN, plus a median filter and an attack guard (tnTrack), keeps the reading
   steady when the same string is plucked again and again. */
const STRING_LABELS_FULL = ['Mi grave (6e)','La (5e)','Ré (4e)','Sol (3e)','Si (2e)','Mi aigu (1re)'];
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
let tunerStream = null, tunerAnalyser = null, tunerBuf = null, tunerRAF = null, tunerLastRun = 0;

function tunerTargets() { return STRINGS.map((n, i) => ({name:n, freq: fretFreq(i, 0, 0), si:i})); }

const TN_FR = ['Mi', 'La', 'Ré', 'Sol', 'Si', 'Mi'];
const TN_MIC_ON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>Arrêter l’écoute';
const TN_MIC_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v3"/></svg>Écouter ma guitare';
// état de l'accordeur : auto (corde la plus proche) ou corde choisie ; cordes justes ; aide de Médi
const tn = {pop: -1, hear: -1, hearT: 0, armed: '', lock: -1, lockOn: 0, lastT: 0, lastF: 0, farT: 0, init: false, auto: true, target: 0, tuned: new Set(), wrong: 0, wrongT: 0, okT: 0, silentT: 0, expr: '', helpK: '', helpOff: false, helped: {}};
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
  tunerAnalyser.fftSize = 8192;
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
  tunerStream = null; tunerAnalyser = null; tnHear(-1, 0);
  const btn = $('tuner-toggle'); if (btn) { btn.innerHTML = TN_MIC_OFF; btn.classList.remove('on'); }
}
function tunerLoop(ts) {
  tunerRAF = requestAnimationFrame(tunerLoop);
  if (ts - tunerLastRun < 50) return; // ~20 lectures/s
  tunerLastRun = ts;
  tunerAnalyser.getFloatTimeDomainData(tunerBuf);
  const f = tnTrack(tunerBuf, audio().sampleRate, ts);
  if (f === 'wait') { tn.silentT = performance.now(); return; }
  renderTunerReading(f);
}
/* Lecture stable (19/11) : on ignore le claquement de l'attaque, on prend la médiane des
   dernières lectures (les erreurs d'octave et les valeurs folles sautent), puis on lisse.
   La détection elle-même passe à YIN, bien moins sujet aux erreurs d'octave. */
const tnF = {hist: [], ema: 0, rmsAvg: 0, onsetT: -1e9, alt: null, ons: []};
function tnTrack(buf, sr, now) {
  let rms = 0; for (let i = buf.length - 2048; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / 2048);   // niveau sur les ~40 dernières ms : on voit tout de suite le nouveau coup
  // 20/11 : seuil bien plus bas (on suit la corde tant qu'elle sonne, comme les accordeurs connus) ;
  // c'est la régularité du signal (YIN) qui trie la guitare du bruit, pas le volume
  if (rms < 0.0008) { tnF.hist = []; tnF.alt = null; tnF.rmsAvg *= .5; return null; }
  // nouvelle attaque : le niveau bondit, ou (21/11) les ~20 dernières ms sont bien plus fortes que celles
  // d'il y a ~60 ms (un coup redonné sur une corde qui sonne encore passait inaperçu)
  let a = 0, b = 0; for (let i = buf.length - 1024; i < buf.length; i++) a += buf[i] * buf[i];
  for (let i = buf.length - 4096; i < buf.length - 2048; i++) b += buf[i] * buf[i];
  a = Math.sqrt(a / 1024); b = Math.sqrt(b / 2048);
  if (rms > tnF.rmsAvg * 1.6 + 0.004 || (a > b * 1.8 + .002 && now - tnF.onsetT > 150)) { tnF.onsetT = now; tnF.rmsAvg = rms; tnF.ons = tnF.ons.filter(t => now - t < 2500).concat(now); }
  else tnF.rmsAvg = tnF.rmsAvg * .7 + rms * .3;
  if (now - tnF.onsetT < 40) return 'wait';   // on laisse passer le claquement du médiator
  const f = yinPitch(buf, sr);
  if (!f || tnQ > (rms < 0.003 ? .1 : .2)) return rms < 0.003 ? null : 'wait';
  const m = 12 * Math.log2(f / 440);
  let h = tnF.hist;
  const shown = h.length >= 2 ? 440 * Math.pow(2, tnF.ema / 12) : 'wait';
  // 20/11 : on ne vide plus l'historique à chaque coup (l'aiguille restait figée 0,3 s).
  // Une lecture très différente n'est crue que si la suivante la confirme (changement de corde).
  if (h.length && Math.abs(m - tnMed(h)) > .5) {
    if (tnF.alt != null && Math.abs(m - tnF.alt) < .3) { tnF.hist = h = [tnF.alt]; tnF.alt = null; }
    else { tnF.alt = m; return shown; }
  } else tnF.alt = null;
  // 21/11 : une corde grattée fort part quelques cents trop haut, puis redescend (~0,2 s). En grattant
  // en continu, on ne lisait que ce début trop haut : « pas bon », alors qu'un seul coup disait « juste ».
  // Pendant l'attaque, si la note n'a pas changé d'un demi-ton, on garde la valeur posée (sans rien
  // mémoriser : la toute première lecture mélange encore l'ancien son et le nouveau coup).
  if (now - tnF.onsetT < 230 && h.length >= 2 && Math.abs(m - tnF.ema) < .5) return shown;
  h.push(m); if (h.length > 5) h.shift();
  if (h.length < 2) return 'wait';
  const med = tnMed(h);
  tnF.ema = h.length === 2 ? med : tnF.ema * .5 + med * .5;
  return 440 * Math.pow(2, tnF.ema / 12);
}
function tnMed(h) { const a = h.slice().sort((x, y) => x - y), n = a.length; return n % 2 ? a[n >> 1] : (a[n / 2 - 1] + a[n / 2]) / 2; }
// YIN (de Cheveigné et Kawahara, 2002), sur un signal ramené à ~24 kHz pour rester léger
let tnYin = null, tnRaw = null, tnDec = null, tnQ = 1;   // tnQ : irrégularité du dernier signal (0 = parfaitement périodique)
function yinPitch(buf, sr) {
  let x = buf, rate = sr;
  if (sr > 32000) {
    const n = buf.length >> 1; if (!tnDec || tnDec.length !== n) tnDec = new Float32Array(n);
    for (let i = 0; i < n; i++) tnDec[i] = (buf[2 * i] + buf[2 * i + 1]) * .5;
    x = tnDec; rate = sr / 2;
  }
  // 1er passage rapide sur les ~85 dernières ms ; les cordes graves (< 150 Hz) sont relues
  // sur toute la fenêtre (~170 ms) : trop peu de périodes sinon, la lecture tremblait de ±7 cents
  const f0 = yinRun(x.length > 2048 ? x.subarray(x.length - 2048) : x, rate, true);
  if (!f0) return null;
  if (f0 > 150 && x.length > 2048) x = x.subarray(x.length - 2048);
  // 2e passage (20/11) : on adoucit les aigus juste au-dessus de la fondamentale. Les partiels
  // d'une vraie corde sont un peu trop hauts (inharmonicité) et tiraient la lecture de ~8 cents.
  if (!tnLp || tnLp.length < x.length) tnLp = new Float32Array(x.length);
  const a = 1 - Math.exp(-2 * Math.PI * f0 * 1.25 / rate);
  let y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { y1 += a * (x[i] - y1); y2 += a * (y1 - y2); tnLp[i] = y2; }
  return yinRun(tnLp.subarray(Math.min(x.length >> 2, Math.ceil(6 / a)), x.length), rate) || f0;   // on saute la mise en route du filtre
}
let tnLp = null;
function yinRun(x, rate, harm) {
  const W = x.length >> 1, tMin = Math.floor(rate / 1100), tMax = Math.min(W - 1, Math.ceil(rate / 60));
  if (!tnYin || tnYin.length !== tMax + 1) { tnYin = new Float32Array(tMax + 1); tnRaw = new Float32Array(tMax + 1); }
  const d = tnYin, r = tnRaw; d[0] = 1; let run = 0;
  for (let t = 1; t <= tMax; t++) {
    let s = 0; for (let j = 0; j < W; j++) { const v = x[j] - x[j + t]; s += v * v; }
    r[t] = s; run += s; d[t] = run ? s * t / run : 1;
  }
  let tau = -1;
  for (let t = tMin; t <= tMax; t++) if (d[t] < .15) { while (t < tMax && d[t + 1] < d[t]) t++; tau = t; break; }
  if (tau < 0) { let mn = 1; for (let t = tMin; t <= tMax; t++) if (d[t] < mn) { mn = d[t]; tau = t; } if (mn > .3) return null; }
  // 21/11 : le premier creux peut être celui d'une harmonique (2e, 3e, 4e…), surtout quand la note
  // s'éteint ou au micro du téléphone qui capte mal les graves : un La lu comme un Mi aigu (3e harmonique).
  // La vraie période se répète exactement : à 2, 3, 4 ou 5 fois tau, l'écart brut (non normalisé, sinon
  // les multiples d'une vraie période paraissent meilleurs qu'elle) tombe à moins de la moitié.
  // (1er passage seulement : le 2e, filtré vers le grave, grossirait une corde voisine qui résonne)
  if (harm) for (let k = 2, t0 = tau; k <= 5; k++) {
    const c = Math.round(t0 * k); if (c + 2 > tMax) break;
    let m = c - 2; for (let j = c - 1; j <= c + 2; j++) if (r[j] < r[m]) m = j;
    if (d[tau] > .05 && r[m] < r[tau] * .85 && d[m] < d[tau] * .8) tau = m;   // creux déjà très net : vraie période (une corde voisine qui résonne crée aussi un creux plus loin)
  }
  tnQ = d[tau];
  let T = tau;
  if (tau > 1 && tau < tMax) { const a = d[tau - 1], b = d[tau], c = d[tau + 1], den = a + c - 2 * b; if (den > 0) T = tau + (a - c) / (2 * den); }
  const f = rate / T;
  return f > 55 && f < 1100 ? f : null;
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
    if (now - tn.hearT > 1500) tnHear(-1, now);
    if (now - tn.silentT > 10000) { tn.silentT = now; tnHelp('silence', null, 'Je n’entends rien. Approche le téléphone de la guitare et gratte une seule corde, bien franchement.'); }
    return;
  }
  tn.silentT = now;
  // règles des accordeurs connus (20/11) :
  // - une harmonique prise pour la note (lecture à l'octave du dessus) est ramenée dans la guitare
  // - en auto, la corde est « verrouillée » tant qu'elle sonne : on ne saute pas d'une corde à l'autre
  // - en manuel, on fait confiance au choix : une corde très désaccordée reste « sa » corde
  if (now - tn.lastT > 700) tn.lock = -1;
  tn.lastT = now;
  let str;
  if (tn.auto) {
    while (freq > 370) freq /= 2;
    // même corde qui sonne encore : une lecture à l'octave près de la précédente est une harmonique
    if (tn.lock >= 0 && tn.lastF) {
      const o = 1200 * Math.log2(freq / tn.lastF);
      if (Math.abs(o - 1200) < 80) freq /= 2; else if (Math.abs(o + 1200) < 80) freq *= 2;
    }
    str = closestString(freq);
    if (tn.lock >= 0 && str.si !== tn.lock) {
      const lk = tunerTargets()[tn.lock], dl = Math.abs(1200 * Math.log2(freq / lk.freq));
      // 21/11 : une autre corde commence forcément par un coup. Sans nouvelle attaque, c'est la même corde
      // qu'on tourne (on la garde), ou une harmonique / une corde voisine qui résonne (on ne bouge pas).
      if (tnF.onsetT === tn.lockOn && now - (tn.otherT || now) < 800) { if (!tn.otherT) tn.otherT = now; if (dl > 600) return; str = lk; }
      else if (dl - Math.abs(1200 * Math.log2(freq / str.freq)) < 120) str = lk;
    }
    if (str.si !== tn.lock) tn.lockOn = tnF.onsetT;
    if (str.si === closestString(freq).si) tn.otherT = 0;   // (au-delà de 0,8 s d'une autre corde sans attaque entendue, on la croit)
    tn.lock = str.si; tn.lastF = freq;
  } else {
    str = tunerTargets()[tn.target];
    let c = 1200 * Math.log2(freq / str.freq);
    while (c > 600) { freq /= 2; c -= 1200; } while (c < -600) { freq *= 2; c += 1200; }
  }
  const cents = Math.round(1200 * Math.log2(freq / str.freq));
  const name = TN_FR[str.si], sub = str.si === 0 ? 'grave' : str.si === 5 ? 'aigu' : '';
  const note = $('tn-note');
  // corde choisie à la main, mais on en joue une autre
  const heardS = closestString(freq);
  if (!tn.auto && Math.abs(cents) > 350 && Math.abs(1200 * Math.log2(freq / heardS.freq)) < 60) {
    const heard = heardS;
    note.innerHTML = `<span class="tn-n off">${TN_FR[heard.si]}</span><span class="tn-s">Tu joues le ${TN_FR[heard.si]}.<b>On cherche le ${name}${sub ? ' ' + sub : ''}.</b></span>`;
    tnPoint(cents > 0 ? 50 : -50); tnMedi('curieuse', 'tilt');
    if (now - tn.wrongT > 1200) { tn.wrongT = now; tn.wrong++; }
    if (tn.wrong >= 2) tnHelp('corde' + str.si, str.si, `Pas celle-là. Le ${name}${sub ? ' ' + sub : ''}, c’est ${str.si === 0 ? 'la plus grosse corde : celle du haut, la plus près de ton visage' : str.si === 5 ? 'la plus fine : celle du bas' : 'la ' + (str.si + 1) + 'e corde en partant du haut'}.`);
    return;
  }
  tn.wrong = 0;
  tnHear(str.si, now);
  // très loin de la note en auto : on risque de confondre deux cordes, Médi propose le mode manuel
  if (tn.auto && Math.abs(cents) > 100) { if (!tn.farT) tn.farT = now; if (now - tn.farT > 2500) tnHelp('loin', null, 'Cette corde est très loin de sa note, je risque de la confondre avec une autre. Touche-la dans la rangée du bas : je n’écouterai qu’elle.'); }
  else tn.farT = 0;
  if (tn.armed && tn.armed !== str.si + 'x') tn.armed = '';   // autre corde : la fête pourra rejouer en revenant
  tnPoint(cents);
  // tolérance avec hystérésis : « juste » à ±5 cents (le seuil courant des accordeurs), on n'en sort qu'au-delà de ±8
  const inTune = Math.abs(cents) <= (tn.inT ? 8 : 5); tn.inT = inTune;
  note.innerHTML = `<span class="tn-n${inTune ? ' ok' : ''}">${name}</span><span class="tn-s">${sub}<b class="${inTune ? '' : 'c'}">${inTune ? 'juste' : (cents > 0 ? '+' : '−') + Math.abs(cents)}</b></span>`;
  if (inTune) {
    if (!tn.okT) tn.okT = now;
    tn.outT = 0;
    if (now - tn.okT > 300 && tn.armed !== str.si + 'x') { tn.armed = str.si + 'x'; tnJuste(str.si); }
  } else {
    if (!tn.outT) tn.outT = now;
    if (now - tn.outT > 200) { tn.okT = 0; if (tn.armed === str.si + 'x') tn.armed = ''; } // un écart bref ne remet pas le compteur à zéro
    // grattée sans arrêt, la corde reste un peu trop haute (elle ne se pose qu'en sonnant) : Médi le dit
    if (cents > 0 && cents < 25 && tnF.ons.filter(t => now - t < 2500).length >= 3) tnSay('Gratte une seule fois, doucement, et laisse sonner : la note se pose.', 'concentree', 'look');
    else tnSay(Math.abs(cents) > 25 ? `Encore trop ${cents > 0 ? 'haut' : 'bas'}. ${cents > 0 ? 'Desserre' : 'Serre'} un peu plus la mécanique.` : `Un peu trop ${cents > 0 ? 'haut' : 'bas'}. ${cents > 0 ? 'Desserre' : 'Serre'} doucement la mécanique.`, 'concentree', 'look');
  }
}
// la corde entendue s'allume dans la rangée (comme la mécanique dans GuitarTuna)
function tnHear(si, now) {
  if (si >= 0) tn.hearT = now;
  if (tn.hear === si) return; tn.hear = si;
  document.querySelectorAll('#tuner-strings button').forEach((b, i) => b.classList.toggle('hear', i === si));
}
function tnJuste(si) {
  const again = tn.tuned.has(si);
  tn.tuned.add(si);
  const nx = [0, 1, 2, 3, 4, 5].find(i => !tn.tuned.has(i));
  if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
  const r = $('tn-ring'); if (r) { r.classList.remove('go'); void r.getBoundingClientRect(); r.classList.add('go'); }
  // la fête « corde juste » (19/11) : l'arc se remplit, double onde, étincelles, ding, la case se coche
  const st = document.querySelector('#v-tuner .tn-stage');
  if (st) { st.classList.remove('win'); void st.offsetWidth; st.classList.add('win'); clearTimeout(tn.winT); tn.winT = setTimeout(() => st.classList.remove('win'), 1400); }
  const n = document.querySelector('#tn-note .tn-n'); if (n) n.classList.add('win');
  tnDing(nx == null && !again);
  tn.expr = ''; tnMedi('contente', nx == null && !again ? 'dance' : 'jump');
  if (!tn.helpK) $('tn-help').innerHTML = `<div class="bulle tn-b${nx == null && !again ? ' tn-fin' : ''}">${again ? `<b>${TN_FR[si]}${si === 0 ? ' grave' : si === 5 ? ' aigu' : ''} : juste !</b> ${nx == null ? 'Tout est juste.' : `Il reste le ${TN_FR[nx]}${nx === 5 ? ' aigu' : ''}.`}` : nx == null ? '<b>Guitare accordée !</b> Les six cordes sont justes, à toi de jouer.' : `<b>${TN_FR[si]}${si === 0 ? ' grave' : si === 5 ? ' aigu' : ''} : juste !</b> ${tn.auto ? 'On passe au' : 'Touche le'} ${TN_FR[nx]}${nx === 0 ? ' grave' : nx === 5 ? ' aigu' : ''}${tn.auto ? '' : ' pour continuer'}.`}</div>`;
  tn.pop = si;
  renderTunerStrings();
  tn.pop = -1;
}
function tnDing(big) {   // petit carillon, deux notes si tout est juste
  try {
    const ac = audio(); if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + .01;
    (big ? [[1318.5, 0], [1975.5, .12], [2637, .24]] : [[1318.5, 0], [1975.5, 0]]).forEach(([f, d], i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(i && !big ? .05 : .12, t + d + .008); g.gain.exponentialRampToValueAtTime(.0001, t + d + .7);
      o.connect(g); g.connect(ac.destination); o.start(t + d); o.stop(t + d + .75);
    });
  } catch (e) {}
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
    return `<button type="button" class="${on ? 'on' : ''}${ok ? ' ok' : ''}${tn.hear === i ? ' hear' : ''}${tn.pop === i ? ' pop' : ''}" aria-label="${STRING_LABELS_FULL[i]}${ok ? ', juste' : ''} (appui long : où est-elle ?)" aria-pressed="${on}" onpointerdown="tnDown(${i})" onpointerup="tnUp(${i},event)" onpointerleave="clearTimeout(tnPress)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();tnPick(${i})}"><b>${TN_FR[i]}</b>${ok ? '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1.5 5 L4.5 8 L10.5 2"/></svg>' : `<small>${6 - i}</small>`}</button>`;
  }).join('');
  if (!$('tuner-toggle').innerHTML) $('tuner-toggle').innerHTML = tunerStream ? TN_MIC_ON : TN_MIC_OFF;
  if (!$('tn-medi').innerHTML) { tnMedi('concentree', 'tilt'); tnSay('Touche « Écouter ma guitare » et joue une corde.'); }
}
function playRefString(i) {
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  pluck(fretFreq(i, 0, 0), ac.currentTime + 0.02, 2.2, .16);
}


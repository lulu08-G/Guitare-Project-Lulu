/* ═══════ TUNER — mic input, autocorrelation pitch detection ═══════
   Senior note: FFT peak-picking is too coarse for a single plucked string
   (harmonics fool it easily). Time-domain autocorrelation with parabolic
   interpolation is the standard choice for monophonic guitar tuners and is
   cheap enough to run several times a second in plain JS. */
const STRING_LABELS_FULL = ['Mi grave (6e)','La (5e)','Ré (4e)','Sol (3e)','Si (2e)','Mi aigu (1re)'];
const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
let tunerStream = null, tunerAnalyser = null, tunerBuf = null, tunerRAF = null, tunerLastRun = 0;

function tunerTargets() { return STRINGS.map((n, i) => ({name:n, freq: fretFreq(i, 0, 0), si:i})); }

async function toggleTuner() {
  if (tunerStream) { stopTuner(); return; }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}});
  } catch (e) { toast('Micro refuse ou indisponible', true); return; }
  tunerStream = stream;
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  const src = ac.createMediaStreamSource(stream);
  tunerAnalyser = ac.createAnalyser();
  tunerAnalyser.fftSize = 4096;
  src.connect(tunerAnalyser);
  tunerBuf = new Float32Array(tunerAnalyser.fftSize);
  const btn = $('tuner-toggle');
  btn.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Arrêter le micro';
  $('tuner-display').style.display = '';
  tunerLastRun = 0;
  tunerRAF = requestAnimationFrame(tunerLoop);
}
function stopTuner() {
  if (tunerRAF) cancelAnimationFrame(tunerRAF);
  tunerRAF = null;
  if (tunerStream) tunerStream.getTracks().forEach(t => t.stop());
  tunerStream = null; tunerAnalyser = null;
  const btn = $('tuner-toggle');
  if (btn) btn.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg> Activer le micro';
  const disp = $('tuner-display'); if (disp) disp.style.display = 'none';
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
function renderTunerReading(freq) {
  const disp = $('tuner-display'); if (!disp) return;
  if (!freq) { disp.innerHTML = `<div style="color:var(--cream4);font-size:13px;padding:20px 0">Joue une corde...</div>`; return; }
  const str = closestString(freq);
  const note = freqToNote(freq);
  const cents = Math.round(1200*Math.log2(freq/str.freq));
  const clamped = Math.max(-50, Math.min(50, cents));
  const inTune = Math.abs(cents) <= 5, close = Math.abs(cents) <= 15;
  const color = inTune ? 'var(--sage)' : close ? 'var(--gold2)' : 'var(--terra)';
  const W = 260, x = 10 + ((clamped+50)/100)*(W-20);
  disp.innerHTML = `
    <div style="font-family:var(--serif);font-size:46px;font-weight:800;color:${color};line-height:1">${str.name}</div>
    <div style="font-size:11px;color:var(--cream4);margin:2px 0 14px">${freq.toFixed(1)} Hz (${note.name}) · ${STRING_LABELS_FULL[str.si]}</div>
    <svg width="${W}" height="40" viewBox="0 0 ${W} 40" style="display:block;margin:0 auto">
      <line x1="10" y1="20" x2="${W-10}" y2="20" stroke="var(--border2)" stroke-width="2"/>
      <line x1="${W/2}" y1="7" x2="${W/2}" y2="33" stroke="var(--cream4)" stroke-width="1.5"/>
      ${[-40,-20,20,40].map(t => { const tx = 10 + ((t+50)/100)*(W-20); return `<line x1="${tx}" y1="15" x2="${tx}" y2="25" stroke="var(--border2)" stroke-width="1"/>`; }).join('')}
      <circle cx="${x}" cy="20" r="7" fill="${color}"/>
    </svg>
    <div style="font-size:12px;color:${color};font-weight:700;margin-top:8px">${inTune ? 'Juste !' : (cents > 0 ? 'Trop haut — detends' : 'Trop bas — tends')} (${cents>0?'+':''}${cents} cents)</div>`;
}
function renderTunerStrings() {
  const host = $('tuner-strings'); if (!host) return;
  host.innerHTML = tunerTargets().map((t, i) => `
    <div class="lib-card" style="cursor:pointer" onclick="playRefString(${i})">
      <div class="cn">${t.name}</div>
      <div style="font-size:9px;color:var(--cream4);text-align:center">${STRING_LABELS_FULL[i]}</div>
      <div class="lib-play"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></div>
    </div>`).join('');
}
function playRefString(i) {
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  pluck(fretFreq(i, 0, 0), ac.currentTime + 0.02, 2.2, .16);
}


/* ═══════ CAPTURE ÉCLAIR (test) — chroma-based chord guess, experimental ═══════
   Senior note: this is deliberately simple — accumulate spectral energy into a
   12-bin pitch-class histogram over the capture window, then correlate against
   24 major/minor triad templates. No fundamental tracking, no polyphonic
   transcription: it's a best-effort hint, not a real chord recognizer, which is
   why it lives behind a "Test" label rather than feeding a sheet directly. */
const NOTE_PC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const CHORD_TEMPLATES = (() => {
  const maj = [0,4,7], min = [0,3,7], out = [];
  for (let r = 0; r < 12; r++) {
    out.push({name: NOTE_PC[r], pcs: maj.map(iv => (r+iv)%12)});
    out.push({name: NOTE_PC[r]+'m', pcs: min.map(iv => (r+iv)%12)});
  }
  return out;
})();
let capStream = null, capAnalyser = null, capTimer = null, capChroma = null;
const CAP_DURATION = 5;
async function toggleCapture() {
  if (capStream) { stopCapture(); return; }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false, noiseSuppression:false, autoGainControl:false}});
  } catch (e) { toast('Micro refuse ou indisponible', true); return; }
  capStream = stream;
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  const src = ac.createMediaStreamSource(stream);
  capAnalyser = ac.createAnalyser();
  capAnalyser.fftSize = 8192;
  src.connect(capAnalyser);
  capChroma = new Array(12).fill(0);
  $('cap-toggle').textContent = 'Arrêter';
  $('cap-blob').style.display = '';
  $('cap-chips').innerHTML = '';
  let elapsed = 0;
  $('cap-timer').textContent = `00:0${CAP_DURATION}`;
  const buf = new Float32Array(capAnalyser.frequencyBinCount);
  capTimer = setInterval(() => {
    elapsed += 0.2;
    capAnalyser.getFloatFrequencyData(buf);
    accumulateChroma(buf, ac.sampleRate, capAnalyser.fftSize, capChroma);
    const remain = Math.max(0, CAP_DURATION - elapsed);
    $('cap-timer').textContent = `00:0${Math.ceil(remain)}`;
    renderCapGuess();
    if (elapsed >= CAP_DURATION) stopCapture();
  }, 200);
}
function accumulateChroma(dbBuf, sampleRate, fftSize, chroma) {
  const binHz = sampleRate / fftSize, minHz = 80, maxHz = 1000;
  for (let i = Math.floor(minHz/binHz); i < Math.min(dbBuf.length, Math.ceil(maxHz/binHz)); i++) {
    const db = dbBuf[i]; if (db < -80) continue;
    const mag = Math.pow(10, db/20);
    const midi = 69 + 12*Math.log2((i*binHz)/440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] += mag;
  }
}
function renderCapGuess() {
  const total = capChroma.reduce((a,b) => a+b, 0);
  if (total < 1e-6) return;
  const norm = capChroma.map(v => v/total);
  const top = CHORD_TEMPLATES
    .map(t => ({name: t.name, score: t.pcs.reduce((a,pc) => a + norm[pc], 0)}))
    .sort((a,b) => b.score - a.score)
    .slice(0, 3);
  $('cap-chips').innerHTML = top.map(t => `<button type="button" class="cap-chip" onclick="capAddChord('${t.name}')">${t.name}</button>`).join('');
}
function capAddChord(name) {
  const ta = $('imp-text');
  ta.value = (ta.value.trim() ? ta.value.trim() + ' ' : '') + name;
  toast(`${name} ajoute au texte a analyser`);
}
function stopCapture() {
  if (capTimer) clearInterval(capTimer);
  capTimer = null;
  if (capStream) capStream.getTracks().forEach(t => t.stop());
  capStream = null; capAnalyser = null;
  const btn = $('cap-toggle'); if (btn) btn.textContent = 'Écouter 5 secondes';
  const blob = $('cap-blob'); if (blob) blob.style.display = 'none';
  const timer = $('cap-timer'); if (timer) timer.textContent = '';
}


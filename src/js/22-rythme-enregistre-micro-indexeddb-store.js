/* ═══════ RYTHME ENREGISTRÉ — micro → IndexedDB (store media) → boucle sans trou ═══════
   p.rec = {mediaId, start, end, dur, at} par partie. Le blob complet reste stocké : le rognage (start/end, en secondes)
   est non destructif. Lecture : décodé en AudioBuffer, AudioBufferSourceNode loop + loopStart/loopEnd (boucle sans coupure). */
const recBuf = {};   // mediaId -> AudioBuffer décodé
let recPlay = null;  // {src, part, ctx}
let rc = null;       // session de la fenêtre d'enregistrement ({ctx: 'cur' mode jeu | 'draft' éditeur | 'at' Atelier})
const rcSheet = ctx => ctx === 'at' ? at.s : ctx === 'draft' ? draft : cur;
async function recDecode(blob) { return audio().decodeAudioData(await blob.arrayBuffer()); }
async function recBuffer(mediaId) {
  if (recBuf[mediaId]) return recBuf[mediaId];
  const m = await DB.get('media', mediaId); if (!m) return null;
  return (recBuf[mediaId] = await recDecode(m.blob));
}
function recLoopSrc(buf, start, end) {
  const ac = audio(), src = ac.createBufferSource();
  src.buffer = buf; src.loop = true; src.loopStart = start; src.loopEnd = Math.min(end, buf.duration);
  src.connect(OUT(ac)); src.start(0, start);
  return src;
}
function recStopPlay() {
  if (!recPlay) return;
  const R = recPlay; recPlay = null;
  try { R.src.stop(); R.src.disconnect(); } catch (e) {}
  if (cur) svSync();
  rbSyncRec();
}
async function recPlayToggle(i, ctx) {
  ctx = ctx || 'cur';
  if (recPlay && recPlay.part === i && recPlay.ctx === ctx) { recStopPlay(); return; }
  stopPlay();
  const p = rcSheet(ctx).parts[i]; if (!p || !p.rec) return;
  const buf = await recBuffer(p.rec.mediaId);
  if (!buf) { toast('Enregistrement introuvable', true); return; }
  const ac = audio(); if (ac.state === 'suspended') await ac.resume();
  recPlay = {src: recLoopSrc(buf, p.rec.start, p.rec.end), part: i, ctx};
  svSync(); rbSyncRec();
}
async function rcOpen(i, stage, ctx) {
  rcCleanup(); stopPlay();
  ctx = ctx || 'cur';
  const p = rcSheet(ctx).parts[i];
  rc = {ctx, part: i, stage: 'idle', start: 0, end: 0, isNew: true, count: LS.get('gms_rec_count', true) !== false};
  $('m-rec').classList.remove('hide');
  if (stage === 'trim' && p.rec) {
    const me = rc;
    rc.stage = 'load'; rcRender();
    const buf = await recBuffer(p.rec.mediaId);
    if (rc !== me) return;
    if (!buf) { toast('Enregistrement introuvable', true); rcClose(); return; }
    Object.assign(rc, {buf, start: p.rec.start, end: Math.min(p.rec.end, buf.duration), isNew: false, mediaId: p.rec.mediaId, stage: 'trim'});
    rc.peaks = rcPeaks(buf);
  }
  rcRender();
}
function rcCleanup() {
  if (!rc) return;
  const R = rc; rc = null;
  clearTimeout(R.tm); clearInterval(R.iv); (R.timers || []).forEach(clearTimeout);
  if (R.mr) { R.mr.onstop = null; R.mr.ondataavailable = null; try { if (R.mr.state !== 'inactive') R.mr.stop(); } catch (e) {} }
  if (R.stream) R.stream.getTracks().forEach(t => t.stop());
  if (R.msrc) { try { R.msrc.disconnect(); } catch (e) {} }
  if (R.prev) { try { R.prev.stop(); R.prev.disconnect(); } catch (e) {} }
}
function rcClose() { rcCleanup(); $('m-rec').classList.add('hide'); if (cur) svSync(); }
function rcPeaks(buf) {
  const d = buf.getChannelData(0), n = 400, step = Math.max(1, Math.floor(d.length/n)), out = [];
  for (let i = 0; i < n; i++) { let m = 0; for (let j = i*step; j < Math.min(d.length, (i+1)*step); j++) m = Math.max(m, Math.abs(d[j])); out.push(m); }
  const mx = Math.max(...out, .001); return out.map(v => v/mx);
}
const fmtS = v => v.toFixed(2).replace('.', ',') + ' s';
function rcRender() {
  if (!rc) return;
  const p = rcSheet(rc.ctx).parts[rc.part], bpm = rcSheet(rc.ctx).bpm || 90, h = $('m-rec-body');
  const name = p.name ? ' — ' + esc(p.name) : '';
  $('m-rec').classList.toggle('hide', (rc.stage === 'rec' && rc.ctx === 'cur') || !!rc.inline); // mode jeu : pendant la prise, tout se passe dans la barre du bas ; éditeur : dans la grande barre ⏺
  if (rc.inline) { edBar(); return; }
  if (rc.ctx === 'cur') svSync();
  if (rc.stage === 'load') h.innerHTML = `<div class="modal-t">Rythme enregistré ${name}</div><p style="color:var(--cream3)">Chargement…</p>`;
  else if (rc.stage === 'idle') h.innerHTML = `<div class="modal-t">Ma prise ${name}</div>
    <p style="font-size:13px;color:var(--cream3);margin-bottom:14px">Joue ton rythme à la guitare sur 1 à 4 mesures. Ensuite tu le rognes, et il tourne en boucle sans coupure dans le mode jeu.</p>
    <label style="display:flex;gap:10px;align-items:center;min-height:44px;font-size:14px;color:var(--cream)"><input type="checkbox" id="rc-count" ${rc.count?'checked':''} onchange="rc.count=this.checked;LS.set('gms_rec_count',this.checked)" style="width:22px;height:22px;accent-color:var(--gold)"> Décompte de 4 temps au métronome (${bpm} BPM)</label>
    <p style="font-size:11px;color:var(--cream4);margin:6px 0 16px">Le navigateur va demander l’accès au micro. Le clic du décompte n’est pas enregistré.</p>
    <button type="button" class="btn btn-primary rc-big" onclick="rcStart()">${REC_DOT_SVG.replace('<svg','<svg width="20" height="20" style="color:var(--terra)"')} Démarrer</button>
    <div class="modal-f"><button type="button" class="btn btn-ghost" onclick="rcClose()">Annuler</button></div>`;
  else if (rc.stage === 'count') h.innerHTML = `<div class="modal-t">Prépare-toi…</div><div class="rc-count" id="rc-n">4</div>
    <div class="modal-f"><button type="button" class="btn btn-ghost" onclick="rcClose()">Annuler</button></div>`;
  else if (rc.stage === 'rec') h.innerHTML = `<div class="modal-t">On enregistre</div>
    <div class="rc-rec"><span class="rec-dot"></span><span id="rc-t">0,0 s</span></div>
    <button type="button" class="btn btn-primary rc-big" onclick="rcStop()">${RH_STOP_SVG.replace('<svg','<svg width="20" height="20"')} Arrêter</button>`;
  else if (rc.stage === 'trim') {
    const dur = rc.buf.duration;
    h.innerHTML = `<div class="modal-t">Rogner la boucle ${name}</div>
      <canvas class="rc-wave" id="rc-wave"></canvas>
      <div class="rc-trim">
        <span>Début</span><input type="range" id="rc-s" min="0" max="${dur}" step="0.01" value="${rc.start}" oninput="rcTrim()" aria-label="Début de la boucle"><b id="rc-sv"></b>
        <span>Fin</span><input type="range" id="rc-e" min="0" max="${dur}" step="0.01" value="${rc.end}" oninput="rcTrim()" aria-label="Fin de la boucle"><b id="rc-ev"></b>
      </div>
      <p style="font-size:12px;color:var(--cream3)" id="rc-info"></p>
      <button type="button" class="btn btn-ghost rc-big" id="rc-prev" onclick="rcPreview()" style="min-height:48px">${RH_PLAY_SVG.replace('<svg','<svg width="18" height="18"')} Écouter la boucle</button>
      <div class="modal-f">
        <button type="button" class="btn btn-ghost" onclick="rcAgain()">Refaire</button><span class="spacer"></span>
        <button type="button" class="btn btn-ghost" onclick="rcClose()">Annuler</button>
        <button type="button" class="btn btn-primary" onclick="rcSave()">Garder ma prise</button>
      </div>`;
    rcTrim(true);
  }
}
async function rcStart() {
  const me = rc; if (!me) return;
  if (!window.MediaRecorder || !navigator.mediaDevices) { toast('Enregistrement audio non supporté ici', true); if (me.inline) { rcClose(); edBar(); } return; }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}}); }
  catch (e) { toast('Micro refusé ou indisponible', true); if (me.inline) { rcClose(); edBar(); } return; }
  if (rc !== me) { stream.getTracks().forEach(t => t.stop()); return; }
  me.stream = stream; me.chunks = [];
  try { // jauge de niveau du micro (pas relié aux haut-parleurs)
    const ac0 = audio(); if (ac0.state === 'suspended') ac0.resume();
    me.msrc = ac0.createMediaStreamSource(stream); me.an = ac0.createAnalyser(); me.an.fftSize = 512;
    me.b8 = new Uint8Array(me.an.fftSize); me.msrc.connect(me.an);
  } catch (e) { me.an = null; }
  const mr = me.mr = new MediaRecorder(stream);
  mr.ondataavailable = e => { if (e.data.size) me.chunks.push(e.data); };
  mr.onstop = () => rcStopped(me);
  const begin = () => {
    if (rc !== me) return;
    mr.start(); me.t0 = performance.now(); me.stage = 'rec'; rcRender();
    me.iv = setInterval(() => {
      const sec = Math.floor((performance.now() - me.t0)/1000), e = $('sv-rec-t'), e2 = $('rc-t');
      if (e2) e2.textContent = sec + ' s';
      if (e) e.textContent = 'Enregistrement ' + Math.floor(sec/60) + ':' + String(sec % 60).padStart(2, '0');
      let lv = 0;
      if (me.an) {
        me.an.getByteTimeDomainData(me.b8); let m = 0;
        for (let k = 0; k < me.b8.length; k++) m = Math.max(m, Math.abs(me.b8[k] - 128));
        lv = Math.min(1, m/128*1.6);
        const l = $('sv-lvl'); if (l) l.firstChild.style.width = lv*100 + '%';
      }
      if (me.inline) edRecTick(sec, lv);
    }, 70);
    me.tm = setTimeout(rcStop, 90000); // garde-fou : 90 s max
  };
  if (!me.count) { begin(); return; }
  me.stage = 'count'; rcRender();
  const ac = audio(); if (ac.state === 'suspended') await ac.resume();
  const beat = 60/(rcSheet(me.ctx).bpm || 90), t0 = ac.currentTime + .2;
  me.timers = [];
  for (let n = 0; n < 4; n++) {
    click(t0 + n*beat, n === 0);
    me.timers.push(setTimeout(() => { const e = $('rc-n') || $('ed-rc-n'); if (e) { e.textContent = 4 - n; mPop(e); } }, Math.max(0, (t0 + n*beat - ac.currentTime)*1000)));
  }
  me.timers.push(setTimeout(begin, Math.max(0, (t0 + 4*beat - ac.currentTime)*1000)));
}
function rcStop() { if (rc && rc.mr && rc.mr.state === 'recording') { clearInterval(rc.iv); clearTimeout(rc.tm); rc.mr.stop(); } }
async function rcStopped(me) {
  if (rc !== me) return;
  me.stream.getTracks().forEach(t => t.stop());
  try {
    me.blob = new Blob(me.chunks, {type: me.mr.mimeType || 'audio/webm'});
    me.buf = await recDecode(me.blob);
  } catch (e) { toast('Enregistrement illisible, réessaie', true); if (me.inline) { rcClose(); edBar(); return; } me.stage = 'idle'; rcRender(); return; }
  if (rc !== me) return;
  if (me.buf.duration < .4) { toast('Trop court, réessaie', true); if (me.inline) { rcClose(); edBar(); return; } me.stage = 'idle'; rcRender(); return; }
  me.start = 0; me.end = me.buf.duration; me.isNew = true; me.peaks = rcPeaks(me.buf); me.stage = 'trim';
  if (me.inline) {   // éditeur : la prise entière est gardée tout de suite, et le rythme est proposé en flèches s'il n'y en a pas encore
    try { const pp = rbPart(me.ctx, me.part); if (pp && wayOf(pp) === 'rh' && !rhHas(pp.rhythm)) { const r = rhFromTake(me.buf, draft && draft.bpm); if (r) { pp.rhythm = r.rhythm; if (draft && !draft.bpm) draft.bpm = r.bpm; toast('Rythme retrouvé : touche-le pour corriger une flèche'); } } } catch (e) {}
    rcSave(); return; }
  rcRender();
}
function rcAgain() { if (!rc) return; rcPreviewStop(); Object.assign(rc, {stage: 'idle', isNew: true, blob: null, buf: null}); rcRender(); }
function rcPreviewStop() { if (rc && rc.prev) { try { rc.prev.stop(); rc.prev.disconnect(); } catch (e) {} rc.prev = null; } const b = $('rc-prev'); if (b) b.innerHTML = RH_PLAY_SVG.replace('<svg','<svg width="18" height="18"') + ' Écouter la boucle'; }
function rcPreview() {
  if (!rc) return;
  if (rc.prev) { rcPreviewStop(); return; }
  const ac = audio(); if (ac.state === 'suspended') ac.resume();
  rc.prev = recLoopSrc(rc.buf, rc.start, rc.end);
  $('rc-prev').innerHTML = RH_STOP_SVG.replace('<svg','<svg width="18" height="18"') + ' Arrêter l’écoute';
}
function rcTrim(init) {
  if (!rc || !$('rc-s')) return;
  const s = $('rc-s'), e = $('rc-e'), dur = rc.buf.duration, min = Math.min(.2, dur);
  let a = +s.value, b = +e.value;
  if (!init) {
    if (document.activeElement === s) a = Math.min(a, b - min); else if (document.activeElement === e) b = Math.max(b, a + min);
  }
  a = Math.max(0, Math.min(a, dur - min)); b = Math.min(dur, Math.max(b, a + min));
  s.value = a; e.value = b; rc.start = a; rc.end = b;
  $('rc-sv').textContent = fmtS(a); $('rc-ev').textContent = fmtS(b);
  $('rc-info').textContent = `Boucle de ${fmtS(b - a)} sur ${fmtS(dur)} enregistrées.`;
  if (rc.prev) { rc.prev.loopStart = a; rc.prev.loopEnd = b; }
  rcDraw();
}
function rcDraw() {
  const cv = $('rc-wave'); if (!cv || !rc.peaks) return;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  cv.width = W*dpr; cv.height = H*dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement), gold = css.getPropertyValue('--gold').trim() || '#c8783a', mut = css.getPropertyValue('--border2').trim() || '#555';
  const dur = rc.buf.duration, x0 = rc.start/dur*W, x1 = rc.end/dur*W, n = rc.peaks.length;
  rc.peaks.forEach((v, i) => {
    const x = i/n*W, h = Math.max(2, v*(H-8));
    g.fillStyle = x >= x0 && x <= x1 ? gold : mut;
    g.fillRect(x, (H-h)/2, Math.max(1, W/n - 1), h);
  });
  g.fillStyle = gold; g.fillRect(x0, 0, 2, H); g.fillRect(x1 - 2, 0, 2, H);
}
// Enregistre la prise dans la partie. cur (mode jeu) et at (Atelier) sont des fiches déjà enregistrées ; draft (éditeur) ne l'est
// qu'au bouton Enregistrer : l'ancienne prise remplacée y est nettoyée à ce moment-là (saveSheet).
async function rcCommit(ctx, i) {
  if (ctx === 'cur') { cur.updatedAt = Date.now(); await DB.put('sheets', clone(cur)); viewSheet(cur.id, i); }
  else if (ctx === 'at') { atMark(); atRenderFiche(); }
  else renderParts();
}
async function rcSave() {
  if (!rc) return;
  const R = rc, i = R.part, ctx = R.ctx, p = rcSheet(ctx).parts[i];
  let mediaId = R.mediaId;
  if (R.isNew) {
    mediaId = uid();
    await DB.put('media', {id: mediaId, blob: R.blob, type: R.blob.type});
    recBuf[mediaId] = R.buf;
    if (p.rec) {
      const sv = ctx === 'draft' ? sheets.find(x => x.id === draft.id) : null;   // éditeur : l'ancienne prise ne part que si la fiche enregistrée ne la référence pas
      if (ctx !== 'draft' || !(sv && (sv.parts || []).some(q => q.rec && q.rec.mediaId === p.rec.mediaId))) { await DB.del('media', p.rec.mediaId); delete recBuf[p.rec.mediaId]; }
    }
  }
  p.rec = {mediaId, start: +R.start.toFixed(3), end: +R.end.toFixed(3), dur: +R.buf.duration.toFixed(3), at: Date.now()};
  rcClose(); toast('Ta prise est gardée');
  await rcCommit(ctx, i);
}
async function rcDelete(i, ctx) {
  ctx = ctx || 'cur';
  const p = rcSheet(ctx).parts[i]; if (!p || !p.rec) return;
  if (!confirm('Supprimer ta prise audio de cette partie ?')) return;
  stopPlay();
  if (ctx !== 'draft') { await DB.del('media', p.rec.mediaId); delete recBuf[p.rec.mediaId]; }
  delete p.rec;
  toast('Prise supprimée'); await rcCommit(ctx, i);
}


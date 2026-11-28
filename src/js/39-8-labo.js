/* ═══════ LABO DE TESTS (19/11) ═══════
   Caché : il n'apparaît qu'avec ?beta dans l'adresse (retenu sur l'appareil, ?beta=0 le coupe).
   Six essais de la « scène rythme » (Médi + la bande + ta ligne) et, pour chacun, l'avis du testeur :
   utile, fun, compris sans aide, encombrant, ça marche. Rien ici ne touche aux fiches.
   Les réponses restent sur l'appareil (gms_labo) ; « Envoyer mes réponses » les partage en texte. */
const LAB_Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(''); } })();
const IS_BETA = (() => { try { if (LAB_Q.has('beta')) LS.set('gms_beta', LAB_Q.get('beta') !== '0'); } catch (e) {} return !!LS.get('gms_beta', false); })();
const LAB_OPEN = LAB_Q.has('beta') && LAB_Q.get('beta') !== '0';

const LAB_TESTS = [
  {id: 'ecoute', t: 'Médi écoute, avec la bande', d: 'Sans casque : il entend tes coups, et pas la bande ?'},
  {id: 'suivre', t: 'Suivre Médi', d: 'La balle ou sur place : lequel tu suis le mieux ?', ask: ['La balle', 'Sur place', 'Pareil']},
  {id: 'lire', t: 'Lire un rythme sans flèches', d: 'Juste les cases où tu grattes.'},
  {id: 'variante', t: 'Une variante : le hammer', d: 'Le feu de camp, avec un hammer sur le 3.'},
  {id: 'devine', t: 'Devine le rythme', d: 'Écoute, puis choisis la bonne ligne.'},
  {id: 'morceau', t: 'Jouer un morceau', d: 'Avec la bande, ta version ou un audio : lequel sonne le mieux ?', ask: ['La bande', 'Ma version', 'Un audio']}
];
const LAB_QS = [['utile', 'Utile ?'], ['fun', 'Fun ?'], ['compris', 'Compris sans aide ?'], ['encombrant', 'Encombrant ?'], ['marche', 'Ça marche ?']];
// lignes de 8 croches : 1 = on gratte, 'H' = hammer (pas de grattage)
const LAB_L = {
  temps: [1, 0, 1, 0, 1, 0, 1, 0],
  feu: [1, 0, 1, 1, 0, 1, 1, 1],
  double: [1, 1, 1, 1, 1, 1, 1, 1],
  reggae: [0, 1, 0, 1, 0, 1, 0, 1],
  feuH: [1, 0, 1, 1, 'H', 1, 1, 1]
};
const LAB_NAMES = {temps: 'Sur le temps', feu: 'Le feu de camp', double: 'Doubler les coups', reggae: 'Reggae'};
const LAB_DRUMS = {k: [1, 0, 0, 0, 1, 1, 0, 0], s: [0, 0, 1, 0, 0, 0, 1, 0], h: [1, 1, 1, 1, 1, 1, 1, 1]};
const labGrid = () => grBand(grNew('4/4', 8, 1), null, {drums: LAB_DRUMS});   // la bande du labo, dans une grille du moteur
const LAB_SUB = ['1', 'et', '2', 'et', '3', 'et', '4', 'et'];
const TCHIK_SVG = cls => `<svg class="mt-pal ${cls || ''}" viewBox="0 0 200 200" aria-hidden="true"><g class="pv"><ellipse cx="100" cy="34" rx="70" ry="12" fill="#ffe7a3"/><ellipse cx="100" cy="50" rx="70" ry="12" fill="#ffd166"/><rect x="96" y="50" width="8" height="40" fill="#ffd166"/><circle cx="100" cy="140" r="58" fill="#ffd166"/><rect x="76" y="122" width="14" height="28" rx="7" fill="#1a0d02"/><rect x="110" y="122" width="14" height="28" rx="7" fill="#1a0d02"/></g></svg>`;

const lab = {view: 'home', s: null, timer: null, mic: null, res: {}, dv: null, audioEl: null, src: null};
const labAns = () => LS.get('gms_labo', {});
function labRoot(name) {   // fondamentale de l'accord, à l'octave de la basse (Mi 2 à Ré# 3)
  const m = String(name || 'E').match(/^([A-G])([#b]?)/); if (!m) return 82.41;
  const pc = {C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11}[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return 440 * Math.pow(2, (40 + ((pc - 4 + 12) % 12) - 69) / 12);
}

/* ── le moteur : Médi compte une mesure, puis la bande joue ; ta ligne défile ── */
function labStop(keepMic) {
  if (!keepMic) { rpStop(); if (typeof lvStop === 'function') lvStop(); if (typeof l26Stop === 'function') l26Stop(); if (typeof lsnStop === 'function') lsnStop(); }
  clearTimeout(lab.timer); lab.timer = null; lab.s = null;
  mtStop('lab');
  if (!keepMic) labMicOff();
  if (lab.audioEl) { try { lab.audioEl.pause(); } catch (e) {} }
  if (lab.src) { try { lab.src.stop(); } catch (e) {} lab.src = null; }
  document.querySelectorAll('#v-labo .now').forEach(e => e.classList.remove('now'));
}
function labPlay(cfg) {   // joué par le moteur unique (07-5-moteur-grille.js)
  labStop(true);   // le micro de « Médi écoute » reste ouvert
  const ac = audioReady();
  const S = lab.s = Object.assign({bpm: 70, bars: 4, count: true, band: true, chords: ['Am'], line: LAB_L.temps, demo: false, mode: 'ball',
    total: 0, next: ac.currentTime + .15, start: ac.currentTime + .15, expect: [], bandHits: []}, cfg);
  S.grid = labGrid();
  labPlace(0);
  mtPlay({owner: 'lab', at: S.next, dur: () => 60 / S.bpm / 2, cells: (S.bars + (S.count ? 1 : 0)) * 8, endDelay: 80,
    step: (k, t, d) => { S.total = k; S.next = t; const v = labStep(S, k % 8, Math.floor(k / 8), t, d); S.total = k + 1; S.next = t + d; return v; },
    vis: (k, t, d, T, v) => { if (lab.s === S) labVis(S, k % 8, v.b, v.isCount, d * 2); },
    onEnd: () => { const f = S.onEnd; if (lab.s === S) { lab.s = null; if (f) f(S); } },
    onKill: () => { if (lab.s === S) labStop(true); }});
}
function labStep(S, i, bar, t, dur) {
  const isCount = S.count && bar === 0, b = bar - (S.count ? 1 : 0), chord = S.chords[Math.max(0, b) % S.chords.length];
  if (isCount) { if (i % 2 === 0) metroClick(t, i === 0); }
  else {
    if (S.band) {
      const g = S.grid;
      mtBand(g, i, t, chord);
      if (g.boum.k[i]) S.bandHits.push(t);
      if (g.boum.s[i]) S.bandHits.push(t);
    } else if (i % 2 === 0) metroClick(t, i === 0);
    const v = S.line[i];
    if (v === 1) {
      S.expect.push(t);
      if (S.demo) strumChord(newChord(chord), 0, i % 2 ? 'U' : 'D', t, 1);
    } else if (v === 'H' && S.demo) {
      pluck(fretFreq(2, 0, 0), t, .45, .16); pluck(fretFreq(2, 2, 0), t + dur * .5, .6, .13);
    }
  }
  return {b, isCount};
}
function labVis(S, i, b, isCount, beatSec) {
  document.querySelectorAll('#lab-lane .now').forEach(e => e.classList.remove('now'));
  if (!isCount) { const c = document.querySelector(`#lab-lane .lc[data-i="${i}"]`); if (c) c.classList.add('now'); }
  if (!isCount && S.band) {
    if (LAB_DRUMS.k[i] || LAB_DRUMS.s[i]) metroBump(document.querySelector('#lab-band .boum .pv'), LAB_DRUMS.s[i] ? 12 : 7, 260, .12);
    if (LAB_DRUMS.h[i]) metroBump(document.querySelector('#lab-band .tchik .pv'), 4, 160, .04);
    if (LAB_DRUMS.k[i]) metroBump(document.querySelector('#lab-band .basile .pv'), 8, 300, .08);
  }
  if (i === 0) { const ch = $('lab-chord'); if (ch) ch.textContent = isCount ? 'Prêt ?' : S.chords[b % S.chords.length]; }
  if (i % 2) return;
  const beat = i / 2;
  document.querySelectorAll('#lab-pads i').forEach((p, k) => p.classList.toggle('now', k === beat));
  const say = $('lab-say'); if (say && isCount) say.textContent = 'Médi compte : ' + (beat + 1);
  if (say && !isCount && i === 0 && b === 0) say.textContent = S.demo ? 'Écoute Médi jouer la ligne.' : 'À toi : gratte sur les cases orange.';
  labMedi(S.mode, beat, beatSec);
}
// Médi : la balle (saute de chiffre en chiffre et arrive pile sur le temps suivant) ou sur place
function labPadX(k) { const p = document.querySelectorAll('#lab-pads i')[k], w = $('lab-pads'); return p && w ? p.offsetLeft + p.offsetWidth / 2 : 0; }
function labPlace(k) {
  const m = $('lab-medi'); if (!m) return;
  const mode = lab.s ? lab.s.mode : 'ball', x = mode === 'ball' ? labPadX(k) : ($('lab-pads') ? $('lab-pads').offsetWidth / 2 : 0);
  m.style.transform = `translateX(${x - m.offsetWidth / 2}px)`;
}
function labMedi(mode, beat, beatSec) {
  const m = $('lab-medi'); if (!m || !m.animate) return;
  const w = m.offsetWidth / 2;
  if (mReduced()) return;
  m.getAnimations().forEach(a => a.cancel());
  if (mode === 'place') {
    const x = $('lab-pads').offsetWidth / 2 - w, h = beat === 0 ? 34 : 18;
    m.style.transform = `translateX(${x}px)`;
    m.animate([{transform: `translateX(${x}px) scale(1.14,.86)`}, {transform: `translateX(${x}px) translateY(-${h}px)`, offset: .35}, {transform: `translateX(${x}px)`}], {duration: Math.min(520, beatSec * 850), easing: 'ease-out'});
    return;
  }
  const x0 = labPadX(beat) - w, x1 = labPadX((beat + 1) % 4) - w, h = beat === 3 ? 70 : 42;
  m.animate([{transform: `translateX(${x0}px) scale(1.14,.86)`}, {transform: `translateX(${x0}px)`, offset: .08},
    {transform: `translateX(${(x0 + x1) / 2}px) translateY(-${h}px)${beat === 3 ? ' rotate(-16deg)' : ''}`, offset: .5}, {transform: `translateX(${x1}px)`}],
    {duration: beatSec * 1000, easing: 'linear'});
  m.style.transform = `translateX(${x1}px)`;
}

/* ── le micro : on compte les attaques (aigus seulement : la grosse caisse et la basse passent dessous) ── */
async function labMicOn(aec) {
  labMicOff();
  let st;
  try { st = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: aec, noiseSuppression: false, autoGainControl: false}}); }
  catch (e) { toast('Micro refusé ou indisponible', true); return false; }
  const ac = audioReady(), src = ac.createMediaStreamSource(st), hp = ac.createBiquadFilter(), an = ac.createAnalyser();
  hp.type = 'highpass'; hp.frequency.value = 1200; an.fftSize = 512;
  src.connect(hp); hp.connect(an);
  lab.mic = {st, an, buf: new Float32Array(512), avg: 0, last: 0, on: [], raf: 0, aec};
  const loop = () => {
    const M = lab.mic; if (!M) return;
    M.an.getFloatTimeDomainData(M.buf);
    let r = 0; for (let k = 0; k < M.buf.length; k++) r += M.buf[k] * M.buf[k];
    r = Math.sqrt(r / M.buf.length);
    const now = ac.currentTime;
    if (r > .012 && r > M.avg * 2.4 && now - M.last > .09) { M.last = now; M.on.push({t: now - M.buf.length / ac.sampleRate / 2, r}); }
    M.avg = M.avg * .9 + r * .1;
    M.raf = requestAnimationFrame(loop);
  };
  lab.mic.raf = requestAnimationFrame(loop);
  return true;
}
function labMicOff() { const M = lab.mic; if (!M) return; cancelAnimationFrame(M.raf); M.st.getTracks().forEach(t => t.stop()); lab.mic = null; }

/* ── écrans ── */
function labRender() {
  const h = $('lab-body'); if (!h) return;
  if (lab.view === 'home') { rpRender(); return; }   // S'entraîner v2 (39-9)
  if (lab.view === 'tests') { h.innerHTML = labHomeHTML(); return; }
  if (lab.view === 'tests26') { h.innerHTML = l26HomeHTML(); return; }
  if (lab.view === 'l27-son') { h.innerHTML = lsnHTML(); lsnAfter(); return; }
  if (lab.view === 'l27-medi') { h.innerHTML = mnHTML(); return; }   // Médi chante (39-997)   // le son de tes prises (39-996)
  const G = labGroup(lab.view), T = G.list.find(x => x.id === lab.view);
  if (!T) { lab.view = 'home'; labRender(); return; }
  h.innerHTML = `<div class="lab-top"><button type="button" class="mt-back" onclick="labGo('${G.home}')" aria-label="Retour aux tests"><svg viewBox="0 0 10 16"><path d="M8 2 L2 8 L8 14"/></svg></button><div><small>Labo · test ${G.list.indexOf(T) + 1} sur ${G.list.length}</small><h1>${T.t}</h1></div></div>
    <div id="lab-test">${labTestHTML(T.id)}</div>${labFormHTML(T)}`;
  labAfterRender(T.id);
}
function labGo(v) { labStop(); lab.view = v; labRender(); window.scrollTo(0, 0); }
// les deux séries de tests : celle du 19/11 et celle du 26/11 (39-95-labo-26-11.js)
const labGroup = id => /^l27-/.test(id) ? {list: LAB_TESTS27, home: 'home'} : /^l26-/.test(id) ? {list: LAB_TESTS26, home: 'tests26'} : {list: LAB_TESTS, home: 'tests'};
function labHomeHTML() {
  const A = labAns(), n = LAB_TESTS.filter(t => A[t.id]).length;
  return `<div class="rp-top"><button type="button" class="mt-back" onclick="labGo('home')" aria-label="Retour à S’entraîner">${RP_BACK}</button><div><small>Labo</small><h1>Les tests du 19/11</h1></div></div>
    ${mediBulle('curieuse', 'Ici on essaie des idées. Fais chaque test, puis dis ce que tu en penses : sans pitié !', {size: 56, cls: 'lab-medi-b'})}
    <div class="lab-list">${LAB_TESTS.map((t, k) => `<button type="button" class="lab-card${A[t.id] ? ' done' : ''}" onclick="labGo('${t.id}')"><span class="lab-n">${A[t.id] ? '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1.5 5 L4.5 8 L10.5 2"/></svg>' : k + 1}</span><span class="lab-ct"><b>${t.t}</b><small>${t.d}</small></span></button>`).join('')}</div>
    <div class="lab-foot"><span>${n} test${n > 1 ? 's' : ''} sur ${LAB_TESTS.length} faits</span>
      <button type="button" class="btn btn-primary" onclick="labExport()" ${n ? '' : 'disabled'}>Envoyer mes réponses</button></div>`;
}
function labSceneHTML(mode) {
  return `<section class="lab-scene">
    <div class="lab-band" id="lab-band">${BOUM_SVG(true, 'boum')}${TCHIK_SVG('tchik')}${BASILE_SVG(true, 'basile')}</div>
    <div class="lab-stage"><div class="lab-pads" id="lab-pads"><span class="lab-medi" id="lab-medi">${mediSVG('contente', {size: 64, anim: 'still', label: 'Médi'})}</span><i>1</i><i>2</i><i>3</i><i>4</i></div></div>
    <div class="lab-say" id="lab-say">${mode === 'place' ? 'Médi saute sur place, à chaque temps.' : 'Médi saute de chiffre en chiffre.'}</div>
  </section>`;
}
function labLaneHTML(line, chords) {
  const cell = (v, i) => `<span class="lc${v === 1 ? ' on' : v === 'H' ? ' h' : ''}${i % 2 ? '' : ' bt'}" data-i="${i}">${v === 'H' ? '<b>H</b>' : '<i></i>'}</span>`;
  return `<div class="lab-lane" id="lab-lane"><div class="lab-lh"><span class="lab-ch" id="lab-chord">${esc(chords[0])}</span><span class="lab-chs">${chords.map(esc).join(' → ')}</span></div>
    <div class="lab-g">${LAB_SUB.map((s, i) => `<span class="lh${i % 2 ? '' : ' bt'}">${s}</span>`).join('')}${line.map(cell).join('')}</div></div>`;
}
const LAB_PLAY = '<svg viewBox="0 0 14 16" aria-hidden="true"><path d="M2 1 L13 8 L2 15 Z"/></svg>';
function labTestHTML(id) {
  if (/^l26-/.test(id)) return l26TestHTML(id);
  if (id === 'ecoute') return `${labSceneHTML('ball')}${labLaneHTML(LAB_L.temps, ['Am', 'C'])}
    <div class="lab-steps"><p><b>1.</b> Pose le téléphone à côté de toi, son fort, <b>sans casque</b>. Touche « Étape 1 » et <b>ne joue pas</b> : Médi écoute la bande seule.</p>
    <p><b>2.</b> « Étape 2 » : gratte sur chaque case orange (une fois par temps).</p></div>
    <div class="lab-acts"><button type="button" class="btn btn-ghost" onclick="labEcoute(1)">Étape 1 : je ne joue pas</button><button type="button" class="btn btn-primary" onclick="labEcoute(2)">Étape 2 : je joue</button></div>
    <label class="lab-aec"><input type="checkbox" id="lab-aec" checked> Anti-écho du téléphone (à décocher pour comparer)</label>
    <div class="lab-res" id="lab-res"></div>`;
  if (id === 'suivre') return `${labSceneHTML('ball')}${labLaneHTML(LAB_L.temps, ['G', 'D'])}
    <p class="lab-p">Gratte une fois par temps, en suivant Médi. Essaie les deux, puis dis lequel tu suis le mieux.</p>
    <div class="lab-acts"><button type="button" class="btn btn-primary" onclick="labRun({mode:'ball',chords:['G','D'],line:LAB_L.temps})">${LAB_PLAY}La balle</button><button type="button" class="btn btn-primary" onclick="labRun({mode:'place',chords:['G','D'],line:LAB_L.temps})">${LAB_PLAY}Sur place</button></div>`;
  if (id === 'lire') return `<div class="lab-explain"><b>Plus de flèches.</b> Ta main fait l'aller-retour tout le temps : en bas sur les chiffres, en haut sur les « et ». Tu touches les cordes <b>seulement sur les cases orange</b>.</div>
    ${labSceneHTML('ball')}${labLaneHTML(LAB_L.feu, ['G', 'C'])}
    <div class="lab-acts"><button type="button" class="btn btn-ghost" onclick="labRun({demo:true,chords:['G','C'],line:LAB_L.feu,bars:2})">${LAB_PLAY}Écouter Médi</button><button type="button" class="btn btn-primary" onclick="labRun({chords:['G','C'],line:LAB_L.feu})">${LAB_PLAY}À toi</button></div>`;
  if (id === 'variante') return `<div class="lab-explain">Le feu de camp, mais <b>sur le 3</b> (case H) tu ne grattes pas : pince la corde de <b>Ré à vide</b>, puis fais tomber ton doigt sur la <b>case 2</b> (hammer). Ça marche sur Am et sur C.</div>
    ${labSceneHTML('ball')}${labLaneHTML(LAB_L.feuH, ['Am', 'C'])}
    <div class="lab-acts"><button type="button" class="btn btn-ghost" onclick="labRun({demo:true,chords:['Am','C'],line:LAB_L.feuH,bars:2,bpm:66})">${LAB_PLAY}Écouter Médi</button><button type="button" class="btn btn-primary" onclick="labRun({chords:['Am','C'],line:LAB_L.feuH,bpm:66})">${LAB_PLAY}À toi</button></div>`;
  if (id === 'devine') return `${labSceneHTML('ball')}<div id="lab-dv"></div>`;
  if (id === 'morceau') {
    const list = sheets.slice(0, 12), withRec = list.find(s => (s.parts || []).some(p => p.rec));
    lab.mSheet = lab.mSheet || (withRec || list[0] || {}).id;
    const s = sheets.find(x => x.id === lab.mSheet), has = s && (s.parts || []).some(p => p.rec);
    return `${labSceneHTML('place')}
      <label class="lab-sel">Le morceau <select onchange="lab.mSheet=this.value;labStop();labRender()">${list.map(x => `<option value="${x.id}" ${x.id === lab.mSheet ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select></label>
      <p class="lab-p">Joue le morceau trois fois : avec la bande, par-dessus ta version enregistrée, puis par-dessus un audio du téléphone (l'original par exemple).</p>
      <div class="lab-acts col"><button type="button" class="btn btn-primary" onclick="labMorceauBande()">${LAB_PLAY}Avec la bande</button>
      <button type="button" class="btn btn-ghost" onclick="labMorceauRec()" ${has ? '' : 'disabled'}>${LAB_PLAY}Avec ma version${has ? '' : ' (aucune sur ce morceau)'}</button>
      <label class="btn btn-ghost lab-file">${LAB_PLAY}Avec un audio du téléphone<input type="file" accept="audio/*" onchange="labMorceauFile(this)" hidden></label>
      <button type="button" class="btn btn-ghost" onclick="labStop()">Stop</button></div>`;
  }
  return '';
}
function labAfterRender(id) {
  if (/^l26-/.test(id)) { l26After(id); return; }
  requestAnimationFrame(() => labPlace(0));
  if (id === 'devine') labDvNew();
}
function labRun(cfg) {
  labPlay(Object.assign({onEnd: () => { const s = $('lab-say'); if (s) s.textContent = 'Fini. Encore une fois, ou donne ton avis plus bas.'; }}, cfg));
}

/* test 1 : Médi écoute */
async function labEcoute(step) {
  const aec = !!($('lab-aec') || {}).checked;
  if (!await labMicOn(aec)) return;
  const res = $('lab-res'); if (res) res.innerHTML = `<p>${step === 1 ? 'Ne joue pas… Médi écoute la bande.' : 'Gratte sur les cases orange !'}</p>`;
  labPlay({chords: ['Am', 'C'], line: LAB_L.temps, bars: step === 1 ? 2 : 4, bpm: 72, onEnd: S => {
    const on = (lab.mic ? lab.mic.on : []).filter(o => o.t > S.start + 60 / S.bpm * 4 - .05);   // après la mesure comptée
    labMicOff();
    if (step === 1) {
      // calibration : ce que le micro entend de la bande seule (délai et force)
      const lat = on.map(o => { const d = S.bandHits.map(h => o.t - h).filter(x => x > -.03 && x < .2); return d.length ? Math.min(...d) : null; }).filter(x => x != null).sort((a, b) => a - b);
      lab.res = Object.assign(lab.res, {aec, fuite: on.length, lat: lat.length ? lat[lat.length >> 1] : null, rmax: on.reduce((m, o) => Math.max(m, o.r), 0)});
      res.innerHTML = `<p><b>Étape 1 :</b> Médi a entendu la bande <b>${on.length} fois</b> (idéal : 0), anti-écho ${aec ? 'activé' : 'coupé'}.</p><p>Passe à l'étape 2.</p>`;
      return;
    }
    const R = lab.res, lat = R.lat != null ? R.lat : .06;
    // on écarte ce qui ressemble à la bande (même moment, pas plus fort que pendant l'étape 1)
    const mine = on.filter(o => !(R.rmax && o.r < R.rmax * 1.3 && S.bandHits.some(h => Math.abs(o.t - (h + lat)) < .045)));
    let ok = 0; const used = new Set();
    S.expect.forEach(e => { const k = mine.findIndex((o, j) => !used.has(j) && Math.abs(o.t - lat - e) < .13); if (k >= 0) { used.add(k); ok++; } });
    lab.res = Object.assign(R, {aec, entendus: on.length, gardes: mine.length, justes: ok, attendus: S.expect.length});
    res.innerHTML = `<p><b>Étape 2 :</b> ${ok} coups sur ${S.expect.length} dans le temps.</p>
      <p class="lab-dim">Détails : ${on.length} sons entendus, ${mine.length} gardés comme « toi » après le tri de la bande ; fuite de la bande à l'étape 1 : ${R.fuite != null ? R.fuite : '?'}.</p>
      <p>Ce score te semble juste ? Dis-le plus bas.</p>`;
  }});
}

/* test 5 : devine le rythme */
function labDvNew() {
  const keys = ['temps', 'feu', 'double', 'reggae'], good = keys[Math.floor(Math.random() * keys.length)];
  const opts = [good, ...keys.filter(k => k !== good).sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5);
  lab.dv = Object.assign(lab.dv || {round: 0, score: 0}, {good, opts, picked: null});
  labDvRender();
}
function labDvRender() {
  const D = lab.dv, h = $('lab-dv'); if (!h) return;
  if (D.round >= 3) { h.innerHTML = `<p class="lab-p"><b>${D.score} sur 3.</b> ${D.score === 3 ? 'Bravo, l’oreille est là.' : 'Rejoue pour t’entraîner.'}</p><div class="lab-acts"><button type="button" class="btn btn-primary" onclick="lab.dv=null;labDvNew()">Rejouer</button></div>`; return; }
  const mini = l => `<span class="lab-mini">${l.map((v, i) => `<i class="${v === 1 ? 'on' : ''}${i % 2 ? '' : ' bt'}"></i>`).join('')}</span>`;
  h.innerHTML = `<p class="lab-p">Manche ${D.round + 1} sur 3 : écoute Médi, puis touche la ligne qu’il joue.</p>
    <div class="lab-acts"><button type="button" class="btn btn-primary" onclick="labRun({demo:true,chords:['G','D'],line:LAB_L['${D.good}'],bars:2})">${LAB_PLAY}Écouter</button></div>
    <div class="lab-opts">${D.opts.map(k => `<button type="button" class="lab-opt${D.picked ? (k === D.good ? ' ok' : k === D.picked ? ' ko' : '') : ''}" onclick="labDvPick('${k}')" ${D.picked ? 'disabled' : ''}>${mini(LAB_L[k])}<small>${D.picked ? LAB_NAMES[k] : ''}</small></button>`).join('')}</div>
    ${D.picked ? `<div class="lab-acts"><button type="button" class="btn btn-ghost" onclick="lab.dv.round++;labDvNew()">Manche suivante</button></div>` : ''}`;
}
function labDvPick(k) { const D = lab.dv; if (D.picked) return; D.picked = k; if (k === D.good) D.score++; labStop(); labDvRender(); }

/* test 6 : un morceau */
function labSheet() { return sheets.find(x => x.id === lab.mSheet); }
function labMorceauBande() {
  const s = labSheet(); if (!s) return;
  const p = (s.parts || []).find(x => x.chords && x.chords.length) || {chords: [newChord('G')]};
  labRun({mode: 'place', bpm: s.bpm || 90, bars: 8, chords: p.chords.map(c => c.name || 'G'), line: [0, 0, 0, 0, 0, 0, 0, 0]});
}
async function labMorceauRec() {
  labStop();
  const s = labSheet(), p = s && (s.parts || []).find(x => x.rec); if (!p) return;
  const buf = await recBuffer(p.rec.mediaId); if (!buf) { toast('Prise introuvable', true); return; }
  const ac = audioReady(), src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination);
  src.start(ac.currentTime + .05, p.rec.start || 0, Math.max(.5, (p.rec.end || buf.duration) - (p.rec.start || 0)));
  lab.src = src; const say = $('lab-say'); if (say) say.textContent = 'Ta version joue. Joue par-dessus.';
}
function labMorceauFile(inp) {
  const f = inp.files && inp.files[0]; if (!f) return;
  labStop();
  if (!lab.audioEl) lab.audioEl = new Audio();
  lab.audioEl.src = URL.createObjectURL(f); lab.audioEl.play().catch(() => {});
  const say = $('lab-say'); if (say) say.textContent = 'L’audio joue. Joue par-dessus.';
  inp.value = '';
}

/* ── l'avis du testeur ── */
function labFormHTML(T) {
  const a = labAns()[T.id] || {};
  const tri = (k, l) => `<div class="lab-q"><span>${l}</span><div role="group" aria-label="${l}">${['Oui', 'Bof', 'Non'].map(v => `<button type="button" class="${a[k] === v ? 'on' : ''}" aria-pressed="${a[k] === v}" onclick="labSet('${T.id}','${k}','${v}')">${v}</button>`).join('')}</div></div>`;
  return `<section class="lab-form"><h2>Ton avis</h2>
    ${T.ask ? `<div class="lab-q wide"><span>${T.askq || (T.id === 'suivre' ? 'Lequel tu suis le mieux ?' : 'Lequel ressemble le plus au morceau ?')}</span><div role="group">${T.ask.map(v => `<button type="button" class="${a.choix === v ? 'on' : ''}" onclick="labSet('${T.id}','choix','${v}')">${v}</button>`).join('')}</div></div>` : ''}
    ${LAB_QS.map(([k, l]) => tri(k, l)).join('')}
    <textarea id="lab-note" rows="3" placeholder="Une remarque ? Ce qui t’a gêné, ce qui t’a plu…">${esc(a.note || '')}</textarea>
    <button type="button" class="btn btn-primary lab-save" onclick="labSave('${T.id}')">Enregistrer mon avis</button></section>`;
}
function labSet(id, k, v) {
  const A = labAns(); A[id] = Object.assign(A[id] || {}, {[k]: v}); LS.set('gms_labo', A);
  document.querySelectorAll('.lab-form .lab-q').forEach(q => q.querySelectorAll('button').forEach(b => { if (b.getAttribute('onclick').includes(`'${k}','`)) { const on = b.textContent === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); } }));
}
function labSave(id) {
  const A = labAns(), n = $('lab-note');
  A[id] = Object.assign(A[id] || {}, {note: n ? n.value.trim() : '', at: Date.now()});
  if (id === 'ecoute' && lab.res) A[id].mesures = lab.res;
  if (id === 'devine' && lab.dv) A[id].score = lab.dv.score;
  LS.set('gms_labo', A); toast('Merci, avis enregistré !');
  const G = labGroup(id), k = G.list.findIndex(t => t.id === id), nx = G.list.slice(k + 1).find(t => !A[t.id]);
  labGo(nx ? nx.id : G.home);
}
async function labExport() {
  const A = labAns();
  const txt = 'Guitar Memory, labo de tests\n' + (navigator.userAgent || '') + '\n\n' + LAB_TESTS27.concat(LAB_TESTS26, LAB_TESTS, RP_AVIS).filter(t => A[t.id]).map(t => {
    const a = A[t.id];
    return `■ ${t.t}\n` + (a.choix ? `  Préféré : ${a.choix}\n` : '') + LAB_QS.map(([k, l]) => a[k] ? `  ${l} ${a[k]}\n` : '').join('')
      + (a.score != null ? `  Score : ${a.score}/3\n` : '') + (a.mesures ? `  Mesures : ${JSON.stringify(a.mesures)}\n` : '') + (a.note ? `  Remarque : ${a.note}\n` : '');
  }).join('\n');
  try { if (navigator.share) { await navigator.share({title: 'Mes réponses au labo', text: txt}); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(txt); toast('Réponses copiées : colle-les dans un message.'); } catch (e) { prompt('Copie tes réponses :', txt); }
}

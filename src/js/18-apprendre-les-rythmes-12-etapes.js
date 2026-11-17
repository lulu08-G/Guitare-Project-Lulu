/* ═══════ APPRENDRE LES RYTHMES — 12 étapes, un seul accord facile, la main droite d'abord ═══════
   Chaque étape : le rythme en gros (flèches + comptage), lecture en boucle au tempo de départ, montée de +5 BPM
   vers la cible, bouton « Réussi » (enregistré dans exoProg : done / best / hist) qui débloque l'étape suivante. */
const RH_COURSE = [
 {id:'rc1',  rh:'noires',   bpm:[50,80],  consigne:'Un bas sur chaque temps, en comptant 1-2-3-4 à voix haute.', ok:'4 mesures de suite sans trou à 70 bpm.'},
 {id:'rc2',  rh:'croches',  bpm:[50,80],  consigne:'La main balance sans s\'arrêter : bas sur le temps, haut sur le « et ».', ok:'8 mesures régulières, sans accélérer, à 70 bpm.'},
 {id:'rc3',  rh:'trous',    bpm:[60,90],  consigne:'Même balancement, mais ne touche pas les cordes sur les cases vides.', ok:'La main ne s\'arrête jamais et les trous restent muets, 8 mesures à 80 bpm.'},
 {id:'rc4',  rh:'reggae',   bpm:[60,90],  consigne:'Seulement les coups hauts sur les « et » : le bas se fait dans le vide.', ok:'Hauts réguliers et légers pendant 8 mesures à 80 bpm.'},
 {id:'rc5',  rh:'motown',   bpm:[70,100], consigne:'Bas francs, hauts à peine effleurés : écoute la différence de volume.', ok:'On entend nettement fort/doux pendant 8 mesures à 90 bpm.'},
 {id:'rc6',  rh:'chuck',    bpm:[70,100], consigne:'Sur les temps 2 et 4, étouffe l\'accord de la main gauche et frappe : « tchak ».', ok:'Le « tchak » est sec et en place, 8 mesures à 85 bpm.'},
 {id:'rc7',  rh:'feucamp',  bpm:[70,100], consigne:'Le rythme classique : le temps 3 est muet, la main continue à balancer.', ok:'8 mesures à 85 bpm sans regarder la main, en chantant par-dessus.'},
 {id:'rc8',  rh:'popsync',  bpm:[75,105], consigne:'Les temps 2 et 3 sont muets : tu ne joues que les « et » entre les deux bas.', ok:'4 mesures sur 2 accords différents à 90 bpm.'},
 {id:'rc9',  rh:'valse',    bpm:[70,110], consigne:'Compte 1-2-3 : un bas fort, puis deux bas doux.', ok:'8 mesures en 3/4 sans glisser vers 4 temps, à 90 bpm.'},
 {id:'rc10', rh:'six8',     bpm:[50,80],  consigne:'Compte 1-2-3 4-5-6 : deux gros temps de trois croches.', ok:'8 mesures stables à 65 bpm (la noire pointée).'},
 {id:'rc11', rh:'shuffle',  bpm:[60,90],  consigne:'Chaque temps a 3 pulsations : tu joues la 1re et la 3e (bas, trou, haut).', ok:'Swing régulier pendant 8 mesures à 80 bpm sur un blues en mi.'},
 {id:'rc12', rh:'doubles',  bpm:[50,80],  consigne:'Quatre coups par temps : poignet souple, petits mouvements.', ok:'8 mesures à 60 bpm sans te crisper, puis 70.'},
];
const rcz = {cur:null, bpm:70, click:true, bars:0};
const rccRh = st => RHYTHMS.find(r => r.id === st.rh);
const rccUnlocked = () => true;   // tout est libre : on choisit le rythme qu'on veut
const rccBpmOf = st => Math.max(st.bpm[0], Math.min(st.bpm[1], exoProg.best[st.id] ? exoProg.best[st.id] : st.bpm[0]));
const rccChord = () => newChord('Em');
const rccArrows = pat => [...pat].map(ch => ch === '-' ? '·' : ch.toLowerCase() === 'x' ? '✕' : ch.toLowerCase() === 'u' ? '↑' : '↓').join('');
function rccStop() { if (rhPlaying('rc')) rhStop(); }
function rccOpen(i) {
  if (!rccUnlocked(i)) return;
  rccStop(); rcz.cur = i; rcz.bpm = RH_COURSE[i].bpm[0]; rcz.bars = 0;
  exoRender(); window.scrollTo(0, 0);
}
function rccBack() { rccStop(); rcz.cur = null; exoRender(); window.scrollTo(0, 0); }
function rccTempo(d) {
  const st = RH_COURSE[rcz.cur];
  rcz.bpm = Math.max(30, Math.min(st.bpm[1] + 20, rcz.bpm + d));
  if (rhPlaying('rc')) rhSetBpm(rcz.bpm);
  rccSync();
}
function rccClick() { rcz.click = !rcz.click; if (rhP && rhP.key === 'rc') rhP.mute = !rcz.click; rccSync(); }
function rccSync() {
  const st = RH_COURSE[rcz.cur]; if (!st || !$('rc-bpm')) return;
  $('rc-bpm').firstChild.nodeValue = rcz.bpm;
  const b = $('rc-click'); b.classList.toggle('on', rcz.click); b.textContent = rcz.click ? 'Métronome : oui' : 'Métronome : non';
  const f = Math.max(0, Math.min(1, (rcz.bpm - st.bpm[0])/Math.max(1, st.bpm[1] - st.bpm[0])));
  $('rc-fill').style.width = Math.round(f*100) + '%';
  $('rc-up').disabled = rcz.bpm >= st.bpm[1];
  $('rc-up').classList.toggle('pulse', rcz.bars >= 8 && rcz.bpm < st.bpm[1]);
  $('rc-bars').textContent = rcz.bars ? rcz.bars + (rcz.bars > 1 ? ' mesures jouées' : ' mesure jouée') : '';
}
function rccBtn() {
  const b = $('rc-playbtn'); if (!b) return;
  const on = rhPlaying('rc'); b.classList.toggle('on', on);
  b.innerHTML = on ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>' : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20"/></svg>';
}
function rccPlay() {
  if (rhPlaying('rc')) { rhStop(); return; }
  const st = RH_COURSE[rcz.cur], r = rccRh(st); if (!st || !r) return;
  if (metroPlaying) stopMetro();
  rcz.bars = 0;
  const rh = rhFromPat(r.pat, r.mes, r.res, 1), per = rhPerBar(r.mes, r.res);
  let last = -1;
  rhStart(rh, rcz.bpm, rccChord(), 0, (i, k) => {
    if (last >= 0) { const p = $('rc-c' + last); if (p) p.classList.remove('exo-now'); }
    if (i == null) { last = -1; rccBtn(); return; }
    last = i % per; const el = $('rc-c' + last); if (el) el.classList.add('exo-now');
    if (i === 0) { rcz.bars = Math.floor(k/per) + 1; rccSync(); }
  }, {key:'rc', mute:!rcz.click, mm:'learn'});
  rccBtn();
}
function rccDone() {
  const st = RH_COURSE[rcz.cur], id = st.id, was = !!exoProg.done[id];
  exoProg.done[id] = true; if (rcz.bpm > (exoProg.best[id] || 0)) exoProg.best[id] = rcz.bpm;
  (exoProg.hist[id] = exoProg.hist[id] || []).push({d: today(), n: rcz.bpm});
  exoLog(id); exoSave(); rccStop();
  toast(rcz.cur === RH_COURSE.length - 1 ? 'Parcours terminé, bravo !' : `Étape ${rcz.cur + 1} réussie à ${rcz.bpm} BPM`);
  rcz.fin = true; exoRender();
}
function rccNext() { rcz.fin = false; if (rcz.cur < RH_COURSE.length - 1) rccOpen(rcz.cur + 1); else rccBack(); }
function rccCells(r) { return rhythmSVG(rhFromPat(r.pat, r.mes, r.res, 1), false, {idp: 'rc-c'}); }
function rccHTML() {
  if (rcz.cur == null) {
    const nDone = RH_COURSE.filter(s => exoProg.done[s.id]).length, nxt = RH_COURSE.findIndex(s => !exoProg.done[s.id]);
    return `<div class="fl-lead">Apprendre les rythmes, un par un</div>
      <div class="rc-top"><div class="rc-bar"><i style="width:${Math.round(nDone/RH_COURSE.length*100)}%"></i></div><span>${nDone} / ${RH_COURSE.length} étapes</span></div>
      <div class="exo-note" style="margin:0 0 14px">Un seul accord (Mi mineur), pour ne penser qu’à la main droite. Réussis une étape pour débloquer la suivante.</div>
      <div class="rc-grid">${RH_COURSE.map((s, i) => { const r = rccRh(s), ok = !!exoProg.done[s.id], lock = !rccUnlocked(i);
        return `<button type="button" class="rc-card ${ok ? 'ok' : ''} ${lock ? 'lock' : ''} ${i === nxt ? 'now' : ''}" ${lock ? 'disabled' : `onclick="rccOpen(${i})"`}>
          <span class="rc-n">${ok ? '✓' : lock ? '🔒' : i + 1}</span><b>${esc(r.n)}</b><span class="rc-ar">${rccArrows(r.pat)}</span>
          <small>${s.bpm[0]} → ${s.bpm[1]} BPM${exoProg.best[s.id] ? ' · record ' + exoProg.best[s.id] : ''}</small></button>`; }).join('')}</div>`;
  }
  const i = rcz.cur, st = RH_COURSE[i], r = rccRh(st);
  return `<button type="button" class="btn btn-ghost btn-sm exo-back" onclick="rccBack()">&#8592; Les 12 étapes</button>
    <div class="rc-head"><span class="rc-n big">${i + 1}</span><div><div class="fl-tn">${esc(r.n)}</div><div class="fl-td">${r.mes} · ${lvlDots(r.niv)} · sur ${esc(rccChord().name || 'Em')}</div></div>
      <div class="rc-chord">${chordSVG(rccChord(), {size:.8})}</div></div>
    <div class="rc-say">${esc(st.consigne)}</div>
    <div class="rc-cells">${rccCells(r)}</div>
    ${r.tip ? `<div class="fl-tip">💡 ${esc(r.tip)}</div>` : ''}
    <div class="fl-trans">
      <button type="button" class="btn-icon" onclick="rccTempo(-5)" title="−5 BPM">−</button>
      <div class="tc-v" id="rc-bpm">${rcz.bpm}<small>BPM</small></div>
      <button type="button" class="btn-icon" onclick="rccTempo(5)" title="+5 BPM">+</button>
      <button type="button" class="fl-play" id="rc-playbtn" onclick="rccPlay()" aria-label="Jouer en boucle"></button>
      <button type="button" class="filt" id="rc-click" onclick="rccClick()"></button>
      ${mmBtn('learn')}</div>
    <div class="rc-ladder"><div class="rc-lt"><span>Départ ${st.bpm[0]}</span><span id="rc-bars"></span><span>Cible ${st.bpm[1]}</span></div>
      <div class="rc-bar"><i id="rc-fill"></i></div>
      <button type="button" class="btn btn-ghost btn-sm" id="rc-up" onclick="rccTempo(5)">+5 BPM : un cran plus vite</button></div>
    <div class="rc-goal"><b>Réussi quand :</b> ${esc(st.ok)}</div>
    <div class="rc-act">${rcz.fin ? `<button type="button" class="btn btn-primary" onclick="rccNext()">${i === RH_COURSE.length - 1 ? 'Terminer le parcours' : 'Étape suivante →'}</button>`
      : `<button type="button" class="btn btn-primary" onclick="rccDone()">✓ Réussi</button>`}</div>`;
}
function rccAfter() { if (rcz.cur == null) return; rccBtn(); rccSync(); }


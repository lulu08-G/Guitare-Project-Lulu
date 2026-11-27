/* ═══════ LA FICHE BÊTA (26/11, demande de Lucas : « l'affiche de fiche avec les tests du labo ») ═══════
   Seulement avec ?beta (IS_BETA), pour l'essayer sur ses vraies fiches avant de décider. Sur chaque carte :
   · les accords en lettres avec leur petit doigté dessous (plus visuel que les lettres seules) ;
   · le son dessiné en rebond : ta prise si la partie en a une (coups repérés dans le fichier), sinon le rythme de la
     partie joué par l'app ; un arpège est dessiné sur les six cordes ;
   · « Avec la bande » : la bande suit le rythme de la partie (grBandOwn : le charley sur tes coups, la caisse claire
     sur 2 et 4 ou sur tes étouffés, la grosse caisse et Basile sur 1 et 3) ou ta prise (le charley sur les coups
     entendus, le tempo trouvé dans la prise) ;
   · les cases haut / bas restent dessous, repliées. Les dessins viennent du Labo (39-95-labo-26-11.js). */
const FB = {i: -1, live: !!LS.get('gms_fb_live', false), simp: !!LS.get('gms_fb_simp', false), band: LS.get('gms_fb_band', true) !== false, draw: LS.get('gms_fb_draw', 'saute'), adraw: LS.get('gms_fb_adraw', 'accord'), D: {}, tls: {}, bandT: null};
const fbKind = p => pWay(p) === 'arp' && !p.rec ? FB.adraw : FB.draw;   // le dessin choisi (rythme ou arpège)
const fbOn = () => typeof IS_BETA !== 'undefined' && IS_BETA;

// la bande qui joue le rythme de la partie (une mesure, rejouée en boucle par le moteur)
function grBandOwn(rh) {
  rh = rhNorm(rh);
  const g = grNew(rh.mes, rh.res, 1), D = {k: [], s: [], h: []}, beats = g.per / g.spb;
  for (let i = 0; i < g.per; i++) {
    const c = rh.cells[i], b = Math.floor(i / g.spb), pos = i % g.spb, hit = !!c && c.d !== 'X';
    D.k.push(pos === 0 && (b === 0 || (beats === 4 && b === 2 && hit)) ? 1 : 0);
    D.s.push((c && c.d === 'X') || (pos === 0 && beats === 4 && (b === 1 || b === 3)) || (pos === 0 && beats === 3 && b > 0 && hit) ? 1 : 0);
    D.h.push(hit ? 1 : 0);
  }
  return grBand(g, null, {drums: D, one: true});
}

/* 27/11 (Lucas) : deux affichages. Par défaut, statique comme le PDF (rythme en blocs, arpège en lignes) ;
   « En rythme » (FB.live) : le dessin animé. On touche le dessin pour jouer / mettre en pause (plus de bouton ▶),
   « avec la bande » en petit en haut à droite, les flèches haut / bas en petit en bas à gauche. Plus de menu « Dessin »
   ni de cases repliées. La bande se règle aussi sur ta prise, même quand la partie est un arpège. */
const FB_ARW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v15M4.5 15.5 8 19l3.5-3.5M16 20V5M12.5 8.5 16 5l3.5 3.5"/></svg>';
const fbArwBtn = () => `<button type="button" class="fb-arw${L26.coups === 'fleche' ? ' on' : ''}" onclick="fbArrows(event)" aria-pressed="${L26.coups === 'fleche'}" aria-label="Montrer le sens des coups (flèches haut / bas)" title="Flèches haut / bas">${FB_ARW}</button>`;
function fbStaticHTML(p) {
  const w = pWay(p);
  if (w === 'arp') return `<div class="fs-stat">${pArpLines(p, false)}</div>`;
  if (w === 'rh') return `<div class="fs-stat fs-rh">${fbArwBtn()}<div class="fs-sc">${pRhBlocks(p.rhythm, false, L26.coups === 'fleche')}</div></div>`;
  return p.rec ? '<p class="fs-stat-n">Ta prise est là : passe « En rythme » pour l’écouter.</p>' : '';
}
const FB_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.4"/><rect x="13.5" y="5" width="4" height="14" rx="1.4"/></svg>';
const FB_PLAYI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.9l10.4-6.5a1 1 0 000-1.8L9.5 4.6A1 1 0 008 5.5z"/></svg>';
function fbWayHTML(p, i) {
  if (!FB.live) return fbStaticHTML(p);
  const arp = pWay(p) === 'arp', band = !arp || p.rec, arw = !arp || p.rec;
  const lbl = p.rec ? 'ta prise' : arp ? 'l’arpège' : 'le rythme';
  return `<div class="fb-way fb-live" id="fbw-${i}">
    <div class="fb-stage" data-i="${i}" role="button" tabindex="0" aria-label="Jouer ${lbl}" onclick="fbPlay(${i},event)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fbPlay(${i},event)}">
      <div class="fb-draw" id="fbd-${i}"></div><span class="fb-hint" aria-hidden="true"><svg class="pl" viewBox="0 0 24 24"><path d="M8 5.2v13.6L19 12z"/></svg><svg class="pa" viewBox="0 0 24 24"><path d="M8.5 5.5v13M15.5 5.5v13"/></svg></span></div>
    ${band ? `<button type="button" class="fb-tab fb-bmini${FB.band ? ' on' : ''}" onclick="fbBand(event)" aria-pressed="${FB.band}" aria-label="Avec la bande" title="Avec la bande">${BAND_MINI()}</button>` : ''}
    ${arw ? fbArwBtn().replace('class="fb-arw', 'class="fb-tab fb-arw') : ''}
  </div>`;
}
// les deux languettes (la bande à droite, les flèches à gauche) posées sur la corde du haut
function fbTabs(i) {
  const w = $('fbw-' + i), str = w && w.querySelector('.l26-str'); if (!str) return;
  const y = str.getBoundingClientRect().top - w.getBoundingClientRect().top;
  w.querySelectorAll('.fb-tab').forEach(b => { b.style.top = Math.round(y - b.offsetHeight + 1) + 'px'; });
}
addEventListener('resize', () => { if (FB.live) Object.keys(FB.tls).forEach(i => fbTabs(+i)); });
// flèches haut / bas à la place des barres (même réglage que le Labo), à l'écran animé comme sur la fiche statique
function fbArrows(e) {
  if (e) e.stopPropagation();
  const was = l26Playing(); L26.coups = L26.coups === 'fleche' ? 'coup' : 'fleche'; LS.set('gms_l26_coup', L26.coups);
  if (!FB.live) { if (cur) viewSheet(cur.id, svAll ? null : svPart); return; }
  fbDraw(0, FB.draw); if (was) l26Loop();
  document.querySelectorAll('#sv-parts .fb-arw').forEach(b => { const on = L26.coups === 'fleche'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
// « En rythme » : on passe de la fiche statique au dessin animé (retenu sur l'appareil)
function fbLive(v) {
  FB.live = v == null ? !FB.live : !!v; LS.set('gms_fb_live', FB.live);
  l26Stop(); stopPlay();
  if (cur) viewSheet(cur.id, svAll ? null : svPart);
}
async function fbTl(p) {   // la ligne du temps d'une partie
  if (p.rec) {
    const tl = await l26TakeTl({id: [p.rec.mediaId, p.rec.start, p.rec.end, cur.bpm].join(':'), s: cur, p});
    if (tl) return Object.assign({}, tl, {now: null});
  }
  const chs = p.chords.length ? p.chords : [newChord('Em')];
  if (pWay(p) === 'arp') { const tl = l26ArpTl({a: p.arp, chords: chs.map(c => c.name)}); tl.chs = chs; return tl; }
  if (pWay(p) === 'rh') { const tl = l26FromRh(p.rhythm, chs.map(c => c.name)); tl.chs = chs; return tl; }
  return null;
}
async function fbMount(i) {
  const p = cur && cur.parts[i]; if (!p || !$('fbd-' + i)) return;
  const tl = await fbTl(p), el = $('fbd-' + i); if (!el) return;
  if (!tl) { el.innerHTML = p.rec ? '<p class="fb-none">Je n’entends pas assez de coups dans ta prise.</p>' : ''; return; }
  FB.tls[i] = tl;
  FB.D[i] = l26Mount(el, fbKind(p), tl);   // le dessin choisi (par défaut : rebond + cordes, et l'arpège sur les cordes)
  fbTabs(i);
}
function fbAfter(s) { FB.D = {}; FB.tls = {}; FB.i = -1; fsLiveSync(); if (!FB.live) return; (s.parts || []).forEach((p, i) => { if (pWay(p) !== 'none' || p.rec) fbMount(i); }); }

function fbPlay(i, e) {
  if (e) e.stopPropagation();
  const p = cur && cur.parts[i], tl = FB.tls[i]; if (!p || !tl) return;
  if (FB.i === i && l26Playing()) { l26Stop(); return; }
  l26Stop();
  svPart = i; document.querySelectorAll('#sv-parts .pv-block').forEach(b => b.classList.toggle('on', +b.dataset.idx === i));
  L26.tl = tl; L26.live = FB.D[i]; FB.i = i;
  L26.onPos = pos => fbChordNow(i, pos);
  const capo = cur.capo || 0;
  if (p.rec) fbPlayTake(p, tl);
  else if (pWay(p) === 'arp') l26PlayRh(arpRh(), cur.bpm || 80, tl.chs, {cellFn: arpCellFn(p.arp, capo), capo});
  else l26PlayRh(p.rhythm, cur.bpm || 90, tl.chs, Object.assign({capo}, FB.band ? {band: grBandOwn(p.rhythm)} : {}));
  fbSync();
}
// ta prise en boucle, posée à un instant précis pour que la bande tombe avec tes coups
async function fbPlayTake(p, tl) {
  l26Stop(); stopPlay();
  const buf = await recBuffer(p.rec.mediaId); if (!buf) { toast('Enregistrement introuvable', true); return; }
  const ac = audio(); if (ac.state === 'suspended') await ac.resume();
  const st = p.rec.start, en = Math.min(p.rec.end, buf.duration), Tb = ac.currentTime + .15, lat = (ac.outputLatency || 0) + (ac.baseLatency || 0);
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = st; src.loopEnd = en; src.connect(OUT(ac)); src.start(Tb, st);
  L26.tl = tl; L26.a = src; L26.onPos = pos => fbChordNow(FB.i, pos);
  tl.now = () => { const x = ac.currentTime - lat - Tb; return x < 0 ? 0 : x % tl.L; };
  if (FB.band) fbTakeBand(tl, Tb, p.chords || [], cur.capo || 0);
  l26Loop(); fbSync();
}
// la bande sur ta prise : grosse caisse + Basile sur 1 et 3, caisse claire sur 2 et 4 (tempo trouvé dans la prise,
// le 1er coup entendu = le 1), le charley sur chaque coup entendu
function fbTakeEvents(tl) {
  const ev = [], o = tl.off || 0;
  for (let m = 0; o + m * tl.bar < tl.L; m++) {
    const b0 = o + m * tl.bar;
    [0, 2].forEach(b => { const t = b0 + b * tl.beat; if (t < tl.L) ev.push({t, k: 1, b: 1, m}); });
    [1, 3].forEach(b => { const t = b0 + b * tl.beat; if (t < tl.L) ev.push({t, s: 1, m}); });
  }
  tl.hits.forEach(h => ev.push({t: h.t, h: 1, m: Math.max(0, Math.floor((h.t - o) / tl.bar))}));
  return ev.sort((a, b) => a.t - b.t);
}
function fbTakeBand(tl, Tb, chords, capo) {
  fbBandStop();
  const ac = audio(), ev = fbTakeEvents(tl); if (!ev.length) return;
  const T = FB.bandT = {timer: 0, n: 0, j: 0};
  const tick = () => {
    if (FB.bandT !== T || !L26.a) return;
    const horizon = ac.currentTime + .15;
    for (let guard = 0; guard < 400; guard++) {
      const e = ev[T.j], t = Tb + T.n * tl.L + e.t; if (t > horizon) break;
      if (t >= ac.currentTime - .01) mtBandHit({k: e.k, s: e.s, h: e.h, b: e.b}, t, chords.length ? chords[e.m % chords.length] : null, {capo, needChord: true});
      if (++T.j >= ev.length) { T.j = 0; T.n++; }
    }
    T.timer = setTimeout(tick, 25);
  };
  tick();
}
// l'accord de la mesure en cours s'allume (un accord par mesure, comme le moteur)
function fbChordNow(i, pos) {
  const tl = FB.tls[i], cells = document.querySelectorAll(`#pvb-${i} .chord-cell`), n = cells.length; if (!tl || !n) return;
  const j = pos < 0 ? -1 : Math.floor(Math.max(0, pos - (tl.off || 0)) / tl.bar) % n;
  if (FB.now === i + ':' + j) return; FB.now = i + ':' + j;
  cells.forEach((c, k) => c.classList.toggle('now', k === j));
}
// changer de dessin : toutes les parties du même genre suivent (retenu sur l'appareil)
function fbDraw(arp, k) {
  if (arp) { FB.adraw = k; LS.set('gms_fb_adraw', k); } else { FB.draw = k; LS.set('gms_fb_draw', k); }
  (cur.parts || []).forEach((p, i) => {
    const el = $('fbd-' + i), tl = FB.tls[i]; if (!el || !tl || ((pWay(p) === 'arp' && !p.rec) ? 1 : 0) !== (arp ? 1 : 0)) return;
    FB.D[i] = l26Mount(el, k, tl);
    if (FB.i === i && l26Playing()) L26.live = FB.D[i];
    document.querySelectorAll(`#fbw-${i} .fb-dsel select`).forEach(s => { s.value = k; });
  });
}
function fbBandStop() { if (FB.bandT) { clearTimeout(FB.bandT.timer); FB.bandT = null; } }
function fbBand(e) {
  if (e) e.stopPropagation();
  FB.band = !FB.band; LS.set('gms_fb_band', FB.band);
  const i = FB.i, was = l26Playing() && i >= 0;
  if (was) l26Stop();
  fbDraw(0, FB.draw);   // le dessin se refait : Boum et Basile à gauche quand la bande joue
  fbSync();
  if (was) { FB.i = -1; fbPlay(i); }
}
function fbSync() {
  const on = l26Playing();
  document.querySelectorAll('#sv-parts .fb-stage').forEach(b => { const me = on && +b.dataset.i === FB.i;
    if (me && !b.classList.contains('playing')) { b.classList.add('tap'); clearTimeout(b._tp); b._tp = setTimeout(() => b.classList.remove('tap'), 650); }   // le ❚❚ s'affiche un instant : on sait où toucher pour la pause
    b.classList.toggle('playing', me); b.setAttribute('aria-label', me ? 'Mettre en pause' : 'Jouer'); });
  document.querySelectorAll('#sv-parts .fb-band').forEach(b => { b.classList.toggle('on', FB.band); b.setAttribute('aria-pressed', FB.band); });
}

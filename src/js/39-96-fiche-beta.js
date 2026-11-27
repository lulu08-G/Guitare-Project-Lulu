/* ═══════ LA FICHE BÊTA (26/11, demande de Lucas : « l'affiche de fiche avec les tests du labo ») ═══════
   Seulement avec ?beta (IS_BETA), pour l'essayer sur ses vraies fiches avant de décider. Sur chaque carte :
   · les accords en lettres avec leur petit doigté dessous (plus visuel que les lettres seules) ;
   · le son dessiné en rebond : ta prise si la partie en a une (coups repérés dans le fichier), sinon le rythme de la
     partie joué par l'app ; un arpège est dessiné sur les six cordes ;
   · « Avec la bande » : la bande suit le rythme de la partie (grBandOwn : le charley sur tes coups, la caisse claire
     sur 2 et 4 ou sur tes étouffés, la grosse caisse et Basile sur 1 et 3) ou ta prise (le charley sur les coups
     entendus, le tempo trouvé dans la prise) ;
   · les cases haut / bas restent dessous, repliées. Les dessins viennent du Labo (39-95-labo-26-11.js). */
const FB = {i: -1, pos: {}, want: null, live: !!LS.get('gms_fb_live', false), simp: !!LS.get('gms_fb_simp', false), band: LS.get('gms_fb_band', true) !== false, draw: LS.get('gms_fb_draw', 'saute'), adraw: LS.get('gms_fb_adraw', 'accord'), D: {}, tls: {}, bandT: null};
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
// le ▶ de la fiche statique (Lucas, 27/11) : à droite du rythme, dans une bulle comme celle de Médi ; le triangle, c'est
// Médi lui-même couché, la pointe vers la droite. Il joue ta prise si elle existe, sinon le rythme de l'app.
// le logo ▶ choisi par Lucas (27/11, « Médi couché ») : le médiator orange foncé, pointe vers la droite, et le ▶ orange vif
const fbMediLogo = inner => `<svg class="fs-pm" viewBox="-20 -10 240 250" aria-hidden="true"><g class="pk"><path class="mb" transform="rotate(-90 100 111)" d="${MEDI_BODY}"/></g>${inner}</svg>`;
const FB_PLAYO = fbMediLogo('<path class="tri" d="M62.6 76L130.5 111L62.6 146Z"/>');
// en lecture, sur la fiche statique, le bouton devient Médi qui danse sur le tempo (Lucas, 27/11) ; le toucher met en pause
const fbDanceHTML = () => `<span class="fs-dance" style="--beat:${(60 / ((cur && cur.bpm) || 90)).toFixed(3)}s">${mediSVG('contente', {size: 40, anim: 'dance', label: 'Médi danse : touche pour la pause'})}</span>`;
const FB_PAUSEO = fbMediLogo('<rect class="tri" x="62" y="80" width="17" height="62" rx="6"/><rect class="tri" x="96" y="80" width="17" height="62" rx="6"/>');
function fbStaticHTML(p, i) {
  const w = pWay(p);
  const pl = `<button type="button" class="pv-pl fs-pl" data-i="${i}" onclick="svCardPlay(${i},event)" aria-label="${p.rec ? 'Écouter ma prise' : w === 'arp' ? 'Jouer l’arpège' : 'Jouer le rythme'}">${FB_PLAYO}</button>`;
  if (w === 'arp') return `<div class="fs-stat fs-rh"><div class="fs-sc">${pArpLines(p, false)}</div>${pl}</div>`;
  if (w === 'rh') {   // choix C (Lucas, 27/11) : chaque boucle dans son cadre, les accords qui la jouent empilés sur le cadre ;
    // compact : un rythme pour toute la partie = un seul cadre (« Em · D · G · B7 ») ; des rythmes différents = un cadre chacun, 2 par rangée, le ▶ à côté
    const svg = rh => pRhBlocks(rh, false, L26.coups === 'fleche').replace(/<text[^>]*>[^<]*<\/text>/g, '').replace(/height="54" viewBox="0 0 ([\d.]+) 54"/, 'height="42" viewBox="0 0 $1 42"');
    const chs = p.chords.length ? p.chords : [null], gr = [];
    chs.forEach(c => { const rh = (c && c.rhythm) || p.rhythm, k = JSON.stringify(rh), g = gr[gr.length - 1];
      if (g && g.k === k) g.n.push(c); else gr.push({k, rh, n: [c]}); });
    const nm = g => g.n.filter(Boolean).map(c => esc((FB.simp ? fsSimp(c) : c).name)).join('<i>·</i>');
    return `<div class="fs-stat fs-c"><div class="fs-gr">${gr.map(g => `<div class="fs-g${gr.length === 1 ? ' wide' : ''}">${nm(g) ? `<span class="fs-gc">${nm(g)}</span>` : ''}${svg(g.rh)}</div>`).join('')}</div>${pl}</div>`;
  }
  return p.rec ? `<div class="fs-stat fs-rh"><span class="fs-stat-n">Ma prise</span>${pl}</div>` : '';
}
const FB_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="5" width="4" height="14" rx="1.4"/><rect x="13.5" y="5" width="4" height="14" rx="1.4"/></svg>';
const FB_PLAYI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 001.5.9l10.4-6.5a1 1 0 000-1.8L9.5 4.6A1 1 0 008 5.5z"/></svg>';
function fbWayHTML(p, i) {
  if (!FB.live) return fbStaticHTML(p, i);
  const arp = pWay(p) === 'arp', band = !arp || p.rec, arw = !arp || p.rec;
  const lbl = p.rec ? 'ta prise' : arp ? 'l’arpège' : 'le rythme';
  return `<div class="fb-way fb-live" id="fbw-${i}">
    <div class="fb-stage" data-i="${i}" role="button" tabindex="0" aria-label="Jouer ${lbl}" onclick="fbPlay(${i},event)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();fbPlay(${i},event)}">
      <div class="fb-draw" id="fbd-${i}"></div><span class="fb-hint" aria-hidden="true"><i class="pl">${FB_PLAYO}</i><i class="pa">${FB_PAUSEO}</i></span></div>
    ${band ? `<button type="button" class="fb-tab fb-bmini${FB.band ? ' on' : ''}" onclick="fbBand(event)" aria-pressed="${FB.band}" aria-label="Avec la bande" title="Avec la bande">${BAND_MINI()}</button>` : ''}
  </div>`;
}
// les deux languettes (la bande à droite, les flèches à gauche) posées sur la corde du haut
function fbTabs(i) {
  const w = $('fbw-' + i), str = w && w.querySelector('.l26-chr, .l26-str'); if (!str) return;
  const y = str.getBoundingClientRect().top - w.getBoundingClientRect().top;
  w.querySelectorAll('.fb-tab').forEach(b => { b.style.top = Math.round(y - b.offsetHeight + 1) + 'px'; });
}
addEventListener('resize', () => { if (FB.live) Object.keys(FB.tls).forEach(i => fbTabs(+i)); });
// flèches haut / bas à la place des barres (même réglage que le Labo), à l'écran animé comme sur la fiche statique
function fbArrows(e) {
  if (e) e.stopPropagation();
  const was = l26Playing(); L26.coups = L26.coups === 'fleche' ? 'coup' : 'fleche'; LS.set('gms_l26_coup', L26.coups);
  if (typeof svMenuClose === 'function') svMenuClose();
  if (!FB.live) { if (cur) viewSheet(cur.id, svAll ? null : svPart); fbArwLabel(); return; }
  fbDraw(0, FB.draw); if (was) l26Loop();
  fbArwLabel();
}
// l'option est dans le menu ⋯ de la fiche (Lucas, 27/11 : plus de bouton flèches sur le rythme)
function fbArwLabel() { const b = $('sv-arw-m'); if (b) b.textContent = L26.coups === 'fleche' ? 'Masquer les flèches' : 'Afficher les flèches'; }
// « En rythme » : on passe de la fiche statique au dessin animé (retenu sur l'appareil)
function fbLive(v) {
  FB.live = v == null ? !FB.live : !!v; LS.set('gms_fb_live', FB.live);
  l26Stop(); stopPlay();
  if (cur) viewSheet(cur.id, svAll ? null : svPart);
}
async function fbTl(p) {   // la ligne du temps d'une partie
  const chl = (p.chords || []).map(c => (FB.simp ? fsSimp(c) : c).name);   // le nom de l'accord sous chaque mesure
  if (p.rec) {
    const tl = await l26TakeTl({id: [p.rec.mediaId, p.rec.start, p.rec.end, cur.bpm].join(':'), s: cur, p});
    if (tl) {   // la boucle commence au 1er coup et compte des mesures entières : la ligne est toujours finie avant de repartir
      const cut = tl.off || 0, n = tl.bar ? Math.floor((tl.L - cut) / tl.bar + .02) : 0;
      if (n >= 1) {
        const L = n * tl.bar;
        return Object.assign({}, tl, {now: null, chl, cut, off: 0, L, env: null, win: Math.min(L, 2 * tl.bar), roll: n >= 2,
          hits: tl.hits.filter(h => h.t - cut < L - 1e-3).map(h => Object.assign({}, h, {t: h.t - cut}))});
      }
      return Object.assign({}, tl, {now: null, chl, roll: false});
    }
  }
  const chs = p.chords.length ? p.chords : [newChord('Em')];
  if (pWay(p) === 'arp') { const tl = l26ArpTl({a: p.arp, chords: chs.map(c => c.name)}); tl.chs = chs; return tl; }
  if (pWay(p) === 'rh') { const tl = l26FromRh(p.rhythm, chs.map(c => c.name)); tl.chs = chs; tl.chl = chl; tl.roll = Math.abs(tl.win - 2 * tl.bar) < 1e-6; return tl; }
  return null;
}
async function fbMount(i) {
  const p = cur && cur.parts[i]; if (!p || !$('fbd-' + i)) return;
  const tl = await fbTl(p), el = $('fbd-' + i); if (!el) return;
  if (!tl) { el.innerHTML = p.rec ? '<p class="fb-none">Je n’entends pas assez de coups dans ta prise.</p>' : ''; return; }
  FB.tls[i] = tl;
  FB.D[i] = l26Mount(el, fbKind(p), tl);   // le dessin choisi (par défaut : rebond + cordes, et l'arpège sur les cordes)
  fbTabs(i);
  const st = el.closest('.fb-stage'); if (st && !st._sc) { st._sc = 1; fbScrub(i, st); }
  if (FB.want === i) { FB.want = null; fbPlay(i); }   // touché avant que la prise soit prête : on lance dès qu'elle l'est
}
function fbAfter(s) { FB.D = {}; FB.tls = {}; FB.i = -1; FB.pos = {}; FB.want = null; fsLiveSync(); if (!FB.live) return; (s.parts || []).forEach((p, i) => { if (pWay(p) !== 'none' || p.rec) fbMount(i); }); }

// la vraie pause (Lucas, 27/11) : on garde l'endroit, le ▶ repart exactement de là ; on peut aussi glisser le rythme au doigt
function fbHold(i, pos) {
  FB.pos[i] = pos; const D = FB.D[i];
  if (D && pos != null) { D.frame(pos); fbChordNow(i, pos); }
}
function fbPlay(i, e) {
  if (e) { e.stopPropagation(); if (e.currentTarget && e.currentTarget._noClick) return; }
  const p = cur && cur.parts[i], tl = FB.tls[i]; if (!p) return;
  if (!tl) { FB.want = i; return; }   // la prise est encore en analyse : on jouera dès qu'elle est prête
  if (FB.i === i && l26Playing()) { const pos = tl.now ? tl.now() : null; l26Stop(); fbHold(i, pos); fbSync(); return; }
  l26Stop();
  svPart = i; document.querySelectorAll('#sv-parts .pv-block').forEach(b => b.classList.toggle('on', +b.dataset.idx === i));
  L26.tl = tl; L26.live = FB.D[i]; FB.i = i;
  const capo = cur.capo || 0;
  const from = FB.pos[i] || 0, k0 = Math.max(0, Math.ceil(from - .02)) % Math.max(1, Math.round(tl.L));
  if (p.rec) fbPlayTake(p, tl, from);
  else if (pWay(p) === 'arp') l26PlayRh(arpRh(), cur.bpm || 80, tl.chs, {cellFn: arpCellFn(p.arp, capo), capo, k0, from: FB.pos[i] != null ? from : null});
  else l26PlayRh(p.rhythm, cur.bpm || 90, tl.chs, Object.assign({capo, k0, from: FB.pos[i] != null ? from : null}, FB.band ? {band: grBandOwn(p.rhythm)} : {}));
  if (!p.rec) { L26.live = FB.D[i]; L26.onPos = pos => { fbChordNow(i, pos); fbTabBob(i); }; }   // après l26Stop (qui les remet à zéro) : l'accord de la mesure s'allume, la languette suit la corde
  fbSync();
}
// ta prise en boucle, posée à un instant précis pour que la bande tombe avec tes coups
async function fbPlayTake(p, tl, from) {
  from = from || 0;
  l26Stop(); stopPlay();
  const buf = await recBuffer(p.rec.mediaId); if (!buf) { toast('Enregistrement introuvable', true); return; }
  const ac = audio(); if (ac.state === 'suspended') await ac.resume();
  const st = p.rec.start + (tl.cut || 0), en = Math.min(p.rec.end, buf.duration, st + tl.L), Tb = ac.currentTime + .15, lat = (ac.outputLatency || 0) + (ac.baseLatency || 0);   // tl.cut : la boucle part du 1er coup
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = st; src.loopEnd = en; src.connect(OUT(ac)); src.start(Tb, st + (from % Math.max(.01, en - st)));
  L26.tl = tl; L26.a = src; L26.onPos = pos => { fbChordNow(FB.i, pos); fbTabBob(FB.i); };
  tl.now = () => { const x = ac.currentTime - lat - Tb; return ((x < 0 ? 0 : x) + from) % tl.L; };
  if (FB.band) fbTakeBand(tl, Tb - from, p.chords || [], cur.capo || 0);
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
  const m = pos < 0 ? -1 : Math.floor(Math.max(0, pos - (tl.off || 0)) / tl.bar);
  if (FB.now === i + ':' + m) return; FB.now = i + ':' + m;
  cells.forEach((c, k) => c.classList.toggle('now', k === j));
  document.querySelectorAll(`#fbd-${i} .l26-lc, #fbd-${i} .l26-mb`).forEach(t => t.classList.toggle('now', +t.dataset.m === m));
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
// glisser le rythme au doigt : vers la gauche, ça avance ; vers la droite, ça recule (la lecture reprend au lâcher)
function fbScrub(i, st) {
  let x0 = null, p0 = 0, moved = false, was = false;
  st.addEventListener('pointerdown', e => { if (e.button) return; x0 = e.clientX; moved = false; });
  st.addEventListener('pointermove', e => {
    if (x0 == null) return;
    const dx = e.clientX - x0, tl = FB.tls[i], D = FB.D[i];
    if (!moved) {
      if (Math.abs(dx) < 8 || !tl || !D) return;
      moved = true; was = FB.i === i && l26Playing();
      p0 = was ? (tl.now() || 0) : (FB.pos[i] || 0);
      if (was) l26Stop();
      try { st.setPointerCapture(e.pointerId); } catch (_) {}
      st.classList.add('scrub');
    }
    const t0 = tl.roll ? (tl.off || 0) + D.page * tl.bar : D.page * tl.win, d = Math.min(1, tl.bar / 2), upx = (D.X(t0 + d) - D.X(t0)) / d * st.getBoundingClientRect().width / D.W;   // pixels par unité de temps
    const pos = (((p0 - dx / Math.max(.01, upx)) % tl.L) + tl.L) % tl.L;
    fbHold(i, pos);
  });
  const end = () => {
    if (x0 == null) return; x0 = null; if (!moved) return;
    st.classList.remove('scrub'); st._noClick = true; setTimeout(() => { st._noClick = false; }, 0);
    if (was) { FB.i = -1; fbPlay(i); } else fbSync();
  };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
}
// la languette de la bande bouge un peu quand la corde du haut vibre
function fbTabBob(i) {
  const D = FB.D[i], t = document.querySelector(`#fbw-${i} .fb-bmini`); if (!D || !t) return;
  const y = Math.min(2.5, (D.a0 || 0) * .45) * Math.abs(Math.sin((D.ph || 0) * .9));
  t.style.transform = y > .05 ? `translateY(${(-y).toFixed(2)}px) rotate(${(y * .5 * Math.sin(D.ph || 0)).toFixed(2)}deg)` : '';
}
function fbSync() {
  const on = l26Playing();
  if (!on) document.querySelectorAll('#sv-parts .fb-bmini').forEach(t => { t.style.transform = ''; });
  document.querySelectorAll('#sv-parts .fb-stage').forEach(b => { const me = on && +b.dataset.i === FB.i;
    if (me && !b.classList.contains('playing')) { b.classList.add('tap'); clearTimeout(b._tp); b._tp = setTimeout(() => b.classList.remove('tap'), 650); }   // le ❚❚ s'affiche un instant : on sait où toucher pour la pause
    b.classList.toggle('playing', me); b.setAttribute('aria-label', me ? 'Mettre en pause' : 'Jouer'); });
  document.querySelectorAll('#sv-parts .fb-band,#sv-parts .fb-bmini').forEach(b => { b.classList.toggle('on', FB.band); b.setAttribute('aria-pressed', FB.band); });
}

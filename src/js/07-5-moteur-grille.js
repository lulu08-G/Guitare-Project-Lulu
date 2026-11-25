/* ═══════ MOTEUR UNIQUE + GRILLE (25/11, étape 1 de « Guitar Memory — la direction ») ═══════
   Un seul transport pour toute l'app : fiche, mode jeu, éditeur, Au feeling, rythmes, métronome, Répét', Labo, exercices.
   · Planificateur à anticipation sur l'horloge Web Audio (minuteur 25 ms, fenêtre 120 ms) : chaque son est posé à
     l'avance à son instant exact ; aucun minuteur JavaScript ne déclenche de son, rien ne dérive.
   · Une seule lecture à la fois : en lancer une arrête la précédente, dont le lecteur remet son écran à zéro (onKill).
   · Les visuels sont appelés quand le son sort, case par case, sur une seule boucle d'image.
   Un lecteur = des réglages : mtPlay({owner, key, start | at, dur, off, step, vis, cells, onEnd, endDelay, onKill}).
     dur(T) : durée d'une case (lue à chaque case : changer le tempo en route ne fait pas de saut) ;
     off(k, d) : décalage d'une case (swing) ; step(k, t, d, T) : pose les sons de la case k à l'instant t et peut rendre
     une valeur, repassée à vis(k, t, d, T, valeur) au moment où le son sort ; cells : nombre de cases à jouer (0 = sans fin),
     puis onEnd(T) une fois la dernière case finie (+ endDelay ms). mtStop(owner | transport) ; mtOn(owner, key). */
let MT = null;   // la lecture en cours (une seule dans toute l'app)
function mtHalt(kill) {
  const T = MT; if (!T) return;
  MT = null; T.done = true;
  clearTimeout(T.timer); clearTimeout(T.endT); cancelAnimationFrame(T.raf);
  if (kill && T.onKill) T.onKill(T);
}
const mtStop = x => { if (MT && (!x || MT === x || MT.owner === x)) mtHalt(false); };
const mtOn = (owner, key) => !!MT && MT.owner === owner && (key == null || MT.key === key);
function mtPlay(o) {
  mtHalt(true);   // la lecture d'avant s'arrête et son lecteur remet son écran à zéro
  const ac = audioReady(), T = Object.assign({k: 0, q: [], timer: 0, raf: 0, endT: 0, done: false, ac}, o);
  T.next = T.at != null ? T.at : ac.currentTime + (T.start != null ? T.start : .08);
  T.t0 = T.next; MT = T;
  const tick = () => {
    if (MT !== T || T.done) return;
    for (;;) {
      if (T.cells && T.k >= T.cells) { mtEnd(T); return; }
      const d = T.dur(T), t = T.next + (T.off ? T.off(T.k, d) : 0);
      if (t >= ac.currentTime + .12) break;
      const v = T.step(T.k, t, d, T);
      if (T.vis) T.q.push([t, T.k, d, v]);
      T.k++; T.next += d;
    }
    T.timer = setTimeout(tick, 25);
  };
  const draw = () => {
    if (MT !== T) return;
    mtFlush(T, ac.currentTime);
    if (MT === T) T.raf = requestAnimationFrame(draw);
  };
  tick(); if (T.vis && MT === T) draw();
  return T;
}
// les images dont le son est sorti ; au retour d'un onglet caché, on ne rejoue pas celles en retard, seulement la dernière
function mtFlush(T, now) {
  const due = [];
  while (T.q.length && T.q[0][0] <= now) due.push(T.q.shift());
  if (!due.length) return;
  let fresh = now === Infinity ? due : due.filter(x => x[0] > now - .25);
  if (!fresh.length) fresh = due.slice(-1);
  fresh.forEach(x => { if (MT === T) T.vis(x[1], x[0], x[2], T, x[3]); });
}
function mtEnd(T) {
  T.done = true;
  T.endT = setTimeout(() => {
    if (MT !== T) return;
    if (T.vis) mtFlush(T, Infinity);
    MT = null; cancelAnimationFrame(T.raf);
    if (T.onEnd) T.onEnd(T);
  }, Math.max(0, (T.next - T.ac.currentTime) * 1000) + (T.endDelay || 0));
}

/* ── la Grille ──
   {mes, res, bars, per (cases par mesure), spb (cases par temps), beats, n (cases), swing,
    gtr : [case du rythme v2 {d, a} | null] × n (ta ligne de guitare), chords : [un accord par mesure, en boucle],
    boum : {k : grosse caisse, s : caisse claire} × per, tchik : charley × per, basile : basse × per (0 | 1 par case)}
   Boum, Tchik et Basile sont calculés (style + accords de la grille), jamais stockés : changer un accord change la basse. */
function grNew(mes, res, bars) {
  mes = mes || '4/4'; res = res || 8; bars = bars || 1;
  const per = rhPerBar(mes, res), spb = rhSpb(mes, res);
  return {mes, res, bars, per, spb, beats: per / spb, n: per * bars, swing: 0, gtr: Array(per * bars).fill(null), chords: []};
}
function grFromRhythm(rh, chords) {   // une partie de fiche (ou un rythme d'exercice) → sa grille
  rh = rhNorm(rh);
  const g = grNew(rh.mes, rh.res, rh.bars);
  g.gtr = rh.cells; g.n = rh.cells.length; g.swing = rh.swing || 0; g.chords = chords || [];
  return g;
}
const grFromPat = (pat, mes, res, bars) => grFromRhythm(rhFromPat(pat, mes, res, bars));
// la bande d'un style (motifs du métronome), ramenée à la résolution de la grille ; Basile joue sur la grosse caisse
// (et sur le 1 avec o.one) ; o.drums = {k, s, h} pour un motif écrit à la main
function grBand(g, style, o) {
  o = o || {};
  const P = (METRO_PRESETS[style] || METRO_PRESETS.pop).base, r = 4 / g.spb, D = o.drums;
  g.boum = {k: [], s: []}; g.tchik = []; g.basile = [];
  for (let i = 0; i < g.per; i++) {
    const st = D ? {k: D.k[i], s: D.s[i], h: D.h[i]} : P[Math.floor(i * r) % P.length];
    g.boum.k.push(st.k); g.boum.s.push(st.s); g.tchik.push(st.h);
    g.basile.push(st.k || (o.one && i === 0) ? 1 : 0);
  }
  return g;
}
/* La bande joue une case : Boum (grosse caisse, caisse claire), Tchik (charley), Basile (fondamentale de l'accord ;
   sans accord, la corde à vide du métronome). L = couches allumées {kick, snare, tchik, basile}, toutes par défaut. */
function mtBandHit(p, t, chord, L) {
  L = L || {};
  if (p.k && L.kick !== false) metroKick(t);
  if (p.s && L.snare !== false) metroSnare(t);
  if (p.h && L.tchik !== false) metroHihat(t);
  if (p.b && L.basile !== false) { if (chord) pluck(labRoot(chord), t, .5, .2); else if (!L.needChord) metroBass(t); }
}
const mtBand = (g, i, t, chord, L) => mtBandHit({k: g.boum.k[i], s: g.boum.s[i], h: g.tchik[i], b: g.basile[i]}, t, chord, Object.assign({needChord: true}, L));

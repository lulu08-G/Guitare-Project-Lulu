/* ═══════ S'ENTRAÎNER v2 : RÉPÉT' + JEUX (bêta cachée, 20/11) ═══════
   Vit dans le labo (?beta) à la place de son accueil ; les tests du 19/11 restent dans « Les tests du 19/11 ».
   Maquettes : planche Design, page Refonte, rangées « S'entraîner × la bande » et « S'entraîner v2 ».
   rpPlay (joué par le moteur unique, 07-5-moteur-grille.js) : la bande (Boum, Tchik, Basile) ou Médi seul (= le métronome), ta ligne, les accords.
   Rien ici ne touche aux fiches (sauf « En faire une fiche », qui ouvre l'éditeur comme « Au feeling »). */
const RP_STYLES = [['pop', 'Pop'], ['rock', 'Rock'], ['reggae', 'Reggae'], ['funk', 'Funk'], ['shuffle', 'Shuffle'], ['valse', 'Valse']];
const RP_CHSETS = [['G', 'C'], ['G', 'D', 'Em', 'C'], ['Am', 'E'], ['C', 'Am', 'F', 'G']];
const RP_TOUR = [{id: 'garage', n: 'Le garage', lvl: 1, win: 'Tchik rejoint la bande sur la route.'}, {id: 'bar', n: 'Le bar', lvl: 2, win: 'Le bar t’a adoré. Direction la fête.'},
  {id: 'fete', n: 'La fête', lvl: 3, win: 'La fête est folle. Prochaine étape : le festival.'}, {id: 'festival', n: 'Le festival', lvl: 4, win: 'Toute la tournée est faite. Respect.'}];
const RP_AVIS = [{id: 'rp-repet', t: 'Répét’ : la salle (le métronome)'}, {id: 'rp-rythme', t: 'Répét’ : les rythmes'}, {id: 'rp-suite', t: 'Répét’ : les suites d’accords'},
  {id: 'rp-declic', t: 'Les déclics (regarde, essaie, monte, gagné)'}, {id: 'rp-oreille', t: 'Jeu : l’oreille'}, {id: 'rp-ninja', t: 'Jeu : rythme ninja'},
  {id: 'rp-eclair', t: 'Jeu : accords éclair'}, {id: 'rp-tournee', t: 'Jeux : la tournée'}];
const RP_SUB = ['1', 'et', '2', 'et', '3', 'et', '4', 'et'];
const RP_PLAY = '<svg viewBox="0 0 14 16" aria-hidden="true"><path d="M2 1 L13 8 L2 15 Z"/></svg>';
const RP_STOP = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="2"/></svg>';
const RP_BACK = '<svg viewBox="0 0 10 16" aria-hidden="true"><path d="M8 2 L2 8 L8 14"/></svg>';

const rp = {tab: 'repet', view: 'home', id: null, S: null, timer: null, band: true, tchik: true, style: 'pop', bpm: 76, beats: 4,
  amb: 'joyeux', chs: 0, demo: false, rhId: null, tours: 0, dc: null, g: null, avis: null, taps: [], allRh: false};
const rpData = () => LS.get('gms_rp', {});
function rpSave(fn) { const d = rpData(); fn(d); LS.set('gms_rp', d); }

/* ── données ── */
function rpLine(pat, n) {   // « D-DU-UDU » → [{d, a} | 0] ; X = étouffé, minuscule = doux
  return Array.from({length: n || pat.length}, (_, i) => {
    const c = pat[i] || '-';
    if (c === 'X' || c === 'x') return {d: 'X', a: 1};
    if ('DdUu'.includes(c)) return {d: c.toUpperCase(), a: c === c.toLowerCase() ? 0 : 1};
    return 0;
  });
}
const rpRhythms = () => RHYTHMS.filter(r => r.res === 8 && (r.mes === '4/4' || r.mes === '3/4'));
function rpDrums(style, beats) {   // la bande du style, calculée par la grille du moteur (Basile sur la grosse caisse et sur le 1)
  const g = grBand(grNew(beats === 3 ? '3/4' : '4/4', 8, 1), style, {one: true});
  return {k: g.boum.k, s: g.boum.s, h: g.tchik, b: g.basile};
}
function rpDeclics() {   // les cartes des murs qui ont un exercice en rythme (8 croches, 4/4)
  const out = [];
  BLOCS.forEach((b, bi) => b.cards.forEach(c => {
    const sc = c.v && c.v.scenes ? c.v.scenes.find(s => s.rows && s.rows.some(r => r.pat && r.pat.length === 8 && (!r.mes || r.mes === '4/4'))) : null;
    if (!sc) return;
    const row = sc.rows.find(r => r.pat && r.pat.length === 8 && (!r.mes || r.mes === '4/4'));
    out.push({k: c.k, t: c.t, d: c.d, mur: b.n, bi, row: {pat: row.pat, chords: row.chords || ['G', 'C'], bpm: row.bpm || 80}});
  }));
  return out;
}
const rpStyleBeats = s => s === 'valse' ? 3 : 4;

/* ── le moteur : une mesure comptée, puis la bande (ou Médi seul), ta ligne et les accords ── */
function rpStop() {
  clearTimeout(rp.timer); rp.timer = null;
  const S = rp.S; rp.S = null;
  mtStop('rp');
  if (S && S.raf) cancelAnimationFrame(S.raf);
  if (rp.g && rp.g.raf) { cancelAnimationFrame(rp.g.raf); rp.g.raf = 0; }
  if (rp.g && rp.g.timers) { rp.g.timers.forEach(clearTimeout); rp.g.timers = []; }
  document.querySelectorAll('#lab-body .now').forEach(e => e.classList.remove('now'));
  rpPaintPlay();
}
function rpPlay(cfg) {   // joué par le moteur unique (07-5-moteur-grille.js)
  rpStop();
  const ac = audioReady();
  const S = Object.assign({bpm: rp.bpm, beats: rp.beats, band: rp.band, tchik: rp.tchik, style: rp.style, line: null, chords: ['G'], demo: false,
    count: true, bars: 0, total: 0, next: ac.currentTime + .15, expect: []}, cfg);
  S.n = S.beats * 2; S.drums = rpDrums(S.style, S.beats); S.start = S.next;
  rp.S = S;
  const cnt = S.count ? 1 : 0;
  S.T = mtPlay({owner: 'rp', at: S.next, dur: () => 60 / S.bpm / 2, cells: S.bars ? (S.bars + cnt) * S.n : 0, endDelay: 60,
    step: (k, t, d) => {
      const i = k % S.n, b = Math.floor(k / S.n) - cnt;
      S.total = k; S.next = t; rpStep(S, i, b, t, d); S.total = k + 1; S.next = t + d;
      return b;
    },
    vis: (k, t, d, T, b) => { if (rp.S === S) rpVis(S, k % S.n, b, d * 2); },
    onEnd: () => { if (rp.S === S) { rp.S = null; rpPaintPlay(); if (S.onEnd) S.onEnd(S); } },
    onKill: () => { if (rp.S === S) rpStop(); }});
  rpPaintPlay();
  return S;
}
function rpStep(S, i, b, t, dur) {
  const chord = S.chords && S.chords.length ? S.chords[Math.max(0, b) % S.chords.length] : null;
  if (b < 0) { if (i % 2 === 0) metroClick(t, i === 0); }
  else {
    if (S.band) { const D = S.drums; mtBandHit({k: D.k[i], s: D.s[i], h: D.h[i], b: D.b[i]}, t, chord, {tchik: !!S.tchik, needChord: true}); }
    else if (i % 2 === 0) metroClick(t, i === 0);
    const v = S.line && S.line[i];
    if (v) {
      S.expect.push(t);
      if (S.demo && chord) { const ch = newChord(chord); if (v.d === 'X') muteHit(t, ch, 0, 'D', 1); else strumChord(ch, 0, v.d, t, v.a ? 1 : .55); }
    }
  }
  if (S.onSched) S.onSched(S, i, b, t);
}
function rpVis(S, i, b, beatSec) {
  document.querySelectorAll('#rp-lane .lc.now').forEach(e => e.classList.remove('now'));
  if (b >= 0) { const c = document.querySelector(`#rp-lane .lc[data-i="${i}"]`); if (c) c.classList.add('now'); }
  if (b >= 0 && S.band) {
    const D = S.drums, ms = Math.max(140, Math.min(380, beatSec * 900));
    if (D.k[i] || D.s[i]) metroBump(document.querySelector('#rp-room .boum .pv'), D.s[i] ? 14 : 8, ms, .12);
    if (D.h[i] && S.tchik) metroBump(document.querySelector('#rp-room .tchik .pv'), 5, 160, .04);
    if (D.k[i] || i === 0) metroBump(document.querySelector('#rp-room .basile .pv'), 9, ms, .08);
  }
  if (i === 0) {
    const ch = $('rp-chord'), nx = $('rp-next'), L = S.chords || [];
    if (ch) ch.textContent = b < 0 ? 'Prêt ?' : L[b % L.length] || '';
    if (nx) nx.textContent = b < 0 ? (L[0] || '') : L.length > 1 ? L[(b + 1) % L.length] : '';
    const bar = $('rp-barp'); if (bar && b >= 0) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = `rpBar ${S.beats * beatSec}s linear forwards`; }
    document.querySelectorAll('#rp-cards .rp-cc').forEach((c, k) => { c.classList.toggle('now', b >= 0 && k === b % L.length); c.classList.toggle('next', L.length > 1 && k === (Math.max(0, b) + (b < 0 ? 0 : 1)) % L.length); });
    const dg = $('rp-diag'); if (dg && b >= 0 && L.length) dg.innerHTML = chordSVG(newChord(L[b % L.length]), {size: 1.25});
    if (b >= 0 && S.onBar) S.onBar(S, b);
  }
  const bub = $('rp-bub');
  if (bub) {
    const L = S.chords || [], last = i === S.n - 2 && L.length > 1 && b >= -1;
    if (last) { bub.textContent = `${L[(b + 1) % L.length]} au prochain 1 !`; bub.classList.add('on'); }
    else if (i === 0) bub.classList.remove('on');
  }
  if (i % 2) return;
  const beat = i / 2;
  document.querySelectorAll('#rp-pads i').forEach((p, k) => p.classList.toggle('now', k === beat));
  const say = $('rp-say'); if (say && b < 0) say.textContent = `Médi compte : ${beat + 1}`; else if (say && b === 0 && i === 0) say.textContent = S.say || '';
  rpMedi(beat, beatSec);
}
function rpMedi(beat, beatSec) {
  const m = $('rp-medi'); if (!m || !m.animate || mReduced()) return;
  m.getAnimations().forEach(a => a.cancel());
  const h = beat === 0 ? 26 : 14;
  m.animate([{transform: 'scale(1.14,.86)'}, {transform: `translateY(-${h}px) scale(.97,1.04)`, offset: .35}, {transform: 'none'}], {duration: Math.min(520, beatSec * 850), easing: 'ease-out'});
}
function rpPaintPlay() {
  const b = $('rp-play'); if (!b) return;
  const on = !!rp.S && !rp.g;
  b.classList.toggle('on', on); b.innerHTML = on ? RP_STOP + '<span>Stop</span>' : RP_PLAY + `<span>${b.dataset.l || 'Jouer'}</span>`;
}

/* ── morceaux d'écran ── */
const RP_DECOR = `<svg class="rp-deco" viewBox="0 0 350 180" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <rect x="0" y="146" width="350" height="34" class="rp-floor"/><ellipse cx="175" cy="160" rx="132" ry="13" class="rp-rug"/>
  <rect x="246" y="14" width="56" height="72" rx="4" class="rp-post"/><circle cx="274" cy="40" r="13" class="rp-sun"/><rect x="256" y="64" width="36" height="6" rx="3" class="rp-dim"/>
  <rect x="24" y="22" width="40" height="52" rx="4" class="rp-post"/><path d="M30 60 L44 34 L58 60" class="rp-peak"/>
  <path d="M120 0 V20" class="rp-wire"/><circle cx="120" cy="27" r="8" class="rp-lamp"/>
  <path d="M150 0 Q190 10 230 0" class="rp-wire"/><circle cx="165" cy="5" r="3" class="rp-l1"/><circle cx="190" cy="7" r="3" class="rp-l2"/><circle cx="215" cy="4" r="3" class="rp-l3"/>
  <rect x="6" y="104" width="40" height="44" rx="6" class="rp-amp"/><circle cx="26" cy="126" r="11" class="rp-cone"/><rect x="304" y="98" width="40" height="50" rx="6" class="rp-amp"/><circle cx="324" cy="123" r="13" class="rp-cone"/>
</svg>`;
function rpRoomHTML(o) {
  o = o || {};
  const solo = o.solo != null ? o.solo : !rp.band, tchik = o.tchik != null ? o.tchik : rp.tchik;
  return `<section class="rp-room${solo ? ' solo' : ''}${o.small ? ' small' : ''}" id="rp-room">${RP_DECOR}
    <div class="rp-mates"><span class="rp-mate boum">${BOUM_SVG(true, 'boum')}</span><span class="rp-mate tchik${tchik ? '' : ' away'}">${TCHIK_SVG('tchik')}</span>
    <span class="rp-mate medi" id="rp-medi">${mediSVG(o.expr || 'contente', {size: 80, anim: 'still', label: 'Médi saute sur les temps'})}</span><span class="rp-mate basile">${BASILE_SVG(true, 'basile')}</span></div>
    <div class="rp-bub" id="rp-bub"></div>${solo ? '<span class="rp-pause">la bande fait une pause</span>' : ''}${o.extra || ''}</section>`;
}
const rpPadsHTML = beats => `<div class="rp-pads" id="rp-pads">${Array.from({length: beats}, (_, k) => `<i>${k + 1}</i>`).join('')}</div>`;
function rpLaneHTML(line, beats) {
  const n = beats * 2;
  return `<div class="rp-lane" id="rp-lane" style="--n:${n}"><span class="rp-lt"></span>${RP_SUB.slice(0, n).map((s, i) => `<span class="lh${i % 2 ? '' : ' bt'}">${s}</span>`).join('')}
    <span class="rp-lt">Toi</span>${line.slice(0, n).map((v, i) => `<span class="lc${i % 2 ? '' : ' bt'}${v ? (v.d === 'X' ? ' x' : v.a ? ' on' : ' soft') : ''}" data-i="${i}">${v ? (v.d === 'X' ? '<b>x</b>' : '<i></i>') : ''}</span>`).join('')}</div>`;
}
function rpTop(kick, title, right) {
  return `<div class="rp-top"><button type="button" class="mt-back" onclick="rpGo('home')" aria-label="Retour">${RP_BACK}</button><div><small>${kick}</small><h1>${title}</h1></div>${right || ''}</div>`;
}
const rpChip = (label, on, fn, extra) => `<button type="button" class="rp-chip${on ? ' on' : ''}" aria-pressed="${!!on}" onclick="${fn}" ${extra || ''}>${label}</button>`;
function rpTempoHTML() {
  return `<div class="rp-tempo"><button type="button" class="rp-rnd" onclick="rpBpm(-4)" aria-label="Moins vite">−</button><div class="rp-bpm"><b id="rp-bpm">${rp.bpm}</b><small>BPM</small></div><button type="button" class="rp-rnd" onclick="rpBpm(4)" aria-label="Plus vite">+</button></div>`;
}
function rpAvisBtn(id) {
  const T = RP_AVIS.find(a => a.id === id), done = labAns()[id];
  if (rp.avis === id) return `<div class="rp-avis-box">${labFormHTML(T).replace(`labSave('${id}')`, `rpAvisSave('${id}')`)}</div>`;
  return `<button type="button" class="rp-avis${done ? ' done' : ''}" onclick="rp.avis='${id}';rpRender(true)">${done ? 'Avis donné · le modifier' : 'Ton avis sur cette partie'}</button>`;
}
function rpAvisSave(id) {
  const A = labAns(), n = $('lab-note');
  A[id] = Object.assign(A[id] || {}, {note: n ? n.value.trim() : '', at: Date.now()});
  LS.set('gms_labo', A); toast('Merci, avis enregistré !'); rp.avis = null; rpRender(true);
}

/* ── navigation ── */
function rpGo(view, id) { rpStop(); labMicOff(); rp.view = view; rp.id = id || null; rp.avis = null; rp.g = view === 'game' ? rp.g : null; if (view === 'dc') rp.dc = null; rpRender(); window.scrollTo(0, 0); }
function rpTab(t) { rpStop(); rp.tab = t; rp.view = 'home'; rp.g = null; rpRender(); }
function rpRender(keep) {
  const h = $('lab-body'); if (!h) return;
  const v = rp.view;
  h.innerHTML = v === 'rh' ? rpRhHTML() : v === 'su' ? rpSuHTML() : v === 'dc' ? rpDcHTML() : v === 'game' ? rpGameHTML() : v === 'concert' ? rpConcertHTML() : rpHomeHTML();
  if (!keep) rpPaintPlay();
  if (v === 'game' && rp.g && rp.g.after) rp.g.after();
}

/* ── accueil : les deux onglets ── */
function rpHomeHTML() {
  const tabs = `<div class="rp-tabs" role="tablist">${[['repet', 'Répét’'], ['jeux', 'Jeux']].map(([k, l]) => `<button type="button" role="tab" aria-selected="${rp.tab === k}" class="${rp.tab === k ? 'on' : ''}" onclick="rpTab('${k}')">${l}</button>`).join('')}</div>`;
  const head = `<div class="rp-head"><h1>S’entraîner</h1><span class="rp-beta">bêta</span></div>`;
  const foot = `<div class="rp-foot"><button type="button" class="rp-link" onclick="labGo('tests26')">Les tests du 26/11</button><button type="button" class="rp-link" onclick="labGo('tests')">Les tests du 19/11</button><button type="button" class="btn btn-primary" onclick="labExport()">Envoyer mes réponses</button></div>`;
  return head + tabs + (rp.tab === 'jeux' ? rpJeuxHTML() : rpRepetHTML()) + foot;
}
function rpRepetHTML() {
  const rh = rpRhythms(), list = rp.allRh ? rh : rh.slice(0, 6);
  const progs = FEEL_PROGS.filter(p => p.amb === rp.amb && p.ch.length <= 8).slice(0, 8);
  const dcs = rpDeclics(), D = rpData().dc || {};
  const mini = r => `<span class="rp-mini">${rpLine(r.pat).map(v => `<i class="${v ? (v.d === 'X' ? 'x' : v.a ? 'on' : 'soft') : ''}"></i>`).join('')}</span>`;
  return `${rpRoomHTML()}${rpPadsHTML(rp.beats)}
    <div class="rp-row"><div class="rp-seg">${rpChip('Médi seul', !rp.band, 'rpBand(false)')}${rpChip('La bande', rp.band, 'rpBand(true)')}</div>${rp.band ? rpChip('Tchik', rp.tchik, 'rpTchik()') : ''}</div>
    <div class="rp-styles">${RP_STYLES.map(([k, l]) => rpChip(l, rp.style === k, `rpStyle('${k}')`)).join('')}</div>
    <div class="rp-row">${rpTempoHTML()}<button type="button" class="rp-chip" onclick="rpTap()">Taper</button><button type="button" class="rp-go" id="rp-play" onclick="rpHomePlay()"></button></div>
    ${rpAvisBtn('rp-repet')}
    <section class="rp-sec"><div class="rp-sh"><h2>Rythmes</h2><button type="button" class="rp-link" onclick="rp.allRh=!rp.allRh;rpRender(true)">${rp.allRh ? 'moins' : `tout voir (${rh.length})`}</button></div>
      <div class="rp-tiles">${list.map(r => `<button type="button" class="rp-tile" onclick="rpGo('rh','${r.id}')">${mini(r)}<b>${esc(r.n)}</b><small>${r.mes}${r.niv > 1 ? ' · niveau ' + r.niv : ''}</small></button>`).join('')}</div></section>
    <section class="rp-sec"><div class="rp-sh"><h2>Suites d’accords</h2></div>
      <div class="rp-styles">${AMBIANCES.map(a => rpChip(a.n, rp.amb === a.id, `rp.amb='${a.id}';rpRender(true)`)).join('')}</div>
      <div class="rp-tiles">${progs.map(p => `<button type="button" class="rp-tile" onclick="rpGo('su','${p.id}')"><span class="rp-chs">${p.ch.slice(0, 4).map(esc).join(' ')}${p.ch.length > 4 ? '…' : ''}</span><b>${esc(p.n)}</b><small>${p.ex ? esc(p.ex[0]) : 'niveau ' + p.niv}</small></button>`).join('')}</div></section>
    <section class="rp-sec"><div class="rp-sh"><h2>Les déclics</h2><small>regarde · essaie · monte · gagné</small></div>
      <div class="rp-dcl">${dcs.map(d => `<button type="button" class="rp-dc${D[d.k] ? ' done' : ''}" onclick="rpGo('dc','${d.k}')"><span class="rp-dcn">${D[d.k] ? '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1.5 5 L4.5 8 L10.5 2"/></svg>' : d.bi + 1}</span><span><b>${esc(d.t)}</b><small>${esc(d.mur)}</small></span></button>`).join('')}</div></section>`;
}
function rpBand(on) { rp.band = on; const S = rp.S; if (S) S.band = on; rpRender(true); }
function rpTchik() { rp.tchik = !rp.tchik; if (rp.S) rp.S.tchik = rp.tchik; rpRender(true); }
function rpStyle(k) {
  rp.style = k; const b = rpStyleBeats(k), restart = !!rp.S && rp.beats !== b; rp.beats = b;
  if (rp.S && !restart) { rp.S.style = k; rp.S.drums = rpDrums(k, rp.S.beats); }
  rpRender(true); if (restart) rpHomePlay(true);
}
function rpBpm(d) { rp.bpm = Math.max(40, Math.min(200, rp.bpm + d)); if (rp.S) rp.S.bpm = rp.bpm; const e = $('rp-bpm'); if (e) e.textContent = rp.bpm; }
function rpTap() {
  const now = performance.now(); rp.taps = rp.taps.filter(t => now - t < 2500); rp.taps.push(now);
  if (rp.taps.length >= 3) { const iv = []; for (let k = 1; k < rp.taps.length; k++) iv.push(rp.taps[k] - rp.taps[k - 1]); rp.bpm = Math.round(60000 / (iv.reduce((a, b) => a + b) / iv.length)); rpBpm(0); }
  metroClick(audioReady().currentTime + .01, rp.taps.length === 1);
}
function rpHomePlay(force) {
  if (rp.S && !force) { rpStop(); return; }
  rpPlay({count: false, chords: ['G'], say: ''});
}

/* ── Répét' : un rythme ── */
function rpRhHTML() {
  const r = RHYTHMS.find(x => x.id === rp.id); if (!r) return '';
  const beats = RH_BEATS[r.mes] || 4, line = rpLine(r.pat, beats * 2), ch = RP_CHSETS[rp.chs];
  return `${rpTop('Répét’ · rythme', esc(r.n))}
    ${rpRoomHTML({extra: ''})}${rpPadsHTML(beats)}
    <div class="rp-chline"><b id="rp-chord">${esc(ch[0])}</b><span>puis <b id="rp-next">${esc(ch[1] || '')}</b></span></div>
    ${rpLaneHTML(line, beats)}
    ${mediBulle('contente', esc(r.tip), {size: 44, cls: 'rp-tip'})}
    <div class="rp-styles">${RP_CHSETS.map((c, k) => rpChip(c.join(' · '), rp.chs === k, `rp.chs=${k};rpStop();rpRender(true)`)).join('')}</div>
    <div class="rp-row"><div class="rp-seg">${rpChip('Médi seul', !rp.band, 'rpBand(false)')}${rpChip('La bande', rp.band, 'rpBand(true)')}</div>${rpChip('Guitare de l’app', rp.demo, 'rp.demo=!rp.demo;if(rp.S)rp.S.demo=rp.demo;rpRender(true)')}</div>
    <div class="rp-row">${rpTempoHTML()}<button type="button" class="rp-go" id="rp-play" onclick="rpRhPlay()"></button></div>
    <button type="button" class="btn btn-ghost rp-wide" onclick="rpGameStart('ninja',{lvl:0,line:'${r.pat}',beats:${beats}})">Me lancer le défi : rythme ninja</button>
    <p class="rp-say" id="rp-say"></p>${rpAvisBtn('rp-rythme')}`;
}
function rpRhPlay() {
  if (rp.S) { rpStop(); return; }
  const r = RHYTHMS.find(x => x.id === rp.id), beats = RH_BEATS[r.mes] || 4;
  if (rp.bpmFor !== r.id) { rp.bpm = Math.round((r.bpm[0] + r.bpm[1]) / 4) * 2 - 6; rp.bpmFor = r.id; rpBpm(0); }
  rpPlay({beats, style: beats === 3 ? 'valse' : rp.style === 'valse' ? 'pop' : rp.style, line: rpLine(r.pat, beats * 2), chords: RP_CHSETS[rp.chs], demo: rp.demo, say: 'À toi : gratte sur les cases orange.'});
}

/* ── Répét' : une suite d'accords ── */
function rpSuHTML() {
  const p = FEEL_PROGS.find(x => x.id === rp.id); if (!p) return '';
  const rhs = (FEEL_RH[p.id] || p.rh || ['feucamp']).map(id => RHYTHMS.find(r => r.id === id)).filter(r => r && r.res === 8);
  if (!rp.suRh || !rhs.find(r => r.id === rp.suRh)) rp.suRh = (rhs[0] || {}).id;
  const rec = (rpData().tours || {})[p.id] || 0;
  return `${rpTop('Répét’ · suite d’accords · ' + esc((AMBIANCES.find(a => a.id === p.amb) || {}).n || ''), esc(p.n))}
    ${rpRoomHTML()}${rpPadsHTML((RH_BEATS[(RHYTHMS.find(r => r.id === rp.suRh) || {}).mes] || 4))}
    <div class="rp-cards" id="rp-cards" style="--n:${Math.min(4, p.ch.length)}">${p.ch.map((c, k) => `<span class="rp-cc${k === 0 ? ' now' : k === 1 ? ' next' : ''}">${esc(c)}</span>`).join('')}</div>
    <div class="rp-barw"><span id="rp-barp"></span></div>
    <div class="rp-row top"><div class="rp-diag" id="rp-diag">${chordSVG(newChord(p.ch[0]), {size: 1.25})}</div>
      <div class="rp-col"><b class="rp-lbl">Avec quel rythme ?</b><div class="rp-styles wrap">${rhs.map(r => rpChip(esc(r.n), rp.suRh === r.id, `rp.suRh='${r.id}';rpStop();rpRender(true)`)).join('')}</div>
      ${p.ex ? `<small class="rp-dim">On l’entend dans : ${p.ex.map(esc).join(', ')}</small>` : ''}</div></div>
    <div class="rp-stat"><span>Tours joués</span><b id="rp-tours">${rp.tours}</b><small>record ${rec}</small></div>
    <div class="rp-row">${rpTempoHTML()}${rpChip('Guitare de l’app', rp.demo, 'rp.demo=!rp.demo;if(rp.S)rp.S.demo=rp.demo;rpRender(true)')}<button type="button" class="rp-go" id="rp-play" onclick="rpSuPlay()"></button></div>
    <button type="button" class="btn btn-ghost rp-wide" onclick="rpSuSheet()">En faire une fiche</button>${rpAvisBtn('rp-suite')}`;
}
function rpSuPlay() {
  if (rp.S) { rpStop(); return; }
  const p = FEEL_PROGS.find(x => x.id === rp.id), r = RHYTHMS.find(x => x.id === rp.suRh) || RHYTHMS[2], beats = RH_BEATS[r.mes] || 4;
  if (rp.suBpmFor !== p.id) { rp.bpm = p.bpm[0]; rp.suBpmFor = p.id; rpBpm(0); }
  rp.tours = 0; const t = $('rp-tours'); if (t) t.textContent = '0';
  rpPlay({beats, style: beats === 3 ? 'valse' : rp.style === 'valse' ? 'pop' : rp.style, chords: p.ch, line: rpLine(r.pat, beats * 2), demo: rp.demo,
    onBar: (S, b) => { if (b > 0 && b % p.ch.length === 0) { rp.tours++; const e = $('rp-tours'); if (e) e.textContent = rp.tours; rpSave(d => { d.tours = d.tours || {}; d.tours[p.id] = Math.max(d.tours[p.id] || 0, rp.tours); }); } }});
}
function rpSuSheet() {
  const p = FEEL_PROGS.find(x => x.id === rp.id); if (!p) return;
  rpStop(); feel.amb = p.amb; feel.prog = p.id; feel.kind = 'rh'; feel.rh = rp.suRh || 'feucamp'; feel.bpm = rp.bpm;
  try { feelMakeSheet(); } catch (e) { toast('Impossible de créer la fiche ici', true); }
}

/* ── Les déclics : regarde → essaie → monte → gagné ── */
function rpDcPals(row) { const b = row.bpm; return [Math.max(50, b - 16), Math.max(54, b - 6), b + 4]; }
function rpDcHTML() {
  const d = rpDeclics().find(x => x.k === rp.id); if (!d) return '';
  if (!rp.dc || rp.dc.k !== d.k) rp.dc = {k: d.k, step: 0, pal: 0, slow: 0, ask: false, miss: 0};
  const C = rp.dc, pals = rpDcPals(d.row), steps = ['Regarde', 'Essaie', 'Monte', 'Gagné'];
  const bar = `<div class="rp-steps">${steps.map((s, k) => `<span class="${k <= C.step ? 'on' : ''}${k === C.step ? ' cur' : ''}"><i></i>${s}</span>`).join('')}</div>`;
  const top = rpTop(esc(d.mur), esc(d.t));
  if (C.step === 0) return `${top}${bar}<div class="rp-vid">${lvCard(d.k, 'rp')}</div>${mediBulle('contente', esc(d.d), {size: 48, cls: 'rp-tip'})}
    <button type="button" class="rp-go wide" onclick="rpDcStep(1)">${RP_PLAY}<span>J’essaie avec la bande</span></button>${rpAvisBtn('rp-declic')}`;
  if (C.step === 3) {
    const want = d.row.chords, mine = sheets.filter(s => (s.parts || []).some(p => want.every(n => (p.chords || []).some(c => c.name === n)))).slice(0, 3);
    return `${bar}<div class="rp-win">${rpRoomHTML({expr: 'contente', solo: false, tchik: true, extra: '<span class="rp-spk s1"></span><span class="rp-spk s2"></span><span class="rp-spk s3"></span>'})}</div>
      <div class="rp-wint"><small>DÉCLIC DÉBLOQUÉ</small><h2>${esc(d.t)}</h2><p>${pals[2]} BPM, avec toute la bande, sans t’arrêter.</p></div>
      ${mine.length ? `<h3 class="rp-h3">Ça marche déjà dans ${mine.length > 1 ? mine.length + ' de tes fiches' : 'une de tes fiches'}</h3>${mine.map(s => `<button type="button" class="rp-fiche" onclick="labStop();viewSheet('${s.id}')"><b>${esc(s.title)}</b><small>${esc(s.artist || '')}</small><span>${want.map(esc).join(' · ')}</span></button>`).join('')}`
        : `<p class="rp-dim">Aucune de tes fiches n’a encore ${want.map(esc).join(' et ')}. Ça viendra !</p>`}
      <div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rp.dc=null;rpRender()">Rejouer</button><button type="button" class="btn btn-primary" onclick="rpGo('home')">Retour à la répét’</button></div>${rpAvisBtn('rp-declic')}`;
  }
  const bpm = Math.max(46, pals[C.pal] - C.slow), tchik = C.pal > 0;
  const ask = C.ask ? (C.ask === 'presque'
    ? `<div class="rp-ask">${mediBulle('curieuse', `<b>Presque !</b> ${C.miss > 1 ? 'Encore un peu plus lent cette fois.' : 'On ralentit un peu.'}`, {size: 52})}
       <div class="rp-say-b basile">Pars un temps avant : quand ma barre est pleine, tu es déjà sur le prochain accord.</div>
       <div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpDcStep(0)">Revoir</button><button type="button" class="btn btn-primary" onclick="rpDcRun()">${RP_PLAY} Rejouer à ${bpm}</button></div></div>`
    : `<div class="rp-ask"><b class="rp-q">Alors, sans t’arrêter ?</b><div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpDcRes(false)">Ça a coincé</button><button type="button" class="btn btn-primary" onclick="rpDcRes(true)">Sans m’arrêter !</button></div></div>`) : '';
  return `${top}${bar}
    ${rpRoomHTML({solo: false, tchik, extra: C.pal === 1 && C.fresh ? '<span class="rp-arrive">Tchik arrive !</span>' : ''})}${rpPadsHTML(4)}
    <div class="rp-pals">${pals.map((p, k) => `<span class="${k < C.pal ? 'ok' : k === C.pal ? 'cur' : ''}"><b>${k === C.pal ? bpm : p}</b><small>${k < C.pal ? 'réussi' : k === C.pal ? 'maintenant' : k === 2 ? 'toute la bande' : 'ensuite'}</small></span>`).join('')}</div>
    <div class="rp-chline"><b id="rp-chord">${esc(d.row.chords[0])}</b><span>puis <b id="rp-next">${esc(d.row.chords[1] || '')}</b></span></div>
    <div class="rp-barw"><span id="rp-barp"></span></div>
    ${rpLaneHTML(rpLine(d.row.pat, 8), 4)}
    <p class="rp-say" id="rp-say"></p>
    ${ask || `<div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpDcRun(true)">${RP_PLAY} Écouter</button><button type="button" class="rp-go" id="rp-play" data-l="${C.pal ? 'Palier ' + (C.pal + 1) : 'Jouer'}" onclick="rpDcRun()"></button></div>`}
    ${rpAvisBtn('rp-declic')}`;
}
function rpDcStep(s) { rpStop(); if (typeof lvStop === 'function') lvStop(); rp.dc.step = s; rp.dc.ask = false; rpRender(); }
function rpDcRun(demo) {
  if (rp.S) { rpStop(); return; }
  const d = rpDeclics().find(x => x.k === rp.id), C = rp.dc, pals = rpDcPals(d.row);
  C.ask = false; C.fresh = false; rpRender(true);
  rpPlay({bpm: Math.max(46, pals[C.pal] - C.slow), beats: 4, style: 'pop', tchik: C.pal > 0, line: rpLine(d.row.pat, 8), chords: d.row.chords, demo: !!demo, bars: demo ? 2 : 4,
    say: demo ? 'Écoute la guitare de l’app.' : 'À toi : ne t’arrête pas aux changements.',
    onEnd: () => { if (demo) return; C.ask = 'q'; rpRender(true); }});
}
function rpDcRes(ok) {
  const C = rp.dc;
  if (!ok) { C.miss++; C.slow += 6; C.ask = 'presque'; rpRender(true); return; }
  C.slow = 0; C.miss = 0; C.ask = false;
  if (C.pal >= 2) { C.step = 3; rpSave(d => { d.dc = d.dc || {}; d.dc[C.k] = Date.now(); }); tnDing(true); }
  else { C.pal++; C.step = 2; C.fresh = true; tnDing(false); }
  rpRender();
}

/* ── JEUX : la tournée, le défi du jour, trois jeux ── */
function rpStars(f) { return f >= .9 ? 3 : f >= .7 ? 2 : f >= .4 ? 1 : 0; }
const rpStarHTML = n => `<span class="rp-stars">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}">★</i>`).join('')}</span>`;
function rpJeuxHTML() {
  const D = rpData(), T = D.tour || {}, today = new Date().toDateString(), df = D.defi || {};
  const open = k => k === 0 || (T[RP_TOUR[k - 1].id] || 0) >= 1, cur = RP_TOUR.findIndex((v, k) => open(k) && !(T[v.id] >= 1));
  const lvl = Math.max(1, ...RP_TOUR.filter((v, k) => open(k)).map(v => v.lvl));
  const pos = [[4, 76], [52, 52], [10, 26], [56, 2]];
  return `<section class="rp-tour"><small class="rp-kick">LA TOURNÉE</small>
      <svg class="rp-road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M14 86 C40 86 70 80 72 64 C74 48 34 50 28 38 C22 24 50 16 76 12"/></svg>
      ${RP_TOUR.map((v, k) => `<button type="button" class="rp-venue${open(k) ? (T[v.id] >= 1 ? ' done' : ' cur') : ' lock'}" style="left:${pos[k][0]}%;top:${pos[k][1]}%" onclick="${open(k) ? `rpConcert(${k})` : `toast('Gagne une étoile à l’étape d’avant pour ouvrir ${esc(v.n)}')`}" ${open(k) ? '' : 'aria-disabled="true"'}>
        <b>${esc(v.n)}</b>${open(k) ? rpStarHTML(T[v.id] || 0) : '<small>fermé</small>'}</button>`).join('')}
      ${cur >= 0 ? `<span class="rp-tmedi" style="${pos[cur][1] < 20 ? `left:calc(${pos[cur][0]}% + 128px);top:${pos[cur][1]}%` : `left:calc(${pos[cur][0]}% + 10px);top:calc(${pos[cur][1]}% - 40px)`}">${mediSVG('contente', {size: 40, anim: 'hop'})}</span>` : ''}</section>
    <div class="rp-defi"><div><small class="rp-kick">DÉFI DU JOUR</small><b>Un max d’accords en 30 s</b><small>record : ${df.best || 0}${df.day === today ? ' · fait aujourd’hui' : ''}</small></div><button type="button" class="rp-go sm" onclick="rpGameStart('eclair',{lvl:${lvl},defi:true})">Go</button></div>
    <section class="rp-sec"><div class="rp-sh"><h2>Les jeux</h2><small>niveau ${lvl}</small></div>
    <div class="rp-games">
      <button type="button" class="rp-game g1" onclick="rpGameStart('oreille',{lvl:${lvl}})"><span>${BASILE_SVG(true, 'basile')}</span><b>L’oreille</b><small>quel accord joue la bande ?</small></button>
      <button type="button" class="rp-game g2" onclick="rpGameStart('ninja',{lvl:${lvl}})"><span>${BOUM_SVG(true, 'boum')}</span><b>Rythme ninja</b><small>tape pile avec Boum</small></button>
      <button type="button" class="rp-game g3" onclick="rpGameStart('eclair',{lvl:${lvl}})"><span>${mediSVG('neutre', {size: 44, anim: 'still'})}</span><b>Accords éclair</b><small>gratte sur le 1</small></button>
    </div></section>${rpAvisBtn('rp-tournee')}`;
}
function rpConcert(k) { rp.concert = {k, manche: 0, sc: []}; rpNextManche(); }
function rpNextManche() {
  const C = rp.concert, v = RP_TOUR[C.k], order = ['oreille', 'ninja', 'eclair'];
  if (C.manche >= 3) {
    const f = C.sc.reduce((a, b) => a + b, 0) / Math.max(1, C.sc.length), T = rpData().tour || {};
    C.st = rpStars(f); C.first = C.st >= 1 && !(T[v.id] >= 1);
    rpSave(d => { d.tour = d.tour || {}; d.tour[v.id] = Math.max(d.tour[v.id] || 0, C.st); });
    if (C.st) tnDing(C.st >= 3);
    rpGo('concert'); return;
  }
  rpGameStart(order[C.manche], {lvl: v.lvl, concert: true});
}
function rpGameStart(type, o) {
  rpStop(); labMicOff();
  rp.g = Object.assign({type, lvl: 1, round: 0, n: type === 'eclair' ? 8 : 8, ok: 0, pts: 0, combo: 0, best: 0, timers: [], fb: '', state: 'intro'}, o);
  if (!o.concert) rp.concert = null;
  rp.view = 'game'; rp.avis = null; rpRender(); window.scrollTo(0, 0);
}
function rpGameHTML() {
  const g = rp.g; if (!g) return '';
  const C = rp.concert, kick = C ? `${RP_TOUR[C.k].n} · manche ${C.manche + 1} sur 3` : g.defi ? 'Défi du jour' : `Jeux · niveau ${g.lvl || 'libre'}`;
  const name = {oreille: 'L’oreille', ninja: 'Rythme ninja', eclair: 'Accords éclair'}[g.type];
  const right = `<span class="rp-pts"><b id="rp-pts">${g.pts}</b><small id="rp-combo">${g.combo > 1 ? 'x' + g.combo : ''}</small></span>`;
  const top = `<div class="rp-top"><button type="button" class="mt-back" onclick="rpGo('home')" aria-label="Quitter le jeu">${RP_BACK}</button><div><small>${kick}</small><h1>${name}</h1></div>${right}</div>`;
  if (g.state === 'end') return top + rpGameEndHTML();
  return top + (g.type === 'oreille' ? rpOrHTML() : g.type === 'ninja' ? rpNjHTML() : rpEcHTML());
}
function rpFb(txt, cls) { const f = $('rp-fb'); if (!f) return; f.className = 'rp-fb ' + (cls || ''); f.textContent = txt; void f.offsetWidth; f.classList.add('pop'); }
function rpPts() { const g = rp.g, p = $('rp-pts'), c = $('rp-combo'); if (p) p.textContent = g.pts; if (c) c.textContent = g.combo > 1 ? 'x' + g.combo : ''; }
function rpGameEnd(frac) {
  const g = rp.g; rpStop(); labMicOff();
  g.frac = Math.max(0, Math.min(1, frac)); g.state = 'end';
  if (g.defi) { const D = rpData().defi || {}; g.rec = g.ok > (D.best || 0); rpSave(d => { d.defi = {best: Math.max((d.defi || {}).best || 0, g.ok), day: new Date().toDateString()}; }); }
  if (rp.concert) { rp.concert.sc.push(g.frac); rp.concert.pts = (rp.concert.pts || 0) + g.pts; rp.concert.manche++; }
  rpRender();
}
function rpGameEndHTML() {
  const g = rp.g, st = rpStars(g.frac), C = rp.concert;
  const line = g.type === 'oreille' ? `${g.ok} bonnes réponses sur ${g.n}` : g.type === 'ninja' ? `${g.per || 0} parfaits, ${g.bien || 0} bien, ${g.rate || 0} ratés` : g.defi ? `${g.ok} accords en 30 s` : `${g.ok} accords sur ${g.n}`;
  const rec = g.rec ? '<p class="rp-rec">Nouveau record !</p>' : '';
  return `<div class="rp-end">${rpRoomHTML({expr: st ? 'contente' : 'curieuse', solo: false, tchik: true, small: true})}
    <div class="rp-wint"><small>${st >= 2 ? 'BIEN JOUÉ' : st ? 'PAS MAL' : 'PRESQUE'}</small>${rpStarHTML(st)}<p>${line}</p><p class="rp-dim">${g.pts} points · meilleur combo x${g.best}</p>${rec}</div>
    <div class="rp-row">${C ? `<button type="button" class="btn btn-primary rp-wide" onclick="rpNextManche()">${C.manche >= 3 ? 'Fin du concert' : 'Manche suivante'}</button>`
      : `<button type="button" class="btn btn-ghost" onclick="rpGo('home')">Retour</button><button type="button" class="btn btn-primary" onclick="rpGameStart('${g.type}',{lvl:${g.lvl},defi:${!!g.defi}${g.line ? `,line:'${g.line}',beats:${g.beats}` : ''}})">Rejouer</button>`}</div>
    ${C ? '' : rpAvisBtn('rp-' + g.type)}</div>`;
}
function rpConcertHTML() {
  const C = rp.concert; if (!C) return '';
  const v = RP_TOUR[C.k], st = C.st || 0, first = C.first;
  return `<div class="rp-win">${rpRoomHTML({expr: 'contente', solo: false, tchik: true, extra: st ? '<span class="rp-spk s1"></span><span class="rp-spk s2"></span><span class="rp-spk s3"></span><span class="rp-crowd"></span>' : ''})}</div>
    <div class="rp-wint"><small>CONCERT TERMINÉ · ${esc(v.n).toUpperCase()}</small>${rpStarHTML(st)}<p>${C.pts || 0} points</p>
      <p class="rp-dim">${st >= 3 ? 'Trois étoiles : le public en redemande.' : st ? 'La 3e étoile : refais le concert sans faute.' : 'Il faut une étoile pour ouvrir l’étape suivante.'}</p></div>
    ${first ? `<div class="rp-unlock"><small class="rp-kick">DÉBLOQUÉ</small><b>${esc(v.win)}</b></div>` : ''}
    <div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpConcert(${C.k})">Rejouer</button><button type="button" class="btn btn-primary" onclick="rp.tab='jeux';rpGo('home')">La tournée</button></div>
    ${rpAvisBtn('rp-tournee')}`;
}

/* Jeu 1 : l'oreille (aucun micro : la bande sait ce qu'elle joue) */
const RP_KEYS = [['G', 'C', 'D', 'Em'], ['C', 'F', 'G', 'Am'], ['D', 'G', 'A', 'Bm'], ['A', 'D', 'E', 'F#m']];
function rpOrNew() {
  const g = rp.g, R = {};
  if (g.lvl <= 1) {
    const root = ['C', 'D', 'E', 'G', 'A'][Math.floor(Math.random() * 5)], min = Math.random() < .5;
    Object.assign(R, {play: [min ? root + 'm' : root], good: min ? 'Mineur' : 'Majeur', opts: ['Majeur', 'Mineur'], q: 'Majeur (joyeux) ou mineur (triste) ?'});
  } else {
    const K = RP_KEYS[g.lvl === 2 ? 0 : Math.floor(Math.random() * (g.lvl === 3 ? 2 : 4))], tgt = K[1 + Math.floor(Math.random() * 3)];
    Object.assign(R, {play: [K[0], tgt], good: tgt, opts: K.slice(1).sort(() => Math.random() - .5), q: `Basile joue ${K[0]}, puis… ?`});
  }
  g.R = R; g.picked = null;
}
function rpOrHTML() {
  const g = rp.g; if (!g.R) rpOrNew();
  g.after = () => { if (g.state === 'intro') { g.state = 'play'; rpOrPlay(); } };
  return `<div class="rp-prog"><span style="width:${g.round / g.n * 100}%"></span></div>
    ${rpRoomHTML({solo: false, tchik: false})}
    <h2 class="rp-qq">${esc(g.R.q)}</h2>
    <div class="rp-ans" style="--n:${g.R.opts.length}">${g.R.opts.map(o => `<button type="button" class="${g.picked ? (o === g.R.good ? 'ok' : o === g.picked ? 'ko' : '') : ''}" onclick="rpOrPick('${o}')" ${g.picked ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
    <div class="rp-fb" id="rp-fb"></div>
    <div class="rp-row"><button type="button" class="btn btn-ghost rp-wide" onclick="rpOrPlay()">Réécouter</button></div>
    <p class="rp-dim c">Manche ${g.round + 1} sur ${g.n} · niveaux : majeur ou mineur → l’accord suivant → dans d’autres tonalités</p>`;
}
function rpOrPlay() {
  const g = rp.g; if (!g || !g.R) return;
  const ac = audioReady(); let t = ac.currentTime + .08;
  g.R.play.forEach((c, k) => {
    const ch = newChord(c); strumChord(ch, 0, 'D', t, 1); pluck(labRoot(c), t, .9, .2);
    g.timers.push(setTimeout(() => metroBump(document.querySelector('#rp-room .basile .pv'), 12, 360, .1), (t - ac.currentTime) * 1000));
    t += 1.3;
  });
}
function rpOrPick(o) {
  const g = rp.g; if (g.picked) return; g.picked = o;
  if (o === g.R.good) { g.ok++; g.combo++; g.best = Math.max(g.best, g.combo); const p = 10 * Math.min(g.combo, 5); g.pts += p; rpRender(true); rpFb(`Bien vu ! +${p}`, 'ok'); metroBump(document.querySelector('#rp-medi'), 22, 420, .12); }
  else { g.combo = 0; rpRender(true); rpFb(`C’était ${g.R.good}`, 'ko'); }
  rpPts();
  g.timers.push(setTimeout(() => { g.round++; if (g.round >= g.n) { rpGameEnd(g.ok / g.n); return; } rpOrNew(); rpRender(true); rpOrPlay(); }, 1300));
}

/* Jeu 2 : rythme ninja (on tape l'écran ; option : gratter, le micro écoute) */
const RP_NJ = [null, {pat: 'D-D-D-D-', bpm: 72}, {pat: 'D-DU-UDU', bpm: 80}, {pat: 'D--U-UDU', bpm: 86}, {pat: '-U-U-U-U', bpm: 92}];
function rpNjHTML() {
  const g = rp.g;
  if (!g.lane) { const L = g.line ? {pat: g.line, bpm: rp.bpm} : RP_NJ[Math.min(4, g.lvl || 1)]; g.pat = L.pat; g.bpmG = L.bpm; g.lane = 1; }
  g.after = () => {};
  return `${rpRoomHTML({solo: false, tchik: false})}
    <div class="rp-hw" id="rp-hw"><span class="rp-hit"></span></div>
    <div class="rp-fb big" id="rp-fb"></div>
    <div class="rp-cnt"><span class="per">Parfait <b id="rp-per">${g.per || 0}</b></span><span>Bien <b id="rp-bien">${g.bien || 0}</b></span><span>Raté <b id="rp-rate">${g.rate || 0}</b></span></div>
    ${g.state === 'intro' ? `<p class="rp-dim c">Les ronds arrivent sur le cercle : tape quand ils le touchent. Boum compte une mesure avant.</p>
      <div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpNjStart(true)">Gratter (le micro écoute)</button><button type="button" class="btn btn-primary" onclick="rpNjStart(false)">${RP_PLAY} Taper l’écran</button></div>`
      : `<button type="button" class="rp-tap" id="rp-tap" onpointerdown="rpNjTap(event)">${g.mic ? 'GRATTE' : 'TAPE'}</button>`}`;
}
async function rpNjStart(mic) {
  const g = rp.g; g.mic = mic;
  if (mic && !await labMicOn(true)) g.mic = false;
  g.state = 'play'; g.per = g.bien = g.rate = 0; rpRender(true);
  const beats = g.beats || 4, n = beats * 2, line = rpLine(g.pat, n), bars = 4;
  const S = rpPlay({bpm: g.bpmG, beats, style: 'pop', tchik: false, line, chords: ['G', 'C'], bars, demo: false, say: '',
    onEnd: () => g.timers.push(setTimeout(() => { const tot = g.notes.length; rpGameEnd(tot ? (g.per + g.bien * .6) / tot : 0); }, 300))});
  const dur = 60 / S.bpm / 2, t0 = S.start + n * dur;
  g.notes = []; for (let b = 0; b < bars; b++) line.forEach((v, i) => { if (v) g.notes.push({t: t0 + (b * n + i) * dur, j: null}); });
  const hw = $('rp-hw');
  g.notes.forEach(N => { const e = document.createElement('span'); e.className = 'rp-note'; hw.appendChild(e); N.el = e; });
  const ac = audio(), lat = (ac.outputLatency || 0) + (ac.baseLatency || 0), lead = 1.6;
  g.lat = lat; g.micSeen = 0;
  const loop = () => {
    if (rp.g !== g || g.state !== 'play') return;
    const now = ac.currentTime - lat, W = hw.clientWidth - 64;
    g.notes.forEach(N => {
      const d = N.t - now;
      if (N.j == null && d < -.2) rpNjJudge(N, 9);
      if (!N.el) return;
      if (d > lead || N.j != null) { N.el.style.opacity = N.j != null ? 0 : 0; return; }
      N.el.style.opacity = 1; N.el.style.transform = `translateX(${Math.max(0, d / lead * W)}px)`;
    });
    if (g.mic && lab.mic) { const on = lab.mic.on; while (g.micSeen < on.length) { rpNjHitAt(on[g.micSeen].t - (g.lat || 0) - .03); g.micSeen++; } }
    g.raf = requestAnimationFrame(loop);
  };
  g.raf = requestAnimationFrame(loop);
}
function rpNjTap(e) {
  if (e) e.preventDefault();
  const g = rp.g; if (!g || g.state !== 'play') return;
  const b = $('rp-tap'); if (b) { b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); }
  rpNjHitAt(audio().currentTime - (g.lat || 0));
}
function rpNjHitAt(t) {
  const g = rp.g; let best = null, bd = 1;
  g.notes.forEach(N => { if (N.j == null) { const d = Math.abs(N.t - t); if (d < bd) { bd = d; best = N; } } });
  if (best && bd < .2) rpNjJudge(best, bd);
}
function rpNjJudge(N, d) {
  const g = rp.g, w = g.mic ? [.09, .17] : [.06, .13];
  N.j = d < w[0] ? 'per' : d < w[1] ? 'bien' : 'rate';
  if (N.j === 'rate') { g.rate++; g.combo = 0; rpFb('Raté', 'ko'); }
  else { g[N.j]++; g.combo++; g.best = Math.max(g.best, g.combo); g.pts += (N.j === 'per' ? 100 : 50) * Math.min(4, 1 + Math.floor(g.combo / 4)); rpFb(N.j === 'per' ? 'Parfait !' : 'Bien', N.j === 'per' ? 'ok' : ''); metroBump(document.querySelector('#rp-medi'), 16, 260, .1); }
  ['per', 'bien', 'rate'].forEach(k => { const e = $('rp-' + k); if (e) e.textContent = g[k]; });
  rpPts();
}

/* Jeu 3 : accords éclair (tu valides toi-même ; le micro dit seulement si tu étais à l'heure) */
const RP_EC = [null, ['G', 'C', 'D', 'Em'], ['G', 'C', 'D', 'Em', 'Am', 'E', 'A'], ['G', 'C', 'D', 'Em', 'Am', 'E', 'A', 'Dm'], ['G', 'C', 'D', 'Em', 'Am', 'E', 'A', 'Dm', 'F', 'Bm']];
function rpEcHTML() {
  const g = rp.g, pool = RP_EC[Math.min(4, g.lvl || 1)];
  if (!g.cur) { let c; do { c = pool[Math.floor(Math.random() * pool.length)]; } while (c === g.prev && pool.length > 1); g.cur = c; }
  g.after = () => {};
  const left = g.defi ? `<span class="rp-clock" id="rp-clock">${g.left != null ? g.left : 30} s</span>` : `<div class="rp-prog"><span style="width:${g.round / g.n * 100}%"></span></div>`;
  return `${left}
    <div class="rp-ec"><small>pose l’accord et gratte sur le 1</small><b class="rp-big">${esc(g.cur)}</b>${g.help ? `<div class="rp-diag c">${chordSVG(newChord(g.cur), {size: 1.4})}</div>` : ''}</div>
    <div class="rp-pads ec" id="rp-pads"><i>4</i><i>3</i><i>2</i><i>1</i></div>
    <div class="rp-say-b boum">${g.state === 'intro' ? 'Je compte 4, 3, 2… et tu grattes sur le 1 !' : g.wait ? 'Tu l’as eu ?' : 'Prépare tes doigts…'}</div>
    <div class="rp-fb" id="rp-fb"></div>
    ${g.state === 'intro' ? `<div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpEcStart(true)">Avec le micro</button><button type="button" class="btn btn-primary" onclick="rpEcStart(false)">${RP_PLAY} C’est parti</button></div>
      <p class="rp-dim c">Le micro dit seulement si tu as gratté à l’heure. Le bon accord, c’est toi qui le valides.</p>`
      : `<div class="rp-row"><button type="button" class="btn btn-ghost" onclick="rpEcRes(false)" ${g.wait ? '' : 'disabled'}>Pas eu le temps</button><button type="button" class="btn btn-primary" onclick="rpEcRes(true)" ${g.wait ? '' : 'disabled'}>Je l’ai !</button></div>`}`;
}
async function rpEcStart(mic) {
  const g = rp.g; g.mic = mic;
  if (mic && !await labMicOn(true)) g.mic = false;
  g.state = 'play';
  if (g.defi) { g.left = 30; g.n = 999; g.clock = setInterval(() => { if (rp.g !== g) { clearInterval(g.clock); return; } g.left--; const c = $('rp-clock'); if (c) c.textContent = g.left + ' s'; if (g.left <= 0) { clearInterval(g.clock); rpGameEnd(Math.min(1, g.ok / 10)); } }, 1000); }
  rpEcRound();
}
function rpEcRound() {
  const g = rp.g; if (!g || g.state !== 'play') return;
  g.wait = false; g.help = false; rpRender(true);
  const ac = audioReady(), bpm = [0, 70, 80, 90, 100][Math.min(4, g.lvl || 1)] + (g.defi ? 10 : 0), beat = 60 / bpm, t0 = ac.currentTime + .2;
  for (let k = 0; k < 4; k++) metroKick(t0 + k * beat);
  const one = t0 + 4 * beat; metroClick(one, true); metroSnare(one);
  g.one = one; const seen = lab.mic ? lab.mic.on.length : 0;
  for (let k = 0; k < 4; k++) g.timers.push(setTimeout(() => {
    document.querySelectorAll('#rp-pads i').forEach((p, j) => p.classList.toggle('now', j === k));
    metroBump(document.querySelector('#rp-room .boum .pv'), 10, 240, .1);
  }, (t0 + k * beat - ac.currentTime) * 1000));
  g.timers.push(setTimeout(() => {
    if (rp.g !== g) return;
    document.querySelectorAll('#rp-pads i').forEach(p => p.classList.remove('now'));
    g.wait = true; rpRender(true);
    if (g.mic && lab.mic) g.timers.push(setTimeout(() => {
      const hit = lab.mic.on.slice(seen).find(o => o.t > one - .25 && o.t < one + .5);
      rpFb(hit ? (hit.t - one < .15 ? 'Pile à l’heure !' : 'Un peu en retard') : 'Je ne t’ai pas entendu', hit && hit.t - one < .15 ? 'ok' : '');
    }, 550));
  }, (one - ac.currentTime) * 1000 + 40));
}
function rpEcRes(got) {
  const g = rp.g; if (!g.wait) return; g.wait = false;
  if (got) { g.ok++; g.combo++; g.best = Math.max(g.best, g.combo); g.pts += 20 * Math.min(g.combo, 5); metroBump(document.querySelector('#rp-medi'), 20, 380, .12); }
  else { g.combo = 0; g.help = true; }
  rpPts(); g.round++; g.prev = g.cur; const was = g.cur; g.cur = null;
  if (!got) { g.cur = was; rpRender(true); g.cur = null; }
  g.timers.push(setTimeout(() => {
    if (rp.g !== g || g.state !== 'play') return;
    if (!g.defi && g.round >= g.n) { rpGameEnd(g.ok / g.n); return; }
    rpEcRound();
  }, got ? 250 : 1600));
}

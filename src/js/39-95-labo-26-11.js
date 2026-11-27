/* ═══════ LABO : LES TESTS DU 26/11 (caché : ?beta) ═══════
   Les choix de Lucas sur maquette, à essayer en vrai avant de décider (tri du 26/11) :
   1. le son de ta prise dessiné de 3 façons : le rebond (Médi rebondit sur chaque coup), les cordes, la rosace ;
   2. l'arpège sur les six cordes (seule la corde jouée vibre, la basse résonne plus longtemps) ;
   3. les effets marqués sur le rebond (accolade PM, « h ») + le panneau d'explication ;
   4. la banque de rythmes (liste sobre : nom, mini rebond, ▶ ; le lecteur s'ouvre en bas).
   Le son : ta prise (les coups sont repérés à l'écoute du fichier) ou un rythme joué par le moteur unique (rhStart).
   Le temps est compté en « unités » : des cases pour un rythme de l'app (le tempo peut changer), des secondes pour une prise. */
const LAB_TESTS26 = [
  {id: 'l26-son', grp: '26', t: 'Le son de ta prise', d: 'Le mélange, le rebond, les cordes ou la rosace : lequel se lit le mieux ?', ask: ['Le mélange', 'Le rebond', 'Les cordes', 'La rosace'], askq: 'Lequel tu préfères ?'},
  {id: 'l26-arp', grp: '26', t: 'L’arpège sur les cordes', d: 'Chaque note fait vibrer sa corde, la basse sonne plus longtemps.'},
  {id: 'l26-fx', grp: '26', t: 'Les effets sur le rebond', d: 'PM et « h » posés sur les coups : touche-les.'},
  {id: 'l26-banque', grp: '26', t: 'La banque de rythmes', d: 'Une liste sobre, le lecteur s’ouvre en bas.'}
];
const L26 = {style: 'saute', src: null, part: null, tl: null, raf: 0, a: null, live: null, fx: null, bank: null, mini: {}};
const L26_MP = 'M12 2.2c5.6 0 9.6 2.3 9.6 6.6 0 5.6-6.4 12-9.6 13-3.2-1-9.6-7.4-9.6-13 0-4.3 4-6.6 9.6-6.6z';
const l26f = v => (Math.round(v * 10) / 10).toString();
// Médi en médiator (pointe en bas = un bas ; rot 180 = un haut)
const l26Pick = (cx, cy, size, rot, eyes) => `<g transform="translate(${l26f(cx - size / 2)} ${l26f(cy - size / 2)}) scale(${(size / 24).toFixed(3)}) rotate(${rot} 12 12)"><path d="${L26_MP}" fill="currentColor"/>${eyes ? '<rect class="l26-eye" x="8.4" y="7.6" width="2" height="4" rx="1"/><rect class="l26-eye" x="13.6" y="7.6" width="2" height="4" rx="1"/>' : ''}</g>`;
const l26Arrow = (x, y, d, h) => { const a = h * .32; return d === 'U' ? `M${l26f(x)} ${l26f(y + h)}V${l26f(y)}M${l26f(x - a)} ${l26f(y + a)}L${l26f(x)} ${l26f(y)}L${l26f(x + a)} ${l26f(y + a)}` : `M${l26f(x)} ${l26f(y)}V${l26f(y + h)}M${l26f(x - a)} ${l26f(y + h - a)}L${l26f(x)} ${l26f(y + h)}L${l26f(x + a)} ${l26f(y + h - a)}`; };
const l26Time = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ── la ligne du temps ── */
// d'un rythme de l'app : une unité = une case
function l26FromRh(rh, chords) {
  rh = rhNorm(rh); const per = rhPerBar(rh.mes, rh.res), spb = rhSpb(rh.mes, rh.res), n = rh.cells.length;
  const bars = Math.max(rh.bars, chords ? chords.length : 1), L = bars * per, hits = [];
  for (let k = 0; k < L; k++) { const c = rh.cells[k % n]; if (c) hits.push({t: k, d: c.d === 'U' ? 'U' : 'D', a: c.d === 'X' ? .45 : c.a === 2 ? 1 : c.a === 0 ? .5 : .8, x: c.d === 'X', k}); }
  return {hits, L, bar: per, beat: spb, grid: {per, spb, mes: rh.mes}, chords: chords || [], win: Math.min(L, 2 * per), unit: 'case'};
}
// d'une prise : les coups repérés dans le fichier (même méthode que rhFromTake), en secondes
function l26FromTake(buf, start, end, bpm, chords) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, i0 = Math.floor(start * sr), i1 = Math.min(d.length, Math.floor(end * sr));
  const hop = Math.round(sr * .006), n = Math.floor((i1 - i0) / hop); if (n < 20) return null;
  const en = new Float32Array(n); let emx = 0;
  for (let i = 0; i < n; i++) { let e = 0; for (let k = i0 + i * hop, m = k + hop; k < m; k++) e += d[k] * d[k]; en[i] = Math.sqrt(e / hop); if (en[i] > emx) emx = en[i]; }
  const fl = new Float32Array(n); let mx = 0;
  for (let i = 2; i < n; i++) { fl[i] = Math.max(0, en[i] - Math.max(en[i - 1], en[i - 2])); if (fl[i] > mx) mx = fl[i]; }
  if (mx < .004) return null;
  const on = [], gap = Math.round(.09 / .006); let last = -gap;
  for (let i = 2; i < n - 1; i++) if (fl[i] > mx * .16 && fl[i] >= fl[i - 1] && fl[i] >= fl[i + 1] && i - last >= gap) { on.push({t: i * hop / sr, f: fl[i] / mx}); last = i; }
  if (on.length < 2) return null;
  const cell = l26Cell(on, bpm);
  const hits = on.map(o => { const k = Math.round((o.t - on[0].t) / cell); return {t: o.t, d: k % 2 ? 'U' : 'D', a: Math.max(.35, Math.min(1, o.f * 1.15))}; });
  const env = new Float32Array(240); for (let j = 0; j < 240; j++) { const i = Math.min(n - 1, Math.floor(j / 239 * (n - 1))); env[j] = emx ? Math.min(1, en[i] / emx * 1.1) : 0; }
  const L = (i1 - i0) / sr, bar = 8 * cell;
  return {hits, L, bar, beat: 2 * cell, grid: null, chords: chords || [], env, win: Math.min(L, 2 * bar), unit: 's', off: on[0].t};
}
// le pas d'une croche dans la prise : celui qui colle le mieux aux coups entendus (à 0,02 BPM près) ;
// s'il y en a plusieurs (double, moitié), le plus proche du tempo de la fiche
function l26Cell(on, hint) {
  const t0 = on[0].t, err = bpm => { const c = 30 / bpm; let e = 0; on.forEach(o => { const x = (o.t - t0) / c; e += Math.abs(x - Math.round(x)); }); return e / on.length; };
  const res = []; for (let b = 50; b <= 200; b += .5) res.push({b, e: err(b)});
  const ok = res.filter(r => r.e < .14), h = hint || 90;
  let best = (ok.length ? ok : [res.reduce((a, r) => r.e < a.e ? r : a)]).reduce((a, r) => Math.abs(r.b - h) < Math.abs(a.b - h) ? r : a);
  for (let b = best.b - .5; b <= best.b + .5; b += .02) { const e = err(b); if (e < best.e) best = {b, e}; }
  return 30 / best.b;
}
// le volume au temps t (0 à 1) : l'enveloppe de la prise, ou les coups qui s'éteignent
function l26Env(tl, t) {
  if (tl.env) { const f = t / tl.L * (tl.env.length - 1), i = Math.floor(f); if (i < 0 || i >= tl.env.length - 1) return 0; return tl.env[i] + (tl.env[i + 1] - tl.env[i]) * (f - i); }
  let v = 0; const tau = tl.beat * .45;
  for (const h of tl.hits) { if (h.t > t) break; v = Math.max(v, h.a * Math.exp(-(t - h.t) / tau)); }
  return Math.min(1, v);
}
const l26Cur = (hits, pos) => { let j = -1; for (let i = 0; i < hits.length; i++) { if (hits[i].t <= pos) j = i; else break; } return j; };
// les chiffres sous le dessin : les temps (et les « et » pour un rythme de l'app)
function l26Labels(tl, page, X, y) {
  let s = ''; const w0 = page * tl.win, w1 = w0 + tl.win;
  if (tl.chl && tl.chl.length && tl.bar && tl.roll) {   // deux places : la mesure en cours, et la suivante dans l'autre place
    const o = tl.off || 0, sh = tl.grid ? .5 : 0;
    [page, l26MNext(tl, page)].forEach((m, j) => {
      const t0 = o + m * tl.bar, cw = X(t0 + Math.min(1, tl.bar / 2)) - X(t0), u = cw / Math.min(1, tl.bar / 2), a = X(t0) - sh * u;
      if ((j === 0 ? page : page + 1) % 2 === 1) s += `<line x1="${l26f(a)}" x2="${l26f(a)}" y1="${y - 14}" y2="${y + 2}" class="l26-lm"/>`;
      s += `<text x="${l26f(a + tl.bar * u / 2)}" y="${y}" class="l26-lc${j ? ' nx' : ''}" data-m="${m}">${esc(tl.chl[m % tl.chl.length])}</text>`;
    });
    return s;
  }
  if (tl.chl && tl.chl.length && tl.bar) {   // la fiche (27/11) : le nom de l'accord sous chaque mesure, à la place du compte
    const o = tl.off || 0;
    for (let m = Math.max(0, Math.floor((w0 - o) / tl.bar)); o + m * tl.bar < w1; m++) {
      const a = o + m * tl.bar - (tl.grid ? .5 : 0), c = a + tl.bar / 2;
      if (m > 0 && a > w0 + 1e-6) s += `<line x1="${l26f(X(a))}" x2="${l26f(X(a))}" y1="${y - 14}" y2="${y + 2}" class="l26-lm"/>`;
      if (c >= w0 && c < w1) s += `<text x="${l26f(X(c))}" y="${y}" class="l26-lc" data-m="${m}">${esc(tl.chl[m % tl.chl.length])}</text>`;
    }
    return s;
  }
  if (tl.grid) {
    for (let k = Math.ceil(w0); k < w1; k++) { const j = k % tl.grid.per, beat = j % tl.grid.spb === 0, x = X(k);
      s += `<text x="${l26f(x)}" y="${y}" class="${beat ? 'l26-lb' : 'l26-le'}">${beat ? j / tl.grid.spb + 1 : 'et'}</text>`; }
  } else {
    const o = tl.off || 0;
    for (let b = Math.ceil((w0 - o) / tl.beat); o + b * tl.beat < w1; b++) { if (b < 0) continue; s += `<text x="${l26f(X(o + b * tl.beat))}" y="${y}" class="l26-lb">${b % 4 + 1}</text>`; }
  }
  return s;
}

/* ── les dessins : chacun se monte dans un élément et se met à jour à chaque image ── */
const L26_W = 340;
function l26Mount(el, kind, tl, o) {
  o = o || {};
  const D = {el, kind, tl, o, page: -1, cur: -2, W: o.W || L26_W};
  D.X = t => 12 + (t - D.page * tl.win) / tl.win * (D.W - 24);
  D.draw = page => { D.page = page; D.cur = -2; el.innerHTML = L26_DRAW[kind].html(D); L26_DRAW[kind].bind && L26_DRAW[kind].bind(D); };
  D.frame = pos => {
    const page = pos < 0 ? 0 : tl.roll ? Math.max(0, Math.floor((pos - (tl.off || 0)) / tl.bar + 1e-6)) : tl.win >= tl.L ? 0 : Math.floor(pos / tl.win);   // à l'arrêt : la 1re page, comme au départ ; tl.roll : la page = la mesure en cours
    if (page !== D.page) D.draw(page);
    L26_DRAW[kind].frame(D, pos);
  };
  D.draw(0); L26_DRAW[kind].frame(D, -1);
  return D;
}
// les coups de la page affichée
const l26Page = D => D.tl.roll ? D.tl.hits.filter(h => { const m = l26M(D.tl, h.t); return m === D.page || m === l26MNext(D.tl, D.page); })
    .map(h => l26M(D.tl, h.t) < D.page ? Object.assign({}, h, {t: h.t + D.tl.L}) : h).sort((a, b) => a.t - b.t)   // la mesure d'après le bout de la boucle : vue comme « après »
  : D.tl.hits.filter(h => h.t >= D.page * D.tl.win - 1e-6 && h.t < (D.page + 1) * D.tl.win - 1e-6);
// tl.roll (la fiche, 27/11 : « prévisualiser le prochain accord ») : deux places qui se relaient ; la mesure en cours et la suivante
const l26M = (tl, t) => Math.floor((t - (tl.off || 0)) / tl.bar + 1e-6);
const l26NM = tl => Math.max(1, Math.ceil((tl.L - (tl.off || 0)) / tl.bar - 1e-6));
const l26MNext = (tl, m) => (m + 1) % l26NM(tl);
function l26SetCls(D, sel, cur) {   // passé / maintenant / à venir
  if (cur === D.cur) return; D.cur = cur;
  D.el.querySelectorAll(sel).forEach((g, j) => { g.classList.toggle('past', j < cur); g.classList.toggle('cur', j === cur); g.classList.toggle('fut', j > cur); });
}
const L26_DRAW = {
  // LE REBOND : Médi rebondit sur chaque coup ; rond plein = bas, creux = haut ; éclaboussure selon la force
  rebond: {
    html(D) {
      const {tl, o} = D, mini = o.mini, top = o.marks ? 26 : 0, base = top + (mini ? 34 : 88), hmax = mini ? 22 : 56, H = base + (mini ? 10 : 34);
      const hp = l26Page(D); D.hp = hp; D.base = base;
      const pts = [[0, base - hmax * .55]].concat(hp.map(h => [D.X(h.t), base]), [[D.W, base - hmax * .5]]), segs = [];
      let d = `M${l26f(pts[0][0])} ${l26f(pts[0][1])}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], hop = Math.min(hmax, (b[0] - a[0]) * 1.1), ty = Math.min(a[1], b[1]) - hop, cx = (a[0] + b[0]) / 2, cy = 2 * ty - (a[1] + b[1]) / 2;
        d += ` Q${l26f(cx)} ${l26f(cy)} ${l26f(b[0])} ${l26f(b[1])}`; segs.push([a, b, cx, cy]);
      }
      D.segs = segs; const cid = 'l26c' + Math.random().toString(36).slice(2, 7);
      let s = `<clipPath id="${cid}"><rect class="l26-clip" x="0" y="0" width="0" height="${H}"/></clipPath>`;
      s += `<path d="M0 ${base}H${D.W}M0 ${base + 3}H${D.W}" class="l26-gnd"/>`;
      s += `<path d="${d}" class="l26-arc"/><path d="${d}" class="l26-arc on" clip-path="url(#${cid})"/>`;
      hp.forEach(h => {
        const x = D.X(h.t), r = (mini ? 4.5 : 9.5) * (h.d === 'D' ? 1 : .85), sp = 3 + h.a * (mini ? 5 : 9);
        s += `<g class="l26-h fut${h.d === 'U' ? ' up' : ''}">${mini ? '' : `<path d="M${l26f(x - 4)} ${base - 2}l${l26f(-sp * .7)} ${l26f(-sp * .6)}M${l26f(x + 4)} ${base - 2}l${l26f(sp * .7)} ${l26f(-sp * .6)}" class="l26-sp"/>`}
          <circle cx="${l26f(x)}" cy="${base}" r="${l26f(r)}"/>${mini ? '' : `<path d="${l26Arrow(x, base - 5, h.d, 10)}" class="l26-ar"/>`}</g>`;
      });
      if (o.marks) s += o.marks(D, hp, base);
      if (!mini) s += l26Labels(tl, D.page, D.X, H - 4) + `<g class="l26-medi" transform="translate(-40 0)">${l26Pick(0, 0, 32, 14, true)}</g>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      const x = pos < 0 ? 0 : D.X(pos), cr = D.el.querySelector('.l26-clip'); if (cr) cr.setAttribute('width', l26f(Math.max(0, x)));
      l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
      const m = D.el.querySelector('.l26-medi'); if (!m || pos < 0) return;
      for (const [a, b, cx, cy] of D.segs) if (x >= a[0] && x < b[0]) {
        const t = (x - a[0]) / (b[0] - a[0]), px = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], py = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * cy + t * t * b[1];
        m.setAttribute('transform', `translate(${l26f(px)} ${l26f(py - 15)})`); break;
      }
    }
  },
  // REBOND + CORDES (demande de Lucas, 26/11 : « mélange les rebonds et les cordes ») : Médi rebondit sur les six
  // cordes ; chaque coup les fait vibrer (le son dessiné le long des cordes) ; rond plein = bas, creux = haut
  mix: {
    html(D) {
      const {tl, o} = D, top = o.marks ? 26 : 0, hmax = 46, gap = 9, base = top + 56, H = base + 5 * gap + 28;
      const hp = l26Page(D); D.hp = hp; D.base = base; D.top = base; D.gap = gap; D.vamp = .6;
      const pts = [[0, base - hmax * .55]].concat(hp.map(h => [D.X(h.t), base]), [[D.W, base - hmax * .5]]), segs = [];
      let d = `M${l26f(pts[0][0])} ${l26f(pts[0][1])}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], hop = Math.min(hmax, (b[0] - a[0]) * 1.1), ty = Math.min(a[1], b[1]) - hop, cx = (a[0] + b[0]) / 2, cy = 2 * ty - (a[1] + b[1]) / 2;
        d += ` Q${l26f(cx)} ${l26f(cy)} ${l26f(b[0])} ${l26f(b[1])}`; segs.push([a, b, cx, cy]);
      }
      D.segs = segs; const cid = 'l26c' + Math.random().toString(36).slice(2, 7);
      let s = `<clipPath id="${cid}"><rect class="l26-clip" x="0" y="0" width="0" height="${H}"/></clipPath>`;
      for (let k = 0; k < 6; k++) s += `<line x1="0" x2="${D.W}" y1="${base + k * gap}" y2="${base + k * gap}" class="l26-str" style="stroke-width:${(.8 + k * .3).toFixed(2)}px"/>`;
      for (let k = 0; k < 6; k++) s += `<path class="l26-vib fut" data-k="${k}" d=""/><path class="l26-vib on" data-k="${k}" d="" style="stroke-width:${(1.1 + k * .3).toFixed(2)}px"/>`;
      s += `<path d="${d}" class="l26-arc"/><path d="${d}" class="l26-arc on" clip-path="url(#${cid})"/>`;
      hp.forEach(h => {
        const x = D.X(h.t), r = h.d === 'D' ? 8.5 : 7.2, sp = 3 + h.a * 8;
        s += `<g class="l26-h fut${h.d === 'U' ? ' up' : ''}"><rect x="${l26f(x - 1)}" y="${base}" width="2" height="${5 * gap}" rx="1" class="l26-trail"/>
          <path d="M${l26f(x - 4)} ${base - 3}l${l26f(-sp * .7)} ${l26f(-sp * .6)}M${l26f(x + 4)} ${base - 3}l${l26f(sp * .7)} ${l26f(-sp * .6)}" class="l26-sp"/>
          <circle cx="${l26f(x)}" cy="${base}" r="${r}"/><path d="${l26Arrow(x, base - 4.5, h.d, 9)}" class="l26-ar"/></g>`;
      });
      if (o.marks) s += o.marks(D, hp, base);
      s += l26Labels(tl, D.page, D.X, H - 4) + `<g class="l26-medi" transform="translate(-40 0)">${l26Pick(0, 0, 32, 14, true)}</g>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    bind(D) { L26_DRAW.cordes.bind(D); },
    frame(D, pos) {
      L26_DRAW.rebond.frame(D, pos);
      const x = pos < 0 ? -4 : D.X(pos), ph = performance.now() / 1000;
      D.el.querySelectorAll('.l26-vib.on').forEach(p => p.setAttribute('d', pos < 0 ? '' : l26VibPath(D, +p.dataset.k, 0, x, ph * 22)));
    }
  },
  // LES CORDES : le son fait vibrer les six cordes ; un médiator par coup (Médi = le coup qu'on entend)
  cordes: {
    html(D) {
      const gap = 13, top = 20, H = top + 5 * gap + 40, hp = l26Page(D); D.hp = hp; D.gap = gap; D.top = top;
      let s = ''; for (let k = 0; k < 6; k++) s += `<line x1="0" x2="${D.W}" y1="${top + k * gap}" y2="${top + k * gap}" class="l26-str" style="stroke-width:${(.8 + k * .3).toFixed(2)}px"/>`;
      for (let k = 0; k < 6; k++) s += `<path class="l26-vib fut" data-k="${k}" d=""/><path class="l26-vib on" data-k="${k}" d="" style="stroke-width:${(1.1 + k * .3).toFixed(2)}px"/>`;
      const mid = top + 2.5 * gap;
      hp.forEach(h => { const x = D.X(h.t); s += `<g class="l26-h fut"><rect x="${l26f(x - 1)}" y="${top - 6}" width="2" height="${5 * gap + 12}" rx="1" class="l26-trail"/>${l26Pick(x, mid, 26 * (h.d === 'D' ? 1 : .8), h.d === 'D' ? 0 : 180, false)}</g>`; });
      s += l26Labels(D.tl, D.page, D.X, H - 4) + `<rect class="l26-ph" x="-4" y="${top - 10}" width="2" height="${5 * gap + 20}" rx="1"/>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    bind(D) {   // le dessin de la page entière en gris (le son à venir)
      const futs = D.el.querySelectorAll('.l26-vib.fut');
      futs.forEach(p => p.setAttribute('d', l26VibPath(D, +p.dataset.k, 0, D.W, 0)));
    },
    frame(D, pos) {
      const x = pos < 0 ? -4 : D.X(pos), ph = performance.now() / 1000;
      const ph2 = D.el.querySelector('.l26-ph'); if (ph2) ph2.setAttribute('x', l26f(x - 1));
      D.el.querySelectorAll('.l26-vib.on').forEach(p => p.setAttribute('d', pos < 0 ? '' : l26VibPath(D, +p.dataset.k, 0, x, ph * 22)));
      const j = pos < 0 ? -1 : l26Cur(D.hp, pos);
      if (j !== D.cur) { l26SetCls(D, '.l26-h', j); D.el.querySelectorAll('.l26-h').forEach((g, i) => { const pk = g.querySelector('g'); if (!pk) return; const has = pk.querySelector('.l26-eye'); if ((i === j) !== !!has) { const h = D.hp[i], x0 = D.X(h.t); pk.outerHTML = l26Pick(x0, D.top + 2.5 * D.gap, 26 * (h.d === 'D' ? 1 : .8), h.d === 'D' ? 0 : 180, i === j); } }); }
    }
  },
  // LA ROSACE : chaque mesure fait le tour de la rosace, comme une horloge ; l'accord au milieu
  rosace: {
    html(D) {
      const {tl} = D, R = 104, cx = D.W / 2, cy = R + 12, H = 2 * R + 26, r0 = R * .4;
      D.R = R; D.cx = cx; D.cy = cy; D.r0 = r0;
      const m = D.bar || 0, b0 = m * tl.bar;
      let s = '';
      for (let j = 0; j < 72; j++) {
        const t = b0 + j / 72 * tl.bar, e = l26Env(tl, t), a = -Math.PI / 2 + j / 72 * 2 * Math.PI, r1 = R * .64, r2 = r1 + Math.max(1.5, e * R * .34);
        s += `<line class="l26-ray" x1="${l26f(cx + r1 * Math.cos(a))}" y1="${l26f(cy + r1 * Math.sin(a))}" x2="${l26f(cx + r2 * Math.cos(a))}" y2="${l26f(cy + r2 * Math.sin(a))}"/>`;
      }
      s += `<circle cx="${cx}" cy="${cy}" r="${l26f(r0 + 10)}" class="l26-ring d"/><circle cx="${cx}" cy="${cy}" r="${l26f(r0 + 5)}" class="l26-ring"/><circle cx="${cx}" cy="${cy}" r="${l26f(r0)}" class="l26-hole"/>`;
      const beats = tl.grid ? tl.bar / tl.grid.spb : 4;
      for (let b = 0; b < beats; b++) { const a = -Math.PI / 2 + (b + .5) / beats * 2 * Math.PI, rr = r0 + 20; s += `<text x="${l26f(cx + rr * Math.cos(a))}" y="${l26f(cy + rr * Math.sin(a) + 4)}" class="l26-lb">${b + 1}</text>`; }
      const ch = tl.chords.length ? tl.chords[m % tl.chords.length] : '';
      if (ch) s += `<text x="${cx}" y="${cy + 8}" class="l26-chd">${esc(ch)}</text>`;
      const hp = D.hp = tl.hits.filter(h => h.t >= b0 - 1e-6 && h.t < b0 + tl.bar - 1e-6);
      hp.forEach(h => {
        const a = -Math.PI / 2 + (h.t - b0) / tl.bar * 2 * Math.PI, rr = R * .57, sz = 10 * (h.d === 'D' ? 1 : .8), px = cx + rr * Math.cos(a), py = cy + rr * Math.sin(a);
        const [ux, uy] = h.d === 'D' ? [-Math.cos(a), -Math.sin(a)] : [Math.cos(a), Math.sin(a)], vx = -uy, vy = ux;
        s += `<path class="l26-h fut" d="M${l26f(px + ux * sz)} ${l26f(py + uy * sz)}L${l26f(px - ux * sz * .6 + vx * sz * .8)} ${l26f(py - uy * sz * .6 + vy * sz * .8)}L${l26f(px - ux * sz * .6 - vx * sz * .8)} ${l26f(py - uy * sz * .6 - vy * sz * .8)}Z"/>`;
      });
      const nb = Math.max(1, Math.round(tl.L / tl.bar));
      s += `<line class="l26-hand" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R - 2}"/>`;
      s += `<text x="${D.W - 6}" y="${H - 6}" class="l26-mes">mesure ${m % nb + 1} sur ${nb}</text>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      const tl = D.tl, bar = pos < 0 ? 0 : Math.floor(pos / tl.bar) % Math.max(1, Math.round(tl.L / tl.bar));
      if (bar !== (D.bar || 0)) { D.bar = bar; D.cur = -2; D.lit = -2; D.el.innerHTML = L26_DRAW.rosace.html(D); }
      const f = pos < 0 ? 0 : (pos - bar * tl.bar) / tl.bar, a = f * 360;
      const hd = D.el.querySelector('.l26-hand'); if (hd) hd.setAttribute('transform', `rotate(${a.toFixed(1)} ${D.cx} ${D.cy})`);
      const rays = D.el.querySelectorAll('.l26-ray'), lit = Math.floor(f * 72);
      if (D.lit !== lit) { D.lit = lit; rays.forEach((r, j) => r.classList.toggle('on', pos >= 0 && j <= lit)); }
      l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
    }
  },
  // L'ARPÈGE SUR LES CORDES : seule la corde jouée vibre ; la basse résonne plus longtemps ; la lettre = le doigt
  arp: {
    html(D) {
      const gap = 18, top = 14, lw = 26, H = top + 5 * gap + 30, hp = l26Page(D); D.hp = hp; D.gap = gap; D.top = top;
      const names = ['mi', 'si', 'sol', 'ré', 'la', 'mi'];
      let s = '';
      for (let r = 0; r < 6; r++) s += `<text x="${lw - 8}" y="${top + r * gap + 3}" class="l26-sn">${names[r]}</text><line x1="${lw}" x2="${D.W}" y1="${top + r * gap}" y2="${top + r * gap}" class="l26-str" style="stroke-width:${(.8 + r * .3).toFixed(2)}px"/><path class="l26-vib on" data-r="${r}" d="" style="stroke-width:${(1.2 + r * .25).toFixed(2)}px"/>`;
      const bx = D.X(D.page * D.tl.win + D.tl.bar); if (D.tl.win > D.tl.bar) s += `<line x1="${l26f(bx - 6)}" x2="${l26f(bx - 6)}" y1="${top - 6}" y2="${top + 5 * gap + 6}" class="l26-sep"/>`;
      hp.forEach(h => { const x = D.X(h.t), y = top + (5 - h.s) * gap; s += `<g class="l26-h fut${h.bs ? ' bs' : ''}"><circle cx="${l26f(x)}" cy="${y}" r="8.5"/><text x="${l26f(x)}" y="${y + 4}" class="l26-fg">${h.f}</text></g>`; });
      s += l26Labels(D.tl, D.page, D.X, H - 4) + `<rect class="l26-ph" x="-4" y="${top - 8}" width="2" height="${5 * gap + 16}" rx="1"/>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      const x = pos < 0 ? -4 : D.X(pos), now = performance.now() / 1000 * 20;
      const ph = D.el.querySelector('.l26-ph'); if (ph) ph.setAttribute('x', l26f(x - 1));
      D.el.querySelectorAll('.l26-vib.on').forEach(p => {
        const r = +p.dataset.r, si = 5 - r, own = D.hp.filter(h => h.s === si), y0 = D.top + r * D.gap; let d = '';
        if (pos >= 0) own.forEach((h, i) => {
          if (h.t > pos) return;
          const x0 = D.X(h.t), nx = own[i + 1] && own[i + 1].t <= pos ? D.X(own[i + 1].t) : x, tau = (D.tl.beat) * (h.bs ? 4 : 1.6) / D.tl.win * (D.W - 24);
          let seg = ''; for (let xx = x0; xx <= Math.min(nx, x); xx += 2) { const amp = h.a * Math.exp(-(xx - x0) / tau) * D.gap * .38; if (amp < .3 && xx > x0 + 4) break; seg += `${seg ? 'L' : 'M'}${l26f(xx)} ${l26f(y0 + amp * Math.sin((xx - x0) * .55 - now))}`; }
          d += seg;
        });
        p.setAttribute('d', d);
      });
      l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
    }
  }
};
function l26VibPath(D, k, x0, x1, ph) {   // corde k (0 = mi aigu) : le son dessiné le long de la corde
  const y0 = D.top + k * D.gap; let d = '';
  for (let x = x0; x <= x1; x += 3) { const t = D.page * D.tl.win + (x - 12) / (D.W - 24) * D.tl.win, a = l26Env(D.tl, t) * D.gap * (D.vamp || .42); d += `${d ? 'L' : 'M'}${l26f(x)} ${l26f(y0 + a * Math.sin(x * (.32 + k * .05) + k + ph))}`; }
  return d;
}

/* ── la lecture : un rythme de l'app (moteur unique) ou ta prise (le fichier en boucle) ── */
function l26Halt() { cancelAnimationFrame(L26.raf); L26.raf = 0; if (L26.live) L26.live.frame(-1); l26SyncBtns(); if (typeof fbSync === 'function') fbSync(); }
function l26Stop() {
  L26.tok = (L26.tok || 0) + 1;   // une prise encore en chargement ne repartira pas après cet arrêt
  if (L26.a) { try { L26.a.stop(); L26.a.disconnect(); } catch (e) {} L26.a = null; }
  if (typeof fbBandStop === 'function') fbBandStop();
  if (L26.onPos) { const f = L26.onPos; L26.onPos = null; f(-1); }
  if (rhPlaying('l26')) rhStop();
  if (L26.tl) L26.tl.now = null;
  l26Halt();
}
function l26Loop() {
  cancelAnimationFrame(L26.raf);
  const f = () => { const tl = L26.tl; if (!tl || !tl.now) { L26.raf = 0; return; } const p = tl.now(); if (p != null && L26.live) L26.live.frame(p); if (p != null && L26.onPos) L26.onPos(p); L26.raf = requestAnimationFrame(f); };
  L26.raf = requestAnimationFrame(f); l26SyncBtns();
}
const l26Playing = () => !!(L26.tl && L26.tl.now);
function l26PlayRh(rh, bpm, chords, opt) {   // un rythme joué par l'app ; opt.cellFn pour un arpège ou un effet, opt.capo, opt.band
  l26Stop(); stopPlay();
  const tl = L26.tl, spd = () => rhCellDur(rh, (rhP && rhP.bpm) || bpm), chs = chords.map(c => typeof c === 'string' ? newChord(c) : c);
  let t0 = null;
  rhStart(rh, bpm, chs[0], (opt && opt.capo) || 0, (i, k) => {
    if (i == null) { if (L26.tl === tl) { tl.now = null; l26Halt(); } return; }
    t0 = performance.now() / 1000 - (k % tl.L) * spd();
  }, Object.assign({key: 'l26', chords: chs}, opt || {}));
  // opt.from (la reprise après une pause) : avant le 1er coup entendu, Médi part de l'endroit de la pause au lieu de disparaître
  const from = opt && opt.from != null ? opt.from : null, k0 = (opt && opt.k0) || 0;
  let t0e = null;
  if (from != null) { const ac = audio(); t0e = performance.now() / 1000 + .08 + (ac.outputLatency || 0) + (ac.baseLatency || 0) - k0 * spd(); }
  tl.now = () => {
    if (t0 != null) return (((performance.now() / 1000 - t0) / spd()) % tl.L + tl.L) % tl.L;
    if (t0e == null) return null;
    return k0 + .5 < from ? from : Math.max(from, (performance.now() / 1000 - t0e) / spd());
  };
  l26Loop();
}
async function l26PlayTake(p, opt) {   // ta prise, en boucle comme sur la fiche ; opt.band : la bande joue avec
  l26Stop(); stopPlay();
  const tok = L26.tok, buf = await recBuffer(p.rec.mediaId); if (!buf) { toast('Enregistrement introuvable', true); return; }
  const ac = audio(); if (ac.state === 'suspended') await ac.resume();
  if (tok !== L26.tok) return;
  if (opt && opt.band) {   // posée à un instant précis pour que la bande tombe avec tes coups (comme la fiche bêta)
    const tl = L26.tl, st = p.rec.start, en = Math.min(p.rec.end, buf.duration), Tb = ac.currentTime + .15, lat = (ac.outputLatency || 0) + (ac.baseLatency || 0);
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = st; src.loopEnd = en; src.connect(OUT(ac)); src.start(Tb, st);
    L26.a = src; tl.now = () => { const x = ac.currentTime - lat - Tb; return x < 0 ? 0 : x % tl.L; };
    fbTakeBand(tl, Tb, p.chords || [], opt.capo || 0); l26Loop(); return;
  }
  const tl = L26.tl, src = recLoopSrc(buf, p.rec.start, Math.min(p.rec.end, buf.duration)), t0 = ac.currentTime + (ac.outputLatency || 0) + (ac.baseLatency || 0);
  L26.a = src;
  tl.now = () => ((ac.currentTime - t0) % tl.L + tl.L) % tl.L;
  l26Loop();
}
function l26SyncBtns() {
  const on = l26Playing();
  document.querySelectorAll('#v-labo .l26-play').forEach(b => { b.classList.toggle('on', on); b.innerHTML = on ? L26_PAUSE : LAB_PLAY; b.setAttribute('aria-label', on ? 'Pause' : 'Écouter'); });
}
const L26_PAUSE = '<svg viewBox="0 0 14 16" aria-hidden="true"><rect x="2" y="1.5" width="3.6" height="13" rx="1"/><rect x="8.4" y="1.5" width="3.6" height="13" rx="1"/></svg>';

/* ── les prises de l'utilisateur ── */
function l26Takes() {
  const out = [];
  sheets.forEach(s => (s.parts || []).forEach((p, i) => { if (p.rec) out.push({s, p, i, id: s.id + ':' + i}); }));
  return out;
}
async function l26TakeTl(T) {
  if (L26.mini[T.id] !== undefined) return L26.mini[T.id];
  const buf = await recBuffer(T.p.rec.mediaId);
  const tl = buf ? l26FromTake(buf, T.p.rec.start, Math.min(T.p.rec.end, buf.duration), T.s.bpm, (T.p.chords || []).map(c => c.name)) : null;
  return (L26.mini[T.id] = tl);
}

/* ═══ Test 1 : le son de ta prise ═══ */
const L26_STYLES = [['mix', 'Mélange'], ['rebond', 'Rebond'], ['cordes', 'Cordes'], ['rosace', 'Rosace']];
const L26_SAY = {mix: 'Je rebondis sur tes cordes, et chaque coup les fait vibrer. Rond plein = bas, creux = haut.', rebond: 'Je rebondis sur chacun de tes coups : rond plein = bas, creux = haut.', cordes: 'Ton son fait vibrer les cordes. Le médiator qui a des yeux, c’est le coup qu’on entend.', rosace: 'Un tour de rosace = une mesure. Les triangles vers le centre sont des bas.'};
const L26_DEMO = {pat: 'D-DU-UDU', bpm: 88, chords: ['Em', 'G']};
function l26SonHTML() {
  const takes = l26Takes();
  if (L26.src == null) L26.src = takes.length ? takes[0].id : 'demo';
  const T = takes.find(t => t.id === L26.src), name = T ? `${esc(T.s.title)} · ${esc(T.p.name || 'Partie')}` : 'Feu de camp · joué par l’app';
  const chords = T ? (T.p.chords || []).map(c => esc(c.name)).join(' ') : L26_DEMO.chords.join(' ');
  return `${mediBulle('contente', `<span id="l26-say">${L26_SAY[L26.style]}</span>`, {size: 46, cls: 'lab-medi-b'})}
    <label class="lab-sel">Le son <select onchange="l26Src(this.value)">${takes.map(t => `<option value="${t.id}" ${t.id === L26.src ? 'selected' : ''}>Ta prise : ${esc(t.s.title)} · ${esc(t.p.name || 'Partie')}</option>`).join('')}<option value="demo" ${L26.src === 'demo' ? 'selected' : ''}>Un rythme joué par l’app</option></select></label>
    ${takes.length ? '' : '<p class="lab-p">Tu n’as pas encore de prise enregistrée : enregistre ton rythme sur une fiche pour essayer avec ta vraie prise.</p>'}
    ${l26ChipsHTML(L26_RH_STYLES, L26.style, 'l26Style')}
    <div class="l26-sub" id="l26-coups"${L26.style === 'saute' ? '' : ' hidden'}>
      <button type="button" class="fb-band l26-bandb${FB.band ? ' on' : ''}" onclick="l26Band()" aria-pressed="${FB.band}">${BAND_MINI()}<span>Avec la bande</span></button>
      <small>Les cordes qui vibrent</small>${l26ChipsHTML(L26_CVIB, L26.cvib, 'l26CvibSet').replace('l26-chips', 'l26-chips l26-vchips')}
      <small>Les coups</small>${l26ChipsHTML(L26_COUPS, L26.coups, 'l26Coups').replace('l26-chips', 'l26-chips l26-mchips')}</div>
    <section class="l26-card"><div class="l26-ch"><small>${name}</small><b>${chords}</b></div>
      <div class="l26-draw" id="l26-draw"><p class="lab-p">Je prépare le dessin…</p></div>
      <div class="l26-ctl"><button type="button" class="l26-play" onclick="l26SonPlay()" aria-label="Écouter">${LAB_PLAY}</button><span id="l26-info"></span><button type="button" class="btn btn-ghost btn-sm" onclick="l26Next()">Dessin suivant</button></div>
    </section>`;
}
async function l26SonMount() {
  const el = $('l26-draw'); if (!el) return;
  const takes = l26Takes(), T = takes.find(t => t.id === L26.src);
  let tl;
  if (T) { tl = await l26TakeTl(T); if (!tl) { el.innerHTML = '<p class="lab-p">Je n’entends pas assez de coups dans cette prise. Choisis-en une autre, ou le rythme de l’app.</p>'; return; } tl = Object.assign({}, tl, {now: null}); }
  else tl = l26FromRh(rhFromPat(L26_DEMO.pat, '4/4', 8, 1), L26_DEMO.chords);
  if (!$('l26-draw')) return;
  L26.tl = tl; L26.take = T || null;
  L26.live = l26Mount($('l26-draw'), L26.style, tl);
  const inf = $('l26-info'); if (inf) inf.textContent = T ? `ta prise · ${l26Time(tl.L)} · ${tl.hits.length} coups entendus` : `${L26_DEMO.bpm} BPM`;
}
function l26SonPlay() {
  if (l26Playing()) { l26Stop(); return; }
  if (!L26.tl) return;
  const band = L26.style === 'saute' && FB.band, rh = rhFromPat(L26_DEMO.pat, '4/4', 8, 1);   // la bande seulement avec « Cordes + Médi saute »
  if (L26.take) l26PlayTake(L26.take.p, band ? {band: true, capo: L26.take.s.capo || 0} : null); else l26PlayRh(rh, L26_DEMO.bpm, L26_DEMO.chords, band ? {band: grBandOwn(rh)} : null);
}
function l26Src(v) { l26Stop(); L26.src = v; labRender(); }
function l26Style(k) {
  const was = l26Playing(); L26.style = k;
  l26ChipsOn(k); const cr = $('l26-coups'); if (cr) cr.hidden = k !== 'saute';
  const say = $('l26-say'); if (say) say.textContent = L26_SAY[k] || L26_VSAY[k] || '';
  if (L26.tl && $('l26-draw')) { L26.live = l26Mount($('l26-draw'), k, L26.tl); if (was) l26Loop(); }
}
function l26Next() { const i = L26_RH_STYLES.findIndex(s => s[0] === L26.style); l26Style(L26_RH_STYLES[(i + 1) % L26_RH_STYLES.length][0]); }

/* ═══ Test 2 : l'arpège sur les cordes ═══ */
const L26_ARP = {steps: [['B'], ['3'], ['2'], ['3'], ['1'], ['3'], ['2'], ['3']], bass: 'auto'};
const L26_FING = {B: 'p', '3': 'i', '2': 'm', '1': 'a'};
function l26ArpSrc() {   // l'arpège d'une de tes fiches s'il y en a un, sinon pouce puis i m i a i m i sur Em7 et G
  for (const s of sheets) for (const p of (s.parts || [])) if (pWay(p) === 'arp' && p.arp && p.chords.length) return {a: p.arp, chords: p.chords.slice(0, 4).map(c => c.name), name: `${s.title} · ${p.name || 'Partie'}`, bpm: s.bpm || 80, capo: s.capo || 0};
  return {a: L26_ARP, chords: ['Em7', 'G'], name: 'Arpège « pouce, puis les aigus »', bpm: 76, capo: 0};
}
function l26ArpTl(A) {
  const hits = [];
  A.chords.forEach((cn, b) => { const ch = newChord(cn); for (let i = 0; i < 8; i++) arpStepNotes(A.a.steps[i], ch, A.a.bass).forEach(o => {
    const role = o.bs ? 'B' : ({3: '3', 4: '2', 5: '1'})[o.si];
    hits.push({t: b * 8 + i, s: o.si, bs: o.bs, f: L26_FING[role] || '·', a: o.bs ? .95 : .62});
  }); });
  hits.sort((x, y) => x.t - y.t);
  return {hits, L: A.chords.length * 8, bar: 8, beat: 2, grid: {per: 8, spb: 2, mes: '4/4'}, chords: A.chords, win: Math.min(A.chords.length * 8, 16), unit: 'case'};
}
function l26ArpHTML() {
  const A = l26ArpSrc();
  const k = L26.arpStyle || 'accord';
  return `${mediBulle('contente', `<span id="l26-say">${L26_VSAY[k]}</span>`, {size: 46, cls: 'lab-medi-b'})}
    ${l26ChipsHTML(L26_ARP_STYLES, k, 'l26ArpStyle')}
    <section class="l26-card"><div class="l26-ch"><small>${esc(A.name)}</small><b>${A.chords.map(esc).join(' ')}</b></div>
      <div class="l26-draw" id="l26-draw"></div>
      <div class="l26-ctl"><button type="button" class="l26-play" onclick="l26ArpPlay()" aria-label="Écouter">${LAB_PLAY}</button><span id="l26-leg">${l26ArpLeg(k)}</span></div>
    </section>`;
}
function l26ArpMount() { const A = l26ArpSrc(); L26.tl = l26ArpTl(A); L26.arpA = A; L26.live = l26Mount($('l26-draw'), L26.arpStyle || 'accord', L26.tl); }
function l26ArpStyle(k) {
  const was = l26Playing(); L26.arpStyle = k; l26ChipsOn(k);
  const lg = $('l26-leg'); if (lg) lg.textContent = l26ArpLeg(k);
  const say = $('l26-say'); if (say) say.textContent = L26_VSAY[k] || '';
  if (L26.tl && $('l26-draw')) { L26.live = l26Mount($('l26-draw'), k, L26.tl); if (was) l26Loop(); }
}
function l26ArpPlay() {
  if (l26Playing()) { l26Stop(); return; }
  const A = L26.arpA; l26PlayRh(arpRh(), A.bpm, A.chords, {cellFn: arpCellFn(A.a, A.capo)});
}

/* ═══ Test 3 : les effets sur le rebond ═══ */
const L26_FXR = {pat: 'D-DU-UDU', bpm: 84, chords: ['A', 'D']};
const L26_FX = {
  pm: {t: 'Palm mute', d: 'Pose la tranche de ta main droite sur les cordes, tout près du chevalet. Le son devient sourd et serré.', ou: 'sur les temps 1 et 2'},
  h: {t: 'Hammer : Asus2 → A', d: 'Gratte l’accord avec la corde de si à vide (Asus2), puis fais tomber ton doigt sur la case 2 : l’accord s’ouvre en La.', ou: 'sur le dernier coup de la mesure'}
};
function l26FxMarks(D, hp, base) {   // l'accolade PM au-dessus des coups des temps 1 et 2, le « h » sur le dernier coup de la 1re mesure
  const inPm = hp.filter(h => h.k != null && h.k % 16 < 4), hh = hp.find(h => h.k != null && h.k % 16 === 7);
  let s = '';
  if (inPm.length) {
    const x0 = D.X(inPm[0].t) - 12, x1 = D.X(inPm[inPm.length - 1].t) + 12, xm = (x0 + x1) / 2;
    s += `<g class="l26-mk${L26.fx === 'pm' ? ' on' : ''}" onclick="l26FxOpen('pm')"><path d="M${l26f(x0)} 22V10H${l26f(x1)}V22" class="l26-pm"/><rect x="${l26f(xm - 16)}" y="1" width="32" height="17" rx="8.5" class="l26-pmb"/><text x="${l26f(xm)}" y="14" class="l26-pmt">PM</text></g>`;
  }
  if (hh) { const x = D.X(hh.t); s += `<g class="l26-mk${L26.fx === 'h' ? ' on' : ''}" onclick="l26FxOpen('h')"><circle cx="${l26f(x)}" cy="${base - 24}" r="10" class="l26-hb"/><text x="${l26f(x)}" y="${base - 20}" class="l26-ht">h</text></g>`; }
  return s;
}
function l26FxHTML() {
  const F = L26.fx && L26_FX[L26.fx];
  return `${mediBulle('contente', 'Touche une marque : je te la joue et je t’explique le geste.', {size: 46, cls: 'lab-medi-b'})}
    <section class="l26-card"><div class="l26-ch"><small>Couplet · joué par l’app</small><b>${L26_FXR.chords.join(' ')}</b></div>
      <div class="l26-draw" id="l26-draw"></div>
      <div class="l26-ctl"><button type="button" class="l26-play" onclick="l26FxPlay('both')" aria-label="Écouter">${LAB_PLAY}</button><span>${L26_FXR.bpm} BPM</span></div>
      <div class="l26-leg">${Object.entries(L26_FX).map(([k, f]) => `<button type="button" onclick="l26FxOpen('${k}')"><b class="${k}">${k === 'pm' ? 'PM' : 'h'}</b><span>${f.t} ${f.ou}</span><i aria-hidden="true">›</i></button>`).join('')}</div>
    </section>
    ${F ? `<div class="l26-sheet" role="dialog" aria-label="${F.t}"><div class="l26-sh-h"><b>${F.t}</b><button type="button" class="l26-x" onclick="l26FxOpen(null)" aria-label="Fermer">×</button></div>
      <p>${F.d}</p>
      <div class="l26-sh-b"><button type="button" class="btn btn-primary" onclick="l26FxPlay('${L26.fx}')">${LAB_PLAY}Écouter</button><button type="button" class="btn btn-ghost" onclick="l26FxPlay('${L26.fx}-ab')">Avec et sans</button></div>
      <button type="button" class="l26-mur" onclick="l26Stop();go('blocs');blocOpen('b6')">${mediSVG('contente', {size: 30, anim: 'still'})}<span><b>Apprendre le geste</b><small>Mur « Embellir » · la vidéo</small></span><i aria-hidden="true">›</i></button>
      <p class="l26-ab" id="l26-ab"></p></div>` : ''}`;
}
function l26FxMount() {
  L26.tl = l26FromRh(rhFromPat(L26_FXR.pat, '4/4', 8, 1), L26_FXR.chords);
  L26.live = l26Mount($('l26-draw'), 'mix', L26.tl, {marks: l26FxMarks});
}
function l26FxOpen(k) { l26Stop(); L26.fx = k; labRender(); if (k) setTimeout(() => { const s = document.querySelector('#v-labo .l26-sheet'); if (s) s.scrollIntoView({block: 'nearest', behavior: 'smooth'}); }, 50); }
function l26FxPlay(mode) {   // 'both' : les deux effets ; 'pm' / 'h' : l'un ; '…-ab' : un tour avec, un tour sans
  if (l26Playing()) { l26Stop(); const ab = $('l26-ab'); if (ab) ab.textContent = ''; return; }
  const rh = rhFromPat(L26_FXR.pat, '4/4', 8, 1), ab = mode.endsWith('-ab'), k0 = mode.replace('-ab', ''), dur = rhCellDur(rh, L26_FXR.bpm);
  const pm = k0 === 'pm' || k0 === 'both', hm = k0 === 'h' || k0 === 'both';
  l26PlayRh(rh, L26_FXR.bpm, L26_FXR.chords, {cellFn: (c, t, ch, i, k) => {
    const with_ = !ab || Math.floor(k / 16) % 2 === 0, j = k % 16;
    if (ab && j === 0) { const el = $('l26-ab'); if (el) el.textContent = with_ ? 'Ce tour : avec' : 'Ce tour : sans'; }
    if (hm && with_ && j === 7) { pluck(fretFreq(4, 0, 0), t, .5, .15); pluck(fretFreq(4, 2, 0), t + dur * .5, .7, .13); return; }
    rhPlayCell(c, t, ch, 0, pm && with_ && j < 4, false);
  }});
}

/* ═══ Test 4 : la banque de rythmes ═══ */
const L26_BANK = ['feucamp', 'ballade', 'rock8', 'valse', 'reggae', 'chuck', 'popsync', 'douce'];
function l26BankRows() {
  const known = L26_BANK.map(id => RHYTHMS.find(r => r.id === id)).filter(Boolean).map(r => ({id: 'r:' + r.id, n: r.n.replace(/\s*\(.*\)/, ''), sub: `${r.mes} · ${Math.round((r.bpm[0] + r.bpm[1]) / 2)} BPM`, r}));
  const mine = l26Takes().slice(0, 4).map(T => ({id: 't:' + T.id, n: T.s.title, sub: `ta prise · ${T.p.name || 'Partie'}`, T}));
  return {known, mine};
}
function l26MiniSVG(tl) {   // le rebond en tout petit : la ligne d'une rangée
  const W = 80, hs = tl.hits.filter(h => h.t < Math.min(tl.L, tl.bar)), X = t => 4 + t / Math.min(tl.L, tl.bar) * (W - 8);
  let s = '', px = 0, py = 9;
  hs.forEach(h => { const x = X(h.t), hop = Math.min(10, (x - px) * .9); s += `<path d="M${l26f(px)} ${py}Q${l26f((px + x) / 2)} ${l26f(15 - hop * 2)} ${l26f(x)} 15" class="l26-marc"/>`; px = x; py = 15; });
  hs.forEach(h => { s += `<circle cx="${l26f(X(h.t))}" cy="15" r="${h.d === 'D' ? 2.6 : 2.1}" class="l26-mdot${h.d === 'U' ? ' up' : ''}"/>`; });
  return `<svg class="l26-mini" viewBox="0 0 ${W} 18" aria-hidden="true">${s}</svg>`;
}
// un rythme de la liste : 1 mesure (la ligne) ; 2 accords = 2 mesures (le lecteur)
function l26RhTl(r, chords) { return l26FromRh(rhFromPat(r.pat, r.mes, r.res, 1), chords || null); }
function l26BankHTML() {
  const {known, mine} = l26BankRows(), B = L26.bank || {};
  const row = x => `<button type="button" class="l26-row${B.id === x.id ? ' on' : ''}" onclick="l26BankPick('${x.id}')"><span class="l26-rp">${B.id === x.id && l26Playing() ? L26_PAUSE : LAB_PLAY}</span><span class="l26-rt"><b>${esc(x.n)}</b><small>${esc(x.sub)}</small></span><span class="l26-rm" id="l26m-${x.id.replace(/[^a-z0-9]/gi, '_')}">${x.r ? l26MiniSVG(l26RhTl(x.r)) : ''}</span></button>`;
  const sel = known.concat(mine).find(x => x.id === B.id);
  return `<div class="l26-bank">
    <div class="l26-sec">Les plus connus</div><div class="l26-rows">${known.map(row).join('')}</div>
    <div class="l26-sec">Les tiens</div>${mine.length ? `<div class="l26-rows">${mine.map(row).join('')}</div>` : '<p class="lab-p">Tes prises enregistrées sur tes fiches apparaîtront ici.</p>'}
    <div class="l26-sec mute">Partagés par d’autres guitaristes · plus tard, avec les comptes</div>
    ${sel ? `<div class="l26-dock"><div class="l26-dh"><button type="button" class="l26-play" onclick="l26BankPick('${sel.id}')" aria-label="Écouter">${LAB_PLAY}</button><span class="l26-rt"><b>${esc(sel.n)}</b><small>${esc(sel.sub)}</small></span>
      ${sel.r ? `<span class="l26-bpm"><button type="button" onclick="l26BankBpm(-4)" aria-label="Moins vite">−</button><b id="l26-bpm">${B.bpm}</b><button type="button" onclick="l26BankBpm(4)" aria-label="Plus vite">+</button></span>` : ''}</div>
      <div class="l26-draw" id="l26-draw"></div>
      <button type="button" class="btn btn-primary l26-take" onclick="toast('Dans l’app, ce rythme irait dans ta fiche.')">Prendre ce rythme</button></div>` : ''}
  </div>`;
}
async function l26BankMount() {
  const {mine} = l26BankRows();
  for (const x of mine) { const tl = await l26TakeTl(x.T), el = $('l26m-' + x.id.replace(/[^a-z0-9]/gi, '_')); if (el && tl) el.innerHTML = l26MiniSVG(tl); }
  const B = L26.bank; if (!B || !$('l26-draw')) return;
  const x = l26BankRows().known.concat(mine).find(y => y.id === B.id); if (!x) return;
  const tl = x.r ? l26RhTl(x.r, ['G', 'C']) : await l26TakeTl(x.T); if (!tl || !$('l26-draw')) return;
  L26.tl = Object.assign({}, tl, {now: null}); L26.live = l26Mount($('l26-draw'), 'mix', L26.tl);
  if (B.play) { B.play = false; l26BankStart(x); }
}
function l26BankStart(x) {
  if (x.r) l26PlayRh(rhFromPat(x.r.pat, x.r.mes, x.r.res, 1), L26.bank.bpm, ['G', 'C']); else l26PlayTake(x.T.p);
  l26BankSyncRows();
}
function l26BankSyncRows() {
  const on = l26Playing(), id = L26.bank && L26.bank.id;
  document.querySelectorAll('#v-labo .l26-row').forEach(b => { const me = b.getAttribute('onclick').includes(`'${id}'`); b.classList.toggle('on', me); const rp = b.querySelector('.l26-rp'); if (rp) rp.innerHTML = me && on ? L26_PAUSE : LAB_PLAY; });
}
function l26BankPick(id) {
  const B = L26.bank;
  if (B && B.id === id) { if (l26Playing()) l26Stop(); else { const x = l26BankRows().known.concat(l26BankRows().mine).find(y => y.id === id); if (x) l26BankStart(x); } l26BankSyncRows(); return; }
  l26Stop();
  const r = id.startsWith('r:') ? RHYTHMS.find(y => 'r:' + y.id === id) : null;
  L26.bank = {id, bpm: r ? Math.round((r.bpm[0] + r.bpm[1]) / 2) : 0, play: true};
  labRender();
}
function l26BankBpm(d) {
  const B = L26.bank; if (!B) return;
  B.bpm = Math.max(40, Math.min(200, B.bpm + d)); const e = $('l26-bpm'); if (e) e.textContent = B.bpm;
  if (rhPlaying('l26')) rhSetBpm(B.bpm);
}

/* ── branché sur le Labo (39-8) ── */
function l26TestHTML(id) {
  return {'l26-son': l26SonHTML, 'l26-arp': l26ArpHTML, 'l26-fx': l26FxHTML, 'l26-banque': l26BankHTML}[id]();
}
function l26After(id) {
  ({'l26-son': l26SonMount, 'l26-arp': l26ArpMount, 'l26-fx': l26FxMount, 'l26-banque': l26BankMount})[id]();
}
function l26HomeHTML() {
  const A = labAns(), n = LAB_TESTS26.filter(t => A[t.id]).length;
  return `<div class="rp-top"><button type="button" class="mt-back" onclick="labGo('home')" aria-label="Retour à S’entraîner">${RP_BACK}</button><div><small>Labo</small><h1>Les tests du 26/11</h1></div></div>
    ${mediBulle('curieuse', 'Tes choix sur maquette, en vrai. Essaie-les en jouant, puis dis ce que tu en penses.', {size: 56, cls: 'lab-medi-b'})}
    <div class="lab-list">${LAB_TESTS26.map((t, k) => `<button type="button" class="lab-card${A[t.id] ? ' done' : ''}" onclick="labGo('${t.id}')"><span class="lab-n">${A[t.id] ? '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1.5 5 L4.5 8 L10.5 2"/></svg>' : k + 1}</span><span class="lab-ct"><b>${t.t}</b><small>${t.d}</small></span></button>`).join('')}</div>
    <div class="lab-foot"><span>${n} test${n > 1 ? 's' : ''} sur ${LAB_TESTS26.length} faits</span>
      <button type="button" class="btn btn-primary" onclick="labExport()" ${n ? '' : 'disabled'}>Envoyer mes réponses</button></div>`;
}

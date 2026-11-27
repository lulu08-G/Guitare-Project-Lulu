/* ═══════ LABO : LES VARIANTES (26/11, Lucas : « pour le rythme on est pas mal mais pas encore bon »,
   « pour l'arpège ajoute des variantes ») ═══════
   D'autres dessins, branchés sur la même mécanique que le Labo (l26Mount, L26_DRAW) : à choisir dans le test
   « Le son de ta prise », le test de l'arpège et la fiche bêta.
   Rythme : gratte (Médi traverse les cordes, en pointillé quand la main passe sans toucher), bashaut (les bas sur les
   cordes graves, les hauts sur les aiguës : seules les cordes touchées vibrent), respire (les cordes s'écartent avec le son).
   Arpège : apince (Médi saute de corde en corde), chemin (le tracé de l'arpège), tombe (les notes tombent sur les cordes),
   accord (sur le doigté de l'accord, la corde jouée s'allume). */
const l26Arcs = (pts, hmax, k) => {   // des sauts d'un point à l'autre : le chemin et ses morceaux (pour placer Médi)
  let d = `M${l26f(pts[0][0])} ${l26f(pts[0][1])}`; const segs = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], hop = Math.min(hmax, (b[0] - a[0]) * (k || 1.1)), ty = Math.min(a[1], b[1]) - hop, cx = (a[0] + b[0]) / 2, cy = 2 * ty - (a[1] + b[1]) / 2;
    d += ` Q${l26f(cx)} ${l26f(cy)} ${l26f(b[0])} ${l26f(b[1])}`; segs.push([a, b, cx, cy]);
  }
  return {d, segs};
};
const l26ClipDef = H => { const id = 'l26c' + Math.random().toString(36).slice(2, 7); return {id, html: `<clipPath id="${id}"><rect class="l26-clip" x="0" y="0" width="0" height="${H}"/></clipPath>`}; };
const l26MediG = () => `<g class="l26-medi" transform="translate(-40 0)">${l26Pick(0, 0, 32, 14, true)}</g>`;
function l26StringsHTML(D, top, gap, names) {
  let s = '';
  for (let k = 0; k < 6; k++) {
    if (names) s += `<text x="${8}" y="${top + k * gap + 3}" class="l26-sn" style="text-anchor:start">${['mi', 'si', 'sol', 'ré', 'la', 'mi'][k]}</text>`;
    s += `<line x1="${names ? 22 : 0}" x2="${D.W}" y1="${top + k * gap}" y2="${top + k * gap}" class="l26-str" style="stroke-width:${(.8 + k * .3).toFixed(2)}px"/>`;
  }
  return s;
}
// une corde qui vibre avec seulement les coups qui la touchent (bas en bas, haut en haut)
function l26VibSub(D, k, x0, x1, ph, hits, on) {
  const y0 = D.top + k * D.gap, tau = D.tl.beat * .45 * (1 + k * .18); let d = '';
  for (let x = x0; x <= x1; x += 3) {
    const t = D.page * D.tl.win + (x - 12) / (D.W - 24) * D.tl.win; let e = 0;
    for (const h of hits) { if (h.t > t) break; e = Math.max(e, h.a * Math.exp(-(t - h.t) / tau)); }
    const a = Math.min(1, e) * D.gap * .55;
    d += `${d ? 'L' : 'M'}${l26f(x)} ${l26f(y0 + a * Math.sin(x * (.32 + k * .05) + k + (on ? ph : 0)))}`;
  }
  return d;
}

/* la façon de noter les doigts de l'arpège : 4 notations comparées dans le Labo (P 1 2 3, p i m a, points, cordes) ;
   Lucas a tranché le 26/11 : « garder de 1 à 6 » = la corde à pincer (6 = Mi grave … 1 = Mi aigu). Les autres
   restent dans l26Mark au cas où. */
const L26_NOTA_LEG = {chiffres: 'P pouce · 1 index · 2 majeur · 3 annulaire', lettres: 'p pouce · i index · m majeur · a annulaire',
  points: '● pouce · • index · •• majeur · ••• annulaire', cordes: 'La corde à pincer : 6 = Mi grave … 1 = Mi aigu'};
L26.nota = 'cordes';   // tranché par Lucas dans le Labo (26/11) : « garder de 1 à 6 » (6 = Mi grave … 1 = Mi aigu)
function l26Mark(n, x, y, cls) {   // le doigt (ou la corde) d'une note, centré sur x, y
  const md = L26.nota, i = {p: 0, i: 1, m: 2, a: 3}[n.f];
  if (md === 'points') {
    if (i == null) return '';
    if (i === 0) return `<circle cx="${x}" cy="${y}" r="6.5" class="${cls} d"/>`;
    let s = ''; for (let k = 0; k < i; k++) s += `<circle cx="${l26f(+x + (k - (i - 1) / 2) * 7.5)}" cy="${y}" r="2.9" class="${cls} d"/>`;
    return s;
  }
  const t = md === 'cordes' ? 6 - n.s : i == null ? '·' : (md === 'lettres' ? 'pima' : 'P123')[i];
  return `<text x="${x}" y="${l26f(+y + 5.5)}" class="${cls}">${t}</text>`;
}

Object.assign(L26_DRAW, {
  /* ── RYTHME : MÉDI GRATTE ── il traverse les six cordes à chaque coup (vers le bas ou vers le haut) ;
     entre deux coups, sa main passe en l'air (pointillé) */
  gratte: {
    html(D) {
      const top = 30, gap = 10, bot = top + 5 * gap, up = top - 16, dn = bot + 16, H = dn + 30, w = 7;
      const hp = l26Page(D); D.hp = hp; D.top = top; D.gap = gap; D.vamp = .5;
      const P = [[0, up]];
      hp.forEach(h => { const x = D.X(h.t); if (h.d === 'D') P.push([x - w, up], [x + w, dn]); else P.push([x - w, dn], [x + w, up]); });
      P.push([D.W, P[P.length - 1][1]]); D.mp = P;
      const C = l26ClipDef(H);
      let s = C.html + l26StringsHTML(D, top, gap);
      for (let k = 0; k < 6; k++) s += `<path class="l26-vib fut" data-k="${k}" d=""/><path class="l26-vib on" data-k="${k}" d="" style="stroke-width:${(1.1 + k * .3).toFixed(2)}px"/>`;
      let air = '';   // la main en l'air : du départ au 1er coup, puis d'un coup au suivant
      for (let i = 0; i + 1 < P.length; i += 2) air += `M${l26f(P[i][0])} ${l26f(P[i][1])}L${l26f(P[i + 1][0])} ${l26f(P[i + 1][1])}`;
      s += `<path d="${air}" class="l26-air"/><path d="${air}" class="l26-air on" clip-path="url(#${C.id})"/>`;
      hp.forEach(h => {
        const x = D.X(h.t), y0 = h.d === 'D' ? up : dn, y1 = h.d === 'D' ? dn : up, sw = 2 + h.a * 3.5;
        const L = Math.hypot(2 * w, y1 - y0), ux = 2 * w / L, uy = (y1 - y0) / L, tx = x + w + ux * 4, ty = y1 + uy * 4;
        const hd = `M${l26f(tx)} ${l26f(ty)}L${l26f(tx - ux * 10 - uy * 5)} ${l26f(ty - uy * 10 + ux * 5)}L${l26f(tx - ux * 10 + uy * 5)} ${l26f(ty - uy * 10 - ux * 5)}Z`;
        s += `<g class="l26-h fut"><path d="M${l26f(x - w)} ${y0}L${l26f(x + w)} ${y1}" class="l26-st" style="stroke-width:${sw.toFixed(1)}px"/><path d="${hd}" class="l26-hd"/></g>`;
      });
      s += l26Labels(D.tl, D.page, D.X, H - 4) + `<g class="l26-medi" transform="translate(-40 0)"><g class="l26-mr">${l26Pick(0, 0, 28, 0, true)}</g></g>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    bind(D) { L26_DRAW.cordes.bind(D); },
    frame(D, pos) {
      const x = pos < 0 ? 0 : D.X(pos), cr = D.el.querySelector('.l26-clip'); if (cr) cr.setAttribute('width', l26f(x));
      l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
      const ph = performance.now() / 1000;
      D.el.querySelectorAll('.l26-vib.on').forEach(p => p.setAttribute('d', pos < 0 ? '' : l26VibPath(D, +p.dataset.k, 0, x, ph * 22)));
      const m = D.el.querySelector('.l26-medi'); if (!m || pos < 0) return;
      const P = D.mp;
      for (let i = 1; i < P.length; i++) if (x >= P[i - 1][0] && x <= P[i][0]) {
        const a = P[i - 1], b = P[i], t = b[0] > a[0] ? (x - a[0]) / (b[0] - a[0]) : 0, y = a[1] + (b[1] - a[1]) * t;
        m.setAttribute('transform', `translate(${l26f(x)} ${l26f(y)}) rotate(${b[1] < a[1] ? 180 : 0})`); break;
      }
    }
  },
  /* ── RYTHME : BAS EN BAS, HAUT EN HAUT ── Médi rebondit sur les cordes graves pour un bas, sur les aiguës pour un haut ;
     seules les cordes touchées vibrent (un haut ne touche que les 3 aiguës) */
  bashaut: {
    html(D) {
      const top = 50, gap = 10, H = top + 5 * gap + 30;
      const hp = l26Page(D); D.hp = hp; D.top = top; D.gap = gap;
      const yc = h => h.d === 'D' ? top + 5 * gap : top + gap;
      const {d, segs} = l26Arcs([[0, top - 12]].concat(hp.map(h => [D.X(h.t), yc(h)]), [[D.W, top - 12]]), 44);
      D.segs = segs; const C = l26ClipDef(H);
      let s = C.html + l26StringsHTML(D, top, gap);
      for (let k = 0; k < 6; k++) s += `<path class="l26-vib fut" data-k="${k}" d=""/><path class="l26-vib on" data-k="${k}" d="" style="stroke-width:${(1.1 + k * .3).toFixed(2)}px"/>`;
      s += `<path d="${d}" class="l26-arc"/><path d="${d}" class="l26-arc on" clip-path="url(#${C.id})"/>`;
      hp.forEach(h => {
        const x = D.X(h.t), y = yc(h), r = h.d === 'D' ? 8.5 : 7.2, ln = h.d === 'D' ? 5 * gap : 2 * gap;
        s += `<g class="l26-h fut${h.d === 'U' ? ' up' : ''}"><rect x="${l26f(x - 1.5)}" y="${top}" width="3" height="${ln}" rx="1.5" class="l26-trail"/>
          <circle cx="${l26f(x)}" cy="${y}" r="${r}"/><path d="${l26Arrow(x, y - 4.5, h.d, 9)}" class="l26-ar"/></g>`;
      });
      s += l26Labels(D.tl, D.page, D.X, H - 4) + l26MediG();
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    bind(D) {
      D.sub = k => D.tl.hits.filter(h => h.d === 'D' || k <= 2);
      D.el.querySelectorAll('.l26-vib.fut').forEach(p => { const k = +p.dataset.k; p.setAttribute('d', l26VibSub(D, k, 0, D.W, 0, D.sub(k), false)); });
    },
    frame(D, pos) {
      L26_DRAW.rebond.frame(D, pos);
      const x = pos < 0 ? -4 : D.X(pos), ph = performance.now() / 1000 * 22;
      D.el.querySelectorAll('.l26-vib.on').forEach(p => { const k = +p.dataset.k; p.setAttribute('d', pos < 0 ? '' : l26VibSub(D, k, 0, x, ph, D.sub(k), true)); });
    }
  },
  /* ── RYTHME : LES CORDES RESPIRENT ── les six cordes s'écartent quand le son est fort et se resserrent quand il s'éteint ;
     Médi rebondit sur la corde du haut */
  respire: {
    html(D) {
      const mid = 78, gap = 7, H = mid + 2.5 * gap * 2.6 + 30;
      const hp = l26Page(D); D.hp = hp; D.mid = mid; D.gap = gap;
      D.yk = (k, x, wob) => { const t = D.page * D.tl.win + (x - 12) / (D.W - 24) * D.tl.win, e = l26Env(D.tl, t); return mid + (k - 2.5) * gap * (1 + e * 1.6) + (wob ? e * 1.6 * Math.sin(x * .45 + k + wob) : 0); };
      const path = (k, x1, wob) => { let d = ''; for (let x = 0; x <= x1; x += 3) d += `${d ? 'L' : 'M'}${l26f(x)} ${l26f(D.yk(k, x, wob))}`; return d; };
      D.path = path;
      const {d, segs} = l26Arcs([[0, mid - 40]].concat(hp.map(h => [D.X(h.t), D.yk(0, D.X(h.t) + 2)]), [[D.W, mid - 40]]), 34);
      D.segs = segs; const C = l26ClipDef(H);
      let s = C.html;
      for (let k = 0; k < 6; k++) s += `<path class="l26-rs" d="${path(k, D.W, 0)}" style="stroke-width:${(.8 + k * .3).toFixed(2)}px"/><path class="l26-rs on" data-k="${k}" d="" style="stroke-width:${(1.1 + k * .3).toFixed(2)}px"/>`;
      s += `<path d="${d}" class="l26-arc"/><path d="${d}" class="l26-arc on" clip-path="url(#${C.id})"/>`;
      hp.forEach(h => { const x = D.X(h.t), y = D.yk(0, x + 2); s += `<g class="l26-h fut${h.d === 'U' ? ' up' : ''}"><circle cx="${l26f(x)}" cy="${l26f(y)}" r="${h.d === 'D' ? 8.5 : 7.2}"/><path d="${l26Arrow(x, y - 4.5, h.d, 9)}" class="l26-ar"/></g>`; });
      s += l26Labels(D.tl, D.page, D.X, H - 4) + l26MediG();
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      L26_DRAW.rebond.frame(D, pos);
      const x = pos < 0 ? -4 : D.X(pos), wob = performance.now() / 1000 * 18;
      D.el.querySelectorAll('.l26-rs.on').forEach(p => p.setAttribute('d', pos < 0 ? '' : D.path(+p.dataset.k, x, wob)));
    }
  },

  /* ── ARPÈGE : MÉDI PINCE ── les cordes de l'arpège, et Médi qui saute de note en note */
  apince: {
    html(D) {
      const h = L26_DRAW.arp.html(D), C = l26ClipDef(300);
      const pts = D.hp.map(n => [D.X(n.t), D.top + (5 - n.s) * D.gap - 10]);
      const {d, segs} = l26Arcs([[0, D.top - 4]].concat(pts, [[D.W, D.top - 4]]), 22, .8); D.segs = segs;
      const arcs = `${C.html}<path d="${d}" class="l26-arc"/><path d="${d}" class="l26-arc on" clip-path="url(#${C.id})"/>`;
      return h.replace(/(<svg[^>]*>)/, '$1' + arcs).replace('</svg>', l26MediG() + '</svg>');
    },
    frame(D, pos) { L26_DRAW.arp.frame(D, pos); L26_DRAW.rebond.frame(D, pos); }
  },
  /* ── ARPÈGE : LE CHEMIN ── un trait relie les notes : on voit l'arpège monter vers les aigus et revenir au pouce */
  chemin: {
    html(D) {
      const gap = 17, top = 14, H = top + 5 * gap + 30, hp = l26Page(D); D.hp = hp; D.gap = gap; D.top = top;
      const C = l26ClipDef(H), pts = hp.map(n => [D.X(n.t), top + (5 - n.s) * gap]);
      let s = C.html + l26StringsHTML(D, top, gap, true);
      const d = pts.length ? 'M' + pts.map(p => `${l26f(p[0])} ${l26f(p[1])}`).join(' L') : '';
      s += `<path d="${d}" class="l26-path"/><path d="${d}" class="l26-path on" clip-path="url(#${C.id})"/>`;
      hp.forEach((n, i) => { s += `<g class="l26-h fut${n.bs ? ' bs' : ''}"><circle cx="${l26f(pts[i][0])}" cy="${pts[i][1]}" r="8.5"/><text x="${l26f(pts[i][0])}" y="${pts[i][1] + 4}" class="l26-fg">${n.f}</text></g>`; });
      s += l26Labels(D.tl, D.page, D.X, H - 4) + `<rect class="l26-ph" x="-4" y="${top - 8}" width="2" height="${5 * gap + 16}" rx="1"/>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      const x = pos < 0 ? -4 : D.X(pos), cr = D.el.querySelector('.l26-clip'); if (cr) cr.setAttribute('width', l26f(Math.max(0, x)));
      const ph = D.el.querySelector('.l26-ph'); if (ph) ph.setAttribute('x', l26f(x - 1));
      l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
    }
  },
  /* ── ARPÈGE : LES NOTES TOMBENT ── les six cordes debout, les notes descendent vers la ligne ; la corde touchée vibre */
  tombe: {
    html(D) {
      const H = 236, hitY = 186, x0 = 60, dx = 44; D.hitY = hitY; D.ppu = 19; D.cx = si => x0 + si * dx;
      let s = '';
      for (let si = 0; si < 6; si++) s += `<path class="l26-col" data-s="${si}" d="M${D.cx(si)} 6V${hitY + 14}" style="stroke-width:${(2.1 - si * .25).toFixed(2)}px"/><text x="${D.cx(si)}" y="${hitY + 32}" class="l26-sn" style="text-anchor:middle">${['mi', 'la', 'ré', 'sol', 'si', 'mi'][si]}</text>`;
      s += `<line x1="${x0 - 26}" x2="${D.cx(5) + 26}" y1="${hitY}" y2="${hitY}" class="l26-hit"/>`;
      D.notes = D.tl.hits;
      D.notes.forEach(n => { s += `<g class="l26-h fut l26-fall${n.bs ? ' bs' : ''}" transform="translate(-50 -50)"><circle r="10"/><text y="4" class="l26-fg">${n.f}</text></g>`; });
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      const tl = D.tl, p = pos < 0 ? 0 : pos, L = tl.L, now = performance.now() / 1000 * 24;
      const gs = D.el.querySelectorAll('.l26-fall'), last = {};
      D.notes.forEach((n, i) => {
        let dt = ((n.t - p) % L + L) % L; if (dt > L - 1.5) dt -= L;
        const y = D.hitY - dt * D.ppu, g = gs[i];
        if (dt <= 0 && pos >= 0) { const ag = -dt; if (last[n.s] == null || ag < last[n.s].ag) last[n.s] = {ag, a: n.a, bs: n.bs}; }
        g.setAttribute('transform', `translate(${D.cx(n.s)} ${l26f(Math.min(y, D.hitY + 20))})`);
        g.style.opacity = y < -12 || y > D.hitY + 18 ? 0 : 1;
        g.classList.toggle('cur', pos >= 0 && dt <= 0 && dt > -1); g.classList.toggle('past', pos >= 0 && dt <= -1); g.classList.toggle('fut', pos < 0 || dt > 0);
      });
      D.el.querySelectorAll('.l26-col').forEach(c => {
        const si = +c.dataset.s, L0 = last[si], x = D.cx(si);
        if (!L0) { c.setAttribute('d', `M${x} 6V${D.hitY + 14}`); c.classList.remove('on'); return; }
        const amp = L0.a * Math.exp(-L0.ag / (L0.bs ? 4 : 1.8)) * 4.5; let d = '';
        for (let y = 6; y <= D.hitY + 14; y += 4) d += `${d ? 'L' : 'M'}${l26f(x + amp * Math.sin(y * .25 + now))} ${y}`;
        c.setAttribute('d', d); c.classList.toggle('on', amp > .4);
      });
    }
  },
  /* ── ARPÈGE : SUR L'ACCORD ── (Lucas, 26/11 : « super, mais il faut nommer chaque ligne de guitare », « les notes en
     gros comme les doigts », « les lettres sont-elles pertinentes ? des chiffres ? des symboles ? ») : le doigté, le nom
     de chaque corde en gros (la corde jouée s'allume), sous les cordes le doigt qui les pince, la mesure en cases ;
     la corde à pincer notée de 6 (Mi grave) à 1 (Mi aigu), choix de Lucas */
  accord: {
    html(D) {
      const tl = D.tl, m = D.bar || 0, nb = Math.max(1, Math.round(tl.L / tl.bar)), name = tl.chords[m % tl.chords.length] || 'Em';
      const ch = newChord(name), x0 = 96, dx = 32, y0 = 46, dy = 26, yb = y0 + 4 * dy, H = 274, md = L26.nota, cy = 239;
      D.ax = s => x0 + s * dx; D.ay0 = y0; D.fj = -2;
      let s = `<text x="${x0 - 26}" y="${y0 + 30}" class="l26-chd" style="text-anchor:end">${esc(name)}</text>`;
      for (let f = 0; f <= 4; f++) s += `<line x1="${x0}" x2="${x0 + 5 * dx}" y1="${y0 + f * dy}" y2="${y0 + f * dy}" class="${f ? 'l26-fret' : 'l26-nut'}"/>`;
      for (let si = 0; si < 6; si++) s += `<path class="l26-acs" data-s="${si}" d="M${D.ax(si)} ${y0}V${yb}"/>`;
      // le nom de chaque corde, en gros (ou son numéro, 6 = Mi grave … 1 = Mi aigu)
      TN_FR.forEach((nm, si) => {
        s += `<text x="${D.ax(si)}" y="${yb + 22}" class="l26-asn" data-s="${si}">${md === 'cordes' ? 6 - si : nm}</text>`;
        if (md === 'cordes') s += `<text x="${D.ax(si)}" y="${yb + 34}" class="l26-asg">${nm}</text>`;
      });
      if (md !== 'cordes') s += `<text x="${D.ax(0)}" y="${yb + 33}" class="l26-asg">grave</text><text x="${D.ax(5)}" y="${yb + 33}" class="l26-asg">aigu</text>`;
      // le doigt qui pince chaque corde : le pouce pour les basses, puis un doigt par corde
      s += `<path d="M${D.ax(0) - 6} ${yb + 40}V${yb + 44}H${D.ax(2) + 6}V${yb + 40}" class="l26-abr"/>`;
      if (md === 'cordes') [['pouce', 1], ['index', 3], ['majeur', 4], ['annul.', 5]].forEach(([w, si]) => { s += `<text x="${D.ax(si)}" y="${yb + 57}" class="l26-asg w">${w}</text>`; });
      else [[0, 1], [1, 3], [2, 4], [3, 5]].forEach(([fi, si]) => { s += l26Mark({f: 'pima'[fi], s: si}, D.ax(si), yb + 54, 'l26-afb'); });
      (ch.frets || []).forEach((fr, si) => {
        if (fr < 0) s += `<text x="${D.ax(si)}" y="${y0 - 8}" class="l26-le" style="font-size:11px">×</text>`;
        else if (fr > 0 && fr <= 4) s += `<circle cx="${D.ax(si)}" cy="${y0 + (fr - .5) * dy}" r="9" class="l26-adot"/>`;
      });
      s += `<g class="l26-afg" transform="translate(-50 -50)"></g>`;
      const hp = D.hp = tl.hits.filter(h => h.t >= m * tl.bar - 1e-6 && h.t < (m + 1) * tl.bar - 1e-6), cw = (D.W - 40) / tl.bar;
      for (let i = 0; i < tl.bar; i++) {
        const n = hp.find(h => Math.round(h.t - m * tl.bar) === i), x = 20 + i * cw;
        s += `<g class="l26-h fut"><rect x="${l26f(x + 2)}" y="${cy - 17}" width="${l26f(cw - 4)}" height="34" rx="9" class="l26-acell"/>${n ? l26Mark(n, l26f(x + cw / 2), cy, 'l26-acl') : ''}</g>`;
      }
      s += `<text x="${D.W - 6}" y="${H - 4}" class="l26-mes">mesure ${m % nb + 1} sur ${nb}</text>`;
      return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
    },
    frame(D, pos) {
      const tl = D.tl, nb = Math.max(1, Math.round(tl.L / tl.bar)), bar = pos < 0 ? 0 : Math.floor(pos / tl.bar) % nb;
      if (bar !== (D.bar || 0)) { D.bar = bar; D.cur = -2; D.el.innerHTML = L26_DRAW.accord.html(D); }
      const j = pos < 0 ? -1 : l26Cur(D.hp, pos), n = j >= 0 ? D.hp[j] : null, cells = D.el.querySelectorAll('.l26-h');
      cells.forEach((c, i) => { const k = n ? Math.round(n.t - bar * tl.bar) : -1; c.classList.toggle('cur', i === k); c.classList.toggle('fut', i !== k); });
      const now = performance.now() / 1000 * 24, ag = n ? pos - n.t : 0;
      D.el.querySelectorAll('.l26-acs').forEach(c => {
        const si = +c.dataset.s, x = D.ax(si), on = n && n.s === si;
        const nm = D.el.querySelector(`.l26-asn[data-s="${si}"]`); if (nm) nm.classList.toggle('on', !!on);
        if (!on) { c.setAttribute('d', `M${x} ${D.ay0}V${D.ay0 + 104}`); c.classList.remove('on'); return; }
        const amp = n.a * Math.exp(-ag / (n.bs ? 4 : 1.8)) * 4; let d = '';
        for (let y = D.ay0; y <= D.ay0 + 104; y += 4) d += `${d ? 'L' : 'M'}${l26f(x + amp * Math.sin(y * .3 + now))} ${y}`;
        c.setAttribute('d', d); c.classList.add('on');
      });
      const fg = D.el.querySelector('.l26-afg'); if (!fg || j === D.fj) return; D.fj = j;   // la bulle du doigt, au-dessus de la corde
      if (n) { fg.setAttribute('transform', `translate(${D.ax(n.s)} ${D.ay0 - 20})`); fg.innerHTML = `<circle r="12"/>${l26Mark(n, 0, 0, 'l26-fg')}`; }
      else fg.setAttribute('transform', 'translate(-50 -50)');
    }
  }
});

/* ── RYTHME : LES CORDES + MÉDI SAUTE (Lucas, 26/11 : « corde seule mais avec Médi qui saute, sans ligne qui le suit,
   c'est ça qui rend brouillon ») : les cordes seules (un petit médiator par coup donne le sens), Médi saute de coup en
   coup au-dessus, sans tracé ni barre de lecture ; il s'écrase un peu quand il touche les cordes ── */
/* les coups au milieu des cordes (Lucas, 26/11 : « refais les médiators du milieu pour que ce soit plus lisible et
   épuré ») : 3 façons, à comparer dans le Labo (pastilles « Les coups ») ; les cordes s'effacent derrière la marque */
// « les flèches ne vont jamais dans le bon sens » (Lucas, 26/11, sur sa prise : le sens d'un coup ne s'entend pas) → le coup
// neutre par défaut : pas de sens, mais sa hauteur suit la force du coup (ce que le micro entend bien)
const L26_COUPS = [['coup', 'Coups'], ['fleche', 'Flèches'], ['medi', 'Médiators'], ['rond', 'Ronds']];
L26.coups = (() => { const v = LS.get('gms_l26_coup', 'coup'); return L26_COUPS.some(c => c[0] === v) ? v : 'coup'; })();   // nouvelle clé : le coup neutre pour tous
function l26CoupHTML(h, x, mid, gap) {
  const up = h.d === 'U', k = L26.coups;
  if (k === 'coup') {   // une barre arrondie à travers les cordes : plus le coup est fort, plus elle est haute et épaisse
    const a = Math.max(.35, Math.min(1, h.a || .7)), hh = (1.3 + 3.5 * a) * gap / 2, w = 4.2 + 2.6 * a;
    return `<rect x="${l26f(x - w / 2 - 3)}" y="${l26f(mid - hh - 3)}" width="${l26f(w + 6)}" height="${l26f(2 * hh + 6)}" rx="${l26f(w / 2 + 3)}" class="l26-ko"/><rect x="${l26f(x - w / 2)}" y="${l26f(mid - hh)}" width="${l26f(w)}" height="${l26f(2 * hh)}" rx="${l26f(w / 2)}" class="l26-cb"/>`;
  }
  if (k === 'rond') return `<circle cx="${l26f(x)}" cy="${mid}" r="9" class="l26-ko"/><circle cx="${l26f(x)}" cy="${mid}" r="5.6" class="l26-cr${up ? ' up' : ''}"/>`;
  if (k === 'medi') return `<circle cx="${l26f(x)}" cy="${mid}" r="11" class="l26-ko"/>${l26Pick(x, mid, 19, up ? 180 : 0, false)}`;
  const y0 = mid - 1.5 * gap, y1 = mid + 1.5 * gap, tip = up ? y0 : y1, a = 4.6, s = up ? 1 : -1;   // la flèche : bas ou haut
  return `<rect x="${l26f(x - 5)}" y="${y0 - 2}" width="10" height="${y1 - y0 + 4}" rx="5" class="l26-ko"/>
    <path d="M${l26f(x)} ${up ? y1 : y0}V${tip}M${l26f(x - a)} ${l26f(tip + s * a)}L${l26f(x)} ${tip}L${l26f(x + a)} ${l26f(tip + s * a)}" class="l26-cm"/>`;
}
function l26Coups(k) {
  const was = l26Playing(); L26.coups = k; LS.set('gms_l26_coup', k);
  document.querySelectorAll('#v-labo .l26-mchips button').forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  if (L26.tl && $('l26-draw') && L26.style === 'saute') { L26.live = l26Mount($('l26-draw'), 'saute', L26.tl); if (was) l26Loop(); }
}

/* la bande sur le dessin (Lucas, 26/11 : « quand on ajoute la bande, Boum et Basile sont à gauche de la frise, sans que
   ça prenne plus de place ; quand ils interviennent, les cordes vibrent de leur couleur ; à plusieurs en même temps, on
   mélange : 2 cordes chacun ; laisse-moi aussi le choix des cordes sans couleur ») */
const L26_CVIB = [['couleur', 'En couleur'], ['neutre', 'Sans couleur']];
L26.cvib = (() => { const v = LS.get('gms_l26_cvib', 'couleur'); return L26_CVIB.some(c => c[0] === v) ? v : 'couleur'; })();
const l26BandShow = () => typeof FB !== 'undefined' && FB.band;
function l26BandEv(tl) {   // ce que joue la bande, posé sur la ligne du temps : Boum = grosse caisse et caisse claire, Basile = la basse
  if (tl._bev) return tl._bev;
  const ev = [];
  if (tl.unit === 's') fbTakeEvents(tl).forEach(e => { if (e.k || e.s) ev.push({t: e.t, w: 'boum', a: e.k ? 1 : .75}); if (e.b) ev.push({t: e.t, w: 'basile', a: .9}); });
  else {   // le rythme de la partie, comme grBandOwn
    const beats = Math.round(tl.bar / tl.beat), hitAt = t => tl.hits.some(h => Math.abs(h.t - t) < 1e-6);
    for (let b0 = 0; b0 < tl.L - 1e-6; b0 += tl.bar) for (let b = 0; b < beats; b++) {
      const t = b0 + b * tl.beat, k = b === 0 || (beats === 4 && b === 2 && hitAt(t)), sn = (beats === 4 && (b === 1 || b === 3)) || (beats === 3 && b > 0 && hitAt(t));
      if (k || sn) ev.push({t, w: 'boum', a: k ? 1 : .75});
      if (k) ev.push({t, w: 'basile', a: .9});
    }
    tl.hits.forEach(h => { if (h.x) ev.push({t: h.t, w: 'boum', a: .75}); });
  }
  return (tl._bev = ev.sort((a, b) => a.t - b.t));
}
const l26PalSVG = (svg, x, y, w, h) => svg.replace('<svg class="mt-pal ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" overflow="visible" class="l26-pal `);
function l26CvibSet(k) {
  L26.cvib = k; LS.set('gms_l26_cvib', k);
  document.querySelectorAll('#v-labo .l26-vchips button').forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
}

L26_DRAW.saute = {
  html(D) {
    const band = l26BandShow(), L = band ? 38 : 12, x0 = band ? 32 : 0;
    D.X = t => L + (t - D.page * D.tl.win) / D.tl.win * (D.W - L - 12);   // la bande prend la marge de gauche, pas de hauteur en plus
    const top = 58, gap = 12, hmax = 40, H = top + 5 * gap + 30, hp = l26Page(D); D.hp = hp; D.top = top; D.gap = gap; D.x0 = x0; D.band = band;
    const pts = [[x0, top - hmax * .55]].concat(hp.map(h => [D.X(h.t), top]), [[D.W, top - hmax * .5]]);
    D.segs = l26Arcs(pts, hmax).segs;
    let s = '';   // épuré : les cordes seules, rien de dessiné à l'avance
    for (let k = 0; k < 6; k++) s += `<line x1="${x0}" x2="${D.W}" y1="${top + k * gap}" y2="${top + k * gap}" class="l26-str" style="stroke-width:${(.8 + k * .3).toFixed(2)}px"/>`;
    for (let k = 0; k < 6; k++) s += `<path class="l26-vib on" data-k="${k}" d="" style="stroke-width:${(1.3 + k * .3).toFixed(2)}px"/>`;
    const mid = top + 2.5 * gap;
    hp.forEach(h => { s += `<g class="l26-h fut">${l26CoupHTML(h, D.X(h.t), mid, gap)}</g>`; });
    if (band) s += `<g class="l26-who" data-w="boum">${l26PalSVG(BOUM_SVG(true, ''), 4, top + 3, 23, 23)}</g><g class="l26-who" data-w="basile">${l26PalSVG(BASILE_SVG(true, ''), 8, top + 31, 16, 26)}</g>`;
    s += l26Labels(D.tl, D.page, D.X, H - 4) + l26MediG();
    return `<svg class="l26-svg l26-ep" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
  },
  frame(D, pos) {
    const tl = D.tl, x = pos < 0 ? -4 : D.X(pos), ph = performance.now() / 1000 * 26, tau = tl.beat * .13;
    // qui sonne en ce moment : Médi (ta guitare), et avec la bande Boum et Basile ; chacun fait vibrer ses cordes
    const env = (L, w) => { if (pos < 0) return 0; let h = null; for (const e of L) { if (e.t > pos + 1e-6) break; if (!w || e.w === w) h = e; } return h ? h.a * Math.exp(-(pos - h.t) / tau) : 0; };
    const bev = D.band ? l26BandEv(tl) : [], who = [['m', env(tl.hits)], ['b', D.band ? env(bev, 'boum') : 0], ['l', D.band ? env(bev, 'basile') : 0]].filter(([, e]) => e * D.gap * .45 > .35);
    const n = who.length, col = L26.cvib === 'neutre';
    D.a0 = n ? who[0][1] * D.gap * .45 : 0; D.ph = ph;   // la corde du haut : la fiche y fait bouger la languette de la bande
    D.el.querySelectorAll('.l26-vib.on').forEach(p => {
      const k = +p.dataset.k; if (!n) { p.setAttribute('d', ''); return; }
      const [w, e] = who[Math.min(n - 1, Math.floor(k * n / 6))], y0 = D.top + k * D.gap, a = e * D.gap * .45;   // 6 cordes : 6, 3 + 3 ou 2 + 2 + 2
      let d = ''; for (let xx = D.x0; xx <= D.W; xx += 4) d += `${d ? 'L' : 'M'}${xx} ${l26f(y0 + a * Math.sin(Math.PI * (xx - D.x0) / (D.W - D.x0)) * Math.sin(xx * (.11 + k * .012) + ph + k))}`;
      p.setAttribute('d', d); p.setAttribute('class', `l26-vib on v${col ? 'n' : w}`);
    });
    l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
    if (D.band) D.el.querySelectorAll('.l26-who').forEach(g => {   // Boum et Basile sautent sur place, à leur tour
      let h = null; if (pos >= 0) for (const e of bev) { if (e.t > pos + 1e-6) break; if (e.w === g.dataset.w) h = e; }
      const dt = h ? (pos - h.t) / (tl.beat * .45) : 9, y = dt < 1 ? -6 * Math.sin(Math.PI * dt) : 0;
      g.setAttribute('transform', `translate(0 ${l26f(y)})`); g.classList.toggle('on', dt < 1);
    });
    const m = D.el.querySelector('.l26-medi'); if (!m) return;
    if (pos < 0) { m.setAttribute('transform', 'translate(-60 0)'); return; }   // à l'arrêt : Médi attend hors du dessin, comme au départ
    for (const [a, b, cx, cy] of D.segs) if (x >= a[0] && x < b[0]) {
      const t = (x - a[0]) / (b[0] - a[0]), px = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], py = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * cy + t * t * b[1];
      const sq = Math.max(0, 1 - Math.min(t, 1 - t) / .14) * ((t < .5 ? a : b)[1] === D.top ? .16 : 0);   // l'écrasement en touchant les cordes
      m.setAttribute('transform', `translate(${l26f(px)} ${l26f(py)}) scale(${(1 + sq).toFixed(3)} ${(1 - sq).toFixed(3)}) translate(0 -15)`); break;
    }
  }
};

// les choix proposés (test du son, test de l'arpège, fiche bêta) ; les avis du Labo reprennent ces noms
const L26_RH_STYLES = [['saute', 'Cordes + Médi saute'], ['mix', 'Mélange'], ['gratte', 'Médi gratte'], ['bashaut', 'Bas en bas, haut en haut'], ['respire', 'Les cordes respirent'], ['rebond', 'Rebond seul'], ['cordes', 'Cordes seules'], ['rosace', 'Rosace']];
const L26_ARP_STYLES = [['accord', 'Sur l’accord'], ['arp', 'Les cordes'], ['apince', 'Médi pince'], ['chemin', 'Le chemin'], ['tombe', 'Les notes tombent']];
const L26_VSAY = {
  gratte: 'Je gratte les cordes à chaque coup : vers le bas ou vers le haut. En pointillé, ta main passe sans toucher.',
  bashaut: 'Un bas tombe sur les cordes graves, un haut sur les aiguës. Seules les cordes touchées vibrent.',
  saute: 'Je saute sur chacun de tes coups. Plus la marque est haute, plus tu as frappé fort.',
  respire: 'Les cordes s’écartent quand c’est fort et se resserrent quand le son s’éteint.',
  arp: 'Chaque note fait vibrer sa corde, et la basse sonne plus longtemps. La lettre, c’est le doigt.',
  apince: 'Je saute de corde en corde avec toi : plus je monte, plus c’est aigu.',
  chemin: 'Le trait montre le chemin de l’arpège : il monte vers les aigus et revient au pouce.',
  tombe: 'Les notes tombent sur leur corde : pince quand elles touchent la ligne.',
  accord: 'Garde ce doigté : la corde qui s’allume, c’est celle à pincer, avec ce doigt.'
};
LAB_TESTS26[0].ask = L26_RH_STYLES.map(s => s[1]);
LAB_TESTS26[1].ask = L26_ARP_STYLES.map(s => s[1]); LAB_TESTS26[1].askq = 'Lequel tu préfères ?';
LAB_TESTS26[0].d = 'Huit dessins du son : lequel se lit le mieux en jouant ?';
LAB_TESTS26[1].d = 'Cinq façons de dessiner l’arpège.';
const l26ChipsHTML = (list, cur, fn) => `<div class="l26-chips" role="tablist">${list.map(([k, l]) => `<button type="button" role="tab" aria-selected="${cur === k}" class="${cur === k ? 'on' : ''}" data-k="${k}" onclick="${fn}('${k}')">${l}</button>`).join('')}</div>`;
function l26ChipsOn(k) { document.querySelectorAll('#v-labo .l26-chips:not(.l26-mchips):not(.l26-vchips) button').forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); }
// la légende des doigts sous l'arpège, et le choix de la notation (dessin « Sur l'accord » : Labo et fiche bêta)
const l26ArpLeg = k => L26_NOTA_LEG[k === 'accord' ? L26.nota : 'lettres'];
// « Avec la bande » dans le Labo (même réglage que la fiche bêta) : le dessin se refait (Boum et Basile à gauche) et la lecture repart
function l26Band() {
  FB.band = !FB.band; LS.set('gms_fb_band', FB.band);
  document.querySelectorAll('#v-labo .l26-bandb').forEach(b => { b.classList.toggle('on', FB.band); b.setAttribute('aria-pressed', FB.band); });
  const was = l26Playing(); if (was) l26Stop();
  if (L26.tl && $('l26-draw')) L26.live = l26Mount($('l26-draw'), L26.style, L26.tl);
  if (was) l26SonPlay();
}

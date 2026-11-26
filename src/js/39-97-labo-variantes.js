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
  /* ── ARPÈGE : SUR L'ACCORD ── le doigté de l'accord de la mesure ; la corde jouée s'allume, le doigt au-dessus ;
     la mesure en petites cases dessous */
  accord: {
    html(D) {
      const tl = D.tl, m = D.bar || 0, nb = Math.max(1, Math.round(tl.L / tl.bar)), name = tl.chords[m % tl.chords.length] || 'Em';
      const ch = newChord(name), x0 = 100, dx = 28, y0 = 46, dy = 26, H = 232; D.ax = s => x0 + s * dx; D.ay0 = y0;
      let s = `<text x="${x0 - 30}" y="${y0 + 30}" class="l26-chd" style="text-anchor:end">${esc(name)}</text>`;
      for (let f = 0; f <= 4; f++) s += `<line x1="${x0}" x2="${x0 + 5 * dx}" y1="${y0 + f * dy}" y2="${y0 + f * dy}" class="${f ? 'l26-fret' : 'l26-nut'}"/>`;
      for (let si = 0; si < 6; si++) s += `<path class="l26-acs" data-s="${si}" d="M${D.ax(si)} ${y0}V${y0 + 4 * dy}"/>`;
      (ch.frets || []).forEach((fr, si) => {
        if (fr < 0) s += `<text x="${D.ax(si)}" y="${y0 - 8}" class="l26-le" style="font-size:11px">×</text>`;
        else if (fr > 0 && fr <= 4) s += `<circle cx="${D.ax(si)}" cy="${y0 + (fr - .5) * dy}" r="9" class="l26-adot"/>`;
      });
      s += `<g class="l26-afg" transform="translate(-50 -50)"><circle r="11"/><text y="4" class="l26-fg">p</text></g>`;
      const hp = D.hp = tl.hits.filter(h => h.t >= m * tl.bar - 1e-6 && h.t < (m + 1) * tl.bar - 1e-6), cw = (D.W - 40) / tl.bar;
      for (let i = 0; i < tl.bar; i++) {
        const n = hp.find(h => Math.round(h.t - m * tl.bar) === i), x = 20 + i * cw;
        s += `<g class="l26-h fut"><rect x="${l26f(x + 2)}" y="176" width="${l26f(cw - 4)}" height="34" rx="9" class="l26-acell"/>${n ? `<text x="${l26f(x + cw / 2)}" y="198" class="l26-acl">${n.f}</text>` : ''}</g>`;
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
        if (!on) { c.setAttribute('d', `M${x} ${D.ay0}V${D.ay0 + 104}`); c.classList.remove('on'); return; }
        const amp = n.a * Math.exp(-ag / (n.bs ? 4 : 1.8)) * 4; let d = '';
        for (let y = D.ay0; y <= D.ay0 + 104; y += 4) d += `${d ? 'L' : 'M'}${l26f(x + amp * Math.sin(y * .3 + now))} ${y}`;
        c.setAttribute('d', d); c.classList.add('on');
      });
      const fg = D.el.querySelector('.l26-afg');
      if (fg) { if (n) { fg.setAttribute('transform', `translate(${D.ax(n.s)} ${D.ay0 - 20})`); fg.querySelector('text').textContent = n.f; } else fg.setAttribute('transform', 'translate(-50 -50)'); }
    }
  }
});

/* ── RYTHME : LES CORDES + MÉDI SAUTE (Lucas, 26/11 : « corde seule mais avec Médi qui saute, sans ligne qui le suit,
   c'est ça qui rend brouillon ») : les cordes seules (un petit médiator par coup donne le sens), Médi saute de coup en
   coup au-dessus, sans tracé ni barre de lecture ; il s'écrase un peu quand il touche les cordes ── */
L26_DRAW.saute = {
  html(D) {
    const top = 58, gap = 12, hmax = 40, H = top + 5 * gap + 30, hp = l26Page(D); D.hp = hp; D.top = top; D.gap = gap; D.vamp = .5;
    const pts = [[0, top - hmax * .55]].concat(hp.map(h => [D.X(h.t), top]), [[D.W, top - hmax * .5]]);
    D.segs = l26Arcs(pts, hmax).segs;
    let s = l26StringsHTML(D, top, gap);
    for (let k = 0; k < 6; k++) s += `<path class="l26-vib fut" data-k="${k}" d=""/><path class="l26-vib on" data-k="${k}" d="" style="stroke-width:${(1.1 + k * .3).toFixed(2)}px"/>`;
    const mid = top + 2.5 * gap;
    hp.forEach(h => { s += `<g class="l26-h fut">${l26Pick(D.X(h.t), mid, 22 * (h.d === 'D' ? 1 : .8), h.d === 'D' ? 0 : 180, false)}</g>`; });
    s += l26Labels(D.tl, D.page, D.X, H - 4) + l26MediG();
    return `<svg class="l26-svg" viewBox="0 0 ${D.W} ${H}" aria-hidden="true">${s}</svg>`;
  },
  bind(D) { L26_DRAW.cordes.bind(D); },
  frame(D, pos) {
    const x = pos < 0 ? -4 : D.X(pos), ph = performance.now() / 1000;
    D.el.querySelectorAll('.l26-vib.on').forEach(p => p.setAttribute('d', pos < 0 ? '' : l26VibPath(D, +p.dataset.k, 0, x, ph * 22)));
    l26SetCls(D, '.l26-h', pos < 0 ? -1 : l26Cur(D.hp, pos));
    const m = D.el.querySelector('.l26-medi'); if (!m || pos < 0) return;
    for (const [a, b, cx, cy] of D.segs) if (x >= a[0] && x < b[0]) {
      const t = (x - a[0]) / (b[0] - a[0]), px = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], py = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * cy + t * t * b[1];
      const sq = Math.max(0, 1 - Math.min(t, 1 - t) / .14) * ((t < .5 ? a : b)[1] === D.top ? .16 : 0);   // l'écrasement en touchant les cordes
      m.setAttribute('transform', `translate(${l26f(px)} ${l26f(py)}) scale(${(1 + sq).toFixed(3)} ${(1 - sq).toFixed(3)}) translate(0 -15)`); break;
    }
  }
};

// les choix proposés (test du son, test de l'arpège, fiche bêta) ; les avis du Labo reprennent ces noms
const L26_RH_STYLES = [['saute', 'Cordes + Médi saute'], ['mix', 'Mélange'], ['gratte', 'Médi gratte'], ['bashaut', 'Bas en bas, haut en haut'], ['respire', 'Les cordes respirent'], ['rebond', 'Rebond seul'], ['cordes', 'Cordes seules'], ['rosace', 'Rosace']];
const L26_ARP_STYLES = [['arp', 'Les cordes'], ['apince', 'Médi pince'], ['chemin', 'Le chemin'], ['tombe', 'Les notes tombent'], ['accord', 'Sur l’accord']];
const L26_VSAY = {
  gratte: 'Je gratte les cordes à chaque coup : vers le bas ou vers le haut. En pointillé, ta main passe sans toucher.',
  bashaut: 'Un bas tombe sur les cordes graves, un haut sur les aiguës. Seules les cordes touchées vibrent.',
  saute: 'Je saute de coup en coup, et chaque coup fait vibrer tes cordes. Le petit médiator donne le sens : vers le bas ou vers le haut.',
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
function l26ChipsOn(k) { document.querySelectorAll('#v-labo .l26-chips button').forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); }

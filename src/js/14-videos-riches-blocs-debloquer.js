/* ═══════ VIDÉOS RICHES (blocs « Débloquer ») ═══════
   lvBuild(spec) fabrique une vidéo pour le lecteur LV à partir de scènes décrites en données :
   - morph : un schéma d'accord dont les doigts glissent d'un accord à l'autre (doigts communs en orange)
   - beats : une mesure qui défile, flèches qui s'allument au son, main qui balance, accords qui tournent
   - tiles : quelques tuiles qui tombent (chiffres, idées)
   Chaque scène a ses sous-titres minutés [seconde relative, texte]. Les durées découlent du contenu. */
const LVX = {n: 0};
const lvCh = x => typeof x === 'string' ? newChord(x) : Object.assign({id: uid(), arp: [], base: 1}, x);
const lvCaps = (t0, caps) => `<div class="lv-caps">${caps.map(([r, txt], j) => {
  const a = t0 + r, nx = caps[j + 1];
  return `<div style="animation:lvUp .5s var(--ease-out) ${a.toFixed(2)}s forwards${nx ? `,lvOut .3s ease ${(t0 + nx[0] - .3).toFixed(2)}s forwards` : ''}">${txt}</div>`;
}).join('')}</div>`;
const lvTop = sc => sc.top ? `<div class="lv-top"><div><b>${sc.top[0]}</b><small>${sc.top[1] || ''}</small></div>${sc.cnt ? `<div class="lv-cnt"><span data-c="${sc.cnt}">0</span><small>${sc.cntL || ''}</small></div>` : ''}</div>` : '';
// keyframes d'opacité : visible pendant les états où flags[k] est vrai
function lvVisKF(name, flags, h, m) {
  const T = flags.length * (h + m), p = x => (x / T * 100).toFixed(3) + '%';
  return `@keyframes ${name}{` + flags.map((f, k) => `${p(k * (h + m))},${p(k * (h + m) + h)}{opacity:${f ? 1 : 0}}`).join('') + `100%{opacity:${flags[flags.length - 1] ? 1 : 0}}}`;
}
function lvMorph(t0, sc, id, cues) {
  const A = lvCh(sc.a), B = lvCh(sc.b), n = sc.n || 6, h = sc.hold || 1.1, m = sc.move || .5, st = .9, T = n * (h + m);
  const seq = Array.from({length: n}, (_, k) => k % 2 ? B : A), X = i => 30 + i * 33, Y = f => 52 + (f - .5) * 44;
  const pos = (c, f) => { const i = c.fingers.findIndex((g, k) => g === f && c.frets[k] > 0); return i < 0 ? null : [X(i), Y(c.frets[i])]; };
  let css = '', svg = `<svg class="lv-mo-g" viewBox="0 0 226 280" aria-hidden="true">`;
  for (let j = 0; j <= 5; j++) svg += `<path class="${j ? 'fr' : 'nut'}" d="M${X(0)} ${52 + j * 44}H${X(5)}"/>`;
  for (let i = 0; i < 6; i++) svg += `<path class="st" d="M${X(i)} 52V${52 + 5 * 44}"/>`;
  [A, B].forEach((c, w) => {   // cordes à vide (o) et muettes (x), propres à chaque accord
    const nm = `lvm${id}_${w}`; css += lvVisKF(nm, seq.map(s => s === c), h, m);
    svg += `<g class="mk" style="animation:${nm} ${T}s linear ${(t0 + st).toFixed(2)}s both">` + c.frets.map((f, i) => f === 0 ? `<circle cx="${X(i)}" cy="30" r="7"/>` : f < 0 ? `<path d="M${X(i) - 6} 24l12 12m0 -12l-12 12"/>` : '').join('') + '</g>';
  });
  const isBar = (c, f) => c.fingers.filter((g, k) => g === f && c.frets[k] > 0).length > 1;
  [A, B].forEach((c, w) => [1, 2, 3, 4].filter(f => isBar(c, f)).forEach(f => {   // barré : une barre par accord, en fondu
    const ks = c.fingers.map((g, k) => g === f && c.frets[k] > 0 ? k : -1).filter(k => k >= 0), fr = c.frets[ks[0]], x1 = X(Math.min(...ks)), x2 = X(Math.max(...ks));
    svg += `<g class="fd bar" style="animation:lvm${id}_${w} ${T}s linear ${(t0 + st).toFixed(2)}s both"><rect x="${x1 - 15}" y="${Y(fr) - 15}" width="${x2 - x1 + 30}" height="30" rx="15"/><text x="${(x1 + x2) / 2}" y="${Y(fr) + 5.5}">${f}</text></g>`;
  }));
  [1, 2, 3, 4].forEach(f => {
    if (isBar(A, f) || isBar(B, f)) return;
    const ps = seq.map(c => pos(c, f)); if (!ps.some(Boolean)) return;
    const pa = pos(A, f), pb = pos(B, f), pivot = pa && pb && pa[0] === pb[0] && pa[1] === pb[1];
    const fill = ps.map((p, k) => p || ps.slice(k).find(Boolean) || ps.slice(0, k).reverse().find(Boolean));
    const nm = `lvf${id}_${f}`, pc = x => (x / T * 100).toFixed(3) + '%';
    css += `@keyframes ${nm}{` + fill.map((p, k) => `${pc(k * (h + m))},${pc(k * (h + m) + h)}{transform:translate(${p[0]}px,${p[1]}px);opacity:${ps[k] ? 1 : 0}}`).join('') + `100%{transform:translate(${fill[n - 1][0]}px,${fill[n - 1][1]}px);opacity:${ps[n - 1] ? 1 : 0}}}`;
    svg += `<g class="fd${pivot ? ' pv' : ''}" style="animation:${nm} ${T}s ease-in-out ${(t0 + st).toFixed(2)}s both"><circle r="15"/><text y="5.5">${f}</text></g>`;
  });
  svg += '</svg>';
  const names = [A, B].map((c, w) => `<span style="animation:lvm${id}_${w} ${T}s linear ${(t0 + st).toFixed(2)}s both">${esc(c.name)}</span>`).join('');
  seq.forEach((c, k) => cues.push([t0 + st + k * (h + m), el => { playChord(c, 0, 'D'); if (sc.cnt && k) { const e = el.querySelector(`[data-c="${sc.cnt}"]`); if (e) e.textContent = k; } }]));
  const leg = sc.legend === false ? '' : `<div class="lv-mo-l"><span><i class="pv"></i>reste posé</span><span><i></i>bouge</span></div>`;
  return {d: st + T + (sc.tail || 1.4), html: `<style>${css}</style><div class="lv-mo">${svg}<div class="lv-mo-r"><div class="lv-mo-n">${names}</div>${leg}</div></div>`};
}
const LV_CNT = {'4/4': ['1', '+', '2', '+', '3', '+', '4', '+'], '3/4': ['1', '+', '2', '+', '3', '+'], '6/8': ['1', '2', '3', '4', '5', '6']};
function lvGlyph(c, ghost) {
  if (!c) return ghost ? `<path class="gh" d="${ghost === 'U' ? 'M10 34V6m-6 7l6-7l6 7' : 'M10 6v28m-6-7l6 7l6-7'}"/>` : '<circle class="o" cx="10" cy="20" r="2"/>';
  if (c.d === 'X') return '<path class="x" d="M4 14l12 12m0-12l-12 12"/>';
  const w = c.a === 2 ? 4.2 : c.a === 0 ? 2 : 3;
  return `<path class="${c.d === 'U' ? 'u' : 'd'}${c.a === 0 ? ' soft' : ''}" stroke-width="${w}" d="${c.d === 'U' ? 'M10 34V6m-6 7l6-7l6 7' : 'M10 6v28m-6-7l6 7l6-7'}"/>`;
}
function lvBeats(t0, sc, id, cues) {
  let t = t0 + .9, html = '<div class="lv-bts">';
  sc.rows.forEach((r, ri) => {
    const mes = r.mes || '4/4', cd = mes === '6/8' ? 60 / r.bpm / 3 : 60 / r.bpm / 2, chs = r.chords.map(lvCh);
    const cells = [...r.pat].map((ch, k) => ch === '-' ? null : ch === 'X' || ch === 'x' ? {d: 'X', a: 1} : {d: ch.toUpperCase() === 'U' ? 'U' : 'D', a: (r.acc || []).includes(k) ? 2 : ch === ch.toLowerCase() ? 0 : 1});
    const n = cells.length, bar = n * cd, L = chs.length, rs = t, cnt = LV_CNT[mes] || LV_CNT['4/4'];
    const win = (k) => `lvWin ${bar.toFixed(3)}s linear ${(rs + k * bar).toFixed(2)}s`;
    html += `<div class="lv-bt" style="animation:lvRow ${(L * bar).toFixed(2)}s linear ${rs.toFixed(2)}s">
      <div class="lv-bt-h"><b>${r.lbl}</b><span class="lv-bt-c">${chs.map((c, k) => `<i style="animation:${win(k)}">${esc(c.name)}</i>`).join('')}<i class="rest">${esc(chs[0].name)}</i></span><small>${r.bpm} BPM</small></div>
      <div class="lv-bt-row"><div class="lv-bt-bar" style="--n:${n}">` +
      cells.map((c, k) => {
        const anim = c || (r.free && k === n - 1) ? chs.map((_, l) => `lvHit .32s ease-out ${(rs + l * bar + k * cd).toFixed(2)}s`).join(',') : '';
        const free = r.free && k === n - 1, gh = !c && r.ghost ? (mes === '6/8' ? '' : k % 2 ? 'U' : 'D') : '';
        return `<div class="lv-bc${free ? ' free' : ''}${c && c.a === 2 ? ' acc' : ''}"${anim ? ` style="animation:${anim}"` : ''}><em>${cnt[k] || ''}</em><svg viewBox="0 0 20 40">${free ? lvGlyph({d: 'U', a: 0}) : lvGlyph(c, gh)}</svg>${free ? '<small>à vide</small>' : ''}</div>`;
      }).join('') + `<i class="lv-ph" style="animation:${chs.map((_, l) => `lvPh ${bar.toFixed(3)}s linear ${(rs + l * bar).toFixed(2)}s`).join(',')}"></i></div>` +
      (r.hand ? `<div class="lv-hand"><i style="animation:lvSwing ${cd.toFixed(3)}s ease-in-out ${rs.toFixed(2)}s ${n * L} alternate"></i></div>` : '') + `</div></div>`;
    const open = {name: '', frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0]};
    chs.forEach((ch, l) => cells.forEach((c, k) => {
      const free = r.free && k === n - 1;
      if (c || free) cues.push([rs + l * bar + k * cd, () => rhPlayCell(free ? {d: 'U', a: 0} : c, audio().currentTime + .01, free ? open : ch, 0)]);
    }));
    t = rs + L * bar + .7;
  });
  return {d: t - t0 + (sc.tail || .8), html: html + '</div>'};
}
function lvTiles(t0, sc, id, cues) {
  const st = .9, step = sc.step || .6;
  sc.items.forEach((it, i) => { if (it.c) cues.push([t0 + st + i * step, () => playChord(lvCh(it.c), 0, 'D')]); if (it.m != null) cues.push([t0 + st + i * step, () => [].concat(it.m).forEach((m, k) => setTimeout(() => playNote(m), k * 170))]); });
  return {d: st + sc.items.length * step + (sc.tail || 3), html: `<div class="lv-tl" style="--n:${sc.items.length};--np:${Math.min(3, sc.items.length)}">` + sc.items.map((it, i) =>
    `<div class="lv-t${it.hot ? ' hot' : ''}" style="animation-delay:${(t0 + st + i * step).toFixed(2)}s"><b>${it.l}</b>${it.s ? `<i>${it.s}</i>` : ''}</div>`).join('') + '</div>'};
}

const LV_OPEN = [40, 45, 50, 55, 59, 64];   // cordes à vide, de la 6e (grave) à la 1re
function lvDiag(c, hits) {   // schéma fixe ; hits[corde] = liste d'instants où la corde s'allume
  const X = i => 30 + i * 33, Y = f => 52 + (f - .5) * 44;
  let g = `<svg class="lv-mo-g" viewBox="0 0 226 280" aria-hidden="true">`;
  for (let j = 0; j <= 5; j++) g += `<path class="${j ? 'fr' : 'nut'}" d="M${X(0)} ${52 + j * 44}H${X(5)}"/>`;
  for (let i = 0; i < 6; i++) g += `<path class="st${hits && hits[i] ? ' hs' : ''}" d="M${X(i)} 52V${52 + 5 * 44}"${hits && hits[i] ? ` style="animation:${hits[i].map(t => `lvStr .45s ease-out ${t.toFixed(2)}s`).join(',')}"` : ''}/>`;
  g += '<g class="mk">' + c.frets.map((f, i) => f === 0 ? `<circle cx="${X(i)}" cy="30" r="7"/>` : f < 0 ? `<path d="M${X(i) - 6} 24l12 12m0 -12l-12 12"/>` : '').join('') + '</g>';
  const done = {};
  c.frets.forEach((f, i) => { if (f <= 0) return; const fg = c.fingers[i]; const ks = c.fingers.map((x, k) => x === fg && fg && c.frets[k] === f ? k : -1).filter(k => k >= 0);
    if (ks.length > 1) { if (done[fg]) return; done[fg] = 1; const x1 = X(ks[0]), x2 = X(ks[ks.length - 1]); g += `<g class="fd bar"><rect x="${x1 - 15}" y="${Y(f) - 15}" width="${x2 - x1 + 30}" height="30" rx="15"/><text x="${(x1 + x2) / 2}" y="${Y(f) + 5.5}">${fg}</text></g>`; }
    else g += `<g class="fd" transform="translate(${X(i)} ${Y(f)})"><circle r="15"/><text y="5.5">${fg || ''}</text></g>`; });
  return g + '</svg>';
}
function lvArp(t0, sc, id, cues) {
  const st = .9, cd = 60 / sc.bpm / 2, rep = sc.rep || 2, chs = sc.chords.map(lvCh), seq = sc.seq, n = seq.length, per = n * rep * cd;
  const strOf = (c, tok) => { const b = c.frets.findIndex(f => f >= 0); return tok === 'B' ? b : tok === 'A' ? Math.min(3, b === 0 ? 2 : b + 1) : 6 - tok; };
  let diags = '', end = t0 + st + chs.length * per;
  chs.forEach((c, l) => {
    const hits = {}, s0 = t0 + st + l * per;
    for (let r = 0; r < rep; r++) seq.forEach((tok, k) => { const si = strOf(c, tok), t = s0 + (r * n + k) * cd; (hits[si] = hits[si] || []).push(t);
      if (c.frets[si] >= 0) cues.push([t, () => playNote(LV_OPEN[si] + c.frets[si])]); });
    const anim = l === 0 ? (chs.length > 1 ? `lvOut .01s linear ${(s0 + per).toFixed(2)}s forwards` : '') : l === chs.length - 1 ? `lvIn .01s linear ${s0.toFixed(2)}s forwards` : `lvWin ${per.toFixed(2)}s linear ${s0.toFixed(2)}s`;
    diags += `<div class="lv-ad${l ? ' hid' : ''}"${anim ? ` style="animation:${anim}"` : ''}>${lvDiag(c, hits)}<b>${esc(c.name)}</b></div>`;
  });
  const lbl = sc.lbl || seq.map(t => t === 'B' ? 'B' : t === 'A' ? 'B2' : String(t));
  const cells = seq.map((t, k) => `<div class="lv-bc lv-ac" style="animation:${Array.from({length: chs.length * rep}, (_, r) => `lvHit .3s ease-out ${(t0 + st + (r * n + k) * cd).toFixed(2)}s`).join(',')}"><b>${lbl[k]}</b></div>`).join('');
  return {d: end - t0 + (sc.tail || 1.2), html: `<div class="lv-arp"><div class="lv-ads">${diags}</div><div class="lv-bt-bar" style="--n:${n}">${cells}</div></div>`};
}
function lvNeck(t0, sc, id, cues) {
  const st = .9, NF = sc.frets || 5, Y = s => 22 + (s - 1) * 25, FX = f => f === 0 ? 22 : 44 + (f - .5) * (340 / NF);
  let g = `<svg class="lv-nk" viewBox="0 0 400 170" aria-hidden="true"><rect class="wood" x="44" y="10" width="346" height="150" rx="4"/>`;
  for (let f = 1; f <= NF; f++) g += `<path class="fr" d="M${44 + f * 340 / NF} 10V160"/>`;
  [3, 5].filter(f => f < NF).forEach(f => { g += `<circle class="inl" cx="${FX(f)}" cy="85" r="5"/>`; });
  g += `<path class="nut" d="M44 10V160"/>`;
  for (let si = 1; si <= 6; si++) g += `<path class="st" stroke-width="${.9 + si * .35}" d="M10 ${Y(si)}H392"/>`;
  if (sc.shape) { const c = lvCh(sc.shape); c.frets.forEach((f, i) => { if (f > 0) g += `<circle class="sh" cx="${FX(f)}" cy="${Y(6 - i)}" r="10"/>`; }); }
  let last = null, tl = st;
  (sc.ev || []).forEach(([dt, s, f, k, lab], j) => {
    const t = t0 + st + dt; tl = Math.max(tl, st + dt);
    if (k === 'c') { const c = lvCh(s); cues.push([t, () => playChord(c, 0, 'D')]);
      g += `<text class="cn" x="200" y="-6" style="animation:lvFlash 1.2s ease-out ${t.toFixed(2)}s both">${esc(c.name)}</text>`; return; }
    const midi = LV_OPEN[6 - s] + f;
    if (k === 's' && last) {
      const nm = `lvs${id}_${j}`, x0 = FX(last[1]), x1 = FX(f), y = Y(s);
      s = s; g += `<style>@keyframes ${nm}{0%{transform:translate(${x0}px,${y}px);opacity:1}100%{transform:translate(${x1}px,${y}px);opacity:1}}</style>
        <g class="nd sl" style="animation:${nm} .45s ease-in-out ${t.toFixed(2)}s both,lvOut .3s ease ${(t + 1.4).toFixed(2)}s forwards"><circle r="11"/></g>`;
      cues.push([t + .42, () => playNote(midi)]);
    } else {
      g += `<g class="nd${k === 'h' || k === 'p' ? ' hp' : ''}" transform="translate(${FX(f)} ${Y(s)})"><circle r="11" style="animation:lvPop .3s var(--ease-pop) ${t.toFixed(2)}s both,lvOut .3s ease ${(t + 1.2).toFixed(2)}s forwards"/></g>`;
      cues.push([t, () => playNote(midi)]);
    }
    if (lab) g += `<text class="lb" x="${FX(f)}" y="${Y(s) - 16}" style="animation:lvPop .3s ease ${t.toFixed(2)}s both,lvOut .3s ease ${(t + 1.2).toFixed(2)}s forwards">${lab}</text>`;
    last = [s, f];
  });
  return {d: tl + (sc.tail || 2), html: g + '</svg>'};
}
function lvBuild(spec) {
  const id = ++LVX.n, cues = [[1.8, () => playNote(40)]];
  let t = 3.4, html = `<div class="lv-sc" style="animation:lvIn .5s var(--ease-out) .1s forwards,lvOut .4s ease 3.1s forwards">
      <div class="lv-k" style="animation-delay:.3s">${spec.kick}</div>
      <div class="lv-h"><span style="animation-delay:.5s">${spec.h[0]}</span> <span style="animation-delay:.7s"><em>${spec.h[1]}</em></span></div>
      <div class="lv-s" style="animation-delay:1.4s">${spec.sub}</div>
      <svg class="lv-str" viewBox="0 0 400 20" preserveAspectRatio="none"><path d="M0 10H400"/></svg></div>`;
  spec.scenes.forEach((sc, si) => {
    const b = (sc.morph ? lvMorph : sc.rows ? lvBeats : sc.arp ? lvArp : sc.neck ? lvNeck : lvTiles)(t, sc, `${id}_${si}`, cues);
    const caps = sc.caps || [], d = Math.max(b.d, caps.length ? caps[caps.length - 1][0] + 3 : 0), last = si === spec.scenes.length - 1;
    html += `<div class="lv-sc lv-sc2" style="animation:lvIn .5s var(--ease-out) ${t.toFixed(2)}s forwards${last ? '' : `,lvOut .4s ease ${(t + d - .4).toFixed(2)}s forwards`}">${lvTop(sc)}${b.html}${lvCaps(t, caps)}</div>`;
    t += d;
  });
  return {t: spec.t, dur: Math.ceil(t + .5), html: () => html, cues: () => cues};
}


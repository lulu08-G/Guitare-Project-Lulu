/* ═══════ SVG: CHORD DIAGRAM ═══════ */
function chordSVG(ch, opt) {
  opt = opt || {};
  const hl = opt.hl || null;   // {anc:[[corde 0=grave, case]], vides:[corde]} : met en valeur l'ancre et les cordes à vide
  const sz = opt.size || 1, light = !!opt.light;
  const W = 68*sz, H = 82*sz, NF = 5;
  const ml = 13*sz, mt = 22*sz, cw = (W - ml - 8*sz)/5, rh = (H - mt - 8*sz)/NF;
  const frets = (ch && ch.frets) || [-1,-1,-1,-1,-1,-1];
  const fing  = (ch && ch.fingers) || [0,0,0,0,0,0];
  const played = frets.filter(f => f > 0);
  const minF = played.length ? Math.min(...played) : 1;
  const maxF = played.length ? Math.max(...played) : 1;
  const base = (ch && ch.base > 1) ? ch.base : (maxF > NF ? Math.max(1, minF) : 1);
  const gridC = light ? '#d6d0c8' : 'var(--cream4)';   // light = papier (impression) : les couleurs de l'appli sur fond blanc
  const nutC  = light ? '#121014' : 'var(--cream)';
  const dotC  = light ? '#ff8a2a' : 'var(--cream)';
  const mutC  = light ? '#8f8a86' : 'var(--cream3)';
  const dotT  = light ? '#121014' : 'var(--bg)';
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  if (base === 1) s += `<rect x="${ml}" y="${mt-3*sz}" width="${cw*5}" height="${3.5*sz}" rx="1.5" fill="${nutC}"/>`;
  else s += `<text x="${ml-6*sz}" y="${mt+rh/2+3*sz}" text-anchor="end" font-size="${8*sz}" fill="${mutC}" font-family="Inter,system-ui,sans-serif">${base}fr</text>`;
  for (let f = 0; f <= NF; f++) s += `<line x1="${ml}" y1="${mt+f*rh}" x2="${ml+cw*5}" y2="${mt+f*rh}" stroke="${gridC}" stroke-width="1"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${ml+i*cw}" y1="${mt}" x2="${ml+i*cw}" y2="${mt+NF*rh}" stroke="${gridC}" stroke-width="1"/>`;
  // barre bar
  const bf = barreFret(frets, fing);
  if (bf) {
    const idx = frets.map((f,i) => f === bf.fret ? i : -1).filter(i => i >= 0);
    const x1 = ml + Math.min(...idx)*cw, x2 = ml + Math.max(...idx)*cw;
    const y = mt + (bf.fret - base + .5)*rh;
    if (bf.fret - base + 1 >= 1 && bf.fret - base + 1 <= NF)
      s += `<rect x="${x1-4*sz}" y="${y-4*sz}" width="${x2-x1+8*sz}" height="${8*sz}" rx="${4*sz}" fill="${dotC}" opacity=".95"/>`;
  }
  frets.forEach((fr, i) => {
    const x = ml + i*cw;
    if (fr === -1) { s += `<text x="${x}" y="${mt-6*sz}" text-anchor="middle" font-size="${10*sz}" fill="${mutC}" font-family="Inter,system-ui,sans-serif">x</text>`; return; }
    if (fr === 0)  {
      if (hl && hl.vides && hl.vides.includes(i)) s += `<circle cx="${x}" cy="${mt-7*sz}" r="${5.6*sz}" fill="var(--sage)" opacity=".25"/><circle cx="${x}" cy="${mt-7*sz}" r="${3.9*sz}" fill="var(--sage)" stroke="var(--sage)" stroke-width="1.4"/>`;   // corde à vide qui résonne
      else s += `<circle cx="${x}" cy="${mt-7*sz}" r="${3.5*sz}" fill="none" stroke="${mutC}" stroke-width="1.4"/>`;
      return;
    }
    const d = fr - base + 1;
    if (d < 1 || d > NF) return;
    const y = mt + (d - .5)*rh;
    const anc = hl && hl.anc && hl.anc.some(a => a[0] === i && a[1] === fr);   // doigt d'ancre : ne bouge pas
    if (anc) s += `<circle cx="${x}" cy="${y}" r="${rh*.36 + 3.2*sz}" fill="none" stroke="var(--terra)" stroke-width="${1.8*sz}" opacity=".55"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${rh*.36}" fill="${anc ? 'var(--terra)' : dotC}"/>`;
    if (fing[i] > 0) s += `<text x="${x}" y="${y+3.2*sz}" text-anchor="middle" font-size="${9*sz}" font-weight="700" fill="${dotT}" font-family="Inter,system-ui,sans-serif">${fing[i]}</text>`;
  });
  return s + '</svg>';
}
function barreFret(frets, fing) {
  for (let f = 1; f <= 12; f++) {
    const idx = frets.map((v,i) => v === f ? i : -1).filter(i => i >= 0);
    if (idx.length >= 2 && idx.every(i => fing[i] === 1)) return {fret:f};
  }
  return null;
}


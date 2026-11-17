/* ═══════ SVG: ARPEGGIO / TAB STAFF (concatenated across a part's chords) ═══════ */
function tabStaffSVG(chords, light) {
  const segs = (chords||[]).filter(c => c.arp && c.arp.length && c.arp.some(st => st.length));
  if (!segs.length) return '';
  const disp = [5,4,3,2,1,0], lbl = ['e','B','G','D','A','E'];
  const ml = 20, cw = 30, mt = 22, lg = 14;
  const total = segs.reduce((a,c) => a + c.arp.length, 0);
  const W = ml + total*cw + 10, H = mt + lg*5 + 12;
  const lineC = light ? '#ddd' : 'var(--border2)';
  const labC  = light ? '#999' : 'var(--cream3)';
  const divC  = light ? '#888' : 'var(--cream4)';
  const nameC = light ? '#111' : 'var(--cream)';
  const dotT  = light ? '#fff' : 'var(--bg)';
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  disp.forEach((si, li) => {
    const y = mt + li*lg;
    s += `<text x="2" y="${y+3}" font-size="8" fill="${labC}" font-family="Inter,system-ui,sans-serif" font-weight="600">${lbl[li]}</text>`;
    s += `<line x1="${ml}" y1="${y}" x2="${W-5}" y2="${y}" stroke="${lineC}" stroke-width="1" stroke-dasharray="2,2"/>`;
  });
  let off = 0;
  segs.forEach((c, ci) => {
    const x0 = ml + off*cw;
    s += `<text x="${x0 + c.arp.length*cw/2}" y="12" text-anchor="middle" font-size="10" font-weight="700" fill="${nameC}" font-family="Inter,system-ui,sans-serif">${esc(c.name)}</text>`;
    if (ci > 0) s += `<line x1="${x0}" y1="${mt-8}" x2="${x0}" y2="${mt+lg*5+6}" stroke="${divC}" stroke-width="1.6"/>`;
    for (let t = 1; t < c.arp.length; t++) {
      const x = x0 + t*cw;
      s += `<line x1="${x}" y1="${mt-5}" x2="${x}" y2="${mt+lg*5+5}" stroke="${lineC}" stroke-width="1" stroke-dasharray="1,3"/>`;
    }
    c.arp.forEach((step, ti) => {
      const cx = x0 + ti*cw + cw/2;
      step.forEach(si => {
        const li = disp.indexOf(si); if (li < 0) return;
        const y = mt + li*lg;
        const fr = c.frets[si];
        s += `<circle cx="${cx}" cy="${y}" r="7" fill="${light ? '#c8783a' : 'var(--gold)'}"/>`;
        s += `<text x="${cx}" y="${y+3}" text-anchor="middle" font-size="8.5" fill="${dotT}" font-weight="700" font-family="Inter,system-ui,sans-serif">${fr <= 0 ? 0 : fr}</text>`;
      });
    });
    off += c.arp.length;
  });
  return s + '</svg>';
}


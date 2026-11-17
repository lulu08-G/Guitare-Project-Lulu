function metroLineHTML(rh, cursor, print) {
  rh = rhNorm(rh); const gs = rhGroups(rh), n = gs.length; if (!n) return '';
  const sw = Math.max(78, Math.min(104, 300 / n)), W = n * sw + 30, y = 74;
  const act = cursor == null ? -1 : gs.findIndex(g => cursor >= g.k0 && cursor <= g.k1 + 1);
  let svg = `<svg viewBox="0 0 ${W} ${print ? 140 : 160}" class="ml" role="img" aria-label="Rythme en ${n} groupe${n > 1 ? 's' : ''}">`;
  const xs = gs.map((g, i) => 15 + sw / 2 + i * sw);
  svg += `<path d="M${xs[0] - 10} ${y}H${xs[n - 1] + 10}" class="ml-line"/>`;
  svg += `<path d="M${xs[n - 1] + 10} ${y}H${W - 8}q8 0 8 8V${y + 52}q0 8 -8 8H${xs[0] - 14}q-8 0 -8 -8V${y + 8}q0 -8 8 -8h5" class="ml-loop"/>`;
  gs.forEach((g, i) => {
    const x = xs[i], on = i === act;
    const m = g.hits.length, step = Math.min(24, (sw - 14) / m), x0 = x - step * (m - 1) / 2;
    g.hits.forEach((d, j) => { const ax = x0 + j * step; svg += `<path class="ml-ar ${d === 'D' ? 'd' : 'u'}${on ? ' on' : ''}" d="${d === 'D' ? `M${ax} 18v28m-8 -9l8 10l8 -10` : `M${ax} 46v-28m-8 9l8 -10l8 10`}"/>`; });
    svg += `<circle cx="${x}" cy="${y}" r="13" class="ml-st${on ? ' on' : ''}"/><text x="${x}" y="${y + 5}" class="ml-n">${i + 1}</text>`;
    svg += `<text x="${x}" y="${y + 33}" class="ml-t">${rhGroupName(g.hits)}</text>`;
  });
  if (print) return svg + '</svg>';
  svg += `<text x="${W / 2}" y="${y + 80}" class="ml-b">↻ puis on recommence au 1</text></svg>`;
  return svg + `<div class="ml-key"><span class="d">↓ bas</span><span class="u">↑ haut</span></div>`;
}

/* ═══════ INTERACTIVE CHORD EDITOR (modal) ═══════ */
let ceState = null; // {pi, ci, chord}
function openChordEditor(pi, ci) {
  const chord = ci >= 0 ? clone(draft.parts[pi].chords[ci]) : newChord('');
  ceState = {pi, ci, chord, arpMode: !!(chord.arp && chord.arp.length)};
  $('m-chord').classList.remove('hide');
  renderCE();
}
function closeCE() { $('m-chord').classList.add('hide'); ceState = null; }
function renderCE() {
  const c = ceState.chord;
  $('m-chord-body').innerHTML = `
    <div class="modal-t">${ceState.ci >= 0 ? 'Modifier l’accord' : 'Créer mon accord'}</div>
    <div class="fg">
      <label>Nom — tape un accord connu, le diagramme se remplit</label>
      <input type="text" id="ce-name" value="${esc(c.name)}" placeholder="Am, F#m, Cmaj7..." autocomplete="off"
             oninput="ceName(this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();ceApplyLib(this.value)}">
      <div class="lib-hits" id="ce-hits"></div>
    </div>
    <div class="ce-grid" id="ce-grid">${chordEditorSVG(c)}</div>
    <div class="ce-row">
      <button class="btn btn-ghost btn-xs" onclick="ceBase(-1)">&#8592; case</button>
      <span style="font-size:12px;color:var(--cream3);font-weight:600">Départ : case ${c.base}</span>
      <button class="btn btn-ghost btn-xs" onclick="ceBase(1)">case &#8594;</button>
      <button class="btn btn-ghost btn-xs" onclick="ceClear()">Effacer</button>
      <button class="btn btn-ghost btn-xs" onclick="playChord(ceState.chord, draft.capo)">
        <svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21"/></svg> Écouter</button>
    </div>
    <div style="font-size:11px;color:var(--cream4);text-align:center;margin-top:6px">
      Touche une case = un doigt · au-dessus du sillet = corde à vide (O) ou muette (X) · retouche = enlever
    </div>

    <div class="mode-toggle" style="margin:18px 0 4px">
      <button type="button" class="mode-pill big ${!ceState.arpMode?'on':''}" onclick="ceSetMode(false)">
        <svg class="ico" viewBox="0 0 24 24"><path d="M8 6l10 6-10 6V6z" fill="currentColor" stroke="none"/></svg> Grattage
      </button>
      <button type="button" class="mode-pill big ${ceState.arpMode?'on':''}" onclick="ceSetMode(true)">
        <svg class="ico" viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.5" fill="currentColor" stroke="none"/><circle cx="18" cy="16" r="2.5" fill="currentColor" stroke="none"/><path d="M8.5 17V5l11-2v13"/></svg> Arpège (picking)
      </button>
    </div>
    ${ceState.arpMode ? `
    <div class="arp-panel">
      <div class="part-sub" style="margin-top:0"><span class="part-sub-t">Ordre des cordes jouées</span>
        <button class="add-btn" onclick="ceAddStep()">+ Temps</button></div>
      <p style="font-size:11px;color:var(--cream4);margin-bottom:8px">Coche les cordes jouées à chaque temps. Plusieurs cordes cochées sur le même temps = jouées ensemble.</p>
      <div class="arp-tl" id="ce-arp">${arpTimelineHTML(c)}</div>
    </div>` : ''}

    <div class="modal-f">
      ${ceState.ci >= 0 ? `<button class="btn btn-danger btn-sm" onclick="rmChord(${ceState.pi},${ceState.ci});closeCE()">Supprimer</button>` : ''}
      <div class="spacer"></div>
      <button class="btn btn-ghost btn-sm" onclick="closeCE()">Annuler</button>
      <button class="btn btn-primary btn-sm" onclick="saveCE()">Valider</button>
    </div>`;
  renderCEHits(c.name);
}
function ceName(v) {
  ceState.chord.name = v;
  renderCEHits(v);
  const lib = findChord(v);
  if (lib) ceApplyLib(v, true);
}
function renderCEHits(v) {
  const q = String(v||'').toLowerCase().trim();
  const hits = q ? LIB.filter(c => c.n.toLowerCase().startsWith(q)).slice(0, 14) : LIB.slice(0, 14);
  const h = $('ce-hits'); if (!h) return;
  h.innerHTML = hits.map(c => `<button class="lib-hit" onclick="ceApplyLib('${c.n}')">${c.n}</button>`).join('');
}
function ceApplyLib(n, silent) {
  const lib = findChord(n); if (!lib) return;
  const keepArp = ceState.chord.arp || [];
  ceState.chord = {...newChord(lib.n), id: ceState.chord.id, arp: keepArp};
  if (silent) { // only refresh the diagram, keep the caret in the name field
    $('ce-grid').innerHTML = chordEditorSVG(ceState.chord);
    const arpHost = $('ce-arp'); if (arpHost) arpHost.innerHTML = arpTimelineHTML(ceState.chord);
  } else renderCE();
}
function ceSetMode(isArp) {
  ceState.arpMode = isArp;
  if (isArp && (!ceState.chord.arp || !ceState.chord.arp.length)) ceState.chord.arp = [[]];
  if (!isArp) ceState.chord.arp = [];
  renderCE();
}
function chordEditorSVG(c) {
  const W = 190, H = 210, NF = 5, ml = 30, mt = 46, cw = (W - ml - 24)/5, rh = (H - mt - 18)/NF;
  let s = `<svg class="ce-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" onclick="ceClick(event)">`;
  s += `<rect width="${W}" height="${H}" fill="transparent"/>`;
  if (c.base === 1) s += `<rect x="${ml}" y="${mt-5}" width="${cw*5}" height="5" rx="2" fill="var(--cream4)"/>`;
  else s += `<text x="${ml-10}" y="${mt+rh/2+4}" text-anchor="end" font-size="11" fill="var(--cream3)" font-family="Inter,system-ui,sans-serif">${c.base}fr</text>`;
  for (let f = 0; f <= NF; f++) s += `<line x1="${ml}" y1="${mt+f*rh}" x2="${ml+cw*5}" y2="${mt+f*rh}" stroke="var(--border2)" stroke-width="1"/>`;
  for (let i = 0; i < 6; i++) {
    s += `<line x1="${ml+i*cw}" y1="${mt}" x2="${ml+i*cw}" y2="${mt+NF*rh}" stroke="var(--border2)" stroke-width="1"/>`;
    s += `<text x="${ml+i*cw}" y="${H-4}" text-anchor="middle" font-size="9" fill="var(--cream3)" font-family="Inter,system-ui,sans-serif">${STRINGS[i]}</text>`;
  }
  // open/mute zone
  c.frets.forEach((fr, i) => {
    const x = ml + i*cw;
    s += `<rect class="hit" data-s="${i}" data-f="0" x="${x-cw/2}" y="${mt-30}" width="${cw}" height="26" fill="transparent" rx="4"/>`;
    if (fr === -1) s += `<text x="${x}" y="${mt-11}" text-anchor="middle" font-size="14" fill="var(--terra)" font-family="Inter,system-ui,sans-serif" style="pointer-events:none">&times;</text>`;
    else if (fr === 0) s += `<circle cx="${x}" cy="${mt-16}" r="5.5" fill="none" stroke="var(--sage)" stroke-width="2" style="pointer-events:none"/>`;
  });
  const bf = barreFret(c.frets, c.fingers);
  if (bf) {
    const idx = c.frets.map((f,i) => f === bf.fret ? i : -1).filter(i => i >= 0);
    const d = bf.fret - c.base + 1;
    if (d >= 1 && d <= NF) {
      const x1 = ml + Math.min(...idx)*cw, x2 = ml + Math.max(...idx)*cw, y = mt + (d-.5)*rh;
      s += `<rect x="${x1-8}" y="${y-8}" width="${x2-x1+16}" height="16" rx="8" fill="var(--gold)" style="pointer-events:none"/>`;
    }
  }
  for (let i = 0; i < 6; i++) for (let f = 1; f <= NF; f++) {
    const x = ml + i*cw, y = mt + (f-.5)*rh;
    s += `<rect class="hit" data-s="${i}" data-f="${f}" x="${x-cw/2}" y="${y-rh/2}" width="${cw}" height="${rh}" fill="transparent" rx="4"/>`;
    if (c.frets[i] === c.base + f - 1) {
      s += `<circle cx="${x}" cy="${y}" r="${rh*.36}" fill="var(--gold)" style="pointer-events:none"/>`;
      if (c.fingers[i] > 0) s += `<text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)" font-family="Inter,system-ui,sans-serif" style="pointer-events:none">${c.fingers[i]}</text>`;
    }
  }
  return s + '</svg>';
}
function ceClick(e) {
  const hit = e.target.closest('.hit'); if (!hit) return;
  const si = +hit.dataset.s, f = +hit.dataset.f, c = ceState.chord;
  if (f === 0) c.frets[si] = c.frets[si] === 0 ? -1 : c.frets[si] === -1 ? 0 : 0; // cycles O → X → O
  else {
    const abs = c.base + f - 1;
    if (c.frets[si] === abs) { c.frets[si] = 0; c.fingers[si] = 0; }
    else { c.frets[si] = abs; c.fingers[si] = c.fingers[si] || autoFinger(c, si, abs); }
  }
  $('ce-grid').innerHTML = chordEditorSVG(c);
  const arpHost = $('ce-arp'); if (arpHost) arpHost.innerHTML = arpTimelineHTML(c);
}
function autoFinger(c, si, abs) {
  const others = c.frets.map((f,i) => ({f,i})).filter(o => o.f > 0 && o.i !== si);
  const lower = others.filter(o => o.f < abs).length;
  return Math.min(4, lower + 1);
}
function ceBase(d) {
  const c = ceState.chord;
  const nb = Math.max(1, Math.min(12, c.base + d));
  const shift = nb - c.base;
  c.base = nb;
  c.frets = c.frets.map(f => f > 0 ? Math.max(1, f + shift) : f);
  renderCE();
}
function ceClear() { ceState.chord.frets = [-1,-1,-1,-1,-1,-1]; ceState.chord.fingers = [0,0,0,0,0,0]; ceState.chord.arp = []; renderCE(); }
function saveCE() {
  const c = ceState.chord;
  if (!c.name.trim()) c.name = 'Accord';
  if (ceState.ci >= 0) draft.parts[ceState.pi].chords[ceState.ci] = c;
  else draft.parts[ceState.pi].chords.push(c);
  closeCE(); renderParts();
}

/* ── ARP TIMELINE (inside chord editor) ── */
function arpTimelineHTML(c) {
  const disp = [5,4,3,2,1,0], lbl = ['e','B','G','D','A','E'];
  if (!c.arp) c.arp = [];
  if (!c.arp.length) return `<div style="font-size:11px;color:var(--cream4);text-align:center;padding:6px">
    Clique "+ Temps" puis coche les cordes jouees a chaque temps (plusieurs cordes sur un temps = jouees ensemble).</div>`;
  let h = '';
  disp.forEach((si, li) => {
    h += `<div class="arp-tl-row"><span class="arp-tl-lbl">${lbl[li]}</span>` +
      c.arp.map((step, ti) => {
        const muted = c.frets[si] < 0;
        const on = step.includes(si);
        return `<button class="arp-cell ${on?'on':''} ${muted?'mute':''}" ${muted?'disabled':''} onclick="ceToggleArp(${ti},${si})">${on ? (c.frets[si] <= 0 ? 0 : c.frets[si]) : ''}</button>`;
      }).join('') + `</div>`;
  });
  h += `<div class="arp-tl-foot"><span class="arp-tl-lbl"></span>` +
    c.arp.map((_, ti) => `<button class="arp-step-rm" onclick="ceRmStep(${ti})" title="Supprimer ce temps">&times;</button>`).join('') + `</div>`;
  return h;
}
function ceAddStep() {
  const c = ceState.chord;
  if (!c.arp) c.arp = [];
  if (c.arp.length >= 16) return;
  c.arp.push([]);
  $('ce-arp').innerHTML = arpTimelineHTML(c);
}
function ceToggleArp(ti, si) {
  const step = ceState.chord.arp[ti];
  const k = step.indexOf(si);
  k >= 0 ? step.splice(k, 1) : step.push(si);
  $('ce-arp').innerHTML = arpTimelineHTML(ceState.chord);
}
function ceRmStep(ti) {
  ceState.chord.arp.splice(ti, 1);
  $('ce-arp').innerHTML = arpTimelineHTML(ceState.chord);
}


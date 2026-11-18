/* ═══════ HOME / CAHIER ═══════ */
function toggleHomeMenu(e) { e.stopPropagation(); $('hm-menu').classList.toggle('open'); }
function closeHomeMenu() { $('hm-menu').classList.remove('open'); }
document.addEventListener('click', e => { const m = $('hm-menu'); if (m && !m.contains(e.target)) m.classList.remove('open'); });
function toggleCardActs(id, e) { e.stopPropagation(); const c = document.querySelector(`.card[data-id="${id}"]`); if (c) c.classList.toggle('acts'); }
function toggleSelectMode() {
  selMode = !selMode;
  if (!selMode) selIds.clear();
  renderHome();
}
function startPrintPick() { if (!selMode) { selMode = true; selIds.clear(); } renderHome(); const b = $('cahier-bar'); if (b && b.scrollIntoView) b.scrollIntoView({block: 'nearest'}); }
function selAll() { const all = sheets.every(s => selIds.has(s.id)); selIds.clear(); if (!all) sheets.forEach(s => selIds.add(s.id)); renderHome(); }
function printSheet(id) { selIds = new Set([id]); openPrintModal(); }
function closePrintModal() { $('m-print').classList.add('hide'); if (!selMode && selIds.size) { selIds.clear(); renderHome(); } }
function toggleSel(id, e) {
  e.stopPropagation();
  selIds.has(id) ? selIds.delete(id) : selIds.add(id);
  renderHome();
}
function setHomeFilter(k) { homeFilter = k; renderHome(); }
function renderGreeting() {
  $('greet-count').textContent = `${sheets.length} fiche${sheets.length>1?'s':''}`;
}
function renderHome() {
  renderGreeting();
  const q = ($('q').value || '').toLowerCase().trim();
  const recentIds = new Set(sheets.slice().sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0)).slice(0, 8).map(s => s.id));
  document.querySelectorAll('#home-filters .filt').forEach(b => b.classList.toggle('on', b.dataset.f === homeFilter));
  const list = sheets
    .filter(s => !q || s.title.toLowerCase().includes(q) || (s.artist||'').toLowerCase().includes(q))
    .filter(s => homeFilter === 'all' ? true : homeFilter === 'fav' ? !!s.favorite : recentIds.has(s.id))
    .sort((a,b) => (b.updatedAt||0) - (a.updatedAt||0));
  { const k = selIds.size;
    $('sel-count').textContent = !selMode ? '' : k ? `${k} fiche${k>1?'s':''} cochée${k>1?'s':''}` : 'Coche les fiches du livret';
    $('cahier-bar').style.display = selMode ? '' : 'none';
    $('btn-print').disabled = !k; $('btn-export').disabled = !k;
    $('btn-print-t').textContent = k ? `Créer le PDF (${k})` : 'Créer le PDF';
    $('sel-all-btn').textContent = sheets.length && sheets.every(x => selIds.has(x.id)) ? 'Tout décocher' : 'Tout cocher';
    document.body.classList.toggle('sel-on', selMode); }
  { const bn = $('backup-nag'); if (bn) bn.innerHTML = !selMode && backupDue() ? `<div class="bk-nag"><span><b>Pense à sauvegarder tes fiches</b>Elles ne sont gardées que sur cet appareil.</span><button type="button" class="btn btn-primary btn-sm" onclick="backupAll()">Sauvegarder</button></div>` : ''; }
  $('filt-all').textContent = sheets.length ? `Toutes · ${sheets.length}` : 'Toutes';
  { const last = !selMode && !q && homeFilter === 'all' && sheets.length > 1 ? sheets.find(x => x.id === LS.get('gms_last')) : null;   // « Reprendre » : la dernière fiche ouverte
    const lc = last ? [...new Set((last.parts||[]).flatMap(p => p.chords.map(c => c.name)).filter(Boolean))].slice(0, 7).join(' · ') : '';
    $('resume-wrap').innerHTML = last ? `<div class="sec-lbl">Reprendre</div><div class="resume" role="button" tabindex="0" onclick="viewSheet('${last.id}')" onkeydown="if(event.key==='Enter')viewSheet('${last.id}')">
      <div class="resume-tx"><b>${esc(last.title)}</b><span>${esc([last.artist && last.artist !== '—' ? last.artist : '', last.capo > 0 ? 'Capo ' + last.capo : '', last.bpm ? last.bpm + ' BPM' : ''].filter(Boolean).join(' · ') || '—')}</span>${lc ? `<i>${esc(lc)}</i>` : ''}</div>
      <span class="resume-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg></span></div>` : ''; }
  const g = $('home-grid');
  if (!list.length) {
    const q0 = q, favE = !q0 && homeFilter === 'fav', recE = !q0 && homeFilter !== 'all' && homeFilter !== 'fav';
    const emT = !sheets.length ? 'Le cahier est vide' : favE ? 'Pas encore de favori' : recE ? 'Rien d’ouvert récemment' : 'Aucun résultat';
    const emP = !sheets.length ? 'Crée ta première fiche : un titre et trois accords suffisent.' : favE ? 'Touche le cœur d’une fiche pour la retrouver ici.' : recE ? 'Les fiches que tu ouvres apparaîtront ici.' : 'Essaie un autre mot ou un autre filtre.';
    g.innerHTML = `<div class="empty">
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--cream4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/></svg>
      <h3>${emT}</h3>
      <p>${emP}</p>
      ${sheets.length ? '' : '<button class="btn btn-primary" onclick="newSheet()">+ Créer une fiche</button>'}
    </div>`;
    return;
  }
  g.innerHTML = list.map(s => {
    const names = [...new Set((s.parts||[]).flatMap(p => p.chords.map(c => c.name)).filter(Boolean))].slice(0, 7).join(' · ');
    const ini = (s.title || '?').trim().replace(/^(le|la|les|l’|l'|un|une|des|the)\s+/i, '').charAt(0).toUpperCase() || '?';
    const meta = [s.artist && s.artist !== '—' ? s.artist : '', s.capo > 0 ? `Capo ${s.capo}` : '', s.bpm ? `${s.bpm} BPM` : ''].filter(Boolean).join(' · ');
    const ico = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
    return `<div class="card c-${s.color||'gold'} ${selIds.has(s.id)?'sel':''}${document.body.classList.contains('playing') && cur && cur.id === s.id ? ' cur' : ''}" data-id="${s.id}" onclick="${selMode?`toggleSel('${s.id}',event)`:`viewSheet('${s.id}')`}">
      <div class="card-row">
        ${selMode ? `<div class="chk ${selIds.has(s.id)?'on':''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg></div>` : ''}
        <div class="tile${s.favorite ? ' a' : ''}" aria-hidden="true">${esc(ini)}</div>
        <div class="card-txt">
          <h3>${esc(s.title)}</h3>
          <div class="sub">${esc(meta || '—')}</div>
          ${names ? `<div class="card-ch">${esc(names)}</div>` : ''}
        </div>
        ${selMode ? '' : `<button class="fav-btn ${s.favorite?'on':''}" onclick="event.stopPropagation();toggleFav('${s.id}',event)" title="Favori" aria-label="Favori"><svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg></button>
        <button class="card-more" onclick="toggleCardActs('${s.id}',event)" aria-label="Plus d’actions" title="Plus d’actions"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg></button>`}
      </div>
      <div class="card-acts">
        <button onclick="event.stopPropagation();editSheet('${s.id}')">Modifier</button>
        <button onclick="event.stopPropagation();dupSheet('${s.id}')">Dupliquer</button>
        <button onclick="event.stopPropagation();printSheet('${s.id}')">Créer un PDF</button>
        <button class="danger" onclick="event.stopPropagation();delSheet('${s.id}')">Supprimer</button>
      </div>
    </div>`;
  }).join('');
}


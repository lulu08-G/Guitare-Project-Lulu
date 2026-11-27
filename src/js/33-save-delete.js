/* ═══════ SAVE / DELETE ═══════ */
const normTitle = t => String(t||'').trim().replace(/\s+/g, ' ').toLowerCase();
const titleTaken = (t, exceptId) => sheets.some(x => x.id !== exceptId && normTitle(x.title) === normTitle(t));
function uniqueTitle(t, exceptId) {
  const base = String(t||'').trim().replace(/\s+/g, ' ').replace(/\s*\(\d+\)$/, '');
  let n = 2; while (titleTaken(`${base} (${n})`, exceptId)) n++;
  return `${base} (${n})`;
}
async function saveSheet() {
  draft.title = $('f-title').value.trim();
  draft.artist = $('f-artist').value.trim();
  if (!draft.title) { toast('Le titre est requis', true); $('f-title').focus(); return; }
  if (looksLikeChords(draft.title)) { toast('Ça ressemble à des accords : le titre est le nom du morceau, les accords se mettent plus bas', true); $('f-title').focus(); return; }
  stopPlay();
  draft.parts.forEach(p => {   // une partie a UNE façon de jouer : on ne garde que celle choisie, jamais une coquille vide
    const w = pWay(p);
    if (w !== 'rh') p.rhythm = null; if (w !== 'arp') p.arp = null;
    if (w === 'arp') p.way = 'arp'; else delete p.way;
  });
  if (REQUIRE_ARTIST && !draft.artist) { toast('Titre et artiste sont requis', true); $('f-artist').focus(); return; }
  if (!draft.artist) draft.artist = '—';
  // noms uniques : plusieurs fiches pour un même morceau, mais jamais deux fois le même titre
  while (titleTaken(draft.title, draft.id)) {
    const r = prompt(`Une fiche s’appelle déjà « ${draft.title} ».\nDonne un titre différent pour celle-ci :`, uniqueTitle(draft.title, draft.id));
    if (r == null) { $('f-title').focus(); return; }
    draft.title = r.trim().replace(/\s+/g, ' ') || uniqueTitle(draft.title, draft.id);
    $('f-title').value = draft.title;
  }
  const ou = origURL(draft.original && draft.original.url);
  if (ou) draft.original = {url: ou}; else delete draft.original;
  if (($('f-chords').value||'').trim()) addChordLine(); // accords tapés mais pas encore ajoutés
  draft.updatedAt = Date.now();
  const i = sheets.findIndex(s => s.id === draft.id);
  if (i >= 0) { // prises audio des parties supprimées : plus d’orphelins dans media
    const takes = p => [p.rec, ...(p.recAlt || [])].filter(Boolean);   // la prise sur la fiche + les autres prises du rythme (bêta)
    const keep = new Set((draft.parts||[]).flatMap(takes).map(r => r.mediaId));
    for (const p of (sheets[i].parts||[])) for (const r of takes(p)) if (!keep.has(r.mediaId)) { await DB.del('media', r.mediaId); delete recBuf[r.mediaId]; }
  }
  i >= 0 ? sheets[i] = clone(draft) : sheets.push(clone(draft));
  await DB.put('sheets', clone(draft));
  toast('Fiche enregistrée'); if (i < 0) animRangee(draft.title, sheetChords(draft));   // nouvelle fiche : elle file se ranger dans Fiches
  viewSheet(draft.id);
}
async function delSheet(id) {
  if (!confirm('Supprimer cette fiche ?')) return;
  const s = sheets.find(x => x.id === id);
  if (s) for (const m of (s.media||[])) await DB.del('media', m.mediaId);
  if (s) for (const p of (s.parts||[])) for (const r of [p.rec, ...(p.recAlt || [])]) if (r) await DB.del('media', r.mediaId);
  sheets = sheets.filter(x => x.id !== id);
  selIds.delete(id);
  await DB.del('sheets', id);
  go('home'); toast('Fiche supprimée');
}


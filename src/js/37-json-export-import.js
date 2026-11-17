/* ═══════ JSON EXPORT / IMPORT ═══════ */
function exportSel() {
  const list = sheets.filter(s => selIds.has(s.id)).map(s => {
    const c = clone(s); delete c.media; delete c.tabImage; (c.parts||[]).forEach(p => { delete p.rec; }); return c; // media blobs stay local
  });
  const blob = new Blob([JSON.stringify({app:'gms', v:2, sheets:list}, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cahier-guitare-${list.length}-fiches.json`;
  a.click(); URL.revokeObjectURL(a.href);
  toast(`${list.length} fiche${list.length > 1 ? 's' : ''} exportée${list.length > 1 ? 's' : ''}, sans les médias`);
}
function importJSON(inp) {
  const f = inp.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const d = JSON.parse(r.result);
      if (d && d.kind === 'backup' && Array.isArray(d.sheets)) { await restoreBackup(d); return; }
      const list = Array.isArray(d) ? d : d.sheets;
      if (!Array.isArray(list)) throw 0;
      let n = 0;
      for (const raw of list) {
        const s = {...newSheet_(), ...raw, id: uid(), updatedAt: Date.now()};
        s.media = []; s.tabImage = null; (s.parts||[]).forEach(p => { delete p.rec; });
        if (titleTaken(s.title)) s.title = uniqueTitle(s.title);
        if (!s.parts || !s.parts.length) s.parts = [newPart('')];
        sheets.push(s); await DB.put('sheets', s); n++;
      }
      renderHome(); toast(`${n} fiche${n > 1 ? 's' : ''} importée${n > 1 ? 's' : ''}`);
    } catch (e) { toast('Fichier illisible', true); }
  };
  r.readAsText(f); inp.value = '';
}

/* Sauvegarde complète : toutes les fiches + leurs médias (prises, images, audios) dans un seul fichier.
   La restauration remplace une fiche du même identifiant et ajoute les autres. */
const blobToData = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
async function backupAll() {
  try {
    const media = [];
    for (const m of await DB.all('media')) media.push({id: m.id, type: m.type || (m.blob && m.blob.type) || '', data: m.blob ? await blobToData(m.blob) : null});
    const data = {app: 'gms', v: 3, kind: 'backup', at: new Date().toISOString(), sheets: sheets.map(clone), media};
    const a = document.createElement('a'), d = new Date();
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'application/json'}));
    a.download = `guitare-sauvegarde-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    LS.set('gms_backup_at', Date.now()); LS.set('gms_backup_n', sheets.length);
    toast(`Sauvegarde prête : ${sheets.length} fiche${sheets.length > 1 ? 's' : ''}`); renderHome();
  } catch (e) { toast('La sauvegarde a échoué', true); }
}
async function restoreBackup(d) {
  const ids = new Set(sheets.map(s => s.id));
  for (const m of d.media || []) if (m && m.id && m.data) { const blob = await (await fetch(m.data)).blob(); await DB.put('media', {id: m.id, blob, type: m.type || blob.type}); }
  let add = 0, upd = 0;
  for (const s of d.sheets) {
    if (!s || !s.id) continue;
    if (ids.has(s.id)) { const k = sheets.findIndex(x => x.id === s.id); sheets[k] = s; upd++; } else { sheets.push(s); add++; }
    await DB.put('sheets', s);
  }
  renderHome(); toast(`Sauvegarde restaurée : ${add} ajoutée${add > 1 ? 's' : ''}, ${upd} mise${upd > 1 ? 's' : ''} à jour`);
}
// rappel discret dans Fiches : jamais sauvegardé, ou plus de 14 jours et des fiches ont changé
function backupDue() {
  if (sheets.length < 3) return false;
  const at = LS.get('gms_backup_at', 0), lastEdit = Math.max(0, ...sheets.map(s => s.updatedAt || 0));
  return !at || (Date.now() - at > 14 * 864e5 && lastEdit > at);
}
// demande au navigateur de ne pas effacer les données de l'app quand il manque de place
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()); } catch (e) {}

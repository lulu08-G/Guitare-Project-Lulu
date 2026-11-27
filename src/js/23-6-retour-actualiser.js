/* ═══════ RETOUR ET ACTUALISER (Lucas, 27/11) ═══════
   - Retour (bouton du téléphone ou du navigateur) = l'écran d'avant, rien d'autre. Ce qui est ouvert par-dessus
     (infobulle, caméra, choix « Créer », fenêtre, menu) se ferme d'abord.
   - Actualiser = on reste au même endroit : la fiche ouverte, l'éditeur avec la fiche en cours (gardée le temps
     de l'onglet, dans sessionStorage), la position dans la page.
   - Quitter l'éditeur sans avoir enregistré : Médi propose de garder la fiche (« tu pourras la modifier plus tard »). */
const NAV = {pop: false, force: false};
const NAV_KEEP = ['disc', 'home', 'sheet', 'ed', 'blocs', 'lib', 'tuner', 'metro', 'plus', 'privacy', 'cours', 'exo', 'labo'];
let edSnap = null;   // l'éditeur tel qu'il était à l'ouverture (pour savoir si on a changé quelque chose)
function navState(v) { return {v, id: v === 'sheet' && cur ? cur.id : v === 'ed' && draft ? draft.id : null}; }
function navSave(st) { try { sessionStorage.setItem('gms_nav', JSON.stringify(st)); } catch (e) {} }
function navPush(v) {
  const st = navState(v);
  navSave(st);
  if (NAV.pop) return;
  try {
    const h = history.state;
    if (h && h.v === st.v && h.id === st.id) return;
    if (h && h.v === 'ed') history.replaceState(st, '');   // l'éditeur quitté ne reste pas dans l'historique
    else history.pushState(st, '');
  } catch (e) {}
}
// ce qui est ouvert par-dessus l'écran : on le ferme (true si quelque chose a été fermé)
function navCloseTop() {
  if ($('ed-leave')) { edLeaveClose(); return true; }
  if ($('fp-cam')) { fpCamClose(); return true; }
  if ($('fp-pop')) { fpPopClose(); return true; }
  const ca = $('create-ask'); if (ca && ca.classList.contains('on')) { createAskClose(); return true; }
  const gr = $('fs-grp'); if (gr && gr.classList.contains('on')) { fsGroupsClose(); return true; }
  if (!$('m-rec').classList.contains('hide')) { rcClose(); return true; }
  if (!$('m-print').classList.contains('hide')) { closePrintModal(); return true; }
  if (!$('m-chord').classList.contains('hide')) { closeCE(); return true; }
  if (!$('m-media').classList.contains('hide')) { svRecClose(); return true; }
  if (curView === 'ed' && cp.ed) { cp.ed = false; const sh = $('cp-sheet'); if (sh) { sh.classList.remove('on'); sh.innerHTML = ''; } return true; }
  const sp = $('sv-pop'); if (sp && sp.classList.contains('on')) { svPop(false); return true; }
  const mn = document.querySelector('#sv-menu.open, .hm-menu.open, .pv-menu.open'); if (mn) { mn.classList.remove('open'); return true; }
  // les pages dans un écran : un mur ouvert, un test du Labo, un exercice
  if (curView === 'blocs' && blocCur) { blocBack(); return true; }
  if (curView === 'labo' && lab.view !== 'home') { labGo(lab.view === 'tests' || lab.view === 'tests26' ? 'home' : labGroup(lab.view).home); return true; }
  if (curView === 'exo' && exoCur) { exoBack(); return true; }
  return false;
}
function navTo(st, push) {
  st = st || {v: 'disc'};
  if (!push) NAV.pop = true;
  try {
    if (st.v === 'sheet' && st.id && sheets.some(s => s.id === st.id)) viewSheet(st.id);
    else if (st.v !== 'ed' && $('v-' + st.v)) go(st.v);
    else go(cur && st.v === 'ed' && sheets.some(s => s.id === cur.id) ? 'sheet' : 'home');
  } finally { NAV.pop = false; }
}
addEventListener('popstate', e => {
  const stay = () => { try { history.pushState(navState(curView), ''); } catch (_) {} };
  if (navCloseTop()) { stay(); return; }
  const st = e.state || {v: 'disc'};
  if (edDirty()) { stay(); edLeaveAsk(() => navTo(st, true)); return; }
  navTo(st);
});

/* ── l'éditeur : a-t-on changé quelque chose ? ── */
const edSnapOf = () => JSON.stringify([draft, ($('f-title') || {}).value || '', ($('f-artist') || {}).value || '']);
function edDirty() { return !!(draft && edSnap != null && curView === 'ed' && edSnapOf() !== edSnap); }
function edClean() { edSnap = null; try { sessionStorage.removeItem('gms_ed'); } catch (e) {} }
// Médi propose de garder la fiche avant de quitter
function edLeaveAsk(then) {
  edLeaveClose();
  const isNew = draft && !sheets.some(s => s.id === draft.id);
  const m = document.createElement('div'); m.id = 'ed-leave'; m.className = 'edl'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Fiche pas encore enregistrée');
  m.innerHTML = `<div class="edl-box" onclick="event.stopPropagation()"><h3>${isNew ? 'Ta fiche n’est pas encore enregistrée' : 'Tes changements ne sont pas enregistrés'}</h3>
    ${mediBulle('curieuse', isNew ? 'Je la garde pour toi ? Tu pourras la modifier plus tard.' : 'Je les garde pour toi ? Tu pourras toujours la modifier plus tard.', {size: 56, anim: 'vivant'})}
    <div class="edl-b"><button type="button" class="btn btn-primary" id="edl-keep">${isNew ? 'Garder ma fiche' : 'Garder les changements'}</button>
    <button type="button" class="btn btn-ghost" id="edl-quit">Quitter sans garder</button></div></div>`;
  m.addEventListener('click', edLeaveClose);   // toucher à côté : on reste dans l'éditeur
  document.body.appendChild(m);
  $('edl-keep').onclick = async () => {
    edLeaveClose();
    const t = $('f-title'); if (t && !t.value.trim()) t.value = titleTaken('Ma fiche', draft.id) ? uniqueTitle('Ma fiche', draft.id) : 'Ma fiche';
    await saveSheet();
    if (edSnap == null && then) { NAV.force = true; try { then(); } finally { NAV.force = false; } }
  };
  $('edl-quit').onclick = () => { edLeaveClose(); edClean(); rcCleanup(); stopPlay(); edBarReset(); NAV.force = true; try { then(); } finally { NAV.force = false; } };
}
function edLeaveClose() { const m = $('ed-leave'); if (m) m.remove(); }
addEventListener('keydown', e => { if (e.key === 'Escape' && $('ed-leave')) edLeaveClose(); });

/* ── actualiser : on garde l'endroit (et la fiche en cours dans l'éditeur) ── */
function navStash() {
  try {
    sessionStorage.setItem('gms_scroll', String(Math.round(scrollY)));
    if (curView === 'ed' && draft && edSnap != null) sessionStorage.setItem('gms_ed', JSON.stringify({draft, title: $('f-title').value, artist: $('f-artist').value, h: $('ed-title').textContent, snap: edSnap}));
    else sessionStorage.removeItem('gms_ed');
  } catch (e) {}
}
addEventListener('pagehide', navStash);
addEventListener('visibilitychange', () => { if (document.hidden) navStash(); });
function navRestore() {
  let st = null, y = 0;
  try { st = JSON.parse(sessionStorage.getItem('gms_nav') || 'null'); y = +sessionStorage.getItem('gms_scroll') || 0; } catch (e) {}
  NAV.pop = true;
  try {
    if (st && st.v === 'sheet' && sheets.some(s => s.id === st.id)) viewSheet(st.id);
    else if (st && st.v === 'ed' && edRestore()) y = 0;
    else if (st && NAV_KEEP.includes(st.v) && st.v !== 'ed' && $('v-' + st.v)) go(st.v);
    else { go('disc'); y = 0; }
  } catch (e) { go('disc'); y = 0; } finally { NAV.pop = false; }
  try { history.replaceState(navState(curView), ''); } catch (e) {}
  if (y > 0) setTimeout(() => scrollTo(0, y), 120);
  return !!(st && st.v !== 'disc' && curView === st.v);
}
function edRestore() {
  let d = null; try { d = JSON.parse(sessionStorage.getItem('gms_ed') || 'null'); } catch (e) {}
  if (!d || !d.draft) return false;
  draft = d.draft;
  openEditor(d.h || 'Nouvelle fiche');
  $('f-title').value = d.title || ''; $('f-artist').value = d.artist || '';
  edSnap = d.snap;   // toujours « pas enregistrée » : l'avertissement de Médi reste
  return true;
}

/* ═══════ 5 ESPACES : Fiches · Trouver · Créer · S'entraîner · Plus ═══════ */
const SPACE_OF = {disc:'trouver', home:'fiches', sheet:'fiches', atelier:'plus', tuto:'plus', tools:'plus', privacy:'plus', blocs:'train', exo:'train', cours:'train', lib:'plus', metro:'plus', tuner:'plus', import:'plus', plus:'plus', admin:'plus', labo:'plus'};
const SPACE_TITLE = {fiches:'Fiches', trouver:'Découvrir', creer:'Créer', train:'S’entraîner', plus:'Moi'};
const VIEW_TITLE = {labo:'Labo', atelier:'Tutos', tuto:'Recherche de tutos', tools:'Sites utiles', admin:'Admin', privacy:'Confidentialité', lib:'Accords', metro:'Métronome', tuner:'Accordeur', import:'Importer', ed:'Fiche'};
function navMark(v) {
  let sp = SPACE_OF[v] || 'fiches';
  if (v === 'ed') sp = (typeof draft !== 'undefined' && draft && sheets.some(x => x.id === draft.id)) ? 'fiches' : 'creer';
  ['fiches','trouver','creer','train','plus'].forEach(k => ['nl-','tb-'].forEach(p => { const b = $(p + k); if (b) { b.classList.toggle('on', k === sp); if (k === sp) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); } }));
  $('nav-title').textContent = VIEW_TITLE[v] || SPACE_TITLE[sp];
  tbPill(sp);
}
// pastille de la barre du bas : glisse sous l'onglet actif (transform seul)
let tbPillOn = false;
function tbPill(sp) {
  const pill = $('tb-pill'), b = $('tb-' + (sp || (typeof curView !== 'undefined' && SPACE_OF[curView]) || 'fiches')); if (!pill || !b || !b.offsetWidth) return;
  const x = b.offsetLeft + b.offsetWidth/2 - 14;
  if (!tbPillOn) { pill.classList.add('nt'); pill.style.transform = `translateX(${x}px)`; void pill.offsetWidth; pill.classList.remove('nt'); tbPillOn = true; }
  else pill.style.transform = `translateX(${x}px)`;
  pill.style.opacity = sp === 'creer' ? 0 : 1;
}
addEventListener('resize', () => { tbPillOn = false; const on = document.querySelector('#tabbar button.on'); if (on) tbPill(on.id.slice(3)); });
function goTrain() { go(SPACE_OF[curView] === 'train' ? curView : 'blocs'); }
let curView = 'home';
const SUBNAV = {
  train: [['blocs', 'Murs'], ['exo:feel', 'Suites d’accords'], ['exo:rhy', 'Rythmes']]
};
function renderSubnav(v) {
  curView = v;
  document.querySelectorAll('.subnav,.tr-head').forEach(e => e.remove());
  const sp = SPACE_OF[v], items = SUBNAV[sp]; if (!items) return;
  const view = $('v-' + v);
  const cur = v === 'exo' ? 'exo:' + (typeof exoMode !== 'undefined' && exoMode === 'rhy' ? 'rhy' : 'feel') : v;
  const el = document.createElement('div'); el.className = 'subnav seg-big tr-seg'; el.setAttribute('role', 'tablist');
  el.innerHTML = items.map(([k, l]) => { const [vv, m] = k.split(':'), on = k === cur;
    const act = m ? `rccStop();feelStop();exoCur=null;exoMode='${m}';${m === 'rhy' ? 'rcz.cur=null;' : ''}go('exo');exoRender()` : `go('${vv}')`;
    return `<button type="button" role="tab" aria-selected="${on}" class="${on ? 'on' : ''}" onclick="${act}">${l}</button>`; }).join('');
  const hd = document.createElement('div'); hd.className = 'tr-head';
  hd.innerHTML = `<h1>Débloque ton jeu</h1>${fsBeta() ? accPill() : ''}<button type="button" class="btn-icon tr-metro" onclick="go('metro')" aria-label="Métronome"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3 H16 L20 21 H4 Z"/><path class="o" d="M12 16 L17 6"/></svg></button>`;
  view.insertBefore(el, view.firstChild); view.insertBefore(hd, el);
}
// Moi : outils, mes fiches, l'appli
const IS_ADMIN = (() => { try { const q = new URLSearchParams(location.search); if (q.has('admin')) LS.set('gms_admin', q.get('admin') !== '0'); } catch (e) {} return !!LS.get('gms_admin', false); })();
function renderPlus() {   // « Moi » : outils, mes fiches, l'appli (refonte du 18/11)
  const ic = d => `<span class="mo-i"><svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg></span>`;
  const CH = '<svg class="chev" viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2 L8 8 L2 14"/></svg>';
  const row = (act, i, t, d) => `<button type="button" class="mo-row" onclick="${act}">${ic(i)}<span class="mo-t"><b>${t}</b><small>${d}</small></span>${CH}</button>`;
  const grp = (t, rows) => `<section class="mo-g"><h2>${t}</h2><div class="mo-box">${rows.join('')}</div></section>`;
  const at = LS.get('gms_backup_at', 0), days = at ? Math.floor((Date.now() - at) / 864e5) : -1;
  const bk = days < 0 ? 'Jamais sauvegardé sur cet appareil' : days === 0 ? 'Dernière sauvegarde : aujourd’hui' : `Dernière sauvegarde : il y a ${days} jour${days > 1 ? 's' : ''}`;
  let h = grp('Outils', [
    row("go('tuner')", '<path d="M4 16a8 8 0 0116 0"/><path d="M12 16l4-6"/><circle cx="12" cy="16" r="1.3"/>', 'Accordeur', 'Accorde ta guitare au micro'),
    row("go('metro')", '<path d="M8 21h8l-2-17h-4z"/><path d="M12 15l5-8"/>', 'Métronome et bande', 'Le tempo, ou Boum et Basile'),
    row("go('lib')", '<path d="M6 3v18M12 3v18M18 3v18M3 8h18M3 14h18"/>', 'Accords', 'Tous les doigtés, à écouter'),
    row("go('atelier')", '<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10.2 9.2l4.6 2.8-4.6 2.8z"/>', 'Tutos', 'Chercher un tuto pour un morceau')]);
  h += grp('Mes fiches', [
    row('backupAll()', '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', 'Sauvegarder toutes mes fiches', bk),
    row("document.getElementById('json-in').click()", '<path d="M12 21V9M7 14l5-5 5 5M4 4h16"/>', 'Restaurer ou importer', 'Depuis un fichier de sauvegarde'),
    row("go('home');startPrintPick()", '<path d="M14 3H6.5A1.5 1.5 0 005 4.5v15A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V8z"/><path d="M14 3v5h5"/>', 'Créer mon cahier en PDF', 'Tes fiches, prêtes à imprimer')]);
  h += grp('L’appli', [
    row("go('privacy')", '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>', 'Confidentialité', 'Tes fiches restent sur ton téléphone')]);
  if (IS_BETA) h += grp('Tests', [
    row("go('labo')", '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/><path d="M7.5 15h9"/>', 'Labo de tests', 'Essaie des idées et donne ton avis')]);
  if (IS_ADMIN) h += grp('Admin et bêta', [
    row("go('admin')", '<rect x="3" y="4" width="18" height="13" rx="3"/><path d="M8 21h8M12 17v4"/>', 'Admin', 'Les vidéos des cours'),
    row("go('tuto')", '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>', 'Recherche de tutos', 'L’ancien écran de recherche (bêta)'),
    row("go('import')", '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', 'Importer', 'Depuis une tab ou un texte (bêta)'),
    row("go('tools')", '<path d="M14.7 6.3a4 4 0 00-5 5L3 18l3 3 6.7-6.7a4 4 0 005-5l-2.4 2.4-2.3-.7-.7-2.3z"/>', 'Sites utiles', 'Les bons sites de guitare (bêta)')]);
  $('plus-body').innerHTML = h;
}


/* ═══════ 5 ESPACES : Fiches · Trouver · Créer · S'entraîner · Plus ═══════ */
const SPACE_OF = {disc:'trouver', home:'fiches', sheet:'fiches', atelier:'plus', tuto:'plus', tools:'plus', blocs:'train', exo:'train', cours:'train', lib:'plus', metro:'plus', tuner:'plus', import:'plus', plus:'plus', admin:'plus'};
const SPACE_TITLE = {fiches:'Fiches', trouver:'Découvrir', creer:'Créer', train:'S’entraîner', plus:'Plus'};
const VIEW_TITLE = {atelier:'Tutos', tuto:'Recherche de tutos', tools:'Sites utiles', admin:'Admin', lib:'Accords', metro:'Métronome', tuner:'Accordeur', import:'Importer', ed:'Fiche'};
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
  train: [['blocs','Débloque ton jeu'],['exo','Jouer']]
};
function renderSubnav(v) {
  curView = v;
  document.querySelectorAll('.subnav').forEach(e => e.remove());
  const sp = SPACE_OF[v], items = SUBNAV[sp]; if (!items) return;
  const el = document.createElement('div'); el.className = 'subnav'; el.setAttribute('role', 'tablist');
  el.innerHTML = items.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === v}" class="${k === v ? 'on' : ''}" onclick="${k === 'cours' ? 'coursList()' : `go('${k}')`}">${l}</button>`).join('');
  if (sp === 'train') el.classList.add('seg-big');
  const view = $('v-' + v); view.insertBefore(el, view.firstChild);
}
function renderPlus() {
  const ic = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
  const items = [
    ['atelier','Tutos','Chercher un tuto et faire la fiche',ic('<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10.2 9.2l4.6 2.8-4.6 2.8z"/>')],
    ['tuner','Accordeur','Accorder la guitare au micro',ic('<path d="M4 16a8 8 0 0116 0"/><path d="M12 16l4-6"/><circle cx="12" cy="16" r="1.3"/>')],
    ['lib','Accords','Bibliothèque de diagrammes',ic('<path d="M6 3v18M12 3v18M18 3v18M3 8h18M3 14h18"/>')],
    ['metro','Métronome','Tempo et rythmes',ic('<path d="M8 21h8l-2-17h-4z"/><path d="M12 15l5-8"/>')],
    ['admin','Admin','Les vidéos des cours',ic('<rect x="3" y="4" width="18" height="13" rx="3"/><path d="M8 21h8M12 17v4"/>')]];
  // écrans pas encore au niveau du cœur de l'appli : rangés ici, hors de la navigation principale
  const beta = [
    ['tuto','Recherche de tutos','L’ancien écran de recherche',ic('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>')],
    ['import','Importer','Depuis une tab ou un texte',ic('<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>')],
    ['tools','Sites utiles','Les bons sites de guitare',ic('<path d="M14.7 6.3a4 4 0 00-5 5L3 18l3 3 6.7-6.7a4 4 0 005-5l-2.4 2.4-2.3-.7-.7-2.3z"/>')]];
  const grid = l => '<div class="more-grid">' + l.map(([k,n,d,i]) => `<button type="button" onclick="go('${k}')">${i}<span><b>${n}</b><small>${d}</small></span></button>`).join('') + '</div>';
  $('plus-body').innerHTML = grid(items) + '<div class="more-beta"><h2>En rodage <span>bêta</span></h2><p>Ces écrans fonctionnent, mais ne sont pas encore finis.</p></div>' + grid(beta);
}


/* ═══════ ÉCRAN FICHES, VERSION BÊTA (Lucas, 26/11) ═══════
   Seulement avec ?beta (classe « beta » sur <body>). Maquette validée : https://claude.ai/artifact/5o6CGV5J7fQ44ZJukEmn6S
   - la pilule orange « Accordeur » (logo : l'arc + Médi en aiguille) dans Découvrir, Fiches et S'entraîner ;
   - « Mes fiches » plus petit, le PDF retiré du haut ;
   - filtres : Tout · Favoris (« Je sais / J'apprends » cachés) ;
   - l'encart de Médi qui défile tout seul (6 s, fondu doux) ou au doigt : « Le rejouer » et « Mon carnet ». */
function fsBeta() { try { return IS_BETA; } catch (e) { return !!LS.get('gms_beta', false); } }
const FS_BODY = 'M100 214 C88 214 20 128 15 78 C10 32 48 8 100 8 C152 8 190 32 185 78 C180 128 112 214 100 214 Z';
function accPill() {
  return `<button type="button" class="acc-pill" onclick="go('tuner')" aria-label="Accordeur"><span class="acc-w"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="acc-arc" d="M4 17.5 A8 8 0 0 1 20 17.5"/><path class="acc-tk" d="M12 3.6v2.6"/><g class="acc-n"><path transform="translate(7.3 9.4) scale(.047)" d="${FS_BODY}"/></g></svg></span>Accordeur</button>`;
}
const FS_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>';
// filtres : Tout · Favoris
function fsFilters() {
  if (homeFilter === 'know' || homeFilter === 'learn') homeFilter = 'all';
  const fa = $('filt-all'), fv = document.querySelector('#home-filters .filt[data-f="fav"]');
  if (fa) fa.textContent = `Tout · ${sheets.length}`;
  if (fv) fv.innerHTML = `${FS_HEART}Favoris · ${sheets.filter(s => s.favorite).length}`;
  // les groupes créés depuis une fiche (le « + » à côté du cœur), à la suite de Favoris
  const host = $('home-filters'); if (!host) return;
  host.querySelectorAll('.fsg-f').forEach(b => b.remove());
  host.insertAdjacentHTML('beforeend', fsGroupsAll().map(g => { const n = sheets.filter(s => (s.groups || []).includes(g.id)).length, k = 'g:' + g.id;
    return `<button type="button" class="filt fsg-f${homeFilter === k ? ' on' : ''}" data-f="${k}" onclick="setHomeFilter('${k}')">${fsGIcon(g.ic)}${esc(g.n)} · ${n}</button>`; }).join(''));
}
// l'encart de Médi : un ou plusieurs messages qui défilent
const fsN = {i: 0, t: null};
function fsNudge(old, carnet) {
  const w = $('resume-wrap'); if (!w) return;
  clearTimeout(fsN.t);
  const sl = [];
  if (old) sl.push(`<p>${esc(old.s.title)} t’attend depuis ${old.d} jours. Cinq minutes ce soir ?</p><button type="button" class="btn btn-primary btn-sm" onclick="viewSheet('${old.s.id}')">Le rejouer</button>`);
  if (carnet) sl.push(`<p>Tes morceaux dans un carnet : à imprimer, ou à garder sans internet.</p><button type="button" class="btn btn-primary btn-sm" onclick="startPrintPick()">Mon carnet</button>`);
  if (!sl.length) { w.innerHTML = ''; return; }
  fsN.i = 0;
  w.innerHTML = `<section class="hm-nudge fs-nd">${mediSVG('neutre', {size: 52, anim: 'vivant', label: 'Médi'})}<div class="fs-vp">${sl.map((h, k) => `<div class="fs-sl${k ? '' : ' on'}"${k ? ' aria-hidden="true"' : ''}>${h}</div>`).join('')}</div></section>`;
  if (sl.length > 1) fsSwipe(w.querySelector('.fs-nd'));
  fsNext();
}
function fsNext() {
  clearTimeout(fsN.t);
  fsN.t = setTimeout(() => {
    const nd = document.querySelector('#resume-wrap .fs-nd');
    if (!nd || nd.querySelectorAll('.fs-sl').length < 2) return;
    if (document.hidden || !$('v-home').classList.contains('on') || nd.matches(':hover')) return fsNext();
    fsShow(nd, fsN.i + 1, 1);
  }, 6000);
}
// un vrai carrousel (Lucas, 27/11) : le message sort d'un côté, le suivant entre par l'autre (dir 1 = vers la gauche)
function fsShow(nd, n, dir, dragged) {
  const sl = [...nd.querySelectorAll('.fs-sl')], old = sl[fsN.i];
  dir = dir || 1;
  fsN.i = (n + sl.length) % sl.length;
  const nw = sl[fsN.i]; if (nw === old) return fsNext();
  clearTimeout(nw._t); nw.classList.remove('out-l', 'out-r', 'drag');
  if (!dragged) { nw.style.transition = 'none'; nw.style.transform = `translateX(${dir > 0 ? 110 : -110}%)`; nw.style.visibility = 'visible'; void nw.offsetWidth; nw.style.transition = ''; }
  nw.style.transform = ''; nw.classList.add('on'); nw.removeAttribute('aria-hidden');
  old.classList.remove('on', 'drag'); old.style.transform = ''; old.classList.add(dir > 0 ? 'out-l' : 'out-r'); old.setAttribute('aria-hidden', 'true');
  clearTimeout(old._t); old._t = setTimeout(() => { old.classList.remove('out-l', 'out-r'); old.style.visibility = ''; }, 650);
  setTimeout(() => { nw.style.visibility = ''; }, 650);
  const m = nd.querySelector('svg.medi');
  if (m) { m.classList.remove('nod'); void m.getBoundingClientRect(); m.classList.add('nod', 'look');
    setTimeout(() => m.classList.remove('nod'), 950); setTimeout(() => m.classList.remove('look'), 1300); }
  fsNext();
}
function fsSwipe(nd) {
  let x0 = null, dx = 0, moved = false, nb = null;
  const vp = nd.querySelector('.fs-vp'), all = () => [...nd.querySelectorAll('.fs-sl')], cur = () => all()[fsN.i];
  const neighbour = () => { const sl = all(), L = sl.length; return sl[(fsN.i + (dx < 0 ? 1 : -1) + L) % L]; };
  nd.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; moved = false; nb = null; });
  nd.addEventListener('pointermove', e => {
    if (x0 == null) return; dx = e.clientX - x0;
    if (!moved && Math.abs(dx) > 10) { moved = true; clearTimeout(fsN.t); cur().classList.add('drag'); try { nd.setPointerCapture(e.pointerId); } catch (_) {} }
    if (!moved) return;
    const W = vp.clientWidth, c = cur(); c.style.transform = `translateX(${dx}px)`;
    const n = neighbour(); if (n === c) return;
    if (nb && nb !== n) { nb.classList.remove('drag'); nb.style.transform = ''; nb.style.visibility = ''; }
    nb = n; clearTimeout(nb._t); nb.classList.remove('out-l', 'out-r'); nb.classList.add('drag'); nb.style.visibility = 'visible';
    nb.style.transform = `translateX(${dx + (dx < 0 ? W : -W)}px)`;
  });
  const end = () => {
    if (x0 == null) return; x0 = null; if (!moved) return;
    const c = cur(); c.classList.remove('drag'); if (nb) nb.classList.remove('drag');
    if (Math.abs(dx) > 40) { const d = dx < 0 ? 1 : -1; fsShow(nd, fsN.i + d, d, true); }
    else {   // pas assez loin : tout revient en place
      c.style.transform = '';
      if (nb) { const b = nb; b.style.transform = `translateX(${dx < 0 ? 110 : -110}%)`; b._t = setTimeout(() => { b.style.transform = ''; b.style.visibility = ''; }, 600); }
      fsNext();
    }
    nb = null;
    nd._noClick = true; setTimeout(() => nd._noClick = false, 0);
  };
  nd.addEventListener('pointerup', end); nd.addEventListener('pointercancel', end);
  nd.addEventListener('click', e => { if (nd._noClick) { e.stopPropagation(); e.preventDefault(); } }, true);
}
// au lancement : la classe sur <body> et les pilules dans les en-têtes fixes
(function fsInit() {
  if (!fsBeta()) return;
  document.body.classList.add('beta');
  const hm = $('hm-menu'); if (hm) hm.insertAdjacentHTML('beforebegin', accPill());
  const dt = document.querySelector('#v-disc .hm-top .tun-btn'); if (dt) dt.insertAdjacentHTML('beforebegin', accPill());
})();

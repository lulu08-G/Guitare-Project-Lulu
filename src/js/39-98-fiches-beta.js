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
    fsShow(nd, fsN.i + 1);
  }, 6000);
}
function fsShow(nd, n) {
  const sl = [...nd.querySelectorAll('.fs-sl')], old = sl[fsN.i];
  fsN.i = (n + sl.length) % sl.length;
  const nw = sl[fsN.i]; if (nw === old) return fsNext();
  old.classList.remove('on', 'drag'); old.style.transform = old.style.opacity = ''; old.classList.add('out'); old.setAttribute('aria-hidden', 'true');
  setTimeout(() => old.classList.remove('out'), 700);
  nw.classList.remove('out', 'drag'); nw.style.transform = nw.style.opacity = ''; nw.classList.add('on'); nw.removeAttribute('aria-hidden');
  const m = nd.querySelector('svg.medi');
  if (m) { m.classList.remove('nod'); void m.getBoundingClientRect(); m.classList.add('nod', 'look');
    setTimeout(() => m.classList.remove('nod'), 950); setTimeout(() => m.classList.remove('look'), 1300); }
  fsNext();
}
function fsSwipe(nd) {
  let x0 = null, dx = 0, moved = false;
  const cur = () => nd.querySelectorAll('.fs-sl')[fsN.i];
  nd.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; moved = false; });
  nd.addEventListener('pointermove', e => {
    if (x0 == null) return; dx = e.clientX - x0;
    if (!moved && Math.abs(dx) > 10) { moved = true; clearTimeout(fsN.t); cur().classList.add('drag'); try { nd.setPointerCapture(e.pointerId); } catch (_) {} }
    if (moved) { const c = cur(); c.style.transform = `translateX(${dx * .6}px)`; c.style.opacity = String(Math.max(.2, 1 - Math.abs(dx) / 220)); }
  });
  const end = () => {
    if (x0 == null) return; x0 = null; if (!moved) return;
    const c = cur(); c.classList.remove('drag');
    if (Math.abs(dx) > 40) fsShow(nd, dx < 0 ? fsN.i + 1 : fsN.i - 1);
    else { c.style.transform = c.style.opacity = ''; fsNext(); }
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

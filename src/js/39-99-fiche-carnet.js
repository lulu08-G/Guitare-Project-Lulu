/* ═══════ L'INTÉRIEUR DE LA FICHE, VERSION BÊTA (Lucas, 27/11) ═══════
   Seulement avec ?beta. En haut : « Mon carnet » (blanc, à la place du logo PDF), le cœur avec un « + » pour ranger la
   fiche dans des groupes, un crayon pour modifier la fiche (à la place du volume sur téléphone).
   Sous le titre : l'encart orange « En rythme » à la place de « J'apprends / Je sais la jouer » et du bouton Mode jeu.
   Sur chaque partie : « Simplifier » à la place de « modifier » (des doigtés sans barré, affichage seulement).
   Les groupes (comme Favoris) : LS gms_groups = [{id, n, ic}], la fiche garde s.groups = [id…] ; ils s'ajoutent
   aux filtres de Fiches. */

/* ── Simplifier les accords : on garde l'accord de base (sans 7, sus, add, ni basse après « / »), et un barré
   devient une petite forme sur 4 cordes (mêmes notes). ── */
const FS_EASY = {   // [cordes du Mi grave au Mi aigu (-1 = pas jouée)], [doigts]
  'F': [[-1, -1, 3, 2, 1, 1], [0, 0, 3, 2, 1, 1]], 'Fm': [[-1, -1, 3, 1, 1, 1], [0, 0, 3, 1, 1, 1]],
  'F#': [[-1, -1, 4, 3, 2, 2], [0, 0, 3, 2, 1, 1]], 'F#m': [[-1, -1, 4, 2, 2, 2], [0, 0, 3, 1, 1, 1]],
  'G#': [[-1, -1, 1, 1, 1, 4], [0, 0, 1, 1, 1, 4]], 'G#m': [[-1, -1, 1, 1, 0, 4], [0, 0, 1, 2, 0, 4]],
  'Gm': [[-1, -1, 0, 3, 3, 3], [0, 0, 0, 2, 3, 4]],
  'A#': [[-1, -1, 0, 3, 3, 1], [0, 0, 0, 3, 4, 1]], 'A#m': [[-1, -1, 3, 3, 2, 1], [0, 0, 3, 4, 2, 1]],
  'B': [[-1, -1, 4, 4, 4, 2], [0, 0, 2, 3, 4, 1]], 'Bm': [[-1, -1, 4, 4, 3, 2], [0, 0, 3, 4, 2, 1]],
  'C#': [[-1, -1, 3, 1, 2, 1], [0, 0, 3, 1, 2, 1]], 'C#m': [[-1, -1, 2, 1, 2, 0], [0, 0, 2, 1, 3, 0]],
  'Cm': [[-1, -1, 1, 0, 1, 3], [0, 0, 1, 0, 2, 4]],
  'D#': [[-1, -1, 1, 3, 4, 3], [0, 0, 1, 2, 4, 3]], 'D#m': [[-1, -1, 1, 3, 4, 2], [0, 0, 1, 3, 4, 2]]
};
const FS_SHARP = {Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#'};
function fsSimpName(name) {
  const m = String(name || '').split('/')[0].match(/^([A-G][#b]?)(.*)$/); if (!m) return null;
  const q = m[2];
  if (/dim|aug|°|\+/.test(q)) return null;
  return m[1] + (/^m(?!aj)/.test(q) ? 'm' : '');
}
function fsSimp(c) {
  const t = fsSimpName(c.name); if (!t) return c;
  const own = findChord(c.name);   // déjà une forme ouverte sans barré (B7, Cadd9, Asus2…) : on la garde
  if (own && !own.barre && !String(c.name).includes('/')) return c;
  const root = t.replace(/m$/, ''), key = (FS_SHARP[root] || root) + (t.endsWith('m') ? 'm' : '');
  let f, g;
  if (FS_EASY[key]) [f, g] = FS_EASY[key];
  else { const lib = findChord(t); if (!lib || lib.barre) return c; f = lib.f; g = lib.g || [0, 0, 0, 0, 0, 0]; }
  if (t === c.name && String(f) === String(c.frets)) return c;
  return Object.assign({}, c, {name: t, frets: f.slice(), fingers: g.slice(), base: 1, simp: true, orig: c.name});
}
function fsSimpBtn(p) {
  const can = (p.chords || []).some(c => fsSimp(c) !== c);
  if (!can && !FB.simp) return '';
  return `<button type="button" class="fs-simp${FB.simp ? ' on' : ''}" onclick="fsSimpToggle(event)" aria-pressed="${FB.simp}">${FB.simp ? 'Accords d’origine' : 'Simplifier'}</button>`;
}
function fsSimpToggle(e) {
  if (e) e.stopPropagation();
  FB.simp = !FB.simp; LS.set('gms_fb_simp', FB.simp);
  if (cur) viewSheet(cur.id, svAll ? null : svPart);
  toast(FB.simp ? 'Accords simplifiés : sans barré, sans 7 ni sus.' : 'Les accords d’origine sont revenus.');
}

/* ── L'encart « En rythme » ── */
function fsLiveSync() {
  const b = $('fs-live'); if (!b) return;
  b.classList.toggle('on', FB.live); b.setAttribute('aria-pressed', FB.live);
  b.querySelector('small').textContent = FB.live ? 'Touche le dessin pour jouer.' : 'Joue la fiche avec Médi.';
}

/* ── Les groupes ── */
const FS_GIC = {
  cible: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.2"/><circle class="f" cx="12" cy="12" r="1.3"/>',
  livre: '<path d="M4 5.5c2.6-1 5.4-1 8 .6 2.6-1.6 5.4-1.6 8-.6v13c-2.6-1-5.4-1-8 .6-2.6-1.6-5.4-1.6-8-.6zM12 6.1v13"/>',
  etoile: '<path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.6l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
  feu: '<path d="M12 21c-3.8 0-6.4-2.6-6.4-6.1 0-3.4 2.6-5.3 3.6-8.3.9 1.6 1.6 2.6 2.9 3.2.1-2.3 1-4.4 2.9-6.2.3 3.1 3.4 5.4 3.4 10.3 0 4.2-2.6 7.1-6.4 7.1z"/>',
  note: '<path d="M9 18V6.2l10-2V16"/><circle class="f" cx="6.6" cy="18" r="2.5"/><circle class="f" cx="16.6" cy="16" r="2.5"/>',
  lune: '<path d="M19.5 14.6A7.8 7.8 0 019.4 4.5a7.8 7.8 0 1010.1 10.1z"/>'
};
const FS_GSUG = [['À apprendre', 'cible'], ['À étudier', 'livre'], ['Feu de camp', 'feu']];
const fsGroupsAll = () => { const g = LS.get('gms_groups', []); return Array.isArray(g) ? g : []; };
const fsGIcon = k => `<svg class="fsg-ic" viewBox="0 0 24 24" aria-hidden="true">${FS_GIC[k] || FS_GIC.etoile}</svg>`;
const FS_HEART_O = '<svg class="fsg-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>';
let fsGPick = 'cible';
function fsGroups(e) {
  if (e) e.stopPropagation();
  if (!cur) return;
  let m = $('fs-grp');
  if (!m) {
    m = document.createElement('div'); m.id = 'fs-grp'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Ranger la fiche');
    m.addEventListener('click', ev => { if (ev.target === m) fsGroupsClose(); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') fsGroupsClose(); });
    document.body.appendChild(m);
  }
  fsGroupsRender();
  m.classList.add('on');
}
function fsGroupsClose() { const m = $('fs-grp'); if (m) m.classList.remove('on'); }
function fsGroupsRender() {
  const m = $('fs-grp'); if (!m || !cur) return;
  const gs = fsGroupsAll(), mine = cur.groups || [];
  const row = (on, ic, n, act) => `<button type="button" class="fsg-row${on ? ' on' : ''}" aria-pressed="${on}" onclick="${act}">${ic}<span>${esc(n)}</span><i class="fsg-ck" aria-hidden="true"></i></button>`;
  m.innerHTML = `<div class="fsg-box"><div class="ca-grab"></div>
    <h3>Ranger « ${esc(cur.title)} »</h3>
    <div class="fsg-list">${row(!!cur.favorite, FS_HEART_O, 'Favoris', 'fsFavTog()')}${gs.map(g => row(mine.includes(g.id), fsGIcon(g.ic), g.n, `fsGroupTog('${g.id}')`)).join('')}</div>
    <div class="fsg-new"><b>Nouveau groupe</b>
      <div class="fsg-sug">${FS_GSUG.filter(([n]) => !gs.some(g => g.n === n)).map(([n, ic]) => `<button type="button" onclick="fsGroupNew('${n.replace(/'/g, '\\\'')}','${ic}')">${fsGIcon(ic)}${esc(n)}</button>`).join('')}</div>
      <div class="fsg-in"><input id="fsg-n" type="text" maxlength="24" placeholder="Ou un autre nom…" onkeydown="if(event.key==='Enter')fsGroupNew()"><button type="button" class="btn btn-primary btn-sm" onclick="fsGroupNew()">Créer</button></div>
      <div class="fsg-ics" role="radiogroup" aria-label="Le petit logo">${Object.keys(FS_GIC).map(k => `<button type="button" role="radio" aria-checked="${k === fsGPick}" class="${k === fsGPick ? 'on' : ''}" onclick="fsGPick='${k}';fsGroupsRender()" aria-label="${k}">${fsGIcon(k)}</button>`).join('')}</div></div>
    <button type="button" class="fsg-x" onclick="fsGroupsClose()">Fermer</button></div>`;
}
async function fsSaveCur() {
  const i = sheets.findIndex(x => x.id === cur.id); if (i >= 0) { sheets[i].groups = cur.groups; sheets[i].favorite = cur.favorite; }
  await DB.put('sheets', clone(cur));
}
async function fsFavTog() { await toggleFavCur(); fsGroupsRender(); }
async function fsGroupTog(id) {
  const g = cur.groups = (cur.groups || []).slice(), k = g.indexOf(id);
  if (k >= 0) g.splice(k, 1); else g.push(id);
  await fsSaveCur(); fsGroupsRender(); fsGroupDots();
}
async function fsGroupNew(n, ic) {
  if (n == null) { const el = $('fsg-n'); n = el ? el.value.trim() : ''; ic = fsGPick; }
  if (!n) { const el = $('fsg-n'); if (el) el.focus(); return; }
  const gs = fsGroupsAll();
  let g = gs.find(x => x.n.toLowerCase() === n.toLowerCase());
  if (!g) { g = {id: uid(), n, ic: ic || 'etoile'}; gs.push(g); LS.set('gms_groups', gs); }
  cur.groups = (cur.groups || []).filter(x => x !== g.id).concat(g.id);
  await fsSaveCur(); fsGroupsRender(); fsGroupDots();
  toast(`Rangée dans « ${n} »`);
}
// les petits logos des groupes de la fiche, à côté du cœur
function fsGroupDots() {
  const h = $('fs-gdots'); if (!h || !cur) return;
  const gs = fsGroupsAll().filter(g => (cur.groups || []).includes(g.id));
  h.innerHTML = gs.map(g => fsGIcon(g.ic)).join('');
}

/* ── Au lancement : l'en-tête et l'encart de la fiche ── */
(function fsSheetInit() {
  if (!fsBeta()) return;
  const fav = $('sv-fav'); if (!fav) return;
  const wrap = document.createElement('span'); wrap.className = 'fs-fav';
  fav.parentNode.insertBefore(wrap, fav); wrap.appendChild(fav);
  wrap.insertAdjacentHTML('beforeend', '<span class="fs-gdots" id="fs-gdots"></span><button type="button" class="fs-plus" onclick="fsGroups(event)" aria-label="Ranger dans un groupe" title="Ranger dans un groupe"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg></button>');
  { const ch = document.querySelector('#v-sheet .sv-chips'); if (ch) ch.insertAdjacentHTML('beforeend', '<button type="button" class="sv-carnet" onclick="printOne()" aria-label="Garder cette fiche : la mettre dans mon carnet (PDF)"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="bk" d="M6.5 3.5h11a1.5 1.5 0 011.5 1.5v14a1.5 1.5 0 01-1.5 1.5h-11z"/><path class="bk" d="M6.5 3.5v17M4.5 7h2M4.5 12h2M4.5 17h2"/><g class="ar"><path d="M13 6.5v7.5M10 11.2l3 3 3-3"/></g></svg>Garder</button>'); }   // là où était Mode jeu
  wrap.insertAdjacentHTML('afterend', '<button type="button" class="btn-icon sv-pen" onclick="if(cur)editSheet(cur.id)" aria-label="Modifier la fiche" title="Modifier la fiche"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg></button>');
  const kn = $('sv-know');
  if (kn) kn.insertAdjacentHTML('afterend', `<button type="button" class="fs-live" id="fs-live" onclick="fbLive()" aria-pressed="false">
    <span class="fs-live-i" aria-hidden="true"><svg viewBox="0 0 40 24"><path d="M0 6h40M0 10h40M0 14h40M0 18h40" class="l"/><rect x="7" y="4" width="3.4" height="16" rx="1.7"/><rect x="18" y="7" width="3.4" height="10" rx="1.7"/><rect x="29" y="5" width="3.4" height="14" rx="1.7"/></svg></span>
    <span class="fs-live-t"><b>En rythme</b><small></small></span>
    <span class="fs-live-k" aria-hidden="true"><svg viewBox="0 0 60 30"><path class="st" d="M3 17H57"/><path class="vb" d="M3 17Q10.5 11 18 17T33 17T48 17T57 17"/><g class="pk"><path transform="translate(-7 -8.6) scale(.083)" d="${FS_BODY}"/></g></svg></span></button>`);
  // la fiche s'ouvre : les petits logos des groupes à côté du cœur
  const sv = viewSheet;
  viewSheet = async function (id, k) { const r = await sv(id, k); fsGroupDots(); fsLiveSync(); return r; };
})();

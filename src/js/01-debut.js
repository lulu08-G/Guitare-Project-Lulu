/* ═══════════════════════════════════════════════════════════
   GUITAR MEMORY SHEETS v2 — single file, vanilla JS, no deps
   Data: IndexedDB (sheets + media blobs), migrates old localStorage.
   ═══════════════════════════════════════════════════════════ */

/* ── UTILS ── */
const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => s == null ? '' : String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clone = o => JSON.parse(JSON.stringify(o));
/* ── MOUVEMENT (helpers) : tout est transform/opacity ; rien si « réduire les animations » ── */
const mReduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
function mAnim(el, frames, opt) { if (!el || !el.animate || mReduced()) return null; return el.animate(frames, opt); }
const mPulse = el => mAnim(el, [{transform: 'scale(1)'}, {transform: 'scale(1.1)', offset: .35}, {transform: 'scale(1)'}], {duration: 160, easing: 'ease-out'});
function mPop(el) { if (!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
// toucher : onde discrète sous le doigt
document.addEventListener('pointerdown', e => {
  if (mReduced()) return;
  const b = e.target.closest && e.target.closest('.btn,.ed-rec,.ed-rcb'); if (!b || b.disabled) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 1.6;
  if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
  const o = document.createElement('span'); o.className = 'm-rip'; o.setAttribute('aria-hidden', 'true');
  o.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px`;
  b.appendChild(o);
  const a = mAnim(o, [{transform: 'scale(0)', opacity: .9}, {transform: 'scale(1)', opacity: 0}], {duration: 360, easing: 'cubic-bezier(.22,.8,.3,1)'});
  if (a) a.onfinish = () => o.remove(); else o.remove();
}, {passive: true});
// panneaux <details> : le contenu se déroule à l'ouverture (clic sur le résumé, pas au rendu)
document.addEventListener('click', e => {
  const sm = e.target.closest && e.target.closest('summary'); if (!sm) return;
  const d = sm.parentElement; if (!d || d.tagName !== 'DETAILS' || d.open || mReduced()) return;
  d.classList.add('det-in'); setTimeout(() => d.classList.remove('det-in'), 380);
});
function toast(msg, err) {
  const el = $('toast');
  el.textContent = msg;
  if (!err) el.insertAdjacentHTML('afterbegin', '<svg class="tk" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>');
  el.className = 'toast' + (err ? ' err' : '') + ' show';
  el._ts = Date.now();
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ── THEME (jour / nuit) ── */
const SUN_ICO = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></svg>';
const MOON_ICO = '<svg viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" fill="currentColor" stroke="none"/></svg>';
function applyTheme() {}
function toggleTheme() {}
document.documentElement.removeAttribute('data-theme');

/* ── INDEXEDDB ── */
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const rq = indexedDB.open('gms_v2', 1);
      rq.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('sheets')) db.createObjectStore('sheets', {keyPath:'id'});
        if (!db.objectStoreNames.contains('media'))  db.createObjectStore('media',  {keyPath:'id'});
        if (!db.objectStoreNames.contains('meta'))   db.createObjectStore('meta',   {keyPath:'k'});
      };
      rq.onsuccess = () => { DB.db = rq.result; res(); };
      rq.onerror = () => rej(rq.error);
    });
  },
  _s(store, mode) { return DB.db.transaction(store, mode).objectStore(store); },
  get(store, key) { return new Promise((res, rej) => { const r = DB._s(store,'readonly').get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  all(store)      { return new Promise((res, rej) => { const r = DB._s(store,'readonly').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error); }); },
  put(store, v)   { return new Promise((res, rej) => { const r = DB._s(store,'readwrite').put(v); r.onsuccess = () => res(v); r.onerror = () => rej(r.error); }); },
  del(store, key) { return new Promise((res, rej) => { const r = DB._s(store,'readwrite').delete(key); r.onsuccess = () => res(); r.onerror = () => rej(r.error); }); },
};

/* ── STATE ── */
let sheets = [];        // in-memory mirror of the sheets store
let cur = null;         // sheet being viewed
let draft = null;       // sheet being edited
let selMode = false;
let selIds = new Set();
let libFilter = 'all';
let homeFilter = 'all';
let mediaURLs = {};     // mediaId -> objectURL cache

/* ── CHORD LIBRARY (frets: index 0 = low E … 5 = high e; -1 mute, 0 open) ── */
const LIB = [
  {n:'G',     f:[3,2,0,0,0,3],   g:[2,1,0,0,0,3], fam:'maj'},
  {n:'C',     f:[-1,3,2,0,1,0],  g:[0,3,2,0,1,0], fam:'maj'},
  {n:'D',     f:[-1,-1,0,2,3,2], g:[0,0,0,1,3,2], fam:'maj'},
  {n:'Em',    f:[0,2,2,0,0,0],   g:[0,2,3,0,0,0], fam:'min'},
  {n:'Am',    f:[-1,0,2,2,1,0],  g:[0,0,2,3,1,0], fam:'min'},
  {n:'E',     f:[0,2,2,1,0,0],   g:[0,2,3,1,0,0], fam:'maj'},
  {n:'A',     f:[-1,0,2,2,2,0],  g:[0,0,1,2,3,0], fam:'maj'},
  {n:'Dm',    f:[-1,-1,0,2,3,1], g:[0,0,0,2,3,1], fam:'min'},
  {n:'F',     f:[1,3,3,2,1,1],   g:[1,3,4,2,1,1], fam:'maj', barre:true},
  {n:'B7',    f:[-1,2,1,2,0,2],  g:[0,2,1,3,0,4], fam:'7'},
  {n:'A7',    f:[-1,0,2,0,2,0],  g:[0,0,2,0,3,0], fam:'7'},
  {n:'C7',    f:[-1,3,2,3,1,0],  g:[0,3,2,4,1,0], fam:'7'},
  {n:'D7',    f:[-1,-1,0,2,1,2], g:[0,0,0,2,1,3], fam:'7'},
  {n:'E7',    f:[0,2,0,1,0,0],   g:[0,2,0,1,0,0], fam:'7'},
  {n:'G7',    f:[3,2,0,0,0,1],   g:[3,2,0,0,0,1], fam:'7'},
  {n:'Am7',   f:[-1,0,2,0,1,0],  g:[0,0,2,0,1,0], fam:'7'},
  {n:'Dm7',   f:[-1,-1,0,2,1,1], g:[0,0,0,2,1,1], fam:'7'},
  {n:'Em7',   f:[0,2,2,0,3,0],   g:[0,2,3,0,4,0], fam:'7'},
  {n:'Cmaj7', f:[-1,3,2,0,0,0],  g:[0,3,2,0,0,0], fam:'7'},
  {n:'Amaj7', f:[-1,0,2,1,2,0],  g:[0,0,2,1,3,0], fam:'7'},
  {n:'Dmaj7', f:[-1,-1,0,2,2,2], g:[0,0,0,1,1,1], fam:'7'},
  {n:'Fmaj7', f:[-1,-1,3,2,1,0], g:[0,0,3,2,1,0], fam:'7'},
  {n:'Gmaj7', f:[3,2,0,0,0,2],   g:[3,2,0,0,0,1], fam:'7'},
  {n:'Asus2', f:[-1,0,2,2,0,0],  g:[0,0,1,2,0,0], fam:'sus'},
  {n:'Asus4', f:[-1,0,2,2,3,0],  g:[0,0,1,2,3,0], fam:'sus'},
  {n:'Dsus2', f:[-1,-1,0,2,3,0], g:[0,0,0,1,2,0], fam:'sus'},
  {n:'Dsus4', f:[-1,-1,0,2,3,3], g:[0,0,0,1,2,3], fam:'sus'},
  {n:'Esus4', f:[0,2,2,2,0,0],   g:[0,1,2,3,0,0], fam:'sus'},
  {n:'Cadd9', f:[-1,3,2,0,3,3],  g:[0,2,1,0,3,4], fam:'add'},
  {n:'Gadd9', f:[3,0,0,2,0,3],   g:[2,0,0,1,0,3], fam:'add'},
  {n:'Bm',    f:[-1,2,4,4,3,2],  g:[0,1,3,4,2,1], fam:'min', barre:true},
  {n:'Bm7',   f:[-1,2,0,2,0,2],  g:[0,1,0,2,0,3], fam:'7'},
  {n:'B',     f:[-1,2,4,4,4,2],  g:[0,1,2,3,4,1], fam:'maj', barre:true},
  {n:'Bb',    f:[-1,1,3,3,3,1],  g:[0,1,2,3,4,1], fam:'maj', barre:true},
  {n:'Bbm',   f:[-1,1,3,3,2,1],  g:[0,1,3,4,2,1], fam:'min', barre:true},
  {n:'Cm',    f:[-1,3,5,5,4,3],  g:[0,1,3,4,2,1], fam:'min', barre:true},
  {n:'C#m',   f:[-1,4,6,6,5,4],  g:[0,1,3,4,2,1], fam:'min', barre:true},
  {n:'Fm',    f:[1,3,3,1,1,1],   g:[1,3,4,1,1,1], fam:'min', barre:true},
  {n:'F#m',   f:[2,4,4,2,2,2],   g:[1,3,4,1,1,1], fam:'min', barre:true},
  {n:'Gm',    f:[3,5,5,3,3,3],   g:[1,3,4,1,1,1], fam:'min', barre:true},
  {n:'G#m',   f:[4,6,6,4,4,4],   g:[1,3,4,1,1,1], fam:'min', barre:true},
  {n:'F#',    f:[2,4,4,3,2,2],   g:[1,3,4,2,1,1], fam:'maj', barre:true},
  {n:'Eb',    f:[-1,6,5,3,4,3],  g:[0,4,3,1,2,1], fam:'maj', barre:true},
  // accords ouverts / riffs (sus, slash, variantes « ancre » : B et e en case 3 fixes)
  {n:'A7sus4', f:[-1,0,2,0,3,0],   g:[0,0,2,0,3,0],  fam:'sus'},
  {n:'C/G',    f:[3,3,2,0,1,0],    g:[4,3,2,0,1,0],  fam:'maj'},
  {n:'Emadd9', f:[0,2,2,0,0,2],    g:[0,1,2,0,0,3],  fam:'add'},
  {n:'D/F#',   f:[2,0,0,2,3,2],    g:[1,0,0,2,4,3],  fam:'maj'},
  {n:'Gsus2',  f:[3,0,0,0,3,3],    g:[2,0,0,0,3,4],  fam:'sus'},
  {n:'G6',     f:[3,2,0,0,0,0],    g:[2,1,0,0,0,0],  fam:'maj'},
  {n:'Em7 (ancre)',    f:[0,2,2,0,3,3],  g:[0,1,2,0,3,4], fam:'7'},
  {n:'G (ancre)',      f:[3,2,0,0,3,3],  g:[2,1,0,0,3,4], fam:'maj'},
  {n:'A7sus4 (ancre)', f:[-1,0,2,2,3,3], g:[0,0,1,2,3,4], fam:'sus'},
];
const MAGIC = ['G','C','D','Em'];
const ESSENTIAL = ['Am','E','A','Dm','F','B7'];
const ENH_MAP = {'C#':'Db','Db':'C#','D#':'Eb','Eb':'D#','F#':'Gb','Gb':'F#','G#':'Ab','Ab':'G#','A#':'Bb','Bb':'A#'};
const findChord1 = n => LIB.find(c => c.n.toLowerCase() === String(n||'').toLowerCase());
// accepte aussi l'équivalent enharmonique (Db ↔ C#, A# ↔ Bb…)
const findChord = n => { const r = findChord1(n); if (r) return r; const m = String(n||'').match(/^([A-G][#b])(.*)$/); return m && ENH_MAP[m[1]] ? findChord1(ENH_MAP[m[1]] + m[2]) : undefined; };

const STRINGS = ['E','A','D','G','B','e'];   // index 0 = low E
const OPEN_MIDI = [40,45,50,55,59,64];
const PART_NAMES = ['Intro','Couplet','Refrain','Pont','Solo','Outro'];
const PC_NAMES = ['Intro','Couplet','Refrain','Pont','Outro'];   // pastilles de nom dans l'éditeur
const COLORS = [['gold','#c8783a'],['sage','#6a9070'],['terra','#b85840'],['mauve','#8a7aaa'],['cream','#c8b49a']];

/* ── MODEL FACTORIES ── */
const newChord = (n) => {
  const lib = findChord(n);
  return lib
    ? {id:uid(), name:lib.n, frets:lib.f.slice(), fingers:(lib.g||[0,0,0,0,0,0]).slice(), base:1, arp:[]}
    : {id:uid(), name:n||'', frets:[-1,-1,-1,-1,-1,-1], fingers:[0,0,0,0,0,0], base:1, arp:[]};
};
const dispDiff = d => ({Debutant:'Débutant', Intermediaire:'Intermédiaire', Avance:'Avancé'})[d] || d || '';
const newPart = (name) => ({id:uid(), name:name == null ? 'Partie' : name, collapsed:false, chords:[], rhythm:null, tabText:'', note:''});
const soloPart = parts => !!parts && parts.length === 1 && !parts[0].name;   // fiche à une seule partie sans nom : pas d'en-tête de partie ni d'onglets
const newSheet_ = () => ({
  id:uid(), title:'', artist:'', color:'gold', favorite:false,
  capo:0, tuning:'Standard', bpm:0, difficulty:'',
  memo:'', links:[], media:[], tabImage:null,
  blocks:{}, parts:[newPart('')],
  createdAt:Date.now(), updatedAt:Date.now()
});

/* ── MIGRATION from the old localStorage versions ── */
function migrateOld() {
  for (const key of ['gms6_sheets','gms5_sheets','gms4_sheets','gms3_sheets','gms2_sheets']) {
    let raw; try { raw = localStorage.getItem(key); } catch(e) { return []; }
    if (!raw) continue;
    let old; try { old = JSON.parse(raw); } catch(e) { continue; }
    if (!Array.isArray(old) || !old.length) continue;
    return old.map(o => {
      const s = newSheet_();
      s.id = o.id || uid();
      s.title = o.title || 'Sans titre';
      s.artist = o.artist || '';
      s.color = o.color || 'gold';
      s.capo = o.capo || 0;
      s.bpm = o.bpm || 0;
      s.difficulty = o.difficulty || '';
      s.memo = o.notes || '';
      if (o.youtube) s.links = [{id:uid(), url:o.youtube, title:'Video'}];
      if (s.capo) s.blocks.capo = true;
      if (s.bpm) s.blocks.tempo = true;
      if (s.difficulty) s.blocks.diff = true;
      if (s.memo || s.links.length) s.blocks.coffre = true;
      const mkPart = (name, mode, chords, arps, rhythm, custom, invert, note) => {
        const p = newPart(name || 'Partie');
        p.note = note || '';
        if (mode === 'arpeggio') {
          (arps||[]).forEach(a => {
            const c = newChord(a.name);
            c.name = a.name || 'Accord';
            const rows = a.rows ? a.rows : rowsFromLegacy(a.fingers, a.pickOrder);
            const fr = [-1,-1,-1,-1,-1,-1];
            rows.forEach(r => r.forEach((v,i) => { if (v != null && fr[i] === -1) fr[i] = v; }));
            c.frets = fr;
            c.arp = rows.map(r => r.map((v,i) => v != null ? i : -1).filter(i => i >= 0));
            p.chords.push(c);
          });
        } else {
          (chords||[]).forEach(ch => {
            const c = newChord(ch.name);
            c.name = ch.name;
            if (ch.fingers) c.frets = ch.fingers.slice();
            p.chords.push(c);
          });
          p.rhythm = legacyRhythm(rhythm, custom, invert);
        }
        return p;
      };
      const parts = [];
      parts.push(mkPart(o.sections && o.sections.length ? 'Partie 1' : 'Accords', o.mainMode, o.mainChords, o.mainArpeggios, o.mainRhythm, o.mainCustomBeats, o.mainRhythmInvert, ''));
      (o.sections||[]).forEach(sec => parts.push(mkPart(sec.name, sec.mode, sec.chords, sec.arpeggios, sec.rhythm, sec.customBeats, sec.rhythmInvert, sec.comment)));
      s.parts = parts.filter(p => p.chords.length || p.rhythm || p.note);
      if (!s.parts.length) s.parts = [newPart('')];
      return s;
    });
  }
  return [];
}
function rowsFromLegacy(fingers, pickOrder) {
  if (!fingers || !pickOrder) return [];
  const max = Math.max(0, ...pickOrder), rows = [];
  for (let o = 1; o <= max; o++) {
    const r = [null,null,null,null,null,null]; let any = false;
    for (let i = 0; i < 6; i++) if (pickOrder[i] === o) { r[i] = fingers[i]; any = true; }
    if (any) rows.push(r);
  }
  return rows;
}
/* Presets hérités (ids des anciennes fiches) → motifs sur grille. Corrigés : chaque motif remplit une mesure entière.
   Notation : D/U = bas/haut, majuscule = normal, minuscule = doux, X = étouffé, - = la main passe. */
const LEGACY_R = {
  folk:{mes:'4/4', res:8, pat:'DuDuDuDu'},
  pop5:{mes:'4/4', res:8, pat:'D-DU-UDU'},
  waltz:{mes:'3/4', res:8, pat:'D-d-d-'},
  reggae:{mes:'4/4', res:8, pat:'-U-U-U-U'},
  arpege:{mes:'4/4', res:8, pat:'DuuuDuuu'},
  ballad:{mes:'4/4', res:8, pat:'D-DUD-DU'},
  rock:{mes:'4/4', res:8, pat:'DDDDDDDD'},
};
function legacyRhythm(id, custom, invert) {
  if (id === 'custom' && custom && custom.length) {
    let strokes = custom.map(v => v > .04 ? {dir:'U', force:Math.min(1,v)} : v < -.04 ? {dir:'D', force:Math.min(1,-v)} : {dir:'-', force:0});
    if (invert) strokes = strokes.map(s => ({...s, dir: s.dir === 'D' ? 'U' : s.dir === 'U' ? 'D' : '-'}));
    return rhNorm({strokes});
  }
  const L = LEGACY_R[id]; if (!L) return null;
  const r = rhFromPat(L.pat, L.mes, L.res);
  if (invert) r.cells.forEach(c => { if (c && c.d !== 'X') c.d = c.d === 'D' ? 'U' : 'D'; });
  return r;
}


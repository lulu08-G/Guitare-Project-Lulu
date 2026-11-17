/* ═══════ COURS — comprendre les accords ═══════
   Senior note: every example is computed from the same small theory core
   (pitch classes + interval formulas), so the course can never contradict
   itself — change a formula in QUAL and the builder, the fretboard, the quiz
   and the progressions all follow. Sounds reuse pluck(); chords present in
   LIB are played with their real guitar voicing, others are synthesised. */
const NOTE_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const FR_NOTE = {C:'Do',D:'Ré',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
const frNote = n => FR_NOTE[n[0]] + (n[1] === '#' ? '♯' : n[1] === 'b' ? '♭' : '');
const midiFreq = m => 440 * Math.pow(2, (m - 69)/12);
const pcName = (pc, flats) => (flats ? NOTE_FLAT : NOTE_NAMES)[((pc % 12) + 12) % 12];
const QUAL = {
  '':     {n:'Majeur',        iv:[0,4,7],        f:'1 · 3 · 5',          fx:'Joyeux, stable, lumineux. Le « chez soi » de la musique.', ex:'G, C, D — la base de la pop et du folk'},
  'm':    {n:'Mineur',        iv:[0,3,7],        f:'1 · ♭3 · 5',         fx:'Triste, sombre, intime, nostalgique.', ex:'Am, Em — ballades, couplets émouvants'},
  '5':    {n:'Power chord',   iv:[0,7,12],       f:'1 · 5 · (8)',        fx:'Ni majeur ni mineur (pas de tierce) : neutre et massif. Parfait avec de la saturation.', ex:'Rock, punk, metal'},
  '7':    {n:'Septième',      iv:[0,4,7,10],     f:'1 · 3 · 5 · ♭7',     fx:'Tendu, bluesy. Il « veut » aller quelque part : il appelle une résolution.', ex:'Blues, G7 → C'},
  'maj7': {n:'Majeur 7',      iv:[0,4,7,11],     f:'1 · 3 · 5 · 7',      fx:'Doux, rêveur, jazzy. Un majeur qui regarde par la fenêtre.', ex:'Bossa nova, ballades soul'},
  'm7':   {n:'Mineur 7',      iv:[0,3,7,10],     f:'1 · ♭3 · 5 · ♭7',    fx:'Mélancolie douce, groove. Moins dramatique que le mineur simple.', ex:'Funk, néo-soul, R&B'},
  'sus2': {n:'Sus2',          iv:[0,2,7],        f:'1 · 2 · 5',          fx:'Ouvert, aérien, ni joyeux ni triste : la tierce a disparu.', ex:'Dsus2, Asus2 dans les intros pop-rock'},
  'sus4': {n:'Sus4',          iv:[0,5,7],        f:'1 · 4 · 5',          fx:'Suspendu, en attente : on a envie qu’il retombe sur le majeur.', ex:'D – Dsus4 – D (Free Fallin’)'},
  'add9': {n:'Add9',          iv:[0,4,7,14],     f:'1 · 3 · 5 · 9',      fx:'Un majeur qui scintille, moderne, « carillon ».', ex:'Cadd9 (Wonderwall)'},
  '6':    {n:'Sixte',         iv:[0,4,7,9],      f:'1 · 3 · 5 · 6',      fx:'Rétro, sucré, swing années 50.', ex:'Rockabilly, swing, fin de morceau jazz'},
  '9':    {n:'Neuvième',      iv:[0,4,7,10,14],  f:'1 · 3 · 5 · ♭7 · 9', fx:'Le 7 en plus riche et groovy.', ex:'Funk (James Brown), soul'},
  'dim':  {n:'Diminué',       iv:[0,3,6],        f:'1 · ♭3 · ♭5',        fx:'Instable, angoissant, suspense de film. Sert surtout d’accord de passage.', ex:'Passage entre deux accords'},
  'aug':  {n:'Augmenté',      iv:[0,4,8],        f:'1 · 3 · ♯5',         fx:'Étrange, flottant, onirique. Tire vers l’accord suivant.', ex:'Transitions rêveuses (Beatles)'},
};
const QUAL_ORDER = ['','m','5','7','maj7','m7','sus2','sus4','add9','6','9','dim','aug'];
const DEG = {0:'R',1:'♭9',2:'2',3:'♭3',4:'3',5:'4',6:'♭5',7:'5',8:'♯5',9:'6',10:'♭7',11:'7'};
const DEG_ROLE = {'R':'Fondamentale','♭3':'Tierce mineure','3':'Tierce majeure','5':'Quinte','♭5':'Quinte diminuée','♯5':'Quinte augmentée',
  '♭7':'Septième mineure','7':'Septième majeure','2':'Seconde (= 9e)','♭9':'Neuvième mineure','4':'Quarte','6':'Sixte'};
const degColor = d => d === 'R' ? 'var(--gold)' : (d === '3' || d === '♭3') ? 'var(--sage)' : /5/.test(d) ? 'var(--mauve)' : 'var(--terra)';
const degBadge = d => `<span class="deg" style="background:${degColor(d)}">${d}</span>`;
const LEGEND = `<div class="legend"><span><i style="background:var(--gold)"></i>Fondamentale</span><span><i style="background:var(--sage)"></i>Tierce</span><span><i style="background:var(--mauve)"></i>Quinte</span><span><i style="background:var(--terra)"></i>Couleur (7, 9, sus, 6…)</span></div>`;

function parseName(name) {
  const m = String(name).match(/^([A-G])([#b]?)(.*)$/); if (!m) return null;
  const pc = (NOTE_NAMES.indexOf(m[1]) + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  return {pc, q: QUAL[m[3]] ? m[3] : '', flats: m[2] === 'b'};
}
function audioReady() { const ac = audio(); if (ac.state === 'suspended') ac.resume(); return ac; }
function synthChord(pc, q, arp, when) {
  const ac = audioReady(), t0 = when || ac.currentTime + 0.02;
  const base = 48 + pc - (pc > 6 ? 12 : 0);
  QUAL[q].iv.forEach((iv, k) => pluck(midiFreq(base + iv), t0 + k*(arp ? 0.32 : 0.045), arp ? 1.8 : 1.6, .12));
}
function playVoicingArp(ch, capo) {
  const ac = audioReady(), t0 = ac.currentTime + 0.02;
  [0,1,2,3,4,5].filter(i => ch.frets[i] >= 0).forEach((si, k) => pluck(fretFreq(si, ch.frets[si], capo), t0 + k*0.32, 1.8, .14));
}
function playName(name, arp) {
  if (findChord(name)) { const c = newChord(name); arp ? playVoicingArp(c, 0) : playChord(c, 0); return; }
  const p = parseName(name); if (p) synthChord(p.pc, p.q, arp);
}
function playNote(midi) { const ac = audioReady(); pluck(midiFreq(midi), ac.currentTime + 0.02, 1.6, .15); }
function playInterval(semi) {
  const ac = audioReady(), t = ac.currentTime + 0.02, b = 52;
  pluck(midiFreq(b), t, 1.2, .14); pluck(midiFreq(b + semi), t + .6, 1.2, .14);
  pluck(midiFreq(b), t + 1.4, 1.8, .12); pluck(midiFreq(b + semi), t + 1.4, 1.8, .12);
}

/* sequences: registered by id so inline onclick handlers stay simple */
const SEQ = {};
let coursSeqTimers = [];
function coursStop() {
  coursSeqTimers.forEach(clearTimeout); coursSeqTimers = [];
  document.querySelectorAll('.note-chip.now, .ss-note.now').forEach(e => e.classList.remove('now'));
}
function seqAttr(id, items) { SEQ[id] = items; return `onclick="playSeq('${id}')"`; }
function playSeq(id) {
  const items = SEQ[id]; if (!items) return;
  coursStop();
  const gap = items.length > 8 ? 0.8 : 1.2;
  const clear = () => document.querySelectorAll('.note-chip.now').forEach(e => e.classList.remove('now'));
  items.forEach((it, k) => coursSeqTimers.push(setTimeout(() => {
    clear();
    const el = $(id + '-' + k); if (el) el.classList.add('now');
    typeof it === 'string' ? playName(it) : playChord(it, 0);
  }, k*gap*1000)));
  coursSeqTimers.push(setTimeout(clear, items.length*gap*1000 + 300));
}
const seqChips = (id, labels, subs) => `<div class="note-chips">${labels.map((l, k) =>
  `<span class="note-chip" id="${id}-${k}">${esc(l)}${subs ? `<small>${esc(subs[k])}</small>` : ''}</span>`).join('')}</div>`;
const playBtn = (attr, label) => `<button type="button" class="btn btn-ghost btn-xs" ${attr}><svg class="ico" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21"/></svg> ${label || 'Écouter'}</button>`;

/* ── fretboard: every position of a set of pitch classes, colour = role ── */
function fretboardSVG(pcs, rootPc, opt) {
  opt = opt || {};
  const NFR = 12, cw = 40, x0 = 34, rowH = 22, top = 14;
  const W = x0 + NFR*cw + 10, H = top + rowH*5 + 30;
  const disp = [5,4,3,2,1,0], lbl = ['e','B','G','D','A','E'];
  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">`;
  [3,5,7,9].forEach(f => s += `<circle cx="${x0+(f-.5)*cw}" cy="${top+rowH*2.5}" r="4" fill="var(--card3)"/>`);
  s += `<circle cx="${x0+11.5*cw}" cy="${top+rowH*1.5}" r="4" fill="var(--card3)"/><circle cx="${x0+11.5*cw}" cy="${top+rowH*3.5}" r="4" fill="var(--card3)"/>`;
  for (let f = 0; f <= NFR; f++) {
    const x = x0 + f*cw;
    s += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top+rowH*5}" stroke="${f===0?'var(--cream2)':'var(--border2)'}" stroke-width="${f===0?3:1}"/>`;
    if (f) s += `<text x="${x-cw/2}" y="${H-6}" text-anchor="middle" font-size="9" fill="var(--cream4)" font-family="Inter,system-ui,sans-serif">${f}</text>`;
  }
  disp.forEach((si, li) => {
    const y = top + li*rowH;
    s += `<text x="4" y="${y+3}" font-size="9" fill="var(--cream3)" font-family="Inter,system-ui,sans-serif">${lbl[li]}</text>`;
    s += `<line x1="${x0}" y1="${y}" x2="${W-10}" y2="${y}" stroke="var(--cream4)" stroke-width="${1 + li*0.25}"/>`;
  });
  disp.forEach((si, li) => {
    const y = top + li*rowH;
    for (let f = 0; f <= NFR; f++) {
      const midi = OPEN_MIDI[si] + f, pc = midi % 12, on = pcs.includes(pc);
      if (!on && !opt.all) continue;
      if (opt.range && (f < opt.range[0] || f > opt.range[1])) continue;
      const x = f === 0 ? x0 - 12 : x0 + (f - .5)*cw, n = pcName(pc, opt.flats);
      s += `<g style="cursor:pointer" onclick="playNote(${midi})">`;
      if (on) {
        const d = rootPc == null ? null : DEG[(pc - rootPc + 12) % 12];
        s += `<circle cx="${x}" cy="${y}" r="9.5" fill="${d ? degColor(d) : 'var(--gold)'}"/>`;
        s += `<text x="${x}" y="${y+3}" text-anchor="middle" font-size="8" font-weight="700" fill="var(--ink)" font-family="Inter,system-ui,sans-serif">${n}</text>`;
      } else {
        s += `<rect x="${x-10}" y="${y-6}" width="20" height="12" rx="3" fill="var(--card)"/>`;
        s += `<text x="${x}" y="${y+3}" text-anchor="middle" font-size="8" font-weight="${n.length===1?700:400}" fill="${n.length===1?'var(--cream)':'var(--cream4)'}" font-family="Inter,system-ui,sans-serif">${n}</text>`;
      }
      s += `</g>`;
    }
  });
  return `<div class="scroll-x">${s}</svg></div>`;
}

/* ── state ── */
let coursCur = 'notes';
const coursSt = {root:0, q:'', key:'G', dec:'C', capo:2, tgtKey:9, shapeKey:7, barreRoot:5,
  quiz:{lvl:0, cur:null, ok:0, n:0, fb:''}};
const KEYS = ['C','G','D','A','E','F'];
const SCALE = [0,2,4,5,7,9,11];
const HARM_Q = ['','m','m','','','m','dim'];
const ROMAN = ['I','ii','iii','IV','V','vi','vii°'];
const FUNCS = ['Tonique — la maison, le repos','Sus-tonique — prépare souvent le V','Médiante — couleur douce, proche du I',
  'Sous-dominante — on s’éloigne de la maison','Dominante — tension, veut revenir au I','Relatif mineur — le I en version triste','Sensible — instable, rare en pop'];
const keyFlats = k => ['F','Bb','Eb','Ab','Db','Gb'].includes(k);
function degChord(key, deg, q) {
  const kp = parseName(key).pc, pc = (kp + SCALE[deg]) % 12;
  return pcName(pc, keyFlats(key)) + (q != null ? q : HARM_Q[deg]);
}
const rootOptions = sel => NOTE_NAMES.map((n, i) => `<option value="${i}" ${sel===i?'selected':''}>${n.length > 1 ? n + ' / ' + NOTE_FLAT[i] : n} (${frNote(n)})</option>`).join('');
const keyChips = (sel, fn) => `<div class="filters" style="margin-bottom:10px">${KEYS.map(k =>
  `<button type="button" class="filt ${sel===k?'on':''}" onclick="${fn}('${k}')">${k} (${frNote(k)})</button>`).join('')}</div>`;
const P = t => `<p class="cours-p">${t}</p>`;
const H = t => `<div class="cours-h">${t}</div>`;
const KEY = t => `<div class="cours-key"><div class="kt">À retenir</div>${t}</div>`;

/* ── 1. notes ── */
function lessonNotes() {
  return H('12 notes, pas une de plus') +
    P('Toute la musique occidentale tient en <b>12 notes</b>. Après la 12e, on retombe sur la première, une <b>octave</b> plus haut : même note, juste plus aiguë. Clique pour les entendre dans l’ordre :') +
    pianoSVG() +
    P('Touches blanches = les 7 notes naturelles, touches noires = dièses / bémols. Entre <b>E–F</b> et <b>B–C</b>, pas de touche noire : ce sont les demi-tons naturels (½). Clique pour écouter.') +
    H('Deux façons de les nommer') +
    P('En français : Do Ré Mi Fa Sol La Si. Les grilles d’accords (et cette appli) utilisent le système anglo-saxon : <b>C D E F G A B</b>.') +
    `<div class="table-wrap"><table class="ctable mini"><tr>${'CDEFGAB'.split('').map(n => `<th>${n}</th>`).join('')}</tr><tr>${'CDEFGAB'.split('').map(n => `<td>${frNote(n)}</td>`).join('')}</tr></table></div>` +
    H('Dièses ♯ et bémols ♭') +
    P('Entre la plupart des notes, il existe une note intermédiaire. <b>C♯</b> (Do dièse) = un cran au-dessus de C. <b>D♭</b> (Ré bémol) = un cran en dessous de D. C♯ et D♭ sont <b>exactement le même son</b>, seul le nom change selon le contexte.') +
    P('<b>Exception :</b> entre <b>E–F</b> et entre <b>B–C</b>, il n’y a rien. Ces notes sont collées. Retiens-le, ça sert tout le temps.') +
    H('Sur la guitare : 1 case = 1 demi-ton') +
    P('Avancer d’<b>une case</b> monte d’un <b>demi-ton</b> (la note suivante dans la liste). Deux cases = un <b>ton</b>. Douze cases = une octave : à la case 12, tu retrouves les notes des cordes à vide, d’où le double repère. Clique n’importe quelle note du manche :') +
    fretboardSVG([], null, {all:true}) +
    P('Cordes à vide, de la plus grave à la plus aiguë : <b>E A D G B E</b> (Mi La Ré Sol Si Mi). Les notes naturelles sont en clair, les dièses en grisé.') +
    P('Astuce : la <b>case 5</b> d’une corde donne la note de la corde à vide suivante (sauf sur la corde de G, où c’est la <b>case 4</b>). C’est le principe de l’accordage « à la 5e case ».') +
    KEY('12 notes · 1 case = 1 demi-ton · E–F et B–C sont collées · case 12 = octave des cordes à vide.');
}

/* ── 2. intervalles ── */
const INTERVALS = [
  [0,'Unisson','Même note, fusion totale'],
  [1,'Seconde mineure','Très frottant, grinçant (Les Dents de la mer)'],
  [2,'Seconde majeure','Un pas : le début d’une gamme'],
  [3,'Tierce mineure','Triste, sombre → le cœur de l’accord mineur'],
  [4,'Tierce majeure','Joyeux, lumineux → le cœur de l’accord majeur'],
  [5,'Quarte juste','Ouvert, solennel'],
  [6,'Triton','Instable, tension maximale (« le diable en musique »)'],
  [7,'Quinte juste','Puissant, stable, neutre → le power chord'],
  [8,'Sixte mineure','Dramatique, cinéma'],
  [9,'Sixte majeure','Tendre, chantant'],
  [10,'Septième mineure','Bluesy, tension douce'],
  [11,'Septième majeure','Rêveur, jazzy, frotte contre l’octave'],
  [12,'Octave','La même note, plus aiguë'],
];
function lessonIntervals() {
  return H('La distance entre deux notes') +
    P('Un <b>intervalle</b> = l’écart entre deux notes, compté en demi-tons (donc en cases). C’est LA notion qui explique tout : <b>un accord n’est rien d’autre qu’un empilement d’intervalles</b>. Et chaque intervalle a sa propre couleur émotionnelle.') +
    P('Visualise-les comme une règle graduée en cases, en partant de E. Clique une case pour l’entendre :') + intervalRuler() +
    P('Chaque bouton joue les deux notes l’une après l’autre, puis ensemble.') +
    `<div class="table-wrap"><table class="ctable"><tr><th></th><th>Cases</th><th>Nom</th><th>Sensation</th></tr>${INTERVALS.map(([s, n, fx]) =>
      `<tr><td class="pl">${playBtn(`onclick="playInterval(${s})"`, '')}</td><td style="font-family:var(--mono);color:var(--gold2)">${s}</td><td class="n">${n}${s < 12 ? ' ' + degBadge(['R','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'][s]) : ''}</td><td>${fx}</td></tr>`).join('')}</table></div>` +
    H('Les deux tierces qui changent tout') +
    P('<b>Tierce majeure</b> (4 cases) = joyeux. <b>Tierce mineure</b> (3 cases) = triste. Un seul demi-ton d’écart et l’humeur s’inverse. Écoute-les à la suite :') +
    `<div style="display:flex;gap:8px;flex-wrap:wrap">${playBtn('onclick="playInterval(3)"', 'Tierce mineure (3)')}${playBtn('onclick="playInterval(4)"', 'Tierce majeure (4)')}</div>` +
    H('Les étiquettes 1, 3, 5, 7…') +
    P('Les musiciens nomment les notes d’un accord par leur intervalle depuis la fondamentale : <b>R</b> (ou 1) = fondamentale, <b>3</b> = tierce, <b>5</b> = quinte, <b>7</b> = septième. Le <b>♭</b> devant veut dire « un demi-ton plus bas » (♭3 = tierce mineure). Tu retrouveras ces étiquettes partout dans le cours.') +
    KEY('Intervalle = distance en cases · 3 cases = tierce mineure (triste) · 4 cases = tierce majeure (joyeux) · 7 cases = quinte (solide).');
}

/* ── 3. construire ── */
function lessonBuild() {
  const {root, q} = coursSt, Q = QUAL[q];
  const name = pcName(root) + q;
  const notes = Q.iv.filter(iv => iv !== 12).map(iv => ({pc: (root + iv) % 12, d: DEG[iv % 12]}));
  return H('Un accord = des tierces empilées') +
    P('Un accord, c’est au moins <b>3 notes jouées ensemble</b>. L’accord de base, la <b>triade</b>, part d’une note — la <b>fondamentale</b>, qui donne son nom à l’accord — sur laquelle on empile deux tierces.') +
    `<div class="cours-formula">Majeur = fondamentale + 4 cases + 3 cases → <b>1 · 3 · 5</b><br>Mineur = fondamentale + 3 cases + 4 cases → <b>1 · ♭3 · 5</b></div>` +
    P('Exemple : <b>C</b> = C + E (4 demi-tons plus haut) + G (3 de plus) = <b>C E G</b>. <b>Am</b> = A + C + E. Tu remarques ? C et Am partagent deux notes (C et E) : c’est pour ça qu’ils sonnent si proches.') +
    H('Atelier : construis ton accord') +
    `<div class="cours-ctrl">
      <div class="fg"><label>Fondamentale</label><select onchange="coursSt.root=+this.value;renderCoursLesson()">${rootOptions(root)}</select></div>
      <div class="fg"><label>Type</label><select onchange="coursSt.q=this.value;renderCoursLesson()">${QUAL_ORDER.map(k => `<option value="${k}" ${q===k?'selected':''}>${QUAL[k].n}${k ? ' (' + k + ')' : ''}</option>`).join('')}</select></div>
    </div>
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap"><span style="font-family:var(--serif);font-size:30px;font-weight:800;color:var(--cream)">${name}</span><span style="font-family:var(--mono);color:var(--gold2);font-size:13px">${Q.f}</span></div>
    <p class="cours-p" style="margin-top:4px">${Q.fx}</p>
    <div class="note-chips">${notes.map(n => `<span class="note-chip">${pcName(n.pc)} ${degBadge(n.d)}<small>${frNote(pcName(n.pc))} · ${DEG_ROLE[n.d]}</small></span>`).join('')}</div>
    ${stackHTML(root, q)}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${playBtn(`onclick="synthChord(${root},'${q}',false)"`, 'Ensemble')}${playBtn(`onclick="synthChord(${root},'${q}',true)"`, 'Note par note')}</div>` +
    P('Sur le manche, toutes les positions des notes de <b>' + name + '</b> sont allumées. N’importe quelle combinaison de ces points tombant sous tes doigts donne ce même accord : c’est comme ça qu’on trouve des positions alternatives.') +
    fretboardSVG(notes.map(n => n.pc), root) + LEGEND +
    KEY('Fondamentale = nom de l’accord · la tierce décide majeur / mineur · la quinte solidifie · on ajoute 7, 9, 6… pour colorer.');
}

/* ── 4. couleurs ── */
function lessonColors() {
  const r = coursSt.root;
  return H('D’où vient l’émotion d’un accord ?') +
    P('Chaque type d’accord a sa couleur, et elle vient des <b>intervalles</b> qu’il contient :') +
    P('• <b>La tierce</b> décide majeur ou mineur — joie ou tristesse.<br>• <b>La quinte</b> donne la solidité ; on la remarque à peine.<br>• <b>La septième</b> ajoute de la tension (♭7, bluesy) ou de la douceur (7, jazzy).<br>• <b>Les sus</b> remplacent la tierce par une 2 ou une 4 : ni joyeux ni triste, suspendu.<br>• <b>Les extensions</b> (6, 9, add9) ajoutent du scintillement.') +
    `<div class="cours-ctrl"><div class="fg"><label>Sur la fondamentale</label><select onchange="coursSt.root=+this.value;renderCoursLesson()">${rootOptions(r)}</select></div></div>` +
    `<div class="qual-grid">${QUAL_ORDER.map(k => { const Q = QUAL[k];
      return `<div class="qual-card"><div class="qn">${pcName(r)}${k}</div><div class="qs">${Q.n}</div><div class="qf">${Q.f}</div>
        <div class="qx">${Q.fx}</div><div class="qe">${Q.ex}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">${playBtn(`onclick="synthChord(${r},'${k}',false)"`)}
        <button type="button" class="btn btn-ghost btn-xs" onclick="coursSt.q='${k}';coursOpen('build')">Sur le manche</button></div></div>`; }).join('')}</div>` +
    P('Exercice : joue un <b>majeur</b> puis son <b>mineur</b>, puis son <b>sus4</b>. Tu entends la note qui bouge ? C’est toujours la tierce (ou ce qui la remplace).') +
    KEY('Majeur = joie · mineur = tristesse · 7 = tension qui veut résoudre · maj7 = rêverie · sus = attente · power chord = neutre et puissant.');
}

/* ── 5. décortiquer ── */
function lessonDissect() {
  const lib = findChord(coursSt.dec) || LIB[0], ch = newChord(lib.n), p = parseName(lib.n);
  const rows = [], uniq = [];
  let bass = null;
  ch.frets.forEach((fr, si) => {
    if (fr < 0) { rows.push(`<tr><td>${STRING_LABELS_FULL[si]}</td><td style="color:var(--terra);font-family:var(--mono)">X</td><td colspan="2" style="color:var(--cream4)">Pas jouée</td></tr>`); return; }
    const pc = (OPEN_MIDI[si] + fr) % 12, d = DEG[(pc - p.pc + 12) % 12], n = pcName(pc, p.flats);
    if (bass == null) bass = {pc, n};
    if (!uniq.includes(pc)) uniq.push(pc);
    rows.push(`<tr><td>${STRING_LABELS_FULL[si]}</td><td style="font-family:var(--mono)">${fr === 0 ? 'à vide' : 'case ' + fr}</td><td class="n">${n} <span style="font-weight:400;font-size:11px;color:var(--cream3)">${frNote(n)}</span></td><td>${degBadge(d)} ${DEG_ROLE[d]}</td></tr>`);
  });
  const ivs = uniq.map(pc => (pc - p.pc + 12) % 12).sort((a, b) => a - b);
  return H('Ce que tes doigts jouent vraiment') +
    P('Prends un accord que tu connais par cœur et regarde ce que fait chaque corde. Choisis-en un :') +
    `<div class="cours-ctrl"><div class="fg"><label>Accord</label><select onchange="coursSt.dec=this.value;renderCoursLesson()">${LIB.map(c => `<option ${c.n===lib.n?'selected':''}>${c.n}</option>`).join('')}</select></div>
      ${playBtn(`onclick="playName('${lib.n}')"`, 'Gratter')}${playBtn(`onclick="playName('${lib.n}',true)"`, 'Corde par corde')}</div>` +
    `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
      <div class="chord-cell"><div class="cn" style="font-size:24px">${lib.n}</div>${chordSVG(ch, {size:1.4})}</div>
      <div class="table-wrap" style="flex:1;min-width:260px;margin-top:0"><table class="ctable"><tr><th>Corde</th><th>Doigt</th><th>Note</th><th>Rôle</th></tr>${rows.join('')}</table></div>
    </div>` +
    `<div class="cours-formula">Notes différentes : <b>${uniq.map(pc => pcName(pc, p.flats)).join(' · ')}</b> → formule ${ivs.map(i => DEG[i]).join(' · ')}<br>
      Basse (note la plus grave) : <b>${bass ? bass.n : '—'}</b> ${bass && bass.pc !== p.pc ? '→ ce n’est pas la fondamentale : c’est un <b>renversement</b> (voir la leçon dédiée).' : '→ la fondamentale, comme il se doit.'}</div>` +
    P('Ce que tu remarques presque toujours :<br>1) Tu joues <b>plusieurs fois la même note</b> à des octaves différentes. Normal : 6 cordes pour 3 ou 4 notes.<br>2) La note la plus <b>grave</b> est en général la <b>fondamentale</b> : c’est elle qui ancre l’accord.<br>3) Les cordes en <b>X</b> sont étouffées parce qu’elles donneraient une note étrangère ou une mauvaise basse.') +
    KEY('Un accord de guitare = 3 ou 4 notes réparties (et doublées) sur 6 cordes · la basse doit être la fondamentale, sauf renversement voulu.');
}

/* ── 6. tonalité ── */
function lessonKey() {
  const k = coursSt.key, flats = keyFlats(k), kp = parseName(k).pc;
  const scale = SCALE.map(iv => pcName(kp + iv, flats));
  const chords = SCALE.map((_, d) => degChord(k, d));
  return H('Pourquoi certains accords vont ensemble') +
    P('Pourquoi G, C, D et Em sonnent si bien ensemble ? Parce qu’ils sortent tous de la même <b>gamme</b> : Sol majeur. Une <b>tonalité</b>, c’est une famille de 7 notes — et donc de 7 accords qui s’entendent naturellement.') +
    H('La gamme majeure') +
    P('Elle suit toujours le même schéma d’écarts : <b>Ton – Ton – ½ – Ton – Ton – Ton – ½</b> (en cases : 2-2-1-2-2-2-1). Depuis C, ça donne C D E F G A B : que des notes naturelles, d’où l’absence de dièse en Do majeur.') +
    keyChips(k, 'coursSetKey') +
    scaleSteps(k) +
    `<div style="margin-bottom:14px">${playBtn('onclick="coursPlayScale()"', 'Écouter la gamme')}</div>` +
    H('Les 7 accords de la tonalité') +
    P('En construisant une triade sur chaque note de la gamme (avec uniquement les notes de la gamme), on obtient toujours la même suite : <b>Majeur – mineur – mineur – Majeur – Majeur – mineur – diminué</b>. On les numérote en chiffres romains : majuscule = majeur, minuscule = mineur.') +
    `<div class="table-wrap"><table class="ctable"><tr><th>Degré</th><th>Accord</th><th>Rôle</th><th></th></tr>${chords.map((c, d) =>
      `<tr><td style="font-family:var(--mono);color:var(--gold2);font-weight:700">${ROMAN[d]}</td><td class="n">${c}</td><td>${FUNCS[d]}</td><td>${playBtn(`onclick="playName('${c}')"`, '')}</td></tr>`).join('')}</table></div>` +
    H('Le cercle des quintes') +
    P('Les tonalités rangées en cercle : chaque voisin est à une quinte. Les accords d’une tonalité sont toujours <b>regroupés</b> : I au centre, IV et V de chaque côté, et leurs relatifs mineurs (ii, iii, vi) juste en dessous. Clique une tonalité.') + circleSVG(k) +
    H('Les trois piliers : I, IV, V') +
    P('<b>I</b> = la maison. <b>IV</b> = on part se balader. <b>V</b> = on a envie de rentrer. Avec ces trois accords, tu peux accompagner des milliers de chansons. Le <b>vi</b> est le jumeau triste du I : ils partagent deux notes.') +
    H('Trouver la tonalité d’un morceau') +
    P('Regarde ta grille : le premier et surtout le <b>dernier</b> accord sont très souvent la tonique (le I). Vérifie ensuite que les autres accords font partie de sa famille. Exemple : G – Em – C – D → tous dans Sol majeur.') +
    KEY('Tonalité = famille de 7 accords · schéma M m m M M m dim · I = repos, IV = départ, V = tension, vi = version triste du I.');
}
function coursSetKey(k) { coursSt.key = k; renderCoursLesson(); }
function coursPlayScale() {
  const k = coursSt.key, kp = parseName(k).pc, base = 48 + kp - (kp > 6 ? 12 : 0);
  coursStop();
  SCALE.concat(12).forEach((iv, i) => coursSeqTimers.push(setTimeout(() => {
    document.querySelectorAll('.note-chip.now, .ss-note.now').forEach(e => e.classList.remove('now'));
    const el = $('sc-' + i); if (el) el.classList.add('now');
    playNote(base + iv);
  }, i*380)));
  coursSeqTimers.push(setTimeout(() => document.querySelectorAll('.note-chip.now, .ss-note.now').forEach(e => e.classList.remove('now')), 8*380 + 300));
}

/* ── 7. progressions ── */
const PROGS = [
  {n:'Les 4 accords magiques', d:[0,4,5,3], t:'La progression la plus utilisée de la pop. Stable, entraînante, universelle.', ex:'Let It Be, With or Without You, Someone Like You'},
  {n:'Le trio rock / folk', d:[0,3,4,0], t:'La base du rock ’n’ roll, du folk et de la country : maison → balade → tension → maison.', ex:'La Bamba, Twist and Shout, Wild Thing'},
  {n:'La version émouvante', d:[5,3,0,4], t:'Les mêmes 4 accords magiques, mais en démarrant sur le mineur : tout devient plus mélancolique.', ex:'Zombie, Despacito'},
  {n:'Années 50 (doo-wop)', d:[0,5,3,4], t:'Le son des slows rétro : la descente vers le vi donne un côté tendre.', ex:'Stand By Me, Every Breath You Take'},
  {n:'Le ii – V – I', d:[1,4,0], t:'L’enchaînement roi du jazz : chaque accord tire vers le suivant, jusqu’au repos final.', ex:'Standards de jazz, Autumn Leaves'},
  {n:'La cadence andalouse', d:[5,4,3,2], q:[null,null,null,''], t:'Descente depuis le mineur, avec un dernier accord rendu MAJEUR pour une tension espagnole.', ex:'Hit the Road Jack, Sultans of Swing'},
  {n:'Blues 12 mesures', d:[0,0,0,0,3,3,0,0,4,3,0,4], seven:true, t:'La grille du blues : 12 mesures, trois accords, tous en 7 pour le côté sale et tendu.', ex:'Johnny B. Goode, Sweet Home Chicago'},
];
function lessonProgs() {
  const k = coursSt.key;
  return H('Les grilles qui ont fait l’histoire') +
    P('Une <b>progression</b>, c’est un enchaînement d’accords. Comme on les note en chiffres romains, une même progression fonctionne dans <b>n’importe quelle tonalité</b> : change la tonalité ci-dessous et tout se transpose.') +
    keyChips(k, 'coursSetKey') +
    PROGS.map((pr, pi) => {
      const names = pr.d.map((d, j) => degChord(k, d, pr.seven ? '7' : (pr.q && pr.q[j] != null ? pr.q[j] : null)));
      const romans = pr.d.map((d, j) => { let r = ROMAN[d]; if (pr.q && pr.q[j] === '') r = r.toUpperCase(); return r + (pr.seven ? '7' : ''); });
      const id = 'pg' + pi;
      return `<div class="prog"><div class="prog-t"><div><div class="prog-n">${pr.n}</div><div class="prog-r">${romans.join(' – ')}</div></div>${playBtn(seqAttr(id, names), 'Jouer la grille')}</div>
        ${seqChips(id, names, romans)}
        <div class="prog-d">${pr.t}<br><i style="color:var(--cream4)">Ex. : ${pr.ex}</i></div></div>`;
    }).join('') +
    P('Astuce : pour composer, prends une de ces grilles, change l’ordre, remplace un accord par son relatif (I ↔ vi, IV ↔ ii) ou ajoute une 7e au V. Tu restes dans la famille, donc ça sonnera juste.') +
    KEY('Une progression se note en degrés (I, IV, V, vi…) · elle se transpose dans toutes les tonalités · I–V–vi–IV et I–IV–V couvrent une énorme partie de la pop et du rock.');
}

/* ── 8. tension & résolution ── */
const TENSIONS = [
  ['G7 → C', 'La dominante qui rentre à la maison', ['G7','C']],
  ['E7 → Am', 'Pareil, vers un accord mineur', ['E7','Am']],
  ['Asus4 → A', 'La quarte retombe sur la tierce', ['Asus4','A']],
  ['D → Dsus4 → Dsus2 → D', 'Faire respirer un accord sans changer de place', ['D','Dsus4','Dsus2','D']],
  ['C → Cmaj7 → C7 → F', 'Une note qui descend crée un chemin vers le F', ['C','Cmaj7','C7','F']],
  ['G → C → D7 → G', 'Cadence complète : départ, tension, retour', ['G','C','D7','G']],
];
function lessonTension() {
  return H('Tension et détente') +
    P('La musique alterne <b>tension</b> et <b>détente</b>. Une tension crée une attente ; la <b>résolution</b> la satisfait. C’est ce qui donne l’impression qu’une chanson « avance ».') +
    H('Le secret de l’accord de dominante (V7)') +
    P('<b>G7</b> contient les notes <b>B</b> et <b>F</b>. Entre elles : 6 demi-tons, un <b>triton</b>, l’intervalle le plus instable qui existe. Quand on passe à <b>C</b>, le B monte d’un demi-ton vers C et le F descend d’un demi-ton vers E. La tension se dissout d’un coup : ton oreille adore ce mouvement.') +
    voiceLeadSVG() +
    TENSIONS.map(([t, d, seq], i) => `<div class="prog"><div class="prog-t"><div><div class="prog-n">${t}</div><div class="prog-d" style="margin-top:2px">${d}</div></div>${playBtn(seqAttr('tn' + i, seq))}</div>${seqChips('tn' + i, seq)}</div>`).join('') +
    H('Les sus : la tension douce') +
    P('Un accord <b>sus4</b> remplace la tierce par la quarte, juste au-dessus. L’oreille attend que cette note redescende sur la tierce : Asus4 → A est un des gestes les plus utilisés en guitare acoustique.') +
    P('Astuce de compo : juste avant de revenir sur ton accord principal, transforme le V en <b>V7</b> ou passe par un <b>sus4</b>. Effet garanti.') +
    KEY('Tension = attente · résolution = soulagement · V7 → I est la résolution la plus forte · sus4 → majeur est la plus douce.');
}

/* ── 9. capo ── */
const CAPO_SHAPES = ['G','C','D','Em','Am','E','A','Dm'];
function lessonCapo() {
  const c = coursSt.capo;
  const capoNeeded = (coursSt.tgtKey - coursSt.shapeKey + 12) % 12;
  return H('Le capo transpose tout') +
    P('Le capo est une barre qui raccourcit toutes les cordes : il monte <b>tout</b> d’autant de demi-tons qu’il y a de cases. Tu gardes tes formes faciles (G, C, D, Em…) mais le son réel est plus aigu.') +
    `<div class="cours-formula">Son réel = forme jouée + nombre de cases de capo<br>Forme G + capo 2 → G, G♯, <b>A</b></div>` +
    H('Calculateur : forme → son réel') +
    `<div class="cours-ctrl"><div class="fg"><label>Capo</label><select onchange="coursSt.capo=+this.value;renderCoursLesson()">${[0,1,2,3,4,5,6,7,8,9].map(i => `<option value="${i}" ${c===i?'selected':''}>${i ? 'Case ' + i : 'Sans capo'}</option>`).join('')}</select></div></div>` +
    capoSVG(c) +
    `<div class="table-wrap"><table class="ctable"><tr><th></th><th>Tu joues la forme</th><th>Ça sonne comme</th></tr>${CAPO_SHAPES.map(s => {
      const p = parseName(s), real = pcName(p.pc + c) + p.q;
      return `<tr><td class="pl">${playBtn(`onclick="playChord(newChord('${s}'),${c})"`, '')}</td><td class="n">${s}</td><td class="n" style="color:var(--gold2)">${real}</td></tr>`; }).join('')}</table></div>` +
    H('Quel capo pour jouer dans la bonne tonalité ?') +
    P('Le morceau est en A mais tu veux jouer avec tes formes de G ? Compte les demi-tons de G jusqu’à A : G → G♯ → A = 2. Donc <b>capo 2</b>.') +
    `<div class="cours-ctrl">
      <div class="fg"><label>Tonalité du morceau</label><select onchange="coursSt.tgtKey=+this.value;renderCoursLesson()">${rootOptions(coursSt.tgtKey)}</select></div>
      <div class="fg"><label>Je veux jouer avec les formes de</label><select onchange="coursSt.shapeKey=+this.value;renderCoursLesson()">${['C','G','D','A','E'].map(n => { const v = parseName(n).pc; return `<option value="${v}" ${coursSt.shapeKey===v?'selected':''}>${n}</option>`; }).join('')}</select></div>
    </div>
    <div class="cours-formula">→ Mets le capo en <b>case ${capoNeeded}</b>${capoNeeded > 7 ? ' (un peu haut : essaie une autre famille de formes)' : capoNeeded === 0 ? ' : pas besoin de capo !' : ''}</div>` +
    P('Pourquoi utiliser un capo ? 1) <b>Adapter</b> un morceau à ta voix. 2) Jouer dans une tonalité difficile (E♭, B…) avec des formes faciles. 3) Obtenir un son plus <b>brillant</b>, ou jouer à deux guitares avec des formes différentes pour enrichir le son.') +
    KEY('Capo case n = tout monte de n demi-tons · les accords notés sur une grille « capo 2 » sont des formes, pas les vrais noms.');
}

/* ── 10. barrés ── */
function barreChord(shape, minor, root) {
  const f = (root - (shape === 'E' ? 4 : 9) + 12) % 12;
  let frets, fingers;
  if (shape === 'E') {
    frets = minor ? [f,f+2,f+2,f,f,f] : [f,f+2,f+2,f+1,f,f];
    fingers = f === 0 ? (minor ? [0,2,3,0,0,0] : [0,2,3,1,0,0]) : (minor ? [1,3,4,1,1,1] : [1,3,4,2,1,1]);
  } else {
    frets = minor ? [-1,f,f+2,f+2,f+1,f] : [-1,f,f+2,f+2,f+2,f];
    fingers = f === 0 ? (minor ? [0,0,2,3,1,0] : [0,0,1,2,3,0]) : (minor ? [0,1,3,4,2,1] : [0,1,3,3,3,1]);
  }
  return {id:uid(), name: pcName(root) + (minor ? 'm' : ''), frets, fingers, base: f > 1 ? f : 1, arp:[], fret: f};
}
function lessonBarre() {
  const r = coursSt.barreRoot;
  const cards = [['E',false],['E',true],['A',false],['A',true]].map(([sh, mi]) => {
    const c = barreChord(sh, mi, r), key = 'br' + sh + (mi ? 'm' : '');
    SEQ[key] = [c];
    return `<div class="lib-card"><div class="cn">${c.name}</div>${chordSVG(c, {size:1.15})}
      <div style="font-size:10px;color:var(--cream3);text-align:center">Forme ${sh}${mi ? 'm' : ''} · ${c.fret ? 'case ' + c.fret : 'accord ouvert'}</div>
      <button class="lib-play" onclick="playChord(SEQ['${key}'][0],0)"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></button></div>`;
  }).join('');
  const nat = (si) => Array.from({length: 13}, (_, f) => { const n = pcName(OPEN_MIDI[si] + f); return `<td style="${n.length===1?'color:var(--cream);font-weight:700':'color:var(--cream4)'}">${n}</td>`; }).join('');
  return H('Rendre une forme mobile') +
    P('Les accords ouverts utilisent les cordes à vide, ils sont donc fixés à un endroit du manche. Un <b>barré</b> remplace le sillet par ton index : la forme devient <b>mobile</b>. Même forme, autre case = autre accord.') +
    H('Forme de E : fondamentale sur la 6e corde') +
    P('Prends la forme de <b>E</b> (ou Em), avance-la d’une case et barre avec l’index : F (case 1), F♯ (case 2), G (case 3)… La note sous ton index, <b>sur la corde de Mi grave</b>, donne le nom de l’accord.') +
    H('Forme de A : fondamentale sur la 5e corde') +
    P('Même principe avec la forme de <b>A</b> (ou Am) : B♭ (case 1), B (case 2), C (case 3)… La note sous l’index <b>sur la corde de La</b> donne le nom.') +
    `<div class="cours-ctrl"><div class="fg"><label>Accord voulu</label><select onchange="coursSt.barreRoot=+this.value;renderCoursLesson()">${rootOptions(r)}</select></div></div>` +
    `<div class="lib-grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">${cards}</div>` +
    H('Ta carte des cordes graves') +
    P('Pour placer un barré, il suffit de connaître les notes des deux cordes graves :') +
    `<div class="table-wrap"><table class="ctable mini"><tr><th>Case</th>${Array.from({length:13}, (_, f) => `<th>${f}</th>`).join('')}</tr>
      <tr><th>E (6e)</th>${nat(0)}</tr><tr><th>A (5e)</th>${nat(1)}</tr></table></div>` +
    P('Conseil : le barré fait mal au début, c’est normal. Place l’index juste derrière la frette, roule-le légèrement sur sa tranche, et ne serre pas plus que nécessaire.') +
    KEY('Forme E : nom = note sur la corde de Mi grave · forme A : nom = note sur la corde de La · 2 formes × majeur/mineur = 48 accords.');
}

/* ── 11. renversements ── */
const SLASH = [
  {name:'C/G',  frets:[3,3,2,0,1,0],    fingers:[3,4,2,0,1,0]},
  {name:'G/B',  frets:[-1,2,0,0,0,3],   fingers:[0,1,0,0,0,3]},
  {name:'D/F#', frets:[2,-1,0,2,3,2],   fingers:[1,0,0,2,4,3]},
  {name:'Am/G', frets:[3,0,2,2,1,0],    fingers:[4,0,2,3,1,0]},
  {name:'C/E',  frets:[0,3,2,0,1,0],    fingers:[0,3,2,0,1,0]},
].map(c => ({...c, id:uid(), base:1, arp:[]}));
function lessonInversions() {
  const walk = [newChord('C'), SLASH[1], newChord('Am'), SLASH[3], newChord('F')];
  SEQ.walk = walk;
  SLASH.forEach((c, i) => SEQ['sl' + i] = [c]);
  return H('Changer la note du bas') +
    P('Un accord n’est pas obligé d’avoir sa fondamentale à la basse. Quand une autre note de l’accord est la plus grave, on parle de <b>renversement</b>. On l’écrit avec un slash : <b>C/G</b> = « accord de C, avec G à la basse ».') +
    `<div class="lib-grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr));margin:10px 0 16px">${SLASH.map((c, i) => `<div class="lib-card"><div class="cn">${c.name}</div>${chordSVG(c)}
      <button class="lib-play" onclick="playChord(SEQ['sl${i}'][0],0)"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg></button></div>`).join('')}</div>` +
    P('Pour D/F♯, le F♯ grave se joue souvent avec le <b>pouce</b> qui passe par-dessus le manche (case 2 du Mi grave).') +
    H('À quoi ça sert : les lignes de basse') +
    P('Au lieu de sauter d’un accord à l’autre, la basse peut <b>glisser</b> note par note. Écoute cette descente : la basse fait C → B → A → G → F pendant que les accords changent.') +
    `<div class="prog"><div class="prog-t"><div><div class="prog-n">C – G/B – Am – Am/G – F</div><div class="prog-r">basse : C · B · A · G · F</div></div>${playBtn('onclick="playSeq(\'walk\')"', 'Écouter')}</div>
      ${seqChips('walk', ['C','G/B','Am','Am/G','F'], ['C','B','A','G','F'])}</div>` +
    P('C’est aussi pour ça qu’on étouffe certaines cordes : dans un C, on évite le Mi grave à vide pour ne pas avoir E (la tierce) à la basse… sauf si on veut justement un C/E.') +
    KEY('X/Y = accord X avec la note Y à la basse · les renversements créent des basses qui marchent au lieu de sauter.');
}

/* ── 12. oreille ── */
const QUIZ_LVLS = [['Majeur ou mineur ?', ['','m']], ['+ septième', ['','m','7']], ['Les couleurs', ['','m','7','maj7','sus4','dim']]];
function lessonEar() {
  const z = coursSt.quiz, opts = QUIZ_LVLS[z.lvl][1];
  return H('Entendre avant de comprendre') +
    P('La théorie, c’est bien ; reconnaître à l’oreille, c’est mieux. Écoute l’accord mystère et devine son type. Commence par majeur / mineur : est-ce que ça sonne <b>lumineux</b> ou <b>sombre</b> ?') +
    `<div class="filters">${QUIZ_LVLS.map(([n], i) => `<button type="button" class="filt ${z.lvl===i?'on':''}" onclick="coursSt.quiz.lvl=${i};coursSt.quiz.cur=null;coursSt.quiz.fb='';renderCoursLesson()">${n}</button>`).join('')}</div>` +
    `<div class="fcard" style="text-align:center;background:var(--bg2)">
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button type="button" class="btn btn-primary btn-sm" onclick="quizNew()">${z.cur ? 'Accord suivant' : 'Jouer un accord mystère'}</button>
        ${z.cur ? `<button type="button" class="btn btn-ghost btn-sm" onclick="quizReplay(false)">Rejouer</button><button type="button" class="btn btn-ghost btn-sm" onclick="quizReplay(true)">Note par note</button>` : ''}
      </div>
      <div class="filters" style="justify-content:center;margin:16px 0 0">${opts.map(q => `<button type="button" class="filt" ${z.cur ? '' : 'disabled style="opacity:.4"'} onclick="quizAnswer('${q}')">${QUAL[q].n}</button>`).join('')}</div>
      <div class="quiz-fb">${z.fb}</div>
      <div style="font-family:var(--mono);font-size:12px;color:var(--cream3)">Score : ${z.ok} / ${z.n}</div>
    </div>` +
    P('Repères : le <b>majeur</b> est franc et ensoleillé ; le <b>mineur</b> plus voilé ; le <b>7</b> a un petit côté « pas fini », bluesy ; le <b>maj7</b> est doux et flotte ; le <b>sus4</b> semble attendre quelque chose ; le <b>diminué</b> est inquiétant.') +
    KEY('Entraîne-toi 5 minutes par jour · d’abord majeur / mineur, puis ajoute un type à la fois.');
}
function quizNew() {
  const z = coursSt.quiz, opts = QUIZ_LVLS[z.lvl][1];
  z.cur = {pc: Math.floor(Math.random()*12), q: opts[Math.floor(Math.random()*opts.length)], answered:false};
  z.fb = 'Écoute… quel type d’accord ?';
  renderCoursLesson();
  synthChord(z.cur.pc, z.cur.q, false);
}
function quizReplay(arp) { const c = coursSt.quiz.cur; if (c) synthChord(c.pc, c.q, arp); }
function quizAnswer(q) {
  const z = coursSt.quiz, c = z.cur; if (!c) return;
  const good = q === c.q, name = pcName(c.pc) + c.q;
  if (!c.answered) { z.n++; if (good) z.ok++; c.answered = true; }
  z.fb = good
    ? `<b class="ok">Bravo !</b> C était <b>${name}</b> (${QUAL[c.q].n}) — ${QUAL[c.q].fx}`
    : `<b class="ko">Pas tout à fait.</b> C était <b>${name}</b> (${QUAL[c.q].n}), tu as répondu ${QUAL[q].n}. Réécoute en comparant.`;
  renderCoursLesson();
}

/* ── shell ── */
const COURS = [
  {k:'notes',     t:'Les notes',               m:3, f:lessonNotes},
  {k:'intervals', t:'Les intervalles',         m:4, f:lessonIntervals},
  {k:'build',     t:'Construire un accord',    m:5, f:lessonBuild},
  {k:'colors',    t:'Couleurs & effets',       m:4, f:lessonColors},
  {k:'dissect',   t:'Décortiquer un accord',   m:4, f:lessonDissect},
  {k:'key',       t:'Tonalité & familles',     m:5, f:lessonKey},
  {k:'progs',     t:'Progressions célèbres',   m:5, f:lessonProgs},
  {k:'tension',   t:'Tension & résolution',    m:5, f:lessonTension},
  {k:'capo',      t:'Capo & transposition',    m:4, f:lessonCapo},
  {k:'barre',     t:'Barrés : formes mobiles', m:6, f:lessonBarre},
  {k:'inv',       t:'Renversements & basses',  m:5, f:lessonInversions},
  {k:'ear',       t:'Entraîner l’oreille',     m:5, f:lessonEar},
];
/* Cours : trois états. 'list' = carte héro + leçons à la carte ; 'lesson' = une leçon ; 'path' = le parcours guidé détaillé */
let coursView = 'list', coursAll = false;

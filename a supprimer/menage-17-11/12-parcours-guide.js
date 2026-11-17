/* ═══════ PARCOURS GUIDÉ ═══════
   6 chapitres, 33 étapes (PATH2). Carte animée, ouverture d’étape (disque → plein écran), vraie action de l’appli
   (exo / cours / rc / prog / fiche), retour sur l’étape avec « J’ai réussi », jalon de fin de chapitre.
   Progression : exoProg.path2 = {idÉtape: date}. Tout est préfixé pc-. */
const PATH2 = [
 {ch:1, titre:'Premiers sons', emoji:'🎸', couleur:'gold', etapes:[
  {id:'p1-1', titre:'Accorde ta guitare', but:'Avoir une guitare juste, sinon rien ne sonne.', action:{type:'exo', ref:'tune5'}, reussite:'Plus aucun battement entre les cordes.', min:5, jalon:'Ta guitare est prête.'},
  {id:'p1-2', titre:'Les notes, en 3 minutes', but:'Savoir nommer les cordes à vide : Mi La Ré Sol Si Mi.', action:{type:'cours', ref:'notes'}, reussite:'Tu nommes les 6 cordes sans hésiter.', min:6, jalon:'Tu parles la langue de la guitare.'},
  {id:'p1-3', titre:'Réveille tes doigts', but:'Un doigt par case, sans forcer.', action:{type:'exo', ref:'spider'}, reussite:'4 cordes propres à 60 BPM.', min:5, jalon:'Tes doigts commencent à obéir.'},
  {id:'p1-4', titre:'Ton premier accord qui sonne', but:'Passer de Em à Am (2 accords à 2-3 doigts).', action:{type:'exo', ref:'omc', param:'Em-Am'}, reussite:'10 changements en 1 minute, même sales.', min:5, jalon:'Tu changes d\u2019accord.'},
  {id:'p1-5', titre:'Un coup par temps', but:'Gratter régulièrement vers le bas.', action:{type:'exo', ref:'down4', param:null}, reussite:'1 minute sur Em puis G, calé sur le clic à 70 BPM.', min:5, jalon:'Tu joues EN RYTHME : première vraie sensation.'}
 ]},
 {ch:2, titre:'Les accords magiques', emoji:'✨', couleur:'terra', etapes:[
  {id:'p2-1', titre:'Construis G, C, D, Em', but:'Comprendre comment un accord se pose, pas le recopier.', action:{type:'cours', ref:'build'}, reussite:'Tu poses G, C, D, Em sans regarder la photo.', min:8, jalon:'Les 4 accords de la moitié des chansons.'},
  {id:'p2-2', titre:'G vers C', but:'Le changement le plus courant en chanson.', action:{type:'exo', ref:'omc', param:'G-C'}, reussite:'15 changements en 1 minute.', min:5, jalon:null},
  {id:'p2-3', titre:'Le doigt qui ne bouge pas', but:'Repérer les doigts pivots pour changer plus vite.', action:{type:'exo', ref:'anchor', param:'C-G'}, reussite:'Le pivot ne quitte jamais la corde.', min:5, jalon:'Tu changes plus malin, pas plus vite.'},
  {id:'p2-4', titre:'C vers D', but:'Le changement qui fait peur, apprivoisé.', action:{type:'exo', ref:'omc', param:'C-D'}, reussite:'15 changements en 1 minute.', min:5, jalon:null},
  {id:'p2-5', titre:'Ta première suite', but:'Enchaîner G, D, C, G sans t\u2019arrêter, à 4 coups par accord.', action:{type:'prog', ref:'f4', param:'noires'}, reussite:'La boucle 4 fois de suite sans casser le tempo.', min:7, jalon:'Tu joues ta 1re suite d\u2019accords.'}
 ]},
 {ch:3, titre:'Le rythme qui groove', emoji:'🔥', couleur:'sage', etapes:[
  {id:'p3-1', titre:'Le balancier', but:'La main droite ne s\u2019arrête jamais.', action:{type:'rc', ref:'rc2'}, reussite:'8 mesures régulières à 70 BPM.', min:5, jalon:null},
  {id:'p3-2', titre:'Le rythme feu de camp', but:'Jouer D – DU – UDU, le rythme passe-partout.', action:{type:'rc', ref:'rc7'}, reussite:'8 mesures à 85 BPM sans regarder ta main.', min:8, jalon:'Tu tiens LE rythme du feu de camp.'},
  {id:'p3-3', titre:'Feu de camp : G Em C D', but:'Marier suite et rythme : ta première chanson-type.', action:{type:'prog', ref:'f1', param:'feucamp'}, reussite:'2 minutes de boucle, tu peux fredonner dessus.', min:10, jalon:'Tu sais jouer ta 1re chanson feu de camp !'},
  {id:'p3-4', titre:'Le « tchak »', but:'Étouffer sur 2 et 4 pour un son de vraie guitare pop.', action:{type:'rc', ref:'rc6'}, reussite:'Le « tchak » est sec et en place à 85 BPM.', min:6, jalon:null},
  {id:'p3-5', titre:'Même suite, autre énergie', but:'Sentir qu\u2019un rythme change tout.', action:{type:'prog', ref:'j3', param:'chuck'}, reussite:'Tu joues G C G D en chuck, puis en croches, et tu entends la différence.', min:8, jalon:'Tu changes d\u2019ambiance en changeant de rythme.'}
 ]},
 {ch:4, titre:'Selon ton mood', emoji:'🎭', couleur:'mauve', etapes:[
  {id:'p4-1', titre:'Pourquoi ça sonne triste ou joyeux', but:'Comprendre mineur / majeur et la notion de tonalité.', action:{type:'cours', ref:'key'}, reussite:'Tu distingues un accord joyeux d\u2019un triste à l\u2019oreille.', min:8, jalon:null},
  {id:'p4-2', titre:'Ambiance triste', but:'Jouer Em, C, G, D doucement.', action:{type:'prog', ref:'t1', param:'ballade'}, reussite:'La suite coule à 75 BPM, doux.', min:8, jalon:'Tu fais pleurer la guitare.'},
  {id:'p4-3', titre:'Ambiance énergique', but:'Même technique, mais en mode rock.', action:{type:'prog', ref:'e4', param:'rockaere'}, reussite:'A G D A à 110 BPM, énergique et propre.', min:8, jalon:null},
  {id:'p4-4', titre:'Ambiance rêveuse', but:'Accords « nuages » (add9, maj7), les plus beaux.', action:{type:'prog', ref:'r5', param:'douce'}, reussite:'Gmaj7, Cadd9, Gmaj7, Em7 sans buter.', min:9, jalon:'Tu joues des accords de pro.'},
  {id:'p4-5', titre:'Les 4 accords des tubes', but:'Reconnaître la grille I – V – vi – IV partout.', action:{type:'cours', ref:'progs'}, reussite:'Tu la joues en C puis en G.', min:8, jalon:null},
  {id:'p4-6', titre:'Ta fiche « mood »', but:'Garder une suite qui te plaît pour de bon.', action:{type:'fiche', ref:'new', param:'une suite de ton ambiance préférée (nom, accords, rythme)'}, reussite:'Fiche créée et rejouée depuis la fiche.', min:6, jalon:'Ta bibliothèque démarre.'}
 ]},
 {ch:5, titre:'Arpèges & effets', emoji:'🌙', couleur:'gold2', etapes:[
  {id:'p5-1', titre:'Décortiquer un accord', but:'Voir chaque note qui compose l\u2019accord.', action:{type:'cours', ref:'dissect'}, reussite:'Tu nommes les notes de C.', min:8, jalon:null},
  {id:'p5-2', titre:'Arpège p-i-m-a', but:'Jouer les notes une par une, au doigt.', action:{type:'exo', ref:'pima'}, reussite:'4 notes de même volume à 70 BPM.', min:7, jalon:'Tu fais chanter l\u2019accord.'},
  {id:'p5-3', titre:'Brume en arpège', but:'Appliquer l\u2019arpège à une vraie suite.', action:{type:'prog', ref:'m3', param:'douce'}, reussite:'Am, Em, Fmaj7, C en arpège, sans rater de corde.', min:9, jalon:'Ton premier morceau d\u2019ambiance.'},
  {id:'p5-4', titre:'Hammer-on & pull-off', but:'Lier des notes sans les gratter.', action:{type:'exo', ref:'hammer'}, reussite:'Trille régulière à 80 BPM.', min:6, jalon:null},
  {id:'p5-5', titre:'Les glissés', but:'Ajouter du chant avec la main gauche.', action:{type:'exo', ref:'slide'}, reussite:'La note d\u2019arrivée sonne autant que la 1re.', min:5, jalon:null},
  {id:'p5-6', titre:'Arpège + hammer', but:'Le détail qui fait « folk ».', action:{type:'exo', ref:'combo'}, reussite:'Le hammer s\u2019entend sans casser le rythme.', min:7, jalon:'Tu joues avec le style.'}
 ]},
 {ch:6, titre:'Je joue mes morceaux', emoji:'🏆', couleur:'terra', etapes:[
  {id:'p6-1', titre:'Le barré en marches', but:'Venir au F, doucement.', action:{type:'exo', ref:'barre'}, reussite:'Chaque corde du F sonne.', min:8, jalon:'Tu attaques le mur du barré.'},
  {id:'p6-2', titre:'C vers F', but:'Le changement du barré.', action:{type:'exo', ref:'omc', param:'C-F'}, reussite:'8 changements en 1 minute (ça viendra).', min:6, jalon:null},
  {id:'p6-3', titre:'Do-la-fa-sol', but:'Jouer la grille pop la plus répandue (mini-F ou Fmaj7 si besoin).', action:{type:'prog', ref:'f2', param:'ballade'}, reussite:'La boucle complète, 2 minutes.', min:9, jalon:'Tu joues les hits de la radio.'},
  {id:'p6-4', titre:'Capo : même grille, autre voix', but:'Adapter un morceau à ta voix.', action:{type:'cours', ref:'capo'}, reussite:'Tu transposes f2 avec le capo.', min:7, jalon:null},
  {id:'p6-5', titre:'Entends ce que tu joues', but:'Reconnaître majeur et mineur à l\u2019oreille.', action:{type:'exo', ref:'earchords'}, reussite:'9 bonnes réponses sur 10.', min:5, jalon:null},
  {id:'p6-6', titre:'Crée la fiche de TON morceau', but:'Mettre un vrai morceau dans l\u2019appli.', action:{type:'fiche', ref:'new', param:'un morceau que tu aimes : accords, rythme, paroles repliées'}, reussite:'Fiche créée, jouable à la volée.', min:10, jalon:'Tu joues TES morceaux !'}
 ]}
];
const PC_TYPE = {
  exo:  {k:'Exercice',      btn:'Lancer l’exercice', ico:'<path d="M4 12h3l2-6 4 12 2-6h5"/>'},
  cours:{k:'Cours',         btn:'Ouvrir le cours',   ico:'<path d="M4 5.5C7 4 10 4.5 12 6.5c2-2 5-2.5 8-1V19c-3-1.5-6-1-8 1-2-2-5-2.5-8-1z"/><path d="M12 6.5V20"/>'},
  rc:   {k:'Rythme',        btn:'Lancer le rythme',  ico:'<path d="M6 19V8M12 19V5M18 19V11"/>'},
  prog: {k:'Suite d’accords', btn:'Jouer la suite',  ico:'<rect x="4" y="5" width="16" height="14" rx="3"/><path d="M9 5v14M15 5v14"/>'},
  fiche:{k:'Fiche',         btn:'Créer la fiche',    ico:'<path d="M7 3h8l4 4v14H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>'}
};
const PC_COL = {gold:'--gold', terra:'--terra', sage:'--sage', mauve:'--mauve', gold2:'--gold3'};
const PC_NS = 'http://www.w3.org/2000/svg';
const pcI = (p, w = 22) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const PC_CLOCK = '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';
const PC_CHECK = '<svg class="pc-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const PC_LOCK = '<svg class="pc-ic-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
const PC_ARROW = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const pcRM = () => mReduced();
const pcWait = ms => new Promise(r => setTimeout(r, pcRM() ? Math.min(ms, 30) : ms));
const pcCol = c => `var(${PC_COL[c.couleur]})`;
const PC_KEEP = new Set(['exo', 'cours', 'ed', 'sheet']);   // vues où une action lancée depuis le parcours reste « en cours »

/* aplati + mise en page (fixe : 390 px de large, la carte est mise à l'échelle sur petit écran) */
const PC_ITEMS = [], PC_STEPS = []; let PC_H = 0;
(function () {
  let gi = 0, y = 78, sn = 0;
  PATH2.forEach(c => {
    const start = gi, ban = {kind:'ban', c, start, end:start + c.etapes.length, mins:c.etapes.reduce((n, e) => n + e.min, 0), x:195, y};
    PC_ITEMS.push(ban); y += 124;
    c.etapes.forEach((e, n) => {
      const s = sn++ % 2 ? 1 : -1;
      const st = {kind:'step', c, e, n, gi:gi++, last:n === c.etapes.length - 1, x:Math.round(195 + s*(58 + 30*Math.abs(Math.sin(sn*1.7)))), y};
      PC_ITEMS.push(st); PC_STEPS.push(st); y += 116;
    });
  });
  PC_H = y + 20;
})();

/* progression : exoProg.path2 = {idÉtape: date}. Les étapes se débloquent dans l'ordre. */
const pcProg = () => exoProg.path2 || (exoProg.path2 = {});
const pcCur = () => { const i = PC_STEPS.findIndex(s => !pcProg()[s.e.id]); return i < 0 ? PC_STEPS.length : i; };
function pcState(it) {
  const d = pcCur();
  if (it.kind === 'ban') return d >= it.end ? 'done' : d >= it.start ? 'cur' : 'lock';
  return it.gi < d ? 'done' : it.gi === d ? 'cur' : 'lock';
}
const pcReached = it => pcState(it) !== 'lock';
const coursDone = () => { const d = new Set(); PC_STEPS.forEach(s => { if (s.e.action.type === 'cours' && pcProg()[s.e.id]) d.add(s.e.action.ref); }); return d; };

let pcRet = null;                     // action lancée depuis le parcours : {id}
let pcM = null;                       // carte montée
let pcBusy = false, pcCurIt = null, pcSrc = null;

/* ── carte héro ── */
function pcBarsHTML() {
  const d = pcCur();
  return PATH2.map(c => { const s = PC_ITEMS.find(x => x.kind === 'ban' && x.c === c);
    return `<i style="--cc:${pcCol(c)};--f:${Math.max(0, Math.min(1, (d - s.start)/c.etapes.length))}"></i>`; }).join('');
}
function pcNextHTML() {
  const d = pcCur(), it = PC_STEPS[d];
  return it ? `<small>${d ? 'Prochaine étape' : 'Pour commencer'} · Chapitre ${it.c.ch}</small><h3>${esc(it.e.titre)}</h3>
      <div class="pc-chips"><span class="pc-chip">${pcI(PC_CLOCK, 12)}${it.e.min} min</span><span class="pc-chip">${PC_TYPE[it.e.action.type].k}</span></div>`
    : `<small>Parcours terminé</small><h3>Bravo, tu joues tes morceaux</h3>`;
}
const pcCtaLabel = () => { const d = pcCur(); return d >= PC_STEPS.length ? 'Revoir la carte' : d ? 'Continuer' : 'Commencer'; };
function pcHeroHTML(still) {
  const d = pcCur(), T = PC_STEPS.length;
  const strings = [0, 1, 2, 3, 4, 5].map(i => { const yy = 24 + i*34;
    return `<path d="M-10 ${yy} Q180 ${yy + (i % 2 ? 9 : -9)} 370 ${yy + 4}"${still ? '' : ' style="stroke-dasharray:420;stroke-dashoffset:420"'}/>`; }).join('');
  return `<section class="pc-hero ${still ? 'pc-still' : 'pc-rise'}" style="--d:120ms" aria-label="Parcours guidé">
    <svg class="pc-hero-strings" viewBox="0 0 358 220" preserveAspectRatio="none" aria-hidden="true">${strings}</svg>
    <div class="pc-hero-k">Ton parcours guidé</div>
    <div class="pc-hero-main">
      <div class="pc-ring" role="img" aria-label="${d} étapes sur ${T}"><svg viewBox="0 0 84 84" aria-hidden="true"><circle class="pc-tr" cx="42" cy="42" r="36"/><circle class="pc-pg" id="pc-pg" cx="42" cy="42" r="36"/></svg>
        <div class="pc-ring-n"><b id="pc-hn">${still ? d : 0}</b><i>sur ${T}</i></div></div>
      <div class="pc-hero-next" id="pc-hnext">${pcNextHTML()}</div></div>
    <div class="pc-bars" id="pc-bars">${pcBarsHTML()}</div>
    <button type="button" class="pc-cta" id="pc-go" onclick="pcContinue()"><span>${pcCtaLabel()}</span>${PC_ARROW}</button></section>`;
}
function pcHeroAfter(still) {
  const d = pcCur(), T = PC_STEPS.length, pg = $('pc-pg'), hn = $('pc-hn'); if (!pg) return;
  const target = 226.2*(1 - d/T);
  if (still || pcRM()) { pg.style.strokeDashoffset = target; hn.textContent = d; return; }
  document.querySelectorAll('.pc-hero-strings path').forEach((p, i) => p.animate([{strokeDashoffset:420}, {strokeDashoffset:0}], {duration:1300, delay:300 + i*90, easing:'cubic-bezier(.22,.8,.3,1)', fill:'forwards'}));
  pg.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,.8,.3,1) .5s';
  requestAnimationFrame(() => { pg.style.strokeDashoffset = target; });
  pcCount(hn, 0, d, 500);
}
function pcCount(el, from, to, delay) {
  const t0 = performance.now() + delay, dur = pcRM() ? 1 : 1100;
  (function tick(t) { const p = Math.max(0, Math.min(1, (t - t0)/dur)); el.textContent = Math.round(from + (to - from)*(1 - Math.pow(1 - p, 3))); if (p < 1 && el.isConnected) requestAnimationFrame(tick); })(performance.now());
}
function pcPaintHero(animate) {
  const d = pcCur(), T = PC_STEPS.length, hero = document.querySelector('.pc-hero'); if (!hero) return;
  hero.classList.remove('pc-still');
  $('pc-bars').classList.add('pc-repaint'); $('pc-bars').innerHTML = pcBarsHTML();
  const ptc = $('pc-ptc'); if (ptc) ptc.textContent = `${d} / ${T} étapes`;
  const lab = document.querySelector('#pc-go span'); if (lab) lab.textContent = pcCtaLabel();
  const ring = document.querySelector('.pc-ring'); if (ring) ring.setAttribute('aria-label', `${d} étapes sur ${T}`);
  const pg = $('pc-pg'), hn = $('pc-hn'), hx = $('pc-hnext'), rm = pcRM();
  pg.style.transition = rm ? 'none' : 'stroke-dashoffset 1.2s cubic-bezier(.22,.8,.3,1)';
  requestAnimationFrame(() => { pg.style.strokeDashoffset = 226.2*(1 - d/T); });
  pcCount(hn, +hn.textContent || 0, d, 0);
  if (animate && !rm) {
    hx.animate([{opacity:1, transform:'none'}, {opacity:0, transform:'translateY(-8px)'}], {duration:180, fill:'forwards'}).finished.then(() => {
      hx.innerHTML = pcNextHTML();
      hx.animate([{opacity:0, transform:'translateY(8px)'}, {opacity:1, transform:'none'}], {duration:280, easing:'cubic-bezier(.22,.8,.3,1)', fill:'forwards'}); });
  } else hx.innerHTML = pcNextHTML();
}

/* ── carte du parcours ── */
function pcNodeHTML(it) {
  const st = pcState(it);
  if (it.kind === 'ban') {
    return `<div class="pc-rv"><div class="pc-ban-in"><div class="pc-ban-d">${it.c.emoji}<em>${pcI('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 12)}</em></div>
      <div class="pc-ban-t"><small>Chapitre ${it.c.ch}</small><b>${esc(it.c.titre)}</b><i>${it.c.etapes.length} étapes · ${it.mins} min</i></div></div></div>`;
  }
  const e = it.e, left = it.x > 195, inner = st === 'done' ? PC_CHECK : st === 'cur' ? `<span>${it.c.ch}.${it.n + 1}</span>` : PC_LOCK;
  return `<div class="pc-rv"><button type="button" class="pc-dot" aria-label="Étape ${it.c.ch}.${it.n + 1} : ${esc(e.titre)}${st === 'done' ? ', réussie' : st === 'cur' ? ', à faire' : ', verrouillée'}" ${st === 'lock' ? 'aria-disabled="true"' : ''}>${inner}</button>
    <div class="pc-lab ${left ? 'pc-l' : 'pc-r'}"><small>Étape ${it.c.ch}.${it.n + 1}</small><b>${esc(e.titre)}</b><i>${e.min} min · ${PC_TYPE[e.action.type].k}</i></div></div>`;
}
function pcRenderNode(it, M) {
  const el = document.createElement('div');
  el.className = (it.kind === 'ban' ? 'pc-ban' : 'pc-node') + ' pc-st-' + pcState(it);
  el.style.left = it.x + 'px'; el.style.top = it.y + 'px'; el.style.setProperty('--cc', pcCol(it.c));
  el.innerHTML = pcNodeHTML(it);
  M.map.appendChild(el); M.els.set(it, el);
  if (it.kind === 'step') el.querySelector('.pc-dot').addEventListener('click', () => pcOpenStep(it));
  return el;
}
function pcRebuild(it, extra) {
  const M = pcM, old = M.els.get(it), wasIn = old.querySelector('.pc-rv').classList.contains('pc-in');
  old.remove(); const el = pcRenderNode(it, M);
  const rv = el.querySelector('.pc-rv'); rv.style.transition = 'none'; if (wasIn) rv.classList.add('pc-in');
  if (extra) el.classList.add(extra);
  return el;
}
function pcBurst(el) { const b = document.createElement('div'); b.className = 'pc-burst'; el.appendChild(b); setTimeout(() => b.remove(), 900); }

function pcFit() {
  const M = pcM; if (!M) return;
  const vw = document.documentElement.clientWidth, s = Math.min(1, vw/390);
  M.s = s;
  M.mapw.style.width = vw + 'px'; M.mapw.style.marginLeft = `calc(50% - ${vw/2}px)`; M.mapw.style.height = Math.round(PC_H*s) + 'px';
  M.map.style.transform = `translateX(${(vw - 390*s)/2}px) scale(${s})`;
  pcParallax();
}
function pcParallax() {
  const M = pcM; if (!M) return; M.tick = false; if (pcRM()) return;
  const mid = (innerHeight/2 - M.mapw.getBoundingClientRect().top)/M.s;
  for (const p of M.pars) p.e.style.transform = `translate3d(0,${((mid - p.y)*p.f).toFixed(1)}px,0)`;
}
function pcUnmount() {
  const M = pcM; if (!M) return;
  removeEventListener('scroll', M.onScroll); removeEventListener('resize', M.onResize); M.io.disconnect();
  pcM = null;
}
function pcMount(still) {
  pcUnmount();
  still = still || pcRM();
  $('cours-hero').innerHTML = pcHeroHTML(still);
  const host = $('cours-map');
  host.innerHTML = `<div class="pc-ptitle ${still ? '' : 'pc-rise'}" style="--d:260ms"><h3>La carte</h3><span id="pc-ptc">${pcCur()} / ${PC_STEPS.length} étapes</span></div>
    <div class="pc-mapw" id="pc-mapw"><div id="pc-map"></div></div>
    <div class="pc-endcap">Chaque corde que tu fais vibrer<br>t’emmène un peu plus loin.</div>`;
  const M = pcM = {map:$('pc-map'), mapw:$('pc-mapw'), els:new Map(), segs:[], pars:[], s:1, tick:false};
  M.map.style.height = PC_H + 'px';
  const svg = document.createElementNS(PC_NS, 'svg'); svg.setAttribute('class', 'pc-path'); svg.setAttribute('viewBox', `0 0 390 ${PC_H}`); svg.setAttribute('aria-hidden', 'true');
  M.map.appendChild(svg);
  const segD = (a, b) => { const dy = (b.y - a.y)*.55; return `C${a.x} ${a.y + dy} ${b.x} ${b.y - dy} ${b.x} ${b.y}`; };
  let dAll = `M${PC_ITEMS[0].x} ${PC_ITEMS[0].y}`;
  for (let i = 0; i < PC_ITEMS.length - 1; i++) dAll += segD(PC_ITEMS[i], PC_ITEMS[i + 1]);
  const mk = (cls, d) => { const p = document.createElementNS(PC_NS, 'path'); p.setAttribute('class', cls); p.setAttribute('d', d); svg.appendChild(p); return p; };
  M.base = mk('pc-base', dAll);
  for (let i = 0; i < PC_ITEMS.length - 1; i++) {
    const d = `M${PC_ITEMS[i].x} ${PC_ITEMS[i].y}` + segD(PC_ITEMS[i], PC_ITEMS[i + 1]);
    const g = mk('pc-glow', d), l = mk('pc-lit', d), L = l.getTotalLength(), lit = pcReached(PC_ITEMS[i + 1]);
    [g, l].forEach(p => { p.style.strokeDasharray = L; p.style.strokeDashoffset = (lit && still) ? 0 : L; });
    M.segs.push({i, l, g, L, lit});
  }
  M.spark = document.createElementNS(PC_NS, 'circle'); M.spark.setAttribute('id', 'pc-spark'); M.spark.setAttribute('r', '6'); svg.appendChild(M.spark);
  /* décor en parallaxe léger */
  const addPar = (cls, html, x, yy, f) => { const e = document.createElement('div'); e.className = 'pc-par ' + cls; e.setAttribute('aria-hidden', 'true'); e.innerHTML = html; e.style.left = x + 'px'; e.style.top = yy + 'px'; M.map.appendChild(e); M.pars.push({e, y:yy, f}); };
  PC_ITEMS.forEach(it => { if (it.kind === 'ban') addPar('pc-wm', it.c.emoji, it.c.ch % 2 ? 230 : -30, it.y + 20, .38); });
  const glyphs = ['♪', '♫', '♩', '♬'];
  for (let i = 0; i < 14; i++) addPar('pc-gl', glyphs[i % 4], 14 + (i*97) % 330, 120 + i*(PC_H/14), .18 + (i % 3)*.08);
  for (let i = 0; i < 22; i++) addPar('pc-fm', '', 8 + (i*61) % 370, 60 + i*(PC_H/22), .12 + (i % 4)*.05);
  PC_ITEMS.forEach(it => pcRenderNode(it, M));
  /* apparition des nœuds au défilement */
  let first = !still;
  M.io = new IntersectionObserver(es => {
    const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    vis.forEach((e, i) => { const rv = e.target.querySelector('.pc-rv'); rv.style.setProperty('--d', (first ? 600 + i*120 : 0) + 'ms'); rv.classList.add('pc-in'); M.io.unobserve(e.target); });
    if (vis.length) first = false;
  }, {threshold:.05});
  if (still) M.els.forEach(el => { const rv = el.querySelector('.pc-rv'); rv.style.transition = 'none'; rv.classList.add('pc-in'); });
  else M.els.forEach(el => M.io.observe(el));
  M.onScroll = () => { if (!M.tick) { M.tick = true; requestAnimationFrame(pcParallax); } };
  M.onResize = () => pcFit();
  addEventListener('scroll', M.onScroll, {passive:true}); addEventListener('resize', M.onResize);
  pcFit(); pcHeroAfter(still);
  if (!still) {   // arrivée : le chemin se dessine, puis le fil cuivre s'allume jusqu'à l'étape courante
    const L = M.base.getTotalLength(); M.base.style.strokeDasharray = L; M.base.style.strokeDashoffset = L;
    M.base.animate([{strokeDashoffset:L}, {strokeDashoffset:0}], {duration:2600, delay:350, easing:'cubic-bezier(.35,.1,.2,1)', fill:'forwards'});
    pcWait(1100).then(() => { if (pcM === M) pcLight(M.segs.filter(s => s.lit), 1100, M); });
  }
}

/* allumer des segments, avec étincelle (px/s) */
function pcLight(list, speed, M) {
  M = M || pcM;
  return new Promise(res => {
    if (!M) return res();
    let t = 0; const runs = [];
    list.forEach(s => { const D = pcRM() ? 1 : s.L/speed*1000; runs.push({s, D, t0:t}); t += D; });
    runs.forEach(r => [r.s.l, r.s.g].forEach(p => p.animate([{strokeDashoffset:r.s.L}, {strokeDashoffset:0}], {duration:r.D, delay:r.t0, easing:'linear', fill:'forwards'})));
    if (pcRM() || !runs.length) { M.spark.style.opacity = 0; return setTimeout(res, 20); }
    const start = performance.now(); M.spark.style.opacity = 1;
    (function fr(now) {
      if (pcM !== M) return res();
      const el = now - start;
      if (el >= t) { M.spark.style.opacity = 0; return res(); }
      const r = runs.find(r => el < r.t0 + r.D) || runs[runs.length - 1];
      const p = r.s.l.getPointAtLength(Math.min(r.s.L, Math.max(0, (el - r.t0)/r.D)*r.s.L));
      M.spark.setAttribute('cx', p.x); M.spark.setAttribute('cy', p.y);
      requestAnimationFrame(fr);
    })(start);
  });
}

const pcTarget = (it, frac = .45) => { const r = pcM.els.get(it).getBoundingClientRect(); return Math.max(0, scrollY + r.top - innerHeight*frac); };
const pcScroll = (y, instant) => scrollTo({top:y, behavior:(instant || pcRM()) ? 'auto' : 'smooth'});
async function pcContinue() {
  if (pcBusy || !pcM) return;
  const it = PC_STEPS[pcCur()];
  if (!it) { pcScroll(Math.max(0, scrollY + $('pc-mapw').getBoundingClientRect().top - 90)); return; }
  const tgt = pcTarget(it);
  pcScroll(tgt);
  await pcWait(Math.min(1500, Math.abs(scrollY - tgt)*.9 + 300));
  pcOpenStep(it);
}

/* ── calque (transition disque → plein écran, feuille d'étape, réussite, jalon, pastille) ── */
function pcLayer() {
  if ($('pc-layer')) return;
  const d = document.createElement('div'); d.id = 'pc-layer';
  d.innerHTML = `<div id="pc-morph" aria-hidden="true"></div>
    <div id="pc-sheet" role="dialog" aria-modal="true" aria-labelledby="pc-sh-h">
      <div class="pc-shi">
        <div class="pc-sh-top"><button type="button" class="pc-sh-x" id="pc-shx" aria-label="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="pc-sh-k" id="pc-shk"></div><div style="width:38px"></div></div>
        <div class="pc-sh-body" id="pc-shb"></div>
        <div class="pc-sh-foot">
          <div class="pc-foot-st" id="pc-f-go"><button type="button" class="pc-btn-main" id="pc-b-go"></button></div>
          <div class="pc-foot-st" id="pc-f-win"><button type="button" class="pc-btn-main" id="pc-b-win"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>J’ai réussi</button><button type="button" class="pc-btn-ghost" id="pc-b-again">Relancer l’action</button></div>
          <div class="pc-foot-st" id="pc-f-done"><button type="button" class="pc-btn-main" id="pc-b-redo" style="background:color-mix(in srgb,var(--cream) 12%,transparent);color:var(--cream);box-shadow:none">Rejouer cette étape</button></div>
        </div>
      </div>
      <div id="pc-okw"><svg viewBox="0 0 132 132" aria-hidden="true"><circle class="pc-fl" cx="66" cy="66" r="50"/><circle class="pc-rg" cx="66" cy="66" r="50"/><path class="pc-ck" d="M42 68l17 17 32-36"/></svg><h2>Étape validée</h2><p id="pc-okm"></p></div>
    </div>
    <div id="pc-jalon" role="dialog" aria-modal="true" aria-label="Chapitre terminé">
      <div class="pc-badge"><svg viewBox="0 0 190 190" aria-hidden="true"><defs><linearGradient id="pc-gcu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5b870"/><stop offset="1" stop-color="#c97a3f"/></linearGradient></defs>
        <circle class="pc-ring1" cx="95" cy="95" r="86"/><circle class="pc-ring2" cx="95" cy="95" r="76"/>
        <path class="pc-lau" d="M28 118C14 98 16 70 32 50"/><path class="pc-lau" d="M162 118C176 98 174 70 158 50"/><g id="pc-ticks"></g></svg>
        <div class="pc-core" id="pc-jemo"></div></div>
      <div class="pc-j-k pc-j-t" style="--i:0" id="pc-jk"></div><h2 class="pc-j-t" style="--i:1" id="pc-jt"></h2>
      <div class="pc-j-msg pc-j-t" style="--i:2" id="pc-jm"></div><div class="pc-j-stat pc-j-t" style="--i:3" id="pc-js"></div>
      <button type="button" class="pc-btn-main pc-j-t" style="--i:4" id="pc-jgo">Continuer le parcours</button>
    </div>
    <div id="pc-pill" role="region" aria-label="Parcours guidé"></div>`;
  document.body.appendChild(d);
  const ticks = $('pc-ticks');
  for (let i = 0; i < 36; i++) { const a = i/36*Math.PI*2, r2 = i % 3 === 0 ? 97 : 94, l = document.createElementNS(PC_NS, 'line');
    l.setAttribute('class', 'pc-tick'); l.setAttribute('x1', 95 + Math.cos(a)*91); l.setAttribute('y1', 95 + Math.sin(a)*91); l.setAttribute('x2', 95 + Math.cos(a)*r2); l.setAttribute('y2', 95 + Math.sin(a)*r2); l.style.setProperty('--i', i); ticks.appendChild(l); }
  $('pc-shx').addEventListener('click', () => { if (!pcBusy) pcCloseSheet(); });
  $('pc-b-go').addEventListener('click', () => pcLaunch());
  $('pc-b-again').addEventListener('click', () => pcLaunch());
  $('pc-b-redo').addEventListener('click', () => pcLaunch());
  $('pc-b-win').addEventListener('click', () => pcWin());
  $('pc-jgo').addEventListener('click', () => pcJalonClose());
  const sh = $('pc-sheet');   // la page derrière ne défile pas pendant que la feuille est ouverte
  const stop = e => { if (!e.target.closest('.pc-sh-body')) e.preventDefault(); };
  sh.addEventListener('wheel', stop, {passive:false}); sh.addEventListener('touchmove', stop, {passive:false});
  addEventListener('keydown', e => { if (e.key === 'Escape' && sh.classList.contains('pc-on') && !pcBusy) pcCloseSheet(); });
}
const pcFoot = id => document.querySelectorAll('.pc-foot-st').forEach(f => f.classList.toggle('pc-show', f.id === id));

function pcDetail(a) {
  if (a.type === 'exo') return (EXO[a.ref] ? EXO[a.ref].n : a.ref) + (a.param ? ' · ' + a.param.replace('-', ' ⇄ ') : '');
  if (a.type === 'cours') { const i = COURS.findIndex(l => l.k === a.ref); return `Leçon ${i + 1} · ${COURS[i].t}`; }
  if (a.type === 'rc') { const s = RH_COURSE.find(x => x.id === a.ref), r = RHYTHMS.find(x => x.id === s.rh); return `${r.n} · ${r.mes}`; }
  if (a.type === 'prog') { const p = FEEL_PROGS.find(x => x.id === a.ref), r = RHYTHMS.find(x => x.id === a.param); return `${p.n} · ${p.ch.join(' ')}${r ? ' · ' + r.n : ''}`; }
  return a.param;
}
function pcFill(it, mode) {
  const e = it.e, a = e.action, T = PC_TYPE[a.type], done = pcState(it) === 'done', sheet = $('pc-sheet');
  sheet.style.setProperty('--cc', pcCol(it.c)); $('pc-morph').style.setProperty('--cc', pcCol(it.c));
  $('pc-shk').textContent = `Chapitre ${it.c.ch} · étape ${it.n + 1}/${it.c.etapes.length}`;
  $('pc-shb').innerHTML = `
    <div class="pc-sh-emo pc-si" style="--i:0">${it.c.emoji}<svg viewBox="0 0 88 88" aria-hidden="true"><circle cx="44" cy="44" r="44"/></svg></div>
    <h1 class="pc-si" id="pc-sh-h" style="--i:1">${esc(e.titre)}</h1>
    <p class="pc-sh-but pc-si" style="--i:2">${esc(e.but)}</p>
    <div class="pc-chips pc-sh-chips pc-si" style="--i:3"><span class="pc-chip">${pcI(PC_CLOCK, 12)}${e.min} min</span><span class="pc-chip">${T.k}</span>${done ? '<span class="pc-chip" style="color:var(--cc)">Validée</span>' : ''}</div>
    <div class="pc-sh-card pc-si" style="--i:4"><div class="pc-sh-ico">${pcI(T.ico)}</div><div><small>L’action</small><b>${esc(pcDetail(a))}</b></div></div>
    <div class="pc-sh-win pc-si ${done ? 'pc-ok' : ''}" id="pc-win" style="--i:5"><div class="pc-bx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><div><small>Pour réussir</small><p>${esc(e.reussite)}</p></div></div>
    ${e.jalon ? `<div class="pc-sh-gain pc-si" style="--i:6">« ${esc(e.jalon)} »</div>` : ''}`;
  $('pc-b-go').innerHTML = pcI(T.ico, 18) + T.btn;
  pcFoot('');
  const st = done ? 'pc-f-done' : mode === 'win' ? 'pc-f-win' : 'pc-f-go';
  setTimeout(() => pcFoot(st), pcRM() ? 0 : 700);
}

async function pcOpenStep(it, mode) {
  if (pcBusy || !pcM) return;
  const el = pcM.els.get(it), st = pcState(it);
  if (st === 'lock') { const d = el.querySelector('.pc-dot'); d.classList.remove('pc-shake'); void d.offsetWidth; d.classList.add('pc-shake'); return; }
  pcLayer(); pcBusy = true; pcCurIt = it; pcSrc = el;
  const sheet = $('pc-sheet'), morph = $('pc-morph'), rm = pcRM();
  pcFill(it, mode);
  const r = el.querySelector('.pc-dot').getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
  morph.style.left = cx + 'px'; morph.style.top = cy + 'px'; morph.style.opacity = 1;
  const s = 2*Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy))/52 + .3;
  morph.dataset.s = s;
  morph.animate([{transform:'translate(-50%,-50%) scale(1)'}, {transform:`translate(-50%,-50%) scale(${s})`}], {duration:rm ? 1 : 480, easing:'cubic-bezier(.7,0,.2,1)', fill:'forwards'});
  el.querySelector('.pc-dot').animate([{transform:'scale(1)'}, {transform:'scale(.82)'}, {transform:'scale(1)'}], {duration:rm ? 1 : 260, easing:'ease-out'});
  setTimeout(() => morph.classList.add('pc-full'), rm ? 0 : 60);
  await pcWait(300);
  sheet.classList.add('pc-on', 'pc-sheet-on'); sheet.style.opacity = 1;
  sheet.animate([{opacity:0}, {opacity:1}], {duration:rm ? 1 : 240, fill:'forwards'});
  await pcWait(300);
  pcBusy = false;
  const x = $('pc-shx'); if (x) x.focus({preventScroll:true});
}
function pcResetMorph() { const m = $('pc-morph'); m.getAnimations().forEach(a => a.cancel()); m.classList.remove('pc-full'); m.style.opacity = 0; }
async function pcHideSheet() {
  const sheet = $('pc-sheet');
  await sheet.animate([{opacity:1}, {opacity:0}], {duration:pcRM() ? 1 : 160, fill:'forwards'}).finished;
  sheet.classList.remove('pc-on', 'pc-sheet-on'); sheet.getAnimations().forEach(a => a.cancel()); sheet.style.opacity = 0;
  const okw = $('pc-okw'); okw.classList.remove('pc-on'); okw.getAnimations().forEach(a => a.cancel()); okw.style.opacity = 0;
}
async function pcCloseSheet() {
  pcBusy = true;
  const el = pcSrc, morph = $('pc-morph'), s = +morph.dataset.s, rm = pcRM();
  await pcHideSheet();
  if (el && el.isConnected) { const r = el.querySelector('.pc-dot').getBoundingClientRect(); morph.style.left = (r.left + r.width/2) + 'px'; morph.style.top = (r.top + r.height/2) + 'px'; }
  morph.classList.remove('pc-full');
  await morph.animate([{transform:`translate(-50%,-50%) scale(${s})`}, {transform:'translate(-50%,-50%) scale(1)'}], {duration:rm ? 1 : 420, easing:'cubic-bezier(.3,0,.2,1)', fill:'forwards'}).finished;
  await morph.animate([{opacity:1}, {opacity:0}], {duration:rm ? 1 : 160, fill:'forwards'}).finished;
  pcResetMorph(); pcBusy = false;
  if (el && el.isConnected) { const d = el.querySelector('.pc-dot'); if (d) d.focus({preventScroll:true}); }
}

/* ── lancer la vraie action de l'appli ── */
function pcGo(a) {
  rccStop(); feelStop();
  if (a.type === 'exo') exoOpen(a.ref, a.param);
  else if (a.type === 'cours') coursOpen(a.ref);
  else if (a.type === 'rc') {
    const i = RH_COURSE.findIndex(s => s.id === a.ref);
    exoCur = null; exoMode = 'rhy'; exoRet = null; rcz.cur = i; rcz.bpm = RH_COURSE[i].bpm[0]; rcz.bars = 0; rcz.fin = false;
    go('exo');
  } else if (a.type === 'prog') {
    const p = FEEL_PROGS.find(x => x.id === a.ref), r = RHYTHMS.find(x => x.id === a.param);
    exoCur = null; exoMode = 'feel'; exoRet = null; feel.amb = p.amb;
    go('exo'); feelPickProg(p.id);
    if (r) { feel.rh = r.id; feel.kind = 'rh'; feel.fx = null; feel.bpm = Math.round((r.bpm[0] + (r.bpm[1] - r.bpm[0])*.35)/5)*5; feelFixBpm(); exoRender(); }
  } else if (a.type === 'fiche') newSheet();
}
async function pcLaunch() {
  if (pcBusy) return; pcBusy = true;
  const it = pcCurIt, a = it.e.action, rm = pcRM();
  pcRet = {id:it.e.id};
  await pcHideSheet();
  pcGo(a);
  pcPill();
  await pcWait(80);
  await $('pc-morph').animate([{opacity:1}, {opacity:0}], {duration:rm ? 1 : 260, fill:'forwards'}).finished;
  pcResetMorph(); pcBusy = false;
  if (a.type === 'prog' && pcRet && !rhPlaying('feel')) feelPlay();
  if (a.type === 'rc' && pcRet && !rhPlaying('rc')) rccPlay();
}

/* ── retour : pastille « en cours » + reprise de l'étape ── */
function pcPill() {
  const p = $('pc-pill'); if (!p) return;
  const it = pcRet && PC_STEPS.find(s => s.e.id === pcRet.id);
  const on = !!it && (curView === 'exo' || curView === 'ed' || curView === 'sheet' || (curView === 'cours' && coursView === 'lesson'));
  if (it && p.dataset.id !== it.e.id) {
    const fiche = it.e.action.type === 'fiche';
    p.dataset.id = it.e.id; p.style.setProperty('--cc', pcCol(it.c));
    p.innerHTML = `<span class="pc-pill-e" aria-hidden="true">${it.c.emoji}</span><div class="pc-pill-t"><small>${fiche ? `Étape ${it.c.ch}.${it.n + 1} · ${esc(it.e.titre)}` : `Parcours · étape ${it.c.ch}.${it.n + 1}`}</small><b>${esc(fiche ? it.e.action.param : it.e.titre)}</b></div>
      <button type="button" onclick="pcPillBack()" aria-label="Retour à l’étape du parcours">${pcI('<path d="M19 12H5M11 6l-6 6 6 6"/>', 15)}Parcours</button>`;
  }
  p.classList.toggle('pc-show', on);
  document.body.classList.toggle('pc-pill-on', on);
  if (on) p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true');
}
function pcPillBack() {
  if (curView === 'ed') {
    if (draft && !sheets.some(s => s.id === draft.id) && edOK() && !confirm('Quitter sans enregistrer la fiche ?')) return;
    rcCleanup(); stopPlay(); edBarReset();
  }
  coursList();   // renderCours reprend l'étape (pcResume)
}
function pcResume() {
  const r = pcRet; pcRet = null; pcPill();
  rccStop(); feelStop(); exoStop(); exoCur = null; exoRet = null; rcz.cur = null; rcz.fin = false; feel.prog = null; feel.amb = null; if (exoMode === 'rhy') exoMode = 'feel';   // l'écran d'action est refermé proprement
  const it = r && PC_STEPS.find(s => s.e.id === r.id); if (!it || !pcM) return;
  setTimeout(() => { if (!pcM) return; scrollTo({top:pcTarget(it), behavior:'auto'}); setTimeout(() => pcOpenStep(it, 'win'), 80); }, 60);
}

/* ── réussite : coche, chemin qui s'allume, déverrouillage, jalon ── */
async function pcWin() {
  if (pcBusy) return; pcBusy = true;
  const it = pcCurIt, rm = pcRM();
  pcProg()[it.e.id] = Date.now(); exoLog('parcours'); exoSave();
  $('pc-win').classList.add('pc-ok'); pcFoot('');
  await pcWait(420);
  const okw = $('pc-okw'); $('pc-okm').textContent = it.e.jalon || ''; okw.classList.add('pc-on'); okw.style.opacity = 1;
  okw.animate([{opacity:0}, {opacity:1}], {duration:rm ? 1 : 260, fill:'forwards'});
  await pcWait(2100);
  await pcCloseSheet();
  await pcWait(200);
  await pcComplete(it);
}
async function pcComplete(it) {
  const M = pcM; if (!M) { pcBusy = false; return; }
  pcBusy = true;
  const next = PC_STEPS[it.gi + 1], chapterEnd = it.last;
  pcScroll(pcTarget(next || it, .5));
  await pcWait(800);
  if (pcM !== M) { pcBusy = false; return; }
  const el = pcRebuild(it);
  el.querySelector('.pc-dot').animate([{transform:'scale(.7)'}, {transform:'scale(1.18)'}, {transform:'scale(1)'}], {duration:pcRM() ? 1 : 520, easing:'cubic-bezier(.34,1.56,.64,1)'});
  pcBurst(el);
  await pcWait(500);
  const toLight = M.segs.filter(s => !s.lit && pcReached(PC_ITEMS[s.i + 1]));
  toLight.forEach(s => s.lit = true);
  const banIt = chapterEnd && next ? PC_ITEMS.find(x => x.kind === 'ban' && x.c.ch === it.c.ch + 1) : null;
  const lp = pcLight(toLight, 360, M);
  if (banIt) { await pcWait(480); if (pcM === M) pcRebuild(banIt, 'pc-unlock'); }
  await lp;
  if (pcM !== M) { pcBusy = false; return; }
  if (next) { const ne = pcRebuild(next, 'pc-unlock'); pcBurst(ne); }
  pcPaintHero(true);
  await pcWait(900);
  pcBusy = false;
  if (chapterEnd) pcJalon(it.c);
}

/* jalon de fin de chapitre : badge sobre */
function pcConfetti() {
  if (pcRM()) return;
  const jal = $('pc-jalon'), cxm = jal.clientWidth/2, cym = jal.clientHeight*.34, cols = ['#f5b870', '#e8964e', '#c97a3f', '#f2e8d5', '#c2aa88'], kinds = ['♪', '♫', 'pick', '♩', 'pick', '♬', '♪'];
  for (let i = 0; i < 24; i++) {
    const e = document.createElement('div'); e.className = 'pc-conf'; e.setAttribute('aria-hidden', 'true'); const k = kinds[i % kinds.length], sz = 14 + Math.random()*12, col = cols[i % cols.length];
    if (k === 'pick') e.innerHTML = `<svg width="${sz}" height="${sz*1.1}" viewBox="0 0 20 22"><path d="M10 1C4 1 1 5 1.5 10c.5 5 5 10 8.5 11 3.5-1 8-6 8.5-11C19 5 16 1 10 1z" fill="${col}"/></svg>`;
    else { e.textContent = k; e.style.fontFamily = 'var(--serif)'; e.style.fontSize = (sz + 6) + 'px'; e.style.color = col; }
    jal.appendChild(e);
    const ang = -Math.PI/2 + (Math.random() - .5)*2.4, v = 130 + Math.random()*190, dx = Math.cos(ang)*v, dy = Math.sin(ang)*v, fall = 260 + Math.random()*260, rot = (Math.random() - .5)*540, dur = 2400 + Math.random()*1400;
    e.animate([
      {transform:`translate(${cxm}px,${cym}px) scale(.4) rotate(0deg)`, opacity:0},
      {transform:`translate(${cxm + dx*.6}px,${cym + dy*.75}px) scale(1) rotate(${rot*.4}deg)`, opacity:.95, offset:.22},
      {transform:`translate(${cxm + dx}px,${cym + dy + fall}px) scale(.9) rotate(${rot}deg)`, opacity:0}
    ], {duration:dur, delay:1000 + Math.random()*350, easing:'cubic-bezier(.2,.7,.4,1)', fill:'both'}).finished.then(() => e.remove(), () => e.remove());
  }
}
function pcJalon(c) {
  pcLayer();
  const j = $('pc-jalon'), last = c.etapes[c.etapes.length - 1];
  j.style.setProperty('--cc', pcCol(c));
  $('pc-jemo').textContent = c.emoji;
  $('pc-jk').textContent = `Chapitre ${c.ch} terminé`;
  $('pc-jt').textContent = c.titre;
  $('pc-jm').textContent = '« ' + (last.jalon || 'Bien joué.') + ' »';
  $('pc-js').innerHTML = `<span class="pc-chip">${c.etapes.length} étapes</span><span class="pc-chip">${c.etapes.reduce((n, e) => n + e.min, 0)} min de pratique</span>`;
  j.classList.remove('pc-on'); void j.offsetWidth; j.classList.add('pc-on');
  j.animate([{opacity:0}, {opacity:1}], {duration:pcRM() ? 1 : 420, fill:'forwards'}); j.style.opacity = 1;
  pcConfetti();
  $('pc-jgo').focus({preventScroll:true});
}
async function pcJalonClose() {
  const j = $('pc-jalon'); await j.animate([{opacity:1}, {opacity:0}], {duration:pcRM() ? 1 : 360, fill:'forwards'}).finished;
  j.classList.remove('pc-on'); j.getAnimations().forEach(a => a.cancel()); j.style.opacity = 0; j.querySelectorAll('.pc-conf').forEach(x => x.remove());
  const n = PC_STEPS[pcCur()]; if (n && pcM) pcScroll(pcTarget(n));
}


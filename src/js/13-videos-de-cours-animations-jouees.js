/* ═══════ VIDÉOS DE COURS — animations jouées dans l'app (format adaptatif, son de l'app) ═══════
   LV[k] = {t: titre, dur: secondes, html(): scènes, cues: [[seconde, fn son]]}. Tout le mouvement est en CSS
   (delays en secondes) : pause = animation-play-state ; les sons sont replanifiés à la reprise. */
/* ── L'âme des cours (26/11) : Médi présente, parle et conclut ; la bande vient jouer quand la scène en parle ──
   lvIntroHTML : l'écran titre (Médi entre puis gratte six cordes, qui vibrent avec un accord) ;
   lvSay : les sous-titres deviennent la bulle de Médi (un petit saut à chaque phrase), un musicien à droite si la scène en a un ;
   lvOutroHTML : la fin, « À toi de jouer ». Utilisés par les cours des murs (lvBuild) et de théorie (lvMake, LV.notes). */
const LV_STRUM_T = 1.62;   // l'instant où Médi traverse les cordes (le son de l'accord est calé dessus)
function lvIntroHTML(kick, h, sub) {
  let strs = '';
  for (let i = 0; i < 6; i++) { const t = LV_STRUM_T + i * .022; strs += `<path d="M0 ${7 + i * 9.2}H400" stroke-width="${(1 + i * .45).toFixed(2)}" style="animation:lvPluck .9s ease-out ${t.toFixed(3)}s forwards,lvVib .07s linear ${t.toFixed(3)}s 10 alternate"/>`; }
  return `<div class="lv-sc lv-intro" style="animation:lvIn .5s var(--ease-out) .1s forwards,lvOut .4s ease 3.1s forwards">
      <div class="lv-in-t"><div class="lv-k" style="animation-delay:.3s">${kick}</div>
      <div class="lv-h"><span style="animation-delay:.5s">${h[0]}</span> <span style="animation-delay:.7s"><em>${h[1]}</em></span></div>
      <div class="lv-s" style="animation-delay:1.4s">${sub}</div></div>
      <div class="lv-in-m"><div style="animation:lvMediIn .6s var(--ease-pop) .15s both,lvStrumMedi .75s cubic-bezier(.45,0,.35,1) ${(LV_STRUM_T - .32).toFixed(2)}s both">${mediSVG('contente', {size: 160, anim: 'still'})}</div></div>
      <svg class="lv-in-s" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">${strs}</svg></div>`;
}
const lvIntroCue = () => [LV_STRUM_T, () => playChord(newChord('G'), 0, 'D')];
function lvSay(lines, side) {   // lines = [[début, fin (0 = reste), html]] en secondes absolues
  if (!lines.length && !side) return '';
  const talk = lines.map(([a]) => `,lvTalk .5s var(--ease-out) ${a.toFixed(2)}s`).join('');
  return `<div class="lv-caps lv-say"><span class="lv-say-m"${lines.length ? ` style="animation:lvIn .3s ease ${lines[0][0].toFixed(2)}s both${talk}"` : ''}>${lines.length ? mediSVG('neutre', {size: 48, anim: 'still'}) : ''}</span>
      <div class="lv-say-b">${lines.map(([a, z, h]) => `<div style="animation:lvUp .5s var(--ease-out) ${a.toFixed(2)}s forwards${z ? `,lvOut .3s ease ${z.toFixed(2)}s forwards` : ''}"><span>${h}</span></div>`).join('')}</div>${side || ''}</div>`;
}
function lvOutroHTML(t) {
  return `<div class="lv-sc lv-outro" style="animation:lvIn .45s var(--ease-out) ${t.toFixed(2)}s forwards">
      <div class="lv-out-m" style="animation:lvMediIn .5s var(--ease-pop) ${(t + .1).toFixed(2)}s both,lvJump .8s cubic-bezier(.3,.7,.4,1) ${(t + .7).toFixed(2)}s">${mediSVG('contente', {size: 150, anim: 'still'})}</div>
      <b style="animation-delay:${(t + .35).toFixed(2)}s">À toi de jouer</b><span style="animation-delay:${(t + .6).toFixed(2)}s">Prends ta guitare, et refais-le doucement.</span></div>`;
}
const LV_OUTRO = 3.2;   // durée de la fin
const LV_N = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'], LV_FR = {C:'Do',D:'Ré',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
const LV = {
  notes: {t:'Les notes', dur:19,
    html() {
      const nat = [0,2,4,5,7,9,11], shp = [1,3,6,8,10], d = i => nat.includes(i) ? 4.5 + nat.indexOf(i) * .36 : 8.1 + shp.indexOf(i) * .3;
      return lvIntroHTML('LEÇON 1 · LES BASES', ['Les', 'notes'], 'Toute la musique tient en <b>12 notes</b>. Pas une de plus.') + `
        <div class="lv-sc" style="animation:lvIn .5s var(--ease-out) 3.4s forwards,lvOut .4s ease 15s forwards">
          <div class="lv-top"><div><b>Une seule corde</b><small>chaque case monte d’un cran</small></div><div class="lv-cnt"><span data-cnt>0</span><small>NOTES</small></div></div>
          <div class="lv-notes">${LV_N.map((n, i) => `<div class="lv-n${n.length > 1 ? ' sh' : ''}${i === 0 ? ' c0' : ''}" style="animation-delay:${d(i).toFixed(2)}s${i === 0 ? ',12s' : ''}">${n}${LV_FR[n] ? `<i>${LV_FR[n]}</i>` : ''}</div>`).join('')}<div class="lv-n oct" style="animation-delay:11s,12s">C<i>Do</i></div></div>
          ${lvSay([[4.3, 7.6, '7 notes <b>naturelles</b> : Do Ré Mi Fa Sol La Si'], [7.9, 10.6, '… et 5 notes <b>entre deux</b> : les dièses ♯'], [11.3, 0, 'À la 12<sup>e</sup> case, la même note, plus aiguë : c’est l’<b>octave</b>.']])}
        </div>${lvOutroHTML(15.3)}`;
    },
    cues() {
      const nat = [0,2,4,5,7,9,11], shp = [1,3,6,8,10], c = [lvIntroCue(), [16.05, () => playChord(newChord('G'), 0, 'D')]];
      nat.forEach((i, k) => c.push([4.5 + k * .36, el => { playNote(48 + i); lvCnt(el, k + 1); }]));
      shp.forEach((i, k) => c.push([8.1 + k * .3, el => { playNote(48 + i); lvCnt(el, 8 + k); }]));
      c.push([11, () => playNote(60)], [12.4, () => { playNote(48); playNote(60); }]);
      return c;
    }},
};
const COURS_T = {intervals:'Les intervalles', build:'Construire un accord', colors:'Couleurs & effets', dissect:'Décortiquer un accord', key:'Tonalité & familles', progs:'Progressions célèbres', tension:'Tension & résolution', capo:'Capo & transposition', barre:'Barrés : formes mobiles', inv:'Renversements & basses', ear:'Entraîner l’oreille'};
const lvCnt = (el, n) => { const c = el.querySelector('[data-cnt]'); if (c) c.textContent = n; };
/* Les autres leçons : même moteur, scènes décrites en données.
   lvMake(n° leçon, sur-titre, [mot, mot en couleur], phrase d'accroche, scènes)
   scène = {top:[titre, sous-titre], items:[…], caps:[phrases], step: s entre deux éléments}
   élément « tuile » : {l: texte, s: légende, hot: mis en avant, m: note MIDI ou [notes] jouées}
   élément « accord » : {c: nom d'accord de la bibliothèque, s: légende} → schéma + accord gratté */
function lvMake(num, kick, h, sub, scenes) {
  let t = 3.4, html = lvIntroHTML(`LEÇON ${num} · ${kick}`, h, sub);
  const cues = [lvIntroCue()];
  scenes.forEach((sc, si) => {
    const n = sc.items.length, step = sc.step || .55, t0 = t, ti = t0 + .9, D = Math.max(1.2 + n*step + 1.6, sc.caps.length*2.7 + .8), last = si === scenes.length - 1;
    const tiles = sc.items.map((it, i) => {
      const d = (ti + i*step).toFixed(2);
      cues.push([ti + i*step, () => { if (it.c) playChord(newChord(it.c), 0, 'D'); else if (it.m != null) [].concat(it.m).forEach((m, k) => setTimeout(() => playNote(m), k*190)); }]);
      return it.c ? `<div class="lv-cd" style="animation-delay:${d}s">${chordSVG(newChord(it.c), {size: 1})}<b>${it.c}</b>${it.s ? `<i>${it.s}</i>` : ''}</div>`
                  : `<div class="lv-t${it.hot ? ' hot' : ''}" style="animation-delay:${d}s"><b>${it.l}</b>${it.s ? `<i>${it.s}</i>` : ''}</div>`;
    }).join('');
    const span = (D - .8) / sc.caps.length;
    const caps = sc.caps.map((c, j) => { const a = t0 + .7 + j*span; return [a, j === sc.caps.length - 1 ? 0 : a + span - .35, c]; });
    html += `<div class="lv-sc" style="animation:lvIn .5s var(--ease-out) ${t0.toFixed(2)}s forwards,lvOut .4s ease ${(t0 + D - .4).toFixed(2)}s forwards">
      <div class="lv-top"><div><b>${sc.top[0]}</b><small>${sc.top[1] || ''}</small></div></div>
      <div class="lv-tl${sc.items[0].c ? ' cds' : ''}" style="--n:${n};--np:${n <= 3 ? n : Math.ceil(n/2)}">${tiles}</div>
      ${lvSay(caps)}</div>`;
    t += D;
  });
  html += lvOutroHTML(t); cues.push([t + .75, () => playChord(newChord('G'), 0, 'D')]);
  return {dur: Math.ceil(t + LV_OUTRO), html: () => html, cues: () => cues};
}
const lvT = (l, s, m, hot) => ({l, s, m, hot}), lvC = (c, s) => ({c, s});
[
  ['intervals', 2, 'LES BASES', ['Les', 'intervalles'], 'La <b>distance</b> entre deux notes : c’est elle qui donne la couleur.', [
    {top:['On compte en cases', 'depuis la même note de départ'], step:.8, items:[lvT('1', 'demi-ton', [48,49]), lvT('2', 'ton', [48,50]), lvT('3', 'tierce mineure', [48,51]), lvT('4', 'tierce majeure', [48,52], 1), lvT('7', 'quinte', [48,55], 1), lvT('12', 'octave', [48,60])],
     caps:['Une case = un <b>demi-ton</b>. Deux cases = un <b>ton</b>.', '3 ou 4 cases : la <b>tierce</b>, triste ou joyeuse.', '7 cases : la <b>quinte</b>, solide. 12 : l’<b>octave</b>.']}]],
  ['build', 3, 'LES ACCORDS', ['Construire', 'un accord'], 'Trois notes suffisent : <b>1 · 3 · 5</b>.', [
    {top:['Do majeur', 'on empile des tierces'], step:.7, items:[lvT('Do', 'fondamentale · 1', 48, 1), lvT('Mi', 'tierce · 3', 52), lvT('Sol', 'quinte · 5', 55), lvT('Do Mi Sol', 'ensemble', [48,52,55], 1)],
     caps:['La <b>fondamentale</b> donne son nom à l’accord.', 'La <b>tierce</b> dit s’il est majeur ou mineur. La <b>quinte</b> le rend stable.']},
    {top:['Majeur ou mineur ?', 'une seule note change'], step:1.5, items:[lvC('A', 'tierce majeure'), lvC('Am', 'tierce mineure')],
     caps:['On baisse la tierce d’<b>une case</b> : le majeur devient <b>mineur</b>.']}]],
  ['colors', 4, 'LES ACCORDS', ['Couleurs', '& effets'], 'On ajoute ou on déplace <b>une note</b>, et l’ambiance change.', [
    {top:['Quatre couleurs de La', 'même base, autre humeur'], step:1.5, items:[lvC('A', 'stable'), lvC('A7', 'tendu, blues'), lvC('Asus4', 'en suspens'), lvC('Am', 'sombre')],
     caps:['Le <b>7</b> ajoute une tension qui veut bouger.', 'Le <b>sus4</b> remplace la tierce : ni majeur ni mineur.', 'Reviens au La simple : l’oreille se pose.']}]],
  ['dissect', 5, 'LES ACCORDS', ['Décortiquer', 'un accord'], 'Six cordes, mais souvent <b>trois notes</b> seulement.', [
    {top:['La mineur, corde par corde', 'de la corde 5 à la corde 1'], step:.6, items:[lvT('La', 'corde 5 · 1', 45, 1), lvT('Mi', 'corde 4 · 5', 52), lvT('La', 'corde 3 · 1', 57, 1), lvT('Do', 'corde 2 · 3', 60), lvT('Mi', 'corde 1 · 5', 64)],
     caps:['Les mêmes notes reviennent : <b>La, Do, Mi</b>.', 'Repère la <b>fondamentale</b> : c’est elle que joue la basse.']},
    {top:['L’accord entier', ''], step:1.2, items:[lvC('Am', 'La · Do · Mi')], caps:['Cinq cordes, trois notes : c’est ça, un accord.']}]],
  ['key', 6, 'L’HARMONIE', ['Tonalité', '& familles'], 'Une tonalité, c’est une <b>famille d’accords</b> qui vont bien ensemble.', [
    {top:['La famille de Sol', 'six accords à connaître'], step:.6, items:[lvT('G', 'I · majeur', [43,47,50], 1), lvT('Am', 'ii · mineur', [45,48,52]), lvT('Bm', 'iii · mineur', [47,50,54]), lvT('C', 'IV · majeur', [48,52,55], 1), lvT('D', 'V · majeur', [50,54,57], 1), lvT('Em', 'vi · mineur', [52,55,59])],
     caps:['Trois <b>majeurs</b> : les degrés I, IV et V.', 'Trois <b>mineurs</b> : ii, iii et vi.', 'Un morceau en Sol pioche presque toujours là-dedans.']},
    {top:['Les trois piliers', 'I · IV · V'], step:1.3, items:[lvC('G', 'I'), lvC('C', 'IV'), lvC('D', 'V')], caps:['Avec ces trois-là, tu joues déjà des centaines de chansons.']}]],
  ['progs', 7, 'L’HARMONIE', ['Progressions', 'célèbres'], 'Quelques suites d’accords reviennent <b>partout</b>.', [
    {top:['I · V · vi · IV', 'la suite des tubes'], step:1.4, items:[lvC('G', 'I'), lvC('D', 'V'), lvC('Em', 'vi'), lvC('C', 'IV')],
     caps:['Quatre accords en boucle : pop, rock, variété.', 'Change l’ordre, et tu obtiens une autre chanson.']},
    {top:['I · vi · IV · V', 'la suite des années 50'], step:1.4, items:[lvC('C', 'I'), lvC('Am', 'vi'), lvC('F', 'IV'), lvC('G', 'V')],
     caps:['Plus rétro, plus tendre : la ballade classique.']}]],
  ['tension', 8, 'L’HARMONIE', ['Tension', '& résolution'], 'La musique avance en <b>tendant</b> puis en <b>relâchant</b>.', [
    {top:['Partir, puis rentrer', 'en Sol'], step:1.7, items:[lvC('G', 'repos'), lvC('D7', 'tension'), lvC('G', 'retour')],
     caps:['Le <b>D7</b> crée un manque : l’oreille attend la suite.', 'Le retour au <b>Sol</b> soulage : c’est la résolution.']},
    {top:['Même chose en Do', 'V7 → I'], step:1.7, items:[lvC('C', 'repos'), lvC('G7', 'tension'), lvC('C', 'retour')],
     caps:['L’accord <b>7</b> placé sur le V ramène toujours à la maison.']}]],
  ['capo', 9, 'LE MANCHE', ['Capo', '& transposition'], 'Mêmes doigts, <b>autre hauteur</b>.', [
    {top:['La forme de Sol', 'ce qu’elle donne avec le capo'], step:.7, items:[lvT('0', 'Sol', [43,47,50], 1), lvT('1', 'Sol #', [44,48,51]), lvT('2', 'La', [45,49,52], 1), lvT('3', 'La #', [46,50,53]), lvT('4', 'Si', [47,51,54]), lvT('5', 'Do', [48,52,55], 1)],
     caps:['Chaque case du capo monte tout d’un <b>demi-ton</b>.', 'Capo 2 : tu joues la forme Sol, on entend un <b>La</b>.', 'Pratique pour suivre ta voix sans changer de doigtés.']}]],
  ['barre', 10, 'LE MANCHE', ['Barrés :', 'formes mobiles'], 'L’index remplace le sillet : la forme <b>glisse</b> sur le manche.', [
    {top:['La forme de Mi qui voyage', 'la case de l’index donne le nom'], step:.7, items:[lvT('1', 'Fa', [41,45,48], 1), lvT('3', 'Sol', [43,47,50]), lvT('5', 'La', [45,49,52]), lvT('7', 'Si', [47,51,54]), lvT('8', 'Do', [48,52,55], 1)],
     caps:['Une seule forme, <b>douze accords</b>.', 'La note sous l’index, sur la corde grave, est la <b>fondamentale</b>.']},
    {top:['Deux barrés à connaître', 'forme de Mi, forme de La mineur'], step:1.5, items:[lvC('F', 'case 1'), lvC('Bm', 'case 2')], caps:['Appuie près de la frette, le pouce derrière le manche.']}]],
  ['inv', 11, 'ALLER PLUS LOIN', ['Renversements', '& basses'], 'Les mêmes notes, dans un <b>autre ordre</b>.', [
    {top:['Do majeur, trois façons', 'la note grave change'], step:1.2, items:[lvT('Do Mi Sol', 'état fondamental', [48,52,55], 1), lvT('Mi Sol Do', '1er renversement · Do/Mi', [52,55,60]), lvT('Sol Do Mi', '2e renversement · Do/Sol', [55,60,64])],
     caps:['Toujours <b>Do, Mi, Sol</b> : c’est le même accord.', 'La note la plus <b>grave</b> change la couleur et relie les accords.', 'Do/Mi se lit « Do avec Mi à la basse ».']}]],
  ['ear', 12, 'ALLER PLUS LOIN', ['Entraîner', 'l’oreille'], 'Reconnaître à l’écoute, <b>sans regarder</b>.', [
    {top:['Lumineux ou sombre ?', 'écoute la différence'], step:1.6, items:[lvC('A', 'majeur'), lvC('Am', 'mineur'), lvC('E', 'majeur'), lvC('Em', 'mineur')],
     caps:['<b>Majeur</b> : ouvert, joyeux. <b>Mineur</b> : plus sombre.', 'Ferme les yeux et devine avant de regarder.']},
    {top:['Trois écarts à reconnaître', 'chante-les'], step:1.1, items:[lvT('tierce', 'Do → Mi', [48,52]), lvT('quinte', 'Do → Sol', [48,55], 1), lvT('octave', 'Do → Do', [48,60])],
     caps:['Chante la deuxième note <b>avant</b> de la jouer, puis vérifie.']}]],
].forEach(([k, num, kick, h, sub, sc]) => { const title = COURS_T[k]; LV[k] = Object.assign({t: title}, lvMake(num, kick, h, sub, sc)); });

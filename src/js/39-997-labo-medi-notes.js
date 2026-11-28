/* ═══════ LABO : MÉDI CHANTE QUAND ON LE TOUCHE (28/11, caché : ?beta) ═══════
   Lucas : quand on touche Médi, il rebondit (déjà partout) ; en plus, une petite note de musique, jamais la même,
   qui s'envole et éclate comme un petit feu d'artifice. Trois façons de le montrer, à comparer :
   1 la bulle (la note dans une bulle qui monte puis éclate), 2 la note qui saute (elle part en arc et éclate en étincelles),
   3 la fusée (elle file droit en haut et explose en points de couleur). Chaque toucher joue une note de guitare
   (gamme pentatonique de La mineur : toujours jolie, jamais deux fois la même d'affilée). */
LAB_TESTS27.push({id: 'l27-medi', t: 'Médi chante', d: 'Touche Médi : une note s’envole. Trois façons, laquelle tu gardes ?', ask: ['1 La bulle', '2 La note qui saute', '3 La fusée'], askq: 'Laquelle tu gardes ?'});
const MN = {v: 1, last: -1};
const MN_NOTES = [['La', 220], ['Do', 261.63], ['Ré', 293.66], ['Mi', 329.63], ['Sol', 392], ['La', 440], ['Do', 523.25], ['Ré', 587.33], ['Mi', 659.25]];
const MN_V = [[1, 'La bulle'], [2, 'La note qui saute'], [3, 'La fusée']];
const MN_COL = ['#ff8a2a', '#ffb877', '#b9a7ff', '#7fe0c0', '#8fc8ff'];
const mnGlyph = two => two
  ? '<svg viewBox="0 0 30 32" aria-hidden="true"><path d="M9 6 L27 2 V22" /><ellipse cx="6" cy="25" rx="5.2" ry="4" transform="rotate(-20 6 25)"/><ellipse cx="23" cy="21" rx="5.2" ry="4" transform="rotate(-20 23 21)"/><path d="M9 6 V25 M27 2 V21" /></svg>'
  : '<svg viewBox="0 0 24 32" aria-hidden="true"><ellipse cx="8" cy="25" rx="6" ry="4.6" transform="rotate(-20 8 25)"/><path d="M13 24 V3 Q15 9 22 12" /></svg>';
function mnCardHTML() {
  const done = !!labAns()['l27-medi'];
  return `<button type="button" class="lsn-card mn-card${done ? ' done' : ''}" onclick="labGo('l27-medi')"><span class="lsn-ci">${mnGlyph(false)}</span><span class="lsn-cc"><small>${done ? 'Test fait · le refaire' : 'Nouveau test'}</small><b>Médi chante</b><small>Touche-le : une note s’envole</small></span><i aria-hidden="true">›</i></button>`;
}
function mnHTML() {
  return `<div class="rp-top"><button type="button" class="mt-back" onclick="labGo('home')" aria-label="Retour à S’entraîner">${RP_BACK}</button><div><small>Labo · nouveau test</small><h1>Médi chante</h1></div></div>
    <div class="mn-pills" role="group" aria-label="La façon">${MN_V.map(([k, l]) => `<button type="button" class="${MN.v === k ? 'on' : ''}" aria-pressed="${MN.v === k}" onclick="mnPick(${k})"><b>${k}</b>${l}</button>`).join('')}</div>
    <section class="mn-stage" id="mn-stage"><span class="mn-medi" id="mn-medi" onpointerdown="mnTap(event)">${mediSVG('contente', {size: 150, anim: 'breathe', label: 'Médi : touche-le'})}</span><p class="mn-hint">Touche Médi, plusieurs fois</p></section>`
    + labFormHTML(LAB_TESTS27.find(t => t.id === 'l27-medi'));
}
function mnPick(k) { MN.v = k; document.querySelectorAll('.mn-pills button').forEach((b, i) => { b.classList.toggle('on', i + 1 === k); b.setAttribute('aria-pressed', i + 1 === k); }); }
function mnTap() {
  const st = $('mn-stage'), md = $('mn-medi'); if (!st || !md) return;
  let k; do k = Math.floor(Math.random() * MN_NOTES.length); while (k === MN.last && MN_NOTES.length > 1); MN.last = k;
  try { const ac = audioReady(); pluck(MN_NOTES[k][1], ac.currentTime + .01, 1.3, .2); } catch (e) {}
  const sr = st.getBoundingClientRect(), mr = md.getBoundingClientRect();
  const x = mr.left - sr.left + mr.width * .55, y = mr.top - sr.top + mr.height * .12, two = Math.random() < .35;
  const el = document.createElement('span'); el.className = 'mn-n v' + MN.v; el.style.left = x + 'px'; el.style.top = y + 'px';
  const side = Math.random() < .5 ? -1 : 1; el.style.setProperty('--sx', side * (40 + Math.random() * 50) + 'px'); el.style.setProperty('--rot', side * (10 + Math.random() * 20) + 'deg');
  el.style.setProperty('--c', MN_COL[k % MN_COL.length]);
  el.innerHTML = MN.v === 1 ? `<i class="bb">${mnGlyph(two)}<small>${MN_NOTES[k][0]}</small></i>` : `<i class="gl">${mnGlyph(two)}</i>`;
  st.appendChild(el);
  const life = MN.v === 1 ? 950 : MN.v === 2 ? 800 : 620;
  setTimeout(() => { const r = (el.firstChild || el).getBoundingClientRect();   // là où la note est arrivée
    mnBurst(st, r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2, MN.v); el.remove(); }, life);
}
// le petit feu d'artifice : des éclats qui partent en étoile et s'éteignent
function mnBurst(st, x, y, v) {
  const n = v === 3 ? 14 : 9;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + Math.random() * .3, d = (v === 3 ? 34 : 24) + Math.random() * 14, s = document.createElement('i');
    s.className = 'mn-sp v' + v; s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--dx', (Math.cos(a) * d).toFixed(1) + 'px'); s.style.setProperty('--dy', (Math.sin(a) * d + (v === 3 ? 10 : 0)).toFixed(1) + 'px');
    s.style.setProperty('--a', (a * 180 / Math.PI).toFixed(0) + 'deg'); s.style.setProperty('--c', MN_COL[(i + (v === 3 ? 1 : 0)) % MN_COL.length]);
    st.appendChild(s); s.addEventListener('animationend', () => s.remove());
  }
}

/* ═══════ MÉDI, la mascotte (refonte du 18/11/2026) ═══════
   mediSVG(expression, {size, anim, label}) rend le personnage en SVG.
   Expressions : neutre, clin, contente, curieuse, concentree.
   Animations (CSS, couche 20-refonte-medi) : breathe, blink, jump, tilt, look, hop.
   Règles de la charte : une seule fois par écran, jamais pendant qu'on joue une fiche, jamais sous 24 px. */
const MEDI_BODY = 'M100 214 C88 214 20 128 15 78 C10 32 48 8 100 8 C152 8 190 32 185 78 C180 128 112 214 100 214 Z';
const MEDI_EYES = {
  neutre: '<rect class="me" x="72" y="64" width="20" height="42" rx="10"/><rect class="me" x="124" y="64" width="20" height="42" rx="10"/>',
  clin: '<rect class="me" x="72" y="64" width="20" height="42" rx="10"/><path class="ms" d="M122 90 Q134 72 146 90"/>',
  contente: '<path class="ms" d="M70 92 Q82 74 94 92"/><path class="ms" d="M122 92 Q134 74 146 92"/>',
  curieuse: '<rect class="me" x="76" y="52" width="20" height="42" rx="10"/><rect class="me" x="128" y="52" width="20" height="42" rx="10"/>',
  concentree: '<rect class="me" x="62" y="62" width="20" height="38" rx="10"/><rect class="me" x="114" y="62" width="20" height="38" rx="10"/>'
};
const MEDI_LABEL = {neutre: 'Médi', clin: 'Médi fait un clin d’œil', contente: 'Médi est contente', curieuse: 'Médi est curieuse', concentree: 'Médi écoute'};
function mediSVG(expr = 'neutre', o = {}) {
  const size = Math.max(24, o.size || 64), anim = o.anim || 'breathe', eyes = MEDI_EYES[expr] || MEDI_EYES.neutre;
  const label = o.label || MEDI_LABEL[expr] || 'Médi';
  return `<svg class="medi a-${anim}" width="${size}" height="${Math.round(size * 250 / 240)}" viewBox="-20 -10 240 250" role="img" aria-label="${label}">`
    + `<g class="mv"><g transform="rotate(-14 100 110)"><path class="mb" d="${MEDI_BODY}"/><g class="mc">${eyes}</g></g></g></svg>`;
}
// Médi + sa bulle, sur une ligne
function mediBulle(expr, html, o = {}) {
  return `<div class="medi-row${o.cls ? ' ' + o.cls : ''}">${mediSVG(expr, o)}<div class="bulle">${html}</div></div>`;
}
// Le bouton Créer « gratte » au toucher
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('.tb-create,.nl-create');
  if (!b) return;
  b.classList.remove('strum'); void b.offsetWidth; b.classList.add('strum');
  clearTimeout(b._st); b._st = setTimeout(() => b.classList.remove('strum'), 500);
});
// Médi de Découvrir saute quand on le touche
document.addEventListener('pointerdown', e => {
  const m = e.target.closest && e.target.closest('.medi.a-vivant');
  if (!m) return;
  m.classList.remove('poke'); void m.getBoundingClientRect(); m.classList.add('poke');
  clearTimeout(m._pk); m._pk = setTimeout(() => m.classList.remove('poke'), 1100);
});

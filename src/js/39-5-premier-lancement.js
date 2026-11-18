/* ═══════ PREMIER LANCEMENT : 3 écrans pour comprendre l'app (une seule fois, nouvelle installation) ═══════ */
const ONB = [
  ['Retiens tes morceaux', 'Une fiche par chanson : les accords et le rythme de chaque partie, lisibles d’un coup d’œil pendant que tu joues.',
    '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>'],
  ['Passe tes murs', 'Changer d’accord sans casser le rythme, le barré, les arpèges… Des blocs courts en vidéo, dans l’ordre que tu veux.',
    '<path d="M3 17l5-10 4 8 3-5 6 9"/>'],
  ['Une fiche t’attend', 'Wonderwall et quelques classiques sont déjà prêts pour essayer. Touche + pour créer ta propre fiche.',
    '<path d="M7 4.5v15l13-7.5z"/>']];
let onbI = 0;
function onbShow() {
  if ($('onb')) return;
  const el = document.createElement('div');
  el.id = 'onb'; el.className = 'onb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Bienvenue');
  document.body.appendChild(el); onbI = 0; onbRender();
}
function onbRender() {
  const [t, d, ico] = ONB[onbI], last = onbI === ONB.length - 1;
  $('onb').innerHTML = `<div class="onb-card">
    <button type="button" class="onb-skip" onclick="onbEnd()">Passer</button>
    <div class="onb-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${ico}</svg></div>
    <h2>${t}</h2><p>${d}</p>
    <div class="onb-dots" aria-hidden="true">${ONB.map((_, i) => `<i class="${i === onbI ? 'on' : ''}"></i>`).join('')}</div>
    <button type="button" class="btn btn-primary onb-next" onclick="${last ? 'onbEnd()' : 'onbI++;onbRender()'}">${last ? 'C’est parti' : 'Suivant'}</button>
  </div>`;
}
function onbEnd() { LS.set('gms_onboarded', true); const el = $('onb'); if (el) el.remove(); }

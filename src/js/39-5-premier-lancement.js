/* ═══════ PREMIER LANCEMENT : 3 écrans pour comprendre l'app (une seule fois, nouvelle installation) ═══════ */
// refonte du 18/11 : Médi se présente (3 écrans)
const ONB = [
  ['Salut,<br>moi c’est Médi.', 'Je garde les morceaux que tu apprends sur le tas, et je t’aide à passer les murs de la guitare.', 'medi'],
  ['Une fiche<br>par morceau.', 'Les accords et ton rythme, lisibles d’un coup d’œil pendant que tu joues. Le rythme, tu l’enregistres en grattant.', 'fiche'],
  ['Passe tes murs.', 'Changer d’accord sans casser le rythme, le barré, les arpèges… En vidéos courtes, dans l’ordre que tu veux.', 'murs']];
function onbArt(k) {
  if (k === 'medi') return `<div class="onb-m">${mediSVG('clin', {size: 160, anim: 'breathe'})}</div>`;
  if (k === 'fiche') {
    const pat = ['d', '', 'd', 'u', '', 'u', 'd', 'u'], ar = a => a === 'd' ? '<svg viewBox="0 0 16 22"><path class="d" d="M8 2 V19 M2.5 13.5 L8 19 L13.5 13.5"/></svg>' : a === 'u' ? '<svg viewBox="0 0 16 22"><path d="M8 20 V3 M2.5 8.5 L8 3 L13.5 8.5"/></svg>' : '';
    return `<div class="onb-f"><div class="onb-fc"><div class="onb-fh"><b>Wonderwall</b><small>capo 2</small></div><div class="onb-fa"><span>Em7</span><span>G</span><span>Dsus4</span></div><div class="onb-fr">${pat.map(ar).map(x => `<i>${x}</i>`).join('')}</div></div><div class="onb-fm">${mediSVG('contente', {size: 76, anim: 'breathe'})}</div></div>`;
  }
  const br = (w, on, t) => `<span style="width:${w}px" class="${on ? 'on' : ''}">${t}</span>`;
  return `<div class="onb-w">${mediSVG('contente', {size: 86, anim: 'jump'})}<div>${br(130, 1, 'Changer d’accord')}${br(110, 1, 'Le rythme')}</div><div>${br(90, 0, 'Le barré')}${br(100, 0, 'Arpèges')}${br(70, 0, '…')}</div><div>${br(120, 0, 'Embellir')}${br(140, 0, 'Vraies chansons')}</div></div>`;
}
let onbI = 0;
function onbShow() {
  if ($('onb')) return;
  const el = document.createElement('div');
  el.id = 'onb'; el.className = 'onb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Bienvenue');
  document.body.appendChild(el); onbI = 0; onbRender();
}
function onbRender() {
  const [t, d, art] = ONB[onbI], last = onbI === ONB.length - 1;
  $('onb').innerHTML = `<div class="onb-card onb2">
    <div class="onb-top">${last ? '' : '<button type="button" class="onb-skip" onclick="onbEnd()">Passer</button>'}</div>
    <div class="onb-mid"><div class="onb-art">${onbArt(art)}</div>
    <div class="onb-tx"><h2>${t}</h2><p>${d}</p></div></div>
    <div class="onb-bot"><div class="onb-dots" aria-label="Écran ${onbI + 1} sur ${ONB.length}">${ONB.map((_, i) => `<i class="${i === onbI ? 'on' : ''}"></i>`).join('')}</div>
    <button type="button" class="onb-next" onclick="${last ? 'onbEnd()' : 'onbI++;onbRender()'}">${last ? 'C’est parti' : 'Suivant'}</button></div>
  </div>`;
}
function onbEnd() { LS.set('gms_onboarded', true); const el = $('onb'); if (el) el.remove(); }

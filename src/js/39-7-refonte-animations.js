/* ═══════ ANIMATIONS CLÉS DE LA REFONTE (planche « Ce qui bouge », validée le 18/11/2026) ═══════
   Lancement : Médi tombe, s'écrase, rebondit, le nom apparaît (une fois par ouverture).
   Fiche enregistrée : la fiche file se ranger dans l'onglet Fiches, qui rebondit avec un +1.
   (Créer qui gratte, gestes des onglets, corde juste, mur passé : dans leurs fichiers.) */
function launchSplash() {
  try { if (sessionStorage.getItem('gms_splash')) return; sessionStorage.setItem('gms_splash', '1'); } catch (e) {}
  if (mReduced() || !document.body) return;
  const el = document.createElement('div'); el.className = 'launch'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<div class="ln-m">${mediSVG('neutre', {size: 120, anim: 'blink'})}</div><b>Guitar Memory</b>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('out'), 1250); setTimeout(() => el.remove(), 1700);
}
function animRangee(title, chords) {
  if (mReduced()) return;
  const tab = [$('tb-fiches'), $('nl-fiches')].find(b => b && b.offsetParent); if (!tab) return;
  const card = document.createElement('div'); card.className = 'rg-card'; card.setAttribute('aria-hidden', 'true');
  card.innerHTML = `<b>${esc(title || 'Ma fiche')}</b><span>${esc((chords || []).slice(0, 4).join(' '))}</span>`;
  document.body.appendChild(card);
  const r = card.getBoundingClientRect(), t = tab.getBoundingClientRect();
  const dx = t.left + t.width / 2 - (r.left + r.width / 2), dy = t.top + 14 - (r.top + r.height / 2);
  const a = card.animate([{transform: 'translate(-50%,-50%) scale(1)', opacity: 1}, {transform: 'translate(-50%,-56%) scale(1.05)', opacity: 1, offset: .2},
    {transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.12)`, opacity: .9}], {duration: 650, easing: 'cubic-bezier(.5,0,.3,1)'});
  a.onfinish = () => {
    card.remove();
    const ic = tab.querySelector('svg:not([style*="none"])') || tab;
    ic.animate([{transform: 'scale(1)'}, {transform: 'scale(1.35) translateY(-4px)'}, {transform: 'scale(1)'}], {duration: 380, easing: 'cubic-bezier(.3,.7,.4,1)'});
    const bd = document.createElement('span'); bd.className = 'rg-badge'; bd.textContent = '+1'; tab.style.position = 'relative'; tab.appendChild(bd);
    setTimeout(() => bd.remove(), 1400);
  };
}

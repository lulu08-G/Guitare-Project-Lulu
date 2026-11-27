/* ═══════ NAV ═══════ */
function go(v) {
  if (curView === 'ed' && v !== 'ed' && !NAV.force && edDirty()) { edLeaveAsk(() => go(v)); return; }   // Médi propose de garder la fiche (23-6)
  if (v !== 'atelier' && atOn()) { atFlush(); atPause(); }
  stopPlay();
  if (v !== 'tuner') stopTuner();
  if (v !== 'metro' && metroPlaying) stopMetro();
  if (v !== 'labo') labStop();
  if (v !== 'ed' && cp.ed) { cp.ed = false; const sh = $('cp-sheet'); if (sh) { sh.classList.remove('on'); sh.innerHTML = ''; } }   // quitter le métronome coupe le son (19/11)
  if (v !== 'import') stopCapture();
  coursStop();
  exoStop();
  lvStop();
  const sOrd = ['trouver','fiches','creer','train','plus'], spOf = x => x === 'ed' ? 'creer' : (SPACE_OF[x] || 'fiches');
  const vx = (sOrd.indexOf(spOf(v)) >= sOrd.indexOf(spOf(curView)) ? 14 : -14) + 'px';   // sens du glissement de la vue
  document.querySelectorAll('.view').forEach(e => e.classList.remove('on'));
  $('v-' + v).style.setProperty('--vx', vx);
  $('v-' + v).classList.add('on');
  { const el = $('v-' + v); el.classList.add('enter'); clearTimeout(el._et); el._et = setTimeout(() => el.classList.remove('enter'), 750); }
  document.body.classList.toggle('playing', v === 'sheet'); // mode jeu : navigation masquée
  v === 'sheet' ? wakeOn() : wakeOff();
  const t = $('toast'); if (t && Date.now() - (t._ts || 0) > 500) { t.classList.remove('show'); clearTimeout(t._t); }   // un toast ne suit pas à l'écran suivant
  navMark(v);
  window.scrollTo(0,0);
  if (v === 'home') renderHome();
  if (v === 'disc') renderDisc();
  if (v === 'blocs') renderBlocs();
  if (v === 'lib') renderLib();
  if (v === 'cours') renderCours();
  if (v === 'exo' && !exoCur) exoRet = null;
  if (v === 'exo') exoRender();
  if (v === 'tuto') renderTuto();
  if (v === 'atelier') atOpen();
  if (v === 'tools') { $('tools-hero').innerHTML = toolsHeroSVG(); renderTools(); }
  if (v === 'metro') renderMetroAll();
  if (v === 'tuner') renderTunerStrings();
  if (v === 'plus') renderPlus();
  if (v === 'admin') renderAdmin();
  if (v === 'labo') { lab.view = 'home'; labRender(); }
  renderSubnav(v);
  navPush(v);   // retour = l'écran d'avant ; actualiser = on reste ici (23-6)
}


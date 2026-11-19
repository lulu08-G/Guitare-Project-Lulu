/* ═══════ CARNET (19/11) : « J'apprends » / « Je sais la jouer », et le tuto lu dans l'appli ═══════
   Une fiche est « je sais » si on l'a dit, sinon si elle a une prise audio, sinon si elle n'a pas de tuto.
   Le lecteur YouTube est piloté par postMessage (sans script externe) : recul de 10 s, vitesse, boucle A → B. */
function sheetKnow(s) {
  if (typeof s.know === 'boolean') return s.know;
  return (s.parts || []).some(p => p.rec) || !svTutoLink(s);
}
function svTutoLink(s) { return (s.links || []).find(l => ytId(l.url)) || null; }
function svKnowRender() {
  const h = $('sv-know'), s = cur; if (!h || !s) return;
  const k = sheetKnow(s);
  h.innerHTML = `<button type="button" aria-pressed="${!k}" class="${k ? '' : 'on'}" onclick="svKnowSet(false)">J’apprends</button><button type="button" aria-pressed="${k}" class="${k ? 'on' : ''}" onclick="svKnowSet(true)">Je sais la jouer</button>`;
}
function svKnowSet(v) {
  const s = cur; if (!s || sheetKnow(s) === v) return;
  s.know = v; s.updatedAt = Date.now(); DB.put('sheets', s);
  svKnowRender();
  if (v) toast((s.parts || []).some(p => p.rec) ? 'Bravo ! Elle est rangée dans « Je sais ».' : 'Bravo ! Enregistre ta version : c’est elle qui te la rappellera.');
}
const ytp = {t: 0, a: null, b: null, rate: 1, id: ''};
function svTutoRender() {
  const h = $('sv-tuto'), s = cur; if (!h || !s) return;
  const l = svTutoLink(s), id = l ? ytId(l.url) : '';
  if (!id) {
    ytp.id = '';
    h.innerHTML = sheetKnow(s) ? '' : `<section class="ytp-add"><div><b>Un tuto pour l’apprendre ?</b><small>Il se lit ici, sans quitter l’appli.</small></div>
      <div class="ytp-add-b"><button type="button" class="btn btn-primary btn-sm" onclick="svTutoPaste()">Coller le lien</button><button type="button" class="btn btn-ghost btn-sm" onclick="discGo(cur.title, cur.artist && cur.artist !== '—' ? cur.artist : '')">Chercher</button></div></section>`;
    return;
  }
  if (ytp.id === id && h.querySelector('iframe')) return;   // même vidéo : on ne recharge pas le lecteur
  ytp.id = id; ytp.t = 0; ytp.a = ytp.b = null; ytp.rate = 1;
  h.innerHTML = `<section class="ytp" aria-label="Tuto, lu dans l’appli"><div class="yt-embed"><iframe id="ytp-f" src="https://www.youtube.com/embed/${id}?playsinline=1&enablejsapi=1&rel=0" title="${esc(l.title || 'Tuto')}" allow="autoplay; encrypted-media" allowfullscreen loading="lazy" onload="ytpListen()"></iframe></div>
    <div class="ytp-ctl"><button type="button" onclick="ytpSeek(-10)" aria-label="Reculer de 10 secondes">−10 s</button><button type="button" id="ytp-loop" onclick="ytpLoop()" aria-pressed="false"></button><button type="button" id="ytp-rate" onclick="ytpRate()" aria-label="Vitesse"></button></div></section>`;
  ytpPaint();
}
function ytpCmd(func, args) { const f = $('ytp-f'); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({event: 'command', func, args: args || []}), '*'); }
function ytpListen() { const f = $('ytp-f'); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({event: 'listening', id: 2, channel: 'widget'}), '*'); }
const ytpFmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
function ytpPaint() {
  const l = $('ytp-loop'), r = $('ytp-rate'); if (!l || !r) return;
  const on = ytp.a != null && ytp.b != null;
  l.innerHTML = '<svg viewBox="0 0 16 14" aria-hidden="true"><path d="M3 4 H12 L10 2 M13 10 H4 L6 12"/></svg>' + (on ? `${ytpFmt(ytp.a)} → ${ytpFmt(ytp.b)}` : ytp.a != null ? `Fin de la boucle ?` : 'Boucle');
  l.classList.toggle('on', ytp.a != null); l.setAttribute('aria-pressed', ytp.a != null);
  l.setAttribute('aria-label', on ? 'Arrêter la boucle' : ytp.a != null ? 'Marquer la fin de la boucle' : 'Marquer le début de la boucle');
  r.textContent = String(ytp.rate).replace('.', ',') + '×'; r.classList.toggle('on', ytp.rate !== 1);
}
function ytpSeek(dt) { ytp.t = Math.max(0, ytp.t + dt); ytpCmd('seekTo', [ytp.t, true]); }
function ytpLoop() {
  if (ytp.a == null) { ytp.a = ytp.t; toast('Début de la boucle posé. Touche encore à la fin du passage.'); }
  else if (ytp.b == null) { ytp.b = Math.max(ytp.t, ytp.a + 1); ytpCmd('seekTo', [ytp.a, true]); }
  else ytp.a = ytp.b = null;
  ytpPaint();
}
function ytpRate() { ytp.rate = ytp.rate === 1 ? .75 : ytp.rate === .75 ? .5 : 1; ytpCmd('setPlaybackRate', [ytp.rate]); ytpPaint(); }
window.addEventListener('message', e => {
  const f = $('ytp-f'); if (!f || e.source !== f.contentWindow) return;
  try {
    const d = JSON.parse(e.data);
    if (d.info && typeof d.info.currentTime === 'number') {
      ytp.t = d.info.currentTime;
      if (ytp.a != null && ytp.b != null && ytp.t >= ytp.b) ytpCmd('seekTo', [ytp.a, true]);
    }
  } catch (x) {}
});
// un lien YouTube copié (YouTube : Partager → Copier le lien) arrive dans la fiche
async function svTutoPaste() {
  let t = '';
  try { t = await navigator.clipboard.readText(); } catch (e) {}
  const m = String(t || '').match(/https?:\/\/\S+/), url = m ? m[0] : '';
  if (!url || !ytId(url)) { toast('Dans YouTube : Partager → Copier le lien, puis reviens toucher « Coller le lien ».', true); return; }
  const s = cur; if (!s) return;
  s.links = s.links || []; s.links.unshift({id: uid(), url, title: 'Tuto'});
  s.blocks = s.blocks || {}; s.blocks.coffre = true; s.updatedAt = Date.now();
  await DB.put('sheets', s); viewSheet(s.id); toast('Tuto ajouté : il se lit en haut de la fiche.');
}
// partage depuis l'appli YouTube (Android, appli installée) : une nouvelle fiche avec la vidéo
function gmsShareIn() {
  const q = new URLSearchParams(location.search); if (!q.has('url') && !q.has('text')) return;
  const all = [q.get('url'), q.get('text'), q.get('title')].filter(Boolean).join(' ');
  const m = all.match(/https?:\/\/\S+/), url = m ? m[0] : '';
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
  if (!url || !ytId(url)) return;
  const title = (q.get('title') || '').replace(/https?:\/\/\S+/g, '').replace(/\s*[-–|(].*$/, '').trim();
  newSheet(); draft.links = [{id: uid(), url, title: 'Tuto'}]; draft.know = false;
  if (title) { $('f-title').value = title; edSyncSave(); }
  edLinksRender(); toast('La vidéo est dans la fiche. Ajoute les accords !');
}

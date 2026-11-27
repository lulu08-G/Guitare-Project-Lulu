/* ═══════ ROGNER UNE PRISE (27/11, bêta : choix B de Lucas, « ok pour tout ») ═══════
   Par défaut à la fin de chaque enregistrement (rythme, audio, vidéo), et « Rogner » dans le menu ⋯ d'une prise.
   Médi propose déjà la coupe : un rythme part du 1er coup et compte des mesures entières (les médiators s'aimantent
   sur les mesures, la boucle tourne sans à-coup sur la fiche) ; un audio ou une vidéo perd ses silences au début et à la fin.
   Les deux médiators se glissent au doigt (le plus proche du doigt bouge). Le fichier reste entier : seuls le début et
   la fin changent (prise du rythme : start / end ; Mes prises : a / b, dur = la longueur gardée).
   Vidéo : la bande d'images en bas, l'étoile = la miniature (le plus beau moment entre les deux médiators). */
const FP_HANDLE = `<svg viewBox="-20 -10 240 250" aria-hidden="true"><path d="${MEDI_BODY}"/></svg>`;
const fpTc = s => { s = Math.max(0, s || 0); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1).replace('.', ','); };

// la coupe proposée par Médi
function fpAutoTrim(buf, kind, D) {
  if (!buf) return {a: 0, b: D || 0, n: 0, bar: 0};
  D = buf.duration;
  if (kind === 'rh') {
    const tl = l26FromTake(buf, 0, D, cur && cur.bpm);
    if (tl && tl.bar && tl.hits.length > 1) {
      const a = Math.max(0, tl.off - .03), last = tl.hits[tl.hits.length - 1].t, nMax = Math.floor((D - a) / tl.bar + .02);
      if (nMax >= 1) { const n = Math.max(1, Math.min(nMax, Math.round((last - tl.off) / tl.bar + .15))); return {a, b: Math.min(D, a + n * tl.bar), n, bar: tl.bar, hits: tl.hits}; }
    }
  }
  // les silences du début et de la fin
  const d = buf.getChannelData(0), sr = buf.sampleRate, hop = Math.max(1, Math.round(sr * .01)), N = Math.floor(d.length / hop), env = new Float32Array(N); let pk = 0;
  for (let i = 0; i < N; i++) { let e = 0; for (let k = i * hop, m = k + hop; k < m; k += 2) e += d[k] * d[k]; env[i] = Math.sqrt(e / (hop / 2)); if (env[i] > pk) pk = env[i]; }
  const out = {a: 0, b: D, n: 0, bar: 0};
  if (pk < .003) return out;
  const thr = Math.max(.006, pk * .12); let f = 0, l = N - 1;
  while (f < N && env[f] < thr) f++;
  while (l > f && env[l] < thr) l--;
  out.a = Math.max(0, f * hop / sr - .25); out.b = Math.min(D, (l + 1) * hop / sr + .6);
  if (out.b - out.a < .5) { out.a = 0; out.b = D; }
  return out;
}
function fpTrimSay(T) {
  if (T.kind === 'rh' && T.bar && !T.edit) return `J’ai coupé le blanc du début. Ta boucle fait ${T.n} mesure${T.n > 1 ? 's' : ''} pile.`;
  if (T.edit) return T.bar ? 'Glisse les médiators : ils s’aimantent sur les mesures.' : 'Glisse les médiators : je garde ce qu’il y a entre les deux.';
  return T.a > .15 || T.D - T.b > .3 ? 'J’ai enlevé le blanc au début et à la fin. Ça te va ?' : 'Joli ! Glisse les médiators si tu veux couper.';
}
function fpTrimHTML(T) {
  const st = T.kind === 'video';
  return `<div class="fp-trim${st ? ' st' : ''}" id="fp-trim" onpointerdown="fpTrimDown(event)">`
    + (st ? '<div class="fr"></div><span class="star" hidden>★ miniature</span>' : '')   // vidéo : les images en haut, le son en dessous (Lucas, 27/11 : voir les blancs)
    + '<svg class="g" viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true"></svg><svg class="o" viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true"></svg>'
    + `<i class="out l"></i><i class="out r"></i><i class="zone"></i><i class="ph" aria-hidden="true"></i><span class="hd s" aria-label="Début">${FP_HANDLE}<i></i></span><span class="hd e" aria-label="Fin">${FP_HANDLE}<i></i></span></div>`
    + (T.bar ? '<div class="fp-tks" id="fp-tks" aria-hidden="true"></div>' : '')
    + '<div class="fp-ttr"><span><b id="fp-ta"></b> début</span><span class="ln" id="fp-tl"></span><span>fin <b id="fp-tb"></b></span></div>';
}
function fpTrimPaint() {
  const T = FP.T, el = $('fp-trim'); if (!T || !el || !T.D) return;
  el.style.setProperty('--a', (T.a / T.D * 100).toFixed(2) + '%'); el.style.setProperty('--b', (T.b / T.D * 100).toFixed(2) + '%');
  $('fp-ta').textContent = fpTc(T.a); $('fp-tb').textContent = fpTc(T.b);
  $('fp-tl').textContent = T.bar ? `${T.n} mesure${T.n > 1 ? 's' : ''}` : fpTc(T.b - T.a);
  const tk = $('fp-tks');
  if (tk && T.bar) {
    let s = '';
    for (let k = 0; T.a + k * T.bar <= T.D + 1e-3 && k < 64; k++) {
      s += `<i class="${k <= T.n ? 'in' : ''}" style="left:${((T.a + k * T.bar) / T.D * 100).toFixed(2)}%"></i>`;
      if (k < T.n && T.n <= 12) s += `<b style="left:${((T.a + (k + .5) * T.bar) / T.D * 100).toFixed(2)}%">${k + 1}</b>`;
    }
    tk.innerHTML = s;
  }
  const P = FP.pl; if (P) { P.a = T.a; P.b = T.b; }
}
// le doigt : sur un médiator (ou son trait orange, à un doigt près) on rogne ; ailleurs on déplace la barre blanche
// pour avancer / reculer dans la prise, sans toucher à la coupe (Lucas, 27/11)
function fpTrimDown(e) {
  const T = FP.T, el = e.currentTarget; if (!T || !T.D) return;
  e.preventDefault();
  const r = el.getBoundingClientRect(), at = ev => Math.max(0, Math.min(T.D, (ev.clientX - r.left) / r.width * T.D));
  const px = t => r.left + t / T.D * r.width, hit = e.target.closest && e.target.closest('.hd');
  const da = Math.abs(e.clientX - px(T.a)), db = Math.abs(e.clientX - px(T.b));
  const h = hit ? (hit.classList.contains('s') ? 's' : 'e') : Math.min(da, db) <= 22 ? (da <= db ? 's' : 'e') : null;
  const P0 = FP.pl;
  const scrub = ev => { const P = FP.pl; if (!P) return; try { P.el.currentTime = Math.max(T.a, Math.min(T.b - .05, at(ev))); } catch (_) {} fpPlPaint(); };
  const trim = ev => {
    const t = at(ev);
    if (T.bar) {
      if (h === 's') {   // le début se pose sur un coup proche, la fin suit (même nombre de mesures)
        let a = Math.max(0, Math.min(t, T.D - T.bar)), best = null;
        (T.hits || []).forEach(x => { const c = Math.max(0, x.t - .03); if (Math.abs(c - a) < .12 && (best == null || Math.abs(c - a) < Math.abs(best - a))) best = c; });
        T.a = best != null ? best : a;
        T.n = Math.max(1, Math.min(T.n || 1, Math.floor((T.D - T.a) / T.bar + .02)));
      } else T.n = Math.max(1, Math.min(Math.floor((T.D - T.a) / T.bar + .02), Math.round((t - T.a) / T.bar)));
      T.b = Math.min(T.D, T.a + T.n * T.bar);
    } else if (h === 's') T.a = Math.max(0, Math.min(t, T.b - .5));
    else T.b = Math.min(T.D, Math.max(t, T.a + .5));
    fpTrimPaint();
    const P = FP.pl;   // à l'arrêt, on voit (et on entend au prochain ▶) l'endroit du médiator
    if (P && P.el.paused) { try { P.el.currentTime = h === 's' ? T.a : Math.max(T.a, T.b - .05); } catch (_) {} fpPlPaint(); }
  };
  const set = h ? trim : scrub, hd = h && el.querySelector('.hd.' + h);
  if (hd) hd.classList.add('on'); else el.classList.add('scrub');
  set(e); try { el.setPointerCapture(e.pointerId); } catch (_) {}
  const mv = ev => set(ev), up = () => {
    el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
    if (hd) hd.classList.remove('on'); el.classList.remove('scrub');
    if (!h) return;
    const P = FP.pl; if (P && (P.el.currentTime < T.a - .02 || P.el.currentTime > T.b)) { try { P.el.currentTime = T.a; } catch (_) {} fpPlPaint(); }
    if (T.kind === 'video' && T.url && T.tt != null && (T.tt < T.a || T.tt > T.b)) fpTrimStar(T.url, T);   // la miniature reste entre les deux
  };
  el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
function fpTrimWave(buf) {
  const el = $('fp-trim'); if (!el || !buf) return;
  const bars = fpBars(fpPeaks(buf, 0, buf.duration, 60), 300, 48);
  el.querySelector('.g').innerHTML = bars; el.querySelector('.o').innerHTML = bars;
}
// la bande d'images d'une vidéo
async function fpTrimFrames(url, D) {
  const fr = document.querySelector('#fp-trim .fr'); if (!fr) return;
  const n = 7, v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto';
  const wait = (ev, ms) => new Promise(r => { const t = setTimeout(r, ms); v.addEventListener(ev, () => { clearTimeout(t); r(); }, {once: true}); });
  fr.innerHTML = Array.from({length: n}, () => '<canvas width="48" height="64"></canvas>').join('');
  v.src = url; await wait('loadeddata', 5000);
  const cs = fr.querySelectorAll('canvas');
  for (let k = 0; k < n && fr.isConnected; k++) {
    v.currentTime = D * (k + .5) / n; await wait('seeked', 1500);
    try { const g = cs[k].getContext('2d'), vw = v.videoWidth, vh = v.videoHeight, s = Math.max(48 / vw, 64 / vh); g.drawImage(v, (48 - vw * s) / 2, (64 - vh * s) / 2, vw * s, vh * s); } catch (e) {}
  }
  v.removeAttribute('src'); v.load();
}
async function fpTrimStar(url, T) {
  if (FP.T !== T) return;
  const tt = await fpBestFrame(url, T.D, T.a, T.b); if (FP.T !== T) return;
  if (tt < T.a - .01 || tt > T.b + .01) return fpTrimStar(url, T);   // la coupe a bougé pendant la recherche : on recommence entre les deux
  T.tt = tt;
  const s = document.querySelector('#fp-trim .star'); if (s) { s.hidden = false; s.style.left = (tt / T.D * 100).toFixed(2) + '%'; }
}
// le lecteur et la coupe, une fois l'infobulle en place (après un enregistrement, ou « Rogner »)
function fpTrimMount(T, pop, el, url, buf) {
  FP.T = T; T.url = url;
  if (T.kind === 'video') fpVidFit(pop.querySelector('.fp-vid'), el);
  el.src = url; fpPlInit(el, T.a, T.b);
  if (FP.pl) { FP.pl.D = T.D; FP.pl.loop = T.kind === 'rh'; }
  if (!T.D) return;
  fpTrimWave(buf);   // le son, aussi sous les images d'une vidéo
  if (T.kind === 'video') fpTrimFrames(url, T.D).then(() => fpTrimStar(url, T));
  fpTrimPaint();
}
const fpTrimCtl = T => T.kind === 'video' ? '' : `<div class="fp-tpl"><button type="button" class="fp-pp" onclick="fpToggle()" aria-label="Écouter">${FP_PLAY}</button><span>${T.kind === 'rh' ? 'Écouter la boucle' : 'Écouter'}</span></div>`;
const fpTrimVid = () => `<div class="fp-vid sm"><video playsinline preload="metadata"></video><button type="button" class="fp-pp fp-vpl" onclick="fpToggle()" aria-label="Lire">${FP_PLAY}</button></div>`;

/* ── « Rogner » dans le menu ⋯ d'une prise déjà gardée ── */
function fpTrimOpen(T, url, buf) {
  const pop = fpPopOpen(FP.anchor, `<div class="fp-rr top">${fpMedi('fp-idle')}<p class="fp-said">${fpTrimSay(T)}</p></div>${T.kind === 'video' ? fpTrimVid() : ''}${fpTrimHTML(T)}${fpTrimCtl(T)}
    <div class="fp-btns"><button type="button" class="ghost" onclick="fpPopClose()">Annuler</button><button type="button" class="keep" onclick="fpTrimSave()">Garder</button></div>`, 'fp-rp fp-after');
  fpTrimMount(T, pop, T.kind === 'video' ? pop.querySelector('video') : new Audio(), url, buf);
  fpPlace();
}
async function fpTrimTake(i, mid) {
  const p = cur && cur.parts[i], t = p && fpTakes(p).find(x => x.mediaId === mid); if (!t) return;
  let buf = null; try { buf = await recBuffer(mid); } catch (e) {}
  const url = await mediaURL(mid); if (!buf || !url) { toast('Impossible de rogner cette prise', true); return; }
  const g = fpAutoTrim(buf, 'rh'), D = buf.duration, a = Math.min(t.start || 0, D), b = Math.min(t.end || D, D);
  const T = {kind: 'rh', edit: true, D, a, b, bar: g.bar, hits: g.hits, n: g.bar ? Math.max(1, Math.round((b - a) / g.bar)) : 0,
    save: () => { t.start = +T.a.toFixed(3); t.end = +T.b.toFixed(3); }};
  fpTrimOpen(T, url, buf);
}
async function fpTrimMedia(id) {
  const m = (cur.media || []).find(x => x.id === id); if (!m) return;
  const url = await mediaURL(m.mediaId); if (!url) return;
  let buf = null;
  try { if (m.kind === 'video') { const r = await DB.get('media', m.mediaId); buf = r && await recDecode(r.blob); } else buf = await recBuffer(m.mediaId); } catch (e) {}
  let D = buf ? buf.duration : 0;
  if (!D) D = await new Promise(r => { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => r(isFinite(v.duration) ? v.duration : (m.b || 0)); v.onerror = () => r(m.b || 0); v.src = url; });
  if (!D) { toast('Impossible de rogner cette prise', true); return; }
  const T = {kind: m.kind, edit: true, D, a: Math.min(m.a || 0, D), b: Math.min(m.b || D, D), bar: 0, tt: m.tt,
    save: () => { m.a = +T.a.toFixed(2); m.b = +T.b.toFixed(2); m.dur = +(T.b - T.a).toFixed(1); if (T.tt != null && T.tt >= T.a && T.tt <= T.b) m.tt = T.tt; else delete m.tt; }};
  fpTrimOpen(T, url, buf);
}
async function fpTrimSave() {
  const T = FP.T; if (!T || !T.save) return;
  T.save(); fpPopClose(); await fpSave(); toast('C’est rogné');
  viewSheet(cur.id, svAll ? null : svPart);
}

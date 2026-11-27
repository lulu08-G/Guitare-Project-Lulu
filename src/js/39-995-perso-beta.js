/* ═══════ LE BAS DE LA FICHE, VERSION BÊTA (Lucas, 27/11) ═══════
   Seulement avec ?beta. Maquette validée (rendu final) : https://claude.ai/artifact/SRecvTUoxQHw7JGh2N7Szf
   - sous chaque rythme, ses prises : Médi est assis sur celle qui joue sur la fiche (p.rec), les autres sont gardées
     dans p.recAlt ; le « + » enregistre un rythme à la volée ;
   - « Mes prises » (s.media : vidéos surtout, audios aussi) en pochettes, puis les tutos et « Chercher un autre tuto » ;
     plus de « mode gaucher » ni de bloc « Perso » replié ;
   - une prise s'ouvre en infobulle : écouter, glisser dans le son, tempo de lecture (sans changer la hauteur) ;
   - l'enregistreur en infobulle : Rythme (sur la fiche) | Audio · Vidéo (mes prises), Médi explique ;
     Médi compte en sautant (4 temps au tempo de la fiche, au 4 il fait un tour), puis il ferme les yeux et écoute ;
     en vidéo, la caméra en plein écran, Médi compte au milieu puis file dans le coin. */
const FP = {f: 'all', all: false, anchor: null, pl: null, raf: 0, R: null, face: 'user'};
const fpDur = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const fpDate = t => t ? new Date(t).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}) : '';
const FP_I = {
  cam: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',
  rh: '<path d="M6 8v8M12 5v14M18 8v8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  dots: '<circle class="f" cx="5" cy="12" r="1.7"/><circle class="f" cx="12" cy="12" r="1.7"/><circle class="f" cx="19" cy="12" r="1.7"/>',
  back: '<path d="M4 12a8 8 0 108-8H8"/><path d="M8 1v6H2"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  flip: '<path d="M4 8h12l-3-3M20 16H8l3 3"/>',
  yt: '<rect x="3" y="6" width="18" height="12" rx="4"/><path class="f" d="M10 9.5v5l4.3-2.5z"/>',
  link: '<path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/>',
  find: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
};
const fpI = (n, c) => `<svg class="fp-ic${c ? ' ' + c : ''}" viewBox="0 0 24 24" aria-hidden="true">${FP_I[n]}</svg>`;
const FP_EYES = '<rect class="fp-me" x="72" y="64" width="20" height="42" rx="10"/><rect class="fp-me" x="124" y="64" width="20" height="42" rx="10"/>';
const FP_SHUT = '<path class="fp-ml" d="M70 92 Q82 80 94 92"/><path class="fp-ml" d="M122 92 Q134 80 146 92"/>';
const FP_JOY = '<path class="fp-ml" d="M70 92 Q82 72 94 92"/><path class="fp-ml" d="M122 92 Q134 72 146 92"/>';
const fpMedi = (cls, eyes) => `<svg class="fp-medi ${cls || ''}" viewBox="-20 -10 240 250" aria-hidden="true"><g class="mv"><g class="sp"><g transform="rotate(-14 100 110)"><path class="fp-mb" d="${MEDI_BODY}"/>${eyes || FP_EYES}</g></g></g></svg>`;
const FP_SIT = fpMedi('fp-sit');   // Médi assis sur la prise qui joue sur la fiche
const FP_HOLLOW = `<svg class="fp-hol" viewBox="-20 -10 240 250" aria-hidden="true"><path transform="rotate(-14 100 110)" d="${MEDI_BODY}"/></svg>`;
const FP_PLAY = fbMediLogo('<path class="tri" d="M62.6 76L130.5 111L62.6 146Z"/>');
const fpRecIco = stop => `<svg class="fp-rec" viewBox="-20 -10 240 250" aria-hidden="true"><path class="mb" d="${MEDI_BODY}"/>${stop ? '<rect class="rd" x="78" y="70" width="44" height="44" rx="10"/>' : '<circle class="rd" cx="100" cy="92" r="26"/>'}</svg>`;
// le bouton d'enregistrement : couché pour lancer, il se relève quand ça enregistre, le rond orange vif bat (Lucas, 27/11)
const FP_RECM = `<svg class="fp-recm" viewBox="-20 -10 240 250" aria-hidden="true"><g class="pk"><path class="mb" d="${MEDI_BODY}"/><circle class="rd" cx="100" cy="92" r="26"/></g></svg>`;
// l'interrupteur maison : le médiator posé sur une corde (comme « En rythme »)
const fpPickSw = on => `<svg class="fp-ms${on ? ' on' : ''}" viewBox="0 0 44 24" aria-hidden="true"><path class="s" d="M2 13H42"/><path class="p" transform="translate(${on ? 26 : 4} 2)" d="M7 19C6 19 .8 12 .5 8 .2 4 3 1.5 7 1.5s6.8 2.5 6.5 6.5C13.2 12 8 19 7 19z"/></svg>`;
const fpStrings = cls => `<svg class="fp-str ${cls || ''}" viewBox="0 0 300 56" preserveAspectRatio="none" aria-hidden="true">${[0, 1, 2, 3, 4, 5].map(k => { const y = (8 + k * 8).toFixed(1); return `<path class="ln" style="stroke-width:${(.8 + .3 * k).toFixed(1)}" d="M0 ${y}H300"/><path class="vb" data-y="${y}" d="M0 ${y}H300"/>`; }).join('')}</svg>`;

/* ── les prises du rythme d'une partie ── */
const fpTakes = p => [p.rec, ...(p.recAlt || [])].filter(Boolean);
function fpTakeName(p, t) {
  if (t.name) return t.name;
  const k = fpTakes(p).indexOf(t);
  return k > 0 ? 'Prise ' + (k + 1) : 'Ma prise';
}
function fpTakesRow(p, i) {
  const ts = fpTakes(p);
  if (!ts.length) return `<div class="fp-tk" onclick="event.stopPropagation()"><button type="button" class="fp-rh0" onclick="fpRec('rh',this.querySelector('.fp-recm'),${i})">${FP_RECM}<span><b>Enregistre ton rythme</b><small>c’est lui qui jouera sur la fiche</small></span></button></div>`;
  const chips = ts.map(t => `<button type="button" class="fp-chip${t === p.rec ? ' on' : ''}" onclick="fpTakePop(${i},'${t.mediaId}',this,event)" title="${t === p.rec ? 'Elle joue sur la fiche' : ''}">${t === p.rec ? FP_SIT : FP_HOLLOW}<span>${esc(fpTakeName(p, t))}</span><small>${fpDur((t.end || t.dur || 0) - (t.start || 0))}</small></button>`).join('');
  return `<div class="fp-tk" onclick="event.stopPropagation()"><span class="fp-lbl">Prises du rythme</span><div class="fp-tkc">${chips}<button type="button" class="fp-add${ts.length ? '' : ' wide'}" onclick="fpRec('rh',this,${i})" aria-label="Enregistrer un rythme à la volée">${fpI('plus')}${ts.length ? '' : '<span>Enregistrer mon rythme</span>'}</button></div></div>`;
}

/* ── « Mes prises » et les tutos ── */
function fpPerso() {
  const h = $('fp-perso'), s = cur; if (!h || !s) return;
  const ms = (s.media || []).filter(m => m.kind === 'video' || m.kind === 'audio').slice().sort((a, b) => (b.at || 0) - (a.at || 0));
  const nv = ms.filter(m => m.kind === 'video').length, na = ms.length - nv;
  if (!(nv && na)) FP.f = 'all';
  const list = ms.filter(m => FP.f === 'all' || m.kind === FP.f), shown = FP.all ? list : list.slice(0, 4), rest = list.length - shown.length;
  const cnt = [nv ? `${nv} vidéo${nv > 1 ? 's' : ''}` : '', na ? `${na} audio${na > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
  let out = s.memo ? `<div class="pv-note fp-memo">${esc(s.memo)}</div>` : '';
  out += `<section class="fp-sec"><div class="fp-sh"><div><b>Mes prises</b><small>${cnt || 'pour toi, et pour ton profil'}</small></div><button type="button" class="fp-recb" id="fp-recb" onclick="fpRec(null,this)">${fpRecIco()}Enregistrer</button></div>`;
  if (nv && na) out += `<div class="fp-filt">${[['all', 'Tout'], ['video', 'Vidéos'], ['audio', 'Audios']].map(([k, l]) => `<button type="button" class="${FP.f === k ? 'on' : ''}" aria-pressed="${FP.f === k}" onclick="fpFilt('${k}')">${k === 'all' ? '' : fpI(k === 'video' ? 'cam' : 'mic')}${l}</button>`).join('')}</div>`;
  if (!ms.length) out += `<div class="fp-empty">${mediSVG('curieuse', {size: 40, anim: 'blink'})}<p>Filme-toi une fois. Dans trois mois, tu sauras exactement comment tu le jouais.</p></div>`;
  else out += `<div class="fp-grid">${shown.map(fpPoch).join('')}</div>` + (rest > 0 ? `<button type="button" class="fp-more" onclick="FP.all=true;fpPerso()">${rest > 1 ? `Voir les ${rest} autres prises` : 'Voir la dernière prise'}<span aria-hidden="true">›</span></button>` : '');
  out += '</section>';
  h.innerHTML = out;
  fpHydrate(h);
  fpTutos();
}
// les tutos restent tout en bas (Lucas, 27/11) : le tuto YouTube se lit ici, les autres liens dessous
function fpTutos() {
  const h = $('fp-tlist'), s = cur; if (!h || !s) return;
  const links = s.links || [], top = svTutoLink(s), rest = links.filter(l => l !== top);
  if (!links.length) { h.innerHTML = fpDash('Un tuto pour l’apprendre ? Il se lit ici, sans quitter l’appli.', 'tutoOpenFor(cur.title, cur.artist)', 'Chercher un tuto'); return; }
  h.innerHTML = rest.map(l => { const k = links.indexOf(l), yt = ytId(l.url); let host = ''; try { host = new URL(l.url).hostname.replace(/^www\./, ''); } catch (e) {}
      return `<button type="button" class="fp-tuto" onclick="fpTuto(${k})"><span class="fp-yt">${fpI(yt ? 'yt' : 'link')}</span><span class="fp-tt2"><b>${esc(l.title && l.title !== 'Video' ? l.title : yt ? 'Tuto YouTube' : host || l.url)}</b><small>${yt ? 'YouTube · le lire ici' : esc(host)}</small></span><i aria-hidden="true">›</i></button>`; }).join('')
    + `<button type="button" class="fp-find" onclick="tutoOpenFor(cur.title, cur.artist)">${fpI('find')}Chercher un autre tuto</button>`;
}
// le visuel quand il n'y a encore rien : Médi, une phrase, un « + » (comme l'ancien bloc « Perso »)
const fpDash = (txt, fn, lbl, cls) => `<button type="button" class="fp-dash${cls ? ' ' + cls : ''}" onclick="${fn}" aria-label="${lbl}">${mediSVG('curieuse', {size: cls ? 30 : 40, anim: 'blink'})}<span>${txt}</span><i aria-hidden="true">+</i></button>`;
function fpFilt(k) { FP.f = k; FP.all = false; fpPerso(); }
function fpPoch(m) {
  const v = m.kind === 'video';
  return `<button type="button" class="fp-po" onclick="fpMediaPop('${m.id}',this)"><span class="fp-th${v ? '' : ' au poch c' + fpPochC(m)}" data-mid="${m.mediaId}" data-k="${m.kind}">`
    + (v ? `<video muted playsinline preload="metadata"></video><span class="fp-cam">${fpI('cam')}</span>` : fpPochSVG(m))
    + `<span class="fp-pl">${FP_PLAY}</span><span class="fp-du">${m.dur ? fpDur(m.dur) : ''}</span></span><b>${esc(m.name || (v ? 'Ma vidéo' : 'Mon audio'))}</b><small>${fpDate(m.at)}</small></button>`;
}
function fpPeaks(buf, a, b, n) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, i0 = Math.floor((a || 0) * sr), i1 = Math.min(d.length, Math.floor((b || buf.duration) * sr)), st = Math.max(1, Math.floor((i1 - i0) / n)), out = [];
  for (let k = 0; k < n; k++) { let m = 0; for (let j = i0 + k * st, e = Math.min(i1, j + st); j < e; j += 4) { const x = Math.abs(d[j]); if (x > m) m = x; } out.push(m); }
  const mx = Math.max(.02, ...out); return out.map(x => x / mx);
}
// la pochette d'un audio (choix C2 de Lucas, 27/11) : chaque audio a sa couleur, Médi l'écoute les yeux plissés, son onde en bas
const fpPochC = m => { let h = 0; for (const c of String(m.id || m.mediaId)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 4; };
const fpPochSVG = () => `<svg class="fp-pc" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g transform="translate(70 48) scale(.46)"><g transform="rotate(-14 100 111)"><path class="pb" d="${MEDI_BODY}"/><rect class="pe" x="62" y="62" width="20" height="38" rx="10"/><rect class="pe" x="114" y="62" width="20" height="38" rx="10"/></g></g><path class="pw" d="M8 88"/></svg>`;
// une prise du rythme se dessine sur les six cordes (choix C1 de Lucas, 27/11) : un trait par coup, haut selon sa force ; joués = orange
function fpStrFill(pop, buf, a, b) {
  const w = pop.querySelector('.fp-wave'); if (!w) return;
  const tl = l26FromTake(buf, a, b, cur && cur.bpm); if (!tl) { fpWaveFill(pop, buf, a, b); return; }
  const L = Math.max(.01, b - a), str = [0, 1, 2, 3, 4, 5].map(k => `<line class="sl" x1="0" x2="200" y1="${(4.5 + k * 5).toFixed(1)}" y2="${(4.5 + k * 5).toFixed(1)}" style="stroke-width:${(.5 + .12 * k).toFixed(2)}"/>`).join('');
  const hits = tl.hits.map(h => { const x = h.t / L * 200, hh = 12 + 18 * h.a; return `<rect class="sh" x="${(x - 1.6).toFixed(1)}" y="${(17 - hh / 2).toFixed(1)}" width="3.2" height="${hh.toFixed(1)}" rx="1.6"/>`; }).join('');
  w.classList.add('str'); w.querySelector('.g').innerHTML = str + hits; const o = w.querySelector('.o'); o.innerHTML = str + hits;
  const sync = () => { o.style.width = w.clientWidth + 'px'; }; sync(); requestAnimationFrame(sync);
}
const fpBars = (pk, w, h) => pk.map((x, k) => { const bw = w / pk.length, bh = Math.max(3, x * (h - 2)); return `<rect x="${(k * bw + bw * .2).toFixed(1)}" y="${((h - bh) / 2).toFixed(1)}" width="${(bw * .6).toFixed(1)}" height="${bh.toFixed(1)}" rx="1.3"/>`; }).join('');
async function fpHydrate(host) {
  for (const th of host.querySelectorAll('.fp-th[data-mid]')) {
    const url = await mediaURL(th.dataset.mid); if (!url || !th.isConnected) continue;
    const du = th.querySelector('.fp-du');
    if (th.dataset.k === 'video') {
      const v = th.querySelector('video');
      const m = (cur && cur.media || []).find(x => x.mediaId === th.dataset.mid);
      v.addEventListener('loadedmetadata', () => { if (!du.textContent && isFinite(v.duration)) du.textContent = fpDur(v.duration); }, {once: true});
      v.src = url + '#t=' + (m && m.tt != null ? m.tt : .1);
      if (m && m.tt == null) fpThumbLater(m, url);
    } else {
      try { const buf = await recBuffer(th.dataset.mid), m = (cur && cur.media || []).find(x => x.mediaId === th.dataset.mid), pk = fpPeaks(buf, m && m.a || 0, Math.min(m && m.b || buf.duration, buf.duration), 14);
        const w = th.querySelector('.pw'); if (w) w.setAttribute('d', 'M8 88' + pk.map((x, k) => ` L${(11 + k * 5).toFixed(0)} ${(88 - 3 - x * 14).toFixed(1)} L${(13.5 + k * 5).toFixed(1)} 88`).join(''));
        if (!du.textContent) du.textContent = fpDur(buf.duration); } catch (e) {}
    }
  }
}
// la miniature d'une vidéo : le plus beau moment (net, bien éclairé, contrasté, coloré), cherché une fois puis gardé (m.tt)
const fpThumbQ = [];
function fpThumbLater(m, url) {
  if (fpThumbQ.some(q => q.m === m)) return;
  fpThumbQ.push({m, url}); if (fpThumbQ.length === 1) fpThumbRun();
}
async function fpThumbRun() {
  while (fpThumbQ.length) {
    const {m, url} = fpThumbQ[0];
    try {
      m.tt = await fpBestFrame(url, m.b || m.dur, m.a, m.b);
      const s = sheets.find(x => (x.media || []).includes(m)); if (s) { s.updatedAt = Date.now(); await DB.put('sheets', clone(s)); }
      const v = document.querySelector(`.fp-th[data-mid="${m.mediaId}"] video`); if (v) v.src = url + '#t=' + m.tt;
    } catch (e) { m.tt = .1; }
    fpThumbQ.shift();
  }
}
async function fpBestFrame(url, dur, a, b) {   // entre a et b si la vidéo est rognée
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto';
  const wait = (ev, ms) => new Promise(r => { const t = setTimeout(r, ms); v.addEventListener(ev, () => { clearTimeout(t); r(); }, {once: true}); });
  v.src = url; await wait('loadeddata', 5000);
  let d = isFinite(v.duration) && v.duration > 0 ? v.duration : +dur || 0;
  if (!d) { v.currentTime = 1e6; await wait('seeked', 2000); d = isFinite(v.duration) ? v.duration : 0; }   // une vidéo enregistrée dans le navigateur ne connaît pas toujours sa durée
  if (!d) return .1;
  const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d', {willReadFrequently: true});
  let best = .1, bs = -1;
  for (const f of [.12, .25, .38, .5, .62, .75, .88]) {
    const lo = Math.min(a || 0, d), hi = Math.max(lo, Math.min(b || d, d)), t = +(lo + (hi - lo) * f).toFixed(2); v.currentTime = t; await wait('seeked', 1500);
    let px; try { g.drawImage(v, 0, 0, 48, 48); px = g.getImageData(0, 0, 48, 48).data; } catch (e) { continue; }
    const n = 48 * 48, L = new Float32Array(n); let sm = 0, rg = 0, yb = 0, rg2 = 0, yb2 = 0;
    for (let k = 0; k < n; k++) { const r = px[k * 4] / 255, gg = px[k * 4 + 1] / 255, b = px[k * 4 + 2] / 255; L[k] = .299 * r + .587 * gg + .114 * b; sm += L[k]; const a = r - gg, y = .5 * (r + gg) - b; rg += a; yb += y; rg2 += a * a; yb2 += y * y; }
    const mean = sm / n; let vr = 0, gr = 0;
    for (let k = 0; k < n; k++) { vr += (L[k] - mean) ** 2; if (k % 48 < 47) gr += Math.abs(L[k + 1] - L[k]); if (k < n - 48) gr += Math.abs(L[k + 48] - L[k]); }
    const sd = Math.sqrt(vr / n), sharp = gr / (2 * n), mrg = rg / n, myb = yb / n;
    const col = Math.sqrt(Math.max(0, rg2 / n - mrg * mrg) + Math.max(0, yb2 / n - myb * myb)) + .3 * Math.hypot(mrg, myb);
    let sc = .35 * Math.min(1, sharp / .08) + .25 * Math.min(1, sd / .22) + .25 * (1 - Math.min(1, Math.abs(mean - .5) * 2.2)) + .15 * Math.min(1, col / .3);
    if (mean < .08 || mean > .95) sc *= .3;   // une image noire ou blanche : jamais
    if (sc > bs) { bs = sc; best = t; }
  }
  v.removeAttribute('src'); v.load();
  return best;
}
// un tuto : un YouTube passe en haut de la fiche (lu dans l'appli), un autre lien s'ouvre à côté
async function fpTuto(k) {
  const s = cur, l = s && (s.links || [])[k]; if (!l) return;
  if (!ytId(l.url)) { window.open(l.url, '_blank', 'noopener'); return; }
  if (svTutoLink(s) !== l) { s.links.splice(k, 1); s.links.unshift(l); await fpSave(); svTutoRender(); fpTutos(); }
  const t = $('fp-tplayer'); if (t) t.scrollIntoView({behavior: 'smooth', block: 'center'});   // il se lit en bas, là où on l'a touché
}
async function fpSave() { cur.updatedAt = Date.now(); await DB.put('sheets', clone(cur)); }

/* ── l'infobulle (une prise, l'enregistreur) ── */
function fpPopOpen(anchor, html, cls) {
  anchor = anchor || $('fp-perso') || document.body;
  const old = $('fp-pop');
  if (old && FP.anchor === anchor && !FP.R) { fpPlStop(); old.className = 'fp-pop swap ' + (cls || ''); old.innerHTML = html; fpPlace(); return old; }
  fpPopClose(true);
  const d = document.createElement('div'); d.id = 'fp-dim'; d.onclick = () => fpPopClose(); document.body.appendChild(d);
  const p = document.createElement('div'); p.id = 'fp-pop'; p.className = 'fp-pop ' + (cls || ''); p.setAttribute('role', 'dialog'); p.innerHTML = html;
  document.body.appendChild(p);
  FP.anchor = anchor; FP.adj = false;
  const r = anchor.getBoundingClientRect();
  if (r.bottom > innerHeight * .6 || r.top < 60) anchor.scrollIntoView({block: 'center'});
  fpPlace();
  return p;
}
function fpPlace() {
  const p = $('fp-pop'), a = FP.anchor; if (!p) return;
  if (!a || !a.isConnected) { p.style.top = '50%'; p.style.left = '50%'; p.style.transform = 'translate(-50%,-50%)'; return; }
  const r = a.getBoundingClientRect(), W = Math.min(innerWidth - 24, 400);
  p.style.width = W + 'px';
  const h = p.offsetHeight, cx = r.left + r.width / 2, left = Math.max(12, Math.min(innerWidth - W - 12, cx - W / 2));
  const below = r.bottom + 12 + h <= innerHeight - 8 || r.top - 12 - h < 8;
  p.style.left = left + 'px';
  const y = Math.max(8, below ? r.bottom + 12 : r.top - 12 - h), y2 = Math.max(8, Math.min(y, innerHeight - 8 - h));   // en bas de la fiche : la bulle remonte sur son bouton (sans pointe)
  p.style.top = (FP.adj ? y2 : y) + 'px';
  p.classList.toggle('up', !below);
  p.classList.toggle('free', FP.adj && y2 !== y);
  p.style.setProperty('--tail', Math.max(22, Math.min(W - 22, cx - left)) + 'px');
  // trop haute pour tenir dessous : on fait défiler la fiche juste ce qu'il faut (une fois), la bulle suit
  const over = (below ? r.bottom + 12 + h : 0) - (innerHeight - 8);
  if (below && over > 0 && !FP.adj) { FP.adj = true; const sc = fpScroller(a); if (sc) sc.scrollBy(0, Math.min(over + 8, Math.max(0, r.top - 70))); }
}
function fpScroller(el) {
  for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const o = getComputedStyle(e).overflowY; if ((o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 4) return e; }
  return document.scrollingElement || document.documentElement;
}
addEventListener('scroll', () => { if ($('fp-pop')) fpPlace(); }, true);
addEventListener('resize', () => { if ($('fp-pop')) fpPlace(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && $('fp-pop')) fpPopClose(); });
function fpPopClose(quiet) {
  fpPlStop();
  if (FP.R && !FP.R.cam) fpRecAbort();
  const p = $('fp-pop'), d = $('fp-dim');
  if (p) p.remove(); if (d) d.remove();
  FP.anchor = null; FP.T = null;
}
const fpMore = items => `<div class="fp-mo"><button type="button" class="fp-dots" onclick="this.parentNode.classList.toggle('open')" aria-label="Plus" aria-haspopup="true">${fpI('dots')}</button><div class="fp-mm">${items.map(([l, fn, c]) => `<button type="button"${c ? ` class="${c}"` : ''} onclick="${fn}">${l}</button>`).join('')}</div></div>`;
// le tempo de lecture : Médi glisse sur la barre ; le petit trait = le tempo d'origine
const FP_R0 = .5, FP_R1 = 1.25;
const fpTempoHTML = () => `<div class="fp-tempo"><span class="l">Tempo</span><div class="fp-sl" role="slider" tabindex="0" aria-label="Tempo de lecture" aria-valuemin="50" aria-valuemax="125" onpointerdown="fpTempoDown(event)" onkeydown="fpTempoKey(event)"><i class="tr"></i><i class="tf"></i><i class="o" style="left:${((1 - FP_R0) / (FP_R1 - FP_R0) * 100).toFixed(1)}%"></i><span class="th">${fpMedi('')}</span></div><b class="v"></b></div>`;
function fpTempoPaint() {
  const P = FP.pl, p = $('fp-pop'); if (!P || !p) return;
  const x = (P.rate - FP_R0) / (FP_R1 - FP_R0) * 100, sl = p.querySelector('.fp-sl'); if (!sl) return;
  sl.querySelector('.tf').style.width = x + '%'; sl.querySelector('.th').style.left = x + '%';
  sl.setAttribute('aria-valuenow', Math.round(P.rate * 100));
  const bpm = cur && cur.bpm;
  p.querySelector('.fp-tempo .v').textContent = bpm ? Math.round(bpm * P.rate) : Math.round(P.rate * 100) + ' %';
}
function fpRate(r) {
  const P = FP.pl; if (!P) return;
  r = Math.max(FP_R0, Math.min(FP_R1, Math.round(r * 20) / 20)); if (Math.abs(r - 1) < .04) r = 1;
  P.rate = r; try { P.el.playbackRate = r; P.el.preservesPitch = P.el.mozPreservesPitch = P.el.webkitPreservesPitch = true; } catch (e) {}
  fpTempoPaint();
}
function fpTempoDown(e) {
  const sl = e.currentTarget, set = ev => { const r = sl.getBoundingClientRect(); fpRate(FP_R0 + (FP_R1 - FP_R0) * Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width))); };
  set(e); try { sl.setPointerCapture(e.pointerId); } catch (_) {}
  const mv = ev => set(ev), up = () => { sl.removeEventListener('pointermove', mv); sl.removeEventListener('pointerup', up); sl.removeEventListener('pointercancel', up); };
  sl.addEventListener('pointermove', mv); sl.addEventListener('pointerup', up); sl.addEventListener('pointercancel', up);
}
function fpTempoKey(e) { if (!FP.pl) return; const d = {ArrowRight: .05, ArrowUp: .05, ArrowLeft: -.05, ArrowDown: -.05}[e.key]; if (d) { e.preventDefault(); fpRate(FP.pl.rate + d); } }
// le lecteur de l'infobulle : un <audio> / <video> du fichier, joué entre a et b (une prise du rythme est rognée)
function fpPlInit(el, a, b, wave) {
  fpPlStop();
  FP.pl = {el, a: a || 0, b: b || 0, rate: 1, wave};
  el.addEventListener('loadedmetadata', () => { const P = FP.pl; if (P && P.el === el) { if (!P.b && isFinite(el.duration)) P.b = el.duration; try { el.currentTime = P.a; } catch (e) {} fpPlPaint(); } }, {once: true});
  el.addEventListener('ended', () => fpPlPause());
  fpTempoPaint();
}
function fpToggle() {
  const P = FP.pl; if (!P) return;
  if (!P.el.paused) { fpPlPause(); return; }
  stopPlay();
  if (P.b && P.el.currentTime >= P.b - .05 || P.el.currentTime < P.a - .05) P.el.currentTime = P.a;
  P.el.playbackRate = P.rate;
  const pr = P.el.play(); if (pr && pr.catch) pr.catch(() => {});
  fpPlBtn(true);
  const loop = () => { const Q = FP.pl; if (!Q || Q.el.paused) return; if (Q.b && Q.el.currentTime >= Q.b) { Q.el.currentTime = Q.a; if (!Q.loop) { Q.el.pause(); fpPlBtn(false); fpPlPaint(); return; } } /* une boucle de rythme repart au début */ fpPlPaint(); FP.raf = requestAnimationFrame(loop); };
  cancelAnimationFrame(FP.raf); FP.raf = requestAnimationFrame(loop);
}
function fpPlPause() { const P = FP.pl; if (!P) return; try { P.el.pause(); } catch (e) {} fpPlBtn(false); fpPlPaint(); }
function fpPlBtn(on) { const p = $('fp-pop'); if (p) p.querySelectorAll('.fp-pp').forEach(b => { b.innerHTML = on ? FB_PAUSEO : FP_PLAY; b.setAttribute('aria-label', on ? 'Pause' : 'Écouter'); b.classList.toggle('on', on); }); }
function fpPlPaint() {
  const P = FP.pl, p = $('fp-pop'); if (!P || !p) return;
  const len = Math.max(.01, (P.b || P.el.duration || 1) - P.a), t = Math.max(0, P.el.currentTime - P.a), x = Math.min(100, t / len * 100);
  p.querySelectorAll('.fp-prog').forEach(e => { e.style.width = x + '%'; });
  p.querySelectorAll('.fp-knob').forEach(e => { e.style.left = x + '%'; });
  const c = p.querySelector('.fp-tt .c'); if (c) c.textContent = fpDur(t);
  const ph = p.querySelector('#fp-trim .ph'); if (ph && P.D) ph.style.left = Math.min(100, P.el.currentTime / P.D * 100).toFixed(2) + '%';   // rogner : où on en est
}
function fpPlStop() { cancelAnimationFrame(FP.raf); const P = FP.pl; if (P) { try { P.el.pause(); P.el.removeAttribute('src'); P.el.load(); } catch (e) {} } FP.pl = null; }
function fpSeek(d) { const P = FP.pl; if (!P) return; P.el.currentTime = Math.max(P.a, Math.min((P.b || P.el.duration) - .05, P.el.currentTime + d)); fpPlPaint(); }
function fpScrubDown(e) {
  const P = FP.pl; if (!P) return;
  const bar = e.currentTarget, set = ev => { const r = bar.getBoundingClientRect(), len = (P.b || P.el.duration || 0) - P.a; P.el.currentTime = P.a + len * Math.max(0, Math.min(.999, (ev.clientX - r.left) / r.width)); fpPlPaint(); };
  set(e); try { bar.setPointerCapture(e.pointerId); } catch (_) {}
  const mv = ev => set(ev), up = () => { bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
  bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
}
const fpWaveHTML = () => `<div class="fp-wave" onpointerdown="fpScrubDown(event)"><svg class="g" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true"></svg><div class="fp-prog"><svg class="o" viewBox="0 0 200 34" preserveAspectRatio="none" aria-hidden="true"></svg></div></div>`;
function fpWaveFill(pop, buf, a, b) {
  const bars = fpBars(fpPeaks(buf, a, b, 36), 200, 34), w = pop.querySelector('.fp-wave'); if (!w) return;
  w.querySelector('.g').innerHTML = bars; const o = w.querySelector('.o'); o.innerHTML = bars;
  const sync = () => { o.style.width = w.clientWidth + 'px'; }; sync(); requestAnimationFrame(sync);
}

/* ── B1 : une prise du rythme ── */
async function fpTakePop(i, mid, el, e) {
  if (e) e.stopPropagation();
  const p = cur && cur.parts[i]; if (!p) return;
  const t = fpTakes(p).find(x => x.mediaId === mid); if (!t) return;
  stopPlay();
  const on = t === p.rec, len = (t.end || t.dur || 0) - (t.start || 0);
  const pop = fpPopOpen(el, `<div class="fp-ph"><div><b>${esc(fpTakeName(p, t))}</b><small>${[fpDate(t.at), fpDur(len), cur.bpm ? 'tempo ' + cur.bpm : ''].filter(Boolean).join(' · ')}</small></div>${fpMore([['Rogner', `fpTrimTake(${i},'${mid}')`], ['Renommer', `fpTakeRename(${i},'${mid}')`], ['Supprimer', `fpTakeDel(${i},'${mid}')`, 'del']])}</div>
    <div class="fp-pw"><button type="button" class="fp-pp" onclick="fpToggle()" aria-label="Écouter">${FP_PLAY}</button><div class="fp-sw">${fpWaveHTML()}<div class="fp-tt"><span class="c">0:00</span><span>${fpDur(len)}</span></div></div></div>
    ${fpTempoHTML()}
    <button type="button" class="fp-tgl${on ? ' on' : ''}" aria-pressed="${on}" onclick="fpTakeMain(${i},'${mid}')">${fpPickSw(on)}<span>${on ? 'Elle joue sur la fiche' : 'La mettre sur la fiche'}</span></button>`, 'fp-take');
  const url = await mediaURL(mid); if (!url || $('fp-pop') !== pop) return;
  fpPlInit(new Audio(url), t.start || 0, t.end || 0);
  try { const buf = await recBuffer(mid); if ($('fp-pop') === pop) fpStrFill(pop, buf, t.start || 0, Math.min(t.end || buf.duration, buf.duration)); } catch (e) {}
  fpPlace();
}
async function fpTakeMain(i, mid) {
  const p = cur.parts[i], t = fpTakes(p).find(x => x.mediaId === mid); if (!t) return;
  p.recAlt = (p.recAlt || []).filter(x => x !== t);
  if (t === p.rec) { p.recAlt.unshift(t); delete p.rec; toast('La fiche joue le rythme de l’app'); }
  else { if (p.rec) p.recAlt.unshift(p.rec); p.rec = t; toast('Elle joue sur la fiche'); }
  if (!p.recAlt.length) delete p.recAlt;
  await fpSave(); fpPopClose(); viewSheet(cur.id, svAll ? null : svPart);
}
async function fpTakeRename(i, mid) {
  const p = cur.parts[i], t = fpTakes(p).find(x => x.mediaId === mid); if (!t) return;
  const n = prompt('Le nom de cette prise', fpTakeName(p, t)); if (n == null || !n.trim()) return;
  t.name = n.trim().slice(0, 40); await fpSave(); fpPopClose(); viewSheet(cur.id, svAll ? null : svPart);
}
async function fpTakeDel(i, mid) {
  const p = cur.parts[i], t = fpTakes(p).find(x => x.mediaId === mid); if (!t) return;
  if (!confirm('Supprimer cette prise ?')) return;
  fpPopClose(); stopPlay();
  if (t === p.rec) delete p.rec; else p.recAlt = (p.recAlt || []).filter(x => x !== t);
  if (p.recAlt && !p.recAlt.length) delete p.recAlt;
  await DB.del('media', mid); delete recBuf[mid];
  await fpSave(); toast('Prise supprimée'); viewSheet(cur.id, svAll ? null : svPart);
}

/* ── B2 : une prise de « Mes prises » (vidéo ou audio) ── */
async function fpMediaPop(id, el) {
  const m = (cur.media || []).find(x => x.id === id); if (!m) return;
  stopPlay();
  const v = m.kind === 'video';
  const head = `<div class="fp-ph"><div><b>${esc(m.name || (v ? 'Ma vidéo' : 'Mon audio'))}</b><small class="fp-meta">${[fpDate(m.at), m.dur ? fpDur(m.dur) : ''].filter(Boolean).join(' · ')}</small></div>${v ? `<button type="button" class="fp-dots" onclick="fpFull()" aria-label="Plein écran">${fpI('full')}</button>` : ''}${fpMore([['Rogner', `fpTrimMedia('${id}')`], ['Renommer', `fpMediaRename('${id}')`], ['Supprimer', `fpMediaDel('${id}')`, 'del']])}</div>`;
  const body = v
    ? `<div class="fp-vid"><video playsinline preload="metadata"></video><button type="button" class="fp-pp fp-vpl" onclick="fpToggle()" aria-label="Lire">${FP_PLAY}</button></div><div class="fp-bar" onpointerdown="fpScrubDown(event)"><i class="fp-prog"></i><b class="fp-knob"></b></div><div class="fp-tt"><span class="c">0:00</span><span class="d">${m.dur ? fpDur(m.dur) : ''}</span></div>`
    : `<div class="fp-pw"><button type="button" class="fp-pp" onclick="fpToggle()" aria-label="Écouter">${FP_PLAY}</button><div class="fp-sw">${fpWaveHTML()}<div class="fp-tt"><span class="c">0:00</span><span class="d">${m.dur ? fpDur(m.dur) : ''}</span></div></div></div>`;
  const pop = fpPopOpen(el, head + body + `<div class="fp-row2"><button type="button" class="fp-sm" onclick="fpSeek(-10)" aria-label="Reculer de 10 secondes">${fpI('back')}</button>${fpTempoHTML()}</div>`, 'fp-media');
  const url = await mediaURL(m.mediaId); if (!url || $('fp-pop') !== pop) return;
  const el2 = v ? pop.querySelector('video') : new Audio();
  if (v) fpVidFit(pop.querySelector('.fp-vid'), el2);
  el2.src = url;
  el2.addEventListener('loadedmetadata', () => { const d = pop.querySelector('.fp-tt .d'); if (d && !d.textContent && isFinite(el2.duration)) d.textContent = fpDur(el2.duration); fpPlace(); }, {once: true});
  fpPlInit(el2, m.a || 0, m.b || 0);   // une prise rognée joue entre a et b
  FP.adj = false;
  if (!v) try { const buf = await recBuffer(m.mediaId); if ($('fp-pop') === pop) fpWaveFill(pop, buf, m.a || 0, Math.min(m.b || buf.duration, buf.duration)); } catch (e) {}
  fpPlace();
}
function fpFull() { const v = $('fp-pop') && $('fp-pop').querySelector('video'); if (!v) return; try { (v.requestFullscreen || v.webkitEnterFullscreen || v.webkitRequestFullscreen).call(v); } catch (e) {} }
async function fpMediaRename(id) {
  const m = (cur.media || []).find(x => x.id === id); if (!m) return;
  const n = prompt('Le nom de cette prise', m.name || ''); if (n == null || !n.trim()) return;
  m.name = n.trim().slice(0, 40); await fpSave(); fpPopClose(); fpPerso();
}
async function fpMediaDel(id) {
  const m = (cur.media || []).find(x => x.id === id); if (!m) return;
  if (!confirm('Supprimer cette prise ?')) return;
  fpPopClose();
  cur.media = cur.media.filter(x => x !== m);
  await DB.del('media', m.mediaId); if (mediaURLs[m.mediaId]) { URL.revokeObjectURL(mediaURLs[m.mediaId]); delete mediaURLs[m.mediaId]; }
  await fpSave(); toast('Prise supprimée'); fpPerso();
}

/* ── l'enregistreur ── */
// C : prêt. Trois médiators couchés, Médi explique
function fpRec(kind, el, i) {
  if (!cur) return;
  stopPlay();
  if (!kind) {
    fpPopOpen(el, `<div class="fp-rr top">${fpMedi('fp-idle')}<p class="fp-said">Le rythme va sur ta fiche. Un audio ou une vidéo, c’est pour tes prises et ton profil.</p></div>
      <div class="fp-three"><button type="button" onclick="fpRecGo('rh')">${FP_RECM}<b>${fpI('rh')}Rythme</b><small>sur la fiche</small></button><i class="sep" aria-hidden="true"></i>
      <button type="button" onclick="fpRecGo('audio')">${FP_RECM}<b>${fpI('mic')}Audio</b><small>mes prises</small></button>
      <button type="button" onclick="fpRecGo('video')">${FP_RECM}<b>${fpI('cam')}Vidéo</b><small>mes prises</small></button></div>`, 'fp-rp fp-pick');
    return;
  }
  if (kind === 'video') { fpCamOpen(); return; }
  // un rythme depuis la fiche : on attend qu'on touche le médiator
  const pi = i != null ? i : svPart;
  fpPopOpen(el, `<div class="fp-rr top">${fpMedi('fp-idle')}<p class="fp-said">Touche le médiator : je compte 4 temps, puis je t’écoute.</p></div>
    <div class="fp-three one"><button type="button" onclick="fpRecGo('rh',${pi})">${FP_RECM}<b>${fpI('rh')}Rythme</b><small>il jouera sur la fiche</small></button></div>`, 'fp-rp fp-pick');
}
function fpRecGo(kind, i) {
  if (kind === 'video') { fpCamOpen(); return; }
  fpRecAudio(kind, FP.anchor, kind === 'rh' ? (i != null ? i : svPart) : null);
}
const fpCountHTML = cls => `<div class="fp-cnt ${cls || ''}">${fpMedi('fp-cm', `<g class="eo">${FP_EYES}</g><g class="ec">${FP_SHUT}</g>`)}<span class="fp-shd"></span></div>`;
// Médi compte : 4 sauts au tempo de la fiche, un chiffre s'envole à chaque saut, au 4 il fait un tour ; puis il ferme les yeux
async function fpCount(stage, R) {
  const beat = Math.max(.32, Math.min(1, 60 / ((cur && cur.bpm) || 90))), m = stage.querySelector('.fp-cm');
  stage.style.setProperty('--hop', Math.min(.52, beat * .86).toFixed(2) + 's');
  try { const ac = audio(); if (ac.state === 'suspended') await ac.resume(); } catch (e) {}
  for (let k = 1; k <= 4; k++) {
    if (FP.R !== R || !stage.isConnected) return false;
    m.classList.remove('hop', 'spin'); void m.getBoundingClientRect(); m.classList.add(k === 4 ? 'spin' : 'hop');
    stage.insertAdjacentHTML('beforeend', `<span class="fp-n ${k % 2 ? 'l' : 'r'}${k === 4 ? ' big' : ''}" aria-hidden="true">${k}</span><span class="fp-rg"></span>`);
    try { const ac = audio(); click(ac.currentTime + .01, k === 1); } catch (e) {}
    await new Promise(r => setTimeout(r, beat * 1000));
  }
  if (FP.R !== R) return false;
  setTimeout(() => stage.querySelectorAll('.fp-n,.fp-rg').forEach(e => e.remove()), 700);
  m.classList.remove('hop', 'spin'); m.classList.add('listen');
  return true;
}
// les cordes vibrent avec ton son
function fpMeter(R, svg) {
  try {
    const ac = audio(); R.src = ac.createMediaStreamSource(R.stream); const an = ac.createAnalyser(); an.fftSize = 1024; R.src.connect(an);
    const d = new Float32Array(an.fftSize), paths = [...svg.querySelectorAll('.vb')]; let lv = 0;
    const loop = t => {
      if (FP.R !== R || R.stage !== 'rec') return;
      an.getFloatTimeDomainData(d); let s = 0; for (let j = 0; j < d.length; j += 2) s += d[j] * d[j];
      lv = Math.min(1, Math.max(Math.sqrt(s / (d.length / 2)) * 7, lv * .9));
      paths.forEach((p, k) => { const y = +p.dataset.y, a = lv * 6 * Math.sin(t / 28 + k * 1.3); p.setAttribute('d', `M0 ${y}Q75 ${(y - a).toFixed(1)} 150 ${y}T300 ${y}`); });
      R.raf = requestAnimationFrame(loop);
    };
    R.raf = requestAnimationFrame(loop);
  } catch (e) {}
}
function fpTimer(R, el) { const t0 = Date.now(); R.t0 = t0; R.iv = setInterval(() => { if (el.isConnected) el.textContent = fpDur((Date.now() - t0) / 1000); }, 250); }
function fpStreamStop(R) {
  if (!R) return; clearInterval(R.iv); cancelAnimationFrame(R.raf);
  try { if (R.src) R.src.disconnect(); } catch (e) {}
  if (R.stream) R.stream.getTracks().forEach(t => t.stop());
  R.stream = null;
}
function fpRecAbort() { const R = FP.R; if (!R) return; FP.R = null; R.dead = true; try { if (R.mr && R.mr.state === 'recording') R.mr.stop(); } catch (e) {} fpStreamStop(R); if (R.url) URL.revokeObjectURL(R.url); }
// D : audio (rythme ou audio pour mes prises), dans l'infobulle
async function fpRecAudio(kind, el, part) {
  if (!window.MediaRecorder || !navigator.mediaDevices) { toast('Enregistrement non disponible ici', true); return; }
  const pn = kind === 'rh' && cur.parts.length > 1 ? ' · ' + esc(cur.parts[part].name || 'Partie ' + (part + 1)) : '';
  const pop = fpPopOpen(el, `<div class="fp-rr"><span class="fp-rk">${fpI(kind === 'rh' ? 'rh' : 'mic')}${kind === 'rh' ? 'Rythme' : 'Audio'}${pn}</span><span class="fp-time"><i></i><b>0:00</b></span></div>
    ${fpCountHTML()}<div class="fp-live">${fpStrings()}</div><div class="fp-rr c"><button type="button" class="fp-stop" onclick="fpRecStop()" aria-label="Arrêter">${FP_RECM}</button></div>`, 'fp-rp fp-recing');
  requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add('up')));
  const R = FP.R = {kind, part, stage: 'count'};
  try { R.stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}}); }
  catch (e) { if (FP.R === R) { FP.R = null; fpPopClose(); } toast('Micro refusé ou indisponible', true); return; }
  if (FP.R !== R) { fpStreamStop(R); return; }
  if (!await fpCount(pop.querySelector('.fp-cnt'), R)) { fpStreamStop(R); return; }
  fpRecBegin(R, pop);
  fpMeter(R, pop.querySelector('.fp-str'));
}
function fpRecBegin(R, host) {
  R.chunks = []; R.stage = 'rec';
  const mr = R.mr = new MediaRecorder(R.stream);
  mr.ondataavailable = e => { if (e.data.size) R.chunks.push(e.data); };
  mr.onstop = () => fpRecDone(R);
  mr.start();
  host.classList.add('on');
  fpTimer(R, host.querySelector('.fp-time b'));
}
function fpRecStop() {
  const R = FP.R; if (!R) return;
  if (R.stage === 'count') { fpRecAbort(); if (R.cam) fpCamClose(); else fpPopClose(); return; }
  if (R.mr && R.mr.state === 'recording') { R.dur = (Date.now() - R.t0) / 1000; R.mr.stop(); }
}
async function fpRecDone(R) {
  if (R.dead || FP.R !== R) return;
  fpStreamStop(R); R.stage = 'after';
  if (!R.chunks.length) { toast('Rien n’a été enregistré', true); if (R.cam) fpCamClose(); else fpPopClose(); return; }
  R.blob = new Blob(R.chunks, {type: R.mr.mimeType || (R.kind === 'video' ? 'video/webm' : 'audio/webm')});
  if (R.cam) fpCamClose(true);
  if (R.kind !== 'video') { try { R.buf = await recDecode(R.blob); R.dur = R.buf.duration; } catch (e) { if (R.kind === 'rh') { toast('Ta prise n’a pas pu être lue', true); FP.R = null; fpPopClose(); return; } } }
  fpAfter(R);
}
// E : c'est dans la boîte. Médi a déjà proposé la coupe (rogner par défaut, Lucas, 27/11 : 39-9955-perso-rogner.js)
async function fpAfter(R) {
  const rh = R.kind === 'rh', v = R.kind === 'video', p = rh ? cur.parts[R.part] : null;
  if (v && !R.buf && !R.tried) { R.tried = true; try { R.buf = await recDecode(R.blob); } catch (e) {} if (FP.R !== R) return; }   // le son de la vidéo : pour couper les blancs
  R.D = R.buf ? R.buf.duration : (R.dur || 0);
  Object.assign(R, fpAutoTrim(R.buf, R.kind, R.D));
  const nv = (cur.media || []).filter(m => m.kind === R.kind).length;
  R.prop = R.name = rh ? (p.rec ? 'Prise ' + (fpTakes(p).length + 1) : 'Ma prise') : nv ? (v ? 'Ma vidéo ' : 'Mon audio ') + (nv + 1) : 'Ma version';
  R.main = rh;
  const anchor = FP.anchor && FP.anchor.isConnected ? FP.anchor : (rh ? document.querySelector(`#pvb-${R.part} .fp-add, #pvb-${R.part} .fp-rh0 .fp-recm`) : $('fp-recb'));
  FP.R = null;   // l'infobulle se rouvre : la prise n'est plus en cours, mais on la garde sous la main
  const pop = fpPopOpen(anchor || document.body, `<div class="fp-rr top">${fpMedi('fp-joy', FP_JOY)}<p class="fp-said">${R.D ? fpTrimSay(R) : 'Joli ! On la garde ?'}</p></div>
    ${v ? fpTrimVid() : ''}${R.D ? fpTrimHTML(R) : ''}${fpTrimCtl(R)}
    <div class="fp-names1"><button type="button" class="fp-nm on" onclick="fpName(this)">${esc(R.prop)}</button><button type="button" class="fp-own" onclick="fpOwn(this)">+ Choisir un titre</button></div>
    ${rh ? `<button type="button" class="fp-tgl on" aria-pressed="true" onclick="fpAfterMain(this)">${fpPickSw(true)}<span>Elle joue sur la fiche</span></button>` : ''}
    <div class="fp-btns"><button type="button" class="ghost" onclick="fpAgain()">Recommencer</button><button type="button" class="keep" onclick="fpKeep()">Garder</button></div>`, 'fp-rp fp-after');
  FP.R = R;
  R.url = URL.createObjectURL(R.blob);
  fpTrimMount(R, pop, v ? pop.querySelector('video') : new Audio(), R.url, R.buf);
  fpPlace();
}
function fpName(b) {
  const R = FP.R; if (!R) return;
  b.classList.add('on'); R.name = R.prop;
  const i = b.parentNode.querySelector('.fp-nin'); if (i) i.value = '';
}
// son propre titre : le bouton devient un champ, sur la même ligne
function fpOwn(b) {
  const R = FP.R; if (!R) return;
  const inp = document.createElement('input'); inp.className = 'fp-nin'; inp.maxLength = 40; inp.placeholder = 'Ton titre'; inp.setAttribute('aria-label', 'Le titre de cette prise'); inp.enterKeyHint = 'done';
  b.replaceWith(inp); inp.focus();
  const nm = inp.parentNode.querySelector('.fp-nm');
  inp.addEventListener('input', () => { const v = inp.value.trim(); R.name = v || R.prop; nm.classList.toggle('on', !v); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
}
// une vidéo garde son format (debout ou couchée) : plus de bandes noires
function fpVidFit(box, v) {
  if (!box || !v) return;
  v.addEventListener('loadedmetadata', () => {
    const w = v.videoWidth, h = v.videoHeight; if (!w || !h) return;
    box.style.aspectRatio = w + ' / ' + h;
    if (h > w) { box.style.width = Math.round(Math.min(innerHeight * .46, 420) * w / h) + 'px'; box.style.margin = '0 auto'; }
    fpPlace();
  }, {once: true});
}
function fpAfterMain(b) { const R = FP.R; if (!R) return; R.main = !R.main; b.classList.toggle('on', R.main); b.setAttribute('aria-pressed', R.main); b.querySelector('.fp-ms').outerHTML = fpPickSw(R.main); b.querySelector('span').textContent = R.main ? 'Elle joue sur la fiche' : 'Juste la garder'; }
function fpAgain() {
  const R = FP.R; if (!R) return;
  const kind = R.kind, part = R.part, a = FP.anchor;
  fpPopClose();
  if (kind === 'video') fpCamOpen(); else fpRecAudio(kind, a && a.isConnected ? a : (kind === 'rh' ? document.querySelector(`#pvb-${part} .fp-add, #pvb-${part} .fp-rh0 .fp-recm`) : $('fp-recb')), part);
}
async function fpKeep() {
  const R = FP.R; if (!R || !R.blob || !cur) return;
  const mediaId = uid();
  await DB.put('media', {id: mediaId, blob: R.blob, type: R.blob.type});
  if (R.kind === 'rh') {
    const p = cur.parts[R.part]; if (!p) return;
    recBuf[mediaId] = R.buf;
    const d = +R.buf.duration.toFixed(3), t = {mediaId, start: +(R.a || 0).toFixed(3), end: +Math.min(R.b || d, d).toFixed(3), dur: d, at: Date.now(), name: R.name};
    if (R.main) { if (p.rec) (p.recAlt = p.recAlt || []).unshift(p.rec); p.rec = t; }
    else (p.recAlt = p.recAlt || []).push(t);
  } else {
    cur.media = cur.media || [];
    const m = {id: uid(), mediaId, name: R.name, kind: R.kind, at: Date.now(), dur: +((R.D ? R.b - R.a : R.dur) || 0).toFixed(1)};
    if (R.D) { m.a = +R.a.toFixed(2); m.b = +R.b.toFixed(2); }   // rognée : le fichier reste entier, elle joue entre a et b
    if (R.tt != null && R.tt >= R.a && R.tt <= R.b) m.tt = R.tt;
    cur.media.push(m);
  }
  FP.R = null; fpPopClose(); FP.all = false;
  await fpSave(); toast('Ta prise est gardée');
  viewSheet(cur.id, svAll ? null : svPart);
}
// F : la vidéo, caméra en plein écran. On se place, on touche le rond, Médi compte au milieu puis file dans le coin
async function fpCamOpen() {
  fpPopClose();
  if (!window.MediaRecorder || !navigator.mediaDevices) { fpCamFile(); return; }
  const ov = document.createElement('div'); ov.id = 'fp-cam'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Filmer une prise');
  ov.innerHTML = `<video autoplay muted playsinline></video><div class="fp-ctop"><button type="button" class="fp-x" onclick="fpCamClose()" aria-label="Fermer">×</button><span class="fp-time"><i></i><b>0:00</b></span></div>
    ${fpCountHTML('big')}<span class="fp-corner">${fpMedi('fp-cm listen', `<g class="eo">${FP_EYES}</g><g class="ec">${FP_SHUT}</g>`)}</span>
    <div class="fp-cbot"><button type="button" class="fp-sm" onclick="fpCamFlip()" aria-label="Retourner la caméra">${fpI('flip')}</button><button type="button" class="fp-stop" onclick="fpCamGo()" aria-label="Enregistrer">${FP_RECM}</button><span class="fp-sm hid"></span></div>`;
  document.body.appendChild(ov);
  const R = FP.R = {kind: 'video', cam: true, stage: 'ready'};
  if (!await fpCamStream(R)) { fpCamClose(); fpCamFile(); }
}
async function fpCamStream(R) {
  try { R.stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: FP.face}, audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: false}})   /* le son brut de la guitare : les réglages « voix » du téléphone l'abîment */; }
  catch (e) { toast('Caméra refusée ou indisponible', true); return false; }
  if (FP.R !== R) { fpStreamStop(R); return false; }
  const v = document.querySelector('#fp-cam video'); if (v) { v.srcObject = R.stream; v.classList.toggle('mir', FP.face === 'user'); }
  return true;
}
async function fpCamFlip() { const R = FP.R; if (!R || R.stage !== 'ready') return; fpStreamStop(R); FP.face = FP.face === 'user' ? 'environment' : 'user'; await fpCamStream(R); }
async function fpCamGo() {
  const R = FP.R, ov = $('fp-cam'); if (!R || !ov) return;
  if (R.stage === 'rec') { fpRecStop(); return; }
  if (R.stage !== 'ready' || !R.stream) return;
  R.stage = 'count'; ov.classList.add('counting');
  ov.querySelector('.fp-stop').setAttribute('aria-label', 'Arrêter');
  if (!await fpCount(ov.querySelector('.fp-cnt'), R)) return;
  ov.classList.remove('counting'); ov.classList.add('rec');
  fpRecBegin(R, ov);
}
function fpCamClose(keep) {
  const ov = $('fp-cam');
  if (!keep) fpRecAbort(); else if (FP.R) fpStreamStop(FP.R);
  if (ov) ov.remove();
}
// sans caméra dans le navigateur : l'appareil photo du téléphone
function fpCamFile() {
  let inp = $('fp-vfile');
  if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'video/*'; inp.capture = 'user'; inp.id = 'fp-vfile'; inp.hidden = true; document.body.appendChild(inp); }
  inp.onchange = () => { const f = inp.files[0]; inp.value = ''; if (!f) return; const R = FP.R = {kind: 'video', stage: 'after', blob: f}; const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => { R.dur = isFinite(v.duration) ? v.duration : 0; URL.revokeObjectURL(v.src); fpAfter(R); }; v.onerror = () => fpAfter(R); v.src = URL.createObjectURL(f); };
  inp.click();
}

/* ── au lancement : le bas de la fiche remplace le bloc « Perso » (et le mode gaucher) ── */
(function fpInit() {
  if (!fsBeta()) return;
  const more = $('sv-more'); if (!more) return;
  more.insertAdjacentHTML('afterend', '<div id="fp-perso" class="fp-perso"></div><section class="fp-sec fp-tutos" id="fp-tutos"><div class="fp-sh"><div><b>Tutos</b><small>pour la réapprendre</small></div></div><div id="fp-tplayer"></div><div id="fp-tlist" class="fp-tlist"></div></section>');
  const tu = $('sv-tuto'); if (tu) $('fp-tplayer').appendChild(tu);   // le tuto se lit en bas de la fiche, plus en haut
  const sv = viewSheet;
  viewSheet = async function (id, k) { if (!cur || cur.id !== id) { FP.f = 'all'; FP.all = false; } const r = await sv(id, k); fpPerso(); return r; };
})();

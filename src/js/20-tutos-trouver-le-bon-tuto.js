/* ═══════ TUTOS — trouver le bon tuto d’un morceau ═══════
   Senior note: platforms without a public search API (TikTok, Instagram)
   get precise deep-link searches and hashtag pages; YouTube can optionally
   return real results inside the app with the user’s own free Data API key.
   Song input: typing, the user’s own sheets, voice dictation (Web Speech
   API) or, experimentally, audio recognition through AudD with the user’s
   token. Keys stay in this browser’s localStorage. */
let tuto = {title:'', artist:'', lvl:'easy', kind:'chords', lang:'fr', yt:null, ytErr:'', ytLoading:false, play:null, listening:'', show:false};
const T_KIND = {
  chords:{n:'Accords & rythme', fr:'accords rythme', en:'chords strumming'},
  arp:   {n:'Arpège / fingerstyle', fr:'arpège fingerstyle', en:'fingerstyle'},
  riff:  {n:'Riff / intro', fr:'riff intro', en:'riff intro'},
  solo:  {n:'Solo', fr:'solo', en:'solo lesson'},
  full:  {n:'Cours complet', fr:'cours complet', en:'full lesson'},
};
const T_LVL = {easy:{n:'Facile / débutant', fr:'facile débutant', en:'easy beginner'}, any:{n:'Tous niveaux', fr:'', en:''}};
const T_LANG = {fr:'Français', en:'Anglais', both:'Les deux'};
const enc = s => encodeURIComponent(s.replace(/\s+/g, ' ').trim());
const tSong = () => `${tuto.title} ${tuto.artist}`.trim();
const tLangs = () => tuto.lang === 'both' ? ['fr', 'en'] : [tuto.lang];
const tQuery = lang => [tSong(), lang === 'fr' ? 'tuto guitare' : 'guitar tutorial', T_KIND[tuto.kind][lang], T_LVL[tuto.lvl][lang]].filter(Boolean).join(' ');
const hashtag = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const G = q => 'https://www.google.com/search?q=' + enc(q);
const YT = q => 'https://www.youtube.com/results?search_query=' + enc(q);
const TT = q => 'https://www.tiktok.com/search?q=' + enc(q);
const IGT = t => 'https://www.instagram.com/explore/tags/' + t + '/';
function tutoPlatforms() {
  const song = tSong(), title = tuto.title, langs = tLangs(), flag = l => tuto.lang === 'both' ? (l === 'fr' ? ' · FR' : ' · EN') : '';
  return [
    {k:'tiktok', n:'TikTok', d:'Tutos courts filmés au plus près des doigts', bg:'linear-gradient(135deg,#25f4ee,#fe2c55)',
     ico:'<path d="M14 3v11a4 4 0 11-4-4" /><path d="M14 3c.5 2.6 2.4 4.4 5 4.6"/>',
     links:[...langs.map(l => ['Tutos' + flag(l), TT(tQuery(l))]), ['#guitartok', TT(song + ' guitartok')], ['Version facile', TT(song + (tuto.lang === 'en' ? ' easy guitar' : ' guitare facile'))]]},
    {k:'insta', n:'Instagram', d:'Reels de profs et de guitaristes', bg:'linear-gradient(135deg,#f9a03f,#e1306c 55%,#833ab4)',
     ico:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>',
     links:[[`#${hashtag(title)}guitar`, IGT(hashtag(title) + 'guitar')], [`#${hashtag(song)}`, IGT(hashtag(song))], ['#guitartutorial', IGT('guitartutorial')], ['Reels via Google', G(`site:instagram.com/reel "${title}" guitar`)]]},
    {k:'shorts', n:'YouTube Shorts', d:'Le format court de YouTube', bg:'linear-gradient(135deg,#ff4e45,#c4302b)',
     ico:'<path d="M10 9l5 3-5 3z" fill="currentColor"/><rect x="6" y="2" width="12" height="20" rx="4"/>',
     links:[...langs.map(l => ['Shorts tuto' + flag(l), YT(tQuery(l) + ' #shorts')]), ['Riff en 1 minute', YT(song + ' guitar riff #shorts')]]},
    {k:'yt', n:'YouTube', d:'Leçons complètes, versions ralenties, play-along', bg:'linear-gradient(135deg,#e04040,#9b1f1a)',
     ico:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>',
     links:[...langs.map(l => ['Tutos' + flag(l), YT(tQuery(l))]), ['Version lente', YT(song + ' guitar lesson slow')], ['Play-along / tab', YT(song + ' guitar tab play along')], ['Cover acoustique', YT(song + ' acoustic cover')]]},
  ];
}
function tutoSites() {
  const s = tSong(), t = tuto.title;
  return [
    ['Ultimate Guitar', 'Tabs et accords notés', `https://www.ultimate-guitar.com/search.php?search_type=title&value=${enc(s)}`],
    ['Songsterr', 'Tab interactive avec le son', `https://www.songsterr.com/?pattern=${enc(t)}`],
    ['Chordify', 'Accords détectés automatiquement', `https://chordify.net/search/${enc(s)}`],
    ['Boîte à chansons', 'Accords en français', G(`site:boiteachansons.net ${s}`)],
    ['Tabs4acoustic', 'Acoustique, en français', G(`site:tabs4acoustic.com ${s}`)],
    ['JustinGuitar', 'Leçon de chanson, si elle existe', G(`site:justinguitar.com/songs ${s}`)],
    ['Hooktheory', 'Analyse des degrés de la grille', G(`site:hooktheory.com/theorytab ${s}`)],
    ['Cifra Club', 'Accords + vidéo de cours', G(`site:cifraclub.com ${s}`)],
  ];
}
function tutoGoogle() {
  const s = tSong();
  return [
    ['Accords guitare', G(`${s} accords guitare`)],
    ['Vidéos tuto', `https://www.google.com/search?tbm=vid&q=${enc(s + ' tuto guitare')}`],
    ['Guitar chords', G(`${s} guitar chords`)],
    ['Avis Reddit', G(`site:reddit.com ${s} guitar how to play`)],
  ];
}
function tutoSet(title, artist) {
  tuto.title = (title || '').trim(); tuto.artist = (artist || '').trim(); tuto.yt = null; tuto.ytErr = ''; tuto.play = null;
  tuto.show = !!tuto.title;
  if (tuto.title) {
    const rec = LS.get('gms_tuto_recent', []).filter(r => !(r.t.toLowerCase() === tuto.title.toLowerCase() && r.a.toLowerCase() === tuto.artist.toLowerCase()));
    rec.unshift({t:tuto.title, a:tuto.artist}); LS.set('gms_tuto_recent', rec.slice(0, 8));
  }
  renderTuto();
  atFromTuto();
  if (tuto.title && LS.get('gms_ytkey', '')) tutoLoadYT();
}
/* champ unique : « Titre – Artiste » (tiret, « by » ou « par »), sinon le titre seul */
function tutoParse(q) {
  q = (q || '').trim().replace(/\s+/g, ' ');
  const known = sheets.find(s => normTitle(s.title) === normTitle(q));
  if (known) return [known.title, known.artist === '—' ? '' : known.artist];
  const m = q.match(/^(.+?)\s+(?:[-–—\/]|by|par)\s+(.+)$/i);
  return m ? [m[1], m[2]] : [q, ''];
}
function tutoSearch() {
  const [t, a] = tutoParse($('tt-q').value);
  if (!t.trim()) { toast('Entre au moins un titre', true); return; }
  tutoSet(t, a);
  const r = $('tt-results'); if (r) setTimeout(() => r.scrollIntoView({behavior:'smooth', block:'start'}), 60);
}
function tutoOpenFor(title, artist) { tuto.title = title || ''; tuto.artist = artist || ''; go('tuto'); tutoSet(title, artist); }
function tutoOpt(k, v) { tuto[k] = v; renderTuto(); }

/* dictation */
function tutoDictate() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Dictée indisponible ici : essaie Chrome ou Edge', true); return; }
  let r;
  try { r = new SR(); } catch (e) { toast('Dictée indisponible', true); return; }
  r.lang = 'fr-FR'; r.interimResults = false; r.maxAlternatives = 1;
  tuto.listening = 'dict'; renderTuto();
  r.onresult = e => {
    const txt = e.results[0][0].transcript.trim();
    const m = txt.match(/^(.*?)\s+(?:de|du|des|by|par)\s+(.+)$/i);
    tuto.listening = '';
    m ? tutoSet(m[1], m[2]) : tutoSet(txt, '');
    toast(`Compris : « ${txt} »`);
  };
  r.onerror = e => { tuto.listening = ''; renderTuto(); toast(e.error === 'not-allowed' ? 'Micro refusé' : 'Je n’ai rien compris, réessaie', true); };
  r.onend = () => { if (tuto.listening) { tuto.listening = ''; renderTuto(); } };
  r.start();
}
/* audio recognition (experimental, AudD + user token) */
async function tutoRecognize() {
  const token = LS.get('gms_audd', '');
  if (!token) { tuto.showKeys = true; renderTuto(); toast('Ajoute d’abord ta clé AudD (gratuite) ci-dessous', true); return; }
  if (!window.MediaRecorder) { toast('Enregistrement audio non supporté ici', true); return; }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({audio:true}); } catch (e) { toast('Micro refusé ou indisponible', true); return; }
  const chunks = [], mr = new MediaRecorder(stream);
  mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  tuto.listening = 'audio'; renderTuto();
  mr.onstop = async () => {
    stream.getTracks().forEach(t => t.stop());
    tuto.listening = 'wait'; renderTuto();
    try {
      const fd = new FormData();
      fd.append('api_token', token);
      fd.append('file', new Blob(chunks, {type: mr.mimeType || 'audio/webm'}), 'extrait.webm');
      const res = await fetch('https://api.audd.io/', {method:'POST', body:fd});
      const j = await res.json();
      tuto.listening = '';
      if (j.status === 'success' && j.result) { tutoSet(j.result.title, j.result.artist); toast(`Reconnu : ${j.result.title} — ${j.result.artist}`); }
      else { renderTuto(); toast(j.error ? 'AudD : ' + (j.error.error_message || 'erreur') : 'Morceau non reconnu, réessaie plus près du son', true); }
    } catch (e) { tuto.listening = ''; renderTuto(); toast('Service de reconnaissance injoignable depuis cette page', true); }
  };
  mr.start(); setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, 9000);
}
/* YouTube in-app results (optional key) */
async function tutoLoadYT() {
  const key = LS.get('gms_ytkey', '');
  if (!key) { tuto.showKeys = true; renderTuto(); return; }
  tuto.ytLoading = true; tuto.ytErr = ''; renderTuto();
  try {
    const q = tQuery(tLangs()[0]);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=9&videoEmbeddable=true&relevanceLanguage=${tLangs()[0]}&q=${enc(q)}&key=${enc(key)}`;
    const j = await (await fetch(url)).json();
    if (j.error) throw new Error(j.error.message || 'erreur');
    const unent = x => { const t = document.createElement('textarea'); t.innerHTML = x; return t.value; };
    tuto.yt = (j.items || []).map(it => ({id: it.id.videoId, t: unent(it.snippet.title), ch: unent(it.snippet.channelTitle), th: (it.snippet.thumbnails.medium || it.snippet.thumbnails.default).url}));
  } catch (e) { tuto.ytErr = 'Impossible de charger YouTube : ' + (e.message || 'réseau') + '. Vérifie ta clé, ou utilise les liens de recherche.'; tuto.yt = null; }
  tuto.ytLoading = false; renderTuto();
}
function tutoSaveKeys() {
  LS.set('gms_ytkey', ($('tt-ytkey').value || '').trim());
  LS.set('gms_audd', ($('tt-audd').value || '').trim());
  tuto.showKeys = false; toast('Clés enregistrées dans ce navigateur'); renderTuto();
  if (tuto.title && LS.get('gms_ytkey', '')) tutoLoadYT();
}
/* keep a good tutorial in the sheet */
async function tutoKeep(url, label, kind) {
  url = (url || '').trim();
  if (!/^https?:\/\//.test(url)) { toast('Colle un lien complet (https://…)', true); return; }
  let s = tutoSheet(); // titres uniques : on épingle dans la fiche existante
  const created = !s;
  if (!s) { s = newSheet_(); s.title = tuto.title; s.artist = tuto.artist || '—'; s.parts = [newPart('')]; sheets.push(s); }
  else if (s.artist === '—' && tuto.artist) s.artist = tuto.artist;
  s.links = s.links || [];
  const lab = label || (ytId(url) ? 'Tuto vidéo' : url.replace(/^https?:\/\//, '').slice(0, 48));
  const ex = s.links.find(l => l.url === url);
  if (!ex) s.links.push({id:uid(), url, title: lab, kind: kind || 'tuto'});
  else if (kind === 'original') ex.kind = 'original';
  if (kind === 'original' && !(s.original && s.original.url)) s.original = {url, label: lab};
  s.blocks = s.blocks || {}; s.blocks.coffre = true; s.updatedAt = Date.now();
  await DB.put('sheets', clone(s));
  toast(created ? `Fiche « ${s.title} » créée avec ce tuto dans les Médias` : `Tuto ajouté aux Médias de « ${s.title} »`);
  renderTuto();
}
/* « Créer la fiche avec ce tuto » : 1 toucher = fiche (titre + lien pré-remplis) ouverte dans l'éditeur */
async function tutoCreateWith(url, label) {
  if (!tuto.title) { toast('Tape d’abord le titre du morceau', true); return; }
  if (at && at.s) atSyncTuto();
  await tutoKeep(url, label);
  tutoComplete();
}
function tutoSheet() { return sheets.find(x => tuto.title && normTitle(x.title) === normTitle(tuto.title)); }
const tutoPinned = url => { const s = tutoSheet(); return !!(s && (s.links || []).some(l => l.url === url)); };
/* épingler un lien de la liste (url encodée en index pour éviter les guillemets) */
let tutoPinList = [];
function tutoPin(i) { const [u, l] = tutoPinList[i]; tutoKeep(u, l); }
/* « Compléter la fiche » : éditeur pré-rempli (fiche existante, ou nouvelle avec titre/artiste) */
function tutoComplete() {
  const s = tutoSheet();
  draft = s ? clone(s) : newSheet_();
  if (!s) { draft.title = tuto.title; draft.artist = tuto.artist; }
  if (!draft.original) { const o = (draft.links || []).find(l => l.kind === 'original' && ytId(l.url)); if (o) draft.original = {url:o.url}; }
  if (!draft.parts || !draft.parts.length) draft.parts = [newPart('')];
  openEditor(s ? 'Compléter la fiche' : 'Nouvelle fiche');
}

function renderTuto() {
  atRefresh();
  const host = $('tuto-body'); if (!host) return;
  const recent = LS.get('gms_tuto_recent', []), mine = sheets.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 10);
  const keys = {yt: LS.get('gms_ytkey', ''), audd: LS.get('gms_audd', '')};
  const listen = tuto.listening;
  const chip = (t, a) => (a === '—' && (a = ''), `<button type="button" class="filt" onclick="tutoSet(${esc(JSON.stringify(t))},${esc(JSON.stringify(a || ''))})">${esc(t)}${a ? ` <span style="opacity:.6">· ${esc(a)}</span>` : ''}</button>`);
  let h = `<div class="fcard tt-search">
    <div class="fg" style="margin-bottom:6px"><label for="tt-q">Quel morceau ?</label><input type="text" id="tt-q" value="${esc(tuto.title + (tuto.artist ? ' – ' + tuto.artist : ''))}" placeholder="Ex : Wonderwall – Oasis" autocomplete="off" onkeydown="if(event.key==='Enter')tutoSearch()"></div>
    <div class="tt-actions">
      <button type="button" class="btn btn-primary" onclick="tutoSearch()">${icon('search', 15)} Trouver les tutos</button>
      <button type="button" class="btn btn-ghost ${listen === 'dict' ? 'tt-live' : ''}" onclick="tutoDictate()">${icon('mic', 15)} ${listen === 'dict' ? 'Je t’écoute…' : 'Dicter le titre'}</button>
      <button type="button" class="btn btn-ghost ${listen === 'audio' || listen === 'wait' ? 'tt-live' : ''}" onclick="tutoRecognize()">${icon('wave', 15)} ${listen === 'audio' ? 'Écoute du morceau (9 s)…' : listen === 'wait' ? 'Recherche…' : 'Reconnaître un morceau qui passe'}</button>
    </div>
    ${mine.length ? `<div class="tt-sub">Depuis ton cahier</div><div class="filters">${mine.map(s => chip(s.title, s.artist)).join('')}</div>` : ''}
    ${recent.length ? `<div class="tt-sub">Recherches récentes</div><div class="filters">${recent.map(r => chip(r.t, r.a)).join('')}</div>` : ''}
    <details class="tt-fold"><summary>Filtres : niveau, type de tuto, langue</summary><div class="tt-opts">
      <div><div class="tt-sub">Niveau</div><div class="filters">${Object.entries(T_LVL).map(([k, v]) => `<button type="button" class="filt ${tuto.lvl===k?'on':''}" onclick="tutoOpt('lvl','${k}')">${v.n}</button>`).join('')}</div></div>
      <div><div class="tt-sub">Je veux apprendre</div><div class="filters">${Object.entries(T_KIND).map(([k, v]) => `<button type="button" class="filt ${tuto.kind===k?'on':''}" onclick="tutoOpt('kind','${k}')">${v.n}</button>`).join('')}</div></div>
      <div><div class="tt-sub">Langue des tutos</div><div class="filters">${Object.entries(T_LANG).map(([k, v]) => `<button type="button" class="filt ${tuto.lang===k?'on':''}" onclick="tutoOpt('lang','${k}')">${v}</button>`).join('')}</div></div>
    </div></details>
    <button type="button" class="tt-keys-btn" onclick="tuto.showKeys=!tuto.showKeys;renderTuto()">Options avancées : vidéos YouTube dans l’appli & reconnaissance audio ${keys.yt ? '· YouTube ✓' : ''}${keys.audd ? ' · Audio ✓' : ''}</button>
    ${tuto.showKeys ? `<div class="tt-keys">
      <p class="exo-note" style="margin-top:0">Ces deux options utilisent des services externes avec <b>ta propre clé gratuite</b>. Elle reste uniquement dans ce navigateur. Sans clé, tout le reste fonctionne.</p>
      <div class="frow">
        <div class="fg"><label>Clé YouTube Data API v3</label><input type="text" id="tt-ytkey" value="${esc(keys.yt)}" placeholder="AIza…"><div class="exo-note">À créer gratuitement sur <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener" style="color:var(--gold2)">Google Cloud Console</a> → activer « YouTube Data API v3 » → Identifiants → Clé API.</div></div>
        <div class="fg"><label>Jeton AudD (reconnaissance audio)</label><input type="text" id="tt-audd" value="${esc(keys.audd)}" placeholder="jeton AudD"><div class="exo-note">Jeton gratuit pour un usage léger sur <a href="https://audd.io" target="_blank" rel="noopener" style="color:var(--gold2)">audd.io</a>. Sinon, utilise <a href="https://www.shazam.com" target="_blank" rel="noopener" style="color:var(--gold2)">Shazam</a> puis tape le titre.</div></div>
      </div>
      <button type="button" class="btn btn-primary btn-sm" onclick="tutoSaveKeys()">Enregistrer</button></div>` : ''}
  </div>`;

  if (!tuto.show) {
    h += `<div class="tt-empty">${tutoHeroSVG()}<h3>Un morceau en tête ?</h3><p>Tape-le, dicte-le, ou fais écouter le morceau : l’appli te sort les meilleurs tutos des réseaux, de YouTube et des sites de tabs de confiance.</p></div>`;
    host.innerHTML = h; return;
  }
  const sh = tutoSheet(); tutoPinList = [];
  h += `<div id="tt-results"><div class="tt-song">
      <div><div class="tt-song-t">${esc(tuto.title)}</div><div class="tt-song-a">${esc(tuto.artist || 'Artiste non précisé')} · ${T_KIND[tuto.kind].n} · ${T_LVL[tuto.lvl].n}${sh ? ` · fiche : ${(sh.links || []).length} lien${(sh.links || []).length > 1 ? 's' : ''} gardé${(sh.links || []).length > 1 ? 's' : ''}` : ''}</div></div>
      ${sh ? `<button type="button" class="btn btn-ghost btn-sm" onclick="viewSheet('${sh.id}')">Ouvrir ma fiche</button>` : `<button type="button" class="btn btn-primary btn-sm" onclick="tutoComplete()">+ Créer la fiche</button>`}
    </div>
    <div class="exo-sec-t" style="margin-top:22px">Tutos sur les réseaux</div>
    <div class="tt-plat-grid">${tutoPlatforms().map(p => `<div class="tt-plat">
      <div class="tt-plat-h" style="background:${p.bg}"><span class="tt-plat-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p.ico}</svg></span><div><div class="tt-plat-n">${p.n}</div><div class="tt-plat-d">${p.d}</div></div></div>
      <div class="tt-plat-links">${p.links.map(([l, u]) => { const i = tutoPinList.push([u, p.n + ' · ' + l]) - 1, on = tutoPinned(u); return `<div class="tt-row"><a href="${u}" target="_blank" rel="noopener" class="tt-link">${esc(l)}<span>${icon('ext', 13)}</span></a><button type="button" class="tt-pin ${on ? 'on' : ''}" onclick="tutoPin(${i})" aria-label="${on ? 'Déjà dans la fiche' : 'Épingler dans la fiche'}" title="${on ? 'Déjà dans la fiche' : 'Épingler dans la fiche'}">${icon(on ? 'check' : 'pin', 16)}</button></div>`; }).join('')}</div></div>`).join('')}</div>
    <div class="exo-note">TikTok et Instagram n’offrent pas de recherche publique intégrable : chaque bouton ouvre directement la bonne recherche ou le bon hashtag (Instagram peut demander d’être connecté).</div>

    <div class="exo-sec-t" style="margin-top:22px">Vidéos YouTube dans l’appli</div>
    ${tutoYTHTML(keys.yt)}

    <div class="exo-sec-t" style="margin-top:22px">Tabs & accords · sites de confiance</div>
    <div class="tt-site-grid">${tutoSites().map(([n, d, u]) => `<a class="tt-site" href="${u}" target="_blank" rel="noopener"><div class="tl-mono" style="width:34px;height:34px;font-size:12px">${n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div><div style="flex:1;min-width:0"><div class="tl-n" style="font-size:14px">${n}</div><div class="tl-host">${d}</div></div>${icon('ext', 14)}</a>`).join('')}</div>

    <div class="exo-sec-t" style="margin-top:22px">Recherches Google ciblées</div>
    <div class="filters">${tutoGoogle().map(([l, u]) => `<a class="filt" href="${u}" target="_blank" rel="noopener">${l} ↗</a>`).join('')}</div>

    <div class="tt-cols">
      <div class="fcard" style="margin:0"><div class="fcard-t">${icon('save', 14)} Garder le bon tuto</div>
        <p class="exo-note" style="margin-top:0">Tu as trouvé LA bonne vidéo ? Colle son lien : elle est rangée dans les Médias de la fiche du morceau (créée si besoin). Les vidéos YouTube s’y regardent directement.</p>
        <div style="display:flex;gap:8px"><input type="url" id="tt-keep" placeholder="https://www.tiktok.com/… ou youtube.com/…" style="flex:1" onkeydown="if(event.key==='Enter')tutoKeep(this.value)">
        <button type="button" class="btn btn-primary btn-sm" onclick="tutoKeep($('tt-keep').value,'',$('tt-orig').checked?'original':'tuto')">Garder</button></div>
        <label style="display:flex;gap:8px;align-items:center;font-size:12px;color:var(--cream3);margin-top:8px"><input type="checkbox" id="tt-orig"> C’est la version originale (lien YouTube officiel)</label>
        ${sh && (sh.links || []).length ? `<div class="exo-note">Déjà dans les Médias : ${sh.links.length} lien${sh.links.length > 1 ? 's' : ''}.</div>` : ''}</div>
      <div class="fcard" style="margin:0"><div class="fcard-t">Reconnaître un bon tuto</div>
        <div class="tt-check">${['Il joue la <b>vraie version</b> au début (tu entends si c’est le bon son).','On voit <b>les deux mains</b> de près.','Il indique <b>accordage et capo</b>.','Il découpe : <b>partie par partie</b>, puis au ralenti.','Commentaires positifs, et la vidéo n’est pas « simplifiée » sans le dire.'].map(t => `<div>${t}</div>`).join('')}</div></div>
    </div>
    <div class="tt-band"><div><b>${sh ? `Fiche « ${esc(sh.title)} »` : 'Pas encore de fiche'}</b><small>${sh ? 'Ajoute les accords, le rythme, l’original.' : 'Épingle un lien pour la créer, ou complète-la maintenant.'}</small></div>
      <button type="button" class="btn btn-primary btn-sm" onclick="tutoComplete()">Compléter la fiche</button></div></div>`;
  host.innerHTML = h;
}
function tutoYTHTML(key) {
  if (!key) return `<div class="exo-vis" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:220px;font-size:13px;color:var(--cream2);line-height:1.6">Avec une clé YouTube gratuite, les meilleurs tutos s’affichent <b>ici</b>, avec miniatures, et se regardent sans quitter l’appli.</div>
    <button type="button" class="btn btn-ghost btn-sm" onclick="tuto.showKeys=true;renderTuto();window.scrollTo({top:0,behavior:'smooth'})">Ajouter ma clé</button></div>`;
  if (tuto.ytLoading) return '<div class="exo-vis exo-note">Chargement des vidéos…</div>';
  if (tuto.ytErr) return `<div class="exo-vis exo-note" style="color:var(--terra)">${esc(tuto.ytErr)}</div>`;
  if (!tuto.yt) return `<button type="button" class="btn btn-ghost btn-sm" onclick="tutoLoadYT()">Charger les vidéos</button>`;
  if (!tuto.yt.length) return '<div class="exo-vis exo-note">Aucune vidéo trouvée : élargis les filtres (tous niveaux, cours complet).</div>';
  return `${tuto.play ? `<div class="yt-embed" style="margin-bottom:12px"><iframe src="https://www.youtube.com/embed/${tuto.play}?autoplay=1" title="Tuto" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>` : ''}
    <div class="tt-yt-grid">${tuto.yt.map(v => `<div class="tt-yt ${tuto.play === v.id ? 'on' : ''}">
      <button type="button" class="tt-yt-th" onclick="tuto.play='${v.id}';renderTuto()"><img src="${v.th}" alt="" loading="lazy"><span>▶</span></button>
      <div class="tt-yt-t">${esc(v.t)}</div><div class="tl-host">${esc(v.ch)}</div>
      <button type="button" class="btn btn-primary btn-sm" style="margin-top:6px;width:100%" onclick="tutoCreateWith('https://www.youtube.com/watch?v=${v.id}', ${esc(JSON.stringify('Tuto · ' + v.ch))})">Créer la fiche avec ce tuto</button>
      <button type="button" class="btn btn-ghost btn-xs" style="margin-top:6px" onclick="tutoKeep('https://www.youtube.com/watch?v=${v.id}', ${esc(JSON.stringify('Tuto · ' + v.ch))})">${icon('pin', 12)} Garder</button>
      <button type="button" class="btn btn-ghost btn-xs" style="margin-top:6px" onclick="tutoKeep('https://www.youtube.com/watch?v=${v.id}', ${esc(JSON.stringify('Original · ' + v.ch))}, 'original')">♫ Original</button></div>`).join('')}</div>`;
}
function tutoHeroSVG() {
  return `<svg width="220" height="140" viewBox="0 0 220 140" fill="none" aria-hidden="true">
    <rect x="12" y="22" width="76" height="100" rx="12" fill="var(--card3)" stroke="var(--border2)"/><path d="M42 58l18 12-18 12z" fill="var(--terra)"/>
    <rect x="72" y="10" width="76" height="120" rx="14" fill="var(--card2)" stroke="var(--gold)" stroke-width="2"/>
    <circle cx="110" cy="58" r="20" fill="var(--gold)"/><path d="M104 48l16 10-16 10z" fill="var(--ink)"/>
    <rect x="86" y="92" width="48" height="6" rx="3" fill="var(--border2)"/><rect x="86" y="104" width="32" height="6" rx="3" fill="var(--border2)"/>
    <rect x="132" y="22" width="76" height="100" rx="12" fill="var(--card3)" stroke="var(--border2)"/><circle cx="170" cy="62" r="13" stroke="var(--mauve)" stroke-width="3"/><circle cx="182" cy="44" r="2.5" fill="var(--mauve)"/>
    <circle cx="186" cy="112" r="16" fill="var(--sage)"/><circle cx="183" cy="109" r="6" stroke="var(--ink)" stroke-width="2.4"/><path d="M188 114l5 5" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}


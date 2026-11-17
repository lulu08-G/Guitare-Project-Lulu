/* ═══════ BOÎTE À OUTILS — les sites qui comptent ═══════
   Senior note: links only, no logos — every card is drawn from the same
   monogram + category icon so the page stays light, theme-aware and never
   pretends to be the brand it points to. */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const ICO = {
  tab:   '<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/><circle cx="8" cy="10" r="1.6" fill="currentColor"/><circle cx="14" cy="14" r="1.6" fill="currentColor"/>',
  learn: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>',
  theory:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5"/>',
  tool:  '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  ear:   '<path d="M6 9a6 6 0 1112 0c0 4-4 5-4 9a3 3 0 01-6 0"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-1.5 2-1.5 3.5"/>',
  people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14.5 14.2c3 .3 5.5 2.6 5.5 5.8"/>',
  ext:   '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  mic:   '<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>',
  wave:  '<path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h0"/>',
  pin:   '<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v8"/>',
  check: '<polyline points="4 12 10 18 20 6"/>',
  save:  '<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
};
const icon = (k, sz) => `<svg width="${sz || 18}" height="${sz || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
const TOOL_CATS = [
  {k:'tabs',      n:'Tablatures & accords',   d:'La grille ou la tab de n’importe quel morceau', c:'var(--gold)',  i:'tab'},
  {k:'learn',     n:'Apprendre en ligne',     d:'Des méthodes complètes et reconnues',           c:'var(--sage)',  i:'learn'},
  {k:'theory',    n:'Théorie & harmonie',     d:'Accords, gammes et progressions expliqués',     c:'var(--mauve)', i:'theory'},
  {k:'practice',  n:'Outils de pratique',     d:'Ralentir, isoler la guitare, accorder, écrire', c:'var(--terra)', i:'tool'},
  {k:'ear',       n:'Oreille',                d:'Entraîner l’oreille musicale',                  c:'var(--gold2)', i:'ear'},
  {k:'community', n:'Communauté & matériel',  d:'Poser ses questions, découvrir le matos',       c:'var(--cream2)',i:'people'},
];
const TOOLS = [
  {c:'tabs', n:'Ultimate Guitar', u:'https://www.ultimate-guitar.com', d:'La plus grande base de tabs et d’accords au monde, notée par la communauté. Le premier réflexe.', p:'Gratuit + Pro', l:'EN', top:true},
  {c:'tabs', n:'Songsterr', u:'https://www.songsterr.com', d:'Tabs interactives qui défilent avec le vrai son du morceau, piste par piste. Idéal pour les riffs et solos.', p:'Freemium', l:'EN', top:true},
  {c:'tabs', n:'Boîte à chansons', u:'https://www.boiteachansons.net', d:'Accords de la chanson française et internationale, en français, avec transposition.', p:'Gratuit', l:'FR'},
  {c:'tabs', n:'Tabs4acoustic', u:'https://www.tabs4acoustic.com', d:'Site français dédié à la guitare acoustique : tabs, accords et cours vidéo.', p:'Gratuit', l:'FR'},
  {c:'tabs', n:'Chordify', u:'https://chordify.net', d:'Détecte automatiquement les accords de n’importe quelle chanson et les fait défiler en rythme.', p:'Freemium', l:'EN · FR'},
  {c:'tabs', n:'Cifra Club', u:'https://www.cifraclub.com', d:'Énorme base d’accords avec vidéos de cours, très complète sur la pop internationale.', p:'Gratuit', l:'PT · EN'},
  {c:'learn', n:'JustinGuitar', u:'https://www.justinguitar.com', d:'LA méthode gratuite la plus recommandée au monde : un cursus complet du débutant à l’intermédiaire.', p:'Gratuit', l:'EN', top:true},
  {c:'learn', n:'Fender Play', u:'https://www.fender.com/play', d:'Cours vidéo courts et structurés par style (rock, pop, blues, folk…), par la marque Fender.', p:'Payant', l:'EN'},
  {c:'learn', n:'Guitar Tricks', u:'https://www.guitartricks.com', d:'Des milliers de leçons vidéo organisées en cursus, l’une des plus anciennes plateformes.', p:'Payant', l:'EN'},
  {c:'learn', n:'Yousician', u:'https://yousician.com', d:'Appli qui écoute ta guitare et te corrige en temps réel, façon jeu vidéo.', p:'Freemium', l:'EN · FR'},
  {c:'theory', n:'musictheory.net', u:'https://www.musictheory.net/lessons', d:'Leçons de théorie animées, claires et gratuites : notes, intervalles, accords, gammes.', p:'Gratuit', l:'EN · FR', top:true},
  {c:'theory', n:'Hooktheory (TheoryTab)', u:'https://www.hooktheory.com/theorytab', d:'L’analyse harmonique de milliers de chansons connues : vois quels degrés (I, V, vi, IV…) elles utilisent.', p:'Freemium', l:'EN'},
  {c:'theory', n:'Oolimo', u:'https://www.oolimo.com/en/guitar-chords', d:'Dictionnaire d’accords et de gammes : toutes les positions sur le manche, analyse d’accord inverse.', p:'Gratuit', l:'EN · DE'},
  {c:'theory', n:'Teoria', u:'https://www.teoria.com', d:'Tutoriels et exercices de théorie musicale très complets.', p:'Gratuit', l:'EN · FR'},
  {c:'practice', n:'Moises', u:'https://moises.ai', d:'Sépare la guitare, la voix et la batterie d’un morceau, ralentit sans changer la hauteur. Indispensable pour relever.', p:'Freemium', l:'EN · FR', top:true},
  {c:'practice', n:'Accordeur en ligne Fender', u:'https://www.fender.com/online-guitar-tuner', d:'Accordeur micro gratuit dans le navigateur, avec des accordages alternatifs.', p:'Gratuit', l:'EN'},
  {c:'practice', n:'Métronome Google', u:'https://www.google.com/search?q=metronome', d:'Un métronome instantané, directement dans la recherche Google.', p:'Gratuit', l:'Tous'},
  {c:'practice', n:'MuseScore', u:'https://musescore.com', d:'Des partitions et tablatures partagées par la communauté, et un logiciel d’écriture gratuit.', p:'Freemium', l:'EN · FR'},
  {c:'practice', n:'Guitar Pro', u:'https://www.guitar-pro.com', d:'Le logiciel de référence pour lire, écrire et jouer des tablatures (fichiers .gp).', p:'Payant', l:'EN · FR'},
  {c:'practice', n:'Transcribe!', u:'https://www.seventhstring.com/xscribe/overview.html', d:'L’outil des musiciens qui relèvent à l’oreille : boucles, ralentis, analyse des notes.', p:'Payant', l:'EN'},
  {c:'ear', n:'ToneGym', u:'https://www.tonegym.co', d:'Jeux d’entraînement de l’oreille : intervalles, accords, progressions.', p:'Freemium', l:'EN'},
  {c:'ear', n:'Exercices musictheory.net', u:'https://www.musictheory.net/exercises', d:'Quiz d’oreille et de lecture personnalisables, gratuits.', p:'Gratuit', l:'EN · FR'},
  {c:'community', n:'r/Guitar', u:'https://www.reddit.com/r/Guitar/', d:'La plus grande communauté de guitaristes en ligne : conseils, matériel, partages.', p:'Gratuit', l:'EN'},
  {c:'community', n:'r/guitarlessons', u:'https://www.reddit.com/r/guitarlessons/', d:'Questions de débutants, avis sur les méthodes, entraide pour progresser.', p:'Gratuit', l:'EN'},
  {c:'community', n:'Audiofanzine', u:'https://fr.audiofanzine.com', d:'Le grand site français du matériel : tests, avis, forums et petites annonces.', p:'Gratuit', l:'FR'},
  {c:'community', n:'Equipboard', u:'https://equipboard.com', d:'Découvre quelles guitares, amplis et pédales utilisent tes guitaristes préférés.', p:'Gratuit', l:'EN'},
];
let toolCat = 'all', toolQ = '';
function toolsHeroSVG() {
  return `<svg width="230" height="150" viewBox="0 0 230 150" fill="none" aria-hidden="true">
    <rect x="18" y="62" width="194" height="76" rx="14" fill="var(--card3)" stroke="var(--gold)" stroke-width="2"/>
    <rect x="18" y="62" width="194" height="22" rx="10" fill="var(--gold)"/>
    <path d="M88 62v-12a8 8 0 018-8h38a8 8 0 018 8v12" stroke="var(--gold2)" stroke-width="5" stroke-linecap="round"/>
    <rect x="104" y="92" width="22" height="14" rx="4" fill="var(--gold2)"/>
    <g transform="rotate(-24 60 40)"><rect x="54" y="2" width="12" height="64" rx="4" fill="var(--terra)"/><rect x="48" y="-6" width="24" height="14" rx="4" fill="var(--terra)"/>
      <circle cx="51" cy="-1" r="2.5" fill="var(--cream)"/><circle cx="69" cy="-1" r="2.5" fill="var(--cream)"/></g>
    <g transform="rotate(18 168 36)"><path d="M160 66 L168 6 L176 66 Z" fill="var(--sage)"/><line x1="168" y1="60" x2="176" y2="18" stroke="var(--cream)" stroke-width="2.5" stroke-linecap="round"/><circle cx="176" cy="18" r="4" fill="var(--cream)"/></g>
    <circle cx="200" cy="30" r="14" fill="var(--mauve)"/><path d="M196 24v12M196 36a3 3 0 11-3-3" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/><path d="M196 24l8-2v10" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="30" cy="34" r="11" fill="var(--gold2)"/><path d="M26 34l3 3 6-6" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function toolCard(t) {
  const cat = TOOL_CATS.find(c => c.k === t.c), mono = t.n.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const host = t.u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
  return `<a class="tool-card" href="${t.u}" target="_blank" rel="noopener" style="--tc:${cat.c}">
    <div class="tl-top"><div class="tl-mono">${mono}</div><div style="min-width:0"><div class="tl-n">${esc(t.n)}${t.top ? ' <span class="tl-star" title="Incontournable">★</span>' : ''}</div><div class="tl-host">${host}</div></div><span class="tl-ext">${icon('ext', 15)}</span></div>
    <div class="tl-d">${t.d}</div>
    <div class="tl-tags"><span class="tag ${t.p === 'Gratuit' ? 'sage' : t.p === 'Payant' ? '' : 'gold'}">${t.p}</span><span class="tag">${t.l}</span></div></a>`;
}
function renderTools() {
  const q = toolQ.toLowerCase().trim();
  const list = TOOLS.filter(t => (toolCat === 'all' || t.c === toolCat) && (!q || (t.n + ' ' + t.d).toLowerCase().includes(q)));
  const cats = TOOL_CATS.filter(c => list.some(t => t.c === c.k));
  $('tools-body').innerHTML = `
    <div class="search-bar"><svg class="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input type="text" placeholder="Chercher un site (tabs, accordeur, théorie…)" value="${esc(toolQ)}" oninput="toolQ=this.value;renderTools();this.focus();this.setSelectionRange(this.value.length,this.value.length)"></div>
    <div class="filters"><button type="button" class="filt ${toolCat==='all'?'on':''}" onclick="toolCat='all';renderTools()">Tout</button>${TOOL_CATS.map(c =>
      `<button type="button" class="filt ${toolCat===c.k?'on':''}" onclick="toolCat='${c.k}';renderTools()">${c.n}</button>`).join('')}</div>
    ${cats.length ? cats.map(c => `<div class="axis-sec"><div class="axis-t"><span class="tl-cat-ico" style="background:${c.c}">${icon(c.i, 16)}</span>${c.n}</div><div class="axis-d" style="margin-left:42px">${c.d}</div>
      <div class="tool-grid">${list.filter(t => t.c === c.k).map(toolCard).join('')}</div></div>`).join('')
      : '<p class="cours-p">Aucun site ne correspond.</p>'}
    <div class="exo-note" style="margin-top:6px">★ = incontournable. Les liens s’ouvrent dans un nouvel onglet. Aucun de ces sites n’est affilié à l’appli.</div>
    <div class="exo-note" style="margin-top:6px;font-size:.78em;opacity:.7">Sons de guitare : University of Iowa Electronic Music Studios, Musical Instrument Samples.</div>`;
}


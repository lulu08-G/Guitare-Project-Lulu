/* ═══════ BOOT ═══════ */
(async function boot() {
  launchSplash();
  try { await DB.open(); } catch (e) { toast('Stockage indisponible', true); return; }
  sheets = await DB.all('sheets');
  const hadSheets = sheets.length > 0;
  try { const ep = await DB.get('meta', 'exo'); if (ep && ep.v) exoProg = Object.assign(exoProg, ep.v); } catch (e) {}
  const flag = await DB.get('meta', 'migrated');
  if (!flag) {
    const old = migrateOld();
    if (old.length) {
      for (const s of old) { sheets.push(s); await DB.put('sheets', s); }
      toast(`${old.length} fiche(s) recuperee(s) de l ancienne version`);
    }
    await DB.put('meta', {k:'migrated', v:true});
  }
  if (!sheets.length) {
    const demo = newSheet_();
    demo.title = 'Wonderwall'; demo.artist = 'Oasis'; demo.capo = 2; demo.bpm = 87;
    demo.difficulty = 'Débutant'; demo.color = 'gold';
    demo.blocks = {capo:true, tempo:true, diff:true, coffre:true};
    demo.memo = 'Capo 2 obligatoire. Laisser sonner, ne pas etouffer les cordes.';
    demo.links = [{id:uid(), url:'https://www.youtube.com/watch?v=bx1Bh8ZvH84', title:'Video YouTube'}];
    const p1 = newPart('Couplet');
    p1.chords = [newChord('Em'), newChord('G'), newChord('D'), newChord('A7')];
    p1.rhythm = rhFromPat('DuDuDuDu');
    p1.note = 'x2 — léger';
    const p2 = newPart('Refrain');
    p2.chords = [newChord('C'), newChord('Em'), newChord('G'), newChord('Asus4')];
    p2.rhythm = rhFromPat('D-DU-UDU');
    p2.note = 'Plus fort, on ouvre';
    const p3 = newPart('Intro');
    const em7 = newChord('Em7'); em7.arp = [[0],[3],[2],[3],[1],[3],[2],[3]];
    const g = newChord('G');     g.arp   = [[0],[3],[2],[3],[1],[3],[2],[3]];
    p3.chords = [em7, g];
    p3.note = 'Fingerpicking — pouce sur la basse, doigts sur le reste';
    demo.parts = [p3, p1, p2];
    sheets.push(demo); await DB.put('sheets', demo);
  }
  // Morceaux à essayer (variété française + Renaud) : ajoutés une seule fois. Grilles simplifiées : seuls les accords vérifiés, à confirmer à l'oreille.
  try {
    const NOTE = CAT_NOTE, SEED_FR = CATALOG, linksFor = catLinks;
    if (!(await DB.get('meta', 'seed_fr_v1'))) {
      for (const x of SEED_FR) {
        if (sheets.some(z => z.title.trim().toLowerCase() === x.t.toLowerCase())) continue;
        const sh = newSheet_();
        sh.title = x.t; sh.artist = x.a; sh.capo = x.capo; sh.bpm = x.bpm; sh.difficulty = x.d; sh.color = 'gold';
        sh.blocks = {capo: x.capo > 0, tempo:true, diff:true, coffre:true};
        sh.memo = x.m + NOTE; sh.links = linksFor(x);
        const pt = newPart('');
        pt.chords = x.ch.map(newChord); pt.rhythm = rhFromPat(x.pat);
        sh.parts = [pt];
        sheets.push(sh); await DB.put('sheets', sh);
      }
      await DB.put('meta', {k:'seed_fr_v1', v:true});
    }
    if (!(await DB.get('meta', 'seed_add_v3'))) {   // demandés par Lucas le 16/11 : ajoutés une fois à ses fiches
      for (const x of CATALOG.filter(z => ['Lady Melody', 'How to Save a Life'].includes(z.t))) if (!catFind(x)) await catAdd(x);
      await DB.put('meta', {k:'seed_add_v3', v:true});
    }
    if (!(await DB.get('meta', 'seed_fr_v2'))) {   // fiches déjà ajoutées sans lien : on leur donne leurs tutos
      for (const x of SEED_FR) { const sh = sheets.find(z => z.title.trim().toLowerCase() === x.t.toLowerCase()); if (sh && !(sh.links && sh.links.length)) { sh.links = linksFor(x); await DB.put('sheets', sh); } }
      await DB.put('meta', {k:'seed_fr_v2', v:true});
    }
    // Fiche « Coffee » créée vide : on la remplit une fois (beabadoobee, 4 accords). Une fiche qui a déjà des accords n'est jamais touchée.
    if (!(await DB.get('meta', 'fill_coffee_v1'))) {
      const cf = sheets.find(z => z.title.trim().toLowerCase() === 'coffee' && (z.parts || []).every(q => !(q.chords || []).length));
      if (cf) {
        const x = {t:'Coffee', a:'beabadoobee'};
        if (!cf.artist || cf.artist === '—') cf.artist = x.a;
        cf.capo = cf.capo || 0; cf.difficulty = cf.difficulty || 'Debutant'; cf.blocks = Object.assign({capo:false, tempo:true, diff:true, coffre:true}, cf.blocks || {});
        cf.memo = (cf.memo ? cf.memo + ' ' : '') + 'Quatre accords qui tournent, tempo tranquille. Grille simplifiée : à vérifier à l’oreille avec l’original.';
        if (!(cf.links && cf.links.length)) cf.links = linksFor(x);
        const pt = (cf.parts && cf.parts[0]) || newPart('');
        pt.chords = ['A','Amaj7','Dmaj7','D7'].map(newChord); if (!rhHas(pt.rhythm)) pt.rhythm = rhFromPat('D-DUD-DU');
        cf.parts = [pt, ...(cf.parts || []).slice(1)];
        await DB.put('sheets', cf);
        await DB.put('meta', {k:'fill_coffee_v1', v:true});
      }
    }
  } catch (e) { console.warn('seed', e); }
  renderHome(); go('disc');
  if (!hadSheets && !LS.get('gms_onboarded', false)) onbShow();   // nouvelle installation : 3 écrans d'accueil, une seule fois // l'app s'ouvre sur Découvrir ; ancien commentaire : Fiches (le cahier vide propose « + Créer »)
  gmsShareIn();   // vidéo partagée depuis YouTube (19/11)
  if (LAB_OPEN && !LAB_Q.has('url')) go('labo');   // lien de test : on ouvre le labo
})();

// App installable : le service de fonctionnement hors ligne ne s'active que sur un vrai site (pas en fichier local ni dans un aperçu)
try { if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.top === window.self) navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) {}

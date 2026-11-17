// Test de fumée de l'app : à lancer avant chaque livraison.
//   NODE_PATH=$(npm root -g) node tests/smoke.cjs
// Vérifie, en téléphone (390 px) et sur PC (1200 px) : aucune erreur, pas de défilement horizontal,
// les écrans principaux, une fiche, l'éditeur, les blocs, une vidéo, l'impression, et la sauvegarde
// (export complet puis restauration). Sort en erreur au moindre problème.
const {chromium} = require('playwright'), path = require('path'), fs = require('fs'), os = require('os');
const URL = 'file://' + path.resolve(__dirname, '../index.html');
(async () => {
  const b = await chromium.launch(), errs = [], fail = m => errs.push(m);
  for (const [w, h, n] of [[390, 844, 'téléphone'], [1200, 800, 'PC']]) {
    const ctx = await b.newContext({viewport: {width: w, height: h}, acceptDownloads: true}), p = await ctx.newPage();
    p.on('pageerror', e => fail(`${n} : ${e.message}`));
    p.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) fail(`${n} console : ${m.text()}`); });
    await p.goto(URL); await p.waitForTimeout(1500);
    const scrollX = async lieu => { if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) fail(`${n} : défilement horizontal (${lieu})`); };
    for (const v of ['disc', 'home', 'blocs', 'exo', 'cours', 'plus', 'tuner', 'lib', 'metro', 'atelier', 'admin']) {
      await p.evaluate(v => go(v), v); await p.waitForTimeout(250); await scrollX(v);
    }
    const n0 = await p.evaluate(() => sheets.length);
    if (n0 < 3) fail(`${n} : fiches de départ manquantes (${n0})`);
    await p.evaluate(() => viewSheet(sheets[0].id)); await p.waitForTimeout(400); await scrollX('fiche');
    await p.evaluate(() => editSheet(sheets[0].id)); await p.waitForTimeout(400); await scrollX('éditeur');
    await p.evaluate(() => { go('blocs'); blocOpen('b1'); lvPlay('lv-b-b1-1'); }); await p.waitForTimeout(1200);
    if (!await p.evaluate(() => !!(lv && lv.k === 'b1-1'))) fail(`${n} : la vidéo ne démarre pas`);
    await p.evaluate(() => { lvStop(); printSheet(sheets[0].id); }); await p.waitForTimeout(300);
    if (!await p.evaluate(() => document.querySelectorAll('#pp-preview .pg').length)) fail(`${n} : aperçu d'impression vide`);
    await p.evaluate(() => closePrintModal());
    // sauvegarde complète puis restauration dans une app vierge
    const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => backupAll())]);
    const file = path.join(os.tmpdir(), 'gms-test-sauvegarde.json'); await dl.saveAs(file);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.kind !== 'backup' || data.sheets.length !== n0) fail(`${n} : sauvegarde incomplète`);
    const p2 = await (await b.newContext({viewport: {width: w, height: h}})).newPage();
    p2.on('pageerror', e => fail(`${n} (restauration) : ${e.message}`));
    await p2.goto(URL); await p2.waitForTimeout(1500);
    await p2.evaluate(async () => { for (const s of sheets.slice()) await DB.del('sheets', s.id); sheets.length = 0; });
    await p2.setInputFiles('#json-in', file); await p2.waitForTimeout(800);
    const n2 = await p2.evaluate(() => sheets.length);
    if (n2 !== n0) fail(`${n} : restauration ${n2} fiches au lieu de ${n0}`);
    await ctx.close();
  }
  await b.close();
  if (errs.length) { console.error('ÉCHEC\n- ' + errs.join('\n- ')); process.exit(1); }
  console.log('OK : téléphone et PC, aucune erreur, sauvegarde et restauration vérifiées');
})();

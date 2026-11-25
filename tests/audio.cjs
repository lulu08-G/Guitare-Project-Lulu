// Banc audio du moteur unique : chaque lecteur de l'app (fiche, mode jeu, éditeur, métronome, Répét', Labo, exercices)
// est lancé sous une horloge simulée et chaque son planifié est noté (nom, instant, paramètres), puis comparé à la
// référence tests/audio-ref.json : un son déplacé de plus de 1,5 ms ou un visuel de plus de 25 ms fait échouer.
//   NODE_PATH=$(npm root -g) node tests/audio.cjs          → compare à la référence (doit afficher « OK »)
//   NODE_PATH=$(npm root -g) node tests/audio.cjs --maj    → réécrit la référence (après un changement de son voulu)
const {chromium} = require('playwright'), path = require('path'), fs = require('fs');
const REF = path.join(__dirname, 'audio-ref.json'), MAJ = process.argv.includes('--maj');
function compare(G, N) {
  let bad = 0;
  for (const k of Object.keys(G)) {
    const g = G[k], n = N[k] || {snd: [], vis: []};
    const cmp = (x, y, tol, lbl) => {
      let shown = 0;
      if (x.length !== y.length) { console.log(`✗ ${k} ${lbl} : ${x.length} attendus, ${y.length} joués`); shown++; }
      for (let i = 0; i < Math.min(x.length, y.length); i++) {
        const p = x[i], q = y[i];
        if (p[0] !== q[0] || JSON.stringify(p.slice(2)) !== JSON.stringify(q.slice(2)) || Math.abs(p[1] - q[1]) > tol)
          if (shown++ < 4) console.log(`✗ ${k} ${lbl} n°${i} : ${JSON.stringify(p)} attendu, ${JSON.stringify(q)} joué`);
      }
      if (shown) bad++;
    };
    cmp(g.snd, n.snd, 0.0015, 'son'); cmp(g.vis, n.vis, 0.025, 'visuel');
    if (JSON.stringify(g.end) !== JSON.stringify(n.end)) { console.log(`✗ ${k} fin : ${g.end} attendu, ${n.end} joué`); bad++; }
  }
  return bad;
}
const URL = 'file://' + path.resolve(__dirname, '../index.html') + '?beta';
(async () => {
  const br = await chromium.launch(), ctx = await br.newContext({viewport: {width: 390, height: 844}}), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.clock.install({time: new Date('2026-11-25T10:00:00Z')});
  await p.addInitScript(() => {
    const T0 = Date.now();
    Object.defineProperty(BaseAudioContext.prototype, 'currentTime', {get() { return (Date.now() - T0) / 1000; }, configurable: true});
    let s = 12345; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  });
  await p.clock.pauseAt(new Date('2026-11-25T10:00:01Z'));
  await p.goto(URL); await p.clock.runFor(2500);
  await p.evaluate(() => {
    localStorage.setItem('gms_onboarded', '1');
    const R = window.__B = {snd: [], vis: [], t0: 0, end: null};
    const ac = audio(); const rel = t => Math.round((t - R.t0) * 10000) / 10000, now = () => rel(ac.currentTime);
    const ch = c => c ? (c.name || '') + ':' + (c.frets || []).join(',') : null;
    const W = (name, f) => { window[name] = f; };
    W('click', (t, hi) => R.snd.push(['click', rel(t), !!hi]));
    W('metroClick', (t, acc) => R.snd.push(['metroClick', rel(t), !!acc]));
    W('metroKick', t => R.snd.push(['kick', rel(t)]));
    W('metroSnare', t => R.snd.push(['snare', rel(t)]));
    W('metroHihat', t => R.snd.push(['hihat', rel(t)]));
    W('pluck', (f, t, d, v) => R.snd.push(['pluck', rel(t), Math.round(f * 100) / 100, d, v]));
    W('strumChord', (c, capo, dir, t, lvl, pm) => R.snd.push(['strum', rel(t), ch(c), capo || 0, dir, lvl, !!pm]));
    W('muteHit', (t, c, capo, dir, lvl, o) => R.snd.push(['mute', rel(t), ch(c), capo || 0, dir, lvl, !!(o && o.x)]));
    W('chuckSound', (t, c, capo) => R.snd.push(['chuck', rel(t), ch(c), capo || 0]));
    const V = name => { const o = window[name]; if (typeof o !== 'function') return; window[name] = function (...a) { R.vis.push([name, now(), ...a.map(x => typeof x === 'number' ? Math.round(x * 1000) / 1000 : x && typeof x === 'object' ? 'obj' : x)]); return o.apply(this, a); }; };
    ['flashMetroStep', 'flashMetroBeat', 'metroBandHit', 'rpVis', 'labVis', 'rpMedi', 'labMedi'].forEach(V);
    R.reset = () => { R.snd = []; R.vis = []; R.end = null; R.t0 = ac.currentTime; };
    R.log = (name, ti) => (...a) => R.vis.push([name, now(), ...a.map((x, j) => j === ti ? rel(x) : typeof x === 'number' ? x : x == null ? null : 'obj')]);
  });
  const out = {};
  const sc = async (name, setup, ms, mid) => {
    await p.evaluate(() => { try { stopPlay(); } catch (e) {} try { stopMetro(); } catch (e) {} try { rpStop(); } catch (e) {} try { labStop(); } catch (e) {} try { exoStop(); } catch (e) {} });
    await p.clock.runFor(500);
    await p.evaluate(`__B.reset(); (${setup})()`);
    if (mid) { await p.clock.runFor(mid[0]); await p.evaluate(`(${mid[1]})()`); await p.clock.runFor(ms - mid[0]); } else await p.clock.runFor(ms);
    out[name] = await p.evaluate(() => { const R = __B; return {snd: R.snd.slice(), vis: R.vis.slice(), end: R.end}; });
    await p.evaluate(() => { try { stopPlay(); } catch (e) {} try { stopMetro(); } catch (e) {} try { rpStop(); } catch (e) {} try { labStop(); } catch (e) {} try { exoStop(); } catch (e) {} });
  };
  const C = "['G','C','D','Em'].map(newChord)";
  await sc('fiche', `() => rhStart(rhFromPat('D-DU-UDU','4/4',8), 100, newChord('G'), 2, __B.log('onStep'), {key:'v0', chords:${C}})`, 6000);
  await sc('fiche-swing-mute', `() => { localStorage.setItem('gms_mm_learn','mute'); const r = rhFromPat('D--UX-UD-UDUX-U-','4/4',16); r.swing = .1; const r2 = rhFromPat('D-DUXUDU','4/4',8); r2.swing = .12; rhStart(r2, 84, null, 0, __B.log('onStep'), {key:'k', chords:${C}, mm:'learn'}); }`, 5000);
  await sc('fiche-16-12', `() => { localStorage.setItem('gms_mm_learn','chords'); rhStart(rhFromPat('D--D-UD--D-U','4/4',12), 60, newChord('Am'), 0, __B.log('onStep'), {mm:'learn'}); }`, 5000);
  await sc('fiche-arp', `() => rhStart(arpRh(), 90, null, 1, __B.log('onStep'), {chords:${C}, cellFn: arpCellFn({v:1, mes:'4/4', bass:'auto', steps: arpSteps(ARPS[2])}, 1)})`, 5000);
  await sc('fiche-bpm', `() => rhStart(rhFromPat('D-DUD-DU','4/4',8), 90, null, 0, __B.log('onStep'), {chords:${C}, onCell: __B.log('onCell', 1)})`, 6000, [2500, `() => rhSetBpm(130)`]);
  await sc('fiche-mute-click', `() => rhStart(rhFromPat('D-d-d-','3/4',8), 120, newChord('C'), 0, null, {mute:true})`, 4000);
  await sc('metro-click', `() => { go('metro'); metroState.improMode = false; metroState.bpm = 100; metroState.sig = '4/4'; metroState.preset = 'rock'; metroState.gap = null; metroState.layers = {click:true, kick:false, snare:false, hihat:false, bass:false}; buildMetroPattern(); startMetro(); }`, 5000);
  await sc('metro-band', `() => { go('metro'); metroState.improMode = true; metroState.bpm = 110; metroState.sig = '4/4'; metroState.preset = 'rock'; metroState.gap = null; metroState.layers = {click:true, kick:true, snare:true, hihat:true, bass:true}; buildMetroPattern(); startMetro(); }`, 5000, [2000, `() => { metroState.bpm = 140; }`]);
  await sc('metro-68-gap', `() => { go('metro'); metroState.improMode = false; metroState.bpm = 90; metroState.sig = '6/8'; metroState.preset = 'valse'; metroState.layers = {click:true, kick:true, snare:false, hihat:true, bass:false}; buildMetroPattern(); metroState.gap = {on:1, off:1}; startMetro(); }`, 7000);
  await sc('metro-34', `() => { go('metro'); metroState.gap = null; metroState.improMode = true; metroState.bpm = 120; metroState.sig = '3/4'; metroState.preset = 'valse'; metroState.layers = {click:false, kick:true, snare:true, hihat:true, bass:true}; buildMetroPattern(); startMetro(); }`, 4000);
  await sc('rp-medi', `() => { go('labo'); rpPlay({count:false, chords:['G'], say:'', band:false}); }`, 4000);
  await sc('rp-band', `() => { go('labo'); rpPlay({bpm: 96, beats:4, style:'rock', chords:['G','D','Em','C'], line: rpLine('D-DUXUDU', 8), demo:true, bars: 3, onEnd: () => { __B.end = 'end@' + Math.round((audio().currentTime - __B.t0) * 100) / 100; }}); }`, 12000);
  await sc('rp-valse', `() => { go('labo'); rpPlay({bpm: 120, beats:3, style:'valse', tchik:false, chords:['C','G'], line: rpLine('D-dUdU', 6), demo:true}); }`, 5000);
  await sc('lab', `() => { go('labo'); labPlay({onEnd: () => { __B.end = 'end@' + Math.round((audio().currentTime - __B.t0) * 100) / 100; }}); }`, 20000);
  await sc('lab-demo', `() => { go('labo'); labPlay({demo:true, bars:2, bpm: 90, chords:['Am','C'], line: Object.values(LAB_L).find(l => l.includes && l.includes('H')) || LAB_L.temps}); }`, 9000);
  await sc('exo-strum', `() => { localStorage.setItem('gms_mm_learn','chords'); strumBlock('bz', {pat:'D-DUXUDU', chords:['G','C']}, 'zz'); exoPlayStrum('bz'); }`, 5000);
  await sc('exo-sub', `() => exoPlaySub(3)`, 3000);
  await sc('exo-tab', `() => { tabBlock('tz', {tab:'1.5@1 1.6@2 1.7@3 1.8@4 | 2.5@1 2.6@2 PM:6.0 6.0', sub:4}, 'zz'); exoPlayTab('tz'); }`, 3000);
  // une seule lecture à la fois : en lancer une arrête la précédente
  const seul = await p.evaluate(() => {
    go('metro'); startMetro(); const a = metroPlaying && MT.owner === 'metro';
    rhStart(rhFromPat('D-DU-UDU'), 100, newChord('G'), 0, null, {key: 'v0'}); const b = !metroPlaying && MT.owner === 'rh';
    go('labo'); rpPlay({count: false, chords: ['G']}); const c = !rhP && MT.owner === 'rp';
    labPlay({}); const d = !rp.S && MT.owner === 'lab';
    stopPlay(); labStop(); return a && b && c && d && !MT;
  });
  if (!seul) errs.push('deux lectures jouent en même temps');
  await br.close();
  if (errs.length) { console.log('Erreurs dans la page :', errs.slice(0, 8)); process.exit(1); }
  if (MAJ || !fs.existsSync(REF)) { fs.writeFileSync(REF, JSON.stringify(out)); console.log(`Référence écrite (${Object.keys(out).length} scénarios)`); return; }
  const bad = compare(JSON.parse(fs.readFileSync(REF, 'utf8')), out);
  if (bad) { console.log(`${bad} écart(s) avec la référence`); process.exit(1); }
  console.log(`OK : ${Object.keys(out).length} scénarios, sons et visuels identiques à la référence`);
})();

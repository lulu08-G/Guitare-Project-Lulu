// Construit index.html (l'app en un seul fichier) à partir des sources de src/.
//   node build.mjs          → écrit index.html
//   node build.mjs --check  → vérifie que index.html est à jour (sort en erreur sinon)
// Aucune dépendance : on assemble les fichiers dans l'ordre de leurs numéros.
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
const dir = d => readdirSync(new URL(`src/${d}/`, import.meta.url)).filter(f => !f.startsWith('.')).sort();
const read = p => readFileSync(new URL(`src/${p}`, import.meta.url), 'utf8');
const html = dir('html'), js = dir('js');
const body = html.filter(f => !f.startsWith('00-') && !f.startsWith('99-'));
const out = read('html/00-head.html')
  + '<style>\n' + dir('css').map(f => read('css/' + f)).join('') + '</style>\n'
  + body.map(f => read('html/' + f)).join('')
  + '<script>\n' + js.filter(f => !f.startsWith('99-')).map(f => read('js/' + f)).join('') + '</script>\n'
  + '<script>\n' + js.filter(f => f.startsWith('99-')).map(f => read('js/' + f)).join('') + '</script>\n'
  + read('html/99-fin.html');
const target = new URL('index.html', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== out) { console.error('index.html n’est pas à jour : lance « node build.mjs »'); process.exit(1); }
  console.log('index.html est à jour');
} else { writeFileSync(target, out); console.log(`index.html construit (${(out.length / 1024).toFixed(0)} Ko)`); }

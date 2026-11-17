/* ═══════ DRAG-DROP IMAGE ═══════ */
(() => {
  const dz = () => $('img-drop'); if (!dz()) return;
  ['dragenter','dragover'].forEach(ev => document.addEventListener(ev, e => {
    if (!$('v-import').classList.contains('on')) return;
    e.preventDefault(); dz().classList.add('over');
  }));
  ['dragleave','drop'].forEach(ev => document.addEventListener(ev, e => { if (dz()) dz().classList.remove('over'); }));
  document.addEventListener('drop', async e => {
    if (!$('v-import').classList.contains('on')) return;
    e.preventDefault();
    const f = [...(e.dataTransfer.files||[])].find(x => x.type.startsWith('image/'));
    if (f) { const dt = new DataTransfer(); dt.items.add(f); $('imp-img').files = dt.files; loadTabImg($('imp-img')); }
  });
})();


/* ═══════ MODAL BACKDROP CLOSE ═══════ */
['m-chord','m-print','m-media'].forEach(id => {
  const el = $(id); if (el) el.addEventListener('click', e => { if (e.target === el) { if (id === 'm-media' && svFull) svFullStop(false); el.classList.add('hide'); } });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { rcCleanup(); if (svFull) svFullStop(false); document.querySelectorAll('.ov').forEach(o => o.classList.add('hide')); }
});


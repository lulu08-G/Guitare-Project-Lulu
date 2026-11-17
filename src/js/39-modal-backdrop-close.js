/* ═══════ MODAL BACKDROP CLOSE ═══════ */
['m-chord','m-print','m-media'].forEach(id => {
  const el = $(id); if (el) el.addEventListener('click', e => { if (e.target === el) el.classList.add('hide'); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { rcCleanup(); document.querySelectorAll('.ov').forEach(o => o.classList.add('hide')); }
});


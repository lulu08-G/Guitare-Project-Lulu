/* ═══════ LYRICS — optional, linked to chords/rhythm via inline tags ═══════
   [ChordName] inserted at cursor covers both grattage AND arpege chords (an
   arpeggio is just a chord with picking data in this model, so one tag format
   is enough — no separate "arpege marker" needed). A bare "•" marks a strum
   for songs that just need a beat reminder without a full chord. */
function lyricsEditorHTML(i, p) {
  const chords = p.chords;
  return `<div class="rh-wrap" style="padding:10px">
    <p style="font-size:11px;color:var(--cream4);margin-bottom:8px">Clique un accord pour l’insérer au curseur : il relie les paroles au bon moment. Facultatif : écris juste le texte si tu préfères.</p>
    <div class="chord-chips" style="margin-bottom:8px">
      ${chords.map(c => `<button type="button" class="lib-hit" onclick="insertLyricTag(${i},'[${esc(c.name)}]')">${esc(c.name)}</button>`).join('')
        || '<span style="font-size:11px;color:var(--cream4)">Ajoute d abord des accords a cette partie.</span>'}
      <button type="button" class="lib-hit" onclick="insertLyricTag(${i},'•')" title="Marquer un coup de rythme">&bull; coup</button>
    </div>
    <textarea id="lyrics-ta-${i}" rows="4" placeholder="[Em]Today is gon na be the [G]day..."
      oninput="draft.parts[${i}].lyrics=this.value;document.getElementById('lyrics-prev-${i}').innerHTML=lyricsPreviewHTML(this.value)">${esc(p.lyrics)}</textarea>
    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--cream4);margin:8px 0 4px">Apercu</div>
    <div class="pv-note" style="margin-top:0;font-style:normal" id="lyrics-prev-${i}">${lyricsPreviewHTML(p.lyrics)}</div>
  </div>`;
}
function insertLyricTag(i, tag) {
  const ta = $('lyrics-ta-' + i); if (!ta) return;
  const start = ta.selectionStart ?? ta.value.length, end = ta.selectionEnd ?? ta.value.length;
  const v = ta.value;
  ta.value = v.slice(0, start) + tag + v.slice(end);
  draft.parts[i].lyrics = ta.value;
  const pos = start + tag.length;
  ta.focus(); ta.setSelectionRange(pos, pos);
  const prev = $('lyrics-prev-' + i); if (prev) prev.innerHTML = lyricsPreviewHTML(ta.value);
}
function lyricsPreviewHTML(text) {
  if (!text || !text.trim()) return '<span style="color:var(--cream4);font-style:italic">Vide</span>';
  return esc(text)
    .replace(/\[([^\]]+)\]/g, '<span style="color:var(--gold2);font-weight:700;font-size:11px;vertical-align:super">$1</span>')
    .replace(/•/g, '<span style="color:var(--sage)">&bull;</span>')
    .replace(/\n/g, '<br>');
}


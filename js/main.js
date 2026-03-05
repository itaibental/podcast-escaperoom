/* ================================================================
   STUDIO 7 — ESCAPE ROOM
   js/main.js  —  אתחול + bridge לאירועי HTML
================================================================ */

/* ================================================================
   GLOBAL EVENT BRIDGE
   כל ה-onclick ב-HTML מפנים לכאן — גשר דק בין ה-DOM למודולים.
================================================================ */

// Intro
function selectCat(el)   { Game.selectCat(el); }
function onNameInput()   { Game.onNameInput(); }
function tryStart()      { Game.tryStart(); }

// Game
function nextQ()         { Game.nextQ(); }
function toggleAP()      { Game.toggleAudioPanel(); }

// Result
function shareResult()   { Game.shareResult(); }
function restart()       { Game.restart(); }
function downloadPDF()   { PDF7.download(); }

// Audio controls (volume sliders + mute buttons)
function setMVol(v)      { Audio7.setMusicVol(v); }
function setFVol(v)      { Audio7.setFxVol(v); }
function toggleMM()      { Audio7.toggleMusicMute(); }
function toggleFM()      { Audio7.toggleFxMute(); }

/* ================================================================
   INIT — runs once DOM is ready
================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Default category pre-selected
  const defaultCard = document.querySelector('[data-cat="acoustic"]');
  if (defaultCard) {
    defaultCard.classList.add('selected');
    defaultCard.querySelector('.cat-card-check').textContent = '✓';
  }

  // Start button disabled until name + cat chosen
  document.getElementById('btn-start').disabled = true;

  // Enter key on name input triggers start
  document.getElementById('player-name-input')
    .addEventListener('keydown', e => { if (e.key === 'Enter') tryStart(); });

  console.log('[STUDIO_7] Game loaded. 50 questions across 5 categories.');
});

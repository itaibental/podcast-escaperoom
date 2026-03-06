/* ================================================================
   PROJECT EARTH-CAST — main.js
   Global bridge + init
================================================================ */

// Intro
function onNameInput()         { Game.onNameInput(); }
function tryStart()            { Game.tryStart(); }

// Briefing
function startStation()        { Game.startStation(); }

// Game
function nextQ()               { Game.nextQ(); }
function toggleHints()         { Game.toggleHints(); }

// Success
function proceedFromSuccess()  { Game.proceedFromSuccess(); }

// Result
function restart()             { Game.restart(); }
function shareResult()         { Game.shareResult(); }

// Audio
function setFVol(v)            { Audio7.setFxVol(v); }
function toggleFM()            { Audio7.toggleFxMute(); }

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start').disabled = true;
  document.getElementById('player-name-input')
    .addEventListener('keydown', e => { if (e.key === 'Enter') tryStart(); });
  console.log('[EARTH-CAST] 6 תחנות × 10 שאלות = 60 שאלות. בהצלחה סוכנים!');
});

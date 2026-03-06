/* STUDIO__8 — main.js */

function onNameInput() {
  Game.onNameInput();
  Game.checkShowMode();
}
function selectMode(m)         { Game.selectMode(m); }
function pickStation(i)        { Game.pickStation(i); }
function tryStart()            { Game.tryStart(); }
function startStation()        { Game.startStation(); }
function nextQ()               { Game.nextQ(); }
function toggleHints()         { Game.toggleHints(); }
function closeDisqModal()      { Game.closeDisqModal(); }
function forceRestart()        { Game.forceRestart(); }
function proceedFromSuccess()  { Game.proceedFromSuccess(); }
function showFinalResult()     { Game.showFinalResult(); }
function restart()             { Game.restart(); }
function shareResult()         { Game.shareResult(); }

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start').disabled = true;
  document.getElementById('player-name-input')
    .addEventListener('keydown', e => { if (e.key === 'Enter') tryStart(); });
  console.log('[STUDIO__8] 6 תחנות × 10 שאלות. מקס 8 פסילות. בהצלחה!');
});

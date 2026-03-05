/* ================================================================
   STUDIO 7 — ESCAPE ROOM
   js/game.js  —  לוגיקת המשחק
================================================================ */

const Game = (() => {

  /* ---- State ---- */
  let S = {};
  let playerName = '';
  let selectedCat = 'acoustic';
  let activeQ = [];

  function initS() {
    S = {
      q: 0,
      score: 0,
      correct: 0,
      wrong: 0,
      attempts: 3,
      answered: false,
      tv: 90,
      tid: null,
      combo: 0,
      history: [],
    };
  }

  /* ---- Getters (for pdf.js) ---- */
  function getState()      { return S; }
  function getPlayerName() { return playerName; }
  function getSelectedCat(){ return selectedCat; }
  function getActiveQ()    { return activeQ; }

  /* ---- Screen routing ---- */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  /* ---- Category selection ---- */
  function selectCat(el) {
    document.querySelectorAll('.cat-card').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.cat-card-check').textContent = '';
    });
    el.classList.add('selected');
    el.querySelector('.cat-card-check').textContent = '✓';
    selectedCat = el.dataset.cat;
    checkStartReady();
  }

  /* ---- Name input ---- */
  function onNameInput() {
    playerName = document.getElementById('player-name-input').value.trim();
    checkStartReady();
  }

  function checkStartReady() {
    const ok = playerName.length >= 2 && selectedCat;
    document.getElementById('btn-start').disabled = !ok;
  }

  /* ---- Try start ---- */
  function tryStart() {
    Audio7.init();
    if (playerName.length < 2) return;
    activeQ = [...BANKS[selectedCat]].sort(() => Math.random() - 0.5);
    startGame();
  }

  /* ---- Start game ---- */
  function startGame() {
    initS();
    document.getElementById('audio-float').classList.remove('open');

    // update HUD player name + category badge
    document.getElementById('hud-player').textContent = playerName;
    const cfg = CAT_CONFIG[selectedCat];
    const badge = document.getElementById('hud-cat-badge');
    badge.textContent = cfg.name;
    badge.style.color = cfg.color;
    badge.style.borderColor = cfg.color;

    showScreen('screen-game');
    loadQ();
    startTimer();
  }

  /* ---- Load question ---- */
  function loadQ() {
    if (S.q >= activeQ.length) { endGame(); return; }

    Audio7.sfxLoad();

    const q = activeQ[S.q];
    const cfg = CAT_CONFIG[selectedCat];

    // update active color CSS var
    document.getElementById('riddle-box').style.setProperty('--active-color', cfg.color);

    document.getElementById('q-cat').textContent   = q.cat;
    document.getElementById('q-cat').style.color   = cfg.color;
    document.getElementById('q-flavor').textContent = q.flavor;
    document.getElementById('q-prop').innerHTML    = q.prop;
    document.getElementById('q-text').textContent  = q.text;
    document.getElementById('room-bg-num').textContent =
      String(S.q + 1).padStart(2, '0');

    // progress bar
    const pct = (S.q / activeQ.length) * 100;
    document.getElementById('hud-prog-fill').style.width = pct + '%';

    // answers
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'ans-btn reveal';
      btn.style.animationDelay = (i * 0.07) + 's';
      btn.innerHTML = `<span class="lt">${labels[i]}</span>${opt}`;
      btn.onclick = () => doAnswer(i, btn);
      wrap.appendChild(btn);
    });

    // reset feedback + next button
    const fb = document.getElementById('fb-box');
    fb.className = 'fb-box';
    fb.querySelector('.fb-lbl').textContent = '';
    fb.querySelector('.fb-txt').textContent = '';
    document.getElementById('btn-next').classList.remove('show');

    // reset attempts lights
    S.attempts = 3;
    S.answered = false;
    updateLights();

    // reset timer
    clearInterval(S.tid);
    S.tv = 90;
    updateTimerDisplay();
    startTimer();
  }

  /* ---- Timer ---- */
  function startTimer() {
    S.tid = setInterval(tickTimer, 1000);
  }

  function tickTimer() {
    S.tv--;
    updateTimerDisplay();
    if (S.tv <= 15 && S.tv > 0) Audio7.sfxTick();
    if (S.tv <= 0) { clearInterval(S.tid); onTimeout(); }
  }

  function updateTimerDisplay() {
    const el = document.getElementById('timer-val');
    const m = Math.floor(S.tv / 60);
    const s = String(S.tv % 60).padStart(2, '0');
    el.textContent = m + ':' + s;
    el.className = 'timer-val' + (S.tv <= 15 ? ' urgent' : '');
  }

  function onTimeout() {
    if (S.answered) return;
    S.answered = true;
    Audio7.sfxTimeout();
    disableAll();
    showFB(false, '// TIMEOUT :: חדר ננעל', 'הזמן נגמר! ' + activeQ[S.q].explain);
    document.getElementById('btn-next').classList.add('show');
    S.combo = 0;
    S.wrong++;
    S.history[S.q] = false;
    updateLights();
  }

  /* ---- Answer ---- */
  function doAnswer(idx, btn) {
    if (S.answered) return;
    Audio7.init();

    const q = activeQ[S.q];
    if (idx === q.correct) {
      // correct
      S.answered = true;
      clearInterval(S.tid);
      btn.classList.add('correct');
      Audio7.sfxCorrect();

      const timeBonus = Math.floor(S.tv / 10);
      const comboBonus = S.combo >= 2 ? S.combo * 5 : 0;
      const pts = 10 + timeBonus + comboBonus;
      S.score += pts;
      S.correct++;
      S.combo++;
      S.history[S.q] = true;

      if (S.combo >= 3) {
        Audio7.sfxCombo();
        flashCombo('COMBO x' + S.combo + '!');
      }

      showFB(true,
        '// ACCESS GRANTED :: +' + pts + ' pts',
        '✓ ' + q.explain
      );
      document.getElementById('hud-val-score').textContent = S.score;
      disableAll();
      document.getElementById('btn-next').classList.add('show');

    } else {
      // wrong
      S.attempts--;
      updateLights();
      Audio7.sfxWrong();
      btn.classList.add('wrong');
      btn.setAttribute('disabled', '');
      document.getElementById('riddle-box').classList.add('shake');
      setTimeout(() => document.getElementById('riddle-box').classList.remove('shake'), 400);

      if (S.attempts <= 0) {
        S.answered = true;
        clearInterval(S.tid);
        disableAll();
        showFB(false, '// ACCESS DENIED :: אין ניסיונות', '✕ ' + q.explain);
        document.getElementById('btn-next').classList.add('show');
        S.combo = 0;
        S.wrong++;
        S.history[S.q] = false;
      } else {
        showFB(false,
          '// ERROR :: ' + S.attempts + ' ניסיונות נותרו',
          'נסו שוב — בחרו תשובה אחרת.'
        );
      }
    }

    document.getElementById('hud-val-correct').textContent = S.correct;
  }

  /* ---- Helpers ---- */
  function disableAll() {
    document.querySelectorAll('.ans-btn').forEach(b => b.setAttribute('disabled', ''));
  }

  function showFB(ok, lbl, txt) {
    const fb = document.getElementById('fb-box');
    fb.className = 'fb-box show ' + (ok ? 'ok' : 'err');
    fb.querySelector('.fb-lbl').textContent = lbl;
    fb.querySelector('.fb-txt').textContent = txt;
  }

  function updateLights() {
    document.querySelectorAll('.light').forEach((l, i) => {
      l.classList.toggle('used', i >= S.attempts);
    });
  }

  function flashCombo(txt) {
    const el = document.getElementById('combo-flash');
    el.textContent = txt;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  /* ---- Next question ---- */
  function nextQ() {
    S.q++;
    loadQ();
  }

  /* ---- End game ---- */
  function endGame() {
    clearInterval(S.tid);
    const pct = Math.round(S.correct / activeQ.length * 100);
    const cfg = CAT_CONFIG[selectedCat];
    const color = cfg.color;

    // title + messages
    const RANKS = [
      [88, 'ESCAPED!',         '🏆 MASTER ENGINEER',   'הצלחת לפרוץ את האולפן!'],
      [62, 'ALMOST...',        '🎙️ PODCAST PRO',        'עוד קצת ותהיו מאסטרים!'],
      [38, 'TRAPPED',          '📻 TRAINEE',            'תרגול נוסף יעזור.'],
      [0,  'MISSION FAILED',   '🔴 INTERN',             'לא הפעם... נסו שוב!'],
    ];
    const r = RANKS.find(x => pct >= x[0]);

    const titleEl = document.getElementById('res-title');
    titleEl.textContent = r[0] >= 88 ? 'ESCAPED!' : r[2];
    titleEl.style.color = pct >= 88 ? 'var(--glow)' : pct >= 62 ? 'var(--amber)' : 'var(--red)';

    document.getElementById('res-player').textContent = playerName;
    document.getElementById('res-sub').textContent    = r[3];

    const pctEl = document.getElementById('res-pct');
    pctEl.textContent = pct + '%';
    pctEl.style.color = color;

    document.getElementById('res-correct').textContent = S.correct + ' / ' + activeQ.length;
    document.getElementById('res-wrong').textContent   = S.wrong;
    document.getElementById('res-score').textContent   = S.score;
    document.getElementById('res-rank').textContent    = r[1];

    const catEl = document.getElementById('res-cat');
    catEl.textContent  = cfg.name;
    catEl.style.color  = color;

    const fill = document.getElementById('res-fill');
    fill.style.cssText = 'width:0%;background:' + color + ';box-shadow:0 0 12px ' + color;
    requestAnimationFrame(() => {
      setTimeout(() => { fill.style.width = pct + '%'; }, 80);
    });

    pct >= 88 ? Audio7.sfxVictory() : Audio7.sfxLose();
    showScreen('screen-result');
  }

  /* ---- Restart ---- */
  function restart() {
    showScreen('screen-intro');
    // re-select default cat visually
    document.querySelectorAll('.cat-card').forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.cat-card-check').textContent = '';
    });
    const defaultCard = document.querySelector('[data-cat="acoustic"]');
    defaultCard.classList.add('selected');
    defaultCard.querySelector('.cat-card-check').textContent = '✓';
    selectedCat = 'acoustic';
    document.getElementById('player-name-input').value = '';
    playerName = '';
    document.getElementById('btn-start').disabled = true;
  }

  /* ---- Share ---- */
  function shareResult() {
    const pct = Math.round(S.correct / activeQ.length * 100);
    const cfg = CAT_CONFIG[selectedCat];
    const txt =
      playerName + ' השיג ' + pct + '% בקטגוריית "' + cfg.name +
      '" ב"חדר הבריחה — אולפן 7"!\n' +
      'ניקוד: ' + S.score + ' | ' + S.correct + '/' + activeQ.length + ' נכונות 🎙️';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => alert('הטקסט הועתק! 📋'));
    } else {
      prompt('העתיקו:', txt);
    }
  }

  /* ---- Audio float toggle ---- */
  function toggleAudioPanel() {
    document.getElementById('audio-float').classList.toggle('open');
  }

  /* ---- Public API ---- */
  return {
    selectCat,
    onNameInput,
    checkStartReady,
    tryStart,
    nextQ,
    shareResult,
    restart,
    toggleAudioPanel,
    getState,
    getPlayerName,
    getSelectedCat,
    getActiveQ,
  };

})();

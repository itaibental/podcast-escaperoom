/* ================================================================
   PROJECT EARTH-CAST — game.js
   לוגיקת משחק: 6 תחנות בסדר קבוע, ללא שאפל
================================================================ */

const Game = (() => {

  let S = {};
  let playerName = '';
  let currentStation = 0; // 0-5
  let currentQ = 0;       // 0-9 בתוך התחנה
  let hintIndex = 0;

  function initS() {
    S = {
      totalCorrect: 0,
      totalWrong: 0,
      totalScore: 0,
      attempts: 3,
      answered: false,
      tv: 90,
      tid: null,
      history: [],
    };
  }

  /* ---- getters for pdf ---- */
  function getState()       { return S; }
  function getPlayerName()  { return playerName; }
  function getCurrentStation() { return currentStation; }
  function getCurrentQ()    { return currentQ; }

  /* ---- Screen routing ---- */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  /* ---- Name input ---- */
  function onNameInput() {
    playerName = document.getElementById('player-name-input').value.trim();
    document.getElementById('btn-start').disabled = playerName.length < 2;
  }

  /* ---- Start game ---- */
  function tryStart() {
    Audio7.init();
    if (playerName.length < 2) return;
    currentStation = 0;
    currentQ = 0;
    initS();
    showMissionBriefing();
  }

  /* ---- Mission briefing screen ---- */
  function showMissionBriefing() {
    const st = STATIONS[currentStation];
    document.getElementById('brief-icon').textContent  = st.icon;
    document.getElementById('brief-title').textContent = st.title;
    document.getElementById('brief-sub').textContent   = st.subtitle;
    document.getElementById('brief-mission').textContent = st.mission;
    document.getElementById('brief-hint').textContent  = '💡 ' + st.hint_general;
    document.getElementById('brief-btn').style.background = st.color;
    document.getElementById('brief-btn').style.color = '#000';

    // station progress dots
    const dots = document.getElementById('station-dots');
    dots.innerHTML = '';
    STATIONS.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'sdot' + (i < currentStation ? ' done' : i === currentStation ? ' active' : '');
      d.style.setProperty('--sc', s.color);
      d.textContent = s.icon;
      dots.appendChild(d);
    });

    showScreen('screen-brief');
  }

  /* ---- Start station ---- */
  function startStation() {
    Audio7.sfxLoad();
    const st = STATIONS[currentStation];
    document.getElementById('hud-player').textContent = playerName;
    document.getElementById('hud-station-name').textContent = st.title;
    document.getElementById('hud-station-name').style.color = st.color;
    showScreen('screen-game');
    loadQ();
  }

  /* ---- Load question ---- */
  function loadQ() {
    const st = STATIONS[currentStation];
    const q  = st.questions[currentQ];

    hintIndex = 0;
    document.getElementById('hint-panel').classList.remove('open');
    document.getElementById('hint-btn').textContent = '💡 רמז';

    // HUD
    const globalQ = currentStation * 10 + currentQ + 1;
    document.getElementById('hud-q-num').textContent  = globalQ + ' / 60';
    document.getElementById('hud-station-num').textContent = (currentStation + 1) + ' / 6';
    const pct = ((currentStation * 10 + currentQ) / 60) * 100;
    document.getElementById('hud-prog-fill').style.width = pct + '%';
    document.getElementById('hud-score').textContent = S.totalScore;

    // color accent
    document.documentElement.style.setProperty('--station-color', st.color);
    document.getElementById('riddle-box').style.borderTopColor = st.color;
    document.getElementById('q-station-badge').textContent    = st.icon + ' ' + st.subtitle;
    document.getElementById('q-station-badge').style.color    = st.color;
    document.getElementById('q-station-badge').style.borderColor = st.color;

    // question content
    document.getElementById('q-scenario').textContent = q.scenario;
    document.getElementById('q-text').textContent     = q.text;

    // render hints (hidden)
    renderHints(q.hints);

    // answers
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';
    const labels = ['א', 'ב', 'ג', 'ד'];
    q.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'ans-btn reveal';
      btn.style.animationDelay = (i * 0.06) + 's';
      btn.innerHTML = `<span class="lt">${labels[i]}</span><span class="opt-text">${opt}</span>`;
      btn.onclick = () => doAnswer(i, btn);
      wrap.appendChild(btn);
    });

    // reset fb + next
    const fb = document.getElementById('fb-box');
    fb.className = 'fb-box';
    fb.querySelector('.fb-lbl').textContent = '';
    fb.querySelector('.fb-txt').textContent = '';
    document.getElementById('btn-next').classList.remove('show');

    // reset attempts
    S.attempts = 3;
    S.answered = false;
    updateLights();

    // reset timer
    clearInterval(S.tid);
    S.tv = 90;
    updateTimerDisplay();
    startTimer();
  }

  /* ---- Hint system ---- */
  function renderHints(hints) {
    const list = document.getElementById('hint-list');
    list.innerHTML = '';
    hints.forEach((h, i) => {
      const li = document.createElement('div');
      li.className = 'hint-item' + (i > 0 ? ' locked' : '');
      li.id = 'hint-' + i;
      li.innerHTML = (i === 0 ? '💡 ' : '🔒 ') + h;
      list.appendChild(li);
    });
  }

  function revealNextHint() {
    const st = STATIONS[currentStation];
    const q  = st.questions[currentQ];
    const maxHints = Math.min(5, q.hints.length);
    if (hintIndex >= maxHints) return;

    const item = document.getElementById('hint-' + hintIndex);
    if (item) {
      item.classList.remove('locked');
      item.innerHTML = '💡 ' + q.hints[hintIndex];
    }
    hintIndex++;

    const btn = document.getElementById('hint-btn');
    if (hintIndex >= maxHints) {
      btn.textContent = '💡 כל הרמזים';
      btn.disabled = true;
    } else {
      btn.textContent = '💡 רמז ' + (hintIndex + 1);
    }
    document.getElementById('hint-panel').classList.add('open');
  }

  function toggleHints() {
    const panel = document.getElementById('hint-panel');
    if (!panel.classList.contains('open')) {
      revealNextHint();
    } else {
      revealNextHint();
    }
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
    const m  = Math.floor(S.tv / 60);
    const s  = String(S.tv % 60).padStart(2, '0');
    el.textContent = m + ':' + s;
    el.className   = 'timer-val' + (S.tv <= 15 ? ' urgent' : '');
  }

  function onTimeout() {
    if (S.answered) return;
    S.answered = true;
    Audio7.sfxTimeout();
    disableAll();
    const q = STATIONS[currentStation].questions[currentQ];
    showFB(false, '⏱ TIMEOUT — זמן נגמר', q.explain);
    document.getElementById('btn-next').classList.add('show');
    S.totalWrong++;
    S.history.push(false);
    updateLights();
  }

  /* ---- Answer ---- */
  function doAnswer(idx, btn) {
    if (S.answered) return;
    Audio7.init();

    const q = STATIONS[currentStation].questions[currentQ];

    if (idx === q.correct) {
      S.answered = true;
      clearInterval(S.tid);
      btn.classList.add('correct');
      Audio7.sfxCorrect();

      const pts = 10 + Math.floor(S.tv / 10);
      S.totalScore += pts;
      S.totalCorrect++;
      S.history.push(true);

      showFB(true, '✅ נכון! +' + pts + ' נקודות', q.explain);
      document.getElementById('hud-score').textContent = S.totalScore;
      disableAll();
      document.getElementById('btn-next').classList.add('show');

    } else {
      S.attempts--;
      updateLights();
      Audio7.sfxWrong();
      btn.classList.add('wrong');
      btn.disabled = true;
      document.getElementById('riddle-box').classList.add('shake');
      setTimeout(() => document.getElementById('riddle-box').classList.remove('shake'), 400);

      if (S.attempts <= 0) {
        S.answered = true;
        clearInterval(S.tid);
        disableAll();
        showFB(false, '❌ אין ניסיונות', q.explain);
        document.getElementById('btn-next').classList.add('show');
        S.totalWrong++;
        S.history.push(false);
      } else {
        showFB(false, '⚠️ שגוי — נסו שוב (' + S.attempts + ' נותרו)', 'בחרו תשובה אחרת...');
      }
    }
  }

  /* ---- Next question / station ---- */
  function nextQ() {
    currentQ++;
    if (currentQ >= STATIONS[currentStation].questions.length) {
      // station done
      currentQ = 0;
      showStationSuccess();
    } else {
      loadQ();
    }
  }

  function showStationSuccess() {
    clearInterval(S.tid);
    const st = STATIONS[currentStation];
    document.getElementById('success-icon').textContent = st.icon;
    document.getElementById('success-msg').textContent  = st.success_msg;
    document.getElementById('success-score').textContent = 'ניקוד: ' + S.totalScore;
    document.getElementById('success-btn').style.background = st.color;

    const isLast = currentStation === STATIONS.length - 1;
    document.getElementById('success-btn').textContent =
      isLast ? '🚀 סיום המשימה!' : 'תחנה הבאה ←';

    Audio7.sfxVictory();
    showScreen('screen-success');
  }

  function proceedFromSuccess() {
    currentStation++;
    if (currentStation >= STATIONS.length) {
      endGame();
    } else {
      showMissionBriefing();
    }
  }

  /* ---- End game ---- */
  function endGame() {
    clearInterval(S.tid);
    const total = STATIONS.length * 10;
    const pct   = Math.round(S.totalCorrect / total * 100);

    document.getElementById('res-title').textContent  = pct >= 80 ? '🎇 ניצחתם!' : '🎙️ המשימה הסתיימה';
    document.getElementById('res-player').textContent = playerName;
    document.getElementById('res-correct').textContent = S.totalCorrect + ' / ' + total;
    document.getElementById('res-wrong').textContent   = S.totalWrong;
    document.getElementById('res-score').textContent   = S.totalScore;

    const fill = document.getElementById('res-fill');
    fill.style.width = '0%';
    fill.style.background = pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffaa00' : '#ff4444';
    setTimeout(() => { fill.style.width = pct + '%'; }, 100);

    document.getElementById('res-pct').textContent = pct + '%';
    document.getElementById('res-pct').style.color = pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffaa00' : '#ff4444';

    if (pct >= 80) {
      triggerVictoryAnimation();
    } else {
      Audio7.sfxLose();
      showScreen('screen-result');
    }
  }

  function triggerVictoryAnimation() {
    // Black screen flash then epic result
    document.body.style.background = '#000';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    setTimeout(() => {
      document.body.style.background = '';
      Audio7.sfxVictory();
      showScreen('screen-result');
      document.getElementById('screen-result').classList.add('victory');
    }, 800);
  }

  /* ---- Helpers ---- */
  function disableAll() {
    document.querySelectorAll('.ans-btn').forEach(b => { b.disabled = true; });
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

  /* ---- Restart ---- */
  function restart() {
    document.getElementById('screen-result').classList.remove('victory');
    currentStation = 0;
    currentQ = 0;
    initS();
    document.getElementById('player-name-input').value = '';
    playerName = '';
    document.getElementById('btn-start').disabled = true;
    showScreen('screen-intro');
  }

  function shareResult() {
    const total = STATIONS.length * 10;
    const pct   = Math.round(S.totalCorrect / total * 100);
    const txt   = playerName + ' השיג ' + pct + '% במשחק "מבצע קול האדמה"!\n' +
      'ניקוד: ' + S.totalScore + ' | ' + S.totalCorrect + '/' + total + ' נכונות 🎙️🚀';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => alert('הטקסט הועתק! 📋'));
    } else {
      prompt('העתיקו:', txt);
    }
  }

  /* ---- Public API ---- */
  return {
    onNameInput,
    tryStart,
    startStation,
    nextQ,
    toggleHints,
    proceedFromSuccess,
    restart,
    shareResult,
    getState,
    getPlayerName,
    getCurrentStation,
    getCurrentQ,
  };

})();

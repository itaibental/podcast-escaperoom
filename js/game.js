/* ================================================================
   STUDIO__8 — game.js
   חוקים: 2 שגיאות = פסילה | 8 פסולות = Game Over
================================================================ */

const Game = (() => {

  /* ── State ── */
  let S = {};
  let playerName   = '';
  let gameMode     = 'full';   // 'full' | 'single'
  let selectedSingleStation = 0;
  let currentStation = 0;
  let currentQ       = 0;
  let hintIndex      = 0;

  /* Disqualification messages — varied for drama */
  const DISQ_MSGS = [
    ['החייזרים מאוכזבים מאוד', 'הם ציפו ליותר מהאנושות. עתיד כדור הארץ בסכנה!'],
    ['הסיגנל נחלש...', 'ספינת האם קולטת את הכישלון שלכם. הצי הגלקטי מתקרב!'],
    ['הפיקוד הגלקטי מצחקק', 'האנושות הוכיחה שאינה ראויה. החלל מצפה...'],
    ['אזעקת חירום ביקום!', 'שגיאות רבות מדי — החייזרים שוקלים מחדש את ה"חסד"'],
    ['הרמקולים בספינת האם חורקים', 'חצי מהמועצה הגלקטית כבר הצביעה "לחסל". התאמצו!'],
    ['הקצין הגלקטי הרים גבה', 'עוד כישלון אחד ויורה על הכפתור האדום...'],
    ['ספינת האם משנה כיוון', 'הם עייפו מלהאזין. שבע שגיאות — עוד אחת ונגמר!'],
    ['זהירות — גבול קיצוני!', 'זו הפסילה האחרונה לפני שהאנושות תימחק מהמפה!'],
  ];

  function initS() {
    S = {
      totalCorrect: 0,
      totalWrong:   0,
      totalScore:   0,
      disqCount:    0,    // שאלות שנפסלו
      wrongThisQ:   0,    // שגיאות בשאלה הנוכחית
      attempts:     2,    // מותרות 2 שגיאות לפני פסילה
      answered:     false,
      disqualified: false,
      tv:  90,
      tid: null,
      history: [],
    };
  }

  /* ── Getters ── */
  function getState()          { return S; }
  function getPlayerName()     { return playerName; }
  function getCurrentStation() { return currentStation; }
  function getCurrentQ()       { return currentQ; }

  /* ── Screen routing ── */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  /* ── Name input ── */
  function onNameInput() {
    playerName = document.getElementById('player-name-input').value.trim();
    const modeVisible = document.getElementById('mode-select').style.display !== 'none';
    updateStartBtn();
  }

  function updateStartBtn() {
    const nameOk = playerName.length >= 2;
    let modeOk = true;
    if (gameMode === 'single') {
      modeOk = (selectedSingleStation >= 0 && selectedSingleStation < STATIONS.length);
    }
    // mode-select must be visible
    const modeShown = document.getElementById('mode-select').style.display !== 'none';
    document.getElementById('btn-start').disabled = !(nameOk && modeShown && modeOk);
  }

  /* ── Show mode selector after name ≥ 2 chars ── */
  function checkShowMode() {
    if (playerName.length >= 2) {
      document.getElementById('mode-select').style.display = 'block';
      buildStationPicker();
    } else {
      document.getElementById('mode-select').style.display = 'none';
    }
    updateStartBtn();
  }

  function buildStationPicker() {
    const grid = document.getElementById('station-pick-grid');
    if (grid.children.length > 0) return; // already built
    STATIONS.forEach((st, i) => {
      const card = document.createElement('div');
      card.className = 'spick-card';
      card.id = 'spick-' + i;
      card.style.setProperty('--sc', st.color);
      card.innerHTML = `<span class="spick-icon">${st.icon}</span><span class="spick-name">${st.title}</span>`;
      card.onclick = () => pickStation(i);
      grid.appendChild(card);
    });
  }

  function selectMode(mode) {
    gameMode = mode;
    document.getElementById('mode-full').classList.toggle('selected', mode === 'full');
    document.getElementById('mode-single').classList.toggle('selected', mode === 'single');
    const picker = document.getElementById('station-picker');
    picker.style.display = mode === 'single' ? 'block' : 'none';
    if (mode === 'full') updateStartBtn();
  }

  function pickStation(idx) {
    selectedSingleStation = idx;
    document.querySelectorAll('.spick-card').forEach((c, i) => {
      c.classList.toggle('selected', i === idx);
    });
    updateStartBtn();
  }

  /* ── Try start ── */
  function tryStart() {
    Audio7.init();
    if (playerName.length < 2) return;
    currentStation = gameMode === 'single' ? selectedSingleStation : 0;
    currentQ = 0;
    initS();
    showMissionBriefing();
  }

  /* ── Mission briefing ── */
  function showMissionBriefing() {
    const st = STATIONS[currentStation];
    document.getElementById('brief-icon').textContent    = st.icon;
    document.getElementById('brief-title').textContent   = st.title;
    document.getElementById('brief-sub').textContent     = st.subtitle;
    document.getElementById('brief-mission').textContent = st.mission;
    document.getElementById('brief-hint').textContent    = '💡 ' + st.hint_general;
    document.getElementById('brief-btn').style.background = st.color;
    document.getElementById('brief-btn').style.color = '#000';

    const dots = document.getElementById('station-dots');
    dots.innerHTML = '';
    if (gameMode === 'full') {
      STATIONS.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'sdot' + (i < currentStation ? ' done' : i === currentStation ? ' active' : '');
        d.style.setProperty('--sc', s.color);
        d.textContent = s.icon;
        dots.appendChild(d);
      });
    }
    showScreen('screen-brief');
  }

  /* ── Start station ── */
  function startStation() {
    Audio7.sfxLoad();
    const st = STATIONS[currentStation];
    document.getElementById('hud-player').textContent = playerName;
    document.getElementById('hud-station-name').textContent = st.title;
    document.getElementById('hud-station-name').style.color = st.color;
    showScreen('screen-game');
    loadQ();
  }

  /* ── Load question ── */
  function loadQ() {
    const st = STATIONS[currentStation];
    const q  = st.questions[currentQ];

    hintIndex = 0;
    S.wrongThisQ   = 0;
    S.disqualified = false;
    S.answered     = false;
    S.attempts     = 2;

    document.getElementById('hint-panel').classList.remove('open');
    document.getElementById('hint-btn').textContent  = '💡 גלו רמז';
    document.getElementById('hint-btn').disabled     = false;

    // HUD
    const totalQs   = gameMode === 'single' ? 10 : 60;
    const globalQ   = gameMode === 'single' ? currentQ + 1 : currentStation * 10 + currentQ + 1;
    document.getElementById('hud-q-num').textContent      = globalQ + ' / ' + totalQs;
    document.getElementById('hud-station-num').textContent = gameMode === 'single'
      ? (currentStation + 1) + ''
      : (currentStation + 1) + ' / 6';
    const pct = (globalQ - 1) / totalQs * 100;
    document.getElementById('hud-prog-fill').style.width = pct + '%';
    document.getElementById('hud-score').textContent  = S.totalScore;
    document.getElementById('hud-disq').textContent   = S.disqCount + '/8';

    // color
    document.documentElement.style.setProperty('--station-color', st.color);
    document.getElementById('riddle-box').style.borderTopColor = st.color;
    document.getElementById('q-station-badge').textContent     = st.icon + ' ' + st.subtitle;
    document.getElementById('q-station-badge').style.color     = st.color;
    document.getElementById('q-station-badge').style.borderColor = st.color;

    document.getElementById('q-scenario').textContent = q.scenario;
    document.getElementById('q-text').textContent     = q.text;

    renderHints(q.hints);

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

    const fb = document.getElementById('fb-box');
    fb.className = 'fb-box';
    fb.querySelector('.fb-lbl').textContent = '';
    fb.querySelector('.fb-txt').textContent = '';
    document.getElementById('btn-next').classList.remove('show');

    updateLights();

    clearInterval(S.tid);
    S.tv = 90;
    updateTimerDisplay();
    startTimer();
  }

  /* ── Hint system ── */
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
    const q = STATIONS[currentStation].questions[currentQ];
    const maxHints = Math.min(5, q.hints.length);
    if (hintIndex >= maxHints) return;
    const item = document.getElementById('hint-' + hintIndex);
    if (item) { item.classList.remove('locked'); item.innerHTML = '💡 ' + q.hints[hintIndex]; }
    hintIndex++;
    const btn = document.getElementById('hint-btn');
    if (hintIndex >= maxHints) { btn.textContent = '💡 כל הרמזים גלויים'; btn.disabled = true; }
    else { btn.textContent = '💡 רמז ' + (hintIndex + 1); }
    document.getElementById('hint-panel').classList.add('open');
  }

  function toggleHints() { revealNextHint(); }

  /* ── Timer ── */
  function startTimer() { S.tid = setInterval(tickTimer, 1000); }

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
    if (S.answered || S.disqualified) return;
    S.answered = true;
    Audio7.sfxTimeout();
    disableAll();
    const q = STATIONS[currentStation].questions[currentQ];
    showFB(false, '⏱ הזמן נגמר', q.explain);
    document.getElementById('btn-next').classList.add('show');
    S.totalWrong++;
    S.history.push(false);
  }

  /* ── Answer ── */
  function doAnswer(idx, btn) {
    if (S.answered || S.disqualified) return;
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
      // Wrong answer
      S.wrongThisQ++;
      S.attempts = 2 - S.wrongThisQ; // visual
      btn.classList.add('wrong');
      btn.disabled = true;
      Audio7.sfxWrong();
      document.getElementById('riddle-box').classList.add('shake');
      setTimeout(() => document.getElementById('riddle-box').classList.remove('shake'), 400);
      updateLights();

      if (S.wrongThisQ >= 2) {
        // ── DISQUALIFICATION ──
        S.disqualified = true;
        S.answered = true;
        clearInterval(S.tid);
        disableAll();
        S.totalWrong++;
        S.disqCount++;
        S.history.push(false);
        showFB(false, '🚫 שאלה נפסלה!', q.explain);
        document.getElementById('hud-disq').textContent = S.disqCount + '/8';
        document.getElementById('btn-next').classList.add('show');

        // Show disq modal after short delay
        setTimeout(() => {
          if (S.disqCount >= 8) {
            showGameOverModal();
          } else {
            showDisqModal();
          }
        }, 600);

      } else {
        showFB(false, '⚠️ תשובה שגויה — עוד ניסיון אחד!', 'בחרו תשובה אחרת.');
      }
    }
  }

  /* ── Disqualification modal ── */
  function showDisqModal() {
    const idx = Math.min(S.disqCount - 1, DISQ_MSGS.length - 1);
    const [headline, body] = DISQ_MSGS[idx];
    document.getElementById('disq-msg').innerHTML =
      '<strong>' + headline + '</strong><br>' + body;
    document.getElementById('disq-counter').textContent =
      S.disqCount + ' מתוך 8 שאלות נפסלו — עוד ' + (8 - S.disqCount) + ' ותפסידו!';
    document.getElementById('disq-modal').classList.add('open');
    Audio7.sfxWrong();
  }

  function closeDisqModal() {
    document.getElementById('disq-modal').classList.remove('open');
  }

  /* ── Game Over modal ── */
  function showGameOverModal() {
    const laughEl = document.getElementById('go-laughing');
    laughEl.innerHTML = '';
    // Animated laughing aliens
    for (let i = 0; i < 8; i++) {
      const span = document.createElement('span');
      span.textContent = ['👾','🛸','👽','🤖'][i % 4];
      span.className = 'laughing-alien';
      span.style.animationDelay = (i * 0.12) + 's';
      laughEl.appendChild(span);
    }
    // Invasion animation
    const invEl = document.getElementById('invasion-anim');
    invEl.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const row = document.createElement('div');
      row.className = 'invasion-row';
      row.style.animationDelay = (i * 0.2) + 's';
      for (let j = 0; j < 6; j++) {
        const a = document.createElement('span');
        a.textContent = j % 2 === 0 ? '👾' : '🛸';
        a.className = 'inv-alien';
        a.style.animationDelay = (j * 0.08 + i * 0.15) + 's';
        row.appendChild(a);
      }
      invEl.appendChild(row);
    }
    document.getElementById('gameover-modal').classList.add('open');
    Audio7.sfxLose();
  }

  function forceRestart() {
    document.getElementById('gameover-modal').classList.remove('open');
    restart();
  }

  /* ── Victory modal (aliens disappointed) ── */
  function showVictoryModal() {
    const vicEl = document.getElementById('vic-aliens');
    vicEl.innerHTML = '';
    // Sad/disappointed aliens walking away
    const sadAliens = ['😤','😤','👽','🛸','😡'];
    sadAliens.forEach((a, i) => {
      const span = document.createElement('span');
      span.textContent = a;
      span.className = 'sad-alien-walk';
      span.style.animationDelay = (i * 0.25) + 's';
      vicEl.appendChild(span);
    });
    document.getElementById('vic-score').textContent =
      'ניקוד: ' + S.totalScore + ' | ' + S.totalCorrect + ' תשובות נכונות';
    document.getElementById('victory-modal').classList.add('open');
    Audio7.sfxVictory();
  }

  function showFinalResult() {
    document.getElementById('victory-modal').classList.remove('open');
    renderResult();
    showScreen('screen-result');
  }

  /* ── Next question / station ── */
  function nextQ() {
    // Close disq modal if open
    document.getElementById('disq-modal').classList.remove('open');

    const stLen = STATIONS[currentStation].questions.length;
    currentQ++;

    if (gameMode === 'single') {
      if (currentQ >= stLen) {
        endGame();
      } else {
        loadQ();
      }
      return;
    }

    if (currentQ >= stLen) {
      currentQ = 0;
      showStationSuccess();
    } else {
      loadQ();
    }
  }

  /* ── Station success modal ── */
  function showStationSuccess() {
    clearInterval(S.tid);
    const st    = STATIONS[currentStation];
    const isLast = currentStation === STATIONS.length - 1;

    document.getElementById('modal-icon').textContent  = st.icon;
    document.getElementById('modal-msg').textContent   = st.success_msg;
    document.getElementById('modal-score').textContent = 'ניקוד מצטבר: ' + S.totalScore;
    document.getElementById('modal-btn').textContent   = isLast ? '🚀 לסיום המשימה!' : 'לתחנה הבאה ←';
    document.getElementById('modal-btn').style.background = st.color;

    const dots = document.getElementById('modal-dots');
    dots.innerHTML = '';
    STATIONS.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'sdot' + (i <= currentStation ? ' done' : '');
      d.style.setProperty('--sc', s.color);
      d.textContent = s.icon;
      dots.appendChild(d);
    });

    const overlay = document.getElementById('station-modal');
    overlay.style.setProperty('--modal-color', st.color);
    overlay.classList.add('open');
    Audio7.sfxVictory();
  }

  function proceedFromSuccess() {
    document.getElementById('station-modal').classList.remove('open');
    currentStation++;
    if (currentStation >= STATIONS.length) {
      endGame();
    } else {
      showMissionBriefing();
    }
  }

  /* ── End game ── */
  function endGame() {
    clearInterval(S.tid);
    const total = gameMode === 'single' ? 10 : STATIONS.length * 10;
    const pct   = Math.round(S.totalCorrect / total * 100);

    if (pct >= 80) {
      // Victory — show aliens disappointed
      showVictoryModal();
    } else {
      renderResult();
      Audio7.sfxLose();
      showScreen('screen-result');
    }
  }

  function renderResult() {
    const total = gameMode === 'single' ? 10 : STATIONS.length * 10;
    const pct   = Math.round(S.totalCorrect / total * 100);

    document.getElementById('res-title').textContent   = pct >= 80 ? '🎇 ניצחתם!' : '🎙️ המשימה הסתיימה';
    document.getElementById('res-player').textContent  = playerName;
    document.getElementById('res-correct').textContent = S.totalCorrect + ' / ' + total;
    document.getElementById('res-wrong').textContent   = S.totalWrong;
    document.getElementById('res-disq').textContent    = S.disqCount;
    document.getElementById('res-score').textContent   = S.totalScore;

    const fill = document.getElementById('res-fill');
    fill.style.width = '0%';
    fill.style.background = pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffaa00' : '#ff4444';
    setTimeout(() => { fill.style.width = pct + '%'; }, 100);
    document.getElementById('res-pct').textContent = pct + '%';
    document.getElementById('res-pct').style.color = pct >= 80 ? '#00ff88' : pct >= 50 ? '#ffaa00' : '#ff4444';
  }

  /* ── Helpers ── */
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
    // 2 lights = 2 allowed mistakes
    const remaining = 2 - S.wrongThisQ;
    document.querySelectorAll('.light').forEach((l, i) => {
      // show only 2 lights (index 0,1); index 2 always off
      if (i === 2) { l.style.display = 'none'; return; }
      l.classList.toggle('used', i >= remaining);
    });
  }

  /* ── Restart ── */
  function restart() {
    document.querySelectorAll('.generic-modal-overlay, .station-modal-overlay')
      .forEach(m => m.classList.remove('open'));
    document.getElementById('screen-result').classList.remove('victory');
    currentStation = 0; currentQ = 0;
    initS();
    document.getElementById('player-name-input').value = '';
    playerName = '';
    gameMode   = 'full';
    document.getElementById('btn-start').disabled = true;
    document.getElementById('mode-select').style.display = 'none';
    document.getElementById('mode-full').classList.remove('selected');
    document.getElementById('mode-single').classList.remove('selected');
    document.getElementById('station-picker').style.display = 'none';
    document.querySelectorAll('.spick-card').forEach(c => c.classList.remove('selected'));
    showScreen('screen-intro');
  }

  function shareResult() {
    const total = gameMode === 'single' ? 10 : STATIONS.length * 10;
    const pct   = Math.round(S.totalCorrect / total * 100);
    const txt   = playerName + ' השיג ' + pct + '% ב-STUDIO__8!\n' +
      'ניקוד: ' + S.totalScore + ' | ' + S.totalCorrect + '/' + total + ' נכונות 🎙️🚀';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => alert('הטקסט הועתק ללוח! 📋'));
    } else {
      prompt('העתיקו את הטקסט:', txt);
    }
  }

  /* ── Public API ── */
  return {
    onNameInput, checkShowMode, selectMode, pickStation,
    tryStart, startStation, nextQ,
    toggleHints,
    closeDisqModal, forceRestart,
    proceedFromSuccess, showFinalResult,
    restart, shareResult,
    getState, getPlayerName, getCurrentStation, getCurrentQ,
  };

})();

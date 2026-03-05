/* ================================================================
   STUDIO 7 — ESCAPE ROOM
   js/audio.js  —  Web Audio API engine
================================================================ */

const Audio7 = (() => {
  let AC = null;
  let mGain = null;
  let fGain = null;
  let mMuted = false;
  let fMuted = false;
  let mVol = 40;
  let fVol = 80;
  let bgLoop = null;
  let bgDrone = null;

  /* ---- Init ---- */
  function init() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
    AC = new (window.AudioContext || window.webkitAudioContext)();
    mGain = AC.createGain();
    fGain = AC.createGain();
    mGain.connect(AC.destination);
    fGain.connect(AC.destination);
    mGain.gain.value = mVol / 100;
    fGain.gain.value = fVol / 100;
    startBG();
  }

  /* ---- Background music ---- */
  function startBG() {
    const scale = [110, 130.8, 146.8, 164.8, 196, 220, 261.6, 293.7];
    let ni = 0;

    function note() {
      if (!AC) return;
      const o = AC.createOscillator();
      const g = AC.createGain();
      const f = AC.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 700;
      o.type = 'sine'; o.frequency.value = scale[ni % scale.length]; ni++;
      const t = AC.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.16, t + .35);
      g.gain.linearRampToValueAtTime(.1, t + 1.2);
      g.gain.linearRampToValueAtTime(0, t + 2.5);
      o.connect(f); f.connect(g); g.connect(mGain);
      o.start(t); o.stop(t + 2.6);
      bgLoop = setTimeout(note, 650 + Math.random() * 450);
    }

    bgDrone = AC.createOscillator();
    const de = AC.createGain();
    const df = AC.createBiquadFilter();
    df.type = 'lowpass'; df.frequency.value = 280;
    bgDrone.type = 'sawtooth'; bgDrone.frequency.value = 55;
    de.gain.value = .035;
    bgDrone.connect(df); df.connect(de); de.connect(mGain);
    bgDrone.start();
    note();
  }

  /* ---- SFX ---- */
  function sfxCorrect() {
    if (!AC) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      const t = AC.currentTime + i * .08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.28, t + .04);
      g.gain.exponentialRampToValueAtTime(.001, t + .48);
      o.connect(g); g.connect(fGain); o.start(t); o.stop(t + .5);
    });
  }

  function sfxWrong() {
    if (!AC) return;
    const o = AC.createOscillator(), g = AC.createGain(), d = AC.createWaveShaper();
    const c = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; c[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x)); }
    d.curve = c;
    o.type = 'sawtooth'; o.frequency.value = 120;
    g.gain.setValueAtTime(.38, AC.currentTime);
    g.gain.linearRampToValueAtTime(0, AC.currentTime + .33);
    o.connect(d); d.connect(g); g.connect(fGain);
    o.start(); o.stop(AC.currentTime + .36);
  }

  function sfxCombo() {
    if (!AC) return;
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'square'; o.frequency.value = freq;
      const t = AC.currentTime + i * .055;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.13, t + .03);
      g.gain.exponentialRampToValueAtTime(.001, t + .38);
      o.connect(g); g.connect(fGain); o.start(t); o.stop(t + .4);
    });
  }

  function sfxTick() {
    if (!AC) return;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = 'square'; o.frequency.value = 880;
    g.gain.setValueAtTime(.1, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .07);
    o.connect(g); g.connect(fGain); o.start(); o.stop(AC.currentTime + .08);
  }

  function sfxTimeout() {
    if (!AC) return;
    [440, 370, 293, 220, 146].forEach((freq, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq;
      const t = AC.currentTime + i * .13;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.22, t + .05);
      g.gain.exponentialRampToValueAtTime(.001, t + .52);
      o.connect(g); g.connect(fGain); o.start(t); o.stop(t + .55);
    });
  }

  function sfxLoad() {
    if (!AC) return;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(280, AC.currentTime);
    o.frequency.linearRampToValueAtTime(560, AC.currentTime + .11);
    g.gain.setValueAtTime(.13, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .18);
    o.connect(g); g.connect(fGain); o.start(); o.stop(AC.currentTime + .2);
  }

  function sfxVictory() {
    if (!AC) return;
    [523, 659, 784, 1047, 784, 880, 1047].forEach((freq, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'square'; o.frequency.value = freq;
      const t = AC.currentTime + i * .12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.18, t + .04);
      g.gain.exponentialRampToValueAtTime(.001, t + .48);
      o.connect(g); g.connect(fGain); o.start(t); o.stop(t + .5);
    });
  }

  function sfxLose() {
    if (!AC) return;
    [392, 349, 293, 220].forEach((freq, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq;
      const t = AC.currentTime + i * .17;
      g.gain.setValueAtTime(.18, t);
      g.gain.exponentialRampToValueAtTime(.001, t + .58);
      o.connect(g); g.connect(fGain); o.start(t); o.stop(t + .62);
    });
  }

  /* ---- Volume controls ---- */
  function setMusicVol(v) {
    mVol = parseInt(v);
    if (mGain && !mMuted) mGain.gain.value = mVol / 100;
    document.querySelectorAll('.mvl').forEach(el => el.textContent = mVol);
    document.querySelectorAll('.mv-slider').forEach(el => el.value = mVol);
  }

  function setFxVol(v) {
    fVol = parseInt(v);
    if (fGain && !fMuted) fGain.gain.value = fVol / 100;
    document.querySelectorAll('.fvl').forEach(el => el.textContent = fVol);
    document.querySelectorAll('.fv-slider').forEach(el => el.value = fVol);
  }

  function toggleMusicMute() {
    mMuted = !mMuted;
    if (mGain) mGain.gain.value = mMuted ? 0 : mVol / 100;
    document.querySelectorAll('.mm-btn').forEach(b => {
      b.textContent = mMuted ? 'UNMUTE' : 'MUTE';
      b.className = 'mute-btn mm-btn' + (mMuted ? ' muted' : '');
    });
  }

  function toggleFxMute() {
    fMuted = !fMuted;
    if (fGain) fGain.gain.value = fMuted ? 0 : fVol / 100;
    document.querySelectorAll('.fm-btn').forEach(b => {
      b.textContent = fMuted ? 'UNMUTE' : 'MUTE';
      b.className = 'mute-btn fm-btn' + (fMuted ? ' muted' : '');
    });
  }

  /* ---- Public API ---- */
  return {
    init,
    sfxCorrect, sfxWrong, sfxCombo,
    sfxTick, sfxTimeout, sfxLoad,
    sfxVictory, sfxLose,
    setMusicVol, setFxVol,
    toggleMusicMute, toggleFxMute,
  };
})();

/* ================================================================
   PROJECT EARTH-CAST — audio.js
   SFX בלבד — ללא מוזיקת רקע
================================================================ */

const Audio7 = (() => {
  let AC = null;
  let fGain = null;
  let fVol = 80;
  let fMuted = false;

  function init() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
    AC = new (window.AudioContext || window.webkitAudioContext)();
    fGain = AC.createGain();
    fGain.connect(AC.destination);
    fGain.gain.value = fVol / 100;
  }

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
    [523, 659, 784, 1047, 784, 880, 1047, 1319, 1047, 1319].forEach((freq, i) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = i % 2 === 0 ? 'square' : 'sine'; o.frequency.value = freq;
      const t = AC.currentTime + i * .1;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.22, t + .04);
      g.gain.exponentialRampToValueAtTime(.001, t + .55);
      o.connect(g); g.connect(fGain); o.start(t); o.stop(t + .6);
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

  function setFxVol(v) {
    fVol = parseInt(v);
    if (fGain && !fMuted) fGain.gain.value = fVol / 100;
    document.querySelectorAll('.fvl').forEach(el => el.textContent = fVol);
  }

  function toggleFxMute() {
    fMuted = !fMuted;
    if (fGain) fGain.gain.value = fMuted ? 0 : fVol / 100;
    document.querySelectorAll('.fm-btn').forEach(b => {
      b.textContent = fMuted ? 'UNMUTE' : 'MUTE';
      b.className = 'mute-btn fm-btn' + (fMuted ? ' muted' : '');
    });
  }

  return { init, sfxCorrect, sfxWrong, sfxTick, sfxTimeout, sfxLoad, sfxVictory, sfxLose, setFxVol, toggleFxMute };
})();

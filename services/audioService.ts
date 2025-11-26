
// Simple Web Audio API Synthesizer for Game Sounds
// No external assets required

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Generic tone generator
const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

export const playSuccess = () => {
  // High pitched "Ding"
  playTone(880, 'sine', 0.1, 0.1); // A5
  setTimeout(() => playTone(1760, 'sine', 0.3, 0.1), 100); // A6
};

export const playError = () => {
  // Low pitched "Buzz"
  playTone(150, 'sawtooth', 0.3, 0.1);
  setTimeout(() => playTone(100, 'sawtooth', 0.3, 0.1), 150);
};

export const playCoin = () => {
  // Quick coin sound
  playTone(1200, 'square', 0.1, 0.05);
  setTimeout(() => playTone(2000, 'square', 0.2, 0.05), 50);
};

export const playJump = () => {
  // Rising slide
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

export const playWin = () => {
  // Fanfare Arpeggio
  const now = getCtx().currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => { // C Major
    setTimeout(() => playTone(freq, 'triangle', 0.3, 0.1), i * 150);
  });
};

export const playLevelUp = () => {
    // Rising sequence
    playTone(440, 'sine', 0.1, 0.1);
    setTimeout(() => playTone(554, 'sine', 0.1, 0.1), 100);
    setTimeout(() => playTone(659, 'sine', 0.4, 0.1), 200);
};

export const playDamage = () => {
    playTone(100, 'square', 0.2, 0.2);
};

// NEW SOUNDS FOR JIHAD GAME

export const playSpirit = () => {
    // Soft, mystical swell for Dua/Prayer
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
};

export const playHappy = () => {
    // High pitched chirp for Smile
    playTone(1500, 'sine', 0.1, 0.1);
    setTimeout(() => playTone(2000, 'sine', 0.1, 0.1), 50);
};

export const playShield = () => {
    // Low, steady resonant sound for Patience
    playTone(200, 'triangle', 0.5, 0.2);
};

export const playHit = () => {
    // Impact sound
    playTone(150, 'sawtooth', 0.05, 0.2);
};

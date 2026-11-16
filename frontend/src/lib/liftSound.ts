let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.08) {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (ac.state === "suspended") void ac.resume();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(Math.max(gain, 0.001), ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration);
  } catch {
    /* audio is optional */
  }
}

export function playAccessGranted() {
  tone(523.25, 0.12, "sine", 0.06);
  setTimeout(() => tone(659.25, 0.18, "sine", 0.05), 80);
}

export function playAccessDenied() {
  tone(220, 0.25, "square", 0.04);
  setTimeout(() => tone(185, 0.35, "sawtooth", 0.03), 100);
}

export function playPulseTick() {
  tone(880, 0.04, "triangle", 0.02);
}

export function playSosPulse() {
  tone(140, 0.4, "sine", 0.05);
  setTimeout(() => tone(110, 0.5, "sine", 0.04), 180);
}

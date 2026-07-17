// Tiny WebAudio chiptune engine — square/triangle bleeps, no external assets.

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// ---- background music -------------------------------------------------------
// Drop `claude.mp3` into super-dule/public/ and it plays automatically, looped.
// Missing file is fine — the game just runs without music until it appears.
let musicEl: HTMLAudioElement | null = null;
let musicWanted = false;

export function startMusic() {
  musicWanted = true;
  if (!musicEl) {
    musicEl = new Audio("/claude.mp3");
    musicEl.loop = true;
    musicEl.volume = 0.35;
    musicEl.addEventListener("error", () => {
      musicEl = null; // not there yet — a later startMusic() retries
    });
  }
  if (!muted) musicEl.play().catch(() => {});
}

export function stopMusic() {
  musicWanted = false;
  musicEl?.pause();
}

export function toggleMute(): boolean {
  muted = !muted;
  if (muted) musicEl?.pause();
  else if (musicWanted) startMusic();
  return muted;
}
export function isMuted() {
  return muted;
}

type Note = [freq: number, start: number, dur: number, vol?: number];

function play(notes: Note[], type: OscillatorType = "square") {
  if (muted) return;
  try {
    const a = ac();
    const t0 = a.currentTime;
    for (const [freq, start, dur, vol = 0.08] of notes) {
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, t0 + start);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
      osc.connect(gain).connect(a.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.02);
    }
  } catch {
    /* audio unavailable — play silently on */
  }
}

export const sfx = {
  jump: () => play([[420, 0, 0.12], [640, 0.05, 0.12]]),
  coin: () => play([[988, 0, 0.07, 0.06], [1319, 0.07, 0.22, 0.06]]),
  stomp: () => play([[220, 0, 0.06], [160, 0.05, 0.1]], "triangle"),
  hurt: () =>
    play([[494, 0, 0.1], [392, 0.1, 0.1], [311, 0.2, 0.25]], "sawtooth"),
  die: () =>
    play([[523, 0, 0.12], [494, 0.12, 0.12], [440, 0.24, 0.12], [392, 0.36, 0.3], [196, 0.7, 0.4]]),
  clear: () =>
    play([
      [523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12],
      [1047, 0.36, 0.3], [784, 0.66, 0.12], [1047, 0.78, 0.45],
    ]),
  gameover: () =>
    play([[392, 0, 0.25], [311, 0.25, 0.25], [262, 0.5, 0.5], [131, 1.0, 0.7]], "triangle"),
  select: () => play([[660, 0, 0.06], [880, 0.06, 0.1]]),
  pause: () => play([[880, 0, 0.06], [660, 0.08, 0.06]]),
  tick: () => play([[1200, 0, 0.03, 0.05]]),
  kick: () => play([[300, 0, 0.05], [500, 0.04, 0.08]]),
};

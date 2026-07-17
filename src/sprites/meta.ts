// Content-bbox aspect ratios (w/h) computed from the source vectors at
// extraction time — used to size frames so nothing distorts and feet align.
export const SPRITE_ASPECT = {
  MarioIdle: 0.6621,
  MarioWalk1: 0.8525,
  MarioWalk2: 0.6583,
  MarioWalk3: 0.8009,
  MarioJumpStart: 0.8895,
  MarioJump: 1.3037,
  MarioJumpFinish: 0.754,
  Porcupine: 0.8938,
  PipeOne: 0.7845,
  PipeTwo: 0.8748,
  PipeThree: 0.8054,
} as const;

export type SpriteName = keyof typeof SPRITE_ASPECT;

// Direction each sprite faces as authored — verified with zoomed per-frame
// renders (?frames diagnostic): ALL Mario frames face right; porcupine left.
export const NATIVE_FACING: Record<SpriteName, 1 | -1> = {
  MarioIdle: 1,
  MarioWalk1: 1,
  MarioWalk2: 1,
  MarioWalk3: 1,
  MarioJumpStart: 1,
  MarioJump: 1,
  MarioJumpFinish: 1,
  Porcupine: -1,
  PipeOne: 1,
  PipeTwo: 1,
  PipeThree: 1,
};

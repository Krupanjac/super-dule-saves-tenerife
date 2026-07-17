// SUPER DULE game engine — fixed-axis AABB platformer physics.
import { GROUND_TOP, LEVELS, TILE, VIEW_H, VIEW_W, type LevelDef } from "./levels";

// ---- tuning -----------------------------------------------------------------
export const GRAV = 2600;
export const JUMP_V = 1050; // max feet rise ≈ 212px ≈ 4.4 tiles
const JUMP_CUT = 380; // vy clamp when jump released early (variable height)
const WALK = 280;
const RUN = 430;
const ACCEL = 1700;
const AIR_ACCEL = 1150;
const FRICTION = 2100;
const MAX_FALL = 1300;
const COYOTE = 0.09;
const JUMP_BUFFER = 0.12;
const ENEMY_V = 80;
const STOMP_BOUNCE = 560;
const STOMP_BOUNCE_HOLD = 900;

export const PLAYER_W = 42;
export const PLAYER_H = 82;
export const ENEMY_W = 52;
export const ENEMY_H = 50;
const COIN_R = 15;

// Visual pipe sprite is wider than its trunk (leaves overhang); collider insets.
export const PIPE_VISUAL_W = 110;
const PIPE_INSET_X = 14;

export interface Solid {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "ground" | "block" | "pipe";
  pipeKind?: 1 | 2 | 3;
}
export interface CoinEnt {
  id: number;
  x: number; // center
  y: number;
  taken: boolean;
}
export interface EnemyEnt {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  alive: boolean;
  squashT: number; // >0 while squashed, counts down then removed
  active: boolean;
}
export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  animT: number;
  coyoteT: number;
}
export type Status = "playing" | "dying" | "clear" | "gameover" | "victory";

export interface GameState {
  levelIx: number;
  level: LevelDef;
  solids: Solid[];
  coins: CoinEnt[];
  enemies: EnemyEnt[];
  player: Player;
  camX: number;
  score: number;
  coinCount: number;
  lives: number;
  time: number;
  status: Status;
  statusT: number; // time in current status
  combo: number; // stomp chain multiplier index
  jumpBufferT: number;
  jumpHeld: boolean;
  clearBonusDone: boolean;
  clearT0: number; // time remaining at the moment the goal was reached
  clearPaid: number; // bonus points already added to score
}

export interface Input {
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean; // held
  jumpPressed: boolean; // edge, consumed by engine
}

export type GameEvent =
  | "jump"
  | "coin"
  | "stomp"
  | "die"
  | "clear"
  | "gameover"
  | "victory"
  | "tick";

// ---- level construction -----------------------------------------------------
export function buildLevel(
  levelIx: number,
  carry?: { score: number; coinCount: number; lives: number },
): GameState {
  const level = LEVELS[levelIx];
  const solids: Solid[] = [];

  for (const [a, b] of level.ground) {
    solids.push({
      x: a * TILE,
      y: GROUND_TOP,
      w: (b - a + 1) * TILE,
      h: VIEW_H - GROUND_TOP + 200,
      kind: "ground",
    });
  }
  for (const [tx, ty, len] of level.platforms) {
    solids.push({ x: tx * TILE, y: ty * TILE, w: len * TILE, h: TILE, kind: "block" });
  }
  for (const p of level.pipes) {
    solids.push({
      x: p.tx * TILE + PIPE_INSET_X,
      y: GROUND_TOP - p.h,
      w: PIPE_VISUAL_W - PIPE_INSET_X * 2,
      h: p.h,
      kind: "pipe",
      pipeKind: p.kind,
    });
  }

  const coins: CoinEnt[] = level.coins.map(([tx, ty], i) => ({
    id: i,
    x: tx * TILE + TILE / 2,
    y: ty * TILE + TILE / 2,
    taken: false,
  }));

  const enemies: EnemyEnt[] = level.enemies.map((e, i) => ({
    id: i,
    x: e.tx * TILE,
    y: GROUND_TOP - ENEMY_H,
    w: ENEMY_W,
    h: ENEMY_H,
    vx: -ENEMY_V,
    minX: (e.tx - e.range) * TILE,
    maxX: (e.tx + e.range) * TILE + TILE,
    alive: true,
    squashT: 0,
    active: false,
  }));

  return {
    levelIx,
    level,
    solids,
    coins,
    enemies,
    player: {
      x: 2 * TILE,
      y: GROUND_TOP - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
      facing: 1,
      animT: 0,
      coyoteT: 0,
    },
    camX: 0,
    score: carry?.score ?? 0,
    coinCount: carry?.coinCount ?? 0,
    lives: carry?.lives ?? 3,
    time: level.timeLimit,
    status: "playing",
    statusT: 0,
    combo: 0,
    jumpBufferT: 0,
    jumpHeld: false,
    clearBonusDone: false,
    clearT0: 0,
    clearPaid: 0,
  };
}

// ---- collision helpers ------------------------------------------------------
function overlaps(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/**
 * Move a box along one axis and clip against solids. Returns hit flags.
 * "block" solids are one-way platforms: passable from below/sides, solid only
 * when landing from above — no head bonks under bridges.
 */
function moveAxis(
  ent: { x: number; y: number; w: number; h: number },
  solids: Solid[],
  d: number,
  axis: "x" | "y",
): { hitNeg: boolean; hitPos: boolean } {
  const res = { hitNeg: false, hitPos: false };
  const prevBottom = ent.y + ent.h;
  ent[axis] += d;
  for (const s of solids) {
    if (!overlaps(ent.x, ent.y, ent.w, ent.h, s.x, s.y, s.w, s.h)) continue;
    if (s.kind === "block") {
      const landing = axis === "y" && d > 0 && prevBottom <= s.y + 1;
      if (!landing) continue;
    }
    if (axis === "x") {
      if (d > 0) {
        ent.x = s.x - ent.w;
        res.hitPos = true;
      } else if (d < 0) {
        ent.x = s.x + s.w;
        res.hitNeg = true;
      }
    } else {
      if (d > 0) {
        ent.y = s.y - ent.h;
        res.hitPos = true;
      } else if (d < 0) {
        ent.y = s.y + s.h;
        res.hitNeg = true;
      }
    }
  }
  return res;
}

// ---- main step --------------------------------------------------------------
export function step(
  st: GameState,
  input: Input,
  dt: number,
  emit: (e: GameEvent) => void,
): void {
  st.statusT += dt;
  const p = st.player;

  if (st.status === "dying") {
    // death leap: no collisions, fall off screen
    p.vy = Math.min(p.vy + GRAV * dt, MAX_FALL);
    p.y += p.vy * dt;
    return;
  }
  if (st.status === "clear") {
    // drain remaining time into score as a bonus (10 pts per second)
    if (!st.clearBonusDone) {
      st.time = Math.max(0, st.time - dt * 120);
      const paid = Math.round((st.clearT0 - st.time)) * 10;
      st.score += paid - st.clearPaid;
      st.clearPaid = paid;
      if (st.time <= 0) st.clearBonusDone = true;
    }
    // settle player to the ground during celebration
    p.vy = Math.min(p.vy + GRAV * dt, MAX_FALL);
    moveAxis(p, st.solids, p.vy * dt, "y");
    return;
  }
  if (st.status !== "playing") return;

  // ---- timer
  const prevTime = Math.ceil(st.time);
  st.time -= dt;
  if (Math.ceil(st.time) < prevTime && st.time <= 60 && st.time > 0) emit("tick");
  if (st.time <= 0) {
    kill(st, emit);
    return;
  }

  // ---- horizontal control
  const target = (input.left ? -1 : input.right ? 1 : 0) * (input.run ? RUN : WALK);
  const accel = p.onGround ? (target === 0 ? FRICTION : ACCEL) : AIR_ACCEL;
  if (p.vx < target) p.vx = Math.min(p.vx + accel * dt, target);
  else if (p.vx > target) p.vx = Math.max(p.vx - accel * dt, target);
  if (input.left) p.facing = -1;
  else if (input.right) p.facing = 1;

  // ---- jumping: buffer + coyote time
  st.jumpBufferT = input.jumpPressed ? JUMP_BUFFER : Math.max(0, st.jumpBufferT - dt);
  input.jumpPressed = false;
  p.coyoteT = p.onGround ? COYOTE : Math.max(0, p.coyoteT - dt);
  if (st.jumpBufferT > 0 && p.coyoteT > 0) {
    p.vy = -JUMP_V;
    p.onGround = false;
    p.coyoteT = 0;
    st.jumpBufferT = 0;
    emit("jump");
  }
  // variable jump height
  if (!input.jump && p.vy < -JUMP_CUT) p.vy = -JUMP_CUT;

  // ---- integrate + collide
  p.vy = Math.min(p.vy + GRAV * dt, MAX_FALL);
  const hx = moveAxis(p, st.solids, p.vx * dt, "x");
  if (hx.hitNeg || hx.hitPos) p.vx = 0;
  const hy = moveAxis(p, st.solids, p.vy * dt, "y");
  if (hy.hitPos) {
    p.onGround = true;
    p.vy = 0;
    st.combo = 0;
  } else {
    if (p.vy !== 0) p.onGround = false;
    if (hy.hitNeg) p.vy = 0; // head bump
  }
  p.x = Math.max(0, Math.min(p.x, st.level.widthTiles * TILE - p.w));
  p.animT += Math.abs(p.vx) > 20 ? dt * (Math.abs(p.vx) / WALK) : 0;

  // ---- pit death
  if (p.y > VIEW_H + 60) {
    kill(st, emit);
    return;
  }

  // ---- enemies
  for (const e of st.enemies) {
    if (!e.alive) continue;
    if (e.squashT > 0) {
      e.squashT -= dt;
      if (e.squashT <= 0) e.alive = false;
      continue;
    }
    if (!e.active) {
      if (e.x < st.camX + VIEW_W + 120) e.active = true;
      else continue;
    }
    const ex = moveAxis(e, st.solids, e.vx * dt, "x");
    if (ex.hitNeg || ex.hitPos) e.vx = -e.vx;
    if (e.x <= e.minX) {
      e.x = e.minX;
      e.vx = Math.abs(e.vx);
    } else if (e.x + e.w >= e.maxX) {
      e.x = e.maxX - e.w;
      e.vx = -Math.abs(e.vx);
    }
    e.y = GROUND_TOP - e.h; // patrol ranges are always on ground segments

    // ---- player contact
    if (overlaps(p.x, p.y, p.w, p.h, e.x + 6, e.y + 6, e.w - 12, e.h - 6)) {
      const falling = p.vy > 80;
      const above = p.y + p.h < e.y + e.h * 0.6;
      if (falling && above) {
        e.squashT = 0.45;
        st.combo = Math.min(st.combo + 1, 4);
        st.score += 100 * Math.pow(2, st.combo - 1);
        p.vy = -(input.jump ? STOMP_BOUNCE_HOLD : STOMP_BOUNCE);
        p.onGround = false;
        emit("stomp");
      } else {
        kill(st, emit);
        return;
      }
    }
  }

  // ---- coins
  for (const c of st.coins) {
    if (c.taken) continue;
    if (
      overlaps(p.x, p.y, p.w, p.h, c.x - COIN_R, c.y - COIN_R, COIN_R * 2, COIN_R * 2)
    ) {
      c.taken = true;
      st.coinCount += 1;
      st.score += 200;
      if (st.coinCount % 100 === 0) st.lives += 1;
      emit("coin");
    }
  }

  // ---- goal
  const goalX = st.level.goalTx * TILE;
  if (p.x + p.w > goalX + 8 && st.status === "playing") {
    st.status = "clear";
    st.statusT = 0;
    st.clearT0 = st.time;
    st.clearPaid = 0;
    p.vx = 0;
    emit("clear");
  }

  // ---- camera
  const targetCam = p.x + p.w / 2 - VIEW_W * 0.42;
  st.camX = Math.max(0, Math.min(targetCam, st.level.widthTiles * TILE - VIEW_W));
}

function kill(st: GameState, emit: (e: GameEvent) => void) {
  st.lives -= 1;
  st.status = "dying";
  st.statusT = 0;
  st.player.vy = -750;
  st.player.vx = 0;
  emit("die");
}

/** Called by the UI when the dying animation has played out. */
export function afterDeath(st: GameState): "respawn" | "gameover" {
  return st.lives > 0 ? "respawn" : "gameover";
}

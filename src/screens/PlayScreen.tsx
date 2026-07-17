import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildLevel, step, PIPE_VISUAL_W,
  type GameState, type GameEvent, type Player,
} from "../game/engine";
import { GROUND_TOP, LEVELS, TILE, VIEW_H, VIEW_W } from "../game/levels";
import { Sprite, PipeSprite } from "../components/Sprite";
import { Coin, GoalFlag } from "../components/Coin";
import { Hud } from "../components/Hud";
import { isMuted, sfx, toggleMute } from "../game/audio";
import { useInput } from "../hooks/useInput";
import type { SpriteName } from "../sprites/meta";

const MARIO_VIS_H = 94;
const ENEMY_VIS_H = 58;
const WALK_FRAMES: SpriteName[] = ["MarioWalk1", "MarioWalk2", "MarioWalk3", "MarioWalk2"];

function marioFrame(p: Player): SpriteName {
  if (!p.onGround) {
    if (p.vy < -150) return "MarioJumpStart";
    if (p.vy > 250) return "MarioJumpFinish";
    return "MarioJump";
  }
  if (Math.abs(p.vx) > 20) return WALK_FRAMES[Math.floor(p.animT * 9) % 4];
  return "MarioIdle";
}

export function PlayScreen({
  startLevel,
  onExit,
}: {
  startLevel: number;
  onExit: () => void;
}) {
  const stateRef = useRef<GameState>(buildLevel(startLevel));
  const pausedRef = useRef(false);
  const input = useInput();
  const [, setTick] = useState(0);
  const [muted, setMuted] = useState(isMuted());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    stateRef.current = buildLevel(startLevel);
    let raf = 0;
    let last = performance.now();

    const emit = (e: GameEvent) => {
      if (e === "jump") sfx.jump();
      else if (e === "coin") sfx.coin();
      else if (e === "stomp") sfx.stomp();
      else if (e === "die") sfx.die();
      else if (e === "clear") sfx.clear();
      else if (e === "tick") sfx.tick();
    };

    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 1 / 30);
      last = t;
      const st = stateRef.current;
      const keys = input.current;

      if (keys.mutePressed) {
        keys.mutePressed = false;
        setMuted(toggleMute());
      }
      if (keys.pausePressed) {
        keys.pausePressed = false;
        if (st.status === "playing") {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
          sfx.pause();
        }
      }

      if (!pausedRef.current) {
        step(st, keys, dt, emit);

        // post-status transitions
        if (st.status === "dying" && st.statusT > 1.8) {
          if (st.lives > 0) {
            stateRef.current = buildLevel(st.levelIx, {
              score: st.score,
              coinCount: st.coinCount,
              lives: st.lives,
            });
          } else {
            st.status = "gameover";
            st.statusT = 0;
            sfx.gameover();
          }
        } else if (st.status === "clear" && st.clearBonusDone && st.statusT > 3.4) {
          if (st.levelIx + 1 < LEVELS.length) {
            stateRef.current = buildLevel(st.levelIx + 1, {
              score: st.score,
              coinCount: st.coinCount,
              lives: st.lives,
            });
          } else {
            st.status = "victory";
            st.statusT = 0;
            sfx.clear();
          }
        } else if (
          (st.status === "gameover" || st.status === "victory") &&
          keys.startPressed
        ) {
          onExit();
        }
      }
      keys.startPressed = false;
      if (import.meta.env.DEV) {
        (window as unknown as Record<string, unknown>).__dule = stateRef.current;
      }
      setTick((k) => k + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLevel]);

  const st = stateRef.current;
  const { level, player: p, camX } = st;
  const theme = level.theme;
  const groundBottomH = VIEW_H - GROUND_TOP;

  // static world geometry — rebuilt only when the level changes
  const staticWorld = useMemo(() => {
    return (
      <>
        {level.ground.map(([a, b], i) => (
          <div
            key={`g${i}`}
            className="ground"
            style={{
              left: a * TILE,
              width: (b - a + 1) * TILE,
              top: GROUND_TOP,
              height: groundBottomH,
              background: theme.ground,
              borderTop: `6px solid ${theme.groundEdge}`,
              backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent ${TILE - 2}px, rgba(0,0,0,0.35) ${TILE - 2}px, rgba(0,0,0,0.35) ${TILE}px), repeating-linear-gradient(0deg, transparent 0, transparent ${TILE - 2}px, rgba(0,0,0,0.35) ${TILE - 2}px, rgba(0,0,0,0.35) ${TILE}px)`,
            }}
          />
        ))}
        {level.platforms.map(([tx, ty, len], i) => (
          <div
            key={`p${i}`}
            className="block-row"
            style={{
              left: tx * TILE,
              top: ty * TILE,
              width: len * TILE,
              height: TILE,
              background: theme.block,
              boxShadow: `inset 0 6px 0 ${theme.blockEdge}, inset 0 -6px 0 rgba(0,0,0,0.45), 5px 5px 0 rgba(0,0,0,0.45)`,
              backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent ${TILE - 3}px, rgba(0,0,0,0.5) ${TILE - 3}px, rgba(0,0,0,0.5) ${TILE}px)`,
            }}
          />
        ))}
        {level.pipes.map((pipe, i) => (
          <div
            key={`pi${i}`}
            style={{
              position: "absolute",
              left: pipe.tx * TILE,
              top: GROUND_TOP - pipe.h,
              zIndex: 3,
            }}
          >
            <PipeSprite kind={pipe.kind} w={PIPE_VISUAL_W} h={pipe.h} />
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: level.goalTx * TILE,
            top: GROUND_TOP - 300,
            zIndex: 2,
          }}
        >
          <GoalFlag h={300} />
        </div>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const frame = marioFrame(p);
  const visW = MARIO_VIS_H; // container is sized by Sprite itself; wrapper centers
  const inView = (x: number) => x > camX - 250 && x < camX + VIEW_W + 250;

  const BG_W = Math.round(VIEW_W * 1.45);
  const maxCam = Math.max(1, level.widthTiles * TILE - VIEW_W);
  const bgX = -(Math.min(camX, maxCam) / maxCam) * (BG_W - VIEW_W);

  return (
    <div className="arcade-frame">
      <Hud
        score={st.score}
        coins={st.coinCount}
        world={level.world}
        time={st.time}
        lives={st.lives}
        muted={muted}
      />

      <div
        className="viewport"
        style={{
          width: VIEW_W,
          height: VIEW_H,
          backgroundImage: `url(${level.bg})`,
          // one zoomed image spanning the whole level: pans from its left edge
          // at the start to its right edge exactly at the goal — never repeats
          backgroundSize: `${BG_W}px auto`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `${bgX}px 40%`,
        }}
      >
        <div
          className="world"
          style={{
            width: level.widthTiles * TILE,
            height: VIEW_H,
            transform: `translate3d(${-Math.round(camX)}px, 0, 0)`,
          }}
        >
          {staticWorld}

          {st.coins.map(
            (c) =>
              !c.taken &&
              inView(c.x) && (
                <div
                  key={`c${c.id}`}
                  style={{ position: "absolute", left: c.x - 17, top: c.y - 17, zIndex: 4 }}
                >
                  <Coin size={34} />
                </div>
              ),
          )}

          {st.enemies.map(
            (e) =>
              e.alive &&
              inView(e.x) && (
                <div
                  key={`e${e.id}`}
                  style={{
                    position: "absolute",
                    left: e.x + e.w / 2 - (ENEMY_VIS_H * 0.8938) / 2,
                    top: e.y + e.h - ENEMY_VIS_H,
                    zIndex: 5,
                    transform: e.squashT > 0 ? "scaleY(0.35) translateY(95%)" : undefined,
                    transformOrigin: "bottom center",
                  }}
                >
                  <Sprite name="Porcupine" h={ENEMY_VIS_H} facing={e.vx > 0 ? 1 : -1} />
                </div>
              ),
          )}

          <div
            className={st.status === "dying" ? "mario-dying" : undefined}
            style={{
              position: "absolute",
              left: p.x + p.w / 2 - visW / 2,
              top: p.y + p.h - MARIO_VIS_H,
              width: visW,
              height: MARIO_VIS_H,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              zIndex: 6,
            }}
          >
            <Sprite name={frame} h={MARIO_VIS_H} facing={p.facing} />
          </div>
        </div>

        {/* overlays */}
        {st.status === "playing" && st.statusT < 1.4 && (
          <div className="overlay transparent">
            <div className="world-card">
              <div className="world-card-label">WORLD {level.world}</div>
              <div className="world-card-name">{level.name}</div>
            </div>
          </div>
        )}
        {paused && (
          <div className="overlay">
            <div className="overlay-title">PAUSED</div>
            <div className="overlay-sub blink">PRESS P TO RESUME</div>
          </div>
        )}
        {st.status === "clear" && (
          <div className="overlay transparent">
            <div className="world-card">
              <div className="world-card-label">STAGE CLEAR!</div>
              <div className="world-card-name">TIME BONUS +{st.clearPaid}</div>
              {st.clearBonusDone && (
                <div className="overlay-sub">
                  {st.levelIx + 1 < LEVELS.length
                    ? `GET READY FOR WORLD ${LEVELS[st.levelIx + 1].world}`
                    : "FINAL STAGE COMPLETE!"}
                </div>
              )}
            </div>
          </div>
        )}
        {st.status === "gameover" && (
          <div className="overlay">
            <div className="overlay-title red">GAME OVER</div>
            <div className="overlay-sub">FINAL SCORE {String(st.score).padStart(6, "0")}</div>
            <div className="overlay-sub blink">PRESS START</div>
          </div>
        )}
        {st.status === "victory" && (
          <div className="overlay">
            <div className="overlay-title gold">YOU WIN!</div>
            <div className="overlay-sub">SUPER DULE SAVED TENERIFE</div>
            <div className="overlay-sub">
              SCORE {String(st.score).padStart(6, "0")} · COINS ×{st.coinCount}
            </div>
            <div className="overlay-sub blink">PRESS START</div>
          </div>
        )}
      </div>

      <div className="footer-bar">
        <span>←→ MOVE</span>
        <span>SHIFT RUN</span>
        <span>SPACE JUMP</span>
        <span>P PAUSE</span>
        <span>M MUTE</span>
      </div>
    </div>
  );
}

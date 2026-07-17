import { useEffect } from "react";
import { Sprite } from "../components/Sprite";
import { Coin } from "../components/Coin";
import { sfx } from "../game/audio";

export function TitleScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        sfx.select();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <div className="screen title-screen" onClick={() => { sfx.select(); onStart(); }}>
      <div className="title-glow" />
      <div className="title-badge">© 2026 TENERIFE ARCADE</div>
      <h1 className="title-logo">
        SUPER <span className="title-dule">DULE</span> BROS
      </h1>
      <div className="title-sub">A BALD MARIO ADVENTURE</div>

      <div className="title-stage">
        <div className="title-cast">
          <div className="title-coin-row">
            <Coin size={30} /><Coin size={30} /><Coin size={30} />
          </div>
          <Sprite name="MarioIdle" h={150} />
        </div>
        <div className="title-vs">VS</div>
        <div className="title-cast">
          <Sprite name="Porcupine" h={110} facing={-1} />
        </div>
      </div>
      <div className="title-ground" />

      <div className="insert-coin blink">INSERT COIN — PRESS START TO PLAY</div>
      <div className="title-controls">
        ARROWS / WASD MOVE · SHIFT RUN · SPACE JUMP · P PAUSE · M MUTE
      </div>
    </div>
  );
}

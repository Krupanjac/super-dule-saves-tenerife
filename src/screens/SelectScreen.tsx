import { useEffect, useState } from "react";
import { LEVELS } from "../game/levels";
import { sfx } from "../game/audio";

export function SelectScreen({ onSelect }: { onSelect: (ix: number) => void }) {
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        setCursor((c) => (c + 1) % LEVELS.length);
        sfx.tick();
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        setCursor((c) => (c + LEVELS.length - 1) % LEVELS.length);
        sfx.tick();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        setCursor((c) => (c + 2) % LEVELS.length);
        sfx.tick();
      } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        setCursor((c) => (c + 2) % LEVELS.length);
        sfx.tick();
      } else if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        sfx.select();
        onSelect(cursor);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, onSelect]);

  return (
    <div className="screen select-screen">
      <div className="select-header">
        <div className="select-title">SELECT YOUR STAGE</div>
        <div className="select-sub">PICK A BACKDROP FOR YOUR BALD MARIO ADVENTURE</div>
      </div>
      <div className="insert-bar">
        <span className="blink">INSERT COIN — PRESS START TO PLAY</span>
      </div>
      <div className="select-grid">
        {LEVELS.map((lv, ix) => (
          <button
            key={lv.world}
            className={`stage-card${ix === cursor ? " focused" : ""}`}
            style={{ backgroundImage: `url(${lv.bg})` }}
            onMouseEnter={() => setCursor(ix)}
            onClick={() => {
              sfx.select();
              onSelect(ix);
            }}
          >
            <div className="stage-badge">STAGE {lv.world}</div>
            <div className="stage-footer">
              <div className="stage-name">{lv.name}</div>
              <div className="stage-select-btn">
                SELECT <span className="stage-arrow">▶</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

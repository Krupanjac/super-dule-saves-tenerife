import { useState } from "react";
import { startMusic } from "./game/audio";
import { TitleScreen } from "./screens/TitleScreen";
import { SelectScreen } from "./screens/SelectScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { useScale } from "./hooks/useScale";
import { VIEW_W } from "./game/levels";

// arcade frame = viewport + HUD + footer + borders
const FRAME_W = VIEW_W + 24;
const FRAME_H = 576 + 88 + 46 + 24;

type Screen =
  | { kind: "title" }
  | { kind: "select" }
  | { kind: "play"; level: number; session: number };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "title" });
  const scale = useScale(FRAME_W + 40, FRAME_H + 40);

  return (
    <div className="app-root">
      <div className="app-scaler" style={{ transform: `scale(${scale})` }}>
        {screen.kind === "title" && (
          <TitleScreen
            onStart={() => {
              startMusic(); // user gesture — autoplay policy satisfied
              setScreen({ kind: "select" });
            }}
          />
        )}
        {screen.kind === "select" && (
          <SelectScreen
            onSelect={(level) =>
              setScreen({ kind: "play", level, session: Date.now() })
            }
          />
        )}
        {screen.kind === "play" && (
          <PlayScreen
            key={screen.session}
            startLevel={screen.level}
            onExit={() => setScreen({ kind: "title" })}
          />
        )}
      </div>
    </div>
  );
}

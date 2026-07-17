// HUD replicating the "Game Flow Preview" mockups: MARIO / COINS / WORLD / TIME / LIVES.

interface HudProps {
  score: number;
  coins: number;
  world: string;
  time: number;
  lives: number;
  muted: boolean;
}

function Cell({ label, value, align }: { label: string; value: string; align?: "center" | "end" }) {
  return (
    <div className="hud-cell" style={{ alignItems: align === "end" ? "flex-end" : align === "center" ? "center" : "flex-start" }}>
      <div className="hud-label">{label}</div>
      <div className="hud-value">{value}</div>
    </div>
  );
}

export function Hud({ score, coins, world, time, lives, muted }: HudProps) {
  return (
    <div className="hud">
      <div className="hud-group">
        <Cell label="MARIO" value={String(score).padStart(6, "0")} />
        <Cell label="COINS" value={`×${String(coins).padStart(2, "0")}`} />
      </div>
      <div className="hud-group">
        <Cell label="WORLD" value={world} align="center" />
        <Cell label="TIME" value={String(Math.max(0, Math.ceil(time)))} align="center" />
      </div>
      <div className="hud-group">
        <Cell label="LIVES" value={`×${lives}`} align="end" />
        {muted && <div className="hud-muted">MUTED</div>}
      </div>
    </div>
  );
}

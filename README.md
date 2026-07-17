# SUPER DULE BROS — Super Dule Saves Tenerife 🌋

A Super Mario–style arcade platformer built in React, starring **Bald Mario (Dule)**
on a quest across Tenerife. All character, enemy, and pipe art are hand-made
vectors exported from Figma via [Wonder](https://wonder.so); the game engine,
levels, and arcade UI were built around them.

## Play

```bash
npm install
npm run dev
```

Open the printed localhost URL, press START, pick a stage.

| Action | Keys |
| --- | --- |
| Move | ← → or A / D |
| Run | Shift or X |
| Jump | Space / ↑ / W / Z |
| Pause | P / Esc |
| Mute | M |

## The campaign

Four stages across Tenerife, each with its own backdrop and theme:

1. **1-1 MOONLIT CRATER** — Teide by night
2. **1-2 SUNSET TOWN** — coastal village at dusk
3. **1-3 JUNGLE ZONE** — Anaga forest, pipe country
4. **1-4 VOLCANO BAY** — the final gauntlet

Stomp hairy porcupines (chain stomps for combo score), grab D-coins
(100 coins = extra life), beat the timer, reach the GOAL flag. Clearing 1-4
saves Tenerife.

## Tech

- React 19 + TypeScript + Vite
- All sprites are inline SVG vector components (no sprite sheets) with
  per-frame calibrated bounding boxes and facing metadata
- Fixed-axis AABB physics: coyote time, jump buffering, variable jump height,
  one-way bridge platforms, stomp combos
- WebAudio chiptune SFX plus a looping background track (`public/claude.mp3`)
- Every level is verified completable end-to-end by an automated Playwright bot

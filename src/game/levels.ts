// Level definitions for SUPER DULE. Coordinates are in tiles (48px).
// Rows: 0 (top) … 11 (bottom). Ground top sits at row 10 (y = 480px).

export const TILE = 48;
export const VIEW_W = 1024;
export const VIEW_H = 576;
export const GROUND_TOP = 480; // y of walkable ground surface

export type PipeKind = 1 | 2 | 3;

export interface PipeDef {
  tx: number; // left tile of pipe
  kind: PipeKind;
  h: number; // visual height in px, sits on ground
}

export interface EnemyDef {
  tx: number; // spawn tile
  range: number; // patrol half-range in tiles
}

export interface LevelDef {
  world: string;
  name: string;
  bg: string;
  theme: { ground: string; groundEdge: string; block: string; blockEdge: string };
  widthTiles: number;
  /** inclusive [from, to] tile spans that have ground; gaps are pits */
  ground: [number, number][];
  /** floating blocks: [tx, ty, length] — ty is the row of the block */
  platforms: [number, number, number][];
  pipes: PipeDef[];
  /** coin positions [tx, ty] (centered in tile) */
  coins: [number, number][];
  enemies: EnemyDef[];
  goalTx: number;
  timeLimit: number;
}

/** helper: horizontal run of coins */
function row(tx: number, ty: number, n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => [tx + i, ty] as [number, number]);
}
/** helper: arc of coins over a pit */
function arc(tx: number, ty: number, n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const lift = Math.round(Math.sin(t * Math.PI) * 1.6);
    return [tx + i, ty - lift] as [number, number];
  });
}

export const LEVELS: LevelDef[] = [
  {
    world: "1-1",
    name: "MOONLIT CRATER",
    bg: "/bg/moonlit-crater.jpg",
    theme: { ground: "#1c2340", groundEdge: "#3d4d86", block: "#2b3565", blockEdge: "#6b7fd4" },
    widthTiles: 92,
    ground: [
      [0, 25],
      [28, 45],
      [48, 70],
      [73, 91],
    ],
    platforms: [
      [10, 7, 3],
      [18, 6, 3],
      [31, 6, 4],
      [42, 7, 3],
      [52, 6, 3],
      [55, 4, 3],
      [66, 7, 2],
      [78, 6, 3],
    ],
    pipes: [
      { tx: 14, kind: 1, h: 110 },
      { tx: 21, kind: 2, h: 140 },
      { tx: 39, kind: 3, h: 120 },
      { tx: 62, kind: 1, h: 150 },
    ],
    coins: [
      ...row(10, 5, 3),
      ...row(18, 4, 3),
      ...arc(25, 8, 4),
      ...row(31, 4, 4),
      ...arc(45, 8, 4),
      ...row(55, 2, 3),
      ...arc(70, 8, 4),
      ...row(78, 4, 3),
    ],
    enemies: [
      { tx: 12, range: 3 },
      { tx: 19, range: 3 },
      { tx: 34, range: 2 },
      { tx: 53, range: 2 },
      { tx: 58, range: 4 },
      { tx: 76, range: 3 },
    ],
    goalTx: 87,
    timeLimit: 300,
  },
  {
    world: "1-2",
    name: "SUNSET TOWN",
    bg: "/bg/sunset-town.jpg",
    theme: { ground: "#4a2b1a", groundEdge: "#8a5a2e", block: "#6b3d1e", blockEdge: "#c07a3a" },
    widthTiles: 96,
    ground: [
      [0, 17],
      [21, 34],
      [38, 52],
      [56, 74],
      [78, 95],
    ],
    platforms: [
      [8, 7, 3],
      [18, 7, 3], // bridge over pit 18-20
      [26, 6, 3],
      [35, 7, 3], // bridge over pit 35-37
      [43, 6, 3],
      [45, 3, 3],
      [60, 7, 3],
      [68, 5, 3],
      [82, 6, 4],
    ],
    pipes: [
      { tx: 12, kind: 2, h: 130 },
      { tx: 24, kind: 1, h: 150 },
      { tx: 46, kind: 3, h: 130 },
      { tx: 65, kind: 2, h: 150 },
      { tx: 86, kind: 1, h: 130 },
    ],
    coins: [
      ...row(8, 5, 3),
      ...row(18, 5, 3),
      ...row(26, 4, 3),
      ...row(35, 4, 3),
      ...row(45, 1, 3),
      ...arc(53, 8, 3),
      ...row(60, 5, 3),
      ...row(68, 3, 3),
      ...arc(75, 8, 3),
      ...row(82, 4, 4),
    ],
    enemies: [
      { tx: 10, range: 3 },
      { tx: 28, range: 2 },
      { tx: 42, range: 3 },
      { tx: 62, range: 3 },
      { tx: 70, range: 3 },
      { tx: 82, range: 3 },
    ],
    goalTx: 91,
    timeLimit: 300,
  },
  {
    world: "1-3",
    name: "JUNGLE ZONE",
    bg: "/bg/jungle-zone.jpg",
    theme: { ground: "#16301c", groundEdge: "#2f6b38", block: "#24512b", blockEdge: "#62aa33" },
    widthTiles: 100,
    ground: [
      [0, 14],
      [18, 32],
      [36, 49],
      [53, 66],
      [70, 84],
      [87, 99],
    ],
    platforms: [
      [15, 7, 3], // bridge over pit 15-17
      [22, 6, 2],
      [33, 7, 3], // bridge over pit 33-35
      [40, 5, 2],
      [50, 7, 3], // bridge over pit 50-52
      [57, 6, 2],
      [57, 4, 2],
      [67, 7, 3], // bridge over pit 67-69
      [74, 5, 3],
      [84, 7, 3], // bridge over pit 85-86
      [90, 5, 3],
    ],
    pipes: [
      { tx: 6, kind: 1, h: 120 },
      { tx: 9, kind: 2, h: 160 },
      { tx: 26, kind: 3, h: 140 },
      { tx: 30, kind: 1, h: 190 },
      { tx: 44, kind: 2, h: 150 },
      { tx: 55, kind: 3, h: 130 },
      { tx: 59, kind: 1, h: 170 },
      { tx: 78, kind: 2, h: 140 },
      { tx: 82, kind: 3, h: 190 },
      { tx: 93, kind: 1, h: 140 },
    ],
    coins: [
      ...arc(15, 5, 3),
      ...row(22, 4, 2),
      ...arc(33, 5, 3),
      ...row(40, 3, 2),
      ...arc(50, 5, 3),
      ...row(57, 2, 2),
      ...arc(67, 5, 3),
      ...row(74, 3, 3),
      ...row(85, 5, 2),
      ...row(90, 3, 3),
    ],
    enemies: [
      { tx: 6, range: 1 },
      { tx: 23, range: 1 },
      { tx: 25, range: 1 },
      { tx: 39, range: 2 },
      { tx: 41, range: 1 },
      { tx: 59, range: 3 },
      { tx: 80, range: 1 },
      { tx: 76, range: 3 },
      { tx: 90, range: 2 },
    ],
    goalTx: 96,
    timeLimit: 300,
  },
  {
    world: "1-4",
    name: "VOLCANO BAY",
    bg: "/bg/volcano-bay.jpg",
    theme: { ground: "#3a1410", groundEdge: "#8a3a24", block: "#5c221a", blockEdge: "#d05a35" },
    widthTiles: 104,
    ground: [
      [0, 11],
      [16, 27],
      [32, 43],
      [48, 58],
      [63, 74],
      [79, 89],
      [93, 103],
    ],
    platforms: [
      [12, 7, 4], // bridge over pit 12-15
      [20, 6, 2],
      [28, 7, 4], // bridge over pit 28-31
      [37, 6, 2],
      [37, 4, 2],
      [44, 7, 4], // bridge over pit 44-47
      [52, 6, 2],
      [59, 7, 4], // bridge over pit 59-62
      [67, 5, 2],
      [75, 7, 4], // bridge over pit 75-78
      [83, 5, 2],
      [90, 7, 3], // bridge over pit 90-92
      [96, 5, 2],
    ],
    pipes: [
      { tx: 5, kind: 3, h: 140 },
      { tx: 17, kind: 1, h: 170 },
      { tx: 34, kind: 2, h: 150 },
      { tx: 50, kind: 3, h: 180 },
      { tx: 67, kind: 1, h: 160 },
      { tx: 81, kind: 2, h: 190 },
      { tx: 98, kind: 3, h: 150 },
    ],
    coins: [
      ...arc(12, 5, 4),
      ...row(20, 4, 2),
      ...arc(28, 5, 4),
      ...row(37, 2, 2),
      ...arc(44, 5, 4),
      ...row(52, 4, 2),
      ...arc(59, 5, 4),
      ...row(67, 3, 2),
      ...arc(75, 5, 4),
      ...row(83, 3, 2),
      ...arc(90, 5, 3),
      ...row(96, 3, 2),
    ],
    enemies: [
      { tx: 8, range: 1 },
      { tx: 21, range: 1 },
      { tx: 37, range: 3 },
      { tx: 41, range: 2 },
      { tx: 51, range: 1 },
      { tx: 55, range: 1 },
      { tx: 66, range: 2 },
      { tx: 68, range: 3 },
      { tx: 82, range: 2 },
      { tx: 84, range: 2 },
      { tx: 95, range: 2 },
    ],
    goalTx: 100,
    timeLimit: 300,
  },
];

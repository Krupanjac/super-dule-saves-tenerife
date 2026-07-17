import { memo } from "react";
import {
  MarioIdle, MarioWalk1, MarioWalk2, MarioWalk3,
  MarioJumpStart, MarioJump, MarioJumpFinish,
  Porcupine, PipeOne, PipeTwo, PipeThree,
} from "../sprites";
import { NATIVE_FACING, SPRITE_ASPECT, type SpriteName } from "../sprites/meta";

const COMPONENTS: Record<SpriteName, () => React.JSX.Element> = {
  MarioIdle, MarioWalk1, MarioWalk2, MarioWalk3,
  MarioJumpStart, MarioJump, MarioJumpFinish,
  Porcupine, PipeOne, PipeTwo, PipeThree,
};

interface SpriteProps {
  name: SpriteName;
  /** rendered height in px; width derives from the art's aspect ratio */
  h: number;
  /** which way the sprite should look; mirrors art with mismatched native facing */
  facing?: 1 | -1;
}

/** Renders a vector sprite at a given height, preserving its true aspect. */
export const Sprite = memo(function Sprite({ name, h, facing = 1 }: SpriteProps) {
  const Comp = COMPONENTS[name];
  const w = h * SPRITE_ASPECT[name];
  return (
    <div
      style={{
        width: w,
        height: h,
        transform: facing !== NATIVE_FACING[name] ? "scaleX(-1)" : undefined,
        pointerEvents: "none",
      }}
    >
      <Comp />
    </div>
  );
});

/** A pipe stretched to an arbitrary rendered size (art tolerates stretching). */
export const PipeSprite = memo(function PipeSprite({
  kind, w, h,
}: { kind: 1 | 2 | 3; w: number; h: number }) {
  const Comp = kind === 1 ? PipeOne : kind === 2 ? PipeTwo : PipeThree;
  return (
    <div style={{ width: w, height: h, pointerEvents: "none" }}>
      <Comp />
    </div>
  );
});

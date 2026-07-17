import { useEffect, useRef } from "react";
import type { Input } from "../game/engine";

export interface Keys extends Input {
  pausePressed: boolean;
  startPressed: boolean;
  mutePressed: boolean;
}

const JUMP_KEYS = ["Space", "ArrowUp", "KeyW", "KeyZ"];
const LEFT_KEYS = ["ArrowLeft", "KeyA"];
const RIGHT_KEYS = ["ArrowRight", "KeyD"];
const RUN_KEYS = ["ShiftLeft", "ShiftRight", "KeyX"];

export function useInput(): React.RefObject<Keys> {
  const ref = useRef<Keys>({
    left: false, right: false, run: false, jump: false,
    jumpPressed: false, pausePressed: false, startPressed: false, mutePressed: false,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = ref.current;
      if (JUMP_KEYS.includes(e.code)) {
        if (!k.jump) k.jumpPressed = true;
        k.jump = true;
        e.preventDefault();
      }
      if (LEFT_KEYS.includes(e.code)) { k.left = true; e.preventDefault(); }
      if (RIGHT_KEYS.includes(e.code)) { k.right = true; e.preventDefault(); }
      if (RUN_KEYS.includes(e.code)) k.run = true;
      if (e.code === "KeyP" || e.code === "Escape") k.pausePressed = true;
      if (e.code === "Enter" || e.code === "Space") k.startPressed = true;
      if (e.code === "KeyM") k.mutePressed = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = ref.current;
      if (JUMP_KEYS.includes(e.code)) k.jump = false;
      if (LEFT_KEYS.includes(e.code)) k.left = false;
      if (RIGHT_KEYS.includes(e.code)) k.right = false;
      if (RUN_KEYS.includes(e.code)) k.run = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return ref;
}

import { useEffect, useState } from "react";

/** Scale factor that fits a fixed-size arcade frame into the window. */
export function useScale(frameW: number, frameH: number): number {
  const calc = () =>
    Math.min(window.innerWidth / frameW, window.innerHeight / frameH, 1.4);
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const onResize = () => setScale(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameW, frameH]);
  return scale;
}

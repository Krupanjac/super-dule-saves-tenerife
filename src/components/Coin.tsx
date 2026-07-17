import { memo } from "react";

// Mascot mark from the export's "d-coin.tsx" (Wonder/Figma), 24×24 viewBox.
const D_COIN_PATH =
  "M17.8802 2.61803C18.9536 2.53937 19.966 2.96093 20.5305 3.91979C21.1958 5.05006 20.7554 6.46761 20.2913 7.69908L19.6565 9.38268C19.0968 11.1569 19.0968 13.0675 19.6565 14.8417L19.7679 15.1932C20.3038 16.8921 19.6851 18.7497 18.2483 19.7577C17.1494 20.5286 15.7065 20.5467 14.5901 19.8026C13.8146 19.2856 12.9974 18.7453 12.0657 18.7225C12.0591 18.7224 12.0519 18.7226 12.0452 18.7225L12.0003 18.7215C11.9785 18.7217 11.9566 18.722 11.9348 18.7225C11.0031 18.7453 10.186 19.2856 9.41043 19.8026C8.294 20.5468 6.85029 20.5287 5.75125 19.7577C4.31482 18.7497 3.69682 16.8919 4.2327 15.1932L4.34305 14.8417C4.90276 13.0675 4.90276 11.1569 4.34305 9.38268L3.70828 7.69908C3.24417 6.46761 2.80383 5.05006 3.46903 3.91979C4.03354 2.96072 5.04687 2.53936 6.12039 2.61803C7.21622 2.69862 8.15086 3.738 8.66629 4.56041L8.69754 4.60338C8.91535 4.89795 9.34922 4.89172 9.55985 4.59166C10.0724 3.78023 10.9894 3.20126 12.0003 3.19322L12.0472 3.1942C13.0384 3.21838 13.9362 3.79284 14.4407 4.59166C14.6513 4.89164 15.0841 4.89765 15.302 4.60338L15.3343 4.56041C15.8497 3.73792 16.7842 2.69844 17.8802 2.61803ZM9.59207 8.34459C8.91043 8.34459 8.35782 9.40403 8.3577 10.7108C8.3577 12.0178 8.91036 13.078 9.59207 13.078C10.2738 13.0779 10.8264 12.0177 10.8264 10.7108C10.8263 9.40407 10.2737 8.34465 9.59207 8.34459ZM14.4075 8.34459C13.7259 8.34459 13.1732 9.40403 13.1731 10.7108C13.1731 12.0178 13.7258 13.078 14.4075 13.078C15.0892 13.0779 15.6419 12.0177 15.6419 10.7108C15.6418 9.40407 15.0891 8.34465 14.4075 8.34459Z";

/** Spinning D coin: the export's mascot mark on a gold disc. */
export const Coin = memo(function Coin({ size = 34 }: { size?: number }) {
  return (
    <div className="coin-spin" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <circle cx="20" cy="20" r="18" fill="#FEAD0C" />
        <circle cx="20" cy="20" r="14.5" fill="#FFDB66" />
        <circle cx="20" cy="20" r="18" fill="none" stroke="#010101" strokeWidth="3" />
        <g transform="translate(6.2 6.6) scale(1.15)">
          <path d={D_COIN_PATH} fill="#290938" />
        </g>
      </svg>
    </div>
  );
});

/** Goal flag built from the export's design language (yellow / black / red). */
export const GoalFlag = memo(function GoalFlag({ h = 290 }: { h?: number }) {
  return (
    <div style={{ position: "relative", width: 130, height: h, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left: 0, bottom: 0, width: 12, height: h,
          background: "#c6d1d4", border: "3px solid #010101", borderRadius: 3,
        }}
      />
      <div
        style={{
          position: "absolute", left: -8, top: -14, width: 28, height: 28,
          borderRadius: "50%", background: "#FFDB66", border: "3px solid #010101",
        }}
      />
      <div
        className="goal-flag"
        style={{
          position: "absolute", left: 12, top: 16, padding: "8px 14px",
          background: "#fbd000", color: "#010101", border: "4px solid #010101",
          boxShadow: "4px 4px 0 #010101", fontWeight: 900, fontSize: 20,
          letterSpacing: 2,
        }}
      >
        GOAL
      </div>
    </div>
  );
});

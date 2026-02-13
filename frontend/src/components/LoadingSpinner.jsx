import React from "react";

// ─────────────────────────────────────────────
// Design tokens — edit in one place, applies everywhere
// ─────────────────────────────────────────────
const tokens = {
  gold: "#D4AF37",
  goldFaint: "rgba(212, 175, 55, 0.15)",
  goldGlow: "rgba(212, 175, 55, 0.08)",
  burgundy: "#2D0A14",
  darkBg: "#1a050b",
};

// ─────────────────────────────────────────────
// Size scale
// ─────────────────────────────────────────────
const SIZE = {
  sm: { spinner: 30, border: 3, label: 14 },
  md: { spinner: 50, border: 4, label: 16 },
  lg: { spinner: 80, border: 5, label: 18 },
};

// ─────────────────────────────────────────────
// Static styles — injected once outside the component
// so they aren't recreated on every render
// ─────────────────────────────────────────────
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&display=swap');

  @keyframes ls-spin      { to { transform: rotate(360deg); } }
  @keyframes ls-spin-rev  { to { transform: rotate(-360deg); } }
  @keyframes ls-pulse     { 0%,100% { opacity: .9; } 50% { opacity: .5; } }
  @keyframes ls-glow      { 0%,100% { opacity: .3; transform: scale(1); }
                            50%     { opacity: .6; transform: scale(1.12); } }

  .ls-ring {
    border-radius: 50%;
    animation: ls-spin 1s linear infinite;
  }
  .ls-ring-inner {
    border-radius: 50%;
    animation: ls-spin-rev 0.75s linear infinite;
    opacity: 0.55;
  }
  .ls-glow-halo {
    animation: ls-glow 2.2s ease-in-out infinite;
  }
  .ls-label {
    animation: ls-pulse 2s ease-in-out infinite;
  }
`;

let styleInjected = false;
function injectGlobalStyle() {
  if (styleInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = GLOBAL_STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function LoadingSpinner({
  message = "Loading…",
  size = "lg",
  fullScreen = false,
  className = "",
  style: styleProp = {},
}) {
  injectGlobalStyle();

  const s = SIZE[size] ?? SIZE.lg;

  // ── container ──────────────────────────────
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Playfair Display', serif",
    color: tokens.gold,
    ...(fullScreen
      ? {
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${tokens.burgundy} 0%, ${tokens.darkBg} 100%)`,
        }
      : { padding: "60px 20px" }),
    ...styleProp,
  };

  // ── spinner wrapper ─────────────────────────
  const wrapperStyle = {
    position: "relative",
    width: s.spinner,
    height: s.spinner,
    marginBottom: message ? 20 : 0,
    flexShrink: 0,
  };

  // ── outer ring ─────────────────────────────
  const ringStyle = {
    width: "100%",
    height: "100%",
    border: `${s.border}px solid ${tokens.goldFaint}`,
    borderTopColor: tokens.gold,
    boxSizing: "border-box",
  };

  // ── inner ring (centered) ───────────────────
  const innerSize = s.spinner * 0.6;
  const innerOffset = (s.spinner - innerSize) / 2;
  const ringInnerStyle = {
    position: "absolute",
    top: innerOffset,
    left: innerOffset,
    width: innerSize,
    height: innerSize,
    border: `${s.border}px solid transparent`,
    borderTopColor: tokens.gold,
    boxSizing: "border-box",
  };

  // ── radial glow halo ────────────────────────
  const haloStyle = {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "120%",
    height: "120%",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${tokens.goldGlow} 0%, transparent 70%)`,
    pointerEvents: "none",
  };

  // ── label ───────────────────────────────────
  const labelStyle = {
    fontSize: s.label,
    fontWeight: 400,
    letterSpacing: "1px",
    textAlign: "center",
    margin: "10px 0 0",
    opacity: 0.9,
    color: tokens.gold,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <div style={wrapperStyle}>
        {/* Glow halo — decorative, hidden from assistive tech */}
        <div className="ls-glow-halo" style={haloStyle} aria-hidden="true" />

        {/* Outer ring */}
        <div className="ls-ring" style={ringStyle} aria-hidden="true" />

        {/* Inner counter-rotating ring */}
        <div
          className="ls-ring-inner"
          style={ringInnerStyle}
          aria-hidden="true"
        />
      </div>

      {message && (
        <p className="ls-label" style={labelStyle}>
          {message}
        </p>
      )}
    </div>
  );
}
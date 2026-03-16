import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  type Tone,
  toneStyles,
} from "./config";
import { sceneOpacity, useRise } from "./utils";

const ChromeDots: React.FC = () => (
  <div style={{ display: "flex", gap: 8 }}>
    {["#ff9d8f", "#ffd36e", "#82d7b8"].map((color) => (
      <div
        key={color}
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 0 4px ${color}22`,
        }}
      />
    ))}
  </div>
);

const AppChrome: React.FC<{ current: string }> = ({ current }) => {
  const navItems = ["overview", "tempo", "projects", "read"];
  const navLabels: Record<string, string> = {
    overview: "개요",
    tempo: "리듬",
    projects: "프로젝트",
    read: "해석",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        padding: "20px 24px 18px",
        borderBottom: "1px solid rgba(93, 80, 61, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ChromeDots />
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 14,
            letterSpacing: "0.12em",
            fontWeight: LABEL_WEIGHT,
            color: "#7d6f60",
          }}
        >
          로컬 AI 작업 아카이브
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {navItems.map((item) => {
          const active = current === item;

          return (
            <div
              key={item}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                background: active
                  ? "rgba(255, 255, 255, 0.86)"
                  : "rgba(255, 255, 255, 0.48)",
                border: active
                  ? "1px solid rgba(125, 111, 96, 0.16)"
                  : "1px solid rgba(125, 111, 96, 0.08)",
                fontFamily: labelFont,
                fontSize: 11,
                letterSpacing: "0.12em",
                fontWeight: LABEL_WEIGHT,
                color: active ? "#514538" : "#8e7f71",
                boxShadow: active ? "0 8px 24px rgba(109, 91, 74, 0.08)" : "none",
              }}
            >
              {navLabels[item]}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 999,
          background: "rgba(255, 255, 255, 0.58)",
          border: "1px solid rgba(125, 111, 96, 0.1)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "#66c9a2",
            boxShadow: "0 0 0 6px rgba(102, 201, 162, 0.14)",
          }}
        />
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 14,
            color: "#6f6256",
          }}
        >
          내 기록에서 동기화됨
        </div>
      </div>
    </div>
  );
};

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const driftX = Math.sin(frame / 70) * 34;
  const driftY = Math.cos(frame / 90) * 28;
  const glowRotate = frame * 0.08;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #fffaf4 0%, #fff6f8 42%, #f5fbff 68%, #f4fff8 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          background:
            "radial-gradient(circle at 18% 22%, rgba(255, 188, 176, 0.58), transparent 24%), radial-gradient(circle at 78% 18%, rgba(167, 221, 255, 0.55), transparent 24%), radial-gradient(circle at 72% 76%, rgba(183, 242, 221, 0.56), transparent 26%), radial-gradient(circle at 24% 84%, rgba(255, 238, 173, 0.44), transparent 20%)",
          transform: `translate(${driftX}px, ${driftY}px) rotate(${glowRotate}deg)`,
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(130, 111, 88, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(130, 111, 88, 0.045) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          opacity: 0.42,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, transparent 0%, rgba(255, 255, 255, 0.22) 48%, rgba(221, 209, 194, 0.16) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{
  current: string;
  durationInFrames: number;
  section: string;
  children: React.ReactNode;
}> = ({ current, durationInFrames, section, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneOpacity(frame, durationInFrames);
  const entranceDuration = Math.floor(fps * 0.85);
  const exitDuration = Math.floor(fps * 0.72);
  const entrance = spring({
    frame,
    fps,
    durationInFrames: entranceDuration,
    config: { damping: 200 },
  });
  const exit = spring({
    frame: frame - (durationInFrames - exitDuration),
    fps,
    durationInFrames: exitDuration,
    config: { damping: 200 },
  });
  const sectionLift =
    interpolate(entrance, [0, 1], [14, 0]) -
    interpolate(exit, [0, 1], [0, 10]);
  const sweepX = interpolate(frame, [0, entranceDuration], [-440, 1260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.28, 0.12, 0.18, 1),
  });
  const sweepOpacity =
    interpolate(frame, [0, Math.floor(fps * 0.18), Math.floor(fps * 0.88)], [0, 0.62, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }) *
    (1 - exit);

  return (
    <AbsoluteFill
      style={{
        padding: 28,
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "auto 80px 18px",
            height: 26,
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(255, 141, 122, 0.18), rgba(102, 201, 162, 0.12), rgba(115, 184, 255, 0.18))",
            filter: "blur(22px)",
            opacity: 0.8,
            transform: `scaleX(${0.94 + entrance * 0.14})`,
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 42,
            overflow: "hidden",
            border: "1px solid rgba(116, 103, 84, 0.12)",
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.62))",
            boxShadow:
              "0 40px 120px rgba(131, 114, 95, 0.14), inset 0 1px 0 rgba(255,255,255,0.8)",
            backdropFilter: "blur(22px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-14% auto -14% -28%",
              width: 360,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))",
              transform: `translateX(${sweepX}px) rotate(18deg)`,
              opacity: sweepOpacity,
              filter: "blur(18px)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
          <AppChrome current={current} />
          <div
            style={{
              padding: "26px 28px 28px",
              height: "calc(100% - 74px)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.76)",
                border: "1px solid rgba(116, 103, 84, 0.1)",
                fontFamily: labelFont,
                fontSize: 12,
                letterSpacing: "0.12em",
                fontWeight: LABEL_WEIGHT,
                color: "#8a7a6a",
                transform: `translateY(${sectionLift}px)`,
                opacity: entrance,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#ff8d7a",
                }}
              />
              {section}
            </div>
            <div style={{ marginTop: 22, height: "calc(100% - 56px)" }}>{children}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GlassPanel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      borderRadius: 34,
      border: "1px solid rgba(116, 103, 84, 0.1)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,255,255,0.68))",
      boxShadow:
        "0 22px 54px rgba(129, 109, 88, 0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const SoftChip: React.FC<{ text: string; tone?: Tone }> = ({
  text,
  tone = "sky",
}) => {
  const currentTone = toneStyles[tone];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 16px",
        borderRadius: 999,
        background: currentTone.soft,
        boxShadow: `0 14px 32px ${currentTone.glow}`,
        fontFamily: bodyFont,
        fontSize: 16,
        color: "#4f4338",
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: currentTone.solid,
        }}
      />
      {text}
    </div>
  );
};

export const MetricCard: React.FC<{
  title: string;
  value: string;
  tone: Tone;
  delay?: number;
  size?: "regular" | "compact";
}> = ({ title, value, tone, delay = 0, size = "regular" }) => {
  const entrance = useRise(delay, 24);
  const currentTone = toneStyles[tone];
  const isCompact = size === "compact";

  return (
    <GlassPanel
      style={{
        padding: isCompact ? "14px 16px" : "18px 18px",
        minHeight: isCompact ? 62 : 96,
        background: currentTone.soft,
        border: `1px solid ${currentTone.line}`,
        transform: `translateY(${(1 - entrance) * 24}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          fontFamily: labelFont,
          fontSize: isCompact ? 10 : 11,
          letterSpacing: "0.12em",
          fontWeight: LABEL_WEIGHT,
          color: "#7c6e61",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: isCompact ? 8 : 10,
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: isCompact ? 24 : 34,
          lineHeight: isCompact ? 1 : 0.96,
          letterSpacing: "-0.04em",
          color: "#1f1a16",
        }}
      >
        {value}
      </div>
    </GlassPanel>
  );
};

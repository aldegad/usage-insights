import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  type Tone,
  toneStyles,
} from "./config";
import { sceneOpacity, useRise } from "./utils";

const sectionIndexByCurrent: Record<string, string> = {
  overview: "01",
  tempo: "02",
  projects: "03",
  read: "04",
};

const Masthead: React.FC<{ current: string }> = ({ current }) => {
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
        gap: 20,
        padding: "14px 24px 12px",
        borderBottom: "1px solid rgba(53, 44, 36, 0.08)",
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 9,
            letterSpacing: "0.18em",
            fontWeight: LABEL_WEIGHT,
            color: "#8b7867",
          }}
        >
          USAGE INSIGHTS
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 17,
            fontWeight: DISPLAY_WEIGHT,
            letterSpacing: "-0.03em",
            color: "#1b1612",
          }}
        >
          로컬 AI 작업 아카이브
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {navItems.map((item) => {
          const active = current === item;

          return (
            <div
              key={item}
              style={{
                fontFamily: labelFont,
                fontSize: 11,
                letterSpacing: "0.1em",
                fontWeight: LABEL_WEIGHT,
                color: active ? "#1f1914" : "#8f7d6d",
                paddingBottom: 5,
                borderBottom: active
                  ? "2px solid rgba(31, 25, 20, 0.72)"
                  : "2px solid transparent",
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
          padding: "8px 0 8px 16px",
          borderLeft: "1px solid rgba(53, 44, 36, 0.08)",
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: "#5da88c",
          }}
        />
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 10,
            letterSpacing: "0.1em",
            fontWeight: LABEL_WEIGHT,
            color: "#78695d",
          }}
        >
          LOCAL LOGS SYNCED
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
          "linear-gradient(180deg, #fbf6ee 0%, #f8f1e6 46%, #f5efe6 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -120,
          background:
            "radial-gradient(circle at 14% 14%, rgba(233, 182, 160, 0.24), transparent 28%), radial-gradient(circle at 84% 16%, rgba(157, 197, 230, 0.24), transparent 26%), radial-gradient(circle at 78% 82%, rgba(170, 210, 190, 0.2), transparent 24%)",
          transform: `translate(${driftX}px, ${driftY}px) rotate(${glowRotate}deg)`,
          filter: "blur(34px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(90, 73, 56, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(90, 73, 56, 0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 28%, rgba(74, 58, 44, 0.02) 100%)",
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
    config: { damping: 180 },
  });
  const exit = spring({
    frame: frame - (durationInFrames - exitDuration),
    fps,
    durationInFrames: exitDuration,
    config: { damping: 200 },
  });
  const sectionLift =
    interpolate(entrance, [0, 1], [20, 0]) -
    interpolate(exit, [0, 1], [0, 14]);
  const sectionIndex = sectionIndexByCurrent[current] || "00";

  return (
    <AbsoluteFill
      style={{
        padding: 20,
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
            inset: "12px 32px auto",
            height: 4,
            borderRadius: 9999,
            background:
              "linear-gradient(90deg, rgba(191, 148, 80, 0.7), rgba(217, 109, 87, 0.65), rgba(76, 143, 210, 0.6))",
            transform: `scaleX(${0.96 + entrance * 0.05})`,
            transformOrigin: "center",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 34,
            overflow: "hidden",
            border: "1px solid rgba(77, 63, 49, 0.12)",
            background: "linear-gradient(180deg, rgba(255,255,252,0.96), rgba(255,252,248,0.92))",
            boxShadow:
              "0 24px 70px rgba(110, 90, 70, 0.12), 0 2px 0 rgba(255,255,255,0.7) inset",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto 24px 18px 24px",
              height: 1,
              background:
                "linear-gradient(90deg, rgba(77, 63, 49, 0), rgba(77, 63, 49, 0.14), rgba(77, 63, 49, 0))",
              pointerEvents: "none",
            }}
          />
          <Masthead current={current} />
          <div
            style={{
              padding: "18px 24px 22px",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transform: `translateY(${sectionLift}px)`,
                opacity: entrance,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: 34,
                    height: 2,
                    background: "#1f1914",
                  }}
                />
                <span
                  style={{
                    fontFamily: labelFont,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    fontWeight: LABEL_WEIGHT,
                    color: "#766759",
                  }}
                >
                  {section}
                </span>
              </div>
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 22,
                  fontWeight: DISPLAY_WEIGHT,
                  letterSpacing: "-0.06em",
                  color: "rgba(31, 25, 20, 0.48)",
                }}
              >
                {sectionIndex}
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                flex: 1,
                minHeight: 0,
              }}
            >
              {children}
            </div>
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
      borderRadius: 20,
      border: "1px solid rgba(69, 56, 43, 0.1)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,252,248,0.92))",
      boxShadow: "0 10px 26px rgba(109, 89, 67, 0.05), inset 0 1px 0 rgba(255,255,255,0.7)",
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
        gap: 9,
        padding: "8px 11px",
        borderRadius: 14,
        background: currentTone.soft,
        border: `1px solid ${currentTone.line}`,
        fontFamily: labelFont,
        fontSize: 12,
        letterSpacing: "0.02em",
        fontWeight: LABEL_WEIGHT,
        color: "#4a3e34",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 9999,
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
        padding: isCompact ? "14px 16px 16px" : "18px 18px 20px",
        minHeight: isCompact ? 60 : 92,
        background: currentTone.soft,
        border: `1px solid ${currentTone.line}`,
        boxShadow: "0 10px 22px rgba(109, 89, 67, 0.04)",
        transform: `translateY(${(1 - entrance) * 24}px)`,
        opacity: entrance,
      }}
    >
      <div
        style={{
          fontFamily: labelFont,
          fontSize: isCompact ? 10 : 11,
          letterSpacing: "0.16em",
          fontWeight: LABEL_WEIGHT,
          color: "#7a695a",
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 10,
          width: 26,
          height: 2,
          background: currentTone.solid,
        }}
      />
      <div
        style={{
          marginTop: isCompact ? 10 : 12,
          fontFamily: displayFont,
          fontWeight: DISPLAY_WEIGHT,
          fontSize: isCompact ? 24 : 32,
          lineHeight: 0.96,
          letterSpacing: "-0.05em",
          color: "#1f1a16",
        }}
      >
        {value}
      </div>
    </GlassPanel>
  );
};

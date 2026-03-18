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
  colors,
  type Tone,
  toneStyles,
} from "./config";
import { getVideoCopy } from "./copy";
import { sceneOpacity, useRise } from "./utils";

const sectionIndexByCurrent: Record<string, string> = {
  overview: "01",
  tempo: "02",
  projects: "03",
  read: "04",
};

const Masthead: React.FC<{ current: string; locale?: string }> = ({
  current,
  locale,
}) => {
  const copy = getVideoCopy(locale);
  const navItems = ["overview", "tempo", "projects", "read"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "14px 24px 12px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 9,
            letterSpacing: "0.18em",
            fontWeight: LABEL_WEIGHT,
            color: colors.label,
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
            color: colors.heading,
          }}
        >
          {copy.masthead.title}
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
                color: active ? colors.heading : colors.label,
                paddingBottom: 5,
                borderBottom: active
                  ? `2px solid ${colors.heading}`
                  : "2px solid transparent",
              }}
            >
              {copy.masthead.navLabels[item]}
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
          borderLeft: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: "#0d9488",
          }}
        />
        <div
          style={{
            fontFamily: labelFont,
            fontSize: 10,
            letterSpacing: "0.1em",
            fontWeight: LABEL_WEIGHT,
            color: colors.muted,
          }}
        >
          {copy.masthead.synced}
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
          "linear-gradient(180deg, #f8f9fc 0%, #f0f2f8 46%, #ebeef5 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -120,
          background:
            "radial-gradient(circle at 14% 14%, rgba(139, 92, 246, 0.08), transparent 28%), radial-gradient(circle at 84% 16%, rgba(59, 130, 246, 0.10), transparent 26%), radial-gradient(circle at 78% 82%, rgba(13, 148, 136, 0.08), transparent 24%)",
          transform: `translate(${driftX}px, ${driftY}px) rotate(${glowRotate}deg)`,
          filter: "blur(34px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.028) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.22,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0) 28%, rgba(0, 0, 0, 0.01) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Stage: React.FC<{
  current: string;
  durationInFrames: number;
  section: string;
  locale?: string;
  children: React.ReactNode;
}> = ({ current, durationInFrames, section, locale, children }) => {
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
              "linear-gradient(90deg, rgba(139, 92, 246, 0.45), rgba(59, 130, 246, 0.4), rgba(13, 148, 136, 0.35))",
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
            border: "1px solid rgba(0, 0, 0, 0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(249,250,252,0.95))",
            boxShadow:
              "0 24px 70px rgba(0, 0, 0, 0.06), 0 2px 0 rgba(255,255,255,0.8) inset",
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
                "linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0))",
              pointerEvents: "none",
            }}
          />
          <Masthead current={current} locale={locale} />
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
                    background: colors.heading,
                  }}
                />
                <span
                  style={{
                    fontFamily: labelFont,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    fontWeight: LABEL_WEIGHT,
                    color: colors.muted,
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
                  color: "rgba(26, 29, 35, 0.36)",
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
      border: "1px solid rgba(0, 0, 0, 0.06)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(249,250,252,0.94))",
      boxShadow: "0 10px 26px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255,255,255,0.8)",
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
        color: colors.body,
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
        boxShadow: "0 10px 22px rgba(0, 0, 0, 0.03)",
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
          color: colors.muted,
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
          color: colors.heading,
        }}
      >
        {value}
      </div>
    </GlassPanel>
  );
};

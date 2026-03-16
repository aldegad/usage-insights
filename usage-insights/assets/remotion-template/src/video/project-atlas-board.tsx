import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { UsageInsightsData } from "../data/usage-insights.generated";
import {
  bodyFont,
  DISPLAY_WEIGHT,
  displayFont,
  LABEL_WEIGHT,
  labelFont,
  PROJECTS_DURATION,
  toneStyles,
} from "./config";
import { projectProviderTone, formatCompact, formatPercent, scaleValue } from "./utils";

export const ProjectAtlasBoard: React.FC<{ data: UsageInsightsData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const projects = data.projects.filter((project) => project.tokens > 0);
  const spotlight = projects[0];
  const totalProjectTokens = Math.max(
    1,
    projects.reduce((sum, project) => sum + project.tokens, 0),
  );
  const maxTokens = Math.max(1, ...projects.map((project) => project.tokens));
  const sharedProjects = projects.filter((project) => project.providers.length > 1).length;
  const rowHeight = 82;
  const rowGap = 8;
  const contentInsetY = 14;
  const visibleRows = Math.min(projects.length, 5);
  const viewportHeight =
    visibleRows * rowHeight + Math.max(visibleRows - 1, 0) * rowGap;
  const listHeight =
    projects.length * rowHeight +
    Math.max(projects.length - 1, 0) * rowGap +
    contentInsetY * 2;
  const maxScroll = Math.max(0, listHeight - viewportHeight);
  const scrollbarWidth = 8;
  const scrollbarInsetY = 12;
  const scrollbarInsetRight = 10;
  const scrollbarGap = 10;
  const contentInsetLeft = 10;
  const contentInsetRight = scrollbarWidth + scrollbarInsetRight + scrollbarGap;
  const trackHeight = viewportHeight - scrollbarInsetY * 2;
  const scrollProgress = interpolate(frame, [80, PROJECTS_DURATION - 64], [0, 1], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scrollY = maxScroll * scrollProgress;
  const thumbHeight = Math.max(
    64,
    trackHeight * (viewportHeight / Math.max(listHeight, viewportHeight)),
  );
  const thumbTravel = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = thumbTravel * scrollProgress;

  return (
    <div style={{ display: "grid", gap: 10, height: "100%" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: `전체 ${projects.length}개`, tone: "sky" as const },
          { label: `1위 ${spotlight.label} ${formatCompact(spotlight.tokens)}`, tone: "peach" as const },
          { label: `멀티 툴 ${sharedProjects}개`, tone: "mint" as const },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 999,
              background: toneStyles[item.tone].soft,
              border: `1px solid ${toneStyles[item.tone].line}`,
              fontFamily: bodyFont,
              fontSize: 15,
              color: "#54483d",
              boxShadow: `0 12px 28px ${toneStyles[item.tone].glow}`,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: toneStyles[item.tone].solid,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ minHeight: 0, flex: 1 }}>
        <div
          style={{
            position: "relative",
            borderRadius: 32,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,250,246,0.8))",
            border: "1px solid rgba(116, 103, 84, 0.08)",
            overflow: "hidden",
            height: viewportHeight,
            boxShadow:
              "0 28px 72px rgba(131, 114, 95, 0.1), inset 0 1px 0 rgba(255,255,255,0.72)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 16%, rgba(255,255,255,0) 84%, rgba(255,255,255,0.14))",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "14px 12px",
              borderRadius: 26,
              border: "1px solid rgba(116, 103, 84, 0.05)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", height: "100%" }}>
            <div
              style={{
                height: "100%",
                overflow: "hidden",
                padding: `${contentInsetY}px ${contentInsetRight}px ${contentInsetY}px ${contentInsetLeft}px`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  rowGap: rowGap,
                  transform: `translateY(-${scrollY}px)`,
                }}
              >
                {projects.map((project, index) => {
                  const toneKey = (["peach", "sky", "mint", "butter"] as const)[index % 4];
                  const tone = toneStyles[toneKey];
                  const reveal = spring({
                    frame: frame - Math.min(10 + index, 38),
                    fps,
                    durationInFrames: 18,
                    config: { damping: 220 },
                  });
                  const share = project.tokens / totalProjectTokens;
                  const width = scaleValue(project.tokens, maxTokens, 100);

                  return (
                    <div
                      key={project.label}
                      style={{
                        height: rowHeight,
                        boxSizing: "border-box",
                        padding: "10px 14px",
                        borderRadius: 22,
                        background:
                          index < 3
                            ? tone.soft
                            : "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.76))",
                        border: `1px solid ${index < 3 ? tone.line : "rgba(116, 103, 84, 0.08)"}`,
                        boxShadow: `0 10px 24px ${tone.glow}`,
                        transform: `translateY(${(1 - reveal) * 14}px)`,
                        opacity: reveal,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "50px 1fr 124px",
                          gap: 14,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            background:
                              index < 3
                                ? `linear-gradient(145deg, ${tone.solid}, rgba(255,255,255,0.78))`
                                : "rgba(255,255,255,0.84)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: displayFont,
                            fontWeight: DISPLAY_WEIGHT,
                            fontSize: 18,
                            color: index < 3 ? "#ffffff" : "#1f1a16",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: displayFont,
                              fontWeight: DISPLAY_WEIGHT,
                              fontSize: 21,
                              lineHeight: 1,
                              color: "#1a1512",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {project.label}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            {project.providers.map((provider) => {
                              const providerTone = projectProviderTone(provider);

                              return (
                                <div
                                  key={`${project.label}-${provider}`}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 9px",
                                    borderRadius: 999,
                                    background: providerTone.background,
                                    border: `1px solid ${providerTone.border}`,
                                    fontFamily: labelFont,
                                    fontSize: 10,
                                    letterSpacing: "0.08em",
                                    fontWeight: LABEL_WEIGHT,
                                    color: "#695d51",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 999,
                                      background: providerTone.dot,
                                    }}
                                  />
                                  {provider}
                                </div>
                              );
                            })}
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "6px 9px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.78)",
                                border: "1px solid rgba(116, 103, 84, 0.08)",
                                fontFamily: labelFont,
                                fontSize: 10,
                                letterSpacing: "0.08em",
                                fontWeight: LABEL_WEIGHT,
                                color: "#74675a",
                              }}
                            >
                              {project.workspaces} WS
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              height: 7,
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.72)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(width, project.tokens > 0 ? 4 : 0)}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: `linear-gradient(90deg, ${tone.solid}, rgba(255,255,255,0.84))`,
                                boxShadow: `0 8px 18px ${tone.glow}`,
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            display: "grid",
                            gap: 4,
                            justifyItems: "end",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: displayFont,
                              fontWeight: DISPLAY_WEIGHT,
                              fontSize: 24,
                              lineHeight: 0.98,
                              color: "#1f1a16",
                            }}
                          >
                            {formatCompact(project.tokens)}
                          </div>
                          <div
                            style={{
                              fontFamily: bodyFont,
                              fontSize: 13,
                              color: "#64584c",
                            }}
                          >
                            {project.threads}개 기록
                          </div>
                          <div
                            style={{
                              fontFamily: labelFont,
                              fontSize: 10,
                              letterSpacing: "0.1em",
                              fontWeight: LABEL_WEIGHT,
                              color: "#8a7b6f",
                            }}
                          >
                            비중 {formatPercent(share)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: scrollbarInsetY,
                bottom: scrollbarInsetY,
                right: scrollbarInsetRight,
                width: scrollbarWidth,
                borderRadius: 999,
                background: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(116, 103, 84, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 1,
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 1,
                  right: 1,
                  top: thumbTop,
                  height: thumbHeight,
                  borderRadius: 999,
                  background:
                    "linear-gradient(180deg, rgba(255, 141, 122, 0.9), rgba(115, 184, 255, 0.78))",
                  boxShadow: "0 10px 22px rgba(255, 141, 122, 0.18)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

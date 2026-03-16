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
  const extraRows = Math.max(0, projects.length - visibleRows);
  const scrollDensity = Math.min(1, extraRows / 18);
  const scrollStartFrame = interpolate(scrollDensity, [0, 1], [88, 46], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scrollEndFrame = interpolate(
    scrollDensity,
    [0, 1],
    [PROJECTS_DURATION - 20, PROJECTS_DURATION - 8],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const contentInsetLeft = 10;
  const contentInsetRight = 10;
  const adaptiveScrollProgress = interpolate(frame, [scrollStartFrame, scrollEndFrame], [0, 1], {
    easing: Easing.linear,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scrollY = maxScroll * adaptiveScrollProgress;

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
              padding: "9px 12px",
              borderRadius: 14,
              background: toneStyles[item.tone].soft,
              border: `1px solid ${toneStyles[item.tone].line}`,
              fontFamily: labelFont,
              fontSize: 13,
              letterSpacing: "0.02em",
              fontWeight: LABEL_WEIGHT,
              color: "#54483d",
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
              "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,251,247,0.92))",
            border: "1px solid rgba(116, 103, 84, 0.08)",
            overflow: "hidden",
            height: viewportHeight,
            boxShadow:
              "0 18px 40px rgba(131, 114, 95, 0.06), inset 0 1px 0 rgba(255,255,255,0.72)",
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
                        position: "relative",
                        height: rowHeight,
                        boxSizing: "border-box",
                        padding: "10px 14px",
                        borderRadius: 16,
                        background:
                          index < 3
                            ? tone.soft
                            : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92))",
                        border: `1px solid ${index < 3 ? tone.line : "rgba(116, 103, 84, 0.08)"}`,
                        boxShadow: "0 8px 16px rgba(109, 89, 67, 0.03)",
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
                            borderRadius: 10,
                            background:
                              index < 3
                                ? "rgba(255,255,255,0.72)"
                                : "rgba(247, 242, 235, 0.92)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: displayFont,
                            fontWeight: DISPLAY_WEIGHT,
                            fontSize: 18,
                            color: index < 3 ? tone.solid : "#1f1a16",
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
                                    borderRadius: 12,
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
                                borderRadius: 12,
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
                              height: 5,
                              borderRadius: 999,
                              background: "rgba(77, 63, 49, 0.08)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.max(width, project.tokens > 0 ? 4 : 0)}%`,
                                height: "100%",
                                borderRadius: 999,
                                background: tone.solid,
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
          </div>
        </div>
      </div>
    </div>
  );
};

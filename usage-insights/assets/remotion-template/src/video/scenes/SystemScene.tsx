import React from "react";
import type { VideoProps } from "../config";
import { SYSTEM_DURATION } from "../config";
import { Stage } from "../primitives";
import { BarBoard, MonthlyProviderBoard, ProviderSplitCard } from "../metric-panels";

export const SystemScene: React.FC<VideoProps> = ({ data }) => {
  const recent = data.recentDaily.slice(-7);
  const claudeLead = data.monthlyByProvider.find((item) => item.claudeTokens > item.codexTokens);
  const codexLead = [...data.monthlyByProvider]
    .reverse()
    .find((item) => item.codexTokens > item.claudeTokens);
  const monthlySubtitle =
    claudeLead && codexLead
      ? `${claudeLead.label}엔 Claude가, ${codexLead.label}엔 Codex가 더 강했습니다. 막대 전체는 월별 총 토큰이고 색으로 도구 비중을 나눠 보여줍니다.`
      : "한 도구만 오래 끄는 패턴이 아니라, 시기와 맥락에 따라 사용 무게가 바뀝니다. 막대 전체는 월별 총 토큰입니다.";

  return (
    <Stage current="tempo" durationInFrames={SYSTEM_DURATION} section="시스템 요약">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.88fr",
          gridTemplateRows: "1fr 1fr",
          gap: 18,
          height: "100%",
        }}
      >
        <div style={{ gridRow: "1 / span 2" }}>
          <MonthlyProviderBoard data={data} subtitle={monthlySubtitle} />
        </div>
        <ProviderSplitCard data={data} />
        <BarBoard
          title="최근 일간 리듬"
          subtitle="최근 사용은 늘 켜두는 느낌보다는, 필요할 때 깊게 몰입하는 파동형 패턴에 가깝습니다."
          items={recent}
          tone="mint"
          maxHeight={120}
        />
      </div>
    </Stage>
  );
};

import { AbsoluteFill } from "remotion";
import { UsageInsightsVideo } from "./video/UsageInsightsVideo";
import type { UsageInsightsData } from "./data/usage-insights.generated";

export type UsageProfileProps = {
  data: UsageInsightsData;
};

export const UsageProfile: React.FC<UsageProfileProps> = ({ data }) => {
  return (
    <AbsoluteFill
      style={{
        transform: "scale(1.5)",
        transformOrigin: "top left",
        width: "66.667%",
        height: "66.667%",
      }}
    >
      <UsageInsightsVideo data={data} />
    </AbsoluteFill>
  );
};

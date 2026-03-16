import "./index.css";
import { Composition } from "remotion";
import { UsageProfile } from "./Composition";
import { usageInsights } from "./data/usage-insights.generated";
import { USAGE_PROFILE_DURATION } from "./video/UsageInsightsVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UsageProfile"
        component={UsageProfile}
        durationInFrames={USAGE_PROFILE_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ data: usageInsights }}
      />
    </>
  );
};

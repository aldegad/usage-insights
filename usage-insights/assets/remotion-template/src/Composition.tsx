import { UsageInsightsVideo } from "./video/UsageInsightsVideo";
import type { UsageInsightsData } from "./data/usage-insights.generated";

export type UsageProfileProps = {
  data: UsageInsightsData;
};

export const UsageProfile: React.FC<UsageProfileProps> = ({ data }) => {
  return <UsageInsightsVideo data={data} />;
};

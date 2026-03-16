import { buildInsights } from "./lib/build-insights.mjs";
import { OUTPUT_FILE, REPORT_FILE } from "./lib/config.mjs";
import { writeOutputs } from "./lib/report.mjs";

const main = () => {
  const insights = buildInsights();
  writeOutputs(insights);
  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(`Wrote ${REPORT_FILE}`);
};

main();

import { createInsightsClient } from "./_createInsightsClient";
import { getFunctionalInterface } from "./_getFunctionalInterface";
import { processQueue } from "./_processQueue";
import AlgoliaAnalytics from "./insights";
import { getRequesterForNode } from "./utils/getRequesterForNode";

export {
  getRequesterForNode,
  AlgoliaAnalytics,
  getFunctionalInterface,
  processQueue
};
export * from "./types";

export default createInsightsClient(getRequesterForNode());

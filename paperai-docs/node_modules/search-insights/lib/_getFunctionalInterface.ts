import type AlgoliaAnalytics from "./insights";
import type { InsightsClient } from "./types";
import { isFunction } from "./utils";

export function getFunctionalInterface(
  instance: AlgoliaAnalytics
): InsightsClient {
  return (functionName, ...functionArguments) => {
    if (functionName && isFunction((instance as any)[functionName])) {
      // @ts-expect-error
      instance[functionName](...functionArguments);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`The method \`${functionName}\` doesn't exist.`);
    }
  };
}

import type AlgoliaAnalytics from "./insights";
import { isFunction } from "./utils";

export function getVersion(
  this: AlgoliaAnalytics,
  callback: (version: string) => void
): void {
  if (isFunction(callback)) {
    callback(this.version);
  }
}

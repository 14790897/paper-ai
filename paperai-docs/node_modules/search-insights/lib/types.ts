import type { addAlgoliaAgent } from "./_algoliaAgent";
import type { getVersion } from "./_getVersion";
import type { makeSendEvents } from "./_sendEvent";
import type {
  getUserToken,
  setUserToken,
  onUserTokenChange,
  onAuthenticatedUserTokenChange,
  setAuthenticatedUserToken,
  getAuthenticatedUserToken
} from "./_tokenUtils";
import type {
  clickedObjectIDsAfterSearch,
  clickedObjectIDs,
  clickedFilters
} from "./click";
import type {
  convertedObjectIDsAfterSearch,
  convertedObjectIDs,
  convertedFilters,
  purchasedObjectIDs,
  purchasedObjectIDsAfterSearch,
  addedToCartObjectIDsAfterSearch,
  addedToCartObjectIDs
} from "./conversion";
import type { init } from "./init";
import type { viewedObjectIDs, viewedFilters } from "./view";

export type InsightsMethodMap = {
  init: Parameters<typeof init>;
  getVersion: Parameters<typeof getVersion>;
  addAlgoliaAgent: Parameters<typeof addAlgoliaAgent>;
  setUserToken: Parameters<typeof setUserToken>;
  getUserToken: Parameters<typeof getUserToken>;
  onUserTokenChange: Parameters<typeof onUserTokenChange>;
  setAuthenticatedUserToken: Parameters<typeof setAuthenticatedUserToken>;
  getAuthenticatedUserToken: Parameters<typeof getAuthenticatedUserToken>;
  onAuthenticatedUserTokenChange: Parameters<
    typeof onAuthenticatedUserTokenChange
  >;
  clickedObjectIDsAfterSearch: Parameters<typeof clickedObjectIDsAfterSearch>;
  clickedObjectIDs: Parameters<typeof clickedObjectIDs>;
  clickedFilters: Parameters<typeof clickedFilters>;
  convertedObjectIDsAfterSearch: Parameters<
    typeof convertedObjectIDsAfterSearch
  >;
  convertedObjectIDs: Parameters<typeof convertedObjectIDs>;
  convertedFilters: Parameters<typeof convertedFilters>;
  viewedObjectIDs: Parameters<typeof viewedObjectIDs>;
  viewedFilters: Parameters<typeof viewedFilters>;
  purchasedObjectIDs: Parameters<typeof purchasedObjectIDs>;
  purchasedObjectIDsAfterSearch: Parameters<
    typeof purchasedObjectIDsAfterSearch
  >;
  addedToCartObjectIDs: Parameters<typeof addedToCartObjectIDs>;
  addedToCartObjectIDsAfterSearch: Parameters<
    typeof addedToCartObjectIDsAfterSearch
  >;
  sendEvents: Parameters<ReturnType<typeof makeSendEvents>>;
};

type MethodType<MethodName extends keyof InsightsMethodMap> = (
  method: MethodName,
  ...args: InsightsMethodMap[MethodName]
) => void;

export type Init = MethodType<"init">;

export type GetVersion = MethodType<"getVersion">;

export type AddAlgoliaAgent = MethodType<"addAlgoliaAgent">;

export type SetUserToken = MethodType<"setUserToken">;

export type GetUserToken = MethodType<"getUserToken">;

export type OnUserTokenChange = MethodType<"onUserTokenChange">;

export type ClickedObjectIDsAfterSearch =
  MethodType<"clickedObjectIDsAfterSearch">;

export type ClickedObjectIDs = MethodType<"clickedObjectIDs">;

export type ClickedFilters = MethodType<"clickedFilters">;

export type ConvertedObjectIDsAfterSearch =
  MethodType<"convertedObjectIDsAfterSearch">;

export type ConvertedObjectIDs = MethodType<"convertedObjectIDs">;

export type ConvertedFilters = MethodType<"convertedFilters">;

export type ViewedObjectIDs = MethodType<"viewedObjectIDs">;

export type ViewedFilters = MethodType<"viewedFilters">;

export type SendEvents = MethodType<"sendEvents">;

export type InsightsClient = (<MethodName extends keyof InsightsMethodMap>(
  method: MethodName,
  ...args: InsightsMethodMap[MethodName]
) => void) & { version?: string };

export type InsightsEventType = "click" | "conversion" | "view";
export type InsightsEventConversionSubType = "addToCart" | "purchase";

export type InsightsEventObjectData = {
  queryID?: string;

  price?: number | string;
  discount?: number | string;
  quantity?: number;
};

export type InsightsEvent = {
  eventType: InsightsEventType;
  eventSubtype?: InsightsEventConversionSubType;

  eventName: string;
  userToken?: number | string;
  authenticatedUserToken?: number | string;
  timestamp?: number;
  index: string;

  queryID?: string;
  objectIDs?: string[];
  positions?: number[];
  objectData?: InsightsEventObjectData[];

  filters?: string[];

  value?: number | string;
  currency?: string;
};

export type InsightsAdditionalEventParams = {
  headers?: Record<string, string>;
};

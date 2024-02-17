import type AlgoliaAnalytics from "./insights";
import type { InsightsAdditionalEventParams, InsightsEvent } from "./types";
import { isUndefined } from "./utils";
import type { RequestFnType } from "./utils/request";

export function makeSendEvents(requestFn: RequestFnType) {
  return function sendEvents(
    this: AlgoliaAnalytics,
    eventData: InsightsEvent[],
    additionalParams?: InsightsAdditionalEventParams
  ): Promise<boolean> | undefined {
    if (this._userHasOptedOut) {
      return undefined;
    }
    const hasCredentials =
      (!isUndefined(this._apiKey) && !isUndefined(this._appId)) ||
      (additionalParams?.headers?.["X-Algolia-Application-Id"] &&
        additionalParams?.headers?.["X-Algolia-API-Key"]);
    if (!hasCredentials) {
      throw new Error(
        "Before calling any methods on the analytics, you first need to call the 'init' function with appId and apiKey parameters or provide custom credentials in additional parameters."
      );
    }

    if (!this._userToken && this._anonymousUserToken) {
      this.setAnonymousUserToken(true);
    }

    const events: InsightsEvent[] = eventData.map((data) => {
      const { filters, ...rest } = data;

      const payload: InsightsEvent = {
        ...rest,
        userToken: data?.userToken ?? this._userToken,
        authenticatedUserToken:
          data?.authenticatedUserToken ?? this._authenticatedUserToken
      };
      if (!isUndefined(filters)) {
        payload.filters = filters.map(encodeURIComponent);
      }
      return payload;
    });

    return sendRequest(
      requestFn,
      this._ua,
      this._endpointOrigin,
      events,
      this._appId,
      this._apiKey,
      additionalParams?.headers
    );
  };
}

// eslint-disable-next-line max-params
function sendRequest(
  requestFn: RequestFnType,
  userAgents: string[],
  endpointOrigin: string,
  events: InsightsEvent[],
  appId?: string,
  apiKey?: string,
  additionalHeaders: InsightsAdditionalEventParams["headers"] = {}
): Promise<boolean> {
  const {
    "X-Algolia-Application-Id": providedAppId,
    "X-Algolia-API-Key": providedApiKey,
    ...restHeaders
  } = additionalHeaders;
  // Auth query
  const headers: Record<string, string> = {
    "X-Algolia-Application-Id": providedAppId ?? appId,
    "X-Algolia-API-Key": providedApiKey ?? apiKey,
    "X-Algolia-Agent": encodeURIComponent(userAgents.join("; ")),
    ...restHeaders
  };

  const queryParameters = Object.keys(headers)
    .map((key) => `${key}=${headers[key]}`)
    .join("&");

  const reportingURL = `${endpointOrigin}/1/events?${queryParameters}`;
  return requestFn(reportingURL, { events });
}

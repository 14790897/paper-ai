// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://523c4056ba48d012c62a377dfc49f647@o4506728662564864.ingest.sentry.io/4506728672264192",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    beforeSend(event, hint) {
      // 检查事件是否为通过 `captureMessage` 发送的
      if (event.logger === "javascript" && event.message) {
        return event; // 允许发送消息事件
      }
      return null; // 过滤掉其他类型的事件
    },
    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

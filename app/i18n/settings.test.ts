import { describe, expect, it } from "vitest";
import {
  cookieName,
  defaultNS,
  fallbackLng,
  getOptions,
  languages,
} from "./settings";

describe("i18n settings", () => {
  it("exposes stable defaults", () => {
    expect(fallbackLng).toBe("en");
    expect(defaultNS).toBe("translation");
    expect(cookieName).toBe("i18next");
    expect(languages).toContain("en");
    expect(languages).toContain("zh-CN");
  });

  it("returns default options when no args are provided", () => {
    const options = getOptions();

    expect(options.lng).toBe(fallbackLng);
    expect(options.ns).toBe(defaultNS);
    expect(options.fallbackNS).toBe(defaultNS);
    expect(options.supportedLngs).toEqual(languages);
  });

  it("returns caller provided language and namespace", () => {
    const options = getOptions("zh-CN", "common");

    expect(options.lng).toBe("zh-CN");
    expect(options.ns).toBe("common");
    expect(options.fallbackLng).toBe(fallbackLng);
  });
});

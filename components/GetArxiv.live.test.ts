import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/others/quillutils", () => ({
  getRandomOffset: vi.fn(() => 0),
}));

import getArxivPapers from "./GetArxiv";

describe("getArxivPapers live network", () => {
  it(
    "fetches data from arXiv over the network",
    async () => {
      const result = await getArxivPapers("all:quantum", 1, 0);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        abstract: expect.any(String),
      });
    },
    30000
  );
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  getRandomOffset: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    get: mocks.axiosGet,
  },
}));

vi.mock("@/utils/others/quillutils", () => ({
  getRandomOffset: mocks.getRandomOffset,
}));

import getArxivPapers from "./GetArxiv";

describe("getArxivPapers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the request url and returns the first two parsed entries", async () => {
    mocks.getRandomOffset.mockReturnValue(5);
    mocks.axiosGet.mockResolvedValue({
      data: `<?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <id>id-1</id>
            <published>2024-01-01</published>
            <title>Title 1</title>
            <summary>Abstract 1</summary>
            <author><name>Alice</name></author>
          </entry>
          <entry>
            <id>id-2</id>
            <published>2024-01-02</published>
            <title>Title 2</title>
            <summary>Abstract 2</summary>
            <author><name>Bob</name></author>
          </entry>
          <entry>
            <id>id-3</id>
            <published>2024-01-03</published>
            <title>Title 3</title>
            <summary>Abstract 3</summary>
            <author><name>Carol</name></author>
          </entry>
        </feed>`,
    });

    const result = await getArxivPapers("machine learning", 3, -1);

    expect(mocks.getRandomOffset).toHaveBeenCalledWith(27);
    expect(mocks.axiosGet).toHaveBeenCalledWith(
      "https://proxy.14790897.xyz/proxy/https://export.arxiv.org/api/query?search_query=machine learning&start=5&max_results=3&sortBy=submittedDate&sortOrder=descending"
    );
    expect(result).toEqual([
      {
        id: "id-1",
        published: "2024-01-01",
        title: "Title 1",
        abstract: "Abstract 1",
        authors: ["Alice"],
      },
      {
        id: "id-2",
        published: "2024-01-02",
        title: "Title 2",
        abstract: "Abstract 2",
        authors: ["Bob"],
      },
    ]);
  });

  it("throws a readable error when the request fails", async () => {
    mocks.axiosGet.mockRejectedValue({
      response: {
        status: 429,
        data: { message: "too many requests" },
      },
    });

    await expect(getArxivPapers("ai", 2, 0)).rejects.toThrow(
      "Arxiv失败（请使用英文并缩短关键词）"
    );
  });
});
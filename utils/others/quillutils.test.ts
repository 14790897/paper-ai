import { describe, expect, it, vi } from "vitest";

vi.mock("quill", () => ({
  default: class MockQuill {},
}));

vi.mock("@react-spring/web", () => ({
  animated: {},
  useSpring: vi.fn(() => ({})),
}));

vi.mock("@/utils/global", () => ({}));

import {
  convertToSuperscript,
  formatAllReferencesForCopy,
  formatJournalReference,
  formatReferenceForCopy,
  getAllFullReferences,
  getFullReference,
  getNumberBeforeCursor,
  getTextBeforeCursor,
  removeSpecialCharacters,
  renderCitation,
  updateBracketNumbersInDelta,
  updateBracketNumbersInDeltaKeepSelection,
} from "./quillutils";

describe("quillutils text helpers", () => {
  it("removes non Chinese/English characters while preserving spaces", () => {
    const input = "AI-论文 2026! 测试#Topic";
    expect(removeSpecialCharacters(input)).toBe("AI论文  测试Topic");
  });

  it("renumbers bracket indices sequentially in delta ops", () => {
    const delta = {
      ops: [
        { insert: "A[12]" },
        { insert: " and [3]" },
        { insert: { image: "https://example.com/img.png" } },
        { insert: " then [99]" },
      ],
    };

    const result = updateBracketNumbersInDelta(delta);

    expect(result).toEqual({
      ops: [
        { insert: "A[1]" },
        { insert: " and [2]" },
        { insert: { image: "https://example.com/img.png" } },
        { insert: " then [3]" },
      ],
    });
  });

  it("extracts text and last reference number before cursor", () => {
    const mockQuill = {
      getSelection: vi.fn(() => ({ index: 24 })),
      getText: vi.fn(() => "prefix [2] text and [8]"),
    } as any;

    expect(getTextBeforeCursor(mockQuill, 50)).toBe("prefix [2] text and [8]");
    expect(getNumberBeforeCursor(mockQuill, 50)).toBe(8);
  });

  it("returns 0 when no bracket number exists before cursor", () => {
    const mockQuill = {
      getSelection: vi.fn(() => ({ index: 10 })),
      getText: vi.fn(() => "plain text"),
    } as any;

    expect(getNumberBeforeCursor(mockQuill, 50)).toBe(0);
  });

  it("formats [n] markers as superscript and resets following char format", () => {
    const formatText = vi.fn();
    const mockQuill = {
      getText: vi.fn(() => "Hello [1] world [2]x"),
      formatText,
    } as any;

    convertToSuperscript(mockQuill);

    expect(formatText).toHaveBeenCalledWith(6, 3, { script: "super" });
    expect(formatText).toHaveBeenCalledWith(9, 1, "script", false);
    expect(formatText).toHaveBeenCalledWith(16, 3, { script: "super" });
    expect(formatText).toHaveBeenCalledWith(19, 1, "script", false);
  });

  it("updates delta and restores selection", () => {
    const setContents = vi.fn();
    const setSelection = vi.fn();

    const mockQuill = {
      getSelection: vi.fn(() => ({ index: 7, length: 0 })),
      getContents: vi.fn(() => ({ ops: [{ insert: "a[9] b[7]" }] })),
      setContents,
      setSelection,
    } as any;

    updateBracketNumbersInDeltaKeepSelection(mockQuill);

    expect(setContents).toHaveBeenCalledWith({ ops: [{ insert: "a[1] b[2]" }] });
    expect(setSelection).toHaveBeenCalledWith(7, 0);
  });
});

describe("quillutils citation formatting", () => {
  it("formats journal reference with optional volume/pages", () => {
    expect(
      formatJournalReference({
        journal: { name: "Nature", volume: "12", pages: "1-9" },
        year: 2024,
      })
    ).toBe("Nature, 2024, 12: 1-9");

    expect(formatJournalReference({ year: 2024 })).toBe("");
  });

  it("formats one reference for copy", () => {
    const reference = {
      author: "Doe",
      title: "Sample",
      year: 2020,
      venue: "ICLR",
      url: "https://example.com",
    };

    expect(formatReferenceForCopy(reference as any)).toBe("Doe. Sample. ICLR, 2020.");
  });

  it("formats reference list for copy with numbering", () => {
    const references = [
      {
        author: "Doe",
        title: "Paper A",
        year: 2020,
        venue: "ACL",
        url: "https://example.com/a",
      },
      {
        author: "Lee",
        title: "Paper B",
        year: 2021,
        venue: "EMNLP",
        url: "https://example.com/b",
      },
    ];

    expect(formatAllReferencesForCopy(references as any)).toContain("[1] Doe. Paper A. ACL, 2020.");
    expect(formatAllReferencesForCopy(references as any)).toContain("[2] Lee. Paper B. EMNLP, 2021.");
  });

  it("renders custom and named citation styles", () => {
    const ref = {
      author: "Doe",
      title: "Paper C",
      year: 2022,
      venue: "NeurIPS",
      journalReference: "Journal X, 2022.",
      apa: "Doe (2022). Paper C.",
      url: "https://example.com/c",
    };

    expect(renderCitation(ref, "apa")).toBe("Doe (2022). Paper C.");
    expect(renderCitation(ref, "custom-chinese")).toBe(getFullReference(ref as any));
  });

  it("builds numbered reference block using selected style", () => {
    const refs = [
      {
        author: "Doe",
        title: "Paper C",
        year: 2022,
        venue: "NeurIPS",
        apa: "Doe (2022). Paper C.",
        url: "https://example.com/c",
      },
      {
        author: "Lee",
        title: "Paper D",
        year: 2023,
        venue: "ICML",
        apa: "Lee (2023). Paper D.",
        url: "https://example.com/d",
      },
    ];

    const rendered = getAllFullReferences(refs as any, "apa");
    expect(rendered).toBe("[1] Doe (2022). Paper C.\n[2] Lee (2023). Paper D.");
  });
});

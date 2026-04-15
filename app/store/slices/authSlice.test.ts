import { describe, expect, it } from "vitest";
import {
  addReferencesRedux,
  authReducer,
  removeReferenceRedux,
  setApiKey,
  swapReferencesRedux,
} from "./authSlice";

const baseReference = {
  author: "Author A",
  title: "Paper A",
  year: 2024,
  url: "https://example.com/a",
};

describe("authSlice reducer", () => {
  it("updates api key", () => {
    const state = authReducer(undefined, setApiKey("sk-test-key"));
    expect(state.apiKey).toBe("sk-test-key");
  });

  it("inserts references at a target position", () => {
    const initialState = authReducer(undefined, {
      type: "auth/setReferencesRedux",
      payload: [
        baseReference,
        {
          ...baseReference,
          title: "Paper B",
          url: "https://example.com/b",
        },
      ],
    });

    const updatedState = authReducer(
      initialState,
      addReferencesRedux({
        references: [
          {
            ...baseReference,
            title: "Inserted Paper",
            url: "https://example.com/insert",
          },
        ],
        position: 1,
      })
    );

    expect(updatedState.referencesRedux.map((item) => item.title)).toEqual([
      "Paper A",
      "Inserted Paper",
      "Paper B",
    ]);
  });

  it("removes reference by index", () => {
    const initialState = authReducer(undefined, {
      type: "auth/setReferencesRedux",
      payload: [
        baseReference,
        {
          ...baseReference,
          title: "Paper B",
          url: "https://example.com/b",
        },
      ],
    });

    const updatedState = authReducer(initialState, removeReferenceRedux(0));

    expect(updatedState.referencesRedux).toHaveLength(1);
    expect(updatedState.referencesRedux[0].title).toBe("Paper B");
  });

  it("swaps references only when indexes are valid", () => {
    const initialState = authReducer(undefined, {
      type: "auth/setReferencesRedux",
      payload: [
        baseReference,
        {
          ...baseReference,
          title: "Paper B",
          url: "https://example.com/b",
        },
      ],
    });

    const swappedState = authReducer(
      initialState,
      swapReferencesRedux({ indexA: 0, indexB: 1 })
    );
    const invalidSwapState = authReducer(
      swappedState,
      swapReferencesRedux({ indexA: 0, indexB: 99 })
    );

    expect(swappedState.referencesRedux.map((item) => item.title)).toEqual([
      "Paper B",
      "Paper A",
    ]);
    expect(invalidSwapState.referencesRedux.map((item) => item.title)).toEqual([
      "Paper B",
      "Paper A",
    ]);
  });
});

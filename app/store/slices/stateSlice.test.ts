import { describe, expect, it } from "vitest";
import {
  setCitationStyle,
  setPaperNumberRedux,
  setShowPaperManagement,
  stateReducer,
} from "./stateSlice";

describe("stateSlice reducer", () => {
  it("toggles showPaperManagement", () => {
    const state1 = stateReducer(undefined, setShowPaperManagement());
    const state2 = stateReducer(state1, setShowPaperManagement());

    expect(state1.showPaperManagement).toBe(true);
    expect(state2.showPaperManagement).toBe(false);
  });

  it("updates paper number", () => {
    const state = stateReducer(undefined, setPaperNumberRedux("5"));
    expect(state.paperNumberRedux).toBe("5");
    expect(state.language).toBe("en");
  });

  it("updates citation style", () => {
    const state = stateReducer(undefined, setCitationStyle("apa"));
    expect(state.citationStyle).toBe("apa");
  });
});

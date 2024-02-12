import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface APIState {
  showPaperManagement: boolean;
  paperNumberRedux: string;
  contentUpdatedFromNetwork: boolean;
  isVip: boolean;
  language: string;
}

const initialState: APIState = {
  showPaperManagement: false,
  paperNumberRedux: "1", //默认得给个值
  contentUpdatedFromNetwork: false,
  isVip: false,
  language: "en",
};

export const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setShowPaperManagement: (state) => {
      state.showPaperManagement = !state.showPaperManagement;
      console.log("state.showPaperManagement", state.showPaperManagement);
    },
    setPaperNumberRedux: (state, action: PayloadAction<string>) => {
      // state.paperNumberRedux = action.payload;
      // console.log("state.paperNumberRedux", state.paperNumberRedux);
      return {
        ...state,
        paperNumberRedux: action.payload,
      };
    },
    setContentUpdatedFromNetwork: (state, action: PayloadAction<boolean>) => {
      state.contentUpdatedFromNetwork = action.payload;
    },
    setIsVip: (state, action: PayloadAction<boolean>) => {
      state.isVip = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setShowPaperManagement,
  setPaperNumberRedux,
  setContentUpdatedFromNetwork,
  setIsVip,
  setLanguage,
} = stateSlice.actions;

export const stateReducer = stateSlice.reducer;

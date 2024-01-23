import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Reference } from "@/utils/global";
export interface APIState {
  apiKey: string;
  referencesRedux: Reference[];
}

const initialState: APIState = {
  apiKey: "",
  referencesRedux: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    addReferenceRedux: (state, action: PayloadAction<Reference>) => {
      state.referencesRedux.push(action.payload);
    },
    addReferencesRedux: (state, action: PayloadAction<Reference[]>) => {
      state.referencesRedux.push(...action.payload);
    },
    removeReferenceRedux: (state, action: PayloadAction<number>) => {
      state.referencesRedux = state.referencesRedux.filter(
        (_, i) => i !== action.payload
      );
    },
    clearReferencesRedux: (state) => {
      state.referencesRedux = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setApiKey,
  addReferenceRedux,
  addReferencesRedux,
  removeReferenceRedux,
  clearReferencesRedux,
} = authSlice.actions;

export const authReducer = authSlice.reducer;

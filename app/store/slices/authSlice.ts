import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface APIState {
  apiKey: string;
}

const initialState: APIState = {
  apiKey: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setApiKey } = authSlice.actions;

export const authReducer = authSlice.reducer;

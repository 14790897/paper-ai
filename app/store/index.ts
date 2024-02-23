import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
import { authReducer } from "./slices/authSlice";
import { stateReducer } from "./slices/stateSlice";
import storage from "./customStorage";
import logger from "redux-logger";

const authPersistConfig = {
  key: "chatapi",
  storage: storage,
  whitelist: [
    "apiKey",
    "referencesRedux",
    "editorContent",
    "upsreamUrl",
    "systemPrompt",
  ],
};

const statePersistConfig = {
  key: "state1",
  storage: storage,
  whitelist: [
    "showPaperManagement",
    "paperNumberRedux",
    "contentUpdatedFromNetwork",
    "isVip",
    "language",
    "isJumpToReference",
    "isEvaluateTopicMatch",
    "citationStyle",
  ],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  state: persistReducer(statePersistConfig, stateReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), //.concat(logger)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

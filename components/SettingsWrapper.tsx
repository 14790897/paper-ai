"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import Settings from "@/components/Settings";

export default function SettingsWrapper() {
  return (
    <ReduxProvider>
      <Settings />
    </ReduxProvider>
  );
}

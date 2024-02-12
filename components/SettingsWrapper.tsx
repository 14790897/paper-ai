"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import Settings from "@/components/Settings";

export default function SettingsWrapper({ lng }) {
  return (
    <ReduxProvider>
      <Settings lng={lng} />
    </ReduxProvider>
  );
}

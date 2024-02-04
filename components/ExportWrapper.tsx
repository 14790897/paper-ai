"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import ExportDocx from "@/components/Export";

export default function SettingsWrapper({ editor }: ParaIn) {
  return (
    <ReduxProvider>
      <ExportDocx editor={quill} />
    </ReduxProvider>
  );
}

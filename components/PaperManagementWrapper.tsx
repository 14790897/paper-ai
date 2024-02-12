"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import PaperManagement from "@/components/PaperManagement";

export default function PaperManagementWrapper({ lng }) {
  return (
    <ReduxProvider>
      <PaperManagement lng={lng} />
    </ReduxProvider>
  );
}

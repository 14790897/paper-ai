"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import PaperManagement from "@/components/PaperManagement";

export default function PaperManagementWrapper() {
  return (
    <ReduxProvider>
      <PaperManagement />
    </ReduxProvider>
  );
}

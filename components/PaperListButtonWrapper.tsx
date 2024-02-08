"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import PaperListButton from "@/components/PaperListButton";

export default function PaperListButtonWrapper() {
  return (
    <ReduxProvider>
      <PaperListButton />
    </ReduxProvider>
  );
}

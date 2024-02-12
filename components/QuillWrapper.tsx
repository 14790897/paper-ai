"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import QEditor from "@/components/QuillEditor";

export default function QuillWrapper() {
  return (
    <ReduxProvider>
      <QEditor />
    </ReduxProvider>
  );
}

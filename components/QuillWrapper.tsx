"use client";

import ReduxProvider from "@/app/store/ReduxProvider";
import QEditor from "@/components/QuillEditor";

export default function QuillWrapper({ lng }) {
  return (
    <ReduxProvider>
      <QEditor lng={lng} />
    </ReduxProvider>
  );
}

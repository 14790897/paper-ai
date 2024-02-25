"use client";
import dynamic from "next/dynamic";
import ReduxProvider from "@/app/store/ReduxProvider";
// import QEditor from "@/components/QuillEditor";

// 动态导入 QuillEditor 组件，禁用 SSR
const QEditor = dynamic(() => import("@/components/QuillEditor"), {
  ssr: false,
});
export default function QuillWrapper({ lng }) {
  return (
    <ReduxProvider>
      <QEditor lng={lng} />
    </ReduxProvider>
  );
}

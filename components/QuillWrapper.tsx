"use client";
import dynamic from "next/dynamic";
import ReduxProvider from "@/app/store/ReduxProvider";
import LoadingIndicator from "@/components/LoadingIndicator"; // 确保路径正确
// import QEditor from "@/components/QuillEditor";

// 动态导入 QuillEditor 组件，禁用 SSR
const QEditor = dynamic(() => import("@/components/QuillEditor"), {
  ssr: false,
  loading: () => <LoadingIndicator />,
});
export default function QuillWrapper({ lng }) {
  return (
    <ReduxProvider>
      <QEditor lng={lng} />
    </ReduxProvider>
  );
}

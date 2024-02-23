"use client";
import { useCallback } from "react";
import { saveAs } from "file-saver";
import * as quillToWord from "quill-to-word";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import ReduxProvider from "@/app/store/ReduxProvider";
import { Reference } from "@/utils/global";
import { getAllFullReferences } from "@/utils/others/quillutils";
type ParaIn = {
  editor: any;
};

const ExportDocx = ({ editor }: ParaIn) => {
  const references = useAppSelector((state) => state.auth.referencesRedux);
  const citationStyle = useAppSelector((state) => state.state.citationStyle);

  const prepareReferencesForQuill = (references: Reference[]) => {
    // 首先添加一个标题
    const referencesWithTitle = [
      {
        attributes: {
          bold: true,
          align: "center",
        },
        insert: "\n参考文献\n",
      },
    ];
    const referencesString = getAllFullReferences(references, citationStyle);
    const quillReferences = [
      {
        attributes: {
          // 提供默认值，即使这些值不会改变文本样式
          bold: false, // 默认为false，因为引用通常不需要加粗
          align: "left", // 默认为left，这是大多数文本的常规对齐方式
        },
        insert: referencesString,
      },
    ];
    // 合并标题和引用列表
    return referencesWithTitle.concat(quillReferences);
  };

  const exportToWord = useCallback(async () => {
    console.log(editor);
    if (!editor) {
      console.error("Editor is not initialized yet");
      return;
    }

    // 准备引用内容
    const quillReferences = prepareReferencesForQuill(references);

    // 获取当前编辑器内容
    let editorContents = editor.getContents();

    // 添加引用到编辑器内容的末尾
    quillReferences.forEach((reference) => {
      editorContents.ops.push(reference);
    });
    // editor.updateContents({
    //   ops: quillReferences,
    // });
    console.log("editorContents", editorContents);
    const quillToWordConfig = {
      exportAs: "blob",
    };

    const docAsBlob = await quillToWord.generateWord(
      editorContents,
      quillToWordConfig
    );
    saveAs(docAsBlob, "word-export.docx");
  }, [editor, references]);

  return (
    <ReduxProvider>
      <div className="flex justify-center items-center">
        <button
          onClick={exportToWord}
          className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow"
        >
          Export to Word
        </button>
      </div>
    </ReduxProvider>
  );
};

export default ExportDocx;

import { useCallback } from "react";
import { saveAs } from "file-saver";
import * as quillToWord from "quill-to-word";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import ReduxProvider from "@/app/store/ReduxProvider";
import { Reference } from "@/utils/global";
import { formatAllReferencesForCopy } from "@/utils/others/quillutils";
type ParaIn = {
  editor: any;
};

const ExportDocx = ({ editor }: ParaIn) => {
  const references = useAppSelector((state) => state.auth.referencesRedux);

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
    const referencesString = formatAllReferencesForCopy(references);
    const quillReferences = [{ insert: referencesString }];
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

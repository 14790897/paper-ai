import { useCallback } from "react";
import { saveAs } from "file-saver";
import * as quillToWord from "quill-to-word";
type ReferenceListProps = {
  editor: any;
};

const ExportDocx = ({ editor }: ReferenceListProps) => {
  const exportToWord = useCallback(async () => {
    console.log(editor);
    if (!editor) {
      console.error("Editor is not initialized yet");
      return;
    }
    const quillToWordConfig = {
      exportAs: "blob",
    };

    const docAsBlob = await quillToWord.generateWord(
      editor.getContents(),
      quillToWordConfig
    );
    saveAs(docAsBlob, "word-export.docx");
  }, [editor]);

  return (
    <div className="flex justify-center items-center h-screen">
      <button
        onClick={exportToWord}
        className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded shadow"
      >
        Export to Word
      </button>
    </div>
  );
};

export default ExportDocx;

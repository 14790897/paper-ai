"use client";

import { Editor } from "@tinymce/tinymce-react";
import React, { useRef } from "react";

const TinyEditor = () => {
  const editorRef = useRef<Editor | null>(null);

  const handleEditorChange = (content, editor) => {
    console.log("Content was updated:", content);
  };

  // 添加一个函数来以编程的方式插入文本
  const insertTextAtCursor = (text) => {
    const editor = editorRef.current;
    if (editor) {
      editor.insertContent(text); // 使用 insertContent 方法插入文本
    }
  };
  return (
    <Editor
      initialValue="<p></p>"
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      init={{
        height: 500,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | " +
          "bold italic backcolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default TinyEditor;

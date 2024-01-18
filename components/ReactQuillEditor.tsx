"use client";

import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import "quill/dist/quill.snow.css";

// 一些工具函数导入
import getArxivPapers from "./GetArxiv";
import sendMessageToOpenAI from "./chatAI";


const QEditor = () => {
  const [quill, setQuill] = useState(null);
  const [userInput, setUserInput] = useState("");

  const [content, setContent] = useState("");
  
  // 处理内容变化
  const handleContentChange = (content) => {
    setContent(content);
    convertToSuperscript();
  };


  function convertToSuperscript() {
    const text = quill.getText();
    const regex = /\[\d+\]/g; // 正则表达式匹配 "[数字]" 格式
    let match;

    while ((match = regex.exec(text)) !== null) {
      const startIndex = match.index;
      const length = match[0].length;

      // 应用上标格式
      quill.formatText(startIndex, length, { script: "super" });
      // 重置格式（如果需要）
      if (startIndex + length < text.length) {
        quill.formatText(startIndex + length, 1, "script", false);
      }
    }
  }
  // 处理按钮点击事件来插入文本
  const handleButtonClick = () => {
    if (quill) {
      quill.insertText(quill.getLength(), "Hello, World!");
    }
  };

  // 处理用户输入变化
  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const paper2AI = (topic: string) => {
    getArxivPapers(topic).then((rawData) => {
      // 将每篇文章的信息转换为字符串
      const dataString = rawData
        .map((entry) => {
          return `ID: ${entry.id}\nPublished: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
        })
        .join("");
      // 将处理后的字符串插入到编辑器中
      sendMessageToOpenAI(dataString, quill, quill.getText(), topic);
    });
  };

  // 插入论文信息
  const insertPapers = async (topic: string) => {
    const rawData = await getArxivPapers(topic);
    const dataString = rawData
      .map((entry) => {
        return `ID: ${entry.id}\nPublished: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
      })
      .join("");
    quill.insertText(quill.getLength(), dataString);
  };

  return (
    <div>
      <div className="space-y-2">
        <button
          onClick={handleButtonClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Insert Text
        </button>

        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="shadow appearance-none border rounded py-2 px-3 text-grey-darker"
        />

        {/*<button
          onClick={handleAIClick}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Insert AI Text
        </button>*/}

        <button
          onClick={() => insertPapers("gnn")}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Insert Papers
        </button>

        <button
          onClick={() => paper2AI("gnn")}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Paper2AI
        </button>
      </div>
      <div
        id="editor"
        style={{
          height: "500px",
          width: "600px",
          minHeight: "150px", // 注意驼峰命名法
          maxHeight: "500px",
          overflowY: "auto", // overflow-y -> overflowY
          border: "1px solid #ccc",
          padding: "10px",
        }}
      ></div>
    </div>
  );
};

export default QEditor;

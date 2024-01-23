"use client";

import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useLocalStorage } from "react-use";
import Link from "next/link";

// 一些工具函数导入
import getArxivPapers from "./GetArxiv";
import getSemanticPapers from "./GetSemantic";
import { getTopicFromAI, sendMessageToOpenAI } from "./chatAI";
import {
  getTextBeforeCursor,
  convertToSuperscript,
  removeSpecialCharacters,
  formatTextInEditor,
} from "@/utils/others/quillutils";
import ReferenceList from "./ReferenceList";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import { addReferencesRedux } from "@/app/store/slices/authSlice";
//类型声明
import { Reference } from "@/utils/global";

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // 加粗、斜体、下划线和删除线
  ["blockquote", "code-block"], // 引用和代码块

  [{ header: 1 }, { header: 2 }], // 标题
  [{ list: "ordered" }, { list: "bullet" }], // 列表
  [{ script: "sub" }, { script: "super" }], // 上标/下标
  [{ indent: "-1" }, { indent: "+1" }], // 缩进
  [{ direction: "rtl" }], // 文字方向

  [{ size: ["small", false, "large", "huge"] }], // 字体大小
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // 字体颜色和背景色
  [{ font: [] }], // 字体
  [{ align: [] }], // 对齐方式

  ["clean"], // 清除格式按钮
];

const QEditor = () => {
  //读取redux中的API key
  const apiKey = useAppSelector((state: any) => state.auth.apiKey);
  const [quill, setQuill] = useState(null);
  //询问ai，用户输入
  const [userInput, setUserInput] = useState("");
  //quill编辑器鼠标位置
  const [cursorPosition, setCursorPosition] = useState(null);

  // 初始化 Quill 编辑器
  const isMounted = useRef(false);
  const editor = useRef(null);
  // 选择论文来源
  const [selectedSource, setSelectedSource] = useLocalStorage(
    "semanticScholar",
    "semanticScholar"
  ); // 默认选项
  //选择语言模型
  const [selectedModel, setSelectedModel] = useLocalStorage("gpt3.5", "gpt3.5"); // 默认选项
  //更新参考文献的部分
  // const [references, setReferences] = useLocalStorage<Reference[]>(
  //   "referencesKey",
  //   undefined
  // );
  //redux
  //redux
  const dispatch = useAppDispatch();
  const references = useAppSelector((state) => state.auth.referencesRedux);

  const addReference = (newReference: Reference) => {
    setReferences((prevReferences) => [...prevReferences, newReference]);
  };

  const removeReference = (index: number) => {
    setReferences((prevReferences) =>
      prevReferences.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    if (!isMounted.current) {
      editor.current = new Quill("#editor", {
        modules: {
          toolbar: toolbarOptions,
        },
        theme: "snow",
      });
      // 检查 localStorage 中是否有保存的内容
      const savedContent = localStorage.getItem("quillContent");
      if (savedContent) {
        // 设置编辑器的内容
        editor.current.root.innerHTML = savedContent;
      }

      isMounted.current = true;
      setQuill(editor.current);

      // 监听selection-change事件
      editor.current.on("selection-change", function (range) {
        if (range) {
          // console.log('User has made a new selection', range);
          setCursorPosition(range.index); // 更新光标位置
        } else {
          console.log("No selection or cursor in the editor.");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (quill) {
      // 设置监听器以处理内容变化
      quill.on("text-change", function (delta, oldDelta, source) {
        if (source === "user") {
          // 获取编辑器内容
          const content = quill.root.innerHTML; // 或 quill.getText()，或 quill.getContents()

          // 保存到 localStorage
          localStorage.setItem("quillContent", content);
          setTimeout(() => {
            convertToSuperscript(quill);
          }, 0); // 延迟 0 毫秒，即将函数放入事件队列的下一个循环中执行,不然就会因为在改变文字触发整个函数时修改文本内容造成无法找到光标位置
        }
      });
    }
  }, [quill]);

  // 处理用户输入变化
  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  // 处理AI写作
  const handleAIWrite = async () => {
    quill.setSelection(cursorPosition, 0); // 将光标移动到原来的位置

    const prompt = "请帮助用户完成论文写作，使用用户所说的语言完成";
    await sendMessageToOpenAI(userInput, quill, selectedModel, apiKey, prompt);
  };

  // 处理paper2AI
  async function paper2AI(topic: string) {
    quill.setSelection(cursorPosition, 0); // 将光标移动到原来的位置

    try {
      if (!topic) {
        //使用ai提取当前要请求的论文主题
        const prompt =
          "As a topic extraction assistant, you can help me extract the current discussion of the paper topic, I will enter the content of the paper, you extract the paper topic , no more than two, Hyphenated query terms yield no matches (replace it with space to find matches) return format is: topic1 topic2";
        const userMessage = getTextBeforeCursor(quill, 2000);
        topic = await getTopicFromAI(userMessage, prompt, apiKey);
        console.log("topic in AI before removeSpecialCharacters", topic);
        topic = removeSpecialCharacters(topic);
        topic = topic.split(" ").slice(0, 2).join(" ");
        //如果超过十个字符就截断
        if (topic.length > 10) {
          topic = topic.slice(0, 10);
        }
      }
      console.log("topic in AI", topic);
      let rawData, dataString;
      if (selectedSource === "arxiv") {
        rawData = await getArxivPapers(topic);
        console.log("arxiv rawdata:", rawData);
        // 将 rawData 转换为引用数组
        const newReferences = rawData.map((entry) => ({
          url: entry.id,
          title: entry.title,
          year: entry.published,
          author: entry.author?.slice(0, 3).join(", "),
        }));
        // 更新引用列表状态
        // setReferences((prevReferences) => [
        //   ...prevReferences,
        //   ...newReferences,
        // ]);
        dispatch(addReferencesRedux(newReferences));

        dataString = rawData
          .map((entry) => {
            return `ID: ${entry.id}\nTime: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
          })
          .join("");
      } else if (selectedSource === "semanticScholar") {
        rawData = await getSemanticPapers(topic, "2015-2023");
        // 将 rawData 转换为引用数组
        const newReferences = rawData.map((entry) => ({
          url: entry.url,
          title: entry.title,
          year: entry.year,
          author: entry.authors?.slice(0, 3).join(", "),
          venue: entry.venue,
          journal: entry.journal,
        }));
        // 更新引用列表状态
        // setReferences((prevReferences) => [
        //   ...prevReferences,
        //   ...newReferences,
        // ]);
        dispatch(addReferencesRedux(newReferences));

        dataString = rawData
          .map((entry) => {
            return `Time: ${entry.year}\nTitle: ${entry.title}\nSummary: ${entry.abstract}\n\n`;
          })
          .join("");
      }
      // 确保搜索到的论文不超过 3000 个字符
      const trimmedMessage =
        dataString.length > 3000 ? dataString.slice(0, 3000) : dataString;
      //slate的方法
      // const content = `需要完成的论文主题：${topic},  搜索到的论文内容:${trimmedMessage},之前已经完成的内容上下文：${extractText(
      //   editorValue
      // )}`;
      const content = `之前用户已经完成的内容上下文：${getTextBeforeCursor(
        quill,
        500
      )},搜索到的论文内容:${trimmedMessage},需要完成的论文主题：${topic},请根据搜索到的论文内容完成用户的论文`;
      sendMessageToOpenAI(content, quill, selectedModel, apiKey);
    } catch (error) {
      console.error("Error fetching data:", error);
      // 在处理错误后，再次抛出这个错误
      throw error;
    }
  }

  // 插入论文信息
  // const insertPapers = async (topic: string) => {
  //   const rawData = await getArxivPapers(topic);
  //   const dataString = rawData
  //     .map((entry) => {
  //       return `ID: ${entry.id}\nPublished: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
  //     })
  //     .join("");
  //   quill.insertText(quill.getLength(), dataString);
  // };

  return (
    <div>
      <div id="Qtoolbar" className="space-y-2 flex justify-between">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="flex-grow shadow appearance-none border rounded py-2 px-3 mr-2 text-grey-darker"
          placeholder="点击AI Write就是正常的对话交流，点击Paper2AI会根据输入的主题词去寻找对应论文" // 这是你的提示
        />
        <button
          onClick={handleAIWrite}
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 mr-2 rounded"
        >
          AI Write
        </button>
        {/* <button
          onClick={() => insertPapers(userInput)}
          className="bg-indigo-500 hover:bg-indigo-700 text-black font-bold py-2 px-4 rounded"
        >
          Insert Papers
        </button> */}
        <button
          onClick={() => paper2AI(userInput)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 mr-2 rounded"
        >
          Paper2AI
        </button>
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className=" border border-gray-300 bg-white py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        >
          <option value="arxiv">arxiv</option>
          <option value="semanticScholar">semantic scholar</option>
          {/* 其他来源网站 */}
        </select>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className=" border border-gray-300 bg-white py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        >
          <option value="gpt3.5">gpt3.5</option>
          <option value="gpt4">gpt4</option>
          {/* 其他来源网站 */}
        </select>
        {/* 用户输入自己的API key */}

        <button
          onClick={() => formatTextInEditor(quill)} // 假设 updateIndex 是处理更新操作的函数
          className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          更新索引
        </button>
      </div>
      <div>
        <div
          id="editor"
          style={{
            width: "calc(100vw - 100px)", // 屏幕宽度减去 100px
            minHeight: "250px", // 注意驼峰命名法
            maxHeight: "500px",
            overflowY: "auto", // overflow-y -> overflowY
            border: "1px solid #ccc",
            padding: "10px",
          }}
        ></div>
        <ReferenceList
          // references={references}
          // addReference={addReference}
          // removeReference={removeReference}
          // setReferences={setReferences}
          editor={quill}
        />
      </div>
    </div>
  );
};

export default QEditor;

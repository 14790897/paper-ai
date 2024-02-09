"use client";

import React, { useState, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useLocalStorage } from "react-use";
import Link from "next/link";

// 一些工具函数导入
import getArxivPapers from "./GetArxiv";
import getSemanticPapers from "./GetSemantic";
import { fetchPubMedData } from "./GetPubMed ";
import { getTopicFromAI, sendMessageToOpenAI } from "./chatAI";
import {
  getTextBeforeCursor,
  convertToSuperscript,
  removeSpecialCharacters,
  formatTextInEditor,
  getNumberBeforeCursor,
} from "@/utils/others/quillutils";
//组件
import ExportDocx from "./Export";
import ReferenceList from "./ReferenceList";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  addReferencesRedux,
  setEditorContent,
} from "@/app/store/slices/authSlice";
import {
  setContentUpdatedFromNetwork,
  setIsVip,
} from "@/app/store/slices/stateSlice";
//类型声明
import { Reference } from "@/utils/global";
//supabase
import { createClient } from "@/utils/supabase/client";
import {
  getUserPapers,
  getUser,
  submitPaper,
} from "@/utils/supabase/supabaseutils";
//debounce
import { debounce } from "lodash";

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
  const upsreamUrl = useAppSelector((state: any) => state.auth.upsreamUrl);
  const [quill, setQuill] = useState<Quill | null>(null);
  const contentUpdatedFromNetwork = useAppSelector(
    (state) => state.state.contentUpdatedFromNetwork
  );
  //vip状态
  const isVip = useAppSelector((state) => state.state.isVip);

  //询问ai，用户输入
  const [userInput, setUserInput] = useState("robot");
  //quill编辑器鼠标位置
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // 初始化 Quill 编辑器
  const isMounted = useRef(false);
  const editor = useRef<Quill | null>(null);
  // 选择论文来源
  const [selectedSource, setSelectedSource] = useLocalStorage(
    "学术引擎",
    "semanticScholar"
  ); // 默认选项
  //选择语言模型
  const [selectedModel, setSelectedModel] = useLocalStorage(
    "gpt语言模型",
    "gpt-4"
  ); // 默认选项
  //redux
  const dispatch = useAppDispatch();
  const references = useAppSelector((state) => state.auth.referencesRedux);
  const editorContent = useAppSelector((state) => state.auth.editorContent); // 从 Redux store 中获取编辑器内容
  const systemPrompt = useAppSelector((state) => state.auth.systemPrompt);
  const paperNumberRedux = useAppSelector(
    (state) => state.state.paperNumberRedux
  );
  //supabase
  const supabase = createClient();
  useEffect(() => {
    if (!isMounted.current) {
      editor.current = new Quill("#editor", {
        modules: {
          toolbar: toolbarOptions,
          history: {
            delay: 2000,
            maxStack: 500, // 调整撤销和重做堆栈的大小
            userOnly: false,
          },
        },
        theme: "snow",
      });

      if (editorContent) {
        editor.current.root.innerHTML = editorContent;
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
      // 添加点击事件监听器
      const handleEditorClick = (e) => {
        const range = editor.current!.getSelection();
        if (range && range.length === 0 && editor.current) {
          const [leaf, offset] = editor.current.getLeaf(range.index);
          if (leaf.text) {
            const textWithoutSpaces = leaf.text.replace(/\s+/g, ""); // 去掉所有空格
            if (/^\[\d+\]$/.test(textWithoutSpaces)) {
              console.log("点击了引用", textWithoutSpaces);
              document.getElementById(textWithoutSpaces)!.scrollIntoView();
            }
          }
        } else {
          console.log("No editor in click.");
        }
      };

      editor.current.root.addEventListener("click", handleEditorClick);

      // 清理函数
      // return () => {
      //   editor.current!.root.removeEventListener("click", handleEditorClick);
      // };
    }
  }, []);

  // 监听editorContent变化(redux的变量)，并使用Quill API更新内容
  useEffect(() => {
    if (editor.current) {
      if (editorContent) {
        if (contentUpdatedFromNetwork) {
          // 清空当前内容
          editor.current.setContents([]);
          // 插入新内容
          editor.current.clipboard.dangerouslyPasteHTML(editorContent);
          // 重置标志
          dispatch(setContentUpdatedFromNetwork(false));
        } else {
          console.log("No content updated from network in useEffect.");
        }
      } else {
        console.log("No editorContent to update in useEffect.");
      }
    } else {
      console.log("No editor.current to update in useEffect.");
    }
  }, [editorContent, contentUpdatedFromNetwork]);

  useEffect(() => {
    if (quill) {
      // 设置监听器以处理内容变化
      quill.on(
        "text-change",
        debounce(async function (delta, oldDelta, source) {
          if (source === "user") {
            // 获取编辑器内容
            const content = quill.root.innerHTML; // 或 quill.getText()，或 quill.getContents()

            // 保存到 localStorage
            // localStorage.setItem("quillContent", content);
            dispatch(setEditorContent(content)); // 更新 Redux store
            //在云端同步supabase
            console.log("paperNumberRedux in quill", paperNumberRedux);
            if (isVip) {
              const data = await submitPaper(
                supabase,
                editorContent,
                references,
                paperNumberRedux
              );
            }
            setTimeout(() => {
              convertToSuperscript(quill);
            }, 0); // 延迟 0 毫秒，即将函数放入事件队列的下一个循环中执行,不然就会因为在改变文字触发整个函数时修改文本内容造成无法找到光标位置
          }
        }, 1000) // 这里的 5000 是防抖延迟时间，单位为毫秒
      );
    }
  }, [quill, dispatch]);

  // 处理用户输入变化
  const handleInputChange = (event: any) => {
    setUserInput(event.target.value);
  };

  // 处理AI写作
  const handleAIWrite = async () => {
    quill.setSelection(cursorPosition, 0); // 将光标移动到原来的位置

    const prompt = "请帮助用户完成论文写作，使用用户所说的语言完成";
    await sendMessageToOpenAI(
      userInput,
      quill,
      selectedModel,
      apiKey,
      upsreamUrl,
      prompt
    );
    // 重新获取更新后的内容并更新 Redux store
    const updatedContent = quill.root.innerHTML;
    dispatch(setEditorContent(updatedContent));
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
      let rawData, dataString, newReferences;
      if (selectedSource === "arxiv") {
        rawData = await getArxivPapers(topic);
        console.log("arxiv rawdata:", rawData);
        // 将 rawData 转换为引用数组
        newReferences = rawData.map((entry) => ({
          url: entry.id,
          title: entry.title,
          year: entry.published,
          author: entry.authors?.slice(0, 3).join(", "),
        }));
        dataString = rawData
          .map((entry) => {
            return `ID: ${entry.id}\nTime: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
          })
          .join("");
      } else if (selectedSource === "semanticScholar") {
        rawData = await getSemanticPapers(topic, "2015-2023");
        // 将 rawData 转换为引用数组
        newReferences = rawData.map((entry) => ({
          url: entry.url,
          title: entry.title,
          year: entry.year,
          author: entry.authors?.slice(0, 3).join(", "),
          venue: entry.venue,
          journalReference: entry.journal
            ? `${entry.journal.name}[J], ${entry.year}${
                entry.journal.volume ? `, ${entry.journal.volume}` : ""
              }${entry.journal.pages ? `: ${entry.journal.pages}` : ""}`
            : "",
        }));
        dataString = rawData
          .map((entry) => {
            return `Time: ${entry.year}\nTitle: ${entry.title}\nSummary: ${entry.abstract}\n\n`;
          })
          .join("");
      } else if (selectedSource === "pubmed") {
        rawData = await fetchPubMedData(topic, 2020, 2);
        if (!rawData) {
          throw new Error("未搜索到文献 from PubMed.");
        }
        newReferences = rawData.map((entry) => ({
          id: entry.id, // 文章的 PubMed ID
          title: entry.title, // 文章的标题
          abstract: entry.abstract, // 文章的摘要
          author: entry.authors.join(", "), // 文章的作者列表，假设为字符串数组
          year: entry.year, // 文章的发表日期
          venue: entry.journal, // 文章的发表杂志
          url: entry.url, // 文章的 URL
          source: "PubMed", // 指示这些引用来自 PubMed
        }));

        // 打印或进一步处理 newReferences
        console.log(newReferences);

        dataString = rawData
          .map((entry) => {
            return `Time: ${entry.year}\nTitle: ${entry.title}\nSummary: ${entry.abstract}\n\n`;
          })
          .join("");
      }
      //在对应的位置添加文献
      const nearestNumber = getNumberBeforeCursor(quill);
      dispatch(
        addReferencesRedux({
          references: newReferences,
          position: nearestNumber,
        })
      );

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
      await sendMessageToOpenAI(
        content,
        quill,
        selectedModel,
        apiKey,
        upsreamUrl,
        systemPrompt
      );
      // 重新获取更新后的内容并更新 Redux store
      const updatedContent = quill.root.innerHTML;
      dispatch(setEditorContent(updatedContent));
      if (isVip) {
        //在云端同步supabase
        const data = await submitPaper(
          supabase,
          editorContent,
          references,
          paperNumberRedux
        );
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
      // 在处理错误后，再次抛出这个错误
      throw new Error(`Paper2AI出现错误: ${error}`);
    }
  }

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
          <option value="pubmed">pubmed</option>
          {/* 其他来源网站 */}
        </select>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className=" border border-gray-300 bg-white py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        >
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4">gpt-4</option>
          <option value="deepseek-chat">deepseek-chat</option>
          {/* 其他来源网站 */}
        </select>
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
        <ReferenceList editor={quill} />
        <ExportDocx editor={quill} />
      </div>
    </div>
  );
};

export default QEditor;

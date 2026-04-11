"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useLocalStorage } from "react-use";
import * as Sentry from "@sentry/react";

// 一些工具函数导入
import getArxivPapers from "./GetArxiv";
import getSemanticPapers from "./GetSemantic";
import { fetchPubMedData } from "./GetPubMed ";
import { sendMessageToOpenAI } from "./chatAI";
import {
  getTextBeforeCursor,
  convertToSuperscript,
  removeSpecialCharacters,
  formatTextInEditor,
  getNumberBeforeCursor,
  formatJournalReference,
} from "@/utils/others/quillutils";
import { evaluateTopicMatch } from "@/utils/others/aiutils";
//组件
import ExportDocx from "./Export";
import ReferenceList from "./ReferenceList";
import ProgressDisplay from "./ProgressBar";
//redux
import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  addReferencesRedux,
  setEditorContent,
  setApiKey,
  setUpsreamUrl,
} from "@/app/store/slices/authSlice";
import { setContentUpdatedFromNetwork } from "@/app/store/slices/stateSlice";
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
//i18n
import { useTranslation } from "@/app/i18n/client";
//notification
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showExpandableToast } from "@/components/Notification";

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

const QEditor = ({ lng }) => {
  //i18n
  const { t } = useTranslation(lng);

  //读取redux中的API key
  const apiKey = useAppSelector((state: any) => state.auth.apiKey);
  const upsreamUrl = useAppSelector((state: any) => state.auth.upsreamUrl);
  const isJumpToReference = useAppSelector(
    (state) => state.state.isJumpToReference
  );
  const isEvaluateTopicMatch = useAppSelector(
    (state) => state.state.isEvaluateTopicMatch
  );
  const [quill, setQuill] = useState<Quill | null>(null);
  const contentUpdatedFromNetwork = useAppSelector(
    (state) => state.state.contentUpdatedFromNetwork
  );
  //vip状态
  const isVip = useAppSelector((state) => state.state.isVip);

  //询问ai，用户输入
  const [userInput, setUserInput] = useState("");
  //quill编辑器鼠标位置
  const [cursorPosition, setCursorPosition] = useLocalStorage<number | null>(
    "光标位置",
    0
  );
  const cursorPositionRef = useRef<number>(0);
  
  //
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
    "deepseek-chat"
  ); // 默认选项
  const [customModel, setCustomModel] = useLocalStorage(
    "自定义模型",
    ""
  ); // 自定义模型名称
  const [isCustomModel, setIsCustomModel] = useLocalStorage(
    "使用自定义模型",
    false
  ); // 是否使用自定义模型
  const [generatedPaperNumber, setGeneratedPaperNumber] = useLocalStorage(
    "生成次数",
    1
  ); // 初始值设为1
  //选择时间范围
  const [timeRange, setTimeRange] = useLocalStorage("时间范围", "2019");
  const [generateNumber, setGenerateNumber] = useState(0); //当前任务的进行数
  const [openProgressBar, setOpenProgressBar] = useState(false); //设置进度条是否打开
  const [showAnnouncement, setShowAnnouncement] = useLocalStorage(
    "显示公告",
    false
  ); // 是否显示公告
  const [controller, setController] = useState<AbortController | null>(null); // 创建 AbortController 的状态

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

  // 获取实际使用的模型名称
  const getActualModel = () => {
    return isCustomModel && customModel ? customModel : selectedModel;
  };

  useEffect(() => {
    if (typeof cursorPosition === "number") {
      cursorPositionRef.current = cursorPosition;
    }
  }, [cursorPosition]);

  const getResolvedCursorPosition = () => {
    const liveSelection = quill?.getSelection();
    if (liveSelection && typeof liveSelection.index === "number") {
      cursorPositionRef.current = liveSelection.index;
      return liveSelection.index;
    }
    return cursorPositionRef.current;
  };

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
          cursorPositionRef.current = range.index;
          setCursorPosition(range.index); // 更新光标位置
        } else {
          console.log("No selection or cursor in the editor.");
        }
      });
      // 添加点击事件监听器
      const handleEditorClick = (e) => {
        if (isJumpToReference) {
          const range = editor.current!.getSelection();
          if (range && range.length === 0 && editor.current) {
            const [leaf, offset] = editor.current.getLeaf(range.index);
            if (leaf.text) {
              const textWithoutSpaces = leaf.text.replace(/\s+/g, ""); // 去掉所有空格
              if (/^\[\d+\]$/.test(textWithoutSpaces)) {
                console.log("点击了引用", textWithoutSpaces);
                try {
                  document.getElementById(textWithoutSpaces)!.scrollIntoView();
                } catch (e) {
                  console.log("没有找到对应的引用");
                }
              }
            }
          } else {
            console.log("No editor in click.");
          }
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
  //日常通知可以放在这里
  useEffect(() => {
    if (showAnnouncement) {
      toast(
        "📢 如果遇到模型无法响应的情况，建议右上角切换为coze模型（也是gpt4）",
        {
          position: "top-center",
          autoClose: false, // 设置为 false，使得公告需要用户手动关闭，确保用户看到公告信息
          closeOnClick: false, // 防止用户意外点击关闭公告
          pauseOnHover: true, // 鼠标悬停时暂停自动关闭，因为 autoClose 已设为 false，此设置可保留或去除
          draggable: true, // 允许用户拖动公告
          progress: undefined,
          closeButton: true, // 显示关闭按钮，让用户可以在阅读完毕后关闭公告
          hideProgressBar: true, // 隐藏进度条，因为公告不会自动关闭
          style: {
            // 自定义样式，使公告更加显眼
            backgroundColor: "#fffae6", // 浅黄色背景
            color: "#333333", // 文字颜色
            fontWeight: "bold",
            fontSize: "16px",
            border: "1px solid #ffd700", // 边框颜色
            boxShadow: "0px 0px 10px #ffd700", // 添加阴影，增加显眼度
          },
          // 当公告被关闭时，设置 localStorage，以防再次显示
          onClose: () => setShowAnnouncement(false),
        }
      );
    }
  }, []);
  // 强制更新为我设置的API
  // useEffect(() => {
  //   dispatch(setApiKey("sk-GHuPUV6ERD8wVmmr36FeB8D809D34d93Bb857c009f6aF9Fe"));
  //   dispatch(setUpsreamUrl("https://one.14790897.xyz"));
  // });
  useEffect(() => {
    if (upsreamUrl === "https://one.paperai.life"|| upsreamUrl === "https://one.14790897.xyz") {
      dispatch(
        setApiKey("sk-GHuPUV6ERD8wVmmr36FeB8D809D34d93Bb857c009f6aF9Fe")
      );
      dispatch(setUpsreamUrl("https://new.14790897.xyz"));
    }
  }, [upsreamUrl]);
  const handleTextChange = debounce(async function (delta, oldDelta, source) {
    if (source === "user") {
      // 获取编辑器内容
      const content = quill!.root.innerHTML; // 或 quill.getText()，或 quill.getContents()
      dispatch(setEditorContent(content)); // 更新 Redux store
      //在云端同步supabase
      // console.log("paperNumberRedux in quill", paperNumberRedux);
      if (isVip) {
        const data = await submitPaper(
          supabase,
          content,
          undefined,
          paperNumberRedux
        );
      }
      setTimeout(() => {
        convertToSuperscript(quill!);
      }, 0); // 延迟 0 毫秒，即将函数放入事件队列的下一个循环中执行,不然就会因为在改变文字触发整个函数时修改文本内容造成无法找到光标位置
    }
  }, 1000); // 这里的 1000 是防抖延迟时间，单位为毫秒

  useEffect(() => {
    if (quill) {
      // 设置监听器以处理内容变化
      quill.on("text-change", handleTextChange);
      // 清理函数
      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill, dispatch, paperNumberRedux]);

  // 处理用户输入变化
  const handleInputChange = (event: any) => {
    setUserInput(event.target.value);
  };
  // 处理输入generatedPaperNumber变化的函数
  const handleGeneratedPaperNumberChange = (event: any) => {
    const newValue = parseInt(event.target.value, 10);
    setGeneratedPaperNumber(newValue);
  };

  // 处理handleAIAction
  async function handleAIAction(topic: string, actionType: string) {
    // 创建一个新的 AbortController 实例
    const newController = new AbortController();
    setController(newController);
    const targetCursorPosition = getResolvedCursorPosition();
    quill!.setSelection(targetCursorPosition, 0); // 将光标移动到原来的位置
    setOpenProgressBar(true); //开启进度条
    try {
      if (actionType === "write") {
        // 写作逻辑
        const prompt = "请帮助用户完成论文写作，使用用户所说的语言完成";
        await sendMessageToOpenAI(
          userInput,
          quill!,
          getActualModel()!,
          apiKey,
          upsreamUrl,
          prompt,
          targetCursorPosition,
          true,
          newController.signal, // 传递 AbortSignal
        );
      } else if (actionType === "paper2AI") {
        // paper2AI 逻辑，根据 actionParam 处理特定任务
        if (!topic?.trim()) {
          toast.info("未输入关键词，正在根据当前内容自动提取主题", {
            position: "top-center",
            autoClose: 2000,
            pauseOnHover: true,
          });
        }
        let offset = -1;
        if (generatedPaperNumber != 1) offset = 0; //如果生成的数量不为1，则从0开始
        //如果说要评估主题是否匹配的话,就要多获取一些文献
        let limit = 2;
        if (isEvaluateTopicMatch) {
          limit = 4;
        }

        for (let i = 0; i < generatedPaperNumber!; i++) {
          if (!topic) {
            //使用ai提取当前要请求的论文主题
            const prompt =
              "As a topic extraction assistant, help me extract the current paper topic from the provided context. Return no more than two keywords. Prioritize English academic keywords (translate non-English topic words into standard English terms when possible). Hyphenated query terms yield no matches, so replace hyphens with spaces. Return format: topic1 topic2";
            const selection = quill!.getSelection();
            const cursorIndex = selection ? selection.index : quill!.getLength();
            const beforeLength = 1200;
            const afterLength = 800;
            const beforeStart = Math.max(0, cursorIndex - beforeLength);
            const beforeText = quill!.getText(beforeStart, cursorIndex - beforeStart);
            const afterText = quill!.getText(cursorIndex, afterLength);
            const userMessage = `前文:\n${beforeText}\n\n后文:\n${afterText}`;
            topic = await sendMessageToOpenAI(
              userMessage,
              null,
              getActualModel()!,
              apiKey,
              upsreamUrl,
              prompt,
              null,
              false,
              newController.signal, // 传递 AbortSignal
            );
            console.log("topic in AI before removeSpecialCharacters", topic);
            topic = removeSpecialCharacters(topic);
            topic = topic.split(" ").slice(0, 2).join(" ");
            //如果超过十个字符就截断
            if (topic.length > 10) {
              topic = topic.slice(0, 10);
            }
          }
          console.log(
            "topic in AI:",
            topic,
            "offset in paper2AI:",
            offset,
            "limit in paper2AI:",
            limit,
          );
          let rawData, dataString, newReferences;
          if (selectedSource === "arxiv") {
            rawData = await getArxivPapers(topic, limit, offset);
            //判断返回的文献是否跟用户输入的主题相关
            if (isEvaluateTopicMatch) {
              const { relevantPapers, nonRelevantPapers } =
                await evaluateTopicMatch(
                  rawData,
                  apiKey,
                  upsreamUrl,
                  getActualModel()!,
                  topic,
                  newController.signal,
                );
              rawData = relevantPapers;
            }
            console.log("arxiv rawdata:", rawData);
            // 将 rawData 转换为引用数组
            newReferences = rawData.map((entry: any) => ({
              url: entry.id,
              title: entry.title,
              year: entry.published,
              author: entry.authors?.slice(0, 3).join(", "),
            }));
            dataString = rawData
              .map((entry: any) => {
                return `ID: ${entry.id}\nTime: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.abstract}\n\n`;
              })
              .join("");
          } else if (selectedSource === "semanticScholar") {
            rawData = await getSemanticPapers(
              topic,
              `${timeRange}-2024`,
              offset,
              limit,
            );
            //判断返回的文献是否跟用户输入的主题相关
            if (isEvaluateTopicMatch) {
              const { relevantPapers, nonRelevantPapers } =
                await evaluateTopicMatch(
                  rawData,
                  apiKey,
                  upsreamUrl,
                  getActualModel()!,
                  topic,
                  newController.signal,
                );
              rawData = relevantPapers;
            }
            // 将 rawData 转换为引用数组
            newReferences = rawData.map((entry: any) => ({
              url: entry.url,
              title: entry.title,
              year: entry.year,
              author: entry.authors?.slice(0, 3).join(", "),
              venue: entry.venue,
              journal: formatJournalReference(entry),
              doi: entry.externalIds.DOI,
            }));
            dataString = rawData
              .map((entry: any) => {
                return `Time: ${entry.year}\nTitle: ${entry.title}\nSummary: ${entry.abstract}\n\n`;
              })
              .join("");
          } else if (selectedSource === "pubmed") {
            rawData = await fetchPubMedData(
              topic,
              Number(timeRange)!,
              offset,
              limit,
            );
            if (!rawData) {
              throw new Error("未搜索到文献 from PubMed.");
            }
            //判断返回的文献是否跟用户输入的主题相关
            if (isEvaluateTopicMatch) {
              const { relevantPapers, nonRelevantPapers } =
                await evaluateTopicMatch(
                  rawData,
                  apiKey,
                  upsreamUrl,
                  getActualModel()!,
                  topic,
                  newController.signal,
                );
              rawData = relevantPapers;
            }
            newReferences = rawData.map((entry: any) => ({
              id: entry.id, // 文章的 PubMed ID
              title: entry.title, // 文章的标题
              abstract: entry.abstract, // 文章的摘要
              author: entry.authors?.slice(0, 3).join(", "), // 文章的作者列表，假设为字符串数组
              year: entry.year, // 文章的发表日期
              journal: entry.journal, // 文章的发表杂志
              url: entry.url, // 文章的 URL
              source: "PubMed", // 指示这些引用来自 PubMed
              doi: entry.doi, // 文章的 DOI
            }));

            // 打印 newReferences
            console.log(newReferences);
            dataString = rawData
              .map((entry: any) => {
                return `Time: ${entry.year}\nTitle: ${entry.title}\nSummary: ${entry.abstract}\n\n`;
              })
              .join("");
          }

          // 确保搜索到的论文不超过 3000 个字符
          const trimmedMessage =
            dataString.length > 3000 ? dataString.slice(0, 3000) : dataString;
          // 生成AI PROMPT
          const content = `之前用户已经完成的内容上下文：${getTextBeforeCursor(
            quill!,
            800,
          )},搜索到的论文内容:${trimmedMessage},需要完成的论文主题：${topic},请根据搜索到的论文内容完成用户的论文`;
          showExpandableToast(`搜索论文完成，搜索到的论文:${trimmedMessage}`);
          await sendMessageToOpenAI(
            content,
            quill!,
            getActualModel()!,
            apiKey,
            upsreamUrl,
            systemPrompt,
            targetCursorPosition,
            true,
            newController.signal, // 传递 AbortSignal
          );
          //在对应的位置添加文献
          const nearestNumber = getNumberBeforeCursor(quill!);
          dispatch(
            addReferencesRedux({
              references: newReferences,
              position: nearestNumber,
            }),
          );
          //修改offset使得按照接下来的顺序进行获取文献
          offset += 2;
          setGenerateNumber(i + 1);
        }
        setUserInput(""); // 只有在全部成功之后才清空input内容
      }
      toast.success(
        `AI ${actionType == "write" ? "写作" : "文献获取总结"}完成`,
        {
          position: "top-center",
          autoClose: 2000,
          pauseOnHover: true,
        },
      );
    } catch (error) {
      toast.error(`AI写作出现错误(持续无法使用请切换deepseek模型): ${error}`, {
        position: "top-center",
        autoClose: 3000,
        pauseOnHover: true,
      });
      Sentry.captureMessage(`AI写作出现错误: ${error}`, "error");
    } finally {
      // 通用的后处理逻辑
      const updatedContent = quill!.root.innerHTML;
      dispatch(setEditorContent(updatedContent));
      if (isVip) {
        //在云端同步supabase
        const data = await submitPaper(
          supabase,
          updatedContent,
          references,
          paperNumberRedux,
        );
      }
      setOpenProgressBar(false);
      setGenerateNumber(0); //总的已经生成的数量设置为0 以便下次使用
    }
  }

  const handleStop = () => {
    if (controller) {
      controller.abort(); // 取消请求
      setController(null); // 重置 controller 状态
    }
  };

  const buttonBaseClass =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
  const secondaryButtonClass =
    `${buttonBaseClass} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400`;
  const primaryButtonClass =
    `${buttonBaseClass} border border-amber-600 bg-amber-500 text-white shadow-md hover:bg-amber-600 hover:shadow-lg focus-visible:ring-amber-500`;
  const utilityButtonClass =
    `${buttonBaseClass} whitespace-nowrap border border-slate-300 bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200 hover:border-slate-400 focus-visible:ring-slate-400`;
  const dangerButtonClass =
    `${buttonBaseClass} fixed bottom-4 left-4 border border-red-700 bg-red-600 text-white shadow-lg hover:bg-red-700 hover:shadow-xl focus-visible:ring-red-500`;

  return (
    <div className="flex flex-col ">
      <div
        id="Qtoolbar"
        className="flex flex-col md:flex-row md:flex-wrap gap-2 md:items-center justify-between mb-2 p-2 bg-gray-50 rounded"
      >
        <textarea
          value={userInput}
          onChange={handleInputChange}
          className="textarea-focus-expand flex-grow shadow appearance-none border rounded py-2 px-3 lg:mr-2 text-grey-darker w-full md:w-auto"
          placeholder={t(
            "点击AI写作是正常对话；点击寻找文献会按关键词找文献（可留空，系统将自动根据上下文提取主题）",
          )}
        />

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={() => handleAIAction(userInput, "write")}
            className={secondaryButtonClass}
          >
            {t("AI写作")}
          </button>
          <button
            onClick={() => handleAIAction(userInput, "paper2AI")}
            className={primaryButtonClass}
          >
            {t("Paper2AI")}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto mt-2 md:mt-0">
          {/* 论文网站 */}
          <select
            title={t("选择论文来源")}
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="border border-gray-300 bg-white py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="arxiv">arxiv</option>
            <option value="semanticScholar">semantic scholar</option>
            <option value="pubmed">pubmed</option>
          </select>
          {/* AI模型 */}
          <select
            title={t("选择AI模型")}
            value={isCustomModel ? "custom" : selectedModel}
            onChange={(e) => {
              if (e.target.value === "custom") {
                setIsCustomModel(true);
              } else {
                setIsCustomModel(false);
                setSelectedModel(e.target.value);
              }
            }}
            className="border border-gray-300 bg-white py-2 px-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="gpt-4.1">gpt-4.1</option>
            <option value="gemini-flash-latest">gemini-flash-latest</option>
            <option value="deepseek-chat">deepseek-chat</option>
            <option value="custom">{t("自定义模型")}</option>
          </select>
          {/* 自定义模型输入框 */}
          {isCustomModel && (
            <input
              type="text"
              title={t("输入自定义模型名称")}
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder={t("输入模型名称")}
              className="border border-gray-300 text-gray-700 text-sm py-2 px-3 rounded focus:outline-none focus:bg-white focus:border-gray-500 w-24 md:w-auto"
            />
          )}
          {/* 进行几轮生成 */}
          <input
            type="number"
            title={t("生成轮数")}
            value={generatedPaperNumber}
            onChange={handleGeneratedPaperNumberChange}
            className="border border-gray-300 text-gray-700 text-sm p-2 rounded w-16"
          />
          {/* 时间范围 */}
          <input
            type="number"
            title={t("时间范围")}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 text-gray-700 text-sm p-2 rounded w-20"
          />
          <button
            onClick={() => formatTextInEditor(quill)}
            className={utilityButtonClass}
            title={t("更新文中的上标，使得数字顺序排列")}
          >
            {t("更新索引")}
          </button>
        </div>
      </div>
      {openProgressBar ? (
        <ProgressDisplay
          generatedPaperNumber={generatedPaperNumber!}
          i={generateNumber}
        />
      ) : null}
      <div>
        <div id="editor"></div>
        <ReferenceList editor={quill} lng={lng} />
        <ExportDocx editor={quill} />
      </div>
      {/* 停止生成的按钮只有在开始对话之后才会出现 */}
      {openProgressBar ? (
        <button
          onClick={handleStop}
          className={dangerButtonClass}
        >
          {t("停止生成")}
        </button>
      ) : null}

      <ToastContainer />
    </div>
  );
};

export default QEditor;

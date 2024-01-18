"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  createEditor,
  Transforms,
  Editor,
  Node,
  Descendant,
  Element,
  Text,
} from "slate";
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";
import getArxivPapers from "./GetArxiv";
import sendMessageToOpenAI from "./chatAI";
import isEqual from 'lodash/isEqual';


const SEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [userInput, setUserInput] = useState("");

  const [editorValue, setEditorValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "2.gnn的国内外研究状况\n" },
    {text: '[2]', superscript: true}],
    },
  ]);

  const handleButtonClick = () => {
    // 在当前光标位置插入文本
    Transforms.insertText(editor, "Hello, World!");
  };

  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  // const handleAIClick = () => {
  //   sendMessageToOpenAI(userInput, editor, editorValue, topic);
  // };

  const paper2AI = (topic: string) => {
    getArxivPapers(topic).then((rawData) => {
      // 将每篇文章的信息转换为字符串
      const dataString = rawData
        .map((entry) => {
          return `ID: ${entry.id}\nPublished: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
        })
        .join("");
      // 将处理后的字符串插入到编辑器中
      sendMessageToOpenAI(dataString, editor, editorValue, topic);
    });
  };

  const insertPapers = (topic: string) => {
    getArxivPapers(topic).then((rawData) => {
      // 将每篇文章的信息转换为字符串
      const dataString = rawData
        .map((entry) => {
          return `ID: ${entry.id}\nPublished: ${entry.published}\nTitle: ${entry.title}\nSummary: ${entry.summary}\n\n`;
        })
        .join("");

      // 将处理后的字符串插入到编辑器中
      Transforms.insertText(editor, dataString);
    });
  };

  // const handleTextChange = (value: Descendant[]) => {
  //   // console.log("Original value:", value); // 打印初始值
  //   // 如果值没有变化，不做任何操作
  //   // if (isEqual(value, editor.children)) return;
  //   const newValue = value.map((node: Node) => {
  //     // console.log("Processing node:", node); // 打印当前处理的节点

  //     if (Element.isElement(node) && node.type === "paragraph") {
  //       const newTexts = node.children
  //         .map((child) => {
  //           // console.log("Processing child:", child); // 打印子节点

  //           if (Text.isText(child)) {
  //             const parts = child.text.split(/(\[\d+\])/).filter(Boolean);
  //             // console.log("Text parts after split:", parts); // 打印拆分后的部分

  //             return parts.map((part) => {
  //               // 检查部分是否为上标文本
  //               if (/\[\d+\]/.test(part)) {
  //                 console.log("Superscript part found:", part); // 打印发现的上标部分
  //                 // 将方括号内的数字作为上标处理
  //                 return { text: part, superscript: true };
  //               }
  //               // 普通文本部分
  //               return { text: part };
  //             });
  //           }
  //           return child;
  //         })
  //         .flat();

  //       // console.log("New texts for node:", newTexts); // 打印节点的新文本

  //       return {
  //         ...node,
  //         children: newTexts,
  //       };
  //     }
  //     return node;
  //   });
  //   // console.log("New value:", newValue); // 打印最终的新值
  //   setEditorValue(newValue);
  //   // 直接更新编辑器实例的子节点
  //   editor.children = newValue;

  //   // 手动触发编辑器的 onChange 事件
  //   editor.onChange();
  //   console.log("New editorValue:", editorValue); // 打印最终的新值
  // };

  const handleTextChange = (value: Descendant[]) => {
    // if (isEqual(value, editor.children)) return;
  
    value.forEach((node, index) => {
      if (Element.isElement(node) && node.type === 'paragraph') {
        const path = [index]; // 获取当前节点的路径
        const newTexts = node.children.map((child) => {
          if (Text.isText(child)) {
            const parts = child.text.split(/(\[\d+\])/).filter(Boolean);
            return parts.map((part) => {
              if (/\[\d+\]/.test(part)) {
                // 处理上标文本
                return { text: part, superscript: true };
              }
              // 普通文本
              return { text: part };
            });
          }
          return child;
        }).flat();
  
        // 使用 Transforms 更新节点
        Transforms.setNodes(editor, { children: newTexts }, { at: path });
      }
    });
  
    // 由于已经使用 Transforms 更新了编辑器，因此不需要手动触发 onChange
    // editor.onChange(); // 这一行应该被移除
  };

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    // 打印被渲染的叶子节点的属性和子元素
    console.log("Rendering leaf:", props.leaf, "Children:", props.children);

    if (props.leaf.superscript) {
      // 如果是上标文本，将渲染为 <sup> 元素
      console.log("Rendering a superscript leaf");
      return <sup {...props.attributes}>{props.children}</sup>;
    }

    // 默认情况下，渲染为 <span> 元素
    console.log("Rendering a normal leaf");
    return <span {...props.attributes}>{props.children}</span>;
  }, []);

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

      <Slate
        editor={editor}
        initialValue={editorValue}
        onChange={handleTextChange}
      >
        <Editable
          renderLeaf={renderLeaf}
          style={{
            height: "500px",
            width: "600px",
            minHeight: "150px", // 注意驼峰命名法
            maxHeight: "500px",
            overflowY: "auto", // overflow-y -> overflowY
            border: "1px solid #ccc",
            padding: "10px",
          }}
        />
      </Slate>
    </div>
  );
};

export default SEditor;

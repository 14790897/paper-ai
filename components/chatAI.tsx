import { Transforms } from "slate";
import { Editor } from "slate";
import { extractText } from "@/utils/others/slateutils";
import {
  updateBracketNumbersInDeltaKeepSelection,
  convertToSuperscript,
} from "@/utils/others/quillutils";
interface ChatData {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

const sendMessageToOpenAI = async (
  userMessage: string,
  editor: Editor,
  editorValue: any,
  topic: string,
  prompt?: string
) => {
  // 确保 userMessage 不超过 2000 个字符
  const trimmedMessage =
    userMessage.length > 3000 ? userMessage.slice(0, 3000) : userMessage;
  //slate的方法
  // const content = `需要完成的论文主题：${topic},  搜索到的论文内容:${trimmedMessage},之前已经完成的内容上下文：${extractText(
  //   editorValue
  // )}`;
  const content = `之前已经完成的内容上下文：${editorValue},搜索到的论文内容:${trimmedMessage},需要完成的论文主题：${topic}`;
  // 设置API请求参数
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content: `作为论文写作助手，您的主要任务是根据用户提供的研究主题和上下文，以及相关的研究论文，来撰写和完善学术论文。在撰写过程中，请注意以下要点：
          1.学术格式：请采用标准的学术论文格式进行写作，包括清晰的段落结构、逻辑严谨的论点展开，以及恰当的专业术语使用。
          2.文献引用：只引用与主题紧密相关的论文。在引用文献时，文末应使用方括号内的数字来标注引用来源，如 [1]。请确保每个引用在文章中都有其对应的编号，*无需在文章末尾提供参考文献列表*。
          3.忽略无关文献：对于与主题无关的论文，请不要包含在您的写作中。只关注对理解和阐述主题有实质性帮助的资料。
          4.来源明确：在文章中，清楚地指出每个引用的具体来源。引用的信息应准确无误，确保读者能够追溯到原始文献。
          5.使用中文回答,不超过三百字
          6.只能对给出的文献进行引用，坚决不能虚构文献。
          返回格式举例：
          在某个方面，某论文实现了以下突破...[1],在另一篇论文中，研究了...[2]`,
        },
        {
          role: "user",
          content: content,
        },
      ],
    }),
  };
  console.log("请求的内容\n", content);
  // 发送API请求

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_AI_URL,
      requestOptions
    );
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    await processResult(reader, decoder, editor);

    convertToSuperscript(editor);
    updateBracketNumbersInDeltaKeepSelection(editor);
  } catch (error) {
    console.error("Error:", error);
  }
};

const getTopicFromAI = async (userMessage: string, prompt: string) => {
  // 设置API请求参数
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      stream: false,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  };
  const response = await fetch(process.env.NEXT_PUBLIC_AI_URL, requestOptions);
  const data = await response.json();
  const topic = data.choices[0].message.content
  return topic; // 获取并返回回复  
};

async function processResult(reader, decoder, editor) {
  let chunk = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream finished");
      break;
    }
    chunk += decoder.decode(value, { stream: true });

    // 分割数据块为单独的数据对象
    const dataObjects = chunk
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          line = line.substring(6); // 移除前面的 "data: "
          if (line === "[DONE]") {
            console.log("stream finished");
            return null;
          }
          return JSON.parse(line);
        } catch (error) {
          console.error("Failed to parse line:", line);
          console.error("Error:", error);
          return null;
        }
      })
      .filter(Boolean);

    if (dataObjects.length > 0) {
      // 处理每个数据对象
      dataObjects.forEach((dataObject) => {
        const content = dataObject.choices[0].delta.content;
        if (content) {
          // 在当前光标位置插入文本
          // Transforms.insertText(editor, content); //slate
          editor.insertText(editor.getSelection().index, content); //quill
          // console.log("成功插入：", content);
        }
      });
      chunk = ""; // 清空chunk以便读取新的数据
    }
  }
}

export { getTopicFromAI, sendMessageToOpenAI };

// fetch("https://api.openai.com/v1/chat/completions", requestOptions)
//     .then((response) => {
//       // 获取响应的读取器
//       const reader = response.body!.getReader();
//       const decoder = new TextDecoder();
//       let chunk = "";

//       // 处理流式响应
//       function processResult(result: any): Promise<void> {
//         // if (result.done) return;
//         chunk += decoder.decode(result.value, { stream: true });

//         // 分割数据块为单独的数据对象
//         const dataObjects: ChatData[] = chunk
//           .split("\n")
//           .filter(Boolean)
//           .map((line) => {
//             try {
//               line = line.substring(6); // 移除前面的 "data: "
//               // console.log(line);
//               if (line === "[DONE]") {
//                 console.log("stream finished");
//                 return null;
//               }
//               return JSON.parse(line);
//             } catch (error) {
//               console.error("Failed to parse line:", line);
//               console.error("Error:", error);
//               return null;
//             }
//           })
//           .filter(Boolean);
//         if (dataObjects.length === 0) {
//           //如果这里不终止的话,会导致无限循环,程序崩溃
//           return Promise.resolve();
//         }
//         // const dataObjects = JSON.parse(chunk.data);
//         // 处理每个数据对象
//         dataObjects.forEach((dataObject) => {
//           const content = dataObject.choices[0].delta.content;
//           if (content) {
//             // 在当前光标位置插入文本
//             // Transforms.insertText(editor, content); //slate
//             editor.insertText(editor.getSelection().index, content); //quill
//             // console.log("成功插入：", content);
//           }
//         });
//         chunk = "";

//         // 继续读取响应
//         return reader.read().then(processResult);
//       }

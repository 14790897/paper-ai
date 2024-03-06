import Quill from "quill";

import {
  updateBracketNumbersInDeltaKeepSelection,
  convertToSuperscript,
  deleteSameBracketNumber,
} from "@/utils/others/quillutils";
//redux不能在普通函数使用

interface ChatData {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}
function isValidApiKey(apiKey: string) {
  return apiKey && apiKey.trim() !== "";
}

const sendMessageToOpenAI = async (
  content: string,
  editor: Quill | null,
  selectedModel: string,
  apiKey: string,
  upsreamUrl: string,
  prompt: string,
  cursorPosition: number | null,
  useEditorFlag = true, // 新增的标志，用于决定操作
  signal: AbortSignal
) => {
  //识别应该使用的模型
  let model = selectedModel;
  console.log("upstreamUrl", upsreamUrl);
  // 设置API请求参数
  const requestOptions = {
    method: "POST",
    signal: signal,
    headers: {
      "Content-Type": "application/json",
      // "Upstream-Url": upsreamUrl,
      Authorization:
        "Bearer " +
        (isValidApiKey(apiKey)
          ? apiKey
          : process.env.NEXT_PUBLIC_OPENAI_API_KEY),
    },
    body: JSON.stringify({
      model: model,
      stream: useEditorFlag, // 根据标志确定是否使用streaming
      messages: [
        {
          role: "system",
          content:
            prompt ||
            `作为论文写作助手，您的主要任务是根据用户提供的研究主题和上下文，以及相关的研究论文，来撰写和完善学术论文。在撰写过程中，请注意以下要点：
          1.学术格式：请采用标准的学术论文格式进行写作，包括清晰的段落结构、逻辑严谨的论点展开，以及恰当的专业术语使用。
          2.文献引用：只引用与主题紧密相关的论文。在引用文献时，文末应使用方括号内的数字来标注引用来源，如 [1]。。请确保每个引用在文章中都有其对应的编号，*无需在文章末尾提供参考文献列表*。*每个文献对应的序号只应该出现一次，比如说引用了第一篇文献文中就只能出现一次[1]*。
          3.忽略无关文献：对于与主题无关的论文，请不要包含在您的写作中。只关注对理解和阐述主题有实质性帮助的资料。
          4.来源明确：在文章中，清楚地指出每个引用的具体来源。引用的信息应准确无误，确保读者能够追溯到原始文献。
          5.使用用户所说的语言完成回答，不超过五百字
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

  let response;
  let responseClone = null; // 用于保存响应内容的变量
  try {
    response = await fetch(
      (upsreamUrl || process.env.NEXT_PUBLIC_AI_URL) + "/v1/chat/completions",
      requestOptions
    );
    // 检查响应状态码是否为429
    if (response.status === 429) {
      // 可以在这里处理429错误，例如通过UI通知用户
      throw new Error("请求过于频繁，请稍后再试。");
    } else if (!response.ok) {
      // 处理其他类型的HTTP错误
      throw new Error(`HTTP错误，状态码：${response.status}`);
    }
    // 克隆响应以备后用
    responseClone = response.clone();
    if (useEditorFlag && editor && cursorPosition !== null) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      //开始前先进行换行
      // editor.focus();
      editor.insertText(editor.getSelection(true).index, "\n");
      await processResult(reader, decoder, editor);
      //搜索是否有相同的括号编号，如果有相同的则删除到只剩一个
      convertToSuperscript(editor);
      deleteSameBracketNumber(editor, cursorPosition);
      updateBracketNumbersInDeltaKeepSelection(editor);
    } else {
      // 直接返回结果的逻辑
      const data = await response.json();
      const content = data.choices[0].message.content;
      return content; // 或根据需要处理并返回数据
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Fetch operation was aborted");
      //这里不用产生报错因为是手动停止
      return;
    }
    console.error("Error:", error);

    // 根据是否成功读取响应体来抛出错误
    if (responseClone) {
      const textResponse = await responseClone.text(); // 从克隆的响应中读取数据
      throw new Error(
        `请求发生错误: ${error.message}, Response: ${textResponse}`
      );
    } else {
      throw new Error(`请求发生错误: ${error.message}`);
    }
  }
};

async function processResult(reader, decoder, editor) {
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log("Stream finished");
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    // console.log("buffer", buffer);
    // 处理缓冲区中的所有完整的 JSON 对象
    let boundary;
    try {
      while ((boundary = buffer.indexOf("}\n")) !== -1) {
        // 找到一个完整的 JSON 对象的边界
        let jsonStr = buffer.substring(0, boundary + 1);
        buffer = buffer.substring(boundary + 2);
        // console.log("jsonStr", jsonStr);

        // 尝试解析 JSON 对象
        try {
          // 如果 jsonStr 以 "data: " 开头，就移除这个前缀
          // 移除字符串首尾的空白字符
          jsonStr = jsonStr.trim();
          // jsonStr = jsonStr.substring(6);
          jsonStr = jsonStr.replace("data:", "");
          let dataObject = JSON.parse(jsonStr);
          // console.log("dataObject", dataObject);
          // 处理 dataObject 中的 content
          if (dataObject.choices && dataObject.choices.length > 0) {
            let content =
              dataObject.choices[0].delta?.content ??
              dataObject.choices[0].message?.content;
            if (content) {
              // 在当前光标位置插入文本
              // editor.focus();
              editor.insertText(editor.getSelection(true).index, content);
              // console.log("成功插入：", content);
            }
          }
        } catch (error) {
          throw new Error(`
            there is a error in parse JSON object: ${jsonStr},
            error reason: ${error}`);
        }
      }
    } catch (error) {
      break;
    }
  }
}

export { sendMessageToOpenAI };

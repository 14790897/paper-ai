import { Transforms } from "slate";
import { Editor } from "slate";
import { extractText } from "@/utils/others/slateutils";
import {
  updateBracketNumbersInDeltaKeepSelection,
  convertToSuperscript,
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
  editor: Editor,
  selectedModel: "gpt3.5",
  apiKey: string,
  upsreamUrl: string,
  prompt?: string
) => {
  // console.log("apiKey", apiKey);
  // console.log("isValidApiKey(apiKey)", isValidApiKey(apiKey).toString());
  // console.log(
  //   " token的值",
  //   "Bearer " +
  //     (isValidApiKey(apiKey) ? apiKey : process.env.NEXT_PUBLIC_OPENAI_API_KEY)
  // );
  //识别应该使用的模型
  let model = selectedModel === "gpt3.5" ? "gpt-3.5-turbo" : "gpt-4";
  console.log("upsreamUrl", upsreamUrl);
  // 设置API请求参数
  const requestOptions = {
    method: "POST",
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
      stream: true,
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
          5.使用用户所说的语言完成回答,不超过三百字
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

  try {
    response = await fetch(
      (upsreamUrl || process.env.NEXT_PUBLIC_AI_URL) + "/v1/chat/completions",
      requestOptions
    );
    if (!response.ok) {
      throw new Error("Server responded with an error");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    await processResult(reader, decoder, editor);

    convertToSuperscript(editor);
    updateBracketNumbersInDeltaKeepSelection(editor);
  } catch (error) {
    console.error("Error:", error);
    // 如果有响应，返回响应的原始内容
    if (response) {
      const rawResponse = await response.text();
      throw new Error(`Error: ${error.message}, Response: ${rawResponse}`);
    }
    // 如果没有响应，只抛出错误
    throw error;
  }
};

const getTopicFromAI = async (
  userMessage: string,
  prompt: string,
  apiKey: string
) => {
  // 设置API请求参数
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer " +
        (isValidApiKey(apiKey)
          ? apiKey
          : process.env.NEXT_PUBLIC_OPENAI_API_KEY),
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
  const response = await fetch(
    process.env.NEXT_PUBLIC_AI_URL + "/v1/chat/completions",
    requestOptions
  );
  const data = await response.json();
  const topic = data.choices[0].message.content;
  return topic; // 获取并返回回复
};

// 给getTopicFromAI函数创建别名
// export const getFromAI = sendMessageToOpenAI;

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
          jsonStr = jsonStr.substring(6);
          let dataObject = JSON.parse(jsonStr);
          // console.log("dataObject", dataObject);
          // 处理 dataObject 中的 content
          if (dataObject.choices && dataObject.choices.length > 0) {
            let content =
              dataObject.choices[0].message?.content ||
              dataObject.choices[0].delta?.content;
            if (content) {
              // 在当前光标位置插入文本
              editor.insertText(editor.getSelection().index, content);
              // console.log("成功插入：", content);
            }
          }
        } catch (error) {
          console.error("Failed to parse JSON object:", jsonStr);
          console.error("Error:", error);
          break;
        }
      }
    } catch (error) {
      break;
    }
  }
}

export { getTopicFromAI, sendMessageToOpenAI };

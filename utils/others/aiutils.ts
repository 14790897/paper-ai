// Path: utils/others/aiutils.ts
import { getAI } from "@/components/chatAI";
//判断返回的文献是否跟用户输入的主题相关
export async function evaluateTopicMatch(
  userMessage: any[],
  apiKey: string,
  upsreamUrl: string,
  selectedModel: string,
  topic: string
): Promise<{ relevantPapers: string[]; nonRelevantPapers: string[] }> {
  const prompt = "请判断文献是否跟用户输入的主题相关,只需要返回true或者false";
  let relevantPapers: string[] = []; // 存储相关论文的数组
  let nonRelevantPapers: string[] = []; // 存储不相关论文的数组

  for (const paper of userMessage) {
    const input = `user's topic:${topic}, \n paper's title: ${paper.title}, \n paper's abstract: ${paper.abstract}`;
    const isRelevantResult = await getAI(
      input,
      prompt,
      apiKey,
      upsreamUrl,
      selectedModel!
    );
    console.log("isRelevantResult", isRelevantResult);
    // 尝试解析 JSON 结果，如果无法解析则直接使用结果字符串
    let isRelevant;
    try {
      const parsedResult = JSON.parse(isRelevantResult);
      isRelevant =
        parsedResult === true || parsedResult.toLowerCase() === "true";
    } catch {
      isRelevant =
        isRelevantResult.includes("true") || isRelevantResult.includes("True");
    }

    if (isRelevant) {
      relevantPapers.push(paper); // 如果论文相关，则添加到数组中
    } else {
      nonRelevantPapers.push(paper); // 如果论文不相关，则添加到不相关论文数组中
    }
    console.log(
      `这次有${nonRelevantPapers.length}篇文献没有通过相关性检查`,
      nonRelevantPapers
    );
  }
  //如果相关文献大于两片则缩减到两篇
  if (relevantPapers.length > 2) {
    relevantPapers = relevantPapers.slice(0, 2);
  }
  return { relevantPapers, nonRelevantPapers };
}

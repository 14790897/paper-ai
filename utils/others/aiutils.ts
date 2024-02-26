// // Path: utils/others/aiutils.ts
// import { sendMessageToOpenAI } from "@/components/chatAI";
// //判断返回的文献是否跟用户输入的主题相关
// export async function evaluateTopicMatch(
//   userMessage: any[],
//   apiKey: string,
//   upsreamUrl: string,
//   selectedModel: string,
//   topic: string
// ): Promise<{ relevantPapers: string[]; nonRelevantPapers: string[] }> {
//   const prompt = "请判断文献是否跟用户输入的主题相关,只需要返回true或者false";
//   let relevantPapers: string[] = []; // 存储相关论文的数组
//   let nonRelevantPapers: string[] = []; // 存储不相关论文的数组

//   for (const paper of userMessage) {
//     if (relevantPapers.length >= 2) {
//       console.log("已找到两篇相关文献，停止处理剩余文献。");
//       break; // 如果已经有两篇相关文献，则停止处理
//     }
//     // 检查是否存在 abstract，如果不存在，直接将论文添加到 nonRelevantPapers
//     if (!paper.abstract) {
//       nonRelevantPapers.push(paper);
//       console.log(
//         `Paper titled "${paper.title}" has no abstract and was added to non-relevant papers.`
//       );
//       continue; // 跳过当前迭代，继续下一个论文
//     }
//     const input = `user's topic:${topic}, \n paper's title: ${paper.title}, \n paper's abstract: ${paper.abstract}`;
//     const isRelevantResult = await sendMessageToOpenAI(
//       input,
//       null,
//       selectedModel!,
//       apiKey,
//       upsreamUrl,
//       prompt,
//       null,
//       false
//     );
//     console.log("isRelevantResult", isRelevantResult);
//     // 尝试解析 JSON 结果，如果无法解析则直接使用结果字符串
//     let isRelevant;
//     try {
//       const parsedResult = JSON.parse(isRelevantResult);
//       isRelevant =
//         parsedResult === true || parsedResult.toLowerCase() === "true";
//     } catch {
//       isRelevant =
//         isRelevantResult.includes("true") || isRelevantResult.includes("True");
//     }

//     if (isRelevant) {
//       relevantPapers.push(paper); // 如果论文相关，则添加到数组中
//     } else {
//       nonRelevantPapers.push(paper); // 如果论文不相关，则添加到不相关论文数组中
//     }
//   }
//   console.log(
//     `这次有${nonRelevantPapers.length}篇文献没有通过相关性检查`,
//     nonRelevantPapers
//   );
//   //如果相关文献大于两片则缩减到两篇
//   // if (relevantPapers.length > 2) {
//   //   relevantPapers = relevantPapers.slice(0, 2);
//   //   console.log("文献太多了，只取前两篇");
//   // }
//   return { relevantPapers, nonRelevantPapers };
// }

// Path: utils/others/aiutils.ts
import { sendMessageToOpenAI } from "@/components/chatAI";
//判断返回的文献是否跟用户输入的主题相关
export async function evaluateTopicMatch(
  userMessage: any[],
  apiKey: string,
  upsreamUrl: string,
  selectedModel: string,
  topic: string,
  signal: AbortSignal
): Promise<{ relevantPapers: string[]; nonRelevantPapers: string[] }> {
  const prompt =
    "请判断文献是否跟用户输入的主题相关,只需要返回true或false的数组";
  let relevantPapers: string[] = []; // 存储相关论文的数组
  let nonRelevantPapers: string[] = []; // 存储不相关论文的数组

  // 修改循环逻辑，每次处理两篇文献
  for (let i = 0; i < userMessage.length; i += 2) {
    // 检查是否已有足够的相关论文
    if (relevantPapers.length >= 2) {
      console.log("已找到两篇相关文献，停止处理剩余文献。");
      break;
    }

    let inputs = [];
    let papersToEvaluate = userMessage.slice(i, i + 2); // 获取当前迭代的两篇文献

    for (const paper of papersToEvaluate) {
      // 检查是否存在 abstract，如果不存在，直接将论文添加到 nonRelevantPapers
      if (!paper.abstract) {
        nonRelevantPapers.push(paper);
        console.log(
          `Paper titled "${paper.title}" has no abstract and was added to non-relevant papers.`
        );
        continue; // 跳过当前论文，继续下一个论文
      }
      // 准备输入数据
      const input = `user's topic: ${topic}, \n paper's title: ${paper.title}, \n paper's abstract: ${paper.abstract}`;
      inputs.push(input);
    }

    // 如果有需要评估的文献，则发送请求
    if (inputs.length > 0) {
      const combinedInput = inputs.join("\n\n");
      const isRelevantResults = await sendMessageToOpenAI(
        combinedInput,
        null,
        selectedModel!,
        apiKey,
        upsreamUrl,
        prompt,
        null,
        false,
        signal
      );
      console.log("isrelevantResults in 相关性检查", isRelevantResults);
      // 处理每篇文献的相关性结果
      papersToEvaluate.forEach((paper, index) => {
        let isRelevant;
        try {
          const parsedResults = JSON.parse(isRelevantResults); // 将字符串解析成数组
          isRelevant =
            parsedResults[index] === true ||
            parsedResults[index].toString().toLowerCase() === "true";
        } catch {
          console.log("Error parsing isRelevantResults or accessing index");
        }

        if (isRelevant) {
          relevantPapers.push(paper);
          console.log(`Paper titled "${paper.title}" is relevant.`);
        } else {
          nonRelevantPapers.push(paper);
          console.log(`Paper titled "${paper.title}" is not relevant.`);
        }
      });
    }
  }

  console.log(
    `这次有${nonRelevantPapers.length}篇文献没有通过相关性检查`,
    nonRelevantPapers
  );

  return { relevantPapers, nonRelevantPapers };
}

import axios from "axios";
import { getRandomOffset } from "@/utils/others/quillutils";
interface Author {
  authorId: string;
  name: string;
}

interface Paper {
  paperId: string;
  title: string;
  abstract: string;
  year: number;
  authors: Author[];
  venue: string;
  url: string;
}

async function getSemanticPapers(
  query: string,
  year: string,
  offset = -1,
  limit = 2
) {
  try {
    const maxOffset = 20 - limit; // 假设总记录数为 20
    if (offset === -1) offset = getRandomOffset(maxOffset);
    const url = `https://proxy.paperai.life/proxy/https://api.semanticscholar.org/graph/v1/paper/search`;
    const response = await axios.get(url, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_SEMANTIC_API_KEY,
      },
      params: {
        query: query,
        offset: offset,
        limit: limit,
        year: year,
        fields:
          "title,year,authors.name,abstract,venue,url,journal,externalIds",
      },
    });
    // 提取并处理论文数据
    const papers = response.data.data.map((paper: Paper) => {
      // 提取每篇论文的作者名字
      const authorNames = paper.authors.map((author) => author.name);

      return {
        ...paper,
        authors: authorNames, // 替换原有的authors字段为仅包含名字的数组
      };
    });
    return papers;
  } catch (error: any) {
    // console.error("Error fetching data from Semantic Scholar API:", error);
    throw new Error(
      `Semantic Scholar fail（请使用英文并缩短关键词）:${JSON.stringify(
        error.response,
        null,
        2
      )}`
    );
    // return null;
  }
}

// 调用函数示例
// fetchSemanticPapers("covid", 50, 2, "2015-2023").then((data) => {
//   console.log(data);
// });

export default getSemanticPapers;

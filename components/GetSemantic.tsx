import axios from "axios";
import {getRandomOffset} from "@/utils/others/quillutils"
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
}

async function getSemanticPapers(query: string, year: string, limit = 2) {
  try {
    const maxOffset = 100 - limit; // 假设总记录数为 100
    const offset = getRandomOffset(maxOffset);
    const url = `https://api.semanticscholar.org/graph/v1/paper/search`;
    const response = await axios.get(url, {
      headers: {
        'x-api-key': 'hEQvK6ARe84dzDPcMnpzX4n9jfoqztkMfaftPWnb',
      },
      params: {
        query: query,
        offset: offset,
        limit: 2,
        year: year,
        fields: "title,year,authors.name,abstract,venue",
      },
    });
    // 提取并处理论文数据
    const papers = response.data.data.map((paper:Paper) => {
      // 提取每篇论文的作者名字
      const authorNames = paper.authors.map((author) => author.name);

      return {
        ...paper,
        authors: authorNames, // 替换原有的authors字段为仅包含名字的数组
      };
    });
    return papers;
  } catch (error) {
    console.error("Error fetching data from Semantic Scholar API:", error);
    return null; // 或根据需要处理错误
  }
}


// 调用函数示例
// fetchSemanticPapers("covid", 50, 2, "2015-2023").then((data) => {
//   console.log(data);
// });

export default getSemanticPapers;

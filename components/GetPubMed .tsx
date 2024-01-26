import axios from "axios";
import { getRandomOffset } from "@/utils/others/quillutils";
const xml2js = require("xml2js");

// 定义文章详细信息的 TypeScript 接口
interface ArticleDetail {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedDate: string;
}

// 定义PubMed文章ID为字符串类型
type PubMedID = string;

// 定义idList为PubMedID数组
type IDList = PubMedID[];

async function getPubMedPapers(query: string, year: number, limit = 2) {
  try {
    const baseURL =
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
    const db = "pubmed"; // 设定搜索的数据库为PubMed
    const retMax = limit; // 检索的最大记录数
    const retStart = getRandomOffset(10 - limit); // 假设每页最多10条，根据需要随机偏移

    const url = `${baseURL}?db=${db}&term=${query}[Title/Abstract]+AND+${year}[Date+-+Publication]&retMax=${retMax}&retStart=${retStart}&api_key=${process.env.NEXT_PUBLIC_PUBMED_API_KEY}`;
    const response = await axios.get(url, { responseType: "text" });
    console.log(response.data);
    // 解析XML数据
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    // 提取PubMed文章ID
    const idList = result.eSearchResult.IdList[0].Id.map((id) => id);
    console.log(idList);
    // 可以进一步使用这些ID来获取文章详情，例如使用esummary或efetch
    // 这里只返回了ID列表，你可能需要根据实际需要进行调整
    return idList;
  } catch (error) {
    console.error("Error fetching data from PubMed API:", error);
    return null; // 或根据需要处理错误
  }
}

// 根据文章ID列表获取详细信息
async function getPubMedPaperDetails(idList: IDList) {
  try {
    const ids = idList.join(","); // 将ID列表转换为逗号分隔的字符串
    const baseURL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
    const url = `${baseURL}?db=pubmed&id=${ids}&rettype=abstract&retmode=xml`;

    const response = await axios.get(url);
    const data = response.data; // 这里获取的数据是XML格式，需要解析
    // 解析XML数据
    const parser = new xml2js.Parser({ explicitArray: false });
    let result = await parser.parseStringPromise(data);
    console.log(result);

    // 提取并处理文章详细信息
    const articles = result.PubmedArticleSet.PubmedArticle.map((article) => {
      const articleDetails = article.MedlineCitation.Article;
      return {
        id: article.MedlineCitation.PMID,
        title: articleDetails.ArticleTitle,
        abstract: articleDetails.Abstract
          ? articleDetails.Abstract.AbstractText
          : "",
        authors: articleDetails.AuthorList
          ? articleDetails.AuthorList.Author.map(
              (author) => `${author.ForeName} ${author.LastName}`
            )
          : [],
        publishedDate: articleDetails.ArticleDate
          ? articleDetails.ArticleDate.Date
          : "",
      };
    });

    return articles;
  } catch (error) {
    console.error("Error fetching paper details from PubMed:", error);
    return null;
  }
}

// 示例：使用这些函数
async function fetchPubMedData(query: string, year: number, limit: number) {
  const idList = await getPubMedPapers(query, year, limit);
  if (idList && idList.length > 0) {
    const paperDetails = await getPubMedPaperDetails(idList);
    console.log(paperDetails); // 处理或显示文章详情
  }
}

export { fetchPubMedData, getPubMedPapers, getPubMedPaperDetails };

import axios from "axios";
import { getRandomOffset } from "@/utils/others/quillutils";
const xml2js = require("xml2js");

// 定义文章详细信息的 TypeScript 接口

// 定义PubMed文章ID为字符串类型
type PubMedID = string;

// 定义idList为PubMedID数组
type IDList = PubMedID[];

async function getPubMedPapers(
  query: string,
  year: number,
  offset = -1,
  limit = 2
) {
  try {
    const baseURL =
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
    const db = "pubmed"; // 设定搜索的数据库为PubMed
    const retMax = limit; // 检索的最大记录数
    const maxOffset = 20 - limit; // 假设总记录数为 20
    if (offset === -1) offset = getRandomOffset(maxOffset);
    const url = `${baseURL}?db=${db}&term=${query}[Title/Abstract]+AND+${year}:3000[Date - Publication]&retMax=${retMax}&retStart=${offset}&api_key=${process.env.NEXT_PUBLIC_PUBMED_API_KEY}`;
    const response = await axios.get(url, { responseType: "text" });
    console.log(response.data);
    // 解析XML数据
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    // 提取PubMed文章ID
    const idList = result.eSearchResult.IdList.Id;
    console.log(idList);
    // 可以进一步使用这些ID来获取文章详情，例如使用esummary或efetch
    // 这里只返回了ID列表，你可能需要根据实际需要进行调整
    return idList;
  } catch (error) {
    console.error(" PubMed API失败（请使用英文并缩短关键词）:", error);
    return null; // 或根据需要处理错误
  }
}

// 根据文章ID列表获取详细信息
async function getPubMedPaperDetails(idList: IDList) {
  try {
    const ids = idList.join(","); // 将ID列表转换为逗号分隔的字符串
    // const baseURL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";
    const baseURL = process.env.NEXT_PUBLIC_PAPER_URL; //通过API接口进行转发
    const url = `${baseURL}?db=pubmed&id=${ids}&rettype=abstract&retmode=xml`;
    console.log(url);
    const response = await fetch(url, {
      headers: {
        "Upstream-Url":
          "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
        "Accept-Encoding": "identity",
      },
    });

    if (!response.ok) {
      throw new Error(`${response.text()}`);
    }

    const data = await response.text(); // 获取响应文本
    // 解析XML数据
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false, // 忽略XML属性
      charkey: "text", // 字符数据的键
      trim: true, // 去除文本前后空格
    });
    let result = await parser.parseStringPromise(data);

    // console.log(result);
    // 提取并处理文章详细信息
    const articles = result.PubmedArticleSet.PubmedArticle.map((article) => {
      const medlineCitation = article.MedlineCitation;
      const articleDetails = medlineCitation.Article;
      // console.log("atricledetails", articleDetails);
      const abstractTexts = articleDetails.Abstract.AbstractText;

      let abstract;
      // 检查 abstractTexts 是否是一个数组
      if (Array.isArray(abstractTexts)) {
        // 如果是数组，遍历数组并连接每个元素的文本
        abstract = abstractTexts
          .map((text) => (typeof text === "object" ? text.text : text))
          .join(" ");
      } else if (typeof abstractTexts === "string") {
        // 如果 abstractTexts 直接就是字符串
        abstract = abstractTexts;
      } else if (typeof abstractTexts === "object") {
        // 将对象中的文本内容连接起来
        abstract = Object.values(abstractTexts).reduce((acc, val) => {
          return (
            acc + (typeof val === "object" && val.text ? val.text : val) + " "
          );
        }, "");
      } else {
        // 如果 abstractTexts 既不是数组也不是字符串，可能设置为默认值或进行错误处理
        abstract = ""; // 或者根据需要设置一个默认的提示文本
      }

      const authors =
        articleDetails.AuthorList &&
        Array.isArray(articleDetails.AuthorList.Author)
          ? articleDetails.AuthorList.Author.map((author) => {
              const names = [];
              if (author.ForeName) names.push(author.ForeName);
              if (author.LastName) names.push(author.LastName);
              return names.join(" ");
            })
          : ["Unknown Author"];

      let publishedDate = "No date available";
      // 尝试从 ArticleDate 获取发表日期
      if (articleDetails.ArticleDate) {
        publishedDate = `${articleDetails.ArticleDate.Year}`;
      }
      // 如果 ArticleDate 不存在，尝试从 JournalIssue/PubDate 获取
      else if (articleDetails.Journal.JournalIssue.PubDate) {
        publishedDate = `${articleDetails.Journal.JournalIssue.PubDate.Year}
        }`;
      }

      let journalTitle = articleDetails.Journal.Title; // 提取出版者信息（杂志标题）
      journalTitle += `, ${publishedDate}`;
      if (articleDetails.Journal.JournalIssue.Volume) {
        journalTitle += `, ${articleDetails.Journal.JournalIssue.Volume}`;
      }
      if (articleDetails.Pagination) {
        journalTitle += `: ${articleDetails.Pagination.StartPage}-${articleDetails.Pagination.EndPage}`;
      }
      // 构建文章的 PubMed URL
      const articleUrl = `https://pubmed.ncbi.nlm.nih.gov/${medlineCitation.PMID.text}/`;
      // console.log("medlineCitation", medlineCitation);
      console.log("\n,journalTitle", journalTitle);
      let title = articleDetails.ArticleTitle;
      // 检查并去除字符串最后的句点
      if (title.endsWith(".")) {
        title = title.slice(0, -1);
      }
      // 提取DOI
      let doi = null;
      if (
        article.PubmedData &&
        article.PubmedData.ArticleIdList &&
        Array.isArray(article.PubmedData.ArticleIdList.ArticleId)
      ) {
        const doiObject = article.PubmedData.ArticleIdList.ArticleId.find(
          (idObj) => idObj.$.IdType === "doi"
        );
        if (doiObject) {
          doi = doiObject.text; // 获取DOI值
        }
      }
      console.log("doi", doi);
      console.log(
        "链接",
        medlineCitation.PMID.text,
        "属性",
        typeof medlineCitation.PMID.text
      );
      return {
        id: Number(medlineCitation.PMID.text),
        title: title,
        abstract: abstract,
        authors: authors,
        url: articleUrl,
        year: publishedDate,
        journal: journalTitle,
        doi: doi,
        // 其他需要的字段可以继续添加
      };
    });

    return articles;
  } catch (error) {
    throw new Error(`Error fetching paper details from PubMed:", ${error}`);
  }
}

// 示例：使用这些函数
async function fetchPubMedData(
  query: string,
  year: number,
  offset: number,
  limit: number
) {
  try {
    const idList = await getPubMedPapers(query, year, offset, limit);
    if (idList && idList.length > 0) {
      const paperDetails = await getPubMedPaperDetails(idList);
      console.log("fetchPubMedData", paperDetails); // 处理或显示文章详情
      return paperDetails;
    }
  } catch (error) {
    //这里无法起作用因为pubmed不会返回400系错误
    throw new Error(`pubmed: ${error}`);
  }
}

export { fetchPubMedData, getPubMedPapers, getPubMedPaperDetails };

import axios, { AxiosError } from "axios";
import { getRandomOffset } from "@/utils/others/quillutils";

const xml2js = require("xml2js");

interface ArxivFeed {
  feed: {
    xmlns: string;
    entry: ArxivEntry[];
    id: string[];
    link: Array<{ [key: string]: string }>;
    "opensearch:itemsPerPage": Array<{ [key: string]: string }>;
    "opensearch:startIndex": Array<{ [key: string]: string }>;
    "opensearch:totalResults": Array<{ [key: string]: string }>;
    title: Array<{ [key: string]: string }>;
    updated: string[];
  };
}

interface ArxivEntry {
  "arxiv:comment": Array<{ [key: string]: string }>;
  "arxiv:primary_category": Array<{ [key: string]: string }>;
  author: Author[];
  category: Array<{ [key: string]: string }>;
  id: string[];
  link: Array<{ [key: string]: string }>;
  published: string[];
  summary: string[];
  title: string[];
  updated: string[];
}

interface Author {
  name: string;
  affiliation?: string; // Assuming affiliation might be optional
}

async function getArxivPapers(
  query: string,
  maxResults = 2,
  offset = -1,
  sortBy = "submittedDate",
  sortOrder = "descending"
) {
  const maxOffset = 30 - maxResults; // 假设总记录数为 20
  if (offset === -1) offset = getRandomOffset(maxOffset);
  console.log("offset in arxiv", offset);
  const url = `https://export.arxiv.org/api/query?search_query=${query}&start=${offset}&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await axios.get(url);
    let result = await xml2js.parseStringPromise(response.data);
    // 这里你将得到 JSON 格式的结果
    console.log(result);
    // 你可以在这里处理数据
    result = extractArxivData(result);
    return result;
  } catch (error: any) {
    throw new Error(
      `Arxiv失败（请使用英文并缩短关键词）:${JSON.stringify(
        error.response,
        null,
        2
      )}`
    );
    // return null;
  }
}

function extractArxivData(data: ArxivFeed) {
  // const entries = data.feed.entry;
  const entries = data.feed.entry.slice(0, 2); // 只获取前两个条目

  const extractedData = entries.map((entry: ArxivEntry) => {
    return {
      id: entry.id[0],
      published: entry.published[0],
      title: entry.title[0],
      abstract: entry.summary[0],
      authors: entry.author.map((author) => author.name[0]),
    };
  });
  return extractedData;
}

export default getArxivPapers;

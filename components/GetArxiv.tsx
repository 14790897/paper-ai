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
  maxResults = 5,
  sortBy = "submittedDate",
  sortOrder = "descending"
) {
  const maxOffset = 100 - maxResults; // 假设总记录数为 100
  const start = getRandomOffset(maxOffset);
  const url = `http://export.arxiv.org/api/query?search_query=${query}&start=${start}&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await axios.get(url);
    let result = await xml2js.parseStringPromise(response.data);
    // 这里你将得到 JSON 格式的结果
    console.log(result);
    // 你可以在这里处理数据
    result = extractArxivData(result);
    return result;
  } catch (error) {
    if (error.response) {
      // 请求已发送，但服务器响应的状态码不在 2xx 范围内
      console.error("Error fetching data: ", error.response.data);
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error("No response received: ", error.request);
    } else {
      // 发送请求时出现错误
      console.error("Error setting up the request: ", error.message);
    }
    return null;
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
      summary: entry.summary[0],
      author: entry.author.map((author) => author.name[0]),
    };
  });
  return extractedData;
}

export default getArxivPapers;

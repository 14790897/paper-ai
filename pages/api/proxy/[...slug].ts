"use server";
// // pages/api/proxy.js
// import axios from 'axios';

// export default async function handler(req, res) {
//   // const upstreamUrl = "https://api.openai.com";
//   const upstreamUrl = "https://chatgpt-api-proxy-private.14790897abc.workers.dev";

//   try {
//     // 创建新 URL
//     const url = upstreamUrl + req.url.replace('/api/proxy', '');

//     // 创建新请求
//     const newRequest = {
//       url: url,
//       headers: req.headers,
//       method: req.method,
//       data: req.method !== 'GET' ? req.body : undefined,
//     };

//     // 转发请求到上游服务器
//     const response = await axios(newRequest);

//     res.status(response.status).send(response.data);
//   } catch (error) {
//     // 错误处理
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// pages/api/proxy.js
// import fetch from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const upstreamUrl =
    "https://chatgpt-api-proxy-private.14790897abc.workers.dev"; //https://api.perplexity.ai/chat/completions
  // const upstreamUrl = "https://api.perplexity.ai"

  try {
    // 创建新 URL
    const url = new URL(upstreamUrl + req.url.replace("/api/proxy", ""));
    console.log("url:", url);
    // 创建新请求
    const newRequest = {
      headers: req.headers,
      method: req.method,
      body: req.method !== "GET" ? req.body : undefined,
    };
    // console.log('newRequest:',newRequest);
    // 转发请求到上游服务器
    const response = await fetch(url, newRequest);

    res.status(response.status).send(response);
  } catch (error) {
    // 错误处理
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

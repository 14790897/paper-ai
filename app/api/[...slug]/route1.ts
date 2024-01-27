// "use server";
// pages/api/someEndpoint.js
import axios from "axios";
import https from "https";

export async function POST(req: Request) {
  const upstreamUrl = "https://api.liuweiqing.top";

  try {
    // 创建新 URL
    const url = upstreamUrl + new URL(req.url).pathname.replace("/api", "");

    // 创建新请求
    const newRequest = {
      headers: req.headers,
      data: req.body,
    };

    // 创建一个新的https.Agent实例，忽略SSL证书错误
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    // 使用axios.post方法转发请求到上游服务器
    const response = await axios.post(url, newRequest.data, {
      headers: newRequest.headers,
      // httpsAgent: agent, // 使用新的https.Agent
    });

    // 将响应数据发送回客户端
    return new Response(response.data, {
      status: response.status,
    });
  } catch (error) {
    // 错误处理
    console.error(error);
    return new Response(
      { error: "Internal Server Error in NEXT" },
      {
        status: 500,
      }
    );
  }
}

// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const upstreamUrl = "https://api.liuweiqing.top"; //https://api.perplexity.ai/chat/completions
//   // const upstreamUrl = "https://api.perplexity.ai"

//   try {
//     // 创建新 URL
//     const url = new URL(upstreamUrl + req.url.replace("/api/proxy", ""));
//     console.log("url:", url);
//     // 创建新请求
//     const newRequest = {
//       headers: req.headers,
//       method: req.method,
//       body: req.body,
//     };
//     // console.log('newRequest:',newRequest);
//     // 转发请求到上游服务器
//     const response = await fetch(url, newRequest);

//     // 读取响应的数据
//     const data = await response.text();

//     res.status(response.status).send(data);
//   } catch (error) {
//     // 错误处理
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

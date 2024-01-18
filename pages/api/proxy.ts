// pages/api/proxy.js

export default async function handler(req, res) {
  const upstreamUrl = "https://api.openai.com";

  try {
    // 创建新 URL
    const url = new URL(upstreamUrl + req.url.replace('/api/proxy', ''));

    // 创建新请求
    const newRequest = new Request(url, {
      headers: req.headers,
      method: req.method,
      body: req.method !== 'GET' ? req.body : undefined,
    });

    // 转发请求到上游服务器
    const response = await fetch(newRequest);

    // 将响应的内容发送回客户端
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    // 错误处理
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

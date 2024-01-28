export async function POST(req: Request) {
  // 从请求头中读取上游 URL
  const headers = new Headers(req.headers);
  const upstreamUrl = headers.get("Upstream-Url");
  console.log("headers:", headers);
  if (!upstreamUrl) {
    throw new Error("Upstream URL not specified in headers");
  }
  try {
    // 创建新 URL
    const url = new URL(req.url);
    const apiPath = url.pathname.replace("/api", "");
    const upstreamEndpoint = upstreamUrl + apiPath;

    // 创建新请求的headers对象
    const headers = new Headers(req.headers);
    // 移除或替换可能引起问题的头部
    headers.delete("Host");
    headers.delete("Content-Length");
    headers.delete("Upstream-Url"); // 也删除上游 URL 头部，以免发送到上游服务器
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-visitor");
    headers.delete("cf-ray");
    headers.delete("x-forwarded-for");
    headers.delete("x-forwarded-proto");

    // 读取并解析 JSON 请求体
    const reader = req.body.getReader();
    let requestBody = "";
    let done, value;
    while (!done) {
      ({ done, value } = await reader.read());
      if (value) {
        requestBody += new TextDecoder().decode(value);
      }
    }

    // 尝试解析为 JSON
    let jsonBody;
    try {
      jsonBody = JSON.parse(requestBody);
    } catch (error) {
      throw new Error("Failed to parse request body as JSON");
    }

    // 使用fetch方法转发请求到上游服务器
    const response = await fetch(upstreamEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(jsonBody), // 确保将请求体转换为字符串
    });
    console.log("headers:", headers);
    console.log("req.body:", jsonBody);
    // 将响应数据发送回客户端
    return new Response(response.body, {
      status: response.status,
      headers: headers,
    });
  } catch (error) {
    // 错误处理
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error in NEXT" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function GET(req: Request) {
  // 从请求头中读取上游 URL
  const headers = new Headers(req.headers);
  const upstreamUrl = headers.get("Upstream-Url");
  if (!upstreamUrl) {
    throw new Error("Upstream URL not specified in headers");
  }
  try {
    // 创建新 URL
    const url = new URL(req.url);
    const apiPath = url.pathname.replace(/\/api\/paper|\/api/g, "");

    const upstreamEndpoint = upstreamUrl + apiPath + url.search;

    // 创建新请求的headers对象
    const headers = new Headers(req.headers);
    // 移除或替换可能引起问题的头部
    headers.delete("Host");
    headers.delete("Upstream-Url"); // 也删除上游 URL 头部，以免发送到上游服务器

    // 使用fetch方法转发请求到上游服务器
    const response = await fetch(upstreamEndpoint, {
      method: "GET",
      headers: headers,
    });
    console.log("response:", response);
    // 将响应数据发送回客户端
    let text = await response.text();
    console.log("text", text);
    return new Response(text, {
      headers: headers,
      status: response.status,
    });
  } catch (error) {
    // 错误处理
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error in NEXT" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// const nextConfig = {
//   trailingSlash: true,
// };

// export default nextConfig;

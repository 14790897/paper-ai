import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // lng 从路径 /{lng}/set-guest 中提取，无需 query 参数
  const lng = url.pathname.split("/")[1] || "zh-CN";
  const response = NextResponse.redirect(new URL(`/${lng}`, url.origin));

  response.cookies.set("guest_mode", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
  });

  return response;
}

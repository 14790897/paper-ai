// app/api/lemon/callback/route.ts
import { headers } from "next/headers";
import { Buffer } from "buffer";
import crypto from "crypto";
import rawBody from "raw-body";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabaseAdmin = createClient(cookieStore);
  console.log("webhook");
  const body = await rawBody(Readable.from(Buffer.from(await request.text())));
  const headersList = headers();
  const payload = JSON.parse(body.toString());

  const sigString = headersList.get("x-signature");
  if (!sigString) {
    console.error(`Signature header not found`);
    return NextResponse.json(
      { message: "Signature header not found" },
      { status: 401 }
    );
  }
  try {
    const secret = process.env.LEMONS_SQUEEZY_SIGNATURE_SECRET as string;
    console.log("secret:", secret);
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
    const signature = Buffer.from(
      Array.isArray(sigString) ? sigString.join("") : sigString || "",
      "utf8"
    );
    // 校验签名
    if (!crypto.timingSafeEqual(digest, signature)) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 }
      );
    }
    console.log("payload:", payload);
    const userEmail =
      (payload.data.attributes && payload.data.attributes.user_email) || "";
    // 检查custom里的参数
    if (!userEmail)
      return NextResponse.json(
        { message: "No userEmail provided" },
        { status: 403 }
      );
    return await setVip(supabaseAdmin, userEmail);
  } catch (error) {
    console.error("Error in lemon squeezy:", error);
    return NextResponse.json(
      { message: "Error in lemon squeezy:", error },
      { status: 403 }
    );
  }
}

async function getUserId(supabaseAdmin: SupabaseClient, email: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (error) {
    console.error("查询用户 ID 失败:", error);
    return null;
  }

  return data.id;
}

async function setVip(
  supabaseAdmin: SupabaseClient,
  email: string,
  isVip = true,
  startDate = new Date(),
  endDate = new Date()
) {
  const userId = await getUserId(supabaseAdmin, email);
  if (!userId)
    return NextResponse.json({ message: "No user found" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("vip_statuses").upsert(
    {
      user_id: userId,
      is_vip: isVip,
      start_date: startDate,
      end_date: endDate,
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("设置 VIP 失败:", error);
    return NextResponse.json(
      { message: "Failed to set VIP 设置 VIP 状态失败" },
      { status: 403 }
    );
  }
  return NextResponse.json({ message: "Success VIP 状态已更新:" });
}

export async function GET(request: Request) {
  // 创建一个简易的HTML内容
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>VIP Status Checker</title>
         <style>
          body, html {
            height: 100%;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-family: Arial, sans-serif;
          }
          div.container {
            flex-direction: column;
          }
        </style>
      </head>
      <body>
        <p>下面是这个路由设置VIP的代码，你们能破解吗？</p>
        <a href="https://github.com/14790897/paper-ai/blob/main/app/api/lemon/callback/route.ts">route.ts</a>
      </body>
    </html>
  `;

  return new Response(htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
    },
  });
}

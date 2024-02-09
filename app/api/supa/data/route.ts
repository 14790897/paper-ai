import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabaseAdmin = createClient(cookieStore);

  // 从请求体中提取数据
  const { userId, paperContent, paperReference, paperNumber } =
    await req.json();

  // 使用Supabase客户端进行数据上传
  const { data, error } = await supabaseAdmin.from("user_paper").upsert(
    [
      {
        user_id: userId,
        paper_number: paperNumber,
        ...(paperContent !== undefined && { paper_content: paperContent }),
        ...(paperReference !== undefined && {
          paper_reference: paperReference,
        }),
      },
    ],
    { onConflict: "user_id, paper_number" }
  );
  // console.log("测试supabaseAdmin", supabaseAdmin);
  // 返回JSON格式的响应
  if (error) {
    // 如果有错误，返回错误信息
    return new Response(
      JSON.stringify({ message: "Error saving paper", error: error.message }),
      {
        status: 400, // 或其他适当的错误状态码
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    // 成功保存，返回成功信息
    return new Response(
      JSON.stringify({ message: "Success in user_paper save", data }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

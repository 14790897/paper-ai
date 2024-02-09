import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabaseAdmin = createClient(cookieStore);

  // 从请求体中提取数据
  const { userId, paperNumber } = await req.json();

  // 使用Supabase客户端进行数据上传
  const { data, error } = await supabaseAdmin
    .from("user_paper") // 指定表名
    .select("paper_content,paper_reference") // 仅选择paper_content列
    .eq("user_id", userId) // 筛选特定user_id的记录
    .eq("paper_number", paperNumber)
    .single(); // 筛选特定paper_number的记录

  // 返回JSON格式的响应
  if (error) {
    // 如果有错误，返回错误信息
    return new Response(
      JSON.stringify({
        message: "Error get specific paper",
        error: error.message,
      }),
      {
        status: 400, // 或其他适当的错误状态码
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    // 成功保存，返回成功信息
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

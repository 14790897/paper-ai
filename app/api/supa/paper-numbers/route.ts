import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/utils/supabase/servicerole";

export async function POST(req: Request) {
  try {
    // const cookieStore = cookies();
    // const supabaseAdmin = createClient(cookieStore);

    // const {
    //   data: { user },
    // } = await supabaseAdmin.auth.getUser();
    // // 从请求体中提取数据
    // if (!user) throw new Error("No user found");
    // const userId = await user.id;
    const { userId } = await req.json();
    console.log("userId", userId);
    const { data, error } = await supabaseAdmin
      .from("user_paper") // 指定表名
      .select("paper_number") // 仅选择paper_number列
      .eq("user_id", userId); // 筛选特定user_id的记录

    // 返回JSON格式的响应
    if (error) {
      // 如果有错误，返回错误信息
      return new Response(
        JSON.stringify({
          message: "Error get paper numbers",
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
      console.log("获取到的用户论文数量:", data);
      // 成功保存，返回成功信息
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (e) {
    console.error("Error get paper numbers", e);
    return new Response(
      JSON.stringify({
        message: "Error get paper numbers",
        error: e.message,
      }),
      {
        status: 400, // 或其他适当的错误状态码
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

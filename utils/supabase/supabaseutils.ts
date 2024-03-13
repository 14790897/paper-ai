import { SupabaseClient } from "@supabase/supabase-js";
// import { cookies } from "next/headers";
// import { createClient } from "@/utils/supabase/server";

import { redirect } from "next/navigation";
import { Reference } from "@/utils/global";
//supabase
const supabase = createClient();
import { createClient } from "@/utils/supabase/client";
//sentry
import * as Sentry from "@sentry/nextjs";

//获取用户id
export async function getUser() {
  const { data, error } = await supabase.auth.getSession();
  if (data.session) {
    const user = data.session.user;
    if (user) {
      // console.log("User UUID in getUser:", user.id);
      return user;
    } else {
      console.log("No user in getUser");
      return null;
    }
  } else {
    console.log("No session in getUser");
    return null;
  }
}

//将论文保存到服务器
export async function submitPaper(
  supabase: SupabaseClient,
  editorContent?: string, // 使得editorContent成为可选参数
  references?: Reference[], // 使得references成为可选参数
  paperNumber = "1"
) {
  const user = await getUser(supabase);
  if (user) {
    try {
      // 构造请求体，只包含提供的参数
      const requestBody: any = {
        userId: user.id,
        paperNumber,
      };

      if (editorContent !== undefined) {
        requestBody.paperContent = editorContent;
      }

      if (references !== undefined) {
        requestBody.paperReference = references;
      }

      const response = await fetch("/api/supa/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      // console.log(
      //   "Response data in submitPaper:",
      //   data,
      //   `此次更新的是第${paperNumber}篇论文,` +
      //     `${editorContent !== undefined ? "更新内容为" + editorContent : ""}` +
      //     `${
      //       references !== undefined
      //         ? "更新引用为" + JSON.stringify(references)
      //         : ""
      //     }`
      // );
      return data;
    } catch (error) {
      console.error("Error submitting paper in submitPaper:", error);
    }
  } else {
    console.log(
      "No user found. User must be logged in to submit a paper. in submitPaper"
    );
  }
}

//添加某指定用户id下的论文

//删除指定用户下paperNumber的论文
export async function deletePaper(
  supabase: SupabaseClient,
  userId: string,
  paperNumber: string
) {
  const { data, error } = await supabase
    .from("user_paper")
    .delete()
    .eq("user_id", userId)
    .eq("paper_number", paperNumber);
  console.log("删除的数据", data);
  if (error) {
    console.error("删除出错", error);
    return null;
  }
  return data;
}
//获取用户论文
export async function getUserPapers(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("user_paper") // 指定表名
    .select("*") // 选择所有列
    .eq("user_id", userId); // 筛选特定user_id的记录

  if (error) {
    console.error("查询出错", error);
    return null;
  }

  return data; // 返回查询结果
}
// 获取用户论文的序号
export async function getUserPaperNumbers(
  userId: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("user_paper") // 指定表名
    .select("paper_number") // 仅选择paper_number列
    .eq("user_id", userId); // 筛选特定user_id的记录

  if (error) {
    console.error("查询出错", error);
    return null;
  }
  console.log("获取到的用户论文数量:", data);
  // 返回查询结果，即所有论文的序号
  return data.map((paper) => paper.paper_number);
}
// 获取用户指定序号论文的内容
export async function getUserPaper(
  userId: string,
  paperNumber: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from("user_paper") // 指定表名
    .select("paper_content,paper_reference") // 仅选择paper_content列
    .eq("user_id", userId) // 筛选特定user_id的记录
    .eq("paper_number", paperNumber)
    .single(); // 筛选特定paper_number的记录

  if (error) {
    console.error("查询出错", error);
    return null;
  }

  // 返回查询结果，即指定论文的内容
  return data;
}

// 使用Supabase客户端实例来查询vip_statuses表
export async function fetchUserVipStatus(userId: string) {
  const { data, error } = await supabase
    .from("vip_statuses")
    .select("is_vip")
    .eq("user_id", userId)
    .single();
  if (error) {
    console.error("Error fetching VIP status:", error);
    return false;
  }
  if ("is_vip" in data) {
    console.log("VIP status:", data.is_vip);
    return data.is_vip;
  } else {
    return false;
  }
}

//profiles表 插入用户信息
export async function insertUserProfile(data: any, supabase: SupabaseClient) {
  let user;
  if (data.user) {
    user = data.user;
  } else {
    user = data;
  }

  if (user) {
    // console.log("user in insertUserProfile:", user);
    const currentTime = new Date().toISOString(); // 生成ISO格式的时间字符串

    const { data, error: profileError } = await supabase
      .from("profiles")
      .upsert([
        {
          id: user.id,
          email: user.email,
          created_at: currentTime, // 添加创建时间
        },
      ]);

    if (profileError) {
      console.error("Failed to create user profile:", profileError);
      Sentry.captureException(profileError);
    }

    Sentry.setUser({
      email: user.email,
      id: user.id,
      ip_address: "{{auto}}",
    });
  }
}

import { NextResponse } from "next/server";

import { SupabaseClient } from "@supabase/supabase-js";
export async function setVip(
  supabaseAdmin: SupabaseClient,
  userId: string,
  isVip = true,
  source = "Linuxdo",
  startDate = new Date(),
  endDate = new Date()
) {
  if (!userId)
    return NextResponse.json({ message: "No user found" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("vip_statuses").upsert(
    {
      user_id: userId,
      is_vip: isVip,
      source: source,
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

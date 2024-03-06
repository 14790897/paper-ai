"use server";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator"; // 确保路径正确
import { insertUserProfile } from "@/utils/supabase/supabaseutils";
import React from "react";
export default async function WelcomeScreen() {
  //   const [isLoading, setIsLoading] = React.useState(true);
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data,
    data: { user },
  } = await supabase.auth.getUser();
  //profiles表 插入用户信息
  await insertUserProfile(data, supabase);
  //   setIsLoading(false);
  //1秒后跳转到首页
  //   setTimeout(() => {
  redirect("/");
  //   }, 1000);

  return (
    <>
      {user ? (
        <div className="flex items-center gap-4">
          Hey, {user.email}!
          <div style={{ margin: "20px", textAlign: "center" }}>
            <h1>welcome, {user.email}!</h1>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
        >
          Login
        </Link>
      )}
      <LoadingIndicator />
    </>
  );
}

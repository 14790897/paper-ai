// api/oauth/callback.js
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
//supabase
import { insertUserProfile } from "@/utils/supabase/supabaseutils";
import { setVip } from "@/utils/supabase/serverutils";
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    // await supabase.auth.exchangeCodeForSession(code);

    // 使用授权码请求访问令牌
    const tokenResponse = await getToken(code);

    const accessToken = tokenResponse!.data.access_token;
    console.log("accessToekn", accessToken);
    // 使用访问令牌获取用户信息
    const userResponse = await axios.get("https://connect.linux.do/api/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userInfo = userResponse.data;
    const uuid = "9e1c30b5-723c-4805-b3b8-0ac3c1923514"; //生成密码
    let userId = null;
    // 尝试注册新用户
    const signUpResponse = await supabase.auth.signUp({
      email: `${userInfo.username}@linux.do`, // 使用模板字符串构建email
      password: uuid, // 使用uuid作为密码
    });

    if (signUpResponse.error) {
      // 如果用户已存在，尝试登录来获取用户信息
      await supabase.auth.signOut();
      const signInResponse = await supabase.auth.signInWithPassword({
        email: `${userInfo.username}@linux.do`,
        password: uuid,
      });
      if (signInResponse.error) {
        console.error("Error logging in existing user:", signInResponse.error);
        // 处理登录失败的情况
      } else {
        //signin成功
        userId = signInResponse.data.user!.id;
      }
    } else {
      //signup成功之后可能要signin一次
      const signInResponse = await supabase.auth.signInWithPassword({
        email: `${userInfo.username}@linux.do`,
        password: uuid,
      });
      console.log("signInResponse:", signInResponse);
      userId = signUpResponse.data.user!.id;
    }
    // 如果获取到了用户ID，进行后续操作
    if (userId) {
      // console.log("signUpResponse.data:", signUpResponse.data);
      //插入信息并设置VIP
      await insertUserProfile(signUpResponse.data, supabase);
      await setVip(supabase, userId, true, "Linuxdo");
    } else {
      return new Response(
        JSON.stringify({ error: "Unable to register or login the user" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin);
  }

  async function getToken(code: string) {
    // 使用client_id和client_secret创建Basic Auth凭证
    try {
      const tokenResponse = await axios.post(
        "https://connect.linux.do/oauth2/token",
        `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
          process.env.REDIRECT_URI
        )}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_CLIENT_ID}:${process.env.CLIENT_SECRET}`
            ).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // 处理tokenResponse...
      return tokenResponse;
    } catch (error) {
      // 处理错误...
      console.error(error);
    }
  }
}

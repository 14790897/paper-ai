"use client";
import { insertUserProfile } from "@/utils/supabase/supabaseutils";
import { createClient } from "@/utils/supabase/client";
export function SignInGitHub() {
  const signInWithGithub = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
    });
    if (error) {
      console.error("GitHub authentication failed:", error.message);
      return; // 如果出现错误，不再继续执行
    }
    //profiles表 插入用户信息
    await insertUserProfile(data, supabase);
  };
  return (
    <button
      className="bg-black text-white rounded-md px-4 py-2 flex items-center justify-center"
      onClick={signInWithGithub}
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2 h-4 w-4"
      >
        <title>GitHub icon</title>
        <path
          fill="currentColor"
          d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2C8.7 21 8 20 8 20c-1.1 0-1.8-.9-1.8-.9-.6-1-.1-1.8.1-2 .7-.6 1.8-.4 2.7.1.1-.5.3-.9.5-1.1-2.3-.3-4.7-1.1-4.7-5 0-1.1.4-2 1-2.7 0-1 .1-2 .7-2.7 0 0 .9-.3 2.8 1a9.8 9.8 0 0 1 5.2 0c1.9-1.3 2.8-1 2.8-1 .6.7.7 1.7.7 2.7.7.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.7 5 .3.2.6.7.6 1.4v2.1c0 .3.2.7.8.6A12 12 0 0 0 12 .3"
        />
      </svg>
      Sign In with GitHub
    </button>
  );
}

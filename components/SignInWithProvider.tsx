// components/SignInWithProvider.tsx

"use client";
import { insertUserProfile } from "@/utils/supabase/supabaseutils";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { FaGithub, FaGoogle } from "react-icons/fa";

export function SignInWithProvider({ provider, redirectTo }) {
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.provider_token) {
        // 用户登录成功，执行后续操作
        await insertUserProfile(session.user, supabase);
        Sentry.captureMessage(`${provider}登录成功`, "info");
        console.log(`${provider}登录成功`);
      } else {
        Sentry.captureMessage(
          `${provider}登录中的其它的event：${event}`,
          "warning"
        );
        console.log(`${provider}登录中的其它的event：`, event);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [provider]);

  function getProviderIcon(provider) {
    switch (provider) {
      case "github":
        return <FaGithub />;
      case "google":
        return <FaGoogle />;
      default:
        return null;
    }
  }

  const signIn = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        // redirectTo: redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error(`${provider} authentication failed:`, error.message);
    }
    //profiles表 插入用户信息
    await insertUserProfile(data, supabase);
  };
  return (
    <button
      onClick={signIn}
      className="bg-black text-white rounded-md px-4 py-2 mb-2 flex items-center justify-center gap-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition ease-in duration-200 w-full"
    >
      {getProviderIcon(provider)} Sign In with{" "}
      {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </button>
  );
}

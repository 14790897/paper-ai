"use client";
import React, { useEffect } from "react";
//supabase
import { createClient } from "@/utils/supabase/client";

const GoogleSignIn = () => {
  const supabase = createClient();

  // 加载Google身份验证库并初始化
  useEffect(() => {
    // 异步检查用户是否已经登录
    const checkSession = async () => {
      const session = await supabase.auth.getSession();

      if (session) {
        console.log("用户已登录", session);
      } else {
        loadGoogleSignInScript();
      }
    };

    checkSession();
  }, []);

  const loadGoogleSignInScript = () => {
    // 确保gapi脚本只被加载一次
    if (!window.gapi) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initGoogleSignIn();
    }
  };

  // 初始化Google登录
  const initGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id:
        "646783243018-m2n9qfo12k70debpmkesevt5j2hi2itb.apps.googleusercontent.com", // 替换为你的客户端ID
      callback: handleSignInWithGoogle,
      auto_select: false, // 根据需要设置
      itp_support: true,
    });
  };

  // 处理登录响应
  const handleSignInWithGoogle = async (response) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: response.credential,
      nonce: "", // 如果你使用nonce，请在这里设置
    });

    if (error) {
      console.error("Login failed:", error);
      return;
    }

    console.log("Login successful:", data);
    // 在这里处理登录成功后的逻辑
  };

  return (
    <div>
      {/* <div
        id="g_id_onload"
        data-client_id="646783243018-m2n9qfo12k70debpmkesevt5j2hi2itb.apps.googleusercontent.com"
        data-context="signin"
        data-ux_mode="popup"
        // data-callback="handleSignInWithGoogleccounts.id.ini"
        data-nonce=""
        data-auto_select="false"
        data-itp_support="true"
      ></div> */}
      <div
        id="g_id_signin"
        className="g_id_signin"
        data-type="standard"
        data-shape="pill"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
    </div>
  );
};

export default GoogleSignIn;

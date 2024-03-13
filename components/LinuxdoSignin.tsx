"use client";
// import React from "react";

const LinuxdoSignin = () => {
  console.log(
    "process.env.NEXT_PUBLIC_CLIENT_ID",
    process.env.NEXT_PUBLIC_CLIENT_ID
  );
  const handleLogin = () => {
    // 构建授权URL
    const responseType = "code";
    const authUrl = `https://connect.linux.do/oauth2/authorize?response_type=${responseType}&client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&state=ttt1`;

    // 重定向到授权页面
    window.location.href = authUrl;
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-md px-4 py-2 mb-2 flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-400 shadow-lg hover:shadow-xl transition ease-in duration-200 w-full
"
      >
        Login with Linuxdo(free VIP)
      </button>
    </div>
  );
};

export default LinuxdoSignin;

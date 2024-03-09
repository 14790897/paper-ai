"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const RequestResetPassword = () => {
  const supabase = createClient();

  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // 确保这个URL是你重置密码页面的地址
    });
    console.log("当前链接", `${window.location.origin}/reset-password`);
    if (error) {
      alert("Error sending password reset email: " + error.message);
    } else {
      alert("Please check your email for the password reset link");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
      />
      <button
        onClick={handleResetPassword}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Reset Password（重置密码）
      </button>
    </div>
  );
};

export default RequestResetPassword;

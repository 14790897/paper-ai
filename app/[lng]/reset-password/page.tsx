"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const ResetPassword = () => {
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleNewPassword = async () => {
    // 检查两次输入的密码是否一致
    if (newPassword !== confirmPassword) {
      alert("The passwords do not match. Please try again.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert("Error resetting password: " + error.message);
    } else {
      alert("Your password has been reset successfully.");
      router.push("/login"); // 导航到登录页面或其他页面
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-gray-50 p-6 rounded-lg shadow-md">
      <input
        type="password"
        placeholder="New password（新密码）"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="Confirm new password（确认新密码）"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleNewPassword}
        className="px-4 py-2 w-full text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
      >
        Update Password（更新密码）
      </button>
    </div>
  );
};

export default ResetPassword;

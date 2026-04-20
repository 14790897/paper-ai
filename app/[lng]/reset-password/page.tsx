"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const ResetPassword = () => {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const lng = (params.lng as string) || "en-US";
  const isZh = lng === "zh-CN";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(isZh ? "两次输入的密码不一致" : "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError(isZh ? "密码至少需要 6 个字符" : "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push(`/${lng}/login`), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{ background: "linear-gradient(160deg, #f0f0ff 0%, #fafbff 40%, #f5f0ff 100%)" }}>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

      <div className="w-full max-w-[420px] mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${lng}`} className="inline-flex items-center gap-2.5 no-underline">
            <img src="/android-chrome-192x192.png" alt="Paper AI" width="32" height="32" />
            <span className="text-2xl font-bold text-gray-900">Paper AI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/5 border border-gray-100/80 p-8">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {isZh ? "密码已更新" : "Password Updated"}
              </h1>
              <p className="text-sm text-gray-500">
                {isZh ? "正在跳转到登录页面..." : "Redirecting to login..."}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {isZh ? "设置新密码" : "Set New Password"}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {isZh ? "请输入你的新密码。" : "Enter your new password below."}
              </p>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl text-sm text-red-600 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleNewPassword} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isZh ? "新密码" : "New Password"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isZh ? "确认新密码" : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
                >
                  {loading
                    ? (isZh ? "更新中..." : "Updating...")
                    : (isZh ? "更新密码" : "Update Password")}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer link */}
        <div className="text-center mt-6">
          <Link
            href={`/${lng}/login`}
            className="text-sm text-indigo-500 hover:text-indigo-700 no-underline transition-colors"
          >
            {isZh ? "返回登录" : "Back to login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import Link from "next/link";

const RequestResetPassword = () => {
  const supabase = createClient();
  const params = useParams();
  const lng = (params.lng as string) || "en-US";
  const isZh = lng === "zh-CN";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${lng}/reset-password`,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{ background: "linear-gradient(160deg, #f0f0ff 0%, #fafbff 40%, #f5f0ff 100%)" }}>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />

      {/* Back button */}
      <Link
        href={`/${lng}/login`}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 no-underline transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {isZh ? "返回登录" : "Back to login"}
      </Link>

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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {isZh ? "邮件已发送" : "Email Sent"}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {isZh
                  ? `重置密码的链接已发送到 ${email}，请查收邮箱。`
                  : `A password reset link has been sent to ${email}. Please check your inbox.`}
              </p>
              <Link
                href={`/${lng}/login`}
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 no-underline"
                style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
              >
                {isZh ? "返回登录" : "Back to Login"}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {isZh ? "重置密码" : "Reset Password"}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {isZh ? "输入你的邮箱地址，我们将发送密码重置链接。" : "Enter your email and we'll send you a reset link."}
              </p>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl text-sm text-red-600 bg-red-50 border border-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    ? (isZh ? "发送中..." : "Sending...")
                    : (isZh ? "发送重置链接" : "Send Reset Link")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestResetPassword;

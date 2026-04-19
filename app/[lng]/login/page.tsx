import Link from "next/link";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
//i18n
import { useTranslation } from "@/app/i18n";
import { FooterBase } from "@/components/Footer/FooterBase";

//supabase
import { insertUserProfile } from "@/utils/supabase/supabaseutils";
// SignInWithProvider
import { SignInWithProvider } from "@/components/SignInWithProvider";
import LinuxdoSignin from "@/components/LinuxdoSignin";
export default async function Login(
  props: {
    searchParams: Promise<{ message: string }>;
    params: Promise<{ lng: string }>;
  }
) {
  const params = await props.params;

  const {
    lng
  } = params;

  const searchParams = await props.searchParams;
  const { t } = await useTranslation(lng);
  const isZh = lng === "zh-CN";

  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    //sentry
    const user = data?.user;
    if (user && process.env.NODE_ENV === "production") {
      Sentry.setUser({
        email: user.email,
        id: user.id,
        ip_address: "{{auto}}}",
      });
    }
    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect(`/${lng}?auth=1`);
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const origin = (await headers()).get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    //profiles表 插入用户信息
    await insertUserProfile(data, supabase);

    // 注册成功后直接登录
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect(`/${lng}?auth=1`);
  };

  const errorMessage = searchParams?.message;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0f0ff 0%, #fafbff 40%, #f5f0ff 100%)" }}>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />

      {/* Back button */}
      <Link
        href={`/${lng}`}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 no-underline transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {isZh ? "返回首页" : "Back"}
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-[420px] mx-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${lng}`} className="inline-flex items-center gap-2.5 no-underline">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#login-logo-grad)" />
              <path d="M8 10h16M8 16h12M8 22h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="20" r="4" fill="rgba(255,255,255,0.3)" />
              <path d="M23 20l1 1 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs><linearGradient id="login-logo-grad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#4f46e5" /><stop offset="1" stopColor="#6366f1" /></linearGradient></defs>
            </svg>
            <span className="text-2xl font-bold text-gray-900">Paper AI</span>
          </Link>
          <p className="mt-3 text-gray-500 text-sm">
            {isZh ? "使用真实文献，让 AI 完成你的论文" : "Write papers with real references powered by AI"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-500/5 border border-gray-100/80 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {isZh ? "登录 / 注册" : "Sign In / Sign Up"}
          </h1>

          {/* Message display */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl text-sm text-center bg-red-50 text-red-600 border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* Email form */}
          <form className="flex flex-col gap-4" action={signIn}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                {isZh ? "密码" : "Password"}
              </label>
              <input
                className="w-full rounded-xl px-4 py-3 bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-2">
              <button
                className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
              >
                {isZh ? "登录" : "Sign In"}
              </button>
              <button
                formAction={signUp}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 transition-all hover:bg-gray-200 hover:-translate-y-0.5"
              >
                {isZh ? "注册" : "Sign Up"}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {isZh
                ? "点击「注册」将使用上方邮箱密码注册，注册成功后自动登录。"
                : "Click \"Sign Up\" to register. You'll be signed in automatically after registration."}
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{isZh ? "或使用以下方式" : "or continue with"}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Third-party login */}
          <div className="flex flex-col gap-3">
            <SignInWithProvider
              provider="google"
              redirectTo={`/${lng}?auth=1`}
            />
            <SignInWithProvider
              provider="github"
              redirectTo={`/${lng}?auth=1`}
            />
            <LinuxdoSignin />
          </div>

          {/* Reset password link */}
          <div className="text-center mt-5">
            <Link
              href={`/${lng}/request-reset`}
              className="text-sm text-indigo-500 hover:text-indigo-700 no-underline transition-colors"
            >
              {isZh ? "忘记密码？" : "Forgot password?"}
            </Link>
          </div>
        </div>

        {/* Skip login link */}
        <div className="mt-5 text-center">
          <Link
            href={`/${lng}/set-guest`}
            className="text-sm text-gray-400 hover:text-gray-600 no-underline transition-colors inline-flex items-center gap-1.5"
          >
            {isZh ? "暂不登录，直接体验" : "Skip, try without signing in"}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <a
              href="https://github.com/14790897/paper-ai"
              target="_blank"
              className="hover:text-gray-600 transition-colors no-underline text-gray-400"
              rel="noreferrer"
            >
              GitHub
            </a>
            <span>·</span>
            <FooterBase t={t} lng={lng} />
          </div>
        </footer>
      </div>
    </div>
  );
}

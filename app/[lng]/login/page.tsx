import Link from "next/link";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import DeployButton from "@/components/DeployButton";
import SettingsLink from "@/components/SettingsLink";
//i18n
import { useTranslation } from "@/app/i18n";
import { FooterBase } from "@/components/Footer/FooterBase";
//supabase
import { insertUserProfile } from "@/utils/supabase/supabaseutils";
// SignInWithProvider
import { SignInWithProvider } from "@/components/SignInWithProvider";
import LinuxdoSignin from "@/components/LinuxdoSignin";
export default async function Login({
  searchParams,
  params: { lng },
}: {
  searchParams: { message: string };
  params: { lng: string };
}) {
  const { t } = await useTranslation(lng);

  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
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

    return redirect("/");
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    //profiles表 插入用户信息
    await insertUserProfile(data, supabase);

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/login?message=Check email to continue sign in process");
  };

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
          <SettingsLink />
        </div>
      </nav>
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{" "}
        Back
      </Link>
      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={signIn}
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2">
          Sign In（登录）
        </button>
        <button
          formAction={signUp}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
        >
          Sign Up（注册）
        </button>
        {/* 重置密码 */}
        <button className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2">
          <Link href="/request-reset">Reset Password（重置密码）</Link>
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
      <div>
        <LinuxdoSignin />
        <SignInWithProvider
          provider="github"
          redirectTo="https://www.paperai.life/welcome"
        />
        <SignInWithProvider
          provider="google"
          redirectTo="https://www.paperai.life/welcome"
        />
      </div>
      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <div className="flex items-center space-x-4">
          {" "}
          {/* 添加flex容器来水平排列子元素 */}
          <a
            href="https://github.com/14790897/paper-ai"
            target="_blank"
            className="font-bold text-blue-600 hover:underline hover:text-blue-800"
            rel="noreferrer"
          >
            {t("give me a star in GitHub")}
          </a>
          <FooterBase t={t} lng={lng} />
        </div>
      </footer>
    </div>
  );
}

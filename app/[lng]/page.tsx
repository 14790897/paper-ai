import PaperListButtonWrapper from "@/components/PaperListButtonWrapper";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/SignUpUserSteps";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import QuillWrapper from "@/components/QuillWrapper";
// import TinyEditor from "../components/TinyEditor";
// import SEditor from "../components/SlateEditor";
import SettingsLink from "@/components/SettingsLink";
import PaperManagementWrapper from "@/components/PaperManagementWrapper";
//i18n
import { useTranslation } from "@/app/i18n";
import { FooterBase } from "@/components/Footer/FooterBase";
import { IndexProps } from "@/utils/global";
import GoogleSignIn from "@/components/GoogleSignIn";
import LandingPage from "@/components/LandingPage";
import { redirect } from "next/navigation";

// import Error from "@/app/app/error";
export default async function Index({ params: { lng }, searchParams }: IndexProps & { searchParams?: { guest?: string } }) {
  const { t } = await useTranslation(lng);

  const cookieStore = cookies();
  let supabase: any, user;
  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      supabase = createClient(cookieStore);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();
  if (supabase) {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  }

  // 未登录用户处理
  if (!user) {
    // auth=1: 刚完成 OAuth 登录，cookie 已写入但 RSC 还没读到，带时间戳重定向刷新
    if (searchParams?.auth === "1") {
      redirect(`/${lng}?t=${Date.now()}`);
    }
    // guest=1: 放行到编辑器体验
    if (searchParams?.guest !== "1") {
      return <LandingPage lng={lng} />;
    }
  }

  console.log("user in page", user);
  return (
    <div className="flex-1 w-full flex flex-col gap-5 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-12">
        <div className="w-full max-w-4xl flex items-center justify-between py-1 px-3 text-sm gap-3">
          <a
            href="https://docs.paperai.sixiangjia.de"
            target="_blank"
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            rel="noreferrer"
          >
            <strong>{t("使用文档")}</strong>
          </a>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/75 p-1 shadow-sm backdrop-blur-sm">
            {/* 用来表示是否显示论文列表页 */}
            <PaperListButtonWrapper />
            {isSupabaseConnected && <AuthButton />}
            <SettingsLink />
            </div>
            {/* 如果用户没有登录会出现谷歌的sign in按钮登录之后不会出现 */}
            {!user && <GoogleSignIn />}
          </div>
        </div>
      </nav>
      <PaperManagementWrapper lng={lng} />
      <QuillWrapper lng={lng} />
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
          <a
            href="https://gitcode.com/liuweiqing147/paper-ai"
            target="_blank"
            className="font-bold text-blue-600 hover:underline hover:text-blue-800"
            rel="noreferrer"
          >
            {t("AtomGit 仓库")}
          </a>
          <a
            href="./privacy"
            target="_blank"
            className="font-bold text-blue-500 hover:underline hover:text-blue-700"
          >
            <strong>{t("隐私政策")}</strong>
          </a>
          <a
            href="./service"
            target="_blank"
            className="font-bold text-blue-500 hover:underline hover:text-blue-700"
          >
            <strong>{t("服务条款")}</strong>
          </a>
          <FooterBase t={t} lng={lng} />
          <span className="text-gray-500">{t("AI服务免费，仅云服务收费")}</span>
        </div>
      </footer>
    </div>
  );
}

{
  /* <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <Header />
        <main className="flex-1 flex flex-col gap-6">
          <h2 className="font-bold text-4xl mb-4">Next steps</h2>
          {isSupabaseConnected ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
        </main>
      </div> */
}
{
  /* <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3"> */
}
{
  /*</div> */
}

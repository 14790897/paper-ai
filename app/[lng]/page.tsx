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

// import Error from "@/app/global-error";
export default async function Index({ params: { lng } }: IndexProps) {
  const { t } = await useTranslation(lng);

  const cookieStore = cookies();
  let supabase: any, user;
  const canInitSupabaseClient = () => {
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
  console.log("user in page", user);
  return (
    <div className="flex-1 w-full flex flex-col gap-5 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          {/* <DeployButton /> */}
          {/* 用来表示是否显示论文列表页 */}
          <PaperListButtonWrapper />
          {isSupabaseConnected && <AuthButton />}
          {/* 如果用户没有登录会出现谷歌的sign in按钮登录之后不会出现 */}
          {!user && <GoogleSignIn />}
          <SettingsLink />
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
            href="https://docs.paperai.life/"
            target="_blank"
            className="font-bold text-blue-500 hover:underline hover:text-blue-700"
          >
            <strong>使用文档</strong>
          </a>
          <a
            href="./privacy"
            target="_blank"
            className="font-bold text-blue-500 hover:underline hover:text-blue-700"
          >
            <strong>PrivacyPolicy</strong>
          </a>
          <a
            href="./service"
            target="_blank"
            className="font-bold text-blue-500 hover:underline hover:text-blue-700"
          >
            <strong>Service</strong>
          </a>
          <FooterBase t={t} lng={lng} />
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

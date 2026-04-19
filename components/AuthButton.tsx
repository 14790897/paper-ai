import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { insertUserProfile } from "@/utils/supabase/supabaseutils";

export default async function AuthButton() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data,
    data: { user },
  } = await supabase.auth.getUser();
  //profiles表 插入用户信息 ？？？这里好像不应该写 March 8th, 2026 11:14 AM
  // await insertUserProfile(data, supabase); // April 19th, 2026
  // console.log("1111 in AuthButton   user:", user);
  const signOut = async () => {
    "use server";

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();

    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[140px] truncate text-xs text-slate-500 md:inline">
        {user.email}
      </span>
      {/* <div className="vip-icon bg-yellow-400 text-white p-2 rounded-full shadow-lg animate-pulse">
        VIP
      </div> */}
      <form action={signOut}>
        <button className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      Login
    </Link>
  );
}

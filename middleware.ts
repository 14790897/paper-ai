import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

let locales = ["en", "zh-CN"];

function getLocale(request: NextRequest) {
  // 从请求中获取`Accept-Language`头
  const headers = {
    "accept-language": request.headers.get("accept-language") || undefined,
  };

  // 使用`Negotiator`根据`Accept-Language`头获取优先语言列表
  const languages = new Negotiator({ headers }).languages();

  // 定义默认语言
  let defaultLocale = "en";

  // 使用`match`函数匹配最合适的语言
  return match(languages, locales, defaultLocale);
}

export async function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  try {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    const { supabase, response } = createClient(request);

    // 如果URL中已经包含地区代码，则刷新会话
    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    if (pathnameHasLocale) {
      await supabase.auth.getSession();
      return response;
    }
    // 如果没有地区代码，则重定向到包含首选地区的URL
    if (!pathnameHasLocale) {
      const locale = getLocale(request);
      request.nextUrl.pathname = `/${locale}${pathname}`;
      // e.g. incoming request is /products
      // The new URL is now /en-US/products
      return NextResponse.redirect(request.nextUrl);
    }
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|twitter-image.png|opengraph-image.png|manifest.json|site.webmanifest|favicon-32x32.png|favicon-16x16.png|apple-touch-icon.png|android-chrome-512x512.png|android-chrome-192x192.png|service-worker.js|serviceregister.js|global.css|sitemap.xml|robots.txt|api/oauth/callback).*)",
  ],
};

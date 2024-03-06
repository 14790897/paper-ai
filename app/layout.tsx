import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  manifest: "/manifest.json",
  metadataBase: new URL(defaultUrl),
  title: "paper ai 使用真实文献让AI完成论文",
  description: "写论文最高效的方式",
  keywords: [
    "free AI",
    "免费AI模型",
    "AI",
    "AI paper",
    "true references",
    "真实文献",
    "真实文献引用",
  ],
  authors: [{ name: "liuweiqing", url: "https://github.com/14790897" }],
  creator: "liuweiqing",
  publisher: "liuweiqing",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "de-DE": "/de-DE",
    },
  },
  openGraph: {
    images:
      "https://file.liuweiqing.life/2024/02/540f3476ef43c831934ce0359c367acd.png",
  },
  twitter: {
    card: "page",
    title: "AI write",
    description: "The fastest way to write paper",
    creator: "@hahfrank",
    images: [
      "https://file.liuweiqing.life/2024/02/540f3476ef43c831934ce0359c367acd.png",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      {/* <Script>{`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                  // 注册成功
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  // 注册失败 :(
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}</Script> */}
      {/* msft clarify */}
      <Script>
        {`(function (c, l, a, r, i, t, y) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", "l869naiex9");`}
      </Script>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </body>
      <GoogleAnalytics gaId="G-05DHTG9XQ5" />
    </html>
  );
}

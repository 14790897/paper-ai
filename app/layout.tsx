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
      <Script
        dangerouslySetInnerHTML={{
          __html: `
      // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/mqoya8yp'
      (function(){
        var w = window;
        var ic = w.Intercom;
        if (typeof ic === "function") {
          ic('reattach_activator');
          ic('update', intercomSettings);
        } else {
          var d = document;
          var i = function() { i.c(arguments); };
          i.q = [];
          i.c = function(args) { i.q.push(args); };
          w.Intercom = i;
          function l() {
            var s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://widget.intercom.io/widget/mqoya8yp';
            var x = d.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
          }
          if (d.readyState === 'complete') {
            l();
          } else if (w.attachEvent) {
            w.attachEvent('onload', l);
          } else {
            w.addEventListener('load', l, false);
          }
        }
      })();
    `,
        }}
      />
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          {children}
        </main>
      </body>
      <GoogleAnalytics gaId="G-05DHTG9XQ5" />
    </html>
  );
}

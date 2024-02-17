import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "paperai-docs",
  description: "paperai docs",
  base: "/paper-ai/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      {
        text: "GitHub",
        link: "https://github.com/14790897/paper-ai",
      },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          // { text: "Markdown Examples", link: "/markdown-examples" },
          // { text: "Runtime API Examples", link: "/api-examples" },
          { text: "功能介绍 function", link: "/paperai-function" },
          { text: "部署方法 deploy", link: "/paperai-deploy" },
          { text: "环境变量 env", link: "/paperai-env" },
          { text: "界面展示 show", link: "/paperai-interface" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});

<div align="center">
  <a href="https://paperai.sixiangjia.de">
    <img src="./public/android-chrome-192x192.png" alt="the fastest way to create a paper with real references">
  </a>
  <h1>paper-ai</h1>
  
  <p>
    <a href="https://gitcode.com/liuweiqing147/paper-ai">
      <img src="https://gitcode.com/liuweiqing147/paper-ai/star/badge.svg" alt="GitCode stars">
    </a>
  </p>
</div>

<p align="center"> <a href="./README_en.md"><b>English Documentation </b></a> </p>

<p align="center">
 使用真实文献最快速完成论文的方法
</p>

<p align="center">
<a href='https://docs.paperai.sixiangjia.de/' style='font-size: 20px;'><strong>文档网站(教程比较详细,推荐阅读这里)</strong></a> ·
<a href='https://www.bilibili.com/video/BV1Ya4y1k75V'><strong>bilibili视频教程</strong></a>
</p>

<p align="center">
  <a href="#功能"><strong>功能</strong></a> ·
  <a href="#演示"><strong>演示</strong></a> ·
  <a href="#部署到 Vercel"><strong>部署到 Vercel</strong></a> ·
  <a href="#克隆并在本地运行"><strong>克隆并在本地运行</strong></a>
</p>
<br/>

## 功能

### 利用人工智能撰写论文

- **人工智能书写功能**： 点击 "AI 写作 "进行正常对话互动。人工智能将根据您的输入提供写作建议或回答问题。
- **寻找文献功能**： 点击 "寻找文献"，根据输入的关键词在 Semantic Scholar 或 arxiv 或 PubMed 中搜索论文。系统将把信息整合到您的论文中。

### 编辑和修改

- 在编辑器中直接编辑和修改人工智能生成的内容。
- 使用提供的工具调整文本样式和布局。

## 演示

您可以在 [paperai.sixiangjia.de](https://paperai.sixiangjia.de) 查看完整的工作演示。

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/14790897/paper-ai&project-name=paper-ai&repository-name=paper-ai&demo-title=paper-ai&demo-description=This%20starter%20configures%20Supabase%20Auth%20to%20use%20cookies%2C%20making%20the%20user's%20session%20available%20throughout%20the%20entire%20Next.js%20app%20-%20Client%20Components%2C%20Server%20Components%2C%20Route%20Handlers%2C%20Server%20Actions%20and%20Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https://file.14790897.xyz/2024/02/540f3476ef43c831934ce0359c367acd.png)

上述操作还会将 repo 克隆到 GitHub。

如果只想在本地开发，而不想部署到 Vercel，[请按以下步骤操作](#克隆并在本地运行)。

## 镜像运行

1. 拉取镜像

```sh
docker pull 14790897/paperai:latest
```

2. 运行镜像

```sh
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_AI_URL=自定义AI模型地址\
  -e NEXT_PUBLIC_OPENAI_API_KEY=自定义API KEY \
  14790897/paperai:latest
```

## 环境变量说明

1. NEXT_PUBLIC_OPENAI_API_KEY 设置 key，只要在设置界面（右上角齿轮）对应的位置留空就会使用预定的变量
2. NEXT_PUBLIC_AI_URL 设置上游 url，只要在设置界面（右上角齿轮）对应的位置留空就会使用预定的变量
3. NEXT_PUBLIC_SEMANTIC_API_KEY 设置 semantic scholar 的 key，可以增加请求量
4. NEXT_PUBLIC_PUBMED_API_KEY 设置 pubmed 的 key，可以增加请求量

## 克隆并在本地运行

```bash
# 克隆版本库
git clone https://github.com/14790897/paper-ai.git

# 进入项目目录
cd paper-ai

# 安装依赖项
npm install

# 运行项目
npm run dev

```

## 开发踩坑记录

### Quill 光标位置回跳到上一次点击位置

- 问题现象：点击编辑器新位置后立即触发 AI 写作/文献功能，光标有概率回到上一次点击位置，而不是当前点击位置。
- 根因分析：光标位置保存在 React 状态/本地存储中，状态更新是异步的；在快速点击并触发操作时，读取到的是"慢一拍"的旧值。
- 解决方案：
  1. 在 `selection-change` 事件中同步维护一个 `ref`（`cursorPositionRef`）保存最新光标位置。
  2. 执行 AI 操作前，优先读取 `quill.getSelection()` 的实时位置；若为空再回退到 `ref`。（重点）
  3. 本次操作全流程统一使用同一个解析后的 `targetCursorPosition`，避免中途漂移。
- 效果：光标恢复位置与用户最后一次点击位置一致，解决"回到上一次位置"的问题。

### OAuth 登录后需要手动刷新才能进入编辑器

- 问题现象：GitHub/Google OAuth 登录成功后，页面跳转到首页但仍显示 LandingPage（落地页），需要手动刷新一次才能进入编辑器。
- 根因分析：Next.js App Router 使用 React Server Components（RSC），首页在服务端渲染时通过 `supabase.auth.getUser()` 读取 cookie 判断登录状态。Supabase 在 OAuth 回调中通过 `Set-Cookie` 响应头写入 session cookie，但浏览器重定向到首页时，当前这次 RSC 渲染可能已经开始了——此时新 cookie 虽已写入，但服务端在本次请求中未必能立即读到，导致 `getUser()` 返回 `null`，页面走了未登录分支。
- 解决方案：
  1. 新增 `AuthRefresher` 客户端组件，全局挂载在 `app/layout.tsx` 中。
  2. 组件内部监听 Supabase 的 `onAuthStateChange` 事件，当检测到 `SIGNED_IN` 事件时调用 `router.refresh()`。
  3. `router.refresh()` 会重新请求当前页面的 RSC payload，此时服务端一定能读到最新的 cookie，页面自动切换为已登录的编辑器视图。
  4. 组件返回 `null`，不渲染任何 UI，也不依赖 URL 参数或重定向。
- 关键代码（`components/AuthRefresher.tsx`）：

- 效果：OAuth 登录成功后无需手动刷新，自动进入编辑器。

## 参考文档

1. semantic scholar api: https://api.semanticscholar.org/api-docs/#tag/Paper-Data/operation/get_graph_paper_relevance_search
2. pubmed api: https://www.ncbi.nlm.nih.gov/books/NBK25500/
3. i18n: https://locize.com/blog/next-app-dir-i18n/

## 许可证

该项目为[MIT License](LICENSE)的许可

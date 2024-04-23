<a href="https://paperai.life">
<div align="center">
    <img src="./public/android-chrome-192x192.png" alt="the fastest way to create a paper with real references">
</div>
<h1 align="center">paper-ai</h1>
</a>

<p align="center"> <a href="./README_en.md"><b>English Documentation </b></a> </p>

<p align="center">
 使用真实文献最快速完成论文的方法
</p>

<p align="center">
<a href='https://docs.paperai.life/' style='font-size: 20px;'><strong>文档网站(教程比较详细,推荐阅读这里)</strong></a> ·
<a href='https://www.bilibili.com/video/BV1Ya4y1k75V'><strong>bilibili视频教程</strong></a>
</p>

<p align="center">
  <a href="#功能"><strong>功能</strong></a> ·
  <a href="#演示"><strong>演示</strong></a> ·
  <a href="#部署到Vercel"><strong>部署到 Vercel</strong></a> ·
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

您可以在 [paperai.life](https://paperai.life) 查看完整的工作演示。

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/14790897/paper-ai&project-name=paper-ai&repository-name=paper-ai&demo-title=paper-ai&demo-description=This%20starter%20configures%20Supabase%20Auth%20to%20use%20cookies%2C%20making%20the%20user's%20session%20available%20throughout%20the%20entire%20Next.js%20app%20-%20Client%20Components%2C%20Server%20Components%2C%20Route%20Handlers%2C%20Server%20Actions%20and%20Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fpaperai.life%2Fopengraph-image.png)

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

## 参考文档

1. semantic scholar api: https://api.semanticscholar.org/api-docs/#tag/Paper-Data/operation/get_graph_paper_relevance_search
2. pubmed api: https://www.ncbi.nlm.nih.gov/books/NBK25500/
3. i18n: https://locize.com/blog/next-app-dir-i18n/

## 许可证

该项目已获得[MIT License](LICENSE)的许可

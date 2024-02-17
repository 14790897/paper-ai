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

## vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/14790897/paper-ai&project-name=paper-ai&repository-name=paper-ai&demo-title=paper-ai&demo-description=This%20starter%20configures%20Supabase%20Auth%20to%20use%20cookies%2C%20making%20the%20user's%20session%20available%20throughout%20the%20entire%20Next.js%20app%20-%20Client%20Components%2C%20Server%20Components%2C%20Route%20Handlers%2C%20Server%20Actions%20and%20Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fpaperai.life%2Fopengraph-image.png)

## 克隆在本地运行

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

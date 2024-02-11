# 使用 Node.js 官方镜像作为构建环境
FROM node:alpine as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (或 yarn.lock)
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 构建应用
RUN npm run build

# 使用 Node.js 镜像运行应用
FROM node:alpine

# 设置工作目录
WORKDIR /app

# 只复制构建产出和package.json到新的镜像中
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露端口
EXPOSE 3000

# 启动 Next.js 应用
CMD ["npm", "start"]

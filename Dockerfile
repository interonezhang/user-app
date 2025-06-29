# 使用官方 Node.js 运行环境镜像
FROM node:22-alpine

# 创建工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制全部源代码
COPY . .

# 暴露端口（默认 3000）
EXPOSE 3000

# 启动应用
CMD ["node", "app.js"]


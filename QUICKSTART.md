# 快速启动指南

## 环境准备

### 方案1：使用npm（推荐）

1. **检查Node.js版本**
```bash
node --version  # 需要 >= 16.0.0
npm --version   # 需要 >= 7.0.0
```

2. **安装依赖**
```bash
cd /home/hjzd/lzz/lawgpt-vue-frontend
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

### 方案2：使用yarn

```bash
cd /home/hjzd/lzz/lawgpt-vue-frontend
yarn install
yarn dev
```

### 方案3：使用pnpm

```bash
cd /home/hjzd/lzz/lawgpt-vue-frontend
pnpm install
pnpm dev
```

## 后端配置

### 1. 启动后端服务

```bash
cd /home/hjzd/lzz/LawGPT
python start_server.py
```

后端运行在: http://localhost:8000

### 2. 配置CORS（重要！）

编辑 `/home/hjzd/lzz/LawGPT/backend/server.py`：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Vue开发服务器
        "http://localhost:8000",  # 原前端
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

重启后端服务。

## 开发工作流

### 日常开发

1. **启动后端**（终端1）
```bash
cd /home/hjzd/lzz/LawGPT
python start_server.py
```

2. **启动前端**（终端2）
```bash
cd /home/hjzd/lzz/lawgpt-vue-frontend
npm run dev
```

3. **访问应用**
- Vue3前端: http://localhost:3000
- 原前端: http://localhost:8000
- API文档: http://localhost:8000/docs

### 构建生产版本

```bash
cd /home/hjzd/lzz/lawgpt-vue-frontend
npm run build
```

构建产物在 `dist/` 目录，可以部署到任何静态服务器。

### 预览生产构建

```bash
npm run preview
```

## 常见问题

### 1. 端口被占用

修改 `vite.config.js`:
```javascript
server: {
  port: 3001,  // 改为其他端口
  ...
}
```

### 2. API请求失败

检查：
- 后端是否启动
- CORS是否配置
- API地址是否正确（检查 `.env` 文件）

### 3. 依赖安装失败

尝试：
```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4. 热更新不工作

检查：
- 文件是否在 `src/` 目录下
- 浏览器是否禁用了缓存

## 环境变量配置

创建 `.env.local` 文件：

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:8000

# 生产环境（示例）
# VITE_API_BASE_URL=https://api.yourdomain.com
```

## 生产部署

### 1. 构建项目

```bash
npm run build
```

### 2. 部署选项

**选项1：Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /path/to/lawgpt-vue-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**选项2：Apache**
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/lawgpt-vue-frontend/dist

    <Directory /path/to/lawgpt-vue-frontend/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

**选项3：Vercel/Netlify**
直接连接GitHub仓库，自动部署。

## 调试技巧

### 1. Vue DevTools

安装浏览器扩展：
- [Vue.js devtools](https://github.com/vuejs/devtools)

可以查看：
- 组件树
- Pinia状态
- 路由信息
- 性能分析

### 2. 网络请求

浏览器开发者工具 > Network标签：
- 查看API请求
- 检查请求/响应
- 分析性能

### 3. Console日志

查看浏览器控制台的日志输出。

## 项目对比测试

可以同时运行两个前端进行对比：

1. **原前端**: http://localhost:8000
2. **Vue3前端**: http://localhost:3000

确保功能一致性。

## 下一步

- 阅读README.md了解项目详情
- 查看MIGRATION.md了解迁移细节
- 开始开发新功能！

# 法律知识库RAG问答系统 - Vue3前端

这是法律知识库RAG问答系统的Vue3前端实现，实现了前后端分离架构。

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vue Router 4** - 官方路由管理器
- **Pinia** - Vue3状态管理库
- **Vite** - 下一代前端构建工具
- **Axios** - HTTP客户端

## 项目结构

```
lawgpt-vue-frontend/
├── src/
│   ├── api/                 # API服务
│   │   ├── config.js       # API配置
│   │   └── index.js        # API服务封装
│   ├── assets/             # 静态资源
│   │   └── css/            # 样式文件
│   ├── components/         # 组件
│   │   ├── modals/         # 模态框组件
│   │   ├── ConversationSidebar.vue
│   │   ├── KnowledgeBaseCard.vue
│   │   ├── DocumentCard.vue
│   │   └── SourceItem.vue
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── store/              # Pinia状态管理
│   │   ├── index.js        # 知识库store
│   │   ├── chat.js         # 聊天store
│   │   └── conversation.js # 会话store
│   ├── utils/              # 工具函数
│   │   └── index.js
│   ├── views/              # 页面视图
│   │   ├── ChatView.vue
│   │   └── KnowledgeBaseView.vue
│   ├── App.vue             # 根组件
│   └── main.js             # 应用入口
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 主要功能

### 1. 问答系统
- 多知识库选择（支持多选）
- 实时聊天界面
- 对话历史管理（最多5轮）
- 参考来源可视化（相似度进度条）
- 会话管理（创建、切换、删除）

### 2. 知识库管理
- 知识库CRUD操作
- 4种分块策略（智能、固定大小、递归字符、条例分块）
- 知识库启用/禁用
- 文档统计（文档数、段落数、总大小）

### 3. 文档管理
- 文档上传（支持批量）
- 文档搜索
- 文档查看（分页）
- 文档删除
- 上传进度可视化

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

## 安装与运行

### 1. 安装依赖

```bash
cd /home/hjzd/lzz/lawgpt-vue-frontend
npm install
```

### 2. 配置后端API地址

在 `.env` 文件中配置（如果后端不在localhost:8000）：

```env
VITE_API_BASE_URL=http://your-backend-url:port
```

### 3. 开发模式运行

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录

### 5. 预览生产构建

```bash
npm run preview
```

## 后端配置

确保后端服务（FastAPI）运行在 `http://localhost:8000`，并且已配置CORS：

```python
# backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Vue开发服务器地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 主要特性

### 响应式设计
- 采用模块化CSS
- 适配不同屏幕尺寸

### 状态管理
- 使用Pinia进行全局状态管理
- 模块化store设计（知识库、聊天、会话分离）

### API封装
- 统一的API服务层
- Axios拦截器
- 错误处理

### 组件化
- 单文件组件（SFC）
- 组件复用
- Props和Emits规范

### 用户体验
- Toast通知
- 加载动画
- 进度条可视化
- 平滑过渡动画

## 开发说明

### 添加新页面
1. 在 `src/views/` 创建Vue组件
2. 在 `src/router/index.js` 添加路由
3. 在 `src/App.vue` 添加导航链接

### 添加新API
1. 在 `src/api/config.js` 添加端点配置
2. 在 `src/api/index.js` 添加API方法

### 添加新状态
1. 在 `src/store/` 创建新的store模块
2. 在组件中使用 `useXxxStore()` 访问

### 添加新组件
1. 在 `src/components/` 创建组件
2. 使用 `<script setup>` 语法
3. 定义Props和Emits

## 与原项目的差异

### 架构改进
- ✅ 前后端完全分离
- ✅ 组件化开发（Vue3 Composition API）
- ✅ 状态管理（Pinia）
- ✅ 路由管理（Vue Router）
- ✅ 模块化构建（Vite）

### 功能完整性
- ✅ 所有原有功能已迁移
- ✅ 代码结构更清晰
- ✅ 更好的类型提示
- ✅ 更容易维护和扩展

## 注意事项

1. **开发环境**：确保后端API服务已启动
2. **CORS配置**：后端需要配置允许前端域名
3. **代理配置**：Vite已配置API代理到localhost:8000
4. **环境变量**：使用 `VITE_` 前缀的环境变量

## License

MIT

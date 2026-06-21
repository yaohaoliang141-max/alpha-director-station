# 🎬 ALPHA 导演工作站（AI Director Station）

> 粘贴剧本 + 上传参考样片 → AI 自动拆解分镜 → 生成可直接喂给「即梦」等 AI 视频工具的高质量提示词。

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 这个项目能干什么？

1. 📜 你粘贴一段**故事/剧本文本**
2. 🎥 上传一段**参考样片**（.mp4，30MB 以内）
3. 🤖 AI 自动分析样片的视觉风格（美学、运镜、节奏）
4. ✂️ 自动将剧本拆解成多个 15 秒分镜
5. 📋 为每个分镜生成 **200 字以上的电影级提示词**，可直接复制到「即梦」等 AI 视频生成工具

---

## 🛠️ 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | Next.js 14（App Router） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| AI 模型 | 通义千问 qwen-vl-max（视频解析）+ qwen-max（分镜生成） |
| AI 接口 | 阿里云 DashScope（兼容 OpenAI SDK） |

---

## 🚀 从零开始使用（保姆级教程）

### 第一步：安装 Node.js

> 已装过 Node.js 18+ 的可以跳过。

1. 打开 [Node.js 官网](https://nodejs.org/)
2. 下载 **LTS 版本**（左边的绿色按钮）
3. 安装时一路点 Next，**不需要改任何设置**
4. 安装完打开命令提示符（`Win+R` 输入 `cmd`），输入：
   ```
   node -v
   ```
   能看到版本号（如 `v20.x.x`）就成功了 ✅

---

### 第二步：下载本项目

**方法 A：直接下载 ZIP（不会 git 就用这个）**

1. 点击本页面右上角绿色的 **`<> Code`** 按钮
2. 点 **`Download ZIP`**
3. 解压到你喜欢的位置

**方法 B：用 Git 克隆**

```bash
git clone https://github.com/yaohaoliang141-max/alpha-director-station.git
```

---

### 第三步：安装依赖

打开命令提示符 / PowerShell / 终端，进入项目目录：

```bash
cd alpha-director-station
```

然后运行：

```bash
npm install
```

> 💡 如果 `npm install` 很慢，可以先切换国内镜像：
> ```bash
> npm config set registry https://registry.npmmirror.com
> npm install
> ```

---

### 第四步：获取通义千问 API Key（必须）

1. 打开 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/apiKey)
2. 注册/登录阿里云账号
3. 点击 **创建 API Key**
4. 复制生成的 Key（以 `sk-` 开头）

---

### 第五步：配置环境变量

在项目根目录下，**复制** `.env.example` 并重命名为 `.env.local`：

```bash
# Windows 命令提示符
copy .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

然后用记事本（或任何编辑器）打开 `.env.local`，把 `sk-xxx...` 替换为你自己的 Key：

```
DASHSCOPE_API_KEY="sk-你的真实Key"
```

> ⚠️ `.env.local` 不会被上传到 GitHub（已在 `.gitignore` 中排除），你的 Key 是安全的。

---

### 第六步：启动应用 🎉

```bash
npm run dev
```

打开浏览器访问：**http://localhost:3000**

使用方法：
1. 在左侧文本框 **粘贴你的剧本/故事**
2. 点击 **上传样片** 选择一个 .mp4 视频（30MB 以内）
3. 点击 **「生成分镜提示词」**
4. 等待 AI 分析（通常 30 秒 ~ 2 分钟，取决于剧本长度）
5. 右侧会出现每个分镜的提示词，hover 后点 **「复制提示词」** 即可

---

## 📂 项目结构

```
alpha-director-station/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页面 UI
│   │   ├── layout.tsx            # 布局
│   │   ├── globals.css           # 全局样式
│   │   └── api/
│   │       └── direct/
│   │           └── route.ts      # API 路由（处理分镜生成请求）
│   └── lib/
│       └── engine/
│           └── directorEngine.ts # 核心引擎（视频风格分析 + 分镜生成）
├── .env.example                  # 环境变量模板
├── package.json                  # 项目依赖
├── tailwind.config.ts            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── README.md                     # 你正在看的文件
```

---

## ❓ 常见问题

### Q：点击生成后报「生成分镜失败」

检查 `.env.local` 里的 `DASHSCOPE_API_KEY` 是否正确填写，且阿里云账号有足够的免费额度。

### Q：`npm install` 报错

确保 Node.js 版本 ≥ 18。运行 `node -v` 检查版本。

### Q：上传视频后报「样片文件过大」

请压缩视频到 30MB 以内。推荐使用 [HandBrake](https://handbrake.fr/) 或在线压缩工具。

### Q：生成速度很慢

正常现象。每个分镜都需要调用一次大模型，剧本越长分镜越多，时间越长。通常 5 个分镜约需 1~2 分钟。

### Q：提示词生成后怎么用？

将提示词复制到「即梦」、「可灵」、「Runway」等 AI 视频生成平台的提示词输入框中即可。

---

## ⚠️ 注意事项

- **仅供学习与创作使用**
- **保护好你的 API Key**，不要公开分享
- 通义千问 API 有免费额度限制，超出后需要付费

---

## 📜 许可证

MIT License — 自由使用、修改、分发，保留原始版权声明即可。

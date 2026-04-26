# ALPHA 导演工作站 (ALPHA Director Station)

ALPHA 导演工作站是一个基于纯文本驱动的 AI 视听语言拆解与提示词生成工具。它专为个人创作者和 AI 视频生成（如即梦、Runway、Sora 等）工作流设计。

只需输入你的故事剧本和想要的“导演风格”，系统会自动将剧本切分为 15 秒的标准镜头，并严格遵循影视景别连贯性规则，一键生成带有专业摄影机运动、光影美学和空间层次的结构化提示词。

## 核心特性

- **极简美学 UI**：遵循 Apple 极简设计语言，提供沉浸式的创作体验。
- **纯文本双引擎 (Text-to-Text)**：采用“剧本 + 视觉风格描述”双文本输入，极大提升处理速度与稳定性。
- **动态剧本拆解**：自动按语速估算，将长剧本精准切分为 15 秒短镜头切片。
- **景别连贯性防跳切**：内置影视分镜规则引擎，确保视觉逻辑自然流畅。
- **国内大模型直连**：接入阿里云通义千问 API，国内环境直连，毫秒级响应。

## 技术栈

本项目采用现代化的纯前端/全栈架构：

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **AI 引擎**: 阿里云通义千问 API (Qwen-Max)

## 快速启动

只需几步，即可在本地运行你的专属导演工作站。

### 1. 克隆项目


## 克隆项目
git clone https://github.com/yaohaoliang141-max/alpha-director-station.git

## 进入文件夹
cd alpha-director-station

## 安装所有依赖包
npm install

## 创建并配置 Key（手动操作）
 在根目录新建 .env.local 文件，写入：QWEN_API_KEY=你的KEY

## 启动服务
npm run dev

    
  
    
   

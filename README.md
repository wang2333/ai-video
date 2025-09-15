# AI Video Generation Platform

一个基于 Next.js 构建的 AI 视频生成平台，支持文生图、图生图、文生视频、图生视频和视频转视频功能。

## 功能特性

- **文生图**: 根据文本描述生成图像
- **图生图**: 基于参考图像生成新图像
- **文生视频**: 根据文本描述生成视频
- **图生视频**: 将静态图像转换为动态视频
- **视频转视频**: 将视频转换为不同风格的视频（新功能）

### 视频转视频功能

支持 8 种预设风格（通过下拉框选择）：

- 日式漫画（默认）
- 美式漫画
- 清新漫画
- 3D 卡通
- 国风卡通
- 纸艺风格
- 简易插画
- 国风水墨

**技术要求**：

- 支持格式：MP4, AVI, MKV, MOV, FLV, TS, MPG, MXF
- 分辨率：256-4096px，长宽比不超过 1.8:1
- 时长限制：不超过 30 秒
- 文件大小：不超过 100MB
- 帧率选项：15fps, 24fps, 30fps

**功能特点**：

- 多模型选择：支持标准版、专业版、快速版等不同质量级别
- 页面级视频校验：上传时自动检查视频规格
- 页面级文件上传：在页面中控制上传流程
- 直观的下拉框风格选择界面
- 实时错误提示和用户反馈
- 上传状态可视化：显示上传进度和结果
- 动态信息展示：根据选择模型显示处理时间和额度消耗
- 自动处理上传服务器连接问题

## 环境配置

1. 复制环境变量文件并配置 API 密钥：

```bash
# 创建 .env.local 文件并添加以下内容
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

2. 获取阿里云通义万相 API 密钥：
   - 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/)
   - 创建应用并获取 API 密钥

## 开始使用

安装依赖并启动开发服务器：

```bash
npm install
npm run dev
# or
yarn install
yarn dev
# or
pnpm install
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── upload/        # 文件上传API
│   │   ├── video-to-video/# 视频转视频API
│   │   └── ...
│   ├── video-to-video/    # 视频转视频页面
│   └── ...
├── components/            # React组件
│   ├── mol/              # 分子级组件
│   │   ├── videoUploadMol.tsx  # 视频上传组件
│   │   └── ...
│   └── ui/               # 基础UI组件
└── lib/                  # 工具库
    ├── apiService.ts     # API服务封装
    └── ...
```

## API 接口

### 文件上传

- **接口**: `POST /api/upload`
- **功能**: 上传视频文件到服务器
- **参数**: FormData with `file` field

### 视频风格转换

- **接口**: `POST /api/video-to-video`
- **功能**: 将视频转换为指定风格
- **支持模型**:
  - `video-style-transform`: 标准版 (100 额度, 2-5 分钟)
  - `video-style-transform-pro`: 专业版 (200 额度, 5-10 分钟)
  - `video-style-transform-fast`: 快速版 (50 额度, 1-2 分钟)
- **参数**:

```json
{
  "model": "video-style-transform",
  "input": {
    "video_url": "http://example.com/video.mp4"
  },
  "parameters": {
    "style": 0,
    "video_fps": 15
  }
}
```

## 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **图标**: Lucide React
- **轮播**: Embla Carousel

## 部署

推荐使用 [Vercel](https://vercel.com) 进行部署：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量 `DASHSCOPE_API_KEY`
4. 部署完成

## 注意事项

1. 确保配置正确的 API 密钥
2. 上传服务器地址需要根据实际情况调整
3. 视频文件大小和时长限制需要严格遵守
4. 建议在生产环境中添加更多的错误处理和用户反馈

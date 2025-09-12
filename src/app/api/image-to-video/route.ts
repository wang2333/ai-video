import { pollTaskStatus } from '@/lib/apiService';
import { NextRequest, NextResponse } from 'next/server';

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge';

/**
 * 视频生成API路由
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const params = await request.json();

    // 获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未配置' }, { status: 500 });
    }

    const { url, ...rest } = params;

    // 调用阿里云视频生成API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable' // 启用异步模式
      },
      body: JSON.stringify(rest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API调用失败: ${response.status} ${JSON.parse(errorText)?.code || response.statusText}`
      );
    }

    const taskResponse = await response.json();

    // 获取任务ID
    const taskId = taskResponse.output.task_id;
    if (!taskId) {
      throw new Error('未获取到任务ID');
    }

    // 第二步：轮询任务状态直到完成
    const pollResult = await pollTaskStatus(taskId, apiKey);

    if (!pollResult.success) {
      throw new Error(pollResult.error);
    }

    return NextResponse.json(pollResult.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

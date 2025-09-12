import { pollTaskStatus } from '@/lib/apiService';
import { NextRequest, NextResponse } from 'next/server';

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge';

/**
 * 图生图API路由
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

    // 第一步：创建异步任务
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable' // 启用异步处理
      },
      body: JSON.stringify(rest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('第三方API调用失败:', errorText);
      throw new Error(
        `API调用失败: ${response.status} ${JSON.parse(errorText)?.code || response.statusText}`
      );
    }

    const taskResponse = await response.json();
    console.log('异步任务创建成功:', JSON.stringify(taskResponse));

    // 获取任务ID
    const taskId = taskResponse.output.task_id;
    if (!taskId) {
      throw new Error('未获取到任务ID');
    }

    console.log(`开始轮询任务状态, 任务ID: ${taskId}`);

    // 第二步：轮询任务状态直到完成
    const pollResult = await pollTaskStatus(taskId, apiKey);

    if (!pollResult.success) {
      throw new Error(pollResult.error);
    }

    console.log('任务执行完成:', JSON.stringify(pollResult.data));

    return NextResponse.json(pollResult.data);
  } catch (error) {
    console.error('图生图API路由错误:', error);
    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

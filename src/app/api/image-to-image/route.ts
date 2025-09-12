import { NextRequest, NextResponse } from 'next/server';

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge';

/**
 * 异步任务状态枚举
 */
enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

/**
 * 轮询任务状态直到完成
 */
async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 60, interval = 2000) {
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(taskUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`查询任务状态失败: ${response.status}`);
      }

      const taskData = await response.json();
      console.log(`任务状态查询 ${attempt + 1}/${maxAttempts}:`, taskData);

      const status = taskData.output.task_status;

      if (status === TaskStatus.SUCCEEDED) {
        return { success: true, data: taskData };
      }

      if (status === TaskStatus.FAILED) {
        return {
          success: false,
          error: taskData.task_metrics?.error_message || '任务执行失败'
        };
      }

      // 如果任务还在运行中，等待后继续轮询
      if (status === TaskStatus.PENDING || status === TaskStatus.RUNNING) {
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }

      // 未知状态
      return {
        success: false,
        error: `未知任务状态: ${status}`
      };
    } catch (error) {
      console.error(`任务状态查询失败 (尝试 ${attempt + 1}):`, error);

      // 如果不是最后一次尝试，继续重试
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '任务状态查询失败'
      };
    }
  }

  return {
    success: false,
    error: '任务执行超时，请稍后重试'
  };
}

/**
 * 图生图API路由
 */
export async function POST(
  request: NextRequest,
  context?: { env?: { DASHSCOPE_API_KEY?: string } }
) {
  try {
    // 解析请求体
    const params = await request.json();

    // 获取API密钥 - 支持 Cloudflare Pages 环境
    const apiKey = context?.env?.DASHSCOPE_API_KEY || process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未配置' }, { status: 500 });
    }

    const { url, model, ...rest } = params;

    // 根据模型构建请求数据
    let requestBody = {};

    if (model === 'wanx2.1-imageedit') {
      // 通义万相图像编辑模型
      requestBody = {
        model: model,
        input: {
          function: 'stylization_all',
          prompt: rest.prompt, // 编辑指令
          base_image_url: rest.imageUrl // 参考图片URL
        },
        parameters: {
          n: rest.outputCount
        }
      };
    }

    // 第一步：创建异步任务
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable' // 启用异步处理
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('创建异步任务失败:', errorText);

      let errorMessage = `创建任务失败: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.code || errorMessage;
      } catch {
        errorMessage += ` ${response.statusText}`;
      }

      throw new Error(errorMessage);
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

    console.log('任务执行完成:', JSON.stringify(pollResult.data, null, 2));

    return NextResponse.json(pollResult.data);
  } catch (error) {
    console.error('图生图API路由错误:', error);
    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

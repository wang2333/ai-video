export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 通用API代理路由
 * 解决CORS跨域问题，统一处理所有API请求
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const { apiUrl, ...requestData } = await request.json();

    // 验证必需参数
    if (!apiUrl) {
      return NextResponse.json({ error: '缺少API地址参数' }, { status: 400 });
    }

    // 获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未配置，请联系管理员' }, { status: 500 });
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    };

    // 如果是异步任务，添加异步标头
    if (requestData._isAsync) {
      headers['X-DashScope-Async'] = 'enable';
      delete requestData._isAsync;
    }

    // 调用外部API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('外部API调用失败:', errorText);

      let errorMessage = `API调用失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.code) {
          errorMessage = `API错误: ${errorData.code}`;
        }
      } catch {
        // 忽略JSON解析错误，使用默认错误信息
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('代理API路由错误:', error);
    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * 任务状态查询路由
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: '缺少任务ID参数' }, { status: 400 });
    }

    // 获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未配置' }, { status: 500 });
    }

    const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
    const response = await fetch(taskUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `查询任务状态失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('任务查询错误:', error);
    return NextResponse.json({ error: '查询任务状态失败' }, { status: 500 });
  }
}

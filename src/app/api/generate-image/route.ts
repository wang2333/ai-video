import { NextRequest, NextResponse } from 'next/server';

// 配置 Edge Runtime 以支持 Cloudflare Pages
export const runtime = 'edge';

/**
 * 文生图API路由
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

    const { url, ...rest } = params;
    console.log('?? ~ params:', JSON.stringify(params));

    // 调用第三方API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
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
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

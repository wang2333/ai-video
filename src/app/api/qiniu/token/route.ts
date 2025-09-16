export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generateUploadToken, UploadPolicy } from '@/lib/qiniuService';

/**
 * 生成七牛云上传凭证API
 * POST /api/qiniu/token
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求参数
    const body = await request.json().catch(() => ({}));

    // 构建上传策略
    const policy: UploadPolicy = {
      expires: body.expires || 3600, // 默认1小时
      fileNamePrefix: body.fileNamePrefix || 'videos/',
      maxFileSize: body.maxFileSize || 500 * 1024 * 1024, // 500MB
      mimeLimit: body.mimeLimit || 'video/*'
    };

    // 生成上传凭证
    const result = await generateUploadToken(policy);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('生成上传凭证失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成上传凭证失败'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取七牛云配置信息API（不包含密钥）
 * GET /api/qiniu/token
 */
export async function GET() {
  try {
    // 只返回基本配置信息，不包含敏感信息
    return NextResponse.json({
      success: true,
      data: {
        message: '七牛云上传服务可用',
        supportedTypes: ['video/*'],
        maxFileSize: 500 * 1024 * 1024, // 500MB
        tokenExpires: 3600 // 1小时
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: '获取配置失败'
      },
      { status: 500 }
    );
  }
}

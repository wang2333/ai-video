import type {
  GenerateImageParams,
  GenerateImageToImageParams,
  GenerateVideoParams,
  ImageToVideoParams,
  VideoToVideoParams,
  GeneratedImage,
  GeneratedVideo,
  VideoGenerationResponse,
  VideoGenerationResponse2
} from '@/types/api';
import { getApiEndpoint, APP_CONFIG } from '@/config';

// ==================== 类型导出 ====================

// ==================== API响应类型 ====================

interface QwenImageResponse {
  output?: {
    choices?: Array<{
      message: {
        content: Array<{
          image: string;
        }>;
      };
    }>;
  };
}

interface WanxImageResponse {
  output?: {
    results?: Array<{
      url: string;
    }>;
  };
}

interface WanxImageEditResponse {
  task_id?: string;
  task_status?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: {
    results?: Array<{
      url: string;
    }>;
  };
}

// 简化的API响应类型
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 重用简化的 ApiResult 类型
export type ServiceResult<T = any> = ApiResult<T>;

// ==================== 统一的HTTP客户端 ====================

/**
 * 简化的HTTP请求方法
 */
async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `请求失败: ${response.status}`
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败'
    };
  }
}

// ==================== 工具函数 ====================

/**
 * 构建文生图请求参数
 */
const buildImageGenerationParams = (params: GenerateImageParams) => {
  if (params.model === 'qwen-image') {
    return {
      model: params.model,
      input: {
        messages: [
          {
            role: 'user',
            content: [{ text: params.prompt }]
          }
        ]
      },
      parameters: {
        negative_prompt: '',
        prompt_extend: true,
        watermark: false,
        size: params.sieze,
        n: params.outputCount
      }
    };
  } else if (params.model === 'wan2.2-t2i-flash') {
    return {
      model: params.model,
      input: {
        prompt: params.prompt
      },
      parameters: {
        size: params.sieze,
        n: params.outputCount
      }
    };
  }
  throw new Error(`不支持的图像生成模型: ${params.model}`);
};

/**
 * 处理图像生成响应数据
 */
const processImageResponse = (data: any, model: string): GeneratedImage[] => {
  if (model === 'qwen-image') {
    const response = data as QwenImageResponse;
    return (
      response?.output?.choices?.map((result, index) => ({
        id: Date.now() + index,
        src: result.message.content[0].image
      })) || []
    );
  } else if (model === 'wan2.2-t2i-flash') {
    const response = data as WanxImageResponse;
    return (
      response?.output?.results?.map((result, index) => ({
        id: Date.now() + index,
        src: result.url
      })) || []
    );
  }
  return [];
};

// ==================== API服务函数 ====================

/**
 * 生成图像API调用
 */
export async function generateImage(params: GenerateImageParams): Promise<ServiceResult<GeneratedImage[]>> {
  try {
    const apiUrl = getApiEndpoint(params.model);
    const requestParams = buildImageGenerationParams(params);

    const result = await apiRequest('/api/proxy', {
      method: 'POST',
      body: JSON.stringify({
        apiUrl,
        ...requestParams
      })
    });

    if (!result.success) {
      return result;
    }

    const images = processImageResponse(result.data, params.model);

    return {
      success: true,
      data: images
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成图像失败'
    };
  }
}

/**
 * 图生图API调用
 */
export async function generateImageToImage(
  params: GenerateImageToImageParams
): Promise<ServiceResult<GeneratedImage[]>> {
    try {
      const apiUrl = getApiEndpoint(params.model);
      const requestParams = {
        model: params.model,
        input: {
          image_url: params.imageUrl,
          style_index: params.styleIndex
        }
      };

      // 创建异步任务
      const taskResult = await apiRequest('/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          apiUrl,
          ...requestParams,
          _isAsync: true
        })
      });

      if (!taskResult.success) {
        return {
          success: false,
          error: taskResult.error
        };
      }

      // 根据不同的API响应结构提取任务ID
      const taskId = (taskResult.data as any)?.output?.task_id || (taskResult.data as any)?.task_id;
      if (!taskId) {
        return {
          success: false,
          error: '未获取到任务ID'
        };
      }

      // 轮询任务状态
      const pollResult = await pollTaskStatus(
        taskId,
        APP_CONFIG.pollingMaxAttempts,
        APP_CONFIG.pollingInterval
      );

      if (!pollResult.success) {
        return pollResult;
      }

      // 处理结果
      const images =
        pollResult.data?.output?.results?.map((result: any, index: number) => ({
          id: Date.now() + index,
          src: result.url
        })) || [];

      return {
        success: true,
        data: images
      };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '图生图失败'
    };
  }
}

/**
 * 文生成视频API调用
 */
export async function generateVideo(
  params: GenerateVideoParams
): Promise<ServiceResult<VideoGenerationResponse>> {
    try {
      const apiUrl = getApiEndpoint(params.model);
      const requestParams = {
        model: params.model,
        input: {
          prompt: params.prompt
        },
        parameters: {
          min_len: 540,
          size: params.resolution,
          duration: params.duration
        }
      };

      // 创建异步任务
      const taskResult = await apiRequest('/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          apiUrl,
          ...requestParams,
          _isAsync: true
        })
      });

      if (!taskResult.success) {
        return {
          success: false,
          error: taskResult.error
        };
      }

      // 根据不同的API响应结构提取任务ID
      const taskId = (taskResult.data as any)?.output?.task_id || (taskResult.data as any)?.task_id;
      if (!taskId) {
        return {
          success: false,
          error: '未获取到任务ID'
        };
      }

      // 轮询任务状态
      const pollResult = await pollTaskStatus(
        taskId,
        APP_CONFIG.pollingMaxAttempts,
        APP_CONFIG.pollingInterval
      );

      if (!pollResult.success) {
        return {
          success: false,
          error: pollResult.error
        };
      }

      return {
        success: true,
        data: pollResult.data as VideoGenerationResponse
      };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成视频失败'
    };
  }
}

/**
 * 图生视频API调用
 */
export async function generateImageToVideo(
  params: ImageToVideoParams
): Promise<ServiceResult<VideoGenerationResponse>> {
    try {
      const apiUrl = getApiEndpoint(params.model);
      const requestParams = {
        model: params.model,
        input: {
          prompt: params.prompt,
          img_url: params.imageUrl
        },
        parameters: {
          resolution: params.resolution,
          duration: params.duration
        }
      };

      // 创建异步任务
      const taskResult = await apiRequest('/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          apiUrl,
          ...requestParams,
          _isAsync: true
        })
      });

      if (!taskResult.success) {
        return {
          success: false,
          error: taskResult.error
        };
      }

      // 根据不同的API响应结构提取任务ID
      const taskId = (taskResult.data as any)?.output?.task_id || (taskResult.data as any)?.task_id;
      if (!taskId) {
        return {
          success: false,
          error: '未获取到任务ID'
        };
      }

      // 轮询任务状态
      const pollResult = await pollTaskStatus(
        taskId,
        APP_CONFIG.pollingMaxAttempts,
        APP_CONFIG.pollingInterval
      );

      if (!pollResult.success) {
        return {
          success: false,
          error: pollResult.error
        };
      }

      return {
        success: true,
        data: pollResult.data as VideoGenerationResponse
      };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '图生视频失败'
    };
  }
}

/**
 * 视频风格转换API调用
 */
export async function generateVideoToVideo(
  params: VideoToVideoParams
): Promise<ServiceResult<VideoGenerationResponse2>> {
    try {
      const apiUrl = getApiEndpoint(params.model);
      const requestParams = {
        model: params.model,
        input: {
          video_url: params.video_url
        },
        parameters: {
          style: params.style,
          video_fps: params.video_fps
        }
      };

      // 创建异步任务
      const taskResult = await apiRequest('/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          apiUrl,
          ...requestParams,
          _isAsync: true
        })
      });

      if (!taskResult.success) {
        return {
          success: false,
          error: taskResult.error
        };
      }

      // 根据不同的API响应结构提取任务ID
      const taskId = (taskResult.data as any)?.output?.task_id || (taskResult.data as any)?.task_id;
      if (!taskId) {
        return {
          success: false,
          error: '未获取到任务ID'
        };
      }

      // 轮询任务状态
      const pollResult = await pollTaskStatus(
        taskId,
        APP_CONFIG.pollingMaxAttempts,
        APP_CONFIG.pollingIntervalLong
      );

      if (!pollResult.success) {
        return {
          success: false,
          error: pollResult.error
        };
      }

      return {
        success: true,
        data: pollResult.data as VideoGenerationResponse2
      };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '视频风格转换失败'
    };
  }
}

// ==================== 轮询工具函数 ====================

/**
 * 简化的任务状态轮询函数
 * @param taskId 任务ID
 * @param maxAttempts 最大尝试次数，默认100次
 * @param interval 轮询间隔（毫秒），默认5秒
 * @returns Promise<ServiceResult<any>>
 */
export const pollTaskStatus = async (
  taskId: string,
  maxAttempts: number = APP_CONFIG.pollingMaxAttempts,
  interval: number = APP_CONFIG.pollingInterval
): Promise<ServiceResult<any>> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`/api/proxy?taskId=${taskId}`);

      console.log(`任务状态查询 ${attempt + 1}/${maxAttempts}:`, {
        taskId,
        response
      });

      if (!response.ok) {
        // 如果不是最后一次尝试，继续重试
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
          continue;
        }
        return {
          success: false,
          error: `查询任务状态失败: ${response.status}`
        };
      }

      const taskData = await response.json();
      const status = taskData?.output?.task_status;

      // 任务成功完成
      if (status === 'SUCCEEDED') {
        return { success: true, data: taskData };
      }

      // 任务失败
      if (status === 'FAILED') {
        return {
          success: false,
          error: taskData?.task_metrics?.error_message || '任务执行失败'
        };
      }

      // 任务运行中，继续轮询
      if (status === 'PENDING' || status === 'RUNNING') {
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
};

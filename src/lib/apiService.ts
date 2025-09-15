export interface GenerateImageParams {
  url: string;
  model: string;
  prompt: string;
  sieze: string;
  outputCount: number;
}

export interface GenerateImageToImageParams {
  url: string;
  model: string;
  prompt?: string;
  imageUrl: string; // 参考图片URL
  outputCount: number;
  styleIndex?: number; // 风格样式索引
}

/**
 * 生成的图像数据
 */
export interface GeneratedImage {
  id: number;
  src: string;
}

/**
 * API响应结构
 */
export interface QwenApiResponse {
  output?: {
    choices?: Array<{
      message: {
        content: Array<{
          image: string;
        }>;
      };
    }>;
  };
  error?: string;
  code?: string;
  message?: string;
}

export interface QwenApiResponse2 {
  output?: {
    results?: Array<{
      url: string;
    }>;
  };
}

export interface WanxImageEditResponse {
  task_id?: string;
  task_status?: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: {
    results?: Array<{
      url: string;
    }>;
  };
  request_id?: string;
  usage?: {
    image_count: number;
  };
  task_metrics?: {
    error_message?: string;
  };
}
/**
 * 生成的视频数据
 */
export interface GeneratedVideo {
  id: number;
  src: string;
  taskId?: string;
}

/**
 * 视频生成参数
 */
export interface GenerateVideoParams {
  url: string;
  model: string;
  prompt: string;
  resolution: string;
  outputCount: number;
  duration?: number;
}

/**
 * 视频提升参数
 */
export interface VideoEnhanceParams {
  url: string;
  model: string;
  prompt: string;
  videoUrl: string; // 原始视频URL
}

/**
 * 图生视频参数
 */
export interface ImageToVideoParams {
  url: string;
  model: string;
  prompt: string;
  imageUrl: string; // 原始图片URL
  resolution: string; // 视频分辨率
  duration: number; // 视频时长
}

/**
 * 视频风格转换参数
 */
export interface VideoToVideoParams {
  url: string;
  model: string;
  video_url: string; // 原始视频URL
  style: number; // 风格类型 0-7
  video_fps: number; // 视频帧率
}

/**
 * 视频生成API响应
 */
export interface VideoGenerationResponse {
  output: {
    output_video_url: string;
    task_id: string;
  };
}

/**
 * 视频任务查询响应
 */
export interface VideoTaskResponse {
  task_id: string;
  task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  output?: {
    results: Array<{
      url: string;
    }>;
  };
  task_metrics?: {
    error_message?: string;
  };
}

/**
 * 统一的API响应结果
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== API服务类 ====================

class ApiService {
  /**
   * 通用的API请求方法
   * @param url 请求地址
   * @param options 请求选项
   * @returns Promise<ServiceResult>
   */
  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ServiceResult<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      return response.ok
        ? { success: true, data }
        : { success: false, error: data.error || `请求失败: ${response.status}` };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败'
      };
    }
  }

  /**
   * 生成图像API调用
   * @param params 生成参数
   * @returns Promise<ServiceResult<GeneratedImage[]>>
   */
  async generateImage(params: GenerateImageParams): Promise<ServiceResult<GeneratedImage[]>> {
    let data = {};
    if (params.model === 'qwen-image') {
      data = {
        url: params.url,
        model: params.model,
        input: {
          messages: [
            {
              role: 'user',
              content: [
                {
                  text: params.prompt
                }
              ]
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
      data = {
        url: params.url,
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
    // 发送请求
    const result = await this.request<QwenApiResponse | QwenApiResponse2>('/api/generate-image', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    let images: GeneratedImage[] = [];
    if (params.model === 'qwen-image') {
      images =
        (result.data as QwenApiResponse)?.output?.choices?.map((result, index) => ({
          id: Date.now() + index,
          src: result.message.content[0].image
        })) || [];
    } else if (params.model === 'wan2.2-t2i-flash') {
      images =
        (result.data as QwenApiResponse2)?.output?.results?.map((result, index) => ({
          id: Date.now() + index,
          src: result.url
        })) || [];
    }

    return {
      success: true,
      data: images
    };
  }

  /**
   * 图生图API调用
   * @param params 生成参数
   * @returns Promise<ServiceResult<GeneratedImage[]>>
   */
  async generateImageToImage(
    params: GenerateImageToImageParams
  ): Promise<ServiceResult<GeneratedImage[]>> {
    const data = {
      url: params.url,
      model: params.model,
      input: {
        image_url: params.imageUrl,
        style_index: params.styleIndex
      }
    };

    // 发送请求到专门的图生图API路由
    const result = await this.request<WanxImageEditResponse>('/api/image-to-image', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }
    // 处理万相图像编辑模型的响应
    const images =
      result.data?.output?.results?.map((result, index) => ({
        id: Date.now() + index,
        src: result.url
      })) || [];

    return {
      success: true,
      data: images
    };
  }

  /**
   * 生成视频API调用
   * @param params 生成参数
   * @returns Promise<ServiceResult<VideoGenerationResponse>>
   */
  async generateVideo(
    params: GenerateVideoParams
  ): Promise<ServiceResult<VideoGenerationResponse>> {
    const data = {
      url: params.url,
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

    const result = await this.request<VideoGenerationResponse>('/api/generate-video', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return result;
  }

  /**
   * 图生视频API调用
   * @param params 生成参数
   * @returns Promise<ServiceResult<VideoGenerationResponse>>
   */
  async generateImageToVideo(
    params: ImageToVideoParams
  ): Promise<ServiceResult<VideoGenerationResponse>> {
    const data = {
      url: params.url,
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

    // 发送请求到图生视频API路由
    const result = await this.request<VideoGenerationResponse>('/api/image-to-video', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return result;
  }

  /**
   * 视频风格转换API调用
   * @param params 转换参数
   * @returns Promise<ServiceResult<VideoGenerationResponse>>
   */
  async generateVideoToVideo(
    params: VideoToVideoParams
  ): Promise<ServiceResult<VideoGenerationResponse>> {
    const data = {
      url: params.url,
      model: params.model,
      input: {
        video_url: params.video_url
      },
      parameters: {
        style: params.style,
        video_fps: params.video_fps
      }
    };
    const result = await this.request<VideoGenerationResponse>('/api/video-to-video', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return result;
  }
}

export const apiService = new ApiService();

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
export const pollTaskStatus = async (
  taskId: string,
  apiKey: string,
  maxAttempts = 100,
  interval = 5000
) => {
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
};

/**
 * 生成图像的便捷方法
 * @param params 生成参数
 * @returns Promise<ServiceResult<GeneratedImage[]>>
 */
export const generateImage = (params: GenerateImageParams) => apiService.generateImage(params);

/**
 * 图生图的便捷方法
 * @param params 生成参数
 * @returns Promise<ServiceResult<GeneratedImage[]>>
 */
export const generateImageToImage = (params: GenerateImageToImageParams) =>
  apiService.generateImageToImage(params);

/**
 * 生成视频的便捷方法
 * @param params 生成参数
 * @returns Promise<ServiceResult<VideoGenerationResponse>>
 */
export const generateVideo = (params: GenerateVideoParams) => apiService.generateVideo(params);

/**
 * 图生视频的便捷方法
 * @param params 生成参数
 * @returns Promise<ServiceResult<VideoGenerationResponse>>
 */
export const generateImageToVideo = (params: ImageToVideoParams) =>
  apiService.generateImageToVideo(params);

/**
 * 视频风格转换的便捷方法
 * @param params 转换参数
 * @returns Promise<ServiceResult<VideoGenerationResponse>>
 */
export const generateVideoToVideo = (params: VideoToVideoParams) =>
  apiService.generateVideoToVideo(params);

export interface GenerateImageParams {
  url: string;
  model: string;
  prompt: string;
  sieze: string;
  outputCount: number;
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
}

export const apiService = new ApiService();

/**
 * 生成图像的便捷方法
 * @param params 生成参数
 * @returns Promise<ServiceResult<GeneratedImage[]>>
 */
export const generateImage = (params: GenerateImageParams) => apiService.generateImage(params);

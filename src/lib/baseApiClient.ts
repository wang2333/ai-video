/**
 * 基础API客户端
 * 提供统一的请求方法和错误处理
 */

/**
 * 统一的API响应结果
 */
export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * API请求选项
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, any>;
  timeout?: number;
}

/**
 * 异步任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

/**
 * 基础API客户端类
 * 封装通用的请求逻辑、错误处理、任务轮询等
 */
class BaseApiClient {
  private readonly apiKey: string;
  private readonly defaultTimeout = 30000; // 30秒默认超时

  constructor() {
    // API密钥现在由服务端代理处理，不需要在客户端配置
    this.apiKey = '';
  }

  /**
   * 统一的HTTP请求方法
   * @param url 请求URL
   * @param options 请求选项
   * @returns Promise<ApiResult<T>>
   */
  async request<T = any>(url: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
    const { body, timeout = this.defaultTimeout, headers = {}, ...restOptions } = options;

    // 构建请求配置
    const requestConfig: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...restOptions
    };

    // 添加请求体（如果存在）
    if (body && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method?.toUpperCase() || '')) {
      requestConfig.body = JSON.stringify(body);
    }

    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestConfig.signal = controller.signal;

    try {
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      // 解析响应
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          error: this.extractErrorMessage(data, response)
        };
      }

      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        error: this.formatRequestError(error)
      };
    }
  }

  /**
   * POST请求快捷方法
   */
  async post<T = any>(
    url: string,
    body?: Record<string, any>,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResult<T>> {
    return this.request<T>(url, { method: 'POST', body, ...options });
  }

  /**
   * GET请求快捷方法
   */
  async get<T = any>(
    url: string,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<ApiResult<T>> {
    return this.request<T>(url, { method: 'GET', ...options });
  }

  /**
   * 提取错误信息
   */
  private extractErrorMessage(data: any, response: Response): string {
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.code) return `API错误: ${data.code}`;
    return `请求失败: ${response.status} ${response.statusText}`;
  }

  /**
   * 格式化请求错误
   */
  private formatRequestError(error: unknown): string {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return '请求超时，请稍后重试';
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return '网络连接失败，请检查网络状态';
    }
    return error instanceof Error ? error.message : '网络请求失败';
  }
}

// 导出单例实例
export const baseApiClient = new BaseApiClient();

// 导出便捷方法
export const { request, post, get } = baseApiClient;

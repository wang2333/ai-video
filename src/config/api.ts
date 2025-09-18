/**
 * API端点配置
 */

export interface ApiEndpoint {
  url: string;
  description: string;
}

// API端点映射
export const API_ENDPOINTS: Record<string, string> = {
  'qwen-image':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  'wan2.2-t2i-flash':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
  'wan2.2-t2i-plus':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
  'wanx-style-repaint-v1':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation',
  'wanx2.1-t2v-turbo':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wanx2.1-t2v-plus':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wan2.2-t2v-plus':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wanx2.1-i2v-turbo':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wanx2.1-i2v-plus':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wan2.2-i2v-flash':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wan2.2-i2v-plus':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'video-style-transform':
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis'
};

/**
 * 根据模型获取API端点URL
 */
export const getApiEndpoint = (model: string): string => {
  return API_ENDPOINTS[model] || API_ENDPOINTS['qwen-image'];
};

/**
 * 获取所有API端点
 */
export const getAllApiEndpoints = (): Record<string, string> => {
  return { ...API_ENDPOINTS };
};

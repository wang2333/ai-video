/**
 * 统一应用配置
 */

// API端点映射
export const API_ENDPOINTS: Record<string, string> = {
  'qwen-image': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  'wan2.2-t2i-flash': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
  'wan2.2-t2i-plus': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
  'wanx-style-repaint-v1': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation',
  'wanx2.1-t2v-turbo': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wanx2.1-t2v-plus': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wan2.2-t2v-plus': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wanx2.1-i2v-turbo': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wanx2.1-i2v-plus': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wan2.2-i2v-flash': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'wan2.2-i2v-plus': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  'video-style-transform': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis'
};

/**
 * 根据模型获取API端点URL
 */
export const getApiEndpoint = (model: string): string => {
  return API_ENDPOINTS[model] || API_ENDPOINTS['qwen-image'];
};

// 应用配置常量
export const APP_CONFIG = {
  // 应用信息
  name: 'Pollo AI',
  description: '由人工智能驱动的创意平台',

  // 默认配置
  defaultModel: 'wan2.2-t2i-flash',
  defaultAspectRatio: '1:1',
  defaultOutputCount: 1,
  defaultStyle: '自动',

  // 限制配置
  maxPromptLength: 2000,
  maxOutputCount: 4,
  minOutputCount: 1,

  // 积分配置
  creditCostPerImage: 10,

  // 轮询配置
  pollingMaxAttempts: 100,
  pollingInterval: 5000,
  pollingIntervalLong: 10000
} as const;

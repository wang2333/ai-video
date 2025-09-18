/**
 * 统一配置入口
 */

// 导出所有配置模块
export * from './api';

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

// 类型定义
export type AppConfig = typeof APP_CONFIG;

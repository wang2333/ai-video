import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * 生成计时器Hook的配置选项
 */
export interface UseGenerateTimerOptions {
  /** 更新间隔（毫秒），默认100ms */
  updateInterval?: number;
  /** 时间格式化函数，默认显示 "00:00" 格式 */
  formatter?: (duration: number) => string;
  /** 自动重置计时器，默认true */
  autoReset?: boolean;
}

/**
 * 生成计时器Hook的返回值
 */
export interface UseGenerateTimerReturn {
  /** 当前耗时（毫秒） */
  duration: number;
  /** 格式化的耗时字符串 */
  formattedDuration: string;
  /** 是否正在计时 */
  isRunning: boolean;
  /** 开始计时 */
  start: () => void;
  /** 停止计时 */
  stop: () => void;
  /** 重置计时器 */
  reset: () => void;
}

/**
 * 默认时间格式化函数 - 显示为 "mm:ss" 格式
 */
const defaultFormatter = (duration: number): string => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * 生成计时器自定义Hook
 * 用于在生成操作时显示耗时时间，支持自动开始/停止
 *
 * @param options 配置选项
 * @returns 计时器状态和控制方法
 *
 * @example
 * ```tsx
 * const { formattedDuration, isRunning, start, stop } = useGenerateTimer();
 *
 * const handleGenerate = async () => {
 *   start();
 *   try {
 *     await generateVideo(params);
 *   } finally {
 *     stop();
 *   }
 * };
 *
 * return (
 *   <Button onClick={handleGenerate}>
 *     {isRunning ? `生成中... ${formattedDuration}` : '开始生成'}
 *   </Button>
 * );
 * ```
 */
export function useGenerateTimer(options: UseGenerateTimerOptions = {}): UseGenerateTimerReturn {
  const { updateInterval = 100, formatter = defaultFormatter, autoReset = true } = options;

  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 更新计时器
   */
  const updateTimer = useCallback(() => {
    if (startTimeRef.current) {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      setDuration(elapsed);
    }
  }, []);

  /**
   * 开始计时
   */
  const start = useCallback(() => {
    if (isRunning) return; // 防止重复启动

    if (autoReset) {
      setDuration(0);
    }

    startTimeRef.current = Date.now() - (autoReset ? 0 : duration);
    setIsRunning(true);

    // 立即更新一次
    updateTimer();

    // 设置定时器
    intervalRef.current = setInterval(updateTimer, updateInterval);
  }, [isRunning, autoReset, duration, updateTimer, updateInterval]);

  /**
   * 停止计时
   */
  const stop = useCallback(() => {
    if (!isRunning) return; // 防止重复停止

    setIsRunning(false);
    startTimeRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 最后更新一次确保准确性
    updateTimer();
  }, [isRunning, updateTimer]);

  /**
   * 重置计时器
   */
  const reset = useCallback(() => {
    stop();
    setDuration(0);
  }, [stop]);

  /**
   * 组件卸载时清理定时器
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formattedDuration = formatter(duration);

  return {
    duration,
    formattedDuration,
    isRunning,
    start,
    stop,
    reset
  };
}

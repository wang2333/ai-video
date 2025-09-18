'use client';

import { useGlobalStore } from '@/store';
import { GlobalLoading } from '@/components/ui/global-loading';
import { GlobalError } from '@/components/ui/global-error';

/**
 * 全局状态监听组件
 * 显示全局loading和error状态
 */
export function GlobalStateListener() {
  const { isLoading, error, clearError } = useGlobalStore();

  return (
    <>
      {/* 全局Loading */}
      {isLoading && <GlobalLoading />}

      {/* 全局Error */}
      {error && <GlobalError message={error} onClose={clearError} />}
    </>
  );
}

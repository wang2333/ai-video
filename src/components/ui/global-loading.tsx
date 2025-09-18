'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalLoadingProps {
  message?: string;
  className?: string;
}

export function GlobalLoading({ message = '加载中...', className }: GlobalLoadingProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
        className
      )}
    >
      <div className='flex flex-col items-center gap-4 rounded-lg bg-[#24222D] p-6 shadow-xl'>
        <Loader2 className='h-8 w-8 animate-spin text-[#FF3466]' />
        <p className='text-sm text-gray-300'>{message}</p>
      </div>
    </div>
  );
}

'use client';

import { AlertCircle, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface GlobalErrorProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

export function GlobalError({ message, onClose, className }: GlobalErrorProps) {
  return (
    <div className={cn('fixed top-4 right-4 z-50 max-w-sm', className)}>
      <div className='rounded-lg border border-red-500/20 bg-red-500/10 p-4 shadow-lg'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-red-400 mt-0.5 flex-shrink-0' />
          <div className='flex-1'>
            <p className='text-sm text-red-400'>{message}</p>
          </div>
          {onClose && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10'
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

export interface DialogMolProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
  width?: string;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
  children: React.ReactNode;
}

export function DialogMol({
  open,
  onOpenChange,
  trigger,
  title = '请选择',
  className = '',
  contentClassName = '',
  headerClassName = '',
  size = 'md',
  width,
  maxWidth,
  height,
  maxHeight,
  children
}: DialogMolProps) {
  // 构建样式对象 - 使用内联样式确保优先级
  const contentStyles: React.CSSProperties = {};

  // 处理宽度设置
  if (width) {
    contentStyles.width = width;
    contentStyles.maxWidth = 'none'; // 重置默认的max-width
  } else if (maxWidth) {
    contentStyles.maxWidth = maxWidth;
  } else {
    // 使用预设尺寸时，通过内联样式设置
    const sizeValues = {
      sm: '384px',
      md: '448px',
      lg: '512px',
      xl: '576px',
      full: '95vw',
      auto: 'none'
    };
    if (size === 'full') {
      contentStyles.width = '100%';
      contentStyles.maxWidth = '95vw';
    } else if (size !== 'auto') {
      contentStyles.maxWidth = sizeValues[size];
    }
  }

  // 处理高度设置
  if (height) contentStyles.height = height;
  if (maxHeight) contentStyles.maxHeight = maxHeight;

  // 构建className
  const finalContentClassName = cn(contentClassName);

  return (
    <div className={className}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          className={`${finalContentClassName} bg-[#2a2a2e] border-none`}
          style={contentStyles}
        >
          {title && (
            <DialogHeader className={headerClassName}>
              <DialogTitle className='text-white'>{title}</DialogTitle>
            </DialogHeader>
          )}
          <div className='mt-4'>{children}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export interface DialogMolProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  maxWidth?: string;
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
  maxWidth,
  children
}: DialogMolProps) {
  const contentStyles: React.CSSProperties = {};
  if (maxWidth) contentStyles.maxWidth = maxWidth;

  return (
    <div className={className}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={cn('bg-[#2a2a2e] border-none', contentClassName)} style={contentStyles}>
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


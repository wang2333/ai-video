'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface VideoFile {
  id: string;
  file: File;
  url: string; // 本地预览URL
  name: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  uploadUrl?: string; // 七牛云URL
}

export interface VideoUploadMolProps {
  onFileSelect?: (file: File) => void;
  onVideoRemove?: () => void;
  className?: string;
  uploadedVideo?: VideoFile | null;
  disabled?: boolean;
  error?: string | null;
  isUploading?: boolean;
  uploadProgress?: { percent: number } | null;
}

/**
 * 视频上传组件 (纯UI组件)
 * 只负责文件选择、拖拽和视频显示，上传逻辑在页面中处理
 */
export function VideoUploadMol({
  onFileSelect,
  onVideoRemove,
  className = '',
  uploadedVideo = null,
  disabled = false,
  error = null,
  isUploading = false,
  uploadProgress = null
}: VideoUploadMolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * 处理文件选择
   */
  const handleFileSelect = (file: File) => {
    onFileSelect?.(file);
  };

  /**
   * 处理文件输入变化
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // 重置文件输入，确保相同文件可以重新选择
    event.target.value = '';
  };

  /**
   * 处理拖拽事件
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * 点击上传
   */
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  /**
   * 移除视频
   */
  const handleRemove = () => {
    onVideoRemove?.();
  };

  return (
    <div className={cn('w-full', className)}>
      {uploadedVideo ? (
        // 显示已上传的视频
        <div className='relative bg-[#383842] rounded-lg'>
          <Button
            onClick={handleRemove}
            size='icon'
            variant='ghost'
            className='absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white z-10'
            disabled={disabled}
          >
            <X className='w-4 h-4' />
          </Button>

          <div className='h-56 relative rounded-lg overflow-hidden bg-gray-700'>
            <video
              src={uploadedVideo.uploadUrl || uploadedVideo.url}
              className='w-full h-full object-contain'
              controls
              preload='metadata'
            />
          </div>
        </div>
      ) : (
        // 上传区域
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'bg-[#383842] border-[#4a4a54]',
            isDragging && 'border-primary bg-primary/10',
            (disabled || isUploading) && 'cursor-not-allowed opacity-50',
            !disabled && !isUploading && 'hover:border-primary'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className='flex flex-col items-center gap-4'>
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'bg-[#4a4a54]',
                isDragging && 'bg-primary/20'
              )}
            >
              {isDragging ? (
                <Upload className='w-8 h-8 text-primary' />
              ) : (
                <Video className='w-8 h-8 text-gray-400' />
              )}
            </div>

            <div className='space-y-2'>
              <p className='text-white font-medium'>
                {isUploading
                  ? uploadProgress
                    ? `上传中... ${uploadProgress.percent}%`
                    : '正在处理视频...'
                  : isDragging
                  ? '松开以上传视频'
                  : '点击上传视频'}
              </p>
              {!isUploading && (
                <>
                  <p className='text-sm text-gray-400'>或将视频文件拖拽到此处</p>
                  <p className='text-xs text-gray-500'>支持常见的视频格式</p>
                </>
              )}
              {isUploading && uploadProgress && (
                <div className='w-full bg-gray-700 rounded-full h-2 mt-3'>
                  <div
                    className='bg-primary h-2 rounded-full transition-all duration-300'
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className='mt-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3'>
          {error}
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type='file'
        accept='video/*'
        onChange={handleInputChange}
        className='hidden'
        disabled={disabled || isUploading}
      />
    </div>
  );
}

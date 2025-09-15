'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface UploadedVideo {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  duration?: number; // 视频时长（秒）
  width?: number; // 视频宽度
  height?: number; // 视频高度
  uploadUrl?: string; // 上传后的服务器URL
}

export interface VideoUploadMolProps {
  onVideoUpload?: (video: UploadedVideo) => void;
  onVideoRemove?: () => void;
  className?: string;
  uploadedVideo?: UploadedVideo | null;
  disabled?: boolean;
}

/**
 * 视频上传组件
 * 支持拖拽上传和点击上传，包含完整的视频文件校验
 */
export function VideoUploadMol({
  onVideoUpload,
  onVideoRemove,
  className = '',
  uploadedVideo = null,
  disabled = false
}: VideoUploadMolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 验证文件基本信息
   */
  const validateFileBasics = useCallback((file: File): string | null => {
    // 检查文件类型
    if (!file.type.startsWith('video/')) {
      return '请上传视频文件';
    }

    return null;
  }, []);

  /**
   * 获取视频元数据（尺寸、时长等）
   */
  const getVideoMetadata = (
    file: File
  ): Promise<{ width: number; height: number; duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('无法读取视频信息'));
      };

      video.src = url;
    });
  };

  /**
   * 处理文件选择（不包含上传）
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      // 1. 基本文件验证
      const basicValidationError = validateFileBasics(file);
      if (basicValidationError) {
        setError(basicValidationError);
        return;
      }

      setError(null);
      setIsProcessing(true);

      try {
        // 2. 获取视频元数据
        const metadata = await getVideoMetadata(file);

        // 3. 创建预览URL
        const url = URL.createObjectURL(file);

        const uploadedVideo: UploadedVideo = {
          id: Date.now().toString(),
          file,
          url,
          name: file.name,
          size: file.size,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height
        };

        onVideoUpload?.(uploadedVideo);
      } catch (error) {
        setError(error instanceof Error ? error.message : '视频处理失败，请重试');
      } finally {
        setIsProcessing(false);
      }
    },
    [validateFileBasics, onVideoUpload]
  );

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // 重置文件输入，确保相同文件可以重新选择
    event.target.value = '';
  };

  /**
   * 处理拖拽事件
   */
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !isProcessing) {
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

    if (disabled || isProcessing) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * 点击上传
   */
  const handleClick = () => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click();
    }
  };

  /**
   * 移除视频
   */
  const handleRemove = () => {
    if (uploadedVideo) {
      URL.revokeObjectURL(uploadedVideo.url);
    }
    onVideoRemove?.();
    setError(null);
    setIsProcessing(false);
  };

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化时长
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              src={uploadedVideo.uploadUrl}
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
            (disabled || isProcessing) && 'cursor-not-allowed opacity-50',
            !disabled && !isProcessing && 'hover:border-primary'
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
                {isProcessing ? '正在处理视频...' : isDragging ? '松开以上传视频' : '点击上传视频'}
              </p>
              {!isProcessing && (
                <>
                  <p className='text-sm text-gray-400'>或将视频文件拖拽到此处</p>
                  <p className='text-xs text-gray-500'>支持常见的视频格式</p>
                </>
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
        onChange={handleFileSelect}
        className='hidden'
        disabled={disabled || isProcessing}
      />
    </div>
  );
}

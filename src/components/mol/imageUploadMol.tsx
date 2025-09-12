'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  base64: string;
  name: string;
  size: number;
}

export interface ImageUploadMolProps {
  onImageUpload?: (image: UploadedImage) => void;
  onImageRemove?: () => void;
  className?: string;
  accept?: string;
  maxSize?: number; // MB
  uploadedImage?: UploadedImage | null;
  disabled?: boolean;
}

/**
 * 图片上传组件
 * 支持拖拽上传和点击上传
 */
export function ImageUploadMol({
  onImageUpload,
  onImageRemove,
  className = '',
  accept = 'image/*',
  maxSize = 10, // 10MB
  uploadedImage = null,
  disabled = false
}: ImageUploadMolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 验证文件
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // 检查文件类型
      if (accept === 'image/*' && !file.type.startsWith('image/')) {
        return '请上传图片文件';
      } else if (accept === 'video/*' && !file.type.startsWith('video/')) {
        return '请上传视频文件';
      } else if (accept !== 'image/*' && accept !== 'video/*') {
        // 对于其他accept类型，进行更通用的检查
        const acceptTypes = accept.split(',').map(type => type.trim());
        const isValidType = acceptTypes.some(type => {
          if (type === '*/*') return true;
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -2));
          }
          return file.type === type;
        });

        if (!isValidType) {
          return `请上传支持的文件类型: ${accept}`;
        }
      }

      // 检查文件大小
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        return `文件大小不能超过${maxSize}MB`;
      }

      return null;
    },
    [maxSize, accept]
  );

  /**
   * 将文件转换为base64
   */
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('转换base64失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsProcessing(true);

      try {
        // 创建预览URL
        const url = URL.createObjectURL(file);

        // 转换为base64
        const base64 = await convertFileToBase64(file);

        const uploadedImage: UploadedImage = {
          id: Date.now().toString(),
          file,
          url,
          base64,
          name: file.name,
          size: file.size
        };

        onImageUpload?.(uploadedImage);
      } catch {
        setError('图片处理失败，请重试');
      } finally {
        setIsProcessing(false);
      }
    },
    [validateFile, onImageUpload]
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
   * 移除图片
   */
  const handleRemove = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.url);
    }
    onImageRemove?.();
    setError(null);
    setIsProcessing(false); // 重置处理状态
  };

  /**
   * 格式化文件大小
   */
  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  return (
    <div className={cn('w-full min-h-56', className)}>
      {uploadedImage ? (
        // 显示已上传的图片
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
            {uploadedImage.file.type.startsWith('video/') ? (
              <video
                src={uploadedImage.url}
                className='w-full h-full object-contain'
                controls
                preload='metadata'
              />
            ) : (
              <Image
                src={uploadedImage.url}
                alt={uploadedImage.name}
                fill
                className='object-contain'
                unoptimized
              />
            )}
          </div>

          {/* <div className='mt-3 text-sm text-gray-300'>
            <p className='truncate'>{uploadedImage.name}</p>
            <p className='text-xs text-gray-400'>{formatFileSize(uploadedImage.size)}</p>
          </div> */}
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
                <ImageIcon className='w-8 h-8 text-gray-400' />
              )}
            </div>

            <div className='space-y-2'>
              <p className='text-white font-medium'>
                {isProcessing
                  ? accept === 'video/*'
                    ? '正在处理视频...'
                    : '正在处理文件...'
                  : isDragging
                  ? accept === 'video/*'
                    ? '松开以上传视频'
                    : '松开以上传文件'
                  : accept === 'video/*'
                  ? '点击上传视频'
                  : '点击上传文件'}
              </p>
              {!isProcessing && (
                <>
                  <p className='text-sm text-gray-400'>
                    或将{accept === 'video/*' ? '视频' : '文件'}拖拽到此处
                  </p>
                  <p className='text-xs text-gray-500'>
                    {accept === 'video/*'
                      ? `支持 MP4、AVI、MOV 等格式，最大 ${maxSize}MB`
                      : `支持 JPG、PNG、WEBP 格式，最大 ${maxSize}MB`}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className='mt-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2'>
          {error}
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type='file'
        accept={accept}
        onChange={handleFileSelect}
        className='hidden'
        disabled={disabled || isProcessing}
      />
    </div>
  );
}

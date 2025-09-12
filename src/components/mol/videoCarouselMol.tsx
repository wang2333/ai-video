'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { VideoPlayerMol } from './videoPlayerMol';
import { GeneratedVideo } from '@/lib/apiService';

interface VideoCarouselMolProps {
  videos: GeneratedVideo[];
  className?: string;
  onCurrentChange?: (index: number) => void;
  autoPlay?: boolean;
  showThumbnails?: boolean;
}

/**
 * 视频轮播组件
 * 支持多个视频的展示和切换
 */
export function VideoCarouselMol({
  videos,
  className,
  onCurrentChange,
  autoPlay = false,
  showThumbnails = true
}: VideoCarouselMolProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    onCurrentChange?.(currentIndex);
  }, [currentIndex, onCurrentChange]);

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : videos.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < videos.length - 1 ? prev + 1 : 0));
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  if (videos.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-900 rounded-lg', className)}>
        <div className='text-center text-gray-400 space-y-4'>
          <div className='w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mx-auto'>
            <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <p className='text-sm'>暂无视频</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className={cn('flex flex-col space-y-4 h-full', className)}>
      {/* 主视频播放器 */}
      <div className='relative flex-1 min-h-0'>
        <VideoPlayerMol
          video={currentVideo}
          className='w-full h-full max-h-full'
          autoPlay={autoPlay}
          controls
        />

        {/* 左右切换按钮 */}
        {videos.length > 1 && (
          <>
            <Button
              variant='ghost'
              size='icon'
              onClick={goToPrevious}
              className='absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <ChevronLeft className='w-5 h-5' />
            </Button>

            <Button
              variant='ghost'
              size='icon'
              onClick={goToNext}
              className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <ChevronRight className='w-5 h-5' />
            </Button>
          </>
        )}

        {/* 视频计数指示器 */}
        {videos.length > 1 && (
          <div className='absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded'>
            {currentIndex + 1} / {videos.length}
          </div>
        )}
      </div>

      {/* 缩略图导航 */}
      {showThumbnails && videos.length > 1 && (
        <div className='flex gap-2 justify-center overflow-x-auto pb-2'>
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => goToIndex(index)}
              className={cn(
                'flex-shrink-0 w-20 h-12 bg-gray-800 rounded border-2 overflow-hidden transition-all',
                currentIndex === index
                  ? 'border-primary scale-105'
                  : 'border-gray-600 hover:border-gray-400'
              )}
            >
              <video
                src={video.src}
                className='w-full h-full object-cover'
                muted
                preload='metadata'
              />
            </button>
          ))}
        </div>
      )}

      {/* 点状指示器（当缩略图被禁用时显示） */}
      {!showThumbnails && videos.length > 1 && (
        <div className='flex justify-center gap-2'>
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index ? 'bg-primary' : 'bg-gray-600 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

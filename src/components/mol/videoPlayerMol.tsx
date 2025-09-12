'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GeneratedVideo } from '@/lib/apiService';

interface VideoPlayerMolProps {
  video: GeneratedVideo;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  onEnded?: () => void;
}

/**
 * 视频播放器分子组件
 * 提供完整的视频播放控制功能
 */
export function VideoPlayerMol({
  video,
  className,
  autoPlay = false,
  loop = true,
  controls = true,
  onEnded
}: VideoPlayerMolProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // 默认静音以提高自动播放成功率
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);

      // 尝试自动播放（如果启用了autoPlay）
      if (autoPlay && !isPlaying) {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.warn('自动播放失败:', error);
            // 自动播放失败时保持静音状态，用户点击后可以播放
            setIsPlaying(false);
          });
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onEnded, autoPlay, isPlaying]);

  // 自动隐藏控制栏
  useEffect(() => {
    if (!controls) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      setShowControls(true);

      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, controls]);

  // 当视频源变化时重置状态
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setHasError(false);

    // 重置视频元素
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.muted = isMuted;
    }
  }, [video.src, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMutedState = !isMuted;
    video.muted = newMutedState;
    setIsMuted(newMutedState);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      video.play().catch(console.error);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn('relative bg-black rounded-lg overflow-hidden group w-full h-full', className)}
      onMouseMove={() => {
        if (controls && controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          setShowControls(true);
          if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
              setShowControls(false);
            }, 3000);
          }
        }
      }}
    >
      <video
        ref={videoRef}
        src={video.src}
        className='w-full h-full object-contain'
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%'
        }}
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin' />
        </div>
      )}

      {/* 错误状态 */}
      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/70'>
          <div className='text-center text-white'>
            <div className='text-lg mb-2'>视频加载失败</div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                videoRef.current?.load();
              }}
            >
              重试
            </Button>
          </div>
        </div>
      )}

      {/* 中央播放按钮 */}
      {!isLoading && !hasError && !isPlaying && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <Button
            variant='ghost'
            size='icon'
            onClick={togglePlay}
            className='w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full'
          >
            <Play className='w-8 h-8 ml-1' />
          </Button>
        </div>
      )}

      {/* 控制栏 */}
      {controls && !isLoading && !hasError && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {/* 进度条 */}
          <div
            className='w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3'
            onClick={handleSeek}
          >
            <div
              className='h-full bg-primary rounded-full transition-all duration-150'
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* 控制按钮 */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={togglePlay}
                className='text-white hover:bg-white/20'
              >
                {isPlaying ? <Pause className='w-5 h-5' /> : <Play className='w-5 h-5' />}
              </Button>

              <Button
                variant='ghost'
                size='icon'
                onClick={restart}
                className='text-white hover:bg-white/20'
              >
                <RotateCcw className='w-4 h-4' />
              </Button>

              <Button
                variant='ghost'
                size='icon'
                onClick={toggleMute}
                className='text-white hover:bg-white/20'
              >
                {isMuted ? <VolumeX className='w-5 h-5' /> : <Volume2 className='w-5 h-5' />}
              </Button>

              <span className='text-white text-sm'>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={toggleFullscreen}
                className='text-white hover:bg-white/20'
              >
                <Maximize2 className='w-5 h-5' />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

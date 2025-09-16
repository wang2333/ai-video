'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// 动态导入 flv.js（避免 SSR 问题）
let flvjs: any = null;
if (typeof window !== 'undefined') {
  import('flv.js').then((mod: any) => {
    flvjs = mod?.default ?? mod;
  });
}

export interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: any) => void;
  onReady?: () => void;
}

// 是否使用 flv.js 播放
function shouldUseFlv(url: string) {
  try {
    const base = url.split('?')[0].toLowerCase();
    if (base.endsWith('.flv')) return true;
    if (/([?&#])format=flv(?!\w)/i.test(url)) return true;
  } catch {}
  return false;
}

export function VideoPlayer({
  src,
  className,
  autoPlay = false,
  loop = false,
  controls = true,
  muted = true,
  onEnded,
  onPlay,
  onPause,
  onError,
  onReady,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const flvPlayerRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const isFlv = useMemo(() => shouldUseFlv(src), [src]);

  const toProxied = (url: string) => {
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
      const host = u.hostname.toLowerCase();
      const needsProxy = host.includes('clouddn.com') || host.includes('qiniudn.com');
      return needsProxy ? `/api/video-proxy?url=${encodeURIComponent(u.toString())}` : url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 清理旧实例
    const destroyFlv = () => {
      if (flvPlayerRef.current) {
        try {
          flvPlayerRef.current.unload?.();
          flvPlayerRef.current.detachMediaElement?.();
          flvPlayerRef.current.destroy?.();
        } catch {}
        flvPlayerRef.current = null;
      }
    };
    destroyFlv();
    setHasError(false);

    // 基础事件
    const onCanPlay = () => onReady?.();
    const onPlayEvt = () => onPlay?.();
    const onPauseEvt = () => onPause?.();
    const onEndedEvt = () => onEnded?.();
    const onErrorEvt = (e: any) => {
      setHasError(true);
      onError?.(e);
    };

    video.addEventListener('loadedmetadata', onCanPlay);
    video.addEventListener('play', onPlayEvt);
    video.addEventListener('pause', onPauseEvt);
    video.addEventListener('ended', onEndedEvt);
    video.addEventListener('error', onErrorEvt);

    const useFlv = isFlv && flvjs && flvjs.isSupported?.();
    const effectiveSrc = toProxied(src);

    if (useFlv) {
      try {
        const mediaDataSource = { type: 'flv', url: effectiveSrc };
        const flvConfig = {
          enableStashBuffer: true,
          isLive: false,
          cors: true,
        };
        const player = flvjs.createPlayer(mediaDataSource, flvConfig);
        player.attachMediaElement(video);
        player.load();
        if (autoPlay)
          player.play().catch((err: any) => {
            console.warn('flv autoplay blocked:', err);
          });

        player.on(flvjs.Events.ERROR, (type: any, detail: any) => {
          setHasError(true);
          onError?.({ type, detail });
        });

        flvPlayerRef.current = player;
      } catch (e) {
        setHasError(true);
        console.error('flv.js init error:', e);
        onError?.(e);
      }
    } else {
      // 原生播放 (mp4 等)
      try {
        video.src = effectiveSrc;
        if (autoPlay)
          video.play().catch((err: any) => {
            console.warn('video autoplay blocked:', err);
          });
      } catch (e) {
        setHasError(true);
        console.error('video element init error:', e);
        onError?.(e);
      }
    }

    return () => {
      video.removeEventListener('loadedmetadata', onCanPlay);
      video.removeEventListener('play', onPlayEvt);
      video.removeEventListener('pause', onPauseEvt);
      video.removeEventListener('ended', onEndedEvt);
      video.removeEventListener('error', onErrorEvt);
      destroyFlv();
    };
  }, [src, autoPlay, onEnded, onPause, onPlay, onReady, onError, isFlv]);

  return (
    <div className={cn('relative bg-black rounded-lg overflow-hidden w-full h-full', className)}>
      <video
        ref={videoRef}
        className='w-full h-full object-contain'
        controls={controls}
        loop={loop}
        muted={muted}
        crossOrigin={isFlv ? 'anonymous' : undefined}
        playsInline
        preload='metadata'
      />

      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/70 z-50'>
          <div className='text-center text-white'>
            <div className='text-lg mb-2'>视频加载失败</div>
            <button
              onClick={() => setHasError(false)}
              className='px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white text-sm'
            >
              重试
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { VideoPlayer } from '@/components/ui/video-player';
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
 * 业务级视频播放器组件（兼容性包装器）
 * 基于通用VideoPlayer组件，适配GeneratedVideo接口
 *
 * @deprecated 推荐直接使用 VideoPlayer 组件
 */
export function VideoPlayerMol({
  video,
  className,
  autoPlay = false,
  loop = true,
  controls = true,
  onEnded
}: VideoPlayerMolProps) {
  return (
    <VideoPlayer
      src={video.src}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      controls={controls}
      onEnded={onEnded}
      id={`video-player-${video.id}`}
    />
  );
}

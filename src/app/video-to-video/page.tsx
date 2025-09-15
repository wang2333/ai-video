'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Sparkles, Info, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { VideoCarouselMol } from '@/components/mol/videoCarouselMol';
import { VideoUploadMol, UploadedVideo } from '@/components/mol/videoUploadMol';
import { SelectMol, SelectOption } from '@/components/mol/SelectMol';
import { downloadCurrentVideo } from '@/lib/downloadUtils';
import { GeneratedVideo, generateVideoToVideo } from '@/lib/apiService';

/**
 * 视频风格类型配置
 */
const VIDEO_STYLES = [
  {
    id: 0,
    name: '日式漫画',
    description: '日本动漫风格，线条清晰，色彩鲜艳',
    image: '/image/style1.jpg'
  },
  {
    id: 1,
    name: '美式漫画',
    description: '美国漫画风格，色彩饱和，线条粗犷',
    image: '/image/style2.jpg'
  },
  {
    id: 2,
    name: '清新漫画',
    description: '清新淡雅的漫画风格，色调柔和',
    image: '/image/style3.jpg'
  },
  {
    id: 3,
    name: '3D卡通',
    description: '三维卡通风格，立体感强',
    image: '/image/style4.jpg'
  },
  {
    id: 4,
    name: '国风卡通',
    description: '中国风卡通，传统文化元素',
    image: '/image/style5.jpg'
  },
  {
    id: 5,
    name: '纸艺风格',
    description: '纸艺剪纸风格，层次分明',
    image: '/image/style6.jpg'
  },
  {
    id: 6,
    name: '简易插画',
    description: '简约插画风格，线条简洁',
    image: '/image/style7.jpg'
  },
  {
    id: 7,
    name: '国风水墨',
    description: '中国水墨画风格，意境深远',
    image: '/image/style8.jpg'
  }
];

/**
 * 大模型选项
 */
const MODEL_OPTIONS = [
  {
    value: 'video-style-transform',
    label: '通义万相',
    description: '视频风格重绘',
    icon: '/image/Group.svg'
  }
];

/**
 * 视频帧率选项
 */
const FPS_OPTIONS = [
  { value: 15, label: '15 FPS', description: '标准帧率' },
  { value: 20, label: '20 FPS', description: '电影级帧率' },
  { value: 25, label: '25 FPS', description: '高帧率' }
];

export default function VideoToVideoPage() {
  // 上传状态
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);

  // 生成参数
  const [selectedModel, setSelectedModel] = useState('video-style-transform'); // 默认模型
  const [selectedStyle, setSelectedStyle] = useState(0); // 默认日式漫画
  const [videoFps, setVideoFps] = useState(15); // 默认15fps

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([
    { id: 1, src: '/demo.mp4' } // 示例视频
  ]);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // 上传状态
  const [isUploading, setIsUploading] = useState(false);

  // 视频校验常量
  const SUPPORTED_FORMATS = ['mp4', 'avi', 'mkv', 'mov', 'flv', 'ts', 'mpg', 'mxf'];
  const MAX_SIZE_MB = 100;
  const MAX_DURATION_SECONDS = 30;
  const MIN_DIMENSION = 256;
  const MAX_DIMENSION = 4096;
  const MAX_ASPECT_RATIO = 1.8;

  /**
   * 视频校验函数
   */
  const validateVideo = (video: UploadedVideo): string | null => {
    // 检查文件扩展名
    const extension = video.name.split('.').pop()?.toLowerCase();
    if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
      return `不支持的视频格式。支持格式：${SUPPORTED_FORMATS.join(', ')}`;
    }

    // 检查文件大小
    const fileSizeMB = video.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      return `文件大小不能超过${MAX_SIZE_MB}MB，当前大小：${fileSizeMB.toFixed(2)}MB`;
    }

    // 检查视频尺寸
    if (video.width && video.height) {
      if (video.width < MIN_DIMENSION || video.height < MIN_DIMENSION) {
        return `视频分辨率过小。最小尺寸：${MIN_DIMENSION}×${MIN_DIMENSION}，当前尺寸：${video.width}×${video.height}`;
      }

      if (video.width > MAX_DIMENSION || video.height > MAX_DIMENSION) {
        return `视频分辨率过大。最大尺寸：${MAX_DIMENSION}×${MAX_DIMENSION}，当前尺寸：${video.width}×${video.height}`;
      }

      // 检查长宽比
      const aspectRatio = Math.max(video.width, video.height) / Math.min(video.width, video.height);
      if (aspectRatio > MAX_ASPECT_RATIO) {
        return `视频长宽比超出限制。最大比例：${MAX_ASPECT_RATIO}:1，当前比例：${aspectRatio.toFixed(
          2
        )}:1`;
      }
    }

    // 检查视频时长
    if (video.duration && video.duration > MAX_DURATION_SECONDS) {
      return `视频时长超出限制。最大时长：${MAX_DURATION_SECONDS}秒，当前时长：${Math.round(
        video.duration
      )}秒`;
    }

    return null;
  };

  /**
   * 上传视频到服务器
   */
  const uploadVideoToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `上传失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '上传失败');
    }

    if (result.data?.url) {
      return result.data.url;
    } else {
      throw new Error('服务器未返回有效的文件URL');
    }
  };

  /**
   * 处理视频上传
   */
  const handleVideoUpload = async (video: UploadedVideo) => {
    // 进行视频校验
    const validationError = validateVideo(video);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // 上传到服务器
      const uploadUrl = await uploadVideoToServer(video.file);

      // 更新视频对象，添加服务器URL
      const updatedVideo: UploadedVideo = {
        ...video,
        uploadUrl
      };

      setUploadedVideo(updatedVideo);
    } catch (error) {
      setError(error instanceof Error ? error.message : '视频上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 处理视频移除
   */
  const handleVideoRemove = () => {
    setUploadedVideo(null);
    setError(null);
  };

  /**
   * 参数校验
   */
  const validateParams = (): string | null => {
    if (!uploadedVideo) {
      return '请先上传视频文件';
    }

    if (!uploadedVideo.uploadUrl) {
      return '视频文件尚未上传完成，请稍候';
    }

    return null;
  };

  /**
   * 生成视频
   */
  const handleGenerate = async () => {
    // 参数校验
    const validationError = validateParams();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 调用视频风格转换API
      const result = await generateVideoToVideo({
        model: selectedModel,
        video_url: uploadedVideo!.uploadUrl || '',
        style: selectedStyle,
        video_fps: videoFps
      });

      if (result.success && result.data) {
        setGeneratedVideos([
          {
            id: Date.now(),
            src: result.data.output.output_video_url
          }
        ]);
        setCurrentVideoIndex(0);
        setIsGenerating(false);
      } else {
        setError(result.error || '提交视频生成任务失败');
        setIsGenerating(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成视频时发生未知错误';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 下载当前视频
   */
  const handleDownloadCurrent = async () => {
    if (generatedVideos.length === 0) return;

    try {
      await downloadCurrentVideo(generatedVideos, currentVideoIndex);
    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
    }
  };

  /**
   * 轮播图当前视频变化回调
   */
  const handleCurrentVideoChange = (index: number) => {
    setCurrentVideoIndex(index);
  };

  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <Sidebar />
      <main className='ml-20 pt-14'>
        <div className='flex h-[calc(100vh-56px)] p-4 gap-4'>
          {/* Left Control Panel */}
          <div className='w-[380px] bg-[#24222D] p-4 flex flex-col'>
            <div className='flex-1 overflow-y-auto space-y-6'>
              <h1 className='text-xl'>视频转视频AI</h1>

              {/* Model Selection */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>模型选择</label>
                <SelectMol
                  options={MODEL_OPTIONS.map(model => ({
                    value: model.value,
                    label: model.label,
                    description: model.description,
                    icon: model.icon
                  }))}
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  variant='dark'
                  size='lg'
                  renderTrigger={selectedOption => {
                    if (!selectedOption) return null;
                    const option = selectedOption as SelectOption;
                    return (
                      <div className='flex items-center gap-3 py-1'>
                        <div className='w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center'>
                          <Image
                            src={option.icon || '/image/com-logo-hunyuan.svg'}
                            alt={option.label}
                            width={24}
                            height={24}
                            unoptimized
                          />
                        </div>
                        <div className='text-left'>
                          <p className='text-sm text-white'>{option.label}</p>
                          <p className='text-xs text-gray-400'>{option.description}</p>
                        </div>
                      </div>
                    );
                  }}
                  renderItem={option => (
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center'>
                        <Image
                          src={option.icon || '/image/com-logo-hunyuan.svg'}
                          alt={option.label}
                          width={20}
                          height={20}
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className='text-white'>{option.label}</p>
                        <p className='text-xs text-gray-400'>{option.description}</p>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Video Upload */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>上传视频</label>
                <VideoUploadMol
                  onVideoUpload={handleVideoUpload}
                  onVideoRemove={handleVideoRemove}
                  uploadedVideo={uploadedVideo}
                  disabled={isGenerating || isUploading}
                />
                {isUploading && (
                  <div className='mt-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
                    <span>正在上传...</span>
                  </div>
                )}
                {uploadedVideo?.uploadUrl && (
                  <div className='mt-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg p-3'>
                    ✓ 视频已成功上传
                  </div>
                )}
              </div>

              {/* Style Selection */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>风格选择</label>
                <SelectMol
                  options={VIDEO_STYLES.map(style => ({
                    value: style.id.toString(),
                    label: style.name,
                    description: style.description,
                    icon: style.image
                  }))}
                  value={selectedStyle.toString()}
                  onValueChange={value => setSelectedStyle(parseInt(value))}
                  variant='dark'
                  size='lg'
                  renderTrigger={selectedOption => {
                    if (!selectedOption) return null;
                    const option = selectedOption as SelectOption;
                    const style = VIDEO_STYLES.find(s => s.id.toString() === option.value);
                    return (
                      <div className='flex items-center gap-3 py-1'>
                        <div className='text-left'>
                          <p className='text-sm text-white'>{option.label}</p>
                          <p className='text-xs text-gray-400'>{option.description}</p>
                        </div>
                      </div>
                    );
                  }}
                  renderItem={option => {
                    const style = VIDEO_STYLES.find(s => s.id.toString() === option.value);
                    return (
                      <div className='flex items-center gap-3'>
                        <div>
                          <p className='text-white'>{option.label}</p>
                          <p className='text-xs text-gray-400'>{option.description}</p>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              {/* FPS Selection */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>视频帧率</label>
                <div className='flex gap-2'>
                  {FPS_OPTIONS.map(fps => (
                    <Button
                      key={fps.value}
                      variant={videoFps === fps.value ? 'default' : 'outline'}
                      onClick={() => setVideoFps(fps.value)}
                      className={cn(
                        'flex-1 flex-col h-auto py-2',
                        videoFps === fps.value
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white'
                      )}
                    >
                      <span className='text-sm font-medium'>{fps.label}</span>
                      <span className='text-xs opacity-70'>{fps.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Processing Info */}
              <div className='bg-[#383842] rounded-lg p-3 space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-300'>
                  <Info className='w-4 h-4' />
                  <span>视频要求</span>
                </div>
                <div className='text-xs text-gray-400 space-y-1'>
                  <p>• 支持格式：{SUPPORTED_FORMATS.join(', ')}</p>
                  <p>• 文件大小：不超过 {MAX_SIZE_MB}MB</p>
                  <p>• 视频时长：不超过 {MAX_DURATION_SECONDS}秒</p>
                  <p>
                    • 分辨率：{MIN_DIMENSION}-{MAX_DIMENSION}px，长宽比不超过 {MAX_ASPECT_RATIO}:1
                  </p>
                </div>
              </div>

              {/* Credit Cost */}
              <div className='flex justify-between text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='text-white'>
                  {selectedModel === 'video-style-transform-pro'
                    ? '200 额度'
                    : selectedModel === 'video-style-transform-fast'
                    ? '50 额度'
                    : '100 额度'}
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mb-4'>
                <AlertCircle className='w-4 h-4 text-red-400 mt-0.5 flex-shrink-0' />
                <div className='text-sm text-red-400'>{error}</div>
              </div>
            )}

            {/* Generate Button */}
            <div className='pt-4 border-t border-gray-700'>
              <Button
                onClick={handleGenerate}
                disabled={!uploadedVideo || !uploadedVideo.uploadUrl || isGenerating || isUploading}
                className='w-full h-12 bg-primary hover:bg-primary/90 text-lg'
              >
                <Sparkles className={cn('w-5 h-5 mr-2', isGenerating && 'animate-spin')} />
                {isGenerating ? '转换中...' : '开始转换'}
              </Button>
            </div>
          </div>

          {/* Right Video Display */}
          <div className='flex flex-col flex-1 bg-[#24222D] p-4'>
            <div className='flex justify-between items-center mb-2'>
              <h2 className='text-lg font-medium'>转换结果</h2>
              <Button
                disabled={isGenerating}
                size='sm'
                variant='outline'
                onClick={handleDownloadCurrent}
                className={cn(
                  'text-xs',
                  'bg-[#383842] border-[#4a4a54] text-white',
                  'hover:bg-[#FF3466] hover:border-[#FF3466] hover:text-white'
                )}
              >
                <Download className='w-4 h-4' />
                下载当前视频
              </Button>
            </div>

            {/* 显示生成的视频或示例视频 */}
            <div className='flex-1 flex items-center justify-center min-h-0 overflow-hidden'>
              <VideoCarouselMol
                videos={generatedVideos}
                className='w-full h-full max-w-full max-h-full'
                onCurrentChange={handleCurrentVideoChange}
                autoPlay={true}
                showThumbnails={true}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

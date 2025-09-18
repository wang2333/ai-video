'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Sparkles, Info, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/ui/video-player';
import { SelectMol, SelectOption } from '@/components/mol/SelectMol';
import { ImageUploadMol, UploadedImage } from '@/components/mol/imageUploadMol';
import { downloadCurrentVideo } from '@/utils/downloadUtils';
import { generateImageToVideo } from '@/lib/apiService';
import type { GeneratedVideo } from '@/types/api';
import { useGenerateTimer } from '@/hooks/useGenerateTimer';

/**
 * 视频分辨率配置 - 包含480P、720P和1080P
 */
const VIDEO_RESOLUTIONS = {
  '480P': [
    { value: '832*480', label: '832×480', ratio: '16:9' },
    { value: '480*832', label: '480×832', ratio: '9:16' },
    { value: '624*624', label: '624×624', ratio: '1:1' }
  ],
  '720P': [
    { value: '1280*720', label: '1280×720', ratio: '16:9' },
    { value: '720*1280', label: '720×1280', ratio: '9:16' },
    { value: '960*960', label: '960×960', ratio: '1:1' },
    { value: '1088*832', label: '1088×832', ratio: '4:3' },
    { value: '832*1088', label: '832×1088', ratio: '3:4' }
  ],
  '1080P': [
    { value: '1920*1080', label: '1920×1080', ratio: '16:9' },
    { value: '1080*1920', label: '1080×1920', ratio: '9:16' },
    { value: '1440*1440', label: '1440×1440', ratio: '1:1' },
    { value: '1632*1248', label: '1632×1248', ratio: '4:3' },
    { value: '1248*1632', label: '1248×1632', ratio: '3:4' }
  ]
};

// 图生视频支持的模型
const models = [
  {
    value: 'wanx2.1-i2v-turbo',
    label: '通义万相2.1-turbo',
    description: '万相2.1极速版',
    icon: '/image/Group.svg',
    qualityLevels: ['480P', '720P']
  },
  {
    value: 'wanx2.1-i2v-plus',
    label: '通义万相2.1-Plus',
    description: '万相2.1专业版',
    icon: '/image/Group.svg',
    qualityLevels: ['720P']
  },

  {
    value: 'wan2.2-i2v-flash',
    label: '通义万相2.2-Flash',
    description: '万相2.2极速版',
    icon: '/image/Group.svg',
    qualityLevels: ['480P', '720P']
  },
  {
    value: 'wan2.2-i2v-plus',
    label: '通义万相2.2-Plus',
    description: '万相2.2专业版',
    icon: '/image/Group.svg',
    qualityLevels: ['480P', '1080P']
  }
];

const outputCounts = [1, 2, 3, 4];

export default function ImageToVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('wanx2.1-i2v-turbo');
  const [qualityLevel, setQualityLevel] = useState('480P');
  const [videoDuration, setVideoDuration] = useState(5);

  // 图生视频特有状态
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>({
    id: 1,
    src: '/demo.mp4'
  });
  const [error, setError] = useState<string | null>(null);

  // 计时器Hook
  const { formattedDuration, start: startTimer, stop: stopTimer } = useGenerateTimer();

  // 根据当前选择的模型获取可用的画质选项
  const getAvailableQualityLevels = useCallback(() => {
    const selectedModelData = models.find(m => m.value === selectedModel);
    return selectedModelData?.qualityLevels || Object.keys(VIDEO_RESOLUTIONS);
  }, [selectedModel]);

  // 当模型改变时，重置画质和长宽比为该模型的第一个可用选项
  useEffect(() => {
    const availableQualities = getAvailableQualityLevels();
    if (availableQualities.length > 0 && !availableQualities.includes(qualityLevel)) {
      setQualityLevel(availableQualities[0]);
    }
  }, [selectedModel, qualityLevel, getAvailableQualityLevels]);

  const availableQualityLevels = getAvailableQualityLevels();

  /**
   * 处理图片上传
   */
  const handleImageUpload = (image: UploadedImage) => {
    setUploadedImage(image);
    setError(null);
  };

  /**
   * 处理图片移除
   */
  const handleImageRemove = () => {
    setUploadedImage(null);
    setError(null);
  };

  /**
   * 下载当前显示的视频
   */
  const handleDownloadCurrent = async () => {
    if (!generatedVideo) return;

    try {
      await downloadCurrentVideo([generatedVideo], 0);
    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
    }
  };

  /**
   * 参数校验函数
   */
  const validateParams = (): string | null => {
    if (!uploadedImage) {
      return '请先上传图片文件';
    }

    // 图片尺寸验证
    if (uploadedImage.width && uploadedImage.height) {
      const minSize = 360;
      const maxSize = 2000;
      const { width, height } = uploadedImage;

      if (width < minSize || width > maxSize || height < minSize || height > maxSize) {
        return `图片尺寸必须在${minSize}×${minSize}到${maxSize}×${maxSize}像素之间，当前尺寸：${width}×${height}`;
      }
    }
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return '请输入动作描述';
    }
    if (trimmedPrompt.length > 2000) {
      return `动作描述长度不能超过2000个字符`;
    }
    if (!selectedModel) {
      return '请选择模型';
    }
    return null;
  };

  /**
   * 图生视频的主要函数
   */
  const handleGenerate = async () => {
    // 1. 参数校验
    const validationError = validateParams();
    if (validationError) {
      setError(validationError);
      return;
    }

    const model = models.find(model => model.value === selectedModel);
    if (!model) {
      setError('模型配置错误');
      return;
    }

    if (!uploadedImage) {
      setError('请先上传图片文件');
      return;
    }

    // 开始计时和生成状态
    setIsGenerating(true);
    startTimer();
    setError(null);

    try {
      // 使用抽取的API服务方法
      const result = await generateImageToVideo({
        model: model.value,
        prompt: prompt.trim(),
        imageUrl: uploadedImage.base64,
        resolution: qualityLevel,
        duration: videoDuration
      });

      if (result.success && result.data) {
        setGeneratedVideo({
          id: Date.now(),
          src: result.data.output.video_url
        });
      } else {
        throw new Error(result.error || '图生视频失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '图生视频时发生未知错误';
      setError(errorMessage);
    } finally {
      // 停止计时和生成状态
      setIsGenerating(false);
      stopTimer();
    }
  };

  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <Sidebar />
      <main className='ml-20 pt-14'>
        <div className='flex h-[calc(100vh-56px)] p-4 gap-4'>
          {/* Left Control Panel */}
          <div className='w-[380px] bg-[#24222D] p-4 flex flex-col'>
            <div className='flex-1 overflow-y-auto space-y-4'>
              <h1 className='text-xl'>图像转视频AI</h1>

              {/* Model Selection */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>模型</label>
                <SelectMol
                  options={models}
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  variant='dark'
                  size='lg'
                  renderTrigger={selectedOption => {
                    if (!selectedOption) return null;
                    const model = selectedOption as SelectOption;
                    return (
                      <div className='flex items-center gap-3 py-1'>
                        <div className='w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center'>
                          <Image
                            src={model.icon}
                            alt={model.label}
                            unoptimized
                            width={24}
                            height={24}
                          />
                        </div>
                        <div className='text-left'>
                          <p className='text-sm text-white'>{model.label}</p>
                          <p className='text-xs text-gray-400'>{model.description}</p>
                        </div>
                      </div>
                    );
                  }}
                  renderItem={option => (
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center'>
                        <Image
                          src={option.icon}
                          alt={option.label}
                          unoptimized
                          width={24}
                          height={24}
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

              {/* Image Upload */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>上传图片</label>
                <ImageUploadMol
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  uploadedImage={uploadedImage}
                  disabled={isGenerating}
                  maxSize={10} // 10MB for image
                  accept='image/*'
                />
              </div>

              {/* Prompt */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>动作描述</label>
                <div className='relative'>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder='描述你希望图片中的元素如何动起来...'
                    className='h-32 bg-[#383842] !text-xs resize-none border-none focus-visible:ring-0'
                  />
                  <div className='absolute bottom-2 right-2 text-xs text-gray-500'>
                    {prompt.length}/{2000}
                  </div>
                </div>
              </div>

              {/* Quality Level */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>分辨率</label>
                <div className='flex gap-2'>
                  {availableQualityLevels.map(level => (
                    <Button
                      key={level}
                      variant={qualityLevel === level ? 'default' : 'outline'}
                      onClick={() => setQualityLevel(level)}
                      className={cn(
                        'flex-1',
                        qualityLevel === level
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white'
                      )}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Video Duration */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>视频长度</label>
                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    variant={videoDuration === 5 ? 'default' : 'outline'}
                    onClick={() => setVideoDuration(5)}
                    className={
                      videoDuration === 5
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white'
                    }
                  >
                    5秒
                  </Button>
                  <Button
                    disabled
                    variant={videoDuration === 10 ? 'default' : 'outline'}
                    onClick={() => setVideoDuration(10)}
                    className={
                      videoDuration === 10
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white'
                    }
                  >
                    10秒
                  </Button>
                </div>
              </div>

              {/* Credit Cost */}
              <div className='flex justify-between text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='text-white'>{50} 额度</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2'>
                <AlertCircle className='w-4 h-4 text-red-400 mt-0.5 flex-shrink-0' />
                <div className='text-sm text-red-400'>{error}</div>
              </div>
            )}

            {/* Generate Button */}
            <div className='pt-4 border-t border-gray-700'>
              <Button
                onClick={handleGenerate}
                disabled={!uploadedImage || prompt.length === 0 || isGenerating}
                className='w-full h-12 bg-primary hover:bg-primary/90 text-lg'
              >
                <Sparkles className={cn('w-5 h-5 mr-2', isGenerating && 'animate-spin')} />
                {isGenerating ? `生成中... ${formattedDuration}` : '生成视频'}
              </Button>
            </div>
          </div>

          {/* Right Video Display */}
          <div className='flex flex-col flex-1 bg-[#24222D] p-4'>
            <div className='flex justify-end mb-2'>
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
              {generatedVideo ? (
                <VideoPlayer
                  src={generatedVideo.src}
                  className='w-full h-full max-w-full max-h-full'
                  autoPlay={true}
                  controls={true}
                  loop={true}
                />
              ) : (
                <div className='flex items-center justify-center bg-gray-900 rounded-lg w-full h-full'>
                  <div className='text-center text-gray-400 space-y-4'>
                    <div className='w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center mx-auto'>
                      <svg
                        className='w-12 h-12'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

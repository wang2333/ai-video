'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Sparkles, Info, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SelectMol, type SelectOption } from '@/components/mol/SelectMol';
import { VideoPlayer } from '@/components/ui/video-player';
import { generateVideo, type GeneratedVideo } from '@/lib/apiService';
import { downloadCurrentVideo } from '@/lib/downloadUtils';
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

// 模型数据 - 参考文生图页面
const models = [
  {
    value: 'wanx2.1-t2v-turbo',
    label: '通义万相2.1-turbo',
    description: '万相2.1极速版',
    icon: '/image/Group.svg',
    qualityLevels: ['480P', '720P']
  },
  {
    value: 'wanx2.1-t2v-plus',
    label: '通义万相2.1-Plus',
    description: '万相2.1专业版',
    icon: '/image/Group.svg',
    qualityLevels: ['720P']
  },
  {
    value: 'wan2.2-t2v-plus',
    label: '通义万相2.2-Plus',
    description: '万相2.2专业版',
    icon: '/image/Group.svg',
    qualityLevels: ['480P', '1080P']
  }
];

// 视频示例数据
const videoExamples = [
  {
    label: '海边日落',
    prompt: '夕阳西下，金色的余晖洒在平静的海面上，波浪轻拍着岸边，一艘小船缓缓驶过。'
  },
  {
    label: '城市夜景',
    prompt: '繁华的城市夜景，霓虹灯闪烁，车流如长龙般穿梭在街道上，高楼大厦灯火通明。'
  },
  {
    label: '森林漫步',
    prompt: '阳光透过茂密的树叶洒下斑驳的光影，一条小径蜿蜒在绿色的森林中，鸟儿在枝头歌唱。'
  },
  {
    label: '雨后彩虹',
    prompt: '雨后的天空中出现了一道绚烂的彩虹，阳光穿过云层，照亮了湿润的大地。'
  },
  {
    label: '雪山风光',
    prompt: '雄伟的雪山耸立在蓝天下，山峰被白雪覆盖，山下是绿色的草原和清澈的湖泊。'
  },
  {
    label: '花园盛开',
    prompt: '春天的花园里，各种花朵竞相开放，蝴蝶在花丛中翩翩起舞，微风轻拂过花瓣。'
  }
];

const getRandomExamples = (count: number) => {
  const shuffled = [...videoExamples].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function TextToVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('wanx2.1-t2v-turbo');
  const [examples, setExamples] = useState<{ label: string; prompt: string }[]>([]);
  const [qualityLevel, setQualityLevel] = useState('480P');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoDuration, setVideoDuration] = useState(5);

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>({
    id: 0,
    src: '/demo.mp4'
  });
  const [error, setError] = useState<string | null>(null);

  // 计时器Hook
  const { formattedDuration, start: startTimer, stop: stopTimer } = useGenerateTimer();

  useEffect(() => {
    setExamples(getRandomExamples(4));
  }, []);

  // 根据当前选择的模型获取可用的画质选项
  const getAvailableQualityLevels = useCallback(() => {
    const selectedModelData = models.find(m => m.value === selectedModel);
    return selectedModelData?.qualityLevels || Object.keys(VIDEO_RESOLUTIONS);
  }, [selectedModel]);

  // 根据当前画质获取可用的长宽比选项
  const getAvailableAspectRatios = useCallback(() => {
    const resolutions = VIDEO_RESOLUTIONS[qualityLevel as keyof typeof VIDEO_RESOLUTIONS] || [];
    return resolutions.map(r => r.ratio);
  }, [qualityLevel]);

  // 当模型改变时，重置画质和长宽比为该模型的第一个可用选项
  useEffect(() => {
    const availableQualities = getAvailableQualityLevels();
    if (availableQualities.length > 0 && !availableQualities.includes(qualityLevel)) {
      setQualityLevel(availableQualities[0]);
    }
  }, [selectedModel, qualityLevel, getAvailableQualityLevels]);

  // 当画质档位改变时，重置长宽比为该档位的第一个可用选项
  useEffect(() => {
    const availableRatios = getAvailableAspectRatios();
    if (availableRatios.length > 0 && !availableRatios.includes(aspectRatio)) {
      setAspectRatio(availableRatios[0]);
    }
  }, [qualityLevel, aspectRatio, getAvailableAspectRatios]);

  const refreshExamples = () => {
    setExamples(getRandomExamples(4));
  };

  // 当质量档位或长宽比改变时，获取对应的分辨率
  const getResolution = () => {
    const resolutions = VIDEO_RESOLUTIONS[qualityLevel as keyof typeof VIDEO_RESOLUTIONS] || [];
    const resolution = resolutions.find(r => r.ratio === aspectRatio);
    return resolution?.value || resolutions[0]?.value || '1280*720';
  };

  const outputCounts = [1, 2, 3, 4];
  const availableQualityLevels = getAvailableQualityLevels();
  const availableAspectRatios = getAvailableAspectRatios();

  // 计算长宽比色块样式
  const getAspectRatioStyle = (ratio: string) => {
    const [width, height] = ratio.split(':').map(Number);
    const maxSize = 24;
    const scale = Math.min(maxSize / width, maxSize / height);
    return {
      width: Math.max(width * scale, 8),
      height: Math.max(height * scale, 8)
    };
  };

  /**
   * 参数校验
   */
  const validateParams = (): string | null => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return '请输入提示词';
    }
    if (trimmedPrompt.length > 2000) {
      return '提示词长度不能超过2000个字符';
    }
    return null;
  };

  /**
   * 生成视频
   */
  const handleGenerate = async () => {
    const validationError = validateParams();
    if (validationError) {
      setError(validationError);
      return;
    }

    // 开始计时和生成状态
    setIsGenerating(true);
    startTimer();
    setError(null);

    try {
      const result = await generateVideo({
        model: selectedModel,
        prompt: prompt.trim(),
        resolution: getResolution(),
        duration: videoDuration
      });

      if (result.success && result.data) {
        setGeneratedVideo({
          id: Date.now(),
          src: result.data.output.video_url
        });
      } else {
        setError(result.error || '提交视频生成任务失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成视频时发生未知错误';
      setError(errorMessage);
    } finally {
      // 停止计时和生成状态
      setIsGenerating(false);
      stopTimer();
    }
  };

  /**
   * 下载当前视频
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

  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <Sidebar />
      <main className='ml-20 pt-14'>
        <div className='flex h-[calc(100vh-56px)] p-4 gap-4'>
          {/* Left Control Panel */}
          <div className='w-[380px] bg-[#24222D] p-4 flex flex-col'>
            <div className='flex-1 overflow-y-auto space-y-4'>
              <h1 className='text-xl'>文本转视频AI</h1>

              {/* Model Selection */}
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

              {/* Prompt */}
              <label className='block text-sm text-gray-300 mb-2'>提示词</label>
              <div className='relative'>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder='描述你想要生成的视频内容...'
                  className='h-32 bg-[#383842] !text-xs resize-none border-none focus-visible:ring-0'
                />
                <div className='absolute bottom-2 right-2 text-xs text-gray-500'>
                  {prompt.length}/2000
                </div>
              </div>

              {/* Examples */}
              <div className='flex items-center gap-2 text-xs text-gray-400 mt-2'>
                <span>例子:</span>
                <div className='flex flex-wrap gap-2'>
                  {examples.map(example => (
                    <Button
                      key={example.label}
                      onClick={() => setPrompt(example.prompt)}
                      variant='ghost'
                      className='h-auto p-0 text-xs text-gray-400 hover:text-[#FF3466] hover:bg-transparent'
                    >
                      {example.label}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={refreshExamples}
                  variant='ghost'
                  size='icon'
                  className='ml-auto h-6 w-6 text-gray-400 hover:text-[#FF3466]'
                >
                  <RefreshCw className='w-4 h-4' />
                </Button>
              </div>

              {/* Quality Level - 根据选择的模型动态显示可用画质 */}
              <label className='block text-sm text-gray-300 mb-2'>分辨率</label>
              <div className={cn('flex gap-2')}>
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

              {/* Aspect Ratio - 根据画质动态显示可用选项 */}
              <label className='block text-sm text-gray-300 mb-2'>长宽比</label>
              <div className='flex gap-2'>
                {availableAspectRatios.map(ratio => (
                  <Button
                    key={ratio}
                    variant='outline'
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      'flex-1',
                      'h-16 flex-col bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white',
                      aspectRatio === ratio && 'border-primary'
                    )}
                  >
                    <div className='bg-primary' style={getAspectRatioStyle(ratio)} />
                    <span className='text-xs'>{ratio}</span>
                  </Button>
                ))}
              </div>

              {/* Video Length - 使用单选按钮组件 */}
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

              {/* Credit Cost */}
              <div className='flex justify-between text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='text-white'>{20} 额度</span>
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
                disabled={prompt.length === 0 || isGenerating}
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

            {/* Video Display Area */}
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

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Sparkles, Info, RefreshCw, ChevronRight, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageCarouselMol } from '@/components/mol/imageCarouselMol';
import { SelectMol, SelectOption } from '@/components/mol/SelectMol';
import { DialogMol } from '@/components/mol/dialogMol';
import { downloadCurrentImage } from '@/lib/downloadUtils';
import { generateImage, GeneratedImage } from '@/lib/apiService';

const SIZE_MAP: Record<string, string> = {
  '1:1': '1328*1328', // 正方形
  '16:9': '1664*928', // 宽屏
  '3:2': '1472*1140', // 接近3:2比例
  '2:3': '1140*1472', // 竖屏，接近2:3比例
  '3:4': '1140*1472', // 竖屏，接近3:4比例
  '4:3': '1472*1140', // 横屏，接近4:3比例
  '9:16': '928*1664' // 竖屏
};
// Model data
const models = [
  {
    value: 'qwen-image',
    label: '通义千问-Image',
    description: '通义千问-Image-Edit',
    icon: '/image/Group.svg',
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
  },
  {
    value: 'wan2.2-t2i-flash',
    label: 'Wan2.2',
    description: '通义万相文生图2.2',
    icon: '/image/Group.svg',
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
  },
  {
    value: 'Hunyuan',
    label: 'Hunyuan',
    description: '腾讯混元大模型',
    icon: '/image/com-logo-hunyuan.svg'
  }
];

// Style data
const styles = [
  {
    label: '自动',
    preview: '/image/style1.jpg'
  },
  {
    label: '吉卜力',
    preview: '/image/style2.jpg'
  },
  {
    label: '超现实主义',
    preview: '/image/style3.jpg'
  },
  {
    label: '蒸汽朋克',
    preview: '/image/style4.jpg'
  },
  {
    label: '日本动漫',
    preview: '/image/style5.jpg'
  },
  {
    value: '6',
    label: '像素艺术',
    preview: '/image/style6.jpg'
  },
  {
    label: '黑色电影',
    preview: '/image/style7.jpg'
  },
  {
    label: '现代摄影',
    preview: '/image/style8.jpg'
  }
];

// Mock data for carousel
const sampleImages = [
  { id: 1, src: '/image/demo1.jpeg' },
  { id: 2, src: '/image/demo2.jpeg' },
  { id: 3, src: '/image/demo3.jpeg' }
];

const allExamples = [
  {
    label: '高层探险家',
    prompt: '上图是城市探险者，下图是城市灯光和快速流动的河流。眩晕与平静交织。'
  },
  {
    label: '公园生活',
    prompt: '一个阳光明媚的下午，人们在公园里散步，孩子们在草地上嬉戏，远处是城市的轮廓。'
  },
  {
    label: '海边的宁静',
    prompt: '夕阳西下，金色的余晖洒在平静的海面上，一艘小船静静地停泊在岸边。'
  },
  { label: '晨露', prompt: '清晨，阳光穿过树叶，照在挂着露珠的蜘蛛网上，晶莹剔剔透。' },
  {
    label: '未来城市',
    prompt: '霓虹灯闪烁的未来城市，飞行汽车穿梭在高楼大厦之间，街道上是熙熙攘攘的人群。'
  },
  {
    label: '林中小屋',
    prompt: '一座被绿树环绕的小木屋，屋顶上覆盖着青苔，烟囱里冒出袅袅炊烟。'
  },
  { label: '星空下的山脉', prompt: '雄伟的山脉剪影之上是璀璨的银河，流星划过夜空。' },
  {
    label: '蒸汽火车',
    prompt: '一列老式蒸汽火车喷着白烟，行驶在蜿蜒的山间铁轨上，穿过一片金色的麦田。'
  },
  {
    label: '古老图书馆',
    prompt:
      '一个宏伟的图书馆，高高的书架上摆满了古老的书籍，阳光从彩绘玻璃窗透进来，照亮了空气中的尘埃。'
  },
  {
    label: '未来交通',
    prompt: '悬浮在空中的透明管道里，高速胶囊列车飞速穿行，连接着云端城市。'
  }
];

const getExamples = (count: number) => {
  const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('wan2.2-t2i-flash');
  const [examples, setExamples] = useState<{ label: string; prompt: string }[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('自动');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [outputCount, setOutputCount] = useState(1);
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);

  // 新增状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(sampleImages);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setExamples(getExamples(4));
  }, []);

  const refreshExamples = () => {
    setExamples(getExamples(4));
  };

  const aspectRatios = ['1:1', '16:9', '3:2', '2:3', '3:4', '4:3', '9:16'];
  const outputCounts = [1, 2, 3, 4];

  // 计算长宽比色块样式
  const getAspectRatioStyle = (ratio: string) => {
    const [width, height] = ratio.split(':').map(Number);
    const maxSize = 24; // 最大尺寸
    const scale = Math.min(maxSize / width, maxSize / height);
    return {
      width: Math.max(width * scale, 8), // 最小宽度8px
      height: Math.max(height * scale, 8) // 最小高度8px
    };
  };

  const selectedStyleOption = styles.find(style => style.label === selectedStyle);

  /**
   * 下载当前显示的图片
   */
  const handleDownloadCurrent = async () => {
    if (generatedImages.length === 0) return;

    try {
      setIsDownloading(true);
      await downloadCurrentImage(generatedImages, currentImageIndex);
    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * 轮播图当前图片变化回调
   */
  const handleCurrentImageChange = (index: number) => {
    setCurrentImageIndex(index);
  };

  /**
   * 参数校验函数
   */
  const validateParams = (): string | null => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return '请输入提示词';
    }
    if (trimmedPrompt.length > 2000) {
      return `提示词长度不能超过2000个字符`;
    }
    if (!selectedModel) {
      return '请选择模型';
    }
    if (outputCount < 1 || outputCount > 4) {
      return '输出数量必须在1-4之间';
    }
    return null;
  };

  /**
   * 生成图像的主要函数
   * 使用抽取的API服务方法
   */
  const handleGenerate = async () => {
    // 1. 参数校验
    const validationError = validateParams();
    if (validationError) {
      setError(validationError);
      return;
    }

    const model = models.find(model => model.value === selectedModel);
    if (!model?.url) {
      setError('模型配置错误');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      let enhancedPrompt = prompt.trim();
      if (selectedStyle && selectedStyle !== '自动') {
        enhancedPrompt += ` 注意：图片的风格为【${selectedStyle}】`;
      }

      const result = await generateImage({
        url: model.url,
        model: model.value,
        prompt: enhancedPrompt,
        sieze: SIZE_MAP[aspectRatio],
        outputCount: outputCount
      });

      if (result.success && result.data) {
        setGeneratedImages(result.data);
        setCurrentImageIndex(0); // 重置到第一张图片
      } else {
        setError(result.error || '生成图像失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图像时发生未知错误';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
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
              <h1 className='text-xl'>文本转图像AI</h1>

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
                  placeholder='你想要生成什么？'
                  className='h-32 bg-[#383842] !text-xs resize-none border-none focus-visible:ring-0'
                />
                <div className='absolute bottom-2 right-2 text-xs text-gray-500'>
                  {prompt.length}/{2000}
                </div>
              </div>
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

              {/* Style */}
              <label className='block text-sm text-gray-300 mb-2'>风格</label>
              <Button
                variant='outline'
                className='w-full justify-between bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] h-auto'
                onClick={() => setStyleDialogOpen(true)}
              >
                {selectedStyleOption ? (
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-700'>
                      <Image
                        src={selectedStyleOption.preview}
                        alt={selectedStyleOption.label}
                        width={40}
                        height={40}
                        className='w-full h-full object-cover'
                        unoptimized
                      />
                    </div>
                    <span className='text-sm text-white'>{selectedStyleOption.label}</span>
                  </div>
                ) : (
                  <span className='text-gray-400 text-sm py-2'>请选择风格</span>
                )}
                <ChevronRight className='w-4 h-4 text-gray-400' />
              </Button>

              <DialogMol
                open={styleDialogOpen}
                onOpenChange={setStyleDialogOpen}
                title='选择风格'
                maxWidth='60vw'
              >
                <div className='grid grid-cols-4 gap-3'>
                  {styles.map(style => (
                    <div
                      key={style.label}
                      className={cn(
                        'rounded-lg cursor-pointer bg-[#383842] hover:bg-[#4a4a54]',
                        style.label === selectedStyle && 'ring-2 ring-[#FF3466]'
                      )}
                      onClick={() => {
                        setSelectedStyle(style.label);
                        setStyleDialogOpen(false);
                      }}
                    >
                      <div className='aspect-square'>
                        <Image
                          src={style.preview}
                          alt={style.label}
                          width={120}
                          height={120}
                          className='w-full h-full object-cover rounded-t-lg'
                          unoptimized
                        />
                      </div>
                      <p className='p-2 text-sm text-white text-center'>{style.label}</p>
                    </div>
                  ))}
                </div>
              </DialogMol>

              {/* Aspect Ratio */}
              <label className='block text-sm text-gray-300 mb-2'>长宽比</label>
              <div className='grid grid-cols-7 gap-2'>
                {aspectRatios.map(ratio => (
                  <Button
                    key={ratio}
                    variant='outline'
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      'h-16 flex-col bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white',
                      aspectRatio === ratio && 'border-primary'
                    )}
                  >
                    <div className='bg-primary' style={getAspectRatioStyle(ratio)} />
                    <span className='text-xs'>{ratio}</span>
                  </Button>
                ))}
              </div>

              {/* Output Count */}
              <label className='block text-sm text-gray-300 mb-2'>输出图像数量</label>
              <div className='grid grid-cols-4 gap-2'>
                {outputCounts.map(count => (
                  <Button
                    key={count}
                    variant={outputCount === count ? 'default' : 'outline'}
                    onClick={() => setOutputCount(count)}
                    className={
                      outputCount === count
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-[#383842] border-[#4a4a54] hover:bg-[#4a4a54] hover:text-white'
                    }
                  >
                    {count}
                  </Button>
                ))}
              </div>

              {/* Credit Cost */}
              <div className='flex justify-between text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='text-white'>{outputCount * 10} 额度</span>
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
                disabled={prompt.length === 0 || isGenerating}
                className='w-full h-12 bg-primary hover:bg-primary/90 text-lg'
              >
                <Sparkles className={cn('w-5 h-5 mr-2', isGenerating && 'animate-spin')} />
                {isGenerating ? '生成中...' : '生成'}
              </Button>
            </div>
          </div>

          {/* Right Image Display */}
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
                下载当前图片
              </Button>
            </div>

            {/* 显示生成的图片或示例图片 */}
            <ImageCarouselMol
              images={generatedImages}
              className='flex-1'
              onCurrentChange={handleCurrentImageChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

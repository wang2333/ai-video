'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Switch } from '@/components/ui/switch'; // Assuming shadcn/ui switch
import { Sparkles, Info, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageCarouselMol } from '@/components/mol/imageCarouselMol';
import { SelectMol, SelectOption } from '@/components/mol/SelectMol';
import { DialogMol } from '@/components/mol/dialogMol';

// Model data
const models = [
  {
    value: 'wan2.2-t2i-plus',
    label: 'Wan2.2',
    description: '通义万相 (Wan系列)',
    icon: '/image/Group.svg'
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
    value: '1',
    label: '自动',
    preview: '/image/style1.jpg'
  },
  {
    value: '2',
    label: '吉卜力',
    preview: '/image/style2.jpg'
  },
  {
    value: '3',
    label: '超现实主义',
    preview: '/image/style3.jpg'
  },
  {
    value: '4',
    label: '蒸汽朋克',
    preview: '/image/style4.jpg'
  },
  {
    value: '5',
    label: '日本动漫',
    preview: '/image/style5.jpg'
  },
  {
    value: '6',
    label: '像素艺术',
    preview: '/image/style6.jpg'
  },
  {
    value: '7',
    label: '黑色电影',
    preview: '/image/style7.jpg'
  },
  {
    value: '8',
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
    label: '赛博朋克城市',
    prompt: '霓虹灯闪烁的未来城市，飞行汽车穿梭在高楼大厦之间，街道上是熙熙攘攘的人群。'
  },
  {
    label: '森林中的小屋',
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
    label: '未来世界交通',
    prompt: '悬浮在空中的透明管道里，高速胶囊列车飞速穿行，连接着云端城市。'
  }
];

const getExamples = (count: number) => {
  const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function TextToImagePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('wan2.2-t2i-plus');
  const [selectedStyle, setSelectedStyle] = useState('1');
  const [aspectRatio, setAspectRatio] = useState('3:2');
  const [outputCount, setOutputCount] = useState(2);
  const [translatePrompt, setTranslatePrompt] = useState(true);
  const [examples, setExamples] = useState<{ label: string; prompt: string }[]>([]);
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);

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

  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <Sidebar />
      <main className='ml-25 pt-14'>
        <div className='flex h-[calc(100vh-56px)] p-4'>
          {/* Left Control Panel */}
          <div className='rounded-sm w-[380px] bg-[#24222D] p-4 mr-4 flex flex-col'>
            <div className='flex-grow overflow-y-auto pr-3 -mr-3'>
              <h1 className='text-xl mb-6'>文本转图像AI</h1>

              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>模型</label>
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
                        <div className='w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center'>
                          <Image
                            src={model.icon}
                            alt={model.label}
                            unoptimized
                            width={32}
                            height={32}
                            className='object-cover'
                          />
                        </div>
                        <div className='text-left flex-1'>
                          <p className='text-sm text-white'>{model.label}</p>
                          <p className='text-xs text-gray-400'>{model.description}</p>
                        </div>
                      </div>
                    );
                  }}
                  renderItem={option => (
                    <div className='flex items-center gap-3 '>
                      <div className='w-8 h-8 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center'>
                        <Image
                          src={option.icon}
                          alt={option.label}
                          unoptimized
                          width={24}
                          height={24}
                          className='object-cover'
                        />
                      </div>
                      <div className='flex-1'>
                        <p className='text-white'>{option.label}</p>
                        <p className='text-xs text-gray-400'>{option.description}</p>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Prompt */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>提示词</label>
                <div className='relative px-1'>
                  <Textarea
                    id='prompt'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder='你想要生成什么？'
                    className='w-full h-32 bg-[#383842] rounded-lg p-2 text-xs resize-none border-none shadow-none focus-visible:ring-0'
                  />
                  <div className='absolute bottom-2 right-2 text-xs text-gray-500'>
                    {prompt.length}/2000
                  </div>
                </div>
                <div className='flex items-center gap-2 text-xs text-gray-400 mt-2'>
                  <span>例子:</span>
                  <div className='flex flex-wrap items-center gap-2'>
                    {examples.map(example => (
                      <Button
                        key={example.label}
                        onClick={() => setPrompt(example.prompt)}
                        variant='ghost'
                        className='py-1 text-xs text-gray-400 h-auto p-0 hover:text-[#FF3466] hover:bg-transparent'
                      >
                        {example.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={refreshExamples}
                    variant='ghost'
                    size='icon'
                    className='ml-auto text-gray-400 h-6 w-6 hover:text-[#FF3466] hover:bg-transparent'
                  >
                    <RefreshCw className='w-4 h-4' />
                  </Button>
                </div>
              </div>

              {/* Style */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>风格</label>
                <Button
                  variant='outline'
                  className='w-full flex items-center justify-between text-left rounded-lg border transition-colors bg-[#383842] hover:bg-[#383842] border-[#4a4a54] hover:border-[#5a5a64] h-15'
                  onClick={() => setStyleDialogOpen(true)}
                >
                  <div className='flex-1'>
                    {(() => {
                      const selectedOption = styles.find(style => style.value === selectedStyle);
                      if (selectedOption) {
                        return (
                          <div className='flex items-center gap-3 py-2'>
                            <div className='w-10 h-10 overflow-hidden bg-gray-700 flex-shrink-0'>
                              <Image
                                src={selectedOption.preview}
                                alt={selectedOption.label}
                                width={40}
                                height={40}
                                className='w-full h-full object-cover'
                                unoptimized
                              />
                            </div>
                            <div className='flex-1 text-left'>
                              <p className='text-sm text-white'>{selectedOption.label}</p>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className='py-2'>
                          <span className='text-gray-400 text-sm'>请选择风格</span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className='flex-shrink-0 ml-2'>
                    <ChevronRight className='w-4 h-4 text-gray-400' />
                  </div>
                </Button>

                <DialogMol
                  open={styleDialogOpen}
                  onOpenChange={setStyleDialogOpen}
                  title='选择风格'
                  maxWidth='60vw'
                >
                  <div className='grid grid-cols-4 gap-3'>
                    {styles.map(style => {
                      const isSelected = style.value === selectedStyle;
                      return (
                        <div
                          key={style.value}
                          className={cn(
                            'relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group',
                            'bg-[#383842] hover:bg-[#4a4a54]',
                            isSelected && 'ring-2 ring-[#FF3466] bg-[#4a4a54]'
                          )}
                          onClick={() => {
                            setSelectedStyle(style.value);
                            setStyleDialogOpen(false);
                          }}
                        >
                          <div className='aspect-square w-full'>
                            <Image
                              src={style.preview}
                              alt={style.label}
                              width={120}
                              height={120}
                              className='w-full h-full object-cover'
                              unoptimized
                            />
                          </div>
                          <div className='p-2'>
                            <p className='text-sm font-medium text-white text-center'>
                              {style.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DialogMol>
              </div>

              {/* Aspect Ratio */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>长宽比</label>
                <div className='grid grid-cols-7 gap-2'>
                  {aspectRatios.map(ratio => (
                    <Button
                      key={ratio}
                      variant='outline'
                      onClick={() => setAspectRatio(ratio)}
                      className={cn(
                        'relative h-16 rounded-md text-xs font-mono flex flex-col items-center justify-center bg-[#383842] hover:bg-[#4a4a54] border-[#4a4a54] hover:text-white',
                        aspectRatio === ratio && 'text-primary border-primary'
                      )}
                    >
                      <div className='bg-primary -mt-4' style={getAspectRatioStyle(ratio)} />
                      <span className='absolute bottom-1 text-xs'>{ratio}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Output Image Count */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>输出图像数量</label>
                <div className='grid grid-cols-4 gap-2'>
                  {outputCounts.map(count => (
                    <Button
                      key={count}
                      variant={outputCount === count ? 'default' : 'outline'}
                      onClick={() => setOutputCount(count)}
                      className={cn(
                        'h-10 rounded-md text-sm hover:text-white',
                        outputCount === count
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-[#383842] hover:bg-[#4a4a54] border-[#4a4a54]'
                      )}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Credit Cost */}
              <div className='flex justify-between items-center text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='text-white'>{outputCount * 10} 额度</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className='pt-6 border-t border-gray-700'>
              <Button
                disabled={prompt.length === 0}
                size='lg'
                className='w-full bg-primary text-white h-12 rounded-lg text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors'
              >
                <Sparkles className='w-5 h-5' />
                生成
              </Button>
            </div>
          </div>

          {/* Right Image Display */}
          <div className='rounded-sm flex-1 flex flex-col p-4 bg-[#24222D]'>
            <h2 className='text-sm mb-6'>示例图片</h2>
            <div className='flex-1'>
              <ImageCarouselMol images={sampleImages} className='h-full' />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

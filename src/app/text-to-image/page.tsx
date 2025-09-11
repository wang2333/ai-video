'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Switch } from '@/components/ui/switch'; // Assuming shadcn/ui switch
import { ChevronDown, Sparkles, Info, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Mock data for carousel
const sampleImages = [
  {
    id: 1,
    src: 'https://cdn.pollo.ai/prod/public/images/imageai/samples/image-ai-sample-2-1.jpeg'
  },
  {
    id: 2,
    src: 'https://cdn.pollo.ai/prod/public/images/imageai/samples/image-ai-sample-2-2.jpeg'
  },
  { id: 3, src: 'https://cdn.pollo.ai/prod/public/images/imageai/samples/image-ai-sample-2-3.jpeg' }
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
  const [aspectRatio, setAspectRatio] = useState('3:2');
  const [outputCount, setOutputCount] = useState(2);
  const [translatePrompt, setTranslatePrompt] = useState(true);
  const [examples, setExamples] = useState<{ label: string; prompt: string }[]>([]);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    setExamples(getExamples(4));
  }, []);

  const refreshExamples = () => {
    setExamples(getExamples(4));
  };

  const aspectRatios = ['1:1', '16:9', '3:2', '2:3', '3:4', '4:3', '9:16'];
  const outputCounts = [1, 2, 3, 4];

  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <Sidebar />
      <main className='ml-25 pt-14'>
        <div className='flex h-[calc(100vh-56px)] p-4'>
          {/* Left Control Panel */}
          <div className='rounded-sm w-[380px] bg-[#24222D] p-4 mr-4 flex flex-col'>
            <div className='flex-grow overflow-y-auto pr-3 -mr-3'>
              <h1 className='text-xl font-semibold mb-6'>文本转图像AI</h1>

              {/* Model */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>模型</label>
                <button className='w-full flex items-center justify-between text-left p-3 bg-[#383842] rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-md flex items-center justify-center font-bold text-xl'>
                      P
                    </div>
                    <div>
                      <p className='font-semibold'>Pollo Image 1.6</p>
                      <p className='text-xs text-gray-400'>Pollo AI 的先进多功能模型</p>
                    </div>
                  </div>
                  <ChevronDown className='w-5 h-5 text-gray-400' />
                </button>
              </div>

              {/* Prompt */}
              <div className='space-y-2 mb-4'>
                <div className='flex justify-between items-center'>
                  <label htmlFor='prompt' className='text-sm font-medium text-gray-300'>
                    提示词
                  </label>
                </div>
                <div className='relative px-1'>
                  <Textarea
                    id='prompt'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder='你想要生成什么？'
                    className='w-full h-32 bg-[#383842] rounded-lg p-2 text-sm resize-none border-none shadow-none focus-visible:ring-0'
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
                <button className='w-full flex items-center justify-between text-left p-2 bg-[#383842] rounded-lg'>
                  <div className='flex items-center gap-3'>
                    <Image
                      src='/api/placeholder/64/64?text=Style'
                      alt='神秘黑暗'
                      width={40}
                      height={40}
                      className='rounded'
                    />
                    <p className='font-semibold'>神秘黑暗</p>
                  </div>
                  <ChevronRight className='w-5 h-5 text-gray-400' />
                </button>
              </div>

              {/* Aspect Ratio */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>长宽比</label>
                <div className='grid grid-cols-7 gap-2'>
                  {aspectRatios.map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={cn(
                        'h-10 rounded-md text-sm font-mono flex items-center justify-center bg-[#383842] hover:bg-[#4a4a54]',
                        aspectRatio === ratio && 'bg-red-500 text-white hover:bg-red-600'
                      )}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Image Count */}
              <div className='space-y-2 mb-4'>
                <label className='text-sm font-medium text-gray-300'>输出图像数量</label>
                <div className='grid grid-cols-4 gap-2'>
                  {outputCounts.map(count => (
                    <button
                      key={count}
                      onClick={() => setOutputCount(count)}
                      className={cn(
                        'h-10 rounded-md text-sm bg-[#383842] hover:bg-[#4a4a54]',
                        outputCount === count && 'bg-red-500 text-white hover:bg-red-600'
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Cost */}
              <div className='flex justify-between items-center text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='font-semibold text-white'>6 额度</span>
              </div>
            </div>

            {/* Generate Button */}
            <div className='pt-6 border-t border-gray-700'>
              <button className='w-full bg-red-500 text-white h-12 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors'>
                <Sparkles className='w-5 h-5' />
                生成
              </button>
            </div>
          </div>

          {/* Right Image Display */}
          <div className='rounded-sm flex-1 flex flex-col p-4 bg-[#24222D]'>
            <h2 className='text-sm font-semibold mb-6'>示例图片</h2>
            <div className='flex-1 relative flex items-center justify-center'>
              <Carousel
                setApi={setApi}
                opts={{
                  loop: true
                }}
                className='w-full h-full h-full-carousel'
              >
                <CarouselContent className='h-full'>
                  {sampleImages.map(image => (
                    <CarouselItem key={image.id} className='h-full'>
                      <div className='p-1 h-full'>
                        <div className='relative h-full'>
                          <Image
                            src={image.src}
                            alt={`Sample ${image.id}`}
                            fill
                            className='object-contain rounded-lg'
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-[#FF3466] hover:text-white border-none text-white h-10 w-10' />
                <CarouselNext className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-[#FF3466] hover:text-white border-none text-white h-10 w-10' />
              </Carousel>
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      'w-2 h-2 rounded-full bg-white/30 transition-colors',
                      current === index ? 'bg-white' : 'hover:bg-white/50'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

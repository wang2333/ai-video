'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Sparkles, Info, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImageCarouselMol } from '@/components/mol/imageCarouselMol';
import { SelectMol, SelectOption } from '@/components/mol/SelectMol';
import { ImageUploadMol, UploadedImage } from '@/components/mol/imageUploadMol';
import { downloadImageSmart } from '@/lib/downloadUtils';
import { generateImageToImage, GeneratedImage } from '@/lib/apiService';

// Model data - 图生图支持的模型
const models = [
  {
    value: 'wanx2.1-imageedit',
    label: '通用图像编辑',
    description: '通义万相-通用图像编辑',
    icon: '/image/Group.svg',
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis'
  }
];

// Mock data for carousel
const sampleImages = [
  { id: 1, src: '/image/demo1.jpeg' },
  { id: 2, src: '/image/demo2.jpeg' },
  { id: 3, src: '/image/demo3.jpeg' }
];

const outputCounts = [1, 2, 3, 4];

export default function ImageToImage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('wanx2.1-imageedit');
  const [outputCount, setOutputCount] = useState(1);

  // 图生图特有状态
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(sampleImages);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * 处理图片上传
   */
  const handleImageUpload = (image: UploadedImage) => {
    console.log('?? ~ image:', image);
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
   * 下载当前显示的图片
   */
  const handleDownloadCurrent = async () => {
    if (generatedImages.length === 0) return;

    const currentImage = generatedImages[currentImageIndex];
    if (!currentImage) return;

    try {
      setError(null); // 清除之前的错误
      await downloadImageSmart(currentImage.src, `ai-image-${currentImage.id}-${Date.now()}.jpg`);
    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
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
    if (!uploadedImage) {
      return '请先上传参考图片';
    }

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

    if (!uploadedImage) {
      setError('请先上传参考图片');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImageToImage({
        url: model.url,
        model: model.value,
        prompt: prompt.trim(),
        imageUrl: uploadedImage.base64,
        sieze: '1024*1024', // 默认尺寸
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
              <h1 className='text-xl'>图像转图像AI</h1>

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

              {/* Reference Image Upload */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>参考图片</label>
                <ImageUploadMol
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  uploadedImage={uploadedImage}
                  disabled={isGenerating}
                  maxSize={10}
                />
              </div>

              {/* Prompt */}
              <div>
                <label className='block text-sm text-gray-300 mb-2'>提示词</label>
                <div className='relative'>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder='描述你希望如何修改这张图片...'
                    className='h-32 bg-[#383842] !text-xs resize-none border-none focus-visible:ring-0'
                  />
                  <div className='absolute bottom-2 right-2 text-xs text-gray-500'>
                    {prompt.length}/{2000}
                  </div>
                </div>
              </div>

              {/* Output Count */}
              <div>
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
              </div>

              {/* Credit Cost */}
              <div className='flex justify-between text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <span>所需额度:</span>
                  <Info className='w-4 h-4' />
                </div>
                <span className='text-white'>{outputCount * 15} 额度</span>
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
                {isGenerating ? '生成中...' : '生成'}
              </Button>
            </div>
          </div>

          {/* Right Image Display */}
          <div className='flex flex-col flex-1 bg-[#24222D] p-4'>
            <div className='flex justify-end mb-2'>
              <Button
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

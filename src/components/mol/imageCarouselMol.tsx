'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

export interface ImageCarouselProps {
  images: Array<{
    id: number;
    src: string;
    alt?: string;
  }>;
  className?: string;
  onCurrentChange?: (current: number) => void;
}

/**
 * 图片轮播组件
 * @param images - 图片数组
 * @param className - 自定义样式类名
 * @param onCurrentChange - 当前图片切换时的回调函数，参数为当前图片的索引
 */
const ImageCarouselMol = ({ images, className, onCurrentChange }: ImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  /**
   * 处理轮播图切换事件
   */
  const handleSelect = useCallback(() => {
    if (!api) return;

    const selectedIndex = api.selectedScrollSnap();
    setCurrent(selectedIndex);
    onCurrentChange?.(selectedIndex);
  }, [api, onCurrentChange]);

  useEffect(() => {
    if (!api) return;

    // 监听选择事件
    api.on('select', handleSelect);
    setCount(api.scrollSnapList().length);
    // 初始化当前索引
    handleSelect();

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, images, handleSelect]);

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <Carousel
        setApi={setApi}
        opts={{
          loop: true
        }}
        className='w-full h-full h-full-carousel'
      >
        <CarouselContent className='h-full'>
          {images.map(image => (
            <CarouselItem key={image.id} className='h-full'>
              <div className='p-1 h-full'>
                <div className='relative h-full'>
                  <Image
                    src={image.src}
                    alt={image.alt || `Image ${image.id}`}
                    fill
                    className='h-full object-contain rounded-lg'
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full bg-primary hover:bg-primary/90 hover:text-white border-none text-white h-10 w-10' />
            <CarouselNext className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full bg-primary hover:bg-primary/90 hover:text-white border-none text-white h-10 w-10' />
          </>
        )}
        {/* 指示器 */}
        {images.length > 1 && (
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
        )}
      </Carousel>
    </div>
  );
};

export default memo(ImageCarouselMol);

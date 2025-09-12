'use client';

import { useState, useEffect } from 'react';
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
}

export function ImageCarouselMol({ images, className }: ImageCarouselProps) {
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
        <CarouselPrevious className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full bg-primary hover:bg-primary/90 hover:text-white border-none text-white h-10 w-10' />
        <CarouselNext className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full bg-primary hover:bg-primary/90 hover:text-white border-none text-white h-10 w-10' />
      </Carousel>

      {/* 指示器 */}
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
  );
}

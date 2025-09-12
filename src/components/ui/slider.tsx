import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ min = 0, max = 100, step = 1, value, onValueChange, className, disabled = false }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <input
          ref={ref}
          type='range'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onValueChange(Number(e.target.value))}
          disabled={disabled}
          className='sr-only'
        />
        <div className='relative w-full h-2 bg-gray-700 rounded-full'>
          <div
            className='absolute h-2 bg-primary rounded-full transition-all duration-150'
            style={{ width: `${percentage}%` }}
          />
          <div
            className='absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-y-1 transition-all duration-150 hover:scale-110'
            style={{ left: `calc(${percentage}% - 8px)` }}
            onMouseDown={e => {
              if (disabled) return;

              const slider = e.currentTarget.parentElement?.parentElement;
              if (!slider) return;

              const rect = slider.getBoundingClientRect();

              const handleMouseMove = (e: MouseEvent) => {
                const x = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                const newValue = min + (percentage / 100) * (max - min);
                const steppedValue = Math.round(newValue / step) * step;
                onValueChange(Math.max(min, Math.min(max, steppedValue)));
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };

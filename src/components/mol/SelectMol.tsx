'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: any; // 允许额外的属性
}

export interface SelectMolProps {
  options: SelectOption[];
  value: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  renderTrigger?: (selectedOption: SelectOption | undefined) => React.ReactNode;
  renderItem?: (option: SelectOption) => React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark';
}

export function SelectMol({
  options,
  value,
  onValueChange,
  placeholder = '请选择...',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  itemClassName = '',
  renderTrigger,
  renderItem,
  disabled = false,
  size = 'md',
  variant = 'default'
}: SelectMolProps) {
  const selectedOption = options.find(option => option.value === value);

  // 将size映射到shadcn/ui的尺寸
  const shadcnSize = size === 'md' ? 'default' : size === 'sm' ? 'sm' : 'lg';

  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger size={shadcnSize} variant={variant} className={triggerClassName}>
          <SelectValue placeholder={placeholder}>
            {renderTrigger ? renderTrigger(selectedOption) : selectedOption?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent variant={variant} className={contentClassName}>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              variant={variant}
              className={itemClassName}
            >
              {renderItem ? renderItem(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

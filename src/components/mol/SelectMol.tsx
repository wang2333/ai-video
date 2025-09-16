'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
  [key: string]: any;
}

export interface SelectMolProps {
  options: SelectOption[];
  value: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
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
  renderTrigger,
  renderItem,
  disabled = false,
  size = 'md',
  variant = 'default'
}: SelectMolProps) {
  const selectedOption = options.find(option => option.value === value);

  // 将 size 映射到 shadcn/ui 的尺寸
  const shadcnSize = size === 'md' ? 'default' : size === 'sm' ? 'sm' : 'lg';

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={shadcnSize} variant={variant}>
        <SelectValue placeholder={placeholder}>
          {renderTrigger ? renderTrigger(selectedOption) : selectedOption?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent variant={variant}>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value} variant={variant}>
            {renderItem ? renderItem(option) : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


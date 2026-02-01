import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={cn('animate-spin text-primary-600', sizes[size])} />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {content}
      </div>
    );
  }

  return content;
}
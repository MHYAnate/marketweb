import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Alert({ type = 'info', title, children, className }: AlertProps) {
  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
    },
  };

  return (
    <div className={cn('border rounded-lg p-4', styles[type].container, className)}>
      <div className="flex gap-3">
        {styles[type].icon}
        <div>
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
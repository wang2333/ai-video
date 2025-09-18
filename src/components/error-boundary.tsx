'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen bg-[#0D0D12] flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-[#24222D] rounded-lg p-6 text-center shadow-xl border border-red-500/20'>
            <AlertTriangle className='w-12 h-12 text-red-400 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-white mb-2'>出错了</h2>
            <p className='text-gray-300 mb-6 text-sm'>
              应用程序遇到了意外错误，请尝试刷新页面或联系技术支持。
            </p>

            <div className='space-y-3'>
              <Button
                onClick={this.handleRetry}
                className='w-full bg-[#FF3466] hover:bg-[#FF3466]/90'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                重试
              </Button>

              <Button
                variant='outline'
                onClick={() => window.location.reload()}
                className='w-full border-gray-600 text-gray-300 hover:bg-gray-700'
              >
                刷新页面
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-4 text-left'>
                <summary className='text-xs text-gray-400 cursor-pointer hover:text-gray-300'>
                  错误详情 (开发模式)
                </summary>
                <pre className='text-xs text-red-400 mt-2 p-2 bg-red-500/10 rounded overflow-auto max-h-32'>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

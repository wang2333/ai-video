import Link from 'next/link';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Type, ImageIcon, Sparkles, Wand2, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <main className='ml-25 pt-14'>
        {/* Hero Section */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center py-20'>
            <div className='flex justify-center mb-6'>
              <div className='inline-flex items-center space-x-2 bg-[#FF3466]/10 text-[#FF3466] px-4 py-2 rounded-full text-sm font-medium'>
                <Star className='w-4 h-4' />
                <span>全新 AI 创作平台</span>
              </div>
            </div>
            <h1 className='text-4xl md:text-6xl font-bold text-white mb-6'>
              释放
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FF3466] to-[#FF6B8A]'>
                AI 创意
              </span>
              的无限可能
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto mb-12'>
              体验最先进的人工智能技术，通过文字描述生成精美图片，或对现有图片进行风格转换。让创意想象变为现实。
            </p>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-4 justify-center mb-16'>
              <Link
                href='/text-to-image'
                className='bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-[#E62E5C] hover:to-[#FF5A80] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2'
              >
                <Type className='w-5 h-5' />
                <span>文生图</span>
                <ArrowRight className='w-5 h-5' />
              </Link>
              <Link
                href='/image-to-image'
                className='bg-[#24222D] border border-[#4a4a54] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#383842] hover:border-[#5a5a64] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2'
              >
                <ImageIcon className='w-5 h-5' />
                <span>图生图</span>
                <ArrowRight className='w-5 h-5' />
              </Link>
            </div>

            {/* Feature Cards */}
            <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
              {/* Text to Image Card */}
              <div className='bg-[#24222D] rounded-2xl shadow-xl border border-[#4a4a54] p-8 hover:shadow-2xl hover:bg-[#2a2834] transition-all duration-300 group'>
                <div className='w-16 h-16 bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                  <Type className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-2xl font-bold text-white mb-4'>文字生成图片</h3>
                <p className='text-gray-300 mb-6 leading-relaxed'>
                  只需输入文字描述，AI 即可创作出令人惊艳的图片。支持多种艺术风格，应有尽有。
                </p>
                <ul className='text-sm text-gray-400 space-y-2 mb-6'>
                  <li>• 智能理解自然语言描述</li>
                  <li>• 支持多种艺术风格选择</li>
                  <li>• 高质量图片输出</li>
                  <li>• 快速生成响应</li>
                </ul>
                <Link
                  href='/text-to-image'
                  className='text-[#FF3466] hover:text-[#FF6B8A] font-semibold flex items-center space-x-1  transition-transform'
                >
                  <span>立即体验</span>
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </div>

              {/* Image to Image Card */}
              <div className='bg-[#24222D] rounded-2xl shadow-xl border border-[#4a4a54] p-8 hover:shadow-2xl hover:bg-[#2a2834] transition-all duration-300 group'>
                <div className='w-16 h-16 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                  <ImageIcon className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-2xl font-bold text-white mb-4'>图片风格转换</h3>
                <p className='text-gray-300 mb-6 leading-relaxed'>
                  上传您的图片，使用 AI 技术进行风格转换、增强或重新创作。让普通照片变身艺术作品。
                </p>
                <ul className='text-sm text-gray-400 space-y-2 mb-6'>
                  <li>• 多种风格转换选项</li>
                  <li>• 精细化参数控制</li>
                  <li>• 保持原图构图特征</li>
                  <li>• 支持多种输出分辨率</li>
                </ul>
                <Link
                  href='/image-to-image'
                  className='text-[#6366F1] hover:text-[#8B5CF6] font-semibold flex items-center space-x-1 transition-transform'
                >
                  <span>立即体验</span>
                  <ArrowRight className='w-4 h-4' />
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className='py-20 bg-[#1A1825]/50 rounded-3xl mb-20 border border-[#4a4a54]/30'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
                为什么选择我们的 AI 平台
              </h2>
              <p className='text-lg text-gray-300 max-w-2xl mx-auto'>
                基于最先进的人工智能技术，为您提供专业级的图像生成和处理体验
              </p>
            </div>
            <div className='grid md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] rounded-2xl flex items-center justify-center mx-auto mb-6'>
                  <Sparkles className='w-10 h-10 text-white' />
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>先进 AI 技术</h3>
                <p className='text-gray-300 leading-relaxed'>
                  采用最新的深度学习模型，确保生成的图片质量和创意水平都达到专业标准
                </p>
              </div>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-6'>
                  <Wand2 className='w-10 h-10 text-white' />
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>简单易用</h3>
                <p className='text-gray-300 leading-relaxed'>
                  直观的用户界面设计，无需专业技能，任何人都能轻松创作出令人印象深刻的视觉作品
                </p>
              </div>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-2xl flex items-center justify-center mx-auto mb-6'>
                  <Star className='w-10 h-10 text-white' />
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>高质量输出</h3>
                <p className='text-gray-300 leading-relaxed'>
                  支持多种分辨率和格式输出，满足从社交媒体到专业印刷的各种使用需求
                </p>
              </div>
            </div>
          </div>

          {/* Sample Gallery */}
          <div className='py-20'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-white mb-4'>探索无限创意可能</h2>
              <p className='text-lg text-gray-300'>查看其他用户的精彩作品，获取创作灵感</p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                <div
                  key={item}
                  className='aspect-square bg-gradient-to-br from-[#24222D] via-[#2a2834] to-[#383842] border border-[#4a4a54] rounded-2xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer hover:border-[#FF3466]/50'
                >
                  <ImageIcon className='w-12 h-12 text-gray-400' />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className='border-t border-[#4a4a54] bg-[#1A1825]/30 mt-20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <div className='text-center'>
              <div className='flex items-center justify-center space-x-2 mb-4'>
                <div className='w-8 h-8 bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] rounded-lg flex items-center justify-center'>
                  <Sparkles className='w-5 h-5 text-white' />
                </div>
                <span className='text-xl font-bold text-white'>AI Video</span>
              </div>
              <p className='text-gray-300 mb-4'>由人工智能驱动的创意平台</p>
              <div className='flex justify-center space-x-6 text-sm text-gray-400'>
                <a href='#' className='hover:text-white transition-colors'>
                  关于我们
                </a>
                <a href='#' className='hover:text-white transition-colors'>
                  服务条款
                </a>
                <a href='#' className='hover:text-white transition-colors'>
                  隐私政策
                </a>
                <a href='#' className='hover:text-white transition-colors'>
                  联系我们
                </a>
              </div>
              <p className='text-gray-500 text-sm mt-8'>© 2025 AI Video. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

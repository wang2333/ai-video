import Link from 'next/link';
import Header from '@/components/Header';
import { Type, ImageIcon, Sparkles, Wand2, ArrowRight, Star, Video, Film } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className='bg-[#0D0D12] min-h-screen text-white'>
      <Header />
      <main className='ml-0 sm:ml-20 pt-14'>
        {/* Hero Section */}
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Background decoration */}
          <div className='absolute inset-0 -z-10 overflow-hidden'>
            <div className='absolute top-20 left-1/4 w-72 h-72 bg-[#FF3466]/5 rounded-full blur-3xl'></div>
            <div className='absolute top-40 right-1/4 w-96 h-96 bg-[#6366F1]/5 rounded-full blur-3xl'></div>
          </div>
          <div className='text-center py-12 sm:py-16 lg:py-20'>
            <div className='flex justify-center mb-6'>
              <div className='inline-flex items-center space-x-2 bg-[#FF3466]/10 text-[#FF3466] px-4 py-2 rounded-full text-sm font-medium'>
                <Star className='w-4 h-4' />
                <span>全新 AI 创作平台</span>
              </div>
            </div>
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6'>
              AI 驱动的
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FF3466] to-[#FF6B8A]'>
                视觉创作
              </span>
              新时代
            </h1>
            <p className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12'>
              从文字到图片，从图片到视频。体验最先进的AI技术，让每一个创意想法都能瞬间变为精美的视觉作品。
            </p>

            {/* CTA Buttons */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-12 sm:mb-16'>
              <Link
                href='/text-to-image'
                className='bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#E62E5C] hover:to-[#FF5A80] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group'
              >
                <div className='flex flex-col items-center space-y-2'>
                  <Type className='w-6 h-6 group-hover:scale-110 transition-transform' />
                  <span>文生图</span>
                </div>
              </Link>
              <Link
                href='/image-to-image'
                className='bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#5855E6] hover:to-[#7C3AED] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group'
              >
                <div className='flex flex-col items-center space-y-2'>
                  <ImageIcon className='w-6 h-6 group-hover:scale-110 transition-transform' />
                  <span>图生图</span>
                </div>
              </Link>
              <Link
                href='/text-to-video'
                className='bg-gradient-to-r from-[#10B981] to-[#34D399] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#0D9488] hover:to-[#10B981] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group'
              >
                <div className='flex flex-col items-center space-y-2'>
                  <Video className='w-6 h-6 group-hover:scale-110 transition-transform' />
                  <span>文生视频</span>
                </div>
              </Link>
              <Link
                href='/image-to-video'
                className='bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white px-6 py-4 rounded-xl font-semibold hover:from-[#D97706] hover:to-[#F59E0B] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 group'
              >
                <div className='flex flex-col items-center space-y-2'>
                  <Film className='w-6 h-6 group-hover:scale-110 transition-transform' />
                  <span>图生视频</span>
                </div>
              </Link>
            </div>

            {/* Feature Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto'>
              {/* Text to Image Card */}
              <div className='bg-[#24222D] rounded-2xl shadow-xl border border-[#4a4a54] p-6 hover:shadow-2xl hover:bg-[#2a2834] transition-all duration-300 group'>
                <div className='w-14 h-14 bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                  <Type className='w-7 h-7 text-white' />
                </div>
                <h3 className='text-lg font-bold text-white mb-3'>文字生成图片</h3>
                <p className='text-gray-300 mb-4 leading-relaxed text-sm'>
                  只需输入文字描述，AI 即可创作出令人惊艳的图片。支持多种艺术风格。
                </p>
                <ul className='text-xs text-gray-400 space-y-1 mb-4'>
                  <li>• 智能理解自然语言</li>
                  <li>• 多种艺术风格</li>
                  <li>• 高质量输出</li>
                </ul>
                <Link
                  href='/text-to-image'
                  className='text-[#FF3466] hover:text-[#FF6B8A] font-semibold flex items-center space-x-1 text-sm transition-transform'
                >
                  <span>立即体验</span>
                  <ArrowRight className='w-3 h-3' />
                </Link>
              </div>

              {/* Image to Image Card */}
              <div className='bg-[#24222D] rounded-2xl shadow-xl border border-[#4a4a54] p-6 hover:shadow-2xl hover:bg-[#2a2834] transition-all duration-300 group'>
                <div className='w-14 h-14 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                  <ImageIcon className='w-7 h-7 text-white' />
                </div>
                <h3 className='text-lg font-bold text-white mb-3'>图片风格转换</h3>
                <p className='text-gray-300 mb-4 leading-relaxed text-sm'>
                  上传图片，使用 AI 技术进行风格转换、增强或重新创作。
                </p>
                <ul className='text-xs text-gray-400 space-y-1 mb-4'>
                  <li>• 多种风格转换</li>
                  <li>• 精细化参数控制</li>
                  <li>• 保持原图构图</li>
                </ul>
                <Link
                  href='/image-to-image'
                  className='text-[#6366F1] hover:text-[#8B5CF6] font-semibold flex items-center space-x-1 text-sm transition-transform'
                >
                  <span>立即体验</span>
                  <ArrowRight className='w-3 h-3' />
                </Link>
              </div>

              {/* Text to Video Card */}
              <div className='bg-[#24222D] rounded-2xl shadow-xl border border-[#4a4a54] p-6 hover:shadow-2xl hover:bg-[#2a2834] transition-all duration-300 group'>
                <div className='w-14 h-14 bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                  <Video className='w-7 h-7 text-white' />
                </div>
                <h3 className='text-lg font-bold text-white mb-3'>文字生成视频</h3>
                <p className='text-gray-300 mb-4 leading-relaxed text-sm'>
                  通过文字描述生成动态视频，让静态想象变为生动的视觉故事。
                </p>
                <ul className='text-xs text-gray-400 space-y-1 mb-4'>
                  <li>• 智能视频生成</li>
                  <li>• 多种分辨率选择</li>
                  <li>• 流畅动画效果</li>
                </ul>
                <Link
                  href='/text-to-video'
                  className='text-[#10B981] hover:text-[#34D399] font-semibold flex items-center space-x-1 text-sm transition-transform'
                >
                  <span>立即体验</span>
                  <ArrowRight className='w-3 h-3' />
                </Link>
              </div>

              {/* Image to Video Card */}
              <div className='bg-[#24222D] rounded-2xl shadow-xl border border-[#4a4a54] p-6 hover:shadow-2xl hover:bg-[#2a2834] transition-all duration-300 group'>
                <div className='w-14 h-14 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                  <Film className='w-7 h-7 text-white' />
                </div>
                <h3 className='text-lg font-bold text-white mb-3'>图片生成视频</h3>
                <p className='text-gray-300 mb-4 leading-relaxed text-sm'>
                  将静态图片转换为动态视频，为您的图片注入生命力。
                </p>
                <ul className='text-xs text-gray-400 space-y-1 mb-4'>
                  <li>• 图片动画化</li>
                  <li>• 自然过渡效果</li>
                  <li>• 多样化动作</li>
                </ul>
                <Link
                  href='/image-to-video'
                  className='text-[#F59E0B] hover:text-[#FBBF24] font-semibold flex items-center space-x-1 text-sm transition-transform'
                >
                  <span>立即体验</span>
                  <ArrowRight className='w-3 h-3' />
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className='py-12 sm:py-16 lg:py-20 bg-[#1A1825]/50 rounded-3xl mb-12 sm:mb-16 lg:mb-20 border border-[#4a4a54]/30'>
            <div className='text-center mb-12 sm:mb-16'>
              <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4'>
                为什么选择我们的 AI 平台
              </h2>
              <p className='text-lg text-gray-300 max-w-2xl mx-auto'>
                基于最先进的人工智能技术，为您提供专业级的图像和视频生成体验
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8'>
              <div className='text-center'>
                <div className='w-20 h-20 bg-gradient-to-r from-[#FF3466] to-[#FF6B8A] rounded-2xl flex items-center justify-center mx-auto mb-6'>
                  <Sparkles className='w-10 h-10 text-white' />
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>先进 AI 技术</h3>
                <p className='text-gray-300 leading-relaxed'>
                  采用最新的深度学习模型，确保生成的图片和视频质量都达到专业标准
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
          <div className='py-12 sm:py-16 lg:py-20'>
            <div className='text-center mb-12'>
              <h2 className='text-2xl sm:text-3xl font-bold text-white mb-4'>探索无限创意可能</h2>
              <p className='text-lg text-gray-300'>查看其他用户的精彩作品，获取创作灵感</p>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'>
              {/* 使用真实的示例图片 */}
              {[
                { src: '/image/demo1.jpeg', alt: '示例图片1', type: 'image' },
                { src: '/image/demo2.jpeg', alt: '示例图片2', type: 'image' },
                { src: '/image/demo3.jpeg', alt: '示例图片3', type: 'image' },
                { src: '/image/style1.jpg', alt: '风格示例1', type: 'image' },
                { src: '/image/style2.jpg', alt: '风格示例2', type: 'image' },
                { src: '/image/style3.jpg', alt: '风格示例3', type: 'image' },
                { src: '/image/style4.jpg', alt: '风格示例4', type: 'image' },
                { src: '/image/style5.jpg', alt: '风格示例5', type: 'image' }
              ].map((item, index) => (
                <div
                  key={index}
                  className='aspect-square bg-[#24222D] border border-[#4a4a54] rounded-2xl overflow-hidden hover:scale-105 transition-transform cursor-pointer hover:border-[#FF3466]/50 relative group'
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className='w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
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
                <span className='text-xl font-bold text-white'>Pollo AI</span>
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
              <p className='text-gray-500 text-sm mt-8'>© 2025 Pollo AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className='fixed top-0 left-0 right-0 h-14 bg-[#24222D] border-b border-gray-700 z-50 flex items-center'>
      <div className='flex items-center justify-between w-full px-4'>
        {/* Left Side - Brand & Menu */}
        <div className='flex items-center gap-4'>
          <button className='text-gray-300 hover:text-white'>
            <Menu className='w-6 h-6' />
          </button>
          <Link href='/' className='flex items-baseline gap-1'>
            <span className='text-2xl font-bold text-white'>Pollo</span>
            <span className='text-sm text-gray-400'>.ai</span>
          </Link>
        </div>

        {/* Right Side - Auth Buttons */}
        <div className='flex items-center space-x-4'>
          <button className='text-gray-300 hover:text-white text-sm transition-colors'>登录</button>
          <button className='bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'>
            免费开始
          </button>
        </div>
      </div>
    </header>
  );
}

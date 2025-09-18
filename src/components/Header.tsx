import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useGlobalStore } from '@/store';

export default function Header() {
  const { sidebarOpen, toggleSidebar, user, isAuthenticated, setUser } = useGlobalStore();

  // 模拟登录/登出功能
  const handleAuth = () => {
    if (isAuthenticated) {
      // 登出
      setUser(null);
    } else {
      // 模拟登录 - 设置一个示例用户
      setUser({
        id: '1',
        name: '测试用户',
        email: 'test@example.com',
        avatar: undefined,
        credits: 100
      });
    }
  };

  return (
    <header className='fixed top-0 left-0 right-0 h-14 bg-[#24222D] border-b border-gray-700 z-50 flex items-center'>
      <div className='flex items-center justify-between w-full px-4'>
        {/* Left Side - Brand & Menu */}
        <div className='flex items-center gap-4'>
          <button
            onClick={toggleSidebar}
            className='text-gray-300 hover:text-white transition-colors'
            aria-label={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'}
          >
            <Menu className='w-6 h-6' />
          </button>
          <Link href='/' className='flex items-baseline gap-1'>
            <span className='text-2xl font-bold text-white'>Pollo</span>
            <span className='text-sm text-gray-400'>.ai</span>
          </Link>
        </div>

        {/* Right Side - Auth Buttons */}
        <div className='flex items-center space-x-4'>
          {isAuthenticated ? (
            <>
              <span className='text-gray-300 text-sm'>欢迎，{user?.name}</span>
              <span className='text-yellow-400 text-sm'>积分: {user?.credits}</span>
              <button
                onClick={handleAuth}
                className='text-gray-300 hover:text-white text-sm transition-colors'
              >
                登出
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleAuth}
                className='text-gray-300 hover:text-white text-sm transition-colors'
              >
                登录
              </button>
              <button className='bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'>
                免费开始
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Type, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'text-to-image', icon: Type, label: '文生图', href: '/text-to-image' },
    { id: 'image-to-image', icon: ImageIcon, label: '图生图', href: '/image-to-image' }
  ];

  return (
    <aside className='fixed top-14 left-0 bottom-0 w-25 bg-[#24222D] border-r border-gray-700 z-40 flex flex-col'>
      <nav className='flex-grow pt-10 space-y-1'>
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 transition-colors',
                isActive
                  ? 'bg-[#32303F] text-[#E54369] border-l-2 border-[#E54369]'
                  : 'text-gray-300 hover:bg-[#383842] hover:text-white'
              )}
            >
              <item.icon className='w-4 h-4' />
              <span className='text-xs'>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {/* <div className='p-4 border-t border-gray-700'>
        <Link
          href='#'
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-[#383842] hover:text-white transition-colors'
        >
          <Settings className='w-5 h-5' />
          <span className='text-sm font-medium'>设置</span>
        </Link>
      </div> */}
    </aside>
  );
}

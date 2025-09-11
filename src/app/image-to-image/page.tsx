import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ImageToImage() {
  return (
    <div className='min-h-screen bg-gray-900'>
      <Sidebar />
      <div className='ml-72'>
        <Header />

        <main className='flex items-center justify-center h-[calc(100vh-56px)]'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold text-white mb-4'>图生图功能</h1>
            <p className='text-gray-400 mb-8'>该功能正在开发中，敬请期待...</p>
            <div className='w-24 h-24 bg-gray-700 rounded-lg mx-auto flex items-center justify-center'>
              <span className='text-gray-500 text-4xl'>🚧</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * 媒体文件下载工具类
 * 提供通用的图片和视频下载功能
 */

/**
 * 直接使用a标签下载图片（不使用fetch）
 * @param imageUrl - 图片URL
 * @param fileName - 文件名（可选）
 * @returns Promise<void>
 */
export const downloadImageDirect = async (imageUrl: string, fileName?: string): Promise<void> => {
  try {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const finalFileName = fileName || `ai-image-${timestamp}.jpg`;

    // 方法1: 直接创建a标签下载
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = finalFileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // 添加到DOM并触发点击
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('尝试直接下载:', imageUrl);
  } catch (error) {
    console.error('直接下载失败:', error);
    throw error;
  }
};

/**
 * 使用iframe触发下载
 * @param imageUrl - 图片URL
 * @returns Promise<void>
 */
export const downloadImageViaIframe = async (imageUrl: string): Promise<void> => {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = imageUrl;

    document.body.appendChild(iframe);

    // 延迟移除iframe
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);

    console.log('尝试iframe下载:', imageUrl);
  } catch (error) {
    console.error('iframe下载失败:', error);
    throw error;
  }
};

/**
 * 在新窗口打开图片（作为下载的fallback）
 * @param imageUrl - 图片URL
 * @returns Promise<void>
 */
export const openImageInNewWindow = async (imageUrl: string): Promise<void> => {
  try {
    const newWindow = window.open(imageUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      throw new Error('弹窗被阻止，请允许弹窗后重试');
    }
    console.log('在新窗口打开图片:', imageUrl);
  } catch (error) {
    console.error('新窗口打开失败:', error);
    throw error;
  }
};

/**
 * 智能下载图片 - 尝试多种方法
 * @param imageUrl - 图片URL
 * @param fileName - 文件名（可选）
 * @returns Promise<void>
 */
export const downloadImageSmart = async (imageUrl: string, fileName?: string): Promise<void> => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const finalFileName = fileName || `ai-image-${timestamp}.jpg`;

  try {
    // 方法1: 尝试直接下载
    console.log('尝试方法1: 直接下载');
    await downloadImageDirect(imageUrl, finalFileName);

    // 等待一下看是否成功
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  } catch (error) {
    console.warn('方法1失败:', error);
  }

  try {
    // 方法2: 尝试iframe下载
    console.log('尝试方法2: iframe下载');
    await downloadImageViaIframe(imageUrl);

    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  } catch (error) {
    console.warn('方法2失败:', error);
  }

  try {
    // 方法3: 在新窗口打开（用户可以右键保存）
    console.log('尝试方法3: 新窗口打开');
    await openImageInNewWindow(imageUrl);
    return;
  } catch (error) {
    console.warn('方法3失败:', error);
  }

  throw new Error('所有下载方法都失败了，请手动复制链接下载');
};

/**
 * 原有的fetch下载方法（保留作为备选）
 * @param imageUrl - 图片URL
 * @param fileName - 文件名（可选）
 * @returns Promise<void>
 */
export const downloadImage = async (imageUrl: string, fileName?: string): Promise<void> => {
  try {
    // 获取图片数据
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 设置文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = fileName || `ai-image-${timestamp}.jpg`;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载图片失败:', error);
    throw error;
  }
};

/**
 * 批量下载图片
 * @param images - 图片数组 {id: number, src: string, alt?: string}[]
 * @param onProgress - 进度回调函数 (current: number, total: number) => void
 */
export const downloadImages = async (
  images: Array<{ id: number; src: string; alt?: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const total = images.length;

  for (let i = 0; i < total; i++) {
    const image = images[i];
    try {
      await downloadImage(image.src, `ai-image-${image.id}-${Date.now()}.jpg`);
      onProgress?.(i + 1, total);
    } catch (error) {
      console.error(`下载图片 ${image.id} 失败:`, error);
      // 继续下载下一张图片
    }
  }
};

/**
 * 获取当前显示图片的下载函数
 * @param images - 图片数组
 * @param currentIndex - 当前显示的图片索引
 */
export const downloadCurrentImage = async (
  images: Array<{ id: number; src: string; alt?: string }>,
  currentIndex: number
): Promise<void> => {
  if (currentIndex >= 0 && currentIndex < images.length) {
    const currentImage = images[currentIndex];
    await downloadImage(currentImage.src, `ai-image-${currentImage.id}-${Date.now()}.jpg`);
  }
};

/**
 * 下载视频到本地
 * @param videoUrl - 视频URL
 * @param fileName - 文件名（可选）
 * @returns Promise<void>
 */
export const downloadVideo = async (videoUrl: string, fileName?: string): Promise<void> => {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = videoUrl;

    // 设置文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    link.download = fileName || `ai-video-${timestamp}.mp4`;
    link.target = '_blank';

    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('下载视频失败:', error);
    throw error;
  }
};

/**
 * 批量下载视频
 * @param videos - 视频数组 {id: number, src: string}[]
 * @param onProgress - 进度回调函数 (current: number, total: number) => void
 */
export const downloadVideos = async (
  videos: Array<{ id: number; src: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const total = videos.length;

  for (let i = 0; i < total; i++) {
    const video = videos[i];
    try {
      await downloadVideo(video.src, `ai-video-${video.id}-${Date.now()}.mp4`);
      onProgress?.(i + 1, total);

      // 添加延迟避免浏览器阻止多个下载
      if (i < total - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`下载视频 ${video.id} 失败:`, error);
      // 继续下载下一个视频
    }
  }
};

/**
 * 获取当前显示视频的下载函数
 * @param videos - 视频数组
 * @param currentIndex - 当前显示的视频索引
 */
export const downloadCurrentVideo = async (
  videos: Array<{ id: number; src: string }>,
  currentIndex: number
): Promise<void> => {
  if (currentIndex >= 0 && currentIndex < videos.length) {
    const currentVideo = videos[currentIndex];
    await downloadVideo(currentVideo.src, `ai-video-${currentVideo.id}-${Date.now()}.mp4`);
  }
};

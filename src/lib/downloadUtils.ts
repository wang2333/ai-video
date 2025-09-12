/**
 * 媒体文件下载工具类
 * 提供通用的图片和视频下载功能
 */

/**
 * 下载图片到本地
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

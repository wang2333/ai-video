import { useState, useCallback } from 'react';

// 动态导入七牛云客户端SDK，避免SSR问题
let qiniuClient: any = null;

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface VideoFile {
  id: string;
  file: File;
  url: string; // 本地预览URL
  name: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  uploadUrl?: string; // 七牛云URL
}

export interface UseVideoUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (uploadUrl: string) => void;
  onError?: (error: string) => void;
}

export interface UseVideoUploadReturn {
  uploadedVideo: VideoFile | null;
  isUploading: boolean;
  error: string | null;
  uploadProgress: UploadProgress | null;
  handleFileSelect: (file: File) => Promise<void>;
  removeVideo: () => void;
}

/**
 * 七牛云视频上传Hook
 * 统一处理视频文件选择、验证、上传的完整流程
 */
export function useVideoUpload(options: UseVideoUploadOptions = {}): UseVideoUploadReturn {
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  /**
   * 验证视频文件
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('video/')) {
      return '请选择视频文件';
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return '文件大小不能超过500MB';
    }

    return null;
  }, []);

  /**
   * 获取视频元数据
   */
  const getVideoMetadata = useCallback(
    (file: File): Promise<{ width: number; height: number; duration: number }> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          });
        };

        video.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('无法读取视频信息'));
        };

        video.src = url;
      });
    },
    []
  );

  /**
   * 获取七牛云上传凭证
   */
  const getUploadToken = useCallback(async () => {
    const response = await fetch('/api/qiniu/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`获取上传凭证失败: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || '获取上传凭证失败');
    }

    return data.data;
  }, []);

  /**
   * 构建文件访问URL
   */
  const buildFileUrl = useCallback((domain: string, key: string): string => {
    if (!domain || !key) {
      throw new Error('域名或文件key缺失');
    }

    let baseUrl: string;
    if (domain.startsWith('http')) {
      baseUrl = domain;
    } else {
      // 根据当前站点协议选择协议，避免线上 HTTPS 下的混合内容
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      baseUrl = `${isHttps ? 'https' : 'http'}://${domain}`;
    }

    return `${baseUrl}/${key}`;
  }, []);

  /**
   * 动态加载七牛云客户端SDK
   */
  const loadQiniuClient = useCallback(async () => {
    if (qiniuClient) {
      return qiniuClient;
    }

    try {
      qiniuClient = await import('qiniu-js');
      return qiniuClient;
    } catch (error) {
      throw new Error('七牛云SDK加载失败，请检查网络连接');
    }
  }, []);

  /**
   * 上传到七牛云
   */
  const uploadToQiniu = useCallback(
    async (file: File): Promise<string> => {
      // 动态加载七牛云SDK
      const qiniu = await loadQiniuClient();

      // 获取上传凭证
      const tokenData = await getUploadToken();
      const { token, key, domain, zone } = tokenData;

      // 配置上传参数
      const putExtra = {
        fname: file.name,
        params: { 'x:name': file.name }
      };

      // 配置区域映射
      const getQiniuRegion = (zoneCode: string) => {
        if (!qiniu.region) {
          return undefined; // 如果没有region配置，使用默认
        }

        switch (zoneCode) {
          case 'z0':
            return qiniu.region.z0;
          case 'z1':
            return qiniu.region.z1;
          case 'z2':
            return qiniu.region.z2;
          case 'na0':
            return qiniu.region.na0;
          case 'as0':
            return qiniu.region.as0;
          default:
            return qiniu.region.z2;
        }
      };

      const config = {
        useCdnDomain: true,
        region: getQiniuRegion(zone || 'z2')
      };

      // 执行上传
      return new Promise((resolve, reject) => {
        try {
          const observable = qiniu.upload(file, key, token, putExtra, config);

          observable.subscribe({
            next: (result: any) => {
              if (result.total) {
                const progress: UploadProgress = {
                  loaded: result.total.loaded,
                  total: result.total.size,
                  percent: Math.round((result.total.loaded / result.total.size) * 100)
                };
                setUploadProgress(progress);
                options.onProgress?.(progress);
              }
            },
            error: (error: any) => {
              const errorMessage = error?.message || error?.err || '上传失败';
              reject(new Error(errorMessage));
            },
            complete: (result: any) => {
              try {
                const fileUrl = buildFileUrl(domain, result.key);
                resolve(fileUrl);
              } catch (error) {
                reject(error);
              }
            }
          });
        } catch (error) {
          reject(
            new Error(`上传初始化失败: ${error instanceof Error ? error.message : '未知错误'}`)
          );
        }
      });
    },
    [loadQiniuClient, getUploadToken, buildFileUrl, options]
  );

  /**
   * 处理文件选择
   */
  const handleFileSelect = useCallback(
    async (file: File) => {
      // 验证文件
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(null);

      try {
        // 获取视频元数据
        const metadata = await getVideoMetadata(file);

        // 创建本地预览URL
        const localUrl = URL.createObjectURL(file);

        // 上传到七牛云
        const uploadUrl = await uploadToQiniu(file);

        // 创建视频对象
        const videoFile: VideoFile = {
          id: Date.now().toString(),
          file,
          url: localUrl,
          name: file.name,
          size: file.size,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          uploadUrl
        };

        setUploadedVideo(videoFile);
        options.onSuccess?.(uploadUrl);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '上传失败，请重试';
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [validateFile, getVideoMetadata, uploadToQiniu, options]
  );

  /**
   * 移除视频
   */
  const removeVideo = useCallback(() => {
    if (uploadedVideo) {
      URL.revokeObjectURL(uploadedVideo.url);
    }
    setUploadedVideo(null);
    setError(null);
    setUploadProgress(null);
  }, [uploadedVideo]);

  return {
    uploadedVideo,
    isUploading,
    error,
    uploadProgress,
    handleFileSelect,
    removeVideo
  };
}

import { ServiceResult } from './apiService';

// 动态导入七牛云SDK，确保只在服务端环境运行
let qiniu: any = null;

// 在服务端环境中初始化七牛云SDK
const initQiniu = async () => {
  if (typeof window === 'undefined' && !qiniu) {
    qiniu = await import('qiniu');
  }
  return qiniu;
};

/**
 * 七牛云配置接口
 */
export interface QiniuConfig {
  accessKey: string;
  secretKey: string;
  bucket: string;
  domain: string;
  zone?: string;
}

/**
 * 上传凭证接口
 */
export interface UploadToken {
  token: string;
  key?: string;
  expires: number; // 过期时间戳
  domain: string;
  bucket: string;
  zone?: string; // 存储区域
}

/**
 * 上传策略接口
 */
export interface UploadPolicy {
  expires?: number; // 凭证有效期（秒），默认1小时
  fileNamePrefix?: string; // 文件名前缀
  maxFileSize?: number; // 最大文件大小（字节）
  mimeLimit?: string; // MIME类型限制，如 "video/*"
  returnBody?: string; // 自定义回调内容
}

/**
 * 七牛云服务类
 * 提供上传凭证生成和文件管理功能
 */
class QiniuService {
  private config: QiniuConfig;
  private mac: any;

  constructor() {
    // 只在服务端环境初始化
    if (typeof window === 'undefined') {
      this.config = {
        accessKey: process.env.QINIU_ACCESS_KEY || '',
        secretKey: process.env.QINIU_SECRET_KEY || '',
        bucket: process.env.QINIU_BUCKET || '',
        domain: process.env.QINIU_DOMAIN || '',
        zone: process.env.QINIU_ZONE || 'z2'
      };

      // 验证配置
      this.validateConfig();
    } else {
      // 在客户端环境中设置空配置，防止访问错误
      this.config = {} as QiniuConfig;
    }
  }

  /**
   * 验证七牛云配置
   */
  private validateConfig(): void {
    // 只在服务端环境验证
    if (typeof window !== 'undefined') {
      return;
    }

    const requiredFields = ['accessKey', 'secretKey', 'bucket', 'domain'];
    const missingFields = requiredFields.filter(field => !this.config[field as keyof QiniuConfig]);

    if (missingFields.length > 0) {
      throw new Error(`七牛云配置缺失: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 生成文件上传Key（支持自定义前缀和时间戳）
   * @param originalName 原始文件名
   * @param prefix 文件前缀，默认 'videos/'
   * @returns 生成的文件key
   */
  private generateFileKey(originalName: string, prefix: string = 'videos/'): string {
    const timestamp = Date.now();
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    return `${prefix}${fileName}`;
  }

  /**
   * 生成上传凭证
   * @param policy 上传策略
   * @returns Promise<ServiceResult<UploadToken>>
   */
  async generateUploadToken(policy: UploadPolicy = {}): Promise<ServiceResult<UploadToken>> {
    try {
      // 确保在服务端环境运行
      if (typeof window !== 'undefined') {
        throw new Error('此方法只能在服务端环境运行');
      }

      // 动态初始化七牛云SDK
      const qiniuSDK = await initQiniu();
      if (!qiniuSDK) {
        throw new Error('七牛云SDK初始化失败');
      }

      // 延迟初始化MAC验证（如果还没有初始化）
      if (!this.mac) {
        this.mac = new qiniuSDK.auth.digest.Mac(this.config.accessKey, this.config.secretKey);
      }
      // 设置默认策略
      const defaultPolicy = {
        expires: 3600, // 1小时
        fileNamePrefix: 'videos/',
        maxFileSize: 500 * 1024 * 1024, // 500MB
        mimeLimit: 'video/*',
        ...policy
      };

      // 生成文件key（如果没有指定）
      const fileKey = policy.fileNamePrefix
        ? this.generateFileKey('video.mp4', defaultPolicy.fileNamePrefix)
        : this.generateFileKey('video.mp4');

      // 构建上传策略
      const putPolicy = new qiniuSDK.rs.PutPolicy({
        scope: `${this.config.bucket}:${fileKey}`,
        expires: Math.floor(Date.now() / 1000) + defaultPolicy.expires,
        fsizeLimit: defaultPolicy.maxFileSize,
        mimeLimit: defaultPolicy.mimeLimit,
        returnBody:
          defaultPolicy.returnBody ||
          JSON.stringify({
            key: '$(key)',
            hash: '$(etag)',
            fsize: '$(fsize)',
            bucket: '$(bucket)',
            name: '$(x:name)'
          })
      });

      // 生成上传凭证
      const uploadToken = putPolicy.uploadToken(this.mac);
      const expiresAt = Math.floor(Date.now() / 1000) + defaultPolicy.expires;

      return {
        success: true,
        data: {
          token: uploadToken,
          key: fileKey,
          expires: expiresAt,
          domain: this.config.domain,
          bucket: this.config.bucket,
          zone: this.config.zone // 返回存储区域信息
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成上传凭证失败'
      };
    }
  }

  /**
   * 删除文件
   * @param key 文件key
   * @returns Promise<ServiceResult<void>>
   */
  async deleteFile(key: string): Promise<ServiceResult<void>> {
    try {
      // 确保在服务端环境运行
      if (typeof window !== 'undefined') {
        throw new Error('此方法只能在服务端环境运行');
      }

      // 动态初始化七牛云SDK
      const qiniuSDK = await initQiniu();
      if (!qiniuSDK) {
        throw new Error('七牛云SDK初始化失败');
      }
      // 延迟初始化MAC验证（如果还没有初始化）
      if (!this.mac) {
        this.mac = new qiniuSDK.auth.digest.Mac(this.config.accessKey, this.config.secretKey);
      }

      const bucketManager = new qiniuSDK.rs.BucketManager(this.mac, this.getQiniuConfig(qiniuSDK));

      return new Promise(resolve => {
        bucketManager.delete(this.config.bucket, key, (err, respBody, respInfo) => {
          if (err) {
            resolve({
              success: false,
              error: err.message
            });
          } else if (respInfo.statusCode === 200) {
            resolve({
              success: true,
              data: undefined
            });
          } else {
            resolve({
              success: false,
              error: `删除失败: ${respInfo.statusCode}`
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除文件失败'
      };
    }
  }

  /**
   * 获取七牛云配置对象
   */
  private getQiniuConfig(qiniuSDK: any): any {
    const config = new qiniuSDK.conf.Config();

    // 安全地设置存储区域，添加错误处理
    try {
      if (qiniuSDK.zone && typeof qiniuSDK.zone === 'object') {
        switch (this.config.zone) {
          case 'z1':
            config.zone = qiniuSDK.zone.Zone_z1;
            break;
          case 'z2':
            config.zone = qiniuSDK.zone.Zone_z2;
            break;
          case 'na0':
            config.zone = qiniuSDK.zone.Zone_na0;
            break;
          case 'as0':
            config.zone = qiniuSDK.zone.Zone_as0;
            break;
          default:
            config.zone = qiniuSDK.zone.Zone_z0;
        }
      } else {
        console.warn('七牛云SDK zone对象未找到，使用默认配置');
        // 如果zone对象不可用，保持默认配置
      }
    } catch (error) {
      console.warn('设置七牛云存储区域失败，使用默认配置:', error);
      // 发生错误时使用默认配置，不影响上传功能
    }

    return config;
  }

  /**
   * 构建完整的文件URL
   * @param key 文件key
   * @returns 完整的文件URL
   */
  getFileUrl(key: string): string {
    if (!this.config || !this.config.domain) {
      return key; // 在客户端环境直接返回key
    }

    let domain: string;
    if (this.config.domain.startsWith('http')) {
      domain = this.config.domain;
    } else {
      // 检测是否为七牛云测试域名，测试域名通常不支持HTTPS
      const isTestDomain =
        this.config.domain.includes('clouddn.com') ||
        this.config.domain.includes('qiniudn.com') ||
        this.config.domain.includes('bkt.clouddn.com');

      if (isTestDomain) {
        domain = `http://${this.config.domain}`;
      } else {
        domain = `https://${this.config.domain}`;
      }
    }

    return `${domain}/${key}`;
  }

  /**
   * 获取当前配置信息（不包含密钥）
   */
  getConfigInfo() {
    // 只在服务端环境返回配置信息
    if (typeof window !== 'undefined') {
      return {};
    }

    return {
      bucket: this.config?.bucket,
      domain: this.config?.domain,
      zone: this.config?.zone
    };
  }
}

// 导出单例实例
export const qiniuService = new QiniuService();

// 导出便捷方法
export const generateUploadToken = (policy?: UploadPolicy) =>
  qiniuService.generateUploadToken(policy);

export const deleteQiniuFile = (key: string) => qiniuService.deleteFile(key);

export const getQiniuFileUrl = (key: string) => qiniuService.getFileUrl(key);

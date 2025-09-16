import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dashscope-result-*.oss-*.aliyuncs.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.pollo.ai'
      },
      {
        protocol: 'https',
        hostname: 'videocdn.pollo.ai'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // 在客户端构建时排除七牛云服务端SDK及其依赖
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        util: false,
        buffer: false,
        events: false,
        'proxy-agent': false,
        'https-proxy-agent': false,
        'http-proxy-agent': false,
        'pac-proxy-agent': false,
        'socks-proxy-agent': false,
        urllib: false
      };

      // 排除七牛云服务端包及其依赖在客户端的使用
      config.externals = config.externals || [];
      config.externals.push({
        qiniu: 'qiniu',
        crypto: 'crypto',
        urllib: 'urllib',
        'proxy-agent': 'proxy-agent'
      });

      // 使用 NormalModuleReplacementPlugin 替换有问题的模块
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^proxy-agent$/,
          'data:text/javascript,module.exports = {}'
        )
      );

      // 添加模块规则来忽略特定的导入
      config.module.rules.push({
        test: /node_modules\/(urllib|qiniu)/,
        use: 'null-loader'
      });
    }

    return config;
  }
};

export default nextConfig;

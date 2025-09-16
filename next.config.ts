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
  webpack: (config, { isServer, webpack }) => {
    // 基础模块忽略配置（适用于客户端和服务端）
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(coffee-script|coffeescript|vm2)$/
      })
    );

    // 忽略 vm2 内部的 coffee-script 依赖
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(coffee-script|coffeescript)$/,
        contextRegExp: /vm2/
      })
    );

    // 完全忽略 vm2 模块及其所有内容
    config.module.rules.push({
      test: /vm2/,
      use: 'null-loader'
    });

    // 针对客户端的额外配置
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
        child_process: false,
        vm: false,
        vm2: false,
        'coffee-script': false,
        coffeescript: false,
        'proxy-agent': false,
        'https-proxy-agent': false,
        'http-proxy-agent': false,
        'pac-proxy-agent': false,
        'socks-proxy-agent': false,
        urllib: false
      };

      // 客户端外部化服务端依赖
      config.externals = config.externals || [];
      config.externals.push({
        qiniu: 'qiniu',
        crypto: 'crypto',
        urllib: 'urllib',
        'proxy-agent': 'proxy-agent',
        vm2: 'vm2',
        'coffee-script': 'coffee-script',
        coffeescript: 'coffeescript'
      });
    }

    return config;
  }
};

export default nextConfig;

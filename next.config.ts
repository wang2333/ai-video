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
    // 在客户端构建时排除服务端依赖
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
        urllib: false,
        // 添加更多Node.js核心模块的fallback
        child_process: false,
        vm: false,
        vm2: false,
        'coffee-script': false,
        coffeescript: false
      };

      // 排除服务端包在客户端的使用
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

      // 使用 NormalModuleReplacementPlugin 替换有问题的模块
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^(proxy-agent|vm2|coffee-script|coffeescript)$/,
          'data:text/javascript,module.exports = {}'
        )
      );

      // 忽略特定模块的依赖
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(coffee-script|coffeescript|vm2)$/
        })
      );

      // 添加模块规则来处理有问题的依赖
      config.module.rules.push({
        test: /node_modules\/(urllib|qiniu|vm2|proxy-agent)/,
        use: 'null-loader'
      });

      // 专门处理vm2模块中的coffee-script依赖
      config.module.rules.push({
        test: /node_modules\/vm2.*\.js$/,
        use: [
          {
            loader: 'string-replace-loader',
            options: {
              search: /require\(['"]coffee-script['"]\)/g,
              replace: 'null'
            }
          }
        ]
      });
    }

    return config;
  }
};

export default nextConfig;

/**
 * vue.config
 */

const OS = require('os');
const Path = require('path');
const _ = require('lodash');
const HappyPack = require('happypack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const happyThreadPool = HappyPack.ThreadPool({ size: OS.cpus().length });

const buildOptions = {
  analyzer: true,
  speedMeasure: true,
  splitChunks: {
    axios: /[\\/]node_modules[\\/]_?axios(.*)/,
    crypto: /[\\/]node_modules[\\/]_?crypto-js(.*)/,
    cookie: /[\\/]node_modules[\\/]_?js-cookie(.*)/,
    vue: /[\\/]node_modules[\\/]_?vue(.*)/,
    vuex: /[\\/]node_modules[\\/]_?vuex(.*)/,
    elementUI: /[\\/]node_modules[\\/]_?elementUI(.*)/,
    i18n: /[\\/]node_modules[\\/]_?vue-i18n(.*)/
  }
};

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  pages: {
    index: {
      entry: './src/main.ts',
      template: './src/client/index.html'
    }
  },
  devServer: {
    host: 'localhost',
    port: 8080,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    progress: false,
    proxy: {
      '/salesSystem': {
        // target: 'http://192.168.8.166:8182',
        // target: 'http://192.168.8.233:8080/',
        // target: 'http://192.168.8.3:8080/',
        // target: 'http://192.168.8.173:8182/',
        target: 'http://test.sales.muyuhuajiaoyu.com/',
        changeOrigin: true,
        pathRewrite: {
          // '^/salesSystem': ''
        }
      }
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        Path.resolve(__dirname, 'src/styles/_variables.scss'),
        Path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  transpileDependencies: [/\bvue-awesome\b/],
  configureWebpack: (config) => {
    // 开发环境、测试环境
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'cheap-module-eval-source-map';
      config.output.devtoolFallbackModuleFilenameTemplate = 'webpack:///[resource-path]?[hash]';
      config.output.devtoolModuleFilenameTemplate = (info) => {
        const isJs = info.resourcePath.match(/\.js$/);
        const isTs = info.resourcePath.match(/\.ts$/);
        const isVue = info.resourcePath.match(/\.vue$/);
        const isScript = info.identifier.match(/type=script/);
        // 简化路径
        const resourcePath = info.resourcePath.replace(/^.\/src\//g, '').replace(/^.\//g, '');
        return isJs || isTs || (isVue && isScript)
          ? `webpack-generated:///${resourcePath}`
          : config.output.devtoolFallbackModuleFilenameTemplate;
      };
    } else {
      if (buildOptions.analyzer) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            analyzerHost: '127.0.0.1',
            analyzerPort: 9018,
            reportFilename: '_BundleAnalyzerPlugin.html',
            defaultSizes: 'parsed',
            openAnalyzer: false,
            generateStatsFile: false,
            statsFilename: 'stats.json',
            logLevel: 'info'
          })
        );
      }
    }

    config.performance = _.merge(config.performance, {
      hints: 'warning',
      maxEntrypointSize: 2 * 1024 * 1024 * 1024,
      maxAssetSize: 2 * 1024 * 1024 * 1024
    });

    config.plugins.push(new LodashModuleReplacementPlugin());

    config.plugins.push(
      new HappyPack({
        id: 'js',
        threadPool: happyThreadPool,
        loaders: [
          {
            loader: 'babel-loader'
          }
        ],
        verbose: false
      })
    );

    config.plugins.push(
      new HappyPack({
        id: 'ts',
        threadPool: happyThreadPool,
        loaders: [
          {
            loader: 'ts-loader',
            options: {
              // 禁用 Typescript 类型检查，只做转译，仅删除掉类型注释，可提升编译速度
              transpileOnly: true,
              experimentalWatchApi: true,
              // 使用 happyPackMode 模式加速编译，并减少 Webpack 报告的错误
              happyPackMode: true,
              // tsconfig.json 文件路径
              configFile: 'tsconfig.json'
            }
          }
        ],
        verbose: false
      })
    );
  },
  chainWebpack(config) {
    config.set('name', '');

    config.when(process.env.NODE_ENV !== 'development', (config) => {
      config.optimization.splitChunks({
        // 选择哪些块进行优化。如果提供一个字符串，可能的值是 initial(初始块)、async(按需加载块)、all(默认，全部块)。提供all可以特别强大，因为这意味着即使在异步和非异步块之间也可以共享块。
        chunks: 'all',
        // 要生成的块的最小大小（以字节为单位）
        minSize: 10 * 1024,
        maxSize: 0,
        // 分割前必须共享模块的最小块数
        minChunks: 2,
        // 按需加载时的最大并行请求数
        maxAsyncRequests: 8,
        // 入口点处的最大并行请求数
        maxInitialRequests: 6,
        // 打包分隔符，若改为'-'则分离后的js默认命名规则为[来源]-[入口key].js
        automaticNameDelimiter: '~',
        // 拆分块的名称，此选项可接受函数，默认true,,由chunk和hash值自动生成，
        // 当存在匹配的缓存组时，命名使用缓存组中的name值，若不在则为[来源]~[入口key].js
        name: true,
        cacheGroups: _.merge(
          {
            // 抽取 node_modules 中的第三方库
            lib: {
              name: 'pkgs',
              // 优先抽取出 node_modules 模块，无论其是否为公有代码
              minChunks: 1,
              // 缓存组优先级，当需要优先匹配缓存组的规则时，priority需要设置为正数，当需要优先匹配默认设置时，缓存组需设置为负数，0为两者分割线
              priority: -10,
              // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
              reuseExistingChunk: true,
              // 正则规则验证，如符合就提取chunk放入当前缓存组，值可以是function、boolean、string、RegExp，默认为空
              test: /[\\/]node_modules[\\/]/
            },
            default: {
              priority: -20,
              reuseExistingChunk: true
            }
          },
          (function () {
            // 将指定的 package 拆分为独立的块
            const groups = {};
            let priority = 10;
            Object.keys(buildOptions.splitChunks).forEach(function (name) {
              const test = buildOptions.splitChunks[name];
              groups[name] = {
                name: 'pkg-' + name,
                test,
                chunks: 'all',
                maxAsyncRequests: 10,
                maxInitialRequests: 10,
                minChunks: 1,
                priority: priority
              };
              priority++;
            });
            return groups;
          })()
        )
      });
      config.optimization.runtimeChunk('single');
    });

    const jsRule = config.module.rule('js');
    jsRule.uses.clear();
    jsRule.use('happypack/loader?id=js').loader('happypack/loader?id=js').end();

    const tsRule = config.module.rule('ts');
    tsRule.uses.clear();
    tsRule.use('happypack/loader?id=ts').loader('happypack/loader?id=ts').end();
  },
  css: {
    extract: {
      // 禁用样式加载顺序的警告
      ignoreOrder: true
    }
  }
};

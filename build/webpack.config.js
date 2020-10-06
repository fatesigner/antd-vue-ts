/**
 * webpack.config
 */

const OS = require('os');
const _ = require('lodash');
const Path = require('path');
const Webpack = require('webpack');
const HappyPack = require('happypack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackThemeColorReplacer = require('webpack-theme-color-replacer');
const happyThreadPool = HappyPack.ThreadPool({ size: OS.cpus().length });
const IgnoreNotFoundExportPlugin = require('./webpack-ignorenotfoundexport-plugin');
const WebpackHtmlEmbedSourcePlugin = require('./webpack-html-embed-source-plugin');

const Utils = require('./utils');
const GetLoaders = require('./webpack.loaders');

exports.chainWebpack = function (config) {
  const ENV = require('./env')();
  const loaders = require('./webpack.loaders')();

  // 设置 index.html
  config.plugin('html').tap((args) => {
    args[0].template = ENV.buildOptions.template;
    // 设置网页标题
    args[0].title = ENV.buildOptions.title;
    // 设置网页地址
    args[0].url = ENV.buildOptions.url;
    return args;
  });

  config.plugin('prefetch').tap((args) => {
    args[0].include = 'asyncChunks';
    args[0].fileBlacklist = args[0].fileBlacklist || [];
    args[0].fileBlacklist = args[0].fileBlacklist.concat(ENV.buildOptions.plugin.WebpackHtmlEmbedSourcePlugin.tests);
    args[0].as = (entry) => {
      if (/\.css$/.test(entry)) return 'style';
      if (/\.woff$/.test(entry)) return 'font';
      if (/\.png$/.test(entry)) return 'image';
      return 'script';
    };
    return args;
  });

  config.plugin('preload').tap((args) => {
    args[0].include = 'initial';
    args[0].fileBlacklist = args[0].fileBlacklist.concat(ENV.buildOptions.plugin.WebpackHtmlEmbedSourcePlugin.tests);
    args[0].as = (entry) => {
      if (/\.css$/.test(entry)) return 'style';
      if (/\.woff$/.test(entry)) return 'font';
      if (/\.png$/.test(entry)) return 'image';
      return 'script';
    };
    return args;
  });

  // config.plugins.delete('preload');
  // 移动端场景考虑用户流量，可将 prefetch 关闭
  config.plugins.delete('prefetch');

  // 为指定的模块分包
  config.when(true, (config) => {
    config.optimization.runtimeChunk('single');
    config.optimization.splitChunks({
      // 分割参数权重排序 maxInitialRequest < maxAsyncRequests < maxSize < minSize
      // 选择哪些块进行优化。如果提供一个字符串，可能的值是 initial(初始块)、async(按需加载块)、all(默认，全部块)。
      // 提供 all 更强大，因为这意味着即使在异步和非异步块之间也可以共享块。
      chunks: 'all',
      // 被拆分的 chunk 的最小大小（byte），小于该值的 chunk 不会被拆分（对于按需引入的 chunk 无效，因为无论在什么情况下，按需引入的部分都会被拆分出来）
      minSize: 2 * 1024,
      // 被拆分的 chunk 的最大大小（byte），大于该值的 chunk 将会被拆分成更小的部分
      // maxSize: 100 * 1024,
      // 分割前必须共享模块的最小块数
      minChunks: 2,
      // 按需加载时的最大并行请求数
      maxAsyncRequests: 20,
      // 入口点处的最大并行请求数
      maxInitialRequests: 20,
      // 打包分隔符，若改为'-'则分离后的js默认命名规则为[来源]-[入口key].js
      automaticNameDelimiter: ENV.buildOptions.automaticNameDelimiter,
      // 拆分块的名称，此选项可接受函数，默认 true,,由 chunk和 hash 值自动生成，
      // 当存在匹配的缓存组时，命名使用缓存组中的 name 值，若不在则为[来源]~[入口key].js
      name: true,
      cacheGroups: {
        // 抽取 node_modules 中的第三方库
        packg: {
          chunks: 'initial',
          enforce: true,
          // 优先抽取出 node_modules 模块，无论其是否为公有代码
          minChunks: 1,
          minSize: 5 * 1024,
          maxSize: 30 * 1024,
          // 缓存组优先级，当需要优先匹配缓存组的规则时，priority需要设置为正数，当需要优先匹配默认设置时，缓存组需设置为负数，0为两者分割线
          priority: -10,
          // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
          reuseExistingChunk: true,
          // 正则规则验证，如符合就提取chunk放入当前缓存组，值可以是function、boolean、string、RegExp，默认为空
          test: /[\\/]node_modules[\\/]/
        },
        // vendors: false,
        default: false
      }
    });
  });

  // 添加 happypack 以提升 webpack 编译速度
  const jsRule = config.module.rule('js');
  const tsRule = config.module.rule('ts');
  const tsxRule = config.module.rule('tsx');
  // const imagesRule = config.module.rule('images');

  // 移除 VueCLI 自带的 rule
  // config.module.rule('svg').uses.clear();
  // config.module.rule('media').uses.clear();
  // config.module.rule('fonts').uses.clear();
  // config.module.rule('pug').uses.clear();
  jsRule.uses.clear();
  tsRule.uses.clear();
  tsxRule.uses.clear();
  // imagesRule.uses.clear();

  jsRule.exclude
    .add(/\bcore-js\b/)
    .add(/\bwebpack\/buildin\b/)
    .add(/@babel\/runtime-corejs3/)
    .end();

  jsRule
    .test(/\.js(x)?$/)
    .use('happypack/loader?id=js')
    .loader('happypack/loader?id=js')
    .end();

  tsRule
    .test(/\.ts(x)?$/)
    .use('happypack/loader?id=js')
    .loader('happypack/loader?id=js')
    .end()
    .use('happypack/loader?id=ts')
    .loader('happypack/loader?id=ts')
    .end()
    .use('happypack/loader?id=ui-component')
    .loader('happypack/loader?id=ui-component')
    .end();

  // image-webpack-loader
  /* imagesRule
    .test(/\.(png|jpe?g|gif|svg|ico)(\?.*)?$/)
    .use('url-loader')
    .loader('url-loader')
    .options(loaders.url)
    .end()
    .use('image-webpack-loader')
    .loader('image-webpack-loader')
    .options(loaders.image)
    .end(); */

  config.plugin('IgnoreNotFoundExportPlugin').before('friendly-errors').use(IgnoreNotFoundExportPlugin);
};

exports.configureWebpack = function (config) {
  const ENV = require('./env')();
  const loaders = GetLoaders();

  config.resolve.alias = {
    // 优化 ant design icons
    '@ant-design/icons/lib/dist$': Path.resolve(__dirname, '../src/lib/antdv-ui/icons.js')
  };

  // 开发环境、测试环境
  config.entry = {
    [ENV.buildOptions.entryName]: ENV.buildOptions.entry
  };

  if (process.env.NODE_ENV !== 'production') {
    config.devtool = 'cheap-module-eval-source-map';
    config.output.devtoolFallbackModuleFilenameTemplate = 'webpack:///[resource-path]?[hash]';
    config.output.devtoolModuleFilenameTemplate = (info) => {
      const isJs = /\.js(x)?$/.test(info.resource);
      const isTs = /\.ts(x)?$/.test(info.resource);
      const isVue = /\.vue/.test(info.resource);
      const isScript = /type=script/.test(info.resource);
      // 简化路径
      const resourcePath = info.resourcePath.replace(/^.\/src\//g, '').replace(/^.\//g, '');
      if (isJs || isTs || (isVue && isScript) || (isVue && info.resource === info.resourcePath)) {
        return `webpack-generated:///${resourcePath}`;
      } else {
        return `webpack-vue:///${resourcePath}?${info.hash}`;
      }
    };
  }

  // 解决 webpack v4 动态导入的报错
  config.output.jsonpFunction = 'jsonpFunction';

  config.performance = _.merge(config.performance, {
    hints: 'warning',
    maxEntrypointSize: 2 * 1024 * 1024 * 1024,
    maxAssetSize: 2 * 1024 * 1024 * 1024
  });

  config.plugins.push(new WebpackHtmlEmbedSourcePlugin(ENV.buildOptions.plugin.WebpackHtmlEmbedSourcePlugin));

  config.plugins.push(new CopyWebpackPlugin(ENV.buildOptions.plugin.CopyWebpackPlugin));

  // 添加 happypack 以提升 webpack 编译速度
  config.plugins = config.plugins.concat([
    new HappyPack({
      id: 'js',
      threadPool: happyThreadPool,
      loaders: [
        {
          loader: 'babel-loader',
          options: loaders.babel
        }
      ],
      verbose: false
    }),
    new HappyPack({
      id: 'ts',
      threadPool: happyThreadPool,
      loaders: [
        {
          loader: 'ts-loader',
          options: _.merge({}, loaders.ts, {
            appendTsSuffixTo: [/\.vue$/],
            appendTsxSuffixTo: [/\.vue$/]
          })
        }
      ],
      verbose: false
    }),
    new HappyPack({
      id: 'ui-component',
      threadPool: happyThreadPool,
      loaders: [
        {
          loader: 'ui-component-loader',
          options: loaders.uiComponent
        }
      ],
      verbose: false
    })
  ]);

  // 生成 manifest json
  config.plugins.push(new ManifestPlugin());

  // 排除 moment.js 的 locale 文件，以减少生成的包体积
  config.plugins.push(new Webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

  // 添加一键换肤插件
  const { getSerials, changeSelector } = require('../src/lib/antdv-ui/utils/theme');
  config.plugins.push(
    new WebpackThemeColorReplacer({
      filename: `css/theme-colors${
        process.env.NODE_ENV === 'production' ? '.[contenthash:' + ENV.buildOptions.hash.length + ']' : ''
      }.css`,
      matchColors: getSerials('#1890ff'),
      changeSelector: changeSelector
    })
  );

  // 代码混淆、压缩
  if (process.env.NODE_ENV === 'production') {
    config.optimization.minimizer.splice(
      0,
      1,
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          // ecma: 8,
          warnings: false,
          parse: {},
          sourceMap: false,
          cache: true,
          parallel: true,
          // 若为 true，将会生成一个 app.js.LICENSE.txt 文件，以存储特定格式的注释，规避法律问题
          extractComments: true,
          output: {
            // 美化输出
            beautify: false,
            // 是否保留注释 默认为 true
            comments: false,
            quote_keys: false,
            quote_style: 1
          },
          compress: {
            arrows: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,
            booleans: true,
            if_return: true,
            sequences: true,
            unused: true,
            conditionals: true,
            dead_code: true,
            evaluate: true
          }
        }
      })
    );
  }

  // 优化并缩短 cacheGroups 生成的块名，替换为指定的名称+hash字符串
  const pluginOptions = {
    name: 'SplitChunkNamedPlugin',
    stage: Infinity
  };
  config.plugins.push({
    apply: (compiler) => {
      compiler.hooks.thisCompilation.tap(pluginOptions, (compilation) => {
        compilation.hooks.optimizeChunksAdvanced.tap(pluginOptions, () => {
          const hashSeen = new Set();
          compilation.chunks.forEach(function (chunk) {
            if (chunk.name) {
              if (chunk.name !== ENV.buildOptions.entryName) {
                const chunks = chunk.name.split(ENV.buildOptions.automaticNameDelimiter);
                if (chunks.length > 1) {
                  const group = chunks[0];
                  chunk.name = `${group}-${Utils.HashChunk(chunk.name, hashSeen)}`;
                }
              }
            }
          });
        });
      });
    }
  });
};

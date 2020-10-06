/**
 * webpack.loaders
 */

const Fs = require('fs-extra');
const Path = require('path');
const FindConfig = require('find-config');

const Utils = require('./utils');

const pathHashSeen = new Set();

module.exports = function () {
  const ENV = require('./env')();
  const isProd = Utils.IsProd();

  return {
    css: {
      importLoaders: 0,
      modules: {
        localIdentContext: ENV.srcPath,
        localIdentName: '[name]-[local]_[hash:base64:5]',
        exportLocalsConvention: 'camelCase'
      },
      sourceMap: !isProd
    },
    sass: {
      implementation: require('sass'),
      sourceMap: !isProd,
      sassOptions: {
        includePaths: ['node_modules']
      }
    },
    postcss: (function () {
      // 读取当前项目中的 PostCSS Config
      const _p = FindConfig('postcss.config.js');
      const _r = {
        sourceMap: !isProd
      };
      if (!_p) {
        _r.config = {
          // 指定查找路径以设置默认 PostCSS Config
          path: ENV.rootPath
        };
      }
      return _r;
    })(),
    babel: (function () {
      // 顺序读取目录中的 babel.config.js .babelrc 文件
      let _p = FindConfig('babel.config.js');
      let _r;
      if (_p) {
        _r = require(_p);
      } else {
        _p = FindConfig('.babelrc');
        if (_p) {
          _r = Fs.readFileSync(_p, 'utf8');
          _r = JSON.parse(_r);
        } else {
          _r = {};
        }
      }
      return _r;
    })(),
    image: {
      test: (function () {
        return new RegExp(`\\.(${['gif', 'jpg', 'jpeg', 'png', 'ico'].join('|')})\\??.*$`);
      })(),
      // test: ['gif', 'jpg', 'jpeg', 'png', 'ico'],
      mozjpeg: {
        quality: 65,
        progressive: true
      },
      gifsicle: {
        interlaced: false
      },
      // optipng.enabled: false will disable optipng
      optipng: {
        enabled: true,
        optimizationLevel: 7
      },
      pngquant: {
        quality: [0.65, 0.9],
        speed: 4
      },
      // the webp option will enable WEBP
      webp: {
        quality: 75
      }
    },
    ts: {
      // 禁用 Typescript 类型检查，只做转译，仅删除掉类型注释，可提升编译速度
      transpileOnly: true,
      experimentalWatchApi: true,
      // 使用 happyPackMode 模式加速编译，并减少 Webpack 报告的错误
      happyPackMode: true,
      // tsconfig.json 文件路径
      configFile: (function () {
        // 读取当前项目中的 tsconfig.json
        let _p = FindConfig('tsconfig.json');
        if (!_p) {
          _p = Path.resolve(__dirname, './tsconfig.json');
        }
        return _p;
      })(),
      appendTsSuffixTo: [/\.vue$/],
      appendTsxSuffixTo: [/\.vue$/]
    },
    uiComponent: {
      lib: 'ant-design-vue',
      libDir: 'es',
      camel2: '-'
    },
    url: {
      esModule: false,
      test: (function () {
        return new RegExp(
          `\\.(${['eot', 'otf', 'svg', 'swf', 'ttf', 'woff', 'woff2', 'xap', 'cur', 'pdf'].join('|')})\\??.*$`
        );
      })(),
      limit: 0,
      /**
       * 将 node_modules 的文件 转移到指定 buildOptions.nodeModulesDirName 目录
       * @param path
       * @returns {string}
       */
      name: (path) => {
        // 正则尾部加上路径分隔符
        let regStr = `^.*?node_modules${Path.sep}`;
        // 替换单反斜杠为两个反斜杠
        regStr = regStr.replace(/\\/g, '\\\\');
        const reg = new RegExp(regStr, 'i');
        if (reg.test(path)) {
          let s = path.replace(reg, '');
          // 替换路径分隔符为单斜杠
          s = s.replace(new RegExp(`${Path.sep.replace(/\\/g, '\\\\')}`, 'g'), '/');
          const packageDir = s.split('/')[0];
          // 将长路径转换成 hash
          const hash_ = Utils.HashChunk(s, pathHashSeen);
          return `${ENV.buildOptions.nodeModulesDirName}/${packageDir}/[name].${hash_}.${
            ENV.buildOptions.hash.enable ? '[hash:' + ENV.buildOptions.hash.length + '].' : ''
          }[ext]`;
        } else {
          // 替换路径分隔符为单斜杠
          const s = path.replace(new RegExp(`${Path.sep.replace(/\\/g, '\\\\')}`, 'g'), '/');
          // 将长路径转换成 hash
          const hash_ = Utils.HashChunk(s, pathHashSeen);
          return `${ENV.buildOptions.assetsDirName}/[name].${hash_}.${
            ENV.buildOptions.hash.enable ? '[hash:' + ENV.buildOptions.hash.length + '].' : ''
          }[ext]`;
        }
      }
    }
  };
};

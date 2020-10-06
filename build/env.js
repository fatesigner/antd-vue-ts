/**
 * global
 */

const Path = require('path');

const Utils = require('./utils');

module.exports = function () {
  const rootPath = Path.resolve(__dirname, '..');
  const buildPath = Path.join(rootPath, 'build');
  const srcPath = Path.join(rootPath, 'src');
  const outputPath = Path.join(rootPath, 'dist');
  const nodeModulesPath = Path.resolve(rootPath, 'node_modules');

  const isProd = Utils.IsProd();

  return {
    rootPath,
    buildPath,
    srcPath,
    outputPath,
    nodeModulesPath,
    buildOptions: {
      // document 标题
      title: process.env.VUE_APP_TITLE,
      // 应用部署后可供访问的 web 地址
      url: process.env.VUE_APP_WEBHOST,
      entryName: 'app',
      entry: Path.join(srcPath, 'main.ts'),
      template: Path.join(srcPath, 'index.ejs'),
      context: srcPath,
      // 是否指定添加 hash，默认为生产模式下添加
      hash: {
        enable: isProd,
        length: 12
      },
      assetsDirName: 'assets',
      nodeModulesDirName: 'packages',
      automaticNameDelimiter: '~',
      plugin: {
        BundleAnalyzerPlugin: {
          reportFilename: '_BundleAnalyzerPlugin.html'
        },
        CopyWebpackPlugin: {
          patterns: [Path.join(srcPath, 'assets/img/favicon.ico'), Path.join(srcPath, 'assets/img/logo.png')].map(
            (x) => ({
              from: x
            })
          )
        },
        WebpackHtmlEmbedSourcePlugin: {
          head: {
            prepend: [Path.join(srcPath, 'app/first-screen/first-screen.css')]
          },
          body: {
            prepend: [
              Path.join(srcPath, 'app/first-screen/first-screen.html'),
              Path.join(srcPath, 'app/first-screen/first-screen.js')
            ]
          },
          tests: [
            // 将 runtime.js 输出到 index.html
            /runtime.*.js/
          ]
        }
      }
    }
  };
};

/**
 * vue.config
 */

const Path = require('path');

const { chainWebpack, configureWebpack } = require('./build/webpack.config');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '' : '',
  lintOnSave: false,
  productionSourceMap: false,
  runtimeCompiler: true,
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 8080,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    progress: false
    /* proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    } */
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [Path.resolve(__dirname, 'src/theme/default.theme.scss')]
    }
  },
  transpileDependencies: [/\bvue-awesome\b/, 'vue-echarts', 'resize-detector'],
  chainWebpack: function (config) {
    return chainWebpack(config);
  },
  configureWebpack: function (config) {
    return configureWebpack(config);
  },
  css: {
    extract: {
      // 禁用样式加载顺序的警告
      ignoreOrder: true
    },
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: require('./src/app/theme/antdv.theme'),
          javascriptEnabled: true
        }
      },
      sass: {
        implementation: require('sass')
      }
    }
  }
};

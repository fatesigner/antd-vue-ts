<h1 align="center">Ant design + Vue + Typescript</h1>

<p align="center">
  <a href="https://ant.design" target="_blank"><img width="100" src="docs/assets/antd.svg" alt="antd logo"></a>
  <img width="50" src="docs/assets/transparency.png" alt="transparency">
  <a href="https://vuejs.org" target="_blank"><img width="100" src="docs/assets/vue.png" alt="vue logo"></a>
  <img width="60" src="docs/assets/transparency.png" alt="transparency">
  <a href="https://www.typescriptlang.org/" target="_blank"><img width="100" src="docs/assets/ts.png" alt="ts logo"></a>
</p>

使用 Ant design + Vue + Typescript + SASS 构建后台管理类型的 Web 应用.

### 当前支持的版本
- [Ant design vue](https://github.com/vueComponent/ant-design-vue) (v1.6.2)
- [Vue](https://github.com/vuejs/vue) (v2.6.11)
- [Typescript](https://github.com/microsoft/TypeScript) (v3.9.4)

###  [online demo](https://antd-vue-ts.repo.fatesigner.com/)

### download
``` bash
git clone https://github.com/fatesigner/antd-vue-ts.git
```

### install
``` bash
npm install
```

### 开发模式（Hot Reload）
``` bash
npm run serve
```

### 打包编译，用于生产环境
``` bash
npm run build
```

### 目录结构
``` bash
├─ build                                      // build 目录，放置打包、编译的脚本
│  ├─ env.js                                  // 定义用于 build 的全局变量，包含当前应用的一些信息
│  ├─ utils.js                                // 工具函数
│  ├─ webpack-html-embed-source-plugin.js     // webpack 插件：将指定的 html、js、css文件内嵌至 index.html
│  ├─ webpack-ignorenotfoundexport-plugin.js  // webpack 插件：忽略关于 "imports was not found in..." 的警告信息
│  ├─ webpack.config.js                       // webpack 配置：包含覆盖 Vue CLI 默认选型的一些配置
│  └─ webpack.loaders.js                      // webpack loders：定义一些 loaders 的默认配置
├─ src
│  ├─ app 
│  │  ├─first-screen                          // 首屏渲染动画模板，将会内嵌至 index.html
│  │  ├─i18n                                  // 国际化（使用 vue-i18n）
│  │  │  ├─ lang                              // 语言包
│  │  │  │  ├─ en-US.ts                       // 英文包
│  │  │  │  └─ zh-CN.ts                       // 中文包
│  │  │  ├─ i18n                              // i18n 核心（初始化i18n配置、并添加一些勾子）
│  │  │  └─ keys                              // 定义 i18n key 接口（用于 typescript 语法检查）
│  │  ├─interfaces                            // 通用接口
│  │  ├─layout                                // 母版页和通用布局（页头、页脚、侧边栏等）
│  │  ├─pipes                                 // 过滤器
│  │  ├─providers                             // 放置一些第三方插件初始化代码和默认配置
│  │  ├─routes
│  │  │  ├─dashboard                          // dashboard（首页）
│  │  │  │  ├─Dashboard.vue                   // dashboard 组件
│  │  │  │  └─ router.ts                      // dashboard 路由
│  │  │  ├─config.ts                          // 定义基础路由（Login或者其他可匿名访问的路由）和业务路由（需授权访问的路由），并将其导出
│  │  │  └─ routes.ts                         // 路由初始化（导入当前目录下其他业务组件，并定义拦截、跳转逻辑）
│  │  ├─services                                             
│  │  │  ├─api.service                        // Api 服务（访问后端接口）
│  │  │  ├─auth.service                       // 授权认证服务（定义授权、认证逻辑）
│  │  │  ├─common.service                     // 通用服务
│  │  │  └─ session.service                   // 用户信息持久化服务（用户信息的本地化存储）
│  │  ├─shared                                // 通用组件
│  │  ├─styles                                // 样式库                                            
│  │  │  └─ reset.scss                        // 样式重置                                           
│  │  ├─theme                                 // 主题库                                
│  │  │  ├─antdv-theme.js                     // 定制 Antd ui 主题                       
│  │  │  └─ default.theme.scss                // 当前应用默认主题
│  │  ├─app.ts                                // 导入 App.vue，并导出 CreateApp 函数
│  │  ├─App.vue                               // App 组件
│  │  ├─event.ts                              // 事件总线（用于组件、服务间通信）
│  │  ├─global.ts                             // 全局变量
│  │  └─ store.ts                             // App store（导入并整合其他组件的 store）
│  ├─ assets                                  // 放置一些静态资源
│  ├─ index.ejs                               // 入口 html 模板（使用 ejs）
│  ├─ lib                                     // 第三方插件、组件库
│  │  ├─antdv-ui                              // antdv-ui（包含部分已二次封装的组件和图标）
│  │  ├─fetch                                 // http 模块（使用 axios）
│  │  ├─qiniu                                 // 七牛云插件
│  │  ├─quick-layout                          // 通用样式库（用于快速布局）
│  │  └─ vue-helper                           // Vue 辅助工具库
│  ├─ main.ts                                 // App 初始化
│  └─ typings                                 // 定义一些用于 Typescipt 的类型文件
│    ├─ vue-shims                             // 支持 Vue 工作于 Typescript 环境
│    ├─ globals.d.ts                          // 拓展 NodeJS.Global 和 NodeJS.Process 类型             
│    └─ window.d.ts                           // 拓展 Window 类型 
├─ test                                       // 测试脚本
│  └─ index.spec.ts                                             
├─ .browserslistrc                            // 配置目标浏览器
├─ .commitlintrc.js                           // 定制代码提交规范
├─ .cz-config.js                              // 定制代码提交类型
├─ .editorconfig                              // 配置编码风格
├─ .env                                       // 环境变量（所有环境均会加载）
├─ .env.development                           // 开发环境变量
├─ .env.production                            // 生产环境变量
├─ .env.test                                  // 测试环境变量
├─ .eslintignore                              // 配置 eslint 可忽略的特定的文件和目录（一般忽略 dist 目录）
├─ .eslintrc.js                               // 配置 eslint
├─ .gitattributes                             // 指定 git 使用的文件和路径的属性
├─ .gitignore                                 // 指定不需要添加到 git 管理的文件和目录
├─ .huskyrc.json                              // 配置 git 勾子（提交前进行 lint 检查或者自动化测试）
├─ .npmignore                                 // 指定 npm publish 时忽略的文件和目录
├─ .npmrc                                     // npm 配置（可禁用 package-lock）
├─ babel.config.js                            // babel 配置
├─ jest.config.js                             // jest 配置
├─ LICENSE                                    // 许可证
├─ lint-staged.config.js                      // 代码风格化配置
├─ package.json                               // 模块描述文件
├─ postcss.config.js                          // postcss 配置
├─ README.md
├─ stylelint.config.js                        // stylelint 配置
├─ tsconfig.json                              // tsconfig 用于项目打包、编译
├─ tsconfig.test.json                         // tsconfig 用于测试脚本
└─ vue.config.js                              // Vue CLI 配置
```

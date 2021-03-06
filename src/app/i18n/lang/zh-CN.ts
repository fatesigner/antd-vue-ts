/**
 * zh
 */

import { I18nkeysType } from '../keys';

const lang: I18nkeysType = {
  route: {
    error: {
      notFound: {
        name: '未找到页面',
        title: '页面丢失',
        description: '请检查您输入的网址是否正确，或点击下面的按钮返回主页.',
        back: '返回'
      },
      unauthorized: {
        name: '未授权',
        title: '你没有权限访问该页面',
        title2: '如有不满请联系你领导',
        title3: '或者你可以去',
        back: '回到主页',
        gotologin: '重新登录',
        gotohome: '回到主页'
      }
    },
    login: '登录',
    menusAuth: '菜单授权',
    dashboard: '首页',
    table: '表格'
  },
  navbar: {
    logOut: '退出登录',
    dashboard: '主页',
    github: '项目地址',
    theme: '换肤',
    size: '布局大小',
    profile: '个人中心'
  },
  login: {
    title: '系统登录',
    logIn: '登录',
    username: '账号',
    password: '密码',
    any: '随便填',
    thirdparty: '第三方登录',
    thirdpartyTips: '本地不能模拟，请结合自己业务进行模拟！！！'
  },
  tabsView: {
    refresh: '刷新',
    close: '关闭',
    closeOthers: '关闭其它',
    closeAll: '关闭所有'
  },
  settings: {
    title: '系统布局配置',
    theme: '主题色',
    showTagsView: '显示 Tags-View',
    showSidebarLogo: '显示侧边栏 Logo',
    fixedHeader: '固定 Header'
  }
};

export default lang;

/**
 * interfaces
 */

export const I18nkeys = {
  route: {
    error: {
      notFound: {
        name: 'name',
        title: 'title',
        description: 'description',
        back: 'back'
      },
      unauthorized: {
        name: 'name',
        title: 'title',
        title2: 'title2',
        title3: 'title3',
        back: 'back',
        gotologin: 'login',
        gotohome: 'home'
      }
    },
    login: 'login',
    menusAuth: 'menusAuth',
    dashboard: 'dashboard',
    table: 'table'
  },
  navbar: {
    logOut: 'dashboard',
    dashboard: 'dashboard',
    github: 'github',
    theme: 'theme',
    size: 'size',
    profile: 'profile'
  },
  login: {
    title: 'title',
    logIn: 'logIn',
    username: 'username',
    password: 'password',
    any: 'any',
    thirdparty: 'thirdparty',
    thirdpartyTips: 'thirdpartyTips'
  },
  tabsView: {
    refresh: 'refresh',
    close: 'close',
    closeOthers: 'closeOthers',
    closeAll: 'closeAll'
  },
  settings: {
    title: 'title',
    theme: 'theme',
    showTagsView: 'showTagsView',
    showSidebarLogo: 'showSidebarLogo',
    fixedHeader: 'fixedHeader'
  }
};

export type I18nkeysType = typeof I18nkeys;

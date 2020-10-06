/**
 * en
 */

import { I18nkeysType } from '../keys';

export const lang: I18nkeysType = {
  route: {
    error: {
      notFound: {
        name: 'notfound',
        title: 'Page Not Found',
        description:
          'Please check that the URL you entered is correct, or click the button below to return to the homepage.',
        back: 'back'
      },
      unauthorized: {
        name: 'unauthorized',
        title: 'You do not have permission to go to this page',
        title2: 'Please contact your leader if you are dissatisfied',
        title3: 'Or you can go',
        back: 'back',
        gotologin: 'login',
        gotohome: 'home'
      }
    },
    login: 'login',
    menusAuth: 'menus auth',
    dashboard: 'dashboard',
    table: 'table'
  },
  navbar: {
    logOut: 'Log Out',
    dashboard: 'Dashboard',
    github: 'Github',
    theme: 'Theme',
    size: 'Global Size',
    profile: 'Profile'
  },
  login: {
    title: 'Login Form',
    logIn: 'Login',
    username: 'Username',
    password: 'Password',
    any: 'any',
    thirdparty: 'Or connect with',
    thirdpartyTips: 'Can not be simulated on i18n, so please combine you own business simulation! ! !'
  },
  tabsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    showTagsView: 'Open Tags-View',
    showSidebarLogo: 'Sidebar Logo',
    fixedHeader: 'Fixed Header'
  }
};

export default lang;

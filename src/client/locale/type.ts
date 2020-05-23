/**
 * type
 */

type LocalekeysType = {
  [key in string]: string | LocalekeysType;
};

export interface ILocalekeys extends LocalekeysType {
  route: {
    dashboard: string;
    predelivery: string;
    prepaid: string;
  };
  navbar: {
    logOut: string;
    dashboard: string;
    github: string;
    theme: string;
    size: string;
    profile: string;
  };
  login: {
    title: string;
    logIn: string;
    username: string;
    password: string;
    any: string;
    thirdparty: string;
    thirdpartyTips: string;
  };
  tagsView: {
    refresh: string;
    close: string;
    closeOthers: string;
    closeAll: string;
  };
  settings: {
    title: string;
    theme: string;
    showTagsView: string;
    showSidebarLogo: string;
    fixedHeader: string;
    sidebarTextTheme: string;
  };
}

/**
 * model
 */

type IKeys = {
  [key in string]: string | IKeys;
};

export interface I18nkeysType extends IKeys {
  /* error: {
    unauthorized: {
      oops: string;
      message: string;
      info: string;
      back: string;
    };
    not-found: {
      oops: string;
      message: string;
      info: string;
      back: string;
    };
  }; */
  route: {
    error: {
      notFound: string;
      unauthorized: string;
    };
    dashboard: string;
    agentType: string;
    predelivery: string;
    rebate: string;
    prepaid: string;
    menus: string;
    roles: string;
    mitigate: string;
    withdraw: string;
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

/**
 * api.service
 */

import { LocalStorage } from '@fatesigner/utils/local-storage';
import { Http } from '../../lib/fetch/fetch';

import { ApiHostCollection, ENV, RoleCollection } from '../global';
import { SessionService } from './session.service';

// 为请求 添加 access-token
Http.interceptors.request.use(
  function (config) {
    // 在此可设置请求的默认 header 头
    if (!config.headers.token) {
      config.headers.authorization = SessionService.user.accessToken;
    }
    return config;
  },
  function (error: Error): Promise<any> {
    return Promise.reject(error);
  }
);

// 响应拦截
Http.interceptors.response.use(
  function (res) {
    const res_ = res.data;

    // 在此定义请求成功后的处理逻辑，需要与后端配合
    if (!res_ || res_.code === undefined || res_.code === 0 || res_.code === 200) {
      return res_;
    } else if (res_.code === 401 || res_.code === 403) {
      // 判断返回状态为 unauthorized 未授权，则登出当前账户，并将错误消息传递过去
      SessionService.logout({
        expired: true,
        message: res_.msg
      });
    }

    // 其余情况，均视为请求出错
    const err = {
      code: res_.code,
      data: res_.data,
      message: res_.msg || res_.message || '请求错误，请联系管理员！'
    };

    return Promise.reject(err);
  },
  function (rejection): Promise<any> {
    // 在此定义请求错误的处理逻辑
    let data: any = {};
    let message;
    let status;
    if (rejection.response) {
      if (rejection.response.data) {
        data = rejection.response.data;
      }
      if (rejection.response.status) {
        status = rejection.response.status;
      }
    }
    switch (status) {
      case -1: {
        // 远程服务器无响应
        message = '服务器无响应，请检查你的网络设置';
        break;
      }
      case 401: {
        // unauthorized 未授权，登出账户
        message = '您当前的会话已超时，请重新登录';
        SessionService.logout();
        break;
      }
      case 408: {
        message = '连接服务器超时，请检查你的网络设置';
        break;
      }
      default: {
        if (rejection.code === 'ECONNABORTED') {
          message = '连接服务器超时，请检查你的网络设置';
        } else {
          if (Object.prototype.toString.call(data) === '[object String]') {
            message = data;
          } else {
            message = data.msg || data.message || '请求错误，请联系管理员！';
          }
        }
      }
    }

    // 抛出一个错误
    return Promise.reject(new Error(message));
  }
);

export class ApiServiceStatic {
  apiHost: keyof typeof ApiHostCollection.enum = null;
  role: keyof typeof RoleCollection.enum = null;

  constructor() {
    // 初始化 ApiHost
    // 开发环境下，可动态切换服务端环境和角色
    if (process.env.VUE_APP_MODE === 'development') {
      // 从本地缓存中获取 ApiHost 和 role，若不存在，则设置为开发环境和角色列表中的第一个角色
      this.setApiHost(LocalStorage.get('apiHost') || ApiHostCollection.arr[0].name);
      this.setRole(LocalStorage.get('role') || RoleCollection.arr[0].name);
    } else {
      // 生产环境下，将固定为环境变量提供的 ApiHost
      Http.defaults.baseURL = ENV.VUE_APP_APIHOST;
    }
  }

  setApiHost(name: keyof typeof ApiHostCollection.enum): void {
    Http.defaults.baseURL = ApiHostCollection.enum[name];
    LocalStorage.set('apiHost', name);
    this.apiHost = name;
  }

  setRole(name: keyof typeof RoleCollection.enum): void {
    LocalStorage.set('role', name);
    this.role = name;
  }

  login(params: { username: string; password: string; validateCode: string; vcode: string }): Promise<any> {
    return Http.post('/user/login', params);
  }

  getValidateCode() {
    return Http.post('/user/getValidateCode');
  }

  updatePassword(params: { username: string; oldpassword: string; confirmpassword: string; captcha: string }) {
    return Http.post('/user/login', params);
  }

  logout(): Promise<any> {
    Http.put('/user/logout');
    return Promise.resolve();
  }

  // 获取当前所有的角色
  getRoles() {
    return Http.get('/user/getRoles');
  }

  // 获取菜单
  getMenus(params?: any): Promise<any> {
    return Http.get('/menu/get', {
      params
    });
  }

  // 更新菜单
  updateMenu(params: any): Promise<any> {
    return Http.post('/menu/update', params);
  }

  // 获取返利
  getRebate(params?: any): Promise<any> {
    return Http.get('/rebate/get', {
      params
    });
  }

  addRebate(params: any) {
    return Http.post('/rebate/add', params);
  }

  updateRebate(params: any) {
    return Http.post('/rebate/update', params);
  }

  deleteRebate(id: string) {
    return Http.post('/rebate/delete', {
      id
    });
  }

  // 获取省市区
  getArea(params?: any): Promise<any> {
    return import('../../assets/json/area.json').then((res) => {
      return res.default;
    });
  }
}

export const ApiService = new ApiServiceStatic();

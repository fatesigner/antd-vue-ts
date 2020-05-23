/**
 * session
 */

import { IsNullOrUndefined, IsNumber, IsString } from '@forgleaner/utils/type-check';

import { LocalStorage, SetIdentification } from './lib/local-storage';

import { RoleKeys } from '../config/role';
import { IUser } from '../models/user';

type IUserRole = IUser<typeof RoleKeys>;

class Session_ {
  /**
   * accessToken 有效时间 天数 转换为毫秒数
   */
  public tokenEffectiveTime = 6 * 24 * 60 * 60 * 1000;

  /**
   * 用户信息
   */
  public user: IUserRole;

  constructor() {
    SetIdentification('mogu-web-ionic');

    // 从localStorage中获取用户信息
    const data = LocalStorage.get('user');

    if (data) {
      this.user = data;
    } else {
      this.resetUserInfo();
    }

    // 若token过期 则注销当前用户
    if (this.isExpires()) {
      this.logout();
    }
  }

  /**
   * 重置用户信息 用于注销
   */
  public resetUserInfo() {
    return (this.user = {
      username: '',
      password: '',
      roles: ['admin'],
      avatar: '',
      realname: '',
      tokenType: '',
      accessToken: '',
      accessTokenFull: '',
      refreshToken: '',
      tokenExpirationTime: 0
    });
  }

  /**
   * 保存用户信息到localStorage
   */
  public saveToLocalStorage() {
    LocalStorage.set('user', this.user);
  }

  /**
   * 登录
   */
  public login(data: IUserRole) {
    if (data) {
      this.user = data;
      this.user.tokenExpirationTime = new Date().getTime() + this.tokenEffectiveTime;
      this.user.accessToken = (this.user.tokenType || '') + ' ' + (this.user.accessToken || '');
      this.saveToLocalStorage();
    }
  }

  /**
   * 注销
   */
  public logout() {
    const username = this.user.username;
    this.resetUserInfo();
    this.user.username = username;
    this.saveToLocalStorage();
  }

  /**
   * 判断用户登录信息是否过期
   */
  public isExpires(token?: string, tokenExpirationTime?: number) {
    if (IsNullOrUndefined(token) || !IsString(token)) {
      token = this.user.accessToken;
    }
    if (IsNullOrUndefined(tokenExpirationTime) || !IsNumber(token)) {
      tokenExpirationTime = this.user.tokenExpirationTime;
    }
    // 和当前时间戳比较
    return !token || tokenExpirationTime <= new Date().getTime();
  }
}

export const Session = new Session_();

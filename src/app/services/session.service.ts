/**
 * session
 */

import { merge } from 'lodash';
import { LocalStorage } from '@fatesigner/utils/local-storage';
import { StructureTree } from '@fatesigner/utils/structure-tree';
import { IsNullOrUndefined } from '@fatesigner/utils/type-check';

import { Events } from '../event';
import { RoleCollection } from '../global';
import { IUser } from '../interfaces/user';
import { IMenu } from '../interfaces/menu';

// 定义 session 用户模型
export type IUserSession = IUser<typeof RoleCollection.keys>;

class SessionServiceStatic {
  /**
   * 用户信息
   */
  public user: IUserSession;

  constructor() {
    // 从 localStorage 中获取用户信息
    const user: IUserSession = LocalStorage.get('user');

    // 验证用户信息有效性
    if (this.verify(user)) {
      this.updateUser(user);
      Events.login.$emit(this.user);
      Events.roleChanged.$emit(this.user?.roles[0] ?? null);
    } else {
      // 重置用户信息
      this.updateUser(this.getDefaultUser());
    }
  }

  /**
   * 获取默认用户信息
   */
  private getDefaultUser(user?: { [P in keyof IUserSession]+?: IUserSession[P] }): IUserSession {
    return merge(
      {
        username: '',
        password: '',
        roles: [],
        avatar: '',
        realname: '',
        tokenType: '',
        accessToken: '',
        accessTokenFull: '',
        refreshToken: '',
        tokenExpirationTime: 0,
        menus: [],
        permissions: []
      },
      user
    ) as any;
  }

  /**
   * 登录
   * @param user
   */
  public login(user: IUserSession) {
    this.updateUser(user);

    // 将用户信息持久化保存至客户端
    this.saveUser();

    // 用户登录
    Events.login.$emit(this.user);

    // 角色变化
    Events.roleChanged.$emit(this.user?.roles[0] ?? null);
  }

  /**
   * 注销
   * @param options
   */
  public logout(options?: { expired?: boolean; message?: string }) {
    // 保存上次登录过的用户名
    this.updateUser(this.getDefaultUser({ username: this.user.username }));

    // 将用户信息持久化保存至客户端
    this.saveUser();

    Events.logout.$emit({
      // 注销原因：用户主动触发或者是用户信息过期
      expired: options?.expired,
      // 对应的 message
      message: options?.message
    });
  }

  /**
   * 更新当前用户信息
   * @param user
   */
  public updateUser(user: IUserSession) {
    if (user) {
      this.user = user;
      this.user.permissions = [];
      if (!this.user.menus) {
        this.user.menus = [];
      }

      const strutree = new StructureTree<IMenu>();
      strutree.forEach(this.user.menus, (node) => {
        if (node.name) {
          this.user.permissions.push(node.name);
        }
      });
    }
  }

  /**
   * 验证指定用户信息是否有效（是否为空值或过期）
   * @param user
   */
  public verify(user?: IUserSession) {
    if (IsNullOrUndefined(user)) {
      user = this.user;
    }

    // 和当前时间戳比较
    if (user) {
      return user.accessToken && user.accessToken.trim() && user.tokenExpirationTime > new Date().getTime();
    }

    return false;
  }

  /**
   * 将用户信息持久化保存至客户端
   */
  private saveUser() {
    LocalStorage.set('user', this.user);
  }
}

export const SessionService = new SessionServiceStatic();

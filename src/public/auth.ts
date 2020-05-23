/**
 * Auth
 * 授权、认证服务
 */

import { Route } from 'vue-router/types/router';

import { RoleKeys } from '../config/role';
import { IUser } from '../models/user';

export const AuthorizedRoles = {};

class Auth_ {
  authPath = '/login';
  entryPath = '/';
  logoutPath = '/api/logout';

  /**
   * 判断用户是否登录
   */
  public isAuthenticated(user: IUser<any>): boolean {
    return !!(user.username && user.accessToken);
  }

  // 认证待跳转过去的视图
  public authRoute(user: IUser<any>, to: Route) {
    return to.matched.every((record) => {
      if (record.meta && record.meta.auth && record.meta.auth.length) {
        // 验证当前角色是否有访问权限
        const isa = this.isAuthorized(user, record.meta.auth);
        return isa.permissible;
      }
      return true;
    });
  }

  /**
   * 对于指定的角色组 判断当前用户是否已授权
   * @param user
   * @param {Array} authorizedRoles
   * 没有指定角色组 视为已授权
   * @return {Object}
   * permissible：是否有权限访问
   * unauthorizedRoles：未符合的角色组 若数量和小于指定的角色组 视为 已授权 否则为 未授权
   */
  public isAuthorized(
    user: IUser<any>,
    authorizedRoles: typeof RoleKeys[]
  ): {
    permissible: boolean;
    unauthorizedRoles: typeof RoleKeys[];
  } {
    const length = authorizedRoles && authorizedRoles.length;
    const authorizedRolesNew = [];
    if (user && length) {
      // 先判断用户登录是否过期
      if (!this.isAuthenticated(user)) {
        return {
          permissible: false,
          unauthorizedRoles: authorizedRoles
        };
      }
      let temp;
      let temp2 = false;
      for (let i = 0; i < length; i++) {
        temp = authorizedRoles[i];
        for (const item of user.roles) {
          if (temp === item) {
            temp2 = true;
            break;
          }
        }
        if (!temp2) {
          authorizedRolesNew.push(temp);
          temp2 = false;
        }
      }
    }
    return {
      permissible: !length || authorizedRolesNew.length < length,
      unauthorizedRoles: authorizedRolesNew
    };
  }

  /**
   * 对于给定的 Page，判断当前用户是否有权限访问
   * @param user
   * @param page
   */
  public isAuthorizedForPage(user: IUser<any>, page: string): boolean {
    let authorizedRoles = AuthorizedRoles[page];
    if (!authorizedRoles) {
      authorizedRoles = [];
    }
    const authRes = this.isAuthorized(user, authorizedRoles);
    if (!authRes.permissible) {
      console.log("The page '" + page + "' is not authorized.");
    }
    return authRes.permissible;
  }
}

export const Auth = new Auth_();

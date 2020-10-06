/**
 * auth.ervice
 * 授权、认证服务
 */

import { Route } from 'vue-router/types/router';
import { StructureTree } from '@fatesigner/utils/structure-tree';
import { RouteMeta } from '../../lib/vue-helper/interface';
import { GetMenusFromRoutes } from '../../lib/vue-helper';

import { RoleCollection } from '../global';
import { SessionService } from './session.service';
import { RichRoutes } from '../routes/config';

// 授权认证模式
type AuthenticationMode = 'client' | 'server';

class AuthServiceStatic {
  // 主页地址
  homepage = null;

  // 授权界面地址 name
  authPage = 'login';

  // 授权认证模式
  authMode: AuthenticationMode = 'server';

  // 超级管理员角色，该角色将会跳过认证
  superRole: keyof typeof RoleCollection.enum = 'admin';

  // 是否开启重定向模式，登出后将暂存当前地址，登录后重定向至该地址
  redirectEnable = false;

  // 判断当前用户是否已认证
  public isAuthenticated(): boolean {
    return !!(SessionService.user?.username && SessionService.user?.accessToken);
  }

  /**
   * 判断指定的路由是否有权限访问
   * @param to
   * @param roles 指定角色组，默认为当前用户的角色组
   */
  public isAuthorized(to: Route, roles?: typeof RoleCollection.keys) {
    // 跳过授权界面
    if (!to.name || to.name === this.authPage) {
      return true;
    }

    // 绕过超级管理员角色
    if (this.superRole && SessionService.user.roles.includes(this.superRole)) {
      return true;
    }

    if (this.authMode === 'client') {
      if (!roles) {
        roles = SessionService.user.roles;
      }

      let routes = [];
      if (to.matched && to.matched.length) {
        // 对于嵌套路由的情况，将从尾部（子路由）开始依次验证
        routes = to.matched.slice().reverse();
      } else {
        routes.push(to);
      }

      return routes.every((route) => {
        // 寻找 route 中定义的 meta 属性
        const meta: RouteMeta<typeof RoleCollection.keys> = route.meta;
        if (meta && route.name) {
          if (meta.allowAnonymous) {
            // 允许匿名
            return true;
          } else if (meta.auth && meta.auth.length) {
            const isa = this.authRoles(roles, meta.auth);
            return isa.permissible;
          } else {
            // 验证用户是否登录
            return roles.length;
          }
        } else {
          // 无 name 属性，视为虚拟路由，跳过
          return true;
        }
      });
    } else {
      return SessionService.user.permissions.some((record) => record === to.name);
    }
  }

  /**
   * 对于指定的角色组，判断给定的角色组是否已授权（即两个集合是否交集）
   * @param roles   roles
   * @param {Array} authorizedRoles
   * 没有指定角色组 视为已授权
   * @return {Object}
   * permissible：是否有权限访问
   * unauthorizedRoles：未符合的角色组 若数量和小于指定的角色组 视为 已授权 否则为 未授权
   */
  public authRoles(
    roles: typeof RoleCollection.keys,
    authorizedRoles: typeof RoleCollection.keys
  ): {
    permissible: boolean;
    unauthorizedRoles: typeof RoleCollection.keys;
  } {
    const authorizedRolesNew = [];
    const length = authorizedRoles && authorizedRoles.length;
    let temp;
    let temp2 = false;
    for (let i = 0; i < length; i++) {
      temp = authorizedRoles[i];
      for (const item of roles) {
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
    return {
      permissible: !length || authorizedRolesNew.length < length,
      unauthorizedRoles: authorizedRolesNew
    };
  }

  /**
   * 获取指定角色可访问的路由
   * @param routes
   * @param roles 指定的角色列表，默认为当前用户所拥有的的角色
   */
  public getAuthorizedRoutes(routes: any[], roles?: typeof RoleCollection.keys) {
    roles = roles ?? SessionService.user.roles;

    const strutree = new StructureTree<Route>({
      idKey: 'path',
      labelKey: 'path',
      childrenKey: 'children'
    });

    const d: any[] = strutree.filter(routes, (node) => {
      return this.isAuthorized(node, roles);
    });

    return d.filter((x) => x.children.length);
  }

  /**
   * 获取指定角色可访问的菜单
   * @param menusFromServer 服务端返回的菜单
   * @param roles 指定的角色列表，默认为当前用户所拥有的的角色
   */
  public getAuthorizedMenus(menusFromServer: any[], roles?: typeof RoleCollection.keys) {
    roles = roles ?? SessionService.user.roles;

    // 绕过超级管理员角色
    /* if (this.superRole && roles.includes(this.superRole)) {
      // 获取当前应用下的所有菜单
      return GetMenusFromRoutes(RichRoutes);
    } */

    if (AuthService.authMode === 'client') {
      // 客户端授权模式，分析当前路由表以获取菜单
      return GetMenusFromRoutes(RichRoutes, (x) => AuthService.isAuthorized(x, roles));
    }

    // 服务端授权模式，后端返回菜单
    return menusFromServer;
  }
}

export const AuthService = new AuthServiceStatic();

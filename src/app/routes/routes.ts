/**
 * router
 */

import Vue from 'vue';
import Router from 'vue-router';
import { RouterOptions } from 'vue-router/types/router';
import { IGetRouteAccessPermission } from '../../lib/vue-helper/interface';
import { RegisterRouterBeforeEach, ResetRouter } from '../../lib/vue-helper';

import { Events } from '../event';
import { AuthService } from '../services/auth.service';
import { GetLayout, RootRouterLayoutName } from '../layout';
import { AddNotFoundRoute, AddUnauthorizedRoute } from '../layout/components/error';

import { BaseRoutes, RichRoutes } from './config';

Vue.use(Router);

/**
 * 给定一个待跳转的路由，获取其访问权限
 * @param to
 * @constructor
 */
const GetAccessPermission: IGetRouteAccessPermission = (to) => {
  if (AuthService.isAuthenticated()) {
    // 用户已认证
    if (to.matched.length) {
      // 路由已匹配
      if (!AuthService.isAuthorized(to)) {
        // 无访问权限
        return 403;
      }
    } else {
      // 路由未匹配
      return 404;
    }
  } else {
    // 用户未认证
    if (to.matched.length) {
      // 路由已匹配
      if (!AuthService.isAuthorized(to)) {
        // 无访问权限
        return 401;
      }
    } else {
      // 路由未匹配
      return 404;
    }
  }

  return 200;
};

/**
 * 重定向至授权界面
 * @param router
 * @param error
 * @constructor
 */
const RedirectToAuthPage = (router: Router, error?: string) => {
  if (router.currentRoute?.name === 'Dashboard') {
    router.replace({ name: AuthService.authPage });
  } else {
    // 非 Dashboard 路由，添加 redirect 参数
    if (AuthService.redirectEnable) {
      router.replace({
        name: AuthService.authPage,
        query: { redirect: router.currentRoute?.fullPath ?? '' },
        params: {
          error
        }
      });
    } else {
      router.replace({
        name: AuthService.authPage,
        params: {
          error
        }
      });
    }
  }
};

/**
 * 创建 App Router 实例
 * @param appStore
 * @constructor
 */
export async function CreateRouter(appStore) {
  // 定义 Router 默认实例选项
  const defaultRouterOpts: RouterOptions = {
    base: '/',
    // 使用 history 模式
    mode: 'history',
    linkActiveClass: 'activated',
    linkExactActiveClass: 'exact-activated',
    routes: BaseRoutes
  };

  // 全局路由实例，用于指定路由的匹配
  const richRouter: any = new Router(Object.assign({}, defaultRouterOpts, { routes: [...BaseRoutes, ...RichRoutes] }));

  // 当前路由实例，只包含基础路由
  const router: any = new Router(defaultRouterOpts);

  // 监听用户登录事件
  Events.login.$on((user) => {
    if (user) {
      // 动态注册当前用户可访问的路由
      router.addRoutes(AuthService.getAuthorizedRoutes(RichRoutes));
    }
  });

  // 监听用户注销事件
  Events.logout.$on((event) => {
    // 重置路由
    ResetRouter(router, defaultRouterOpts);

    // 重定向至授权界面
    RedirectToAuthPage(router, event?.expired ? event?.message || '您当前的会话已过期，请重新登录' : undefined);
  });

  // 监听用户角色切换事件，设置不同的主页
  Events.roleChanged.$on((val) => {
    if (val === 'admin') {
      AuthService.homepage = 'table';
    } else if (val === 'normal') {
      AuthService.homepage = 'dashboard';
    } else {
      // 匿名用户，设置主页为空
      AuthService.homepage = null;
    }
  });

  // 注册全局前置守卫
  RegisterRouterBeforeEach(router, (to, from, next) => {
    // 已匹配路由表，放行
    if (to.matched.length) {
      return next();
    }

    // 获取待跳转的路由可访问的权限
    let status: any = GetAccessPermission(to);
    if (status === 404) {
      // 该路由未匹配，继续匹配全局路由表
      const to_ = richRouter.matcher.match(to, router.currentRoute);

      status = GetAccessPermission(to_);

      if (status === 403) {
        // 最终确认当前用户没有该路由的访问授权，动态添加 403 路由，该界面将提示用户未获得对应的访问权限
        AddUnauthorizedRoute(to_, router, GetLayout(RootRouterLayoutName.Sidebar));
        return next({ path: to.path });
      }
    }

    if (status === 401) {
      // 无访问权限，通常是未登录状态，将重定向至授权界面
      return next({
        name: AuthService.authPage,
        query: { redirect: AuthService.redirectEnable ? to.fullPath : undefined }
      });
    } else if (status === 404) {
      // 该路由不存在，动态添加 404 路由，该界面将提示用户当前页面 not found
      AddNotFoundRoute(to, router, GetLayout(RootRouterLayoutName.Sidebar));
      return next({ path: to.path });
    }

    return next();
  });

  return router;
}

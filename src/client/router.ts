/**
 * router
 */

import Vue from 'vue';
import Router from 'vue-router';

import { RoleKeys } from '../config/role';
import { MenuLevel1 } from '../config/menu-level1';
import { IRouteConfig } from '../models/router';
import { Auth } from '../public/auth';

import routers from './routers';
import { Session } from './session';

Vue.use(Router);

export function CreateRouter() {
  const router = new Router({
    mode: 'hash',
    linkActiveClass: 'activated',
    linkExactActiveClass: 'exact-activated',
    routes: routers
  });

  // 认证待跳转过去的视图
  router.beforeEach((to, from, next) => {
    if (Auth.authRoute(Session.user, to)) {
      next();
    } else {
      return next({
        path: Auth.authPath,
        query: { redirect: to.fullPath }
      });
    }
  });

  return router;
}

/**
 * 页面路由信息接口
 */
export type IAppRouteConfig = IRouteConfig<typeof RoleKeys, typeof MenuLevel1>;

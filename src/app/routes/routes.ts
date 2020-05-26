/**
 * router
 */

import Vue from 'vue';
import Router from 'vue-router';

import { AppStore } from '../store';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

const routes = [];

// 导入 routes 目录下的所有 router
const requirePages = require.context('./', true, /router\.ts$/);
requirePages.keys().forEach((filename) => {
  const router = requirePages(filename);
  routes.push(router.default);
});

Vue.use(Router);

export function CreateRouter(appStore) {
  const router = new Router({
    mode: 'hash',
    linkActiveClass: 'activated',
    linkExactActiveClass: 'exact-activated',
    routes: routes
  });

  // 认证待跳转过去的视图
  router.beforeEach((to, from, next) => {
    if (AuthService.authRoute(SessionService.user, to)) {
      appStore.dispatch(AppStore.actionKeys.setErrorCode, null);
      return next();
    } else if (AuthService.isAuthenticated(SessionService.user)) {
      // 若用户已登录，为后续的操作设置状态码，跳转至入口，显示 unauthorized 页面
      appStore.dispatch(AppStore.actionKeys.setErrorCode, 401);
      // @ts-ignore
      return next({ name: 'unauthorized', params: [to.path], replace: true });
    }
    // 未认证成功，跳转至授权页面
    return next({
      path: AuthService.authPath,
      query: { redirect: to.fullPath }
    });
  });

  return router;
}

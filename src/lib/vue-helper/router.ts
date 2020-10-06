/**
 * router
 */

import Router, { Route } from 'vue-router';
import { RawLocation, RouterOptions } from 'vue-router/types/router';

import { ILocationMap } from './interface';

/**
 * 注册全局前置守卫，覆盖默认 Router push、replace 函数，并添加跳转逻辑
 * @param router
 * @param locationMap
 * @constructor
 */
export function RegisterRouterBeforeEach(router, locationMap: ILocationMap) {
  function push(location: RawLocation, onComplete?, onAbort?) {
    const to: Route = router.matcher.match(location, router.currentRoute);

    return new Promise<any>((resolve) => {
      // 保存多次拦截后待重定向的地址
      let location_;
      const next = (redirect?: RawLocation) => {
        if (redirect) {
          location_ = redirect;
          const redirectTo: Route = router.matcher.match(redirect, router.currentRoute);
          locationMap(redirectTo, router.currentRoute, next);
        } else {
          this.history.push(
            location_ || location,
            (res) => {
              if (onComplete) {
                onComplete(res);
              }
              resolve(res);
            },
            onAbort
          );
        }
      };
      locationMap(to, router.currentRoute, next);
    });
  }

  function replace(location: RawLocation, onComplete?, onAbort?) {
    const to = router.matcher.match(location, router.currentRoute);

    return new Promise<any>((resolve) => {
      // 保存多次递归拦截后待重定向的地址
      let location_;
      const next = (redirect?: RawLocation) => {
        if (redirect) {
          location_ = redirect;
          const redirectRoute: Route = router.matcher.match(redirect, router.currentRoute);
          locationMap(redirectRoute, router.currentRoute, next);
        } else {
          this.history.replace(
            location_ || location,
            (res) => {
              if (onComplete) {
                onComplete(res);
              }
              resolve(res);
            },
            onAbort
          );
        }
      };
      locationMap(to, router.currentRoute, next);
    });
  }

  Router.prototype.push = push;

  Router.prototype.replace = replace;

  // 因初始化后，会默认执行一次 beforeEach 勾子，所以在这里定义一个变量来标识是否已在 beforeEach 中拦截过跳转
  let handled = false;

  router.beforeEach(async (to, from, next) => {
    if (!handled) {
      // 初始化时，执行一次拦截
      handled = true;
      // 保存多次拦截后待重定向的地址
      let location;
      const next_ = (redirect?: RawLocation) => {
        if (redirect) {
          location = redirect;
          const redirectRoute: Route = router.matcher.match(redirect, router.currentRoute);
          locationMap(redirectRoute, router.currentRoute, next_);
        } else {
          if (location) {
            location.replace = true;
            next(location);
          } else {
            next();
          }
        }
      };
      return locationMap(to, from, next_);
    }
    next();
  });
}

/**
 * 实现在不刷新页面的情况下重置指定路由实例
 * @param router
 * @param routerOpts
 * @constructor
 */
export function ResetRouter(router: any, routerOpts: RouterOptions) {
  const routerNew: any = new Router(routerOpts);
  router.matcher = routerNew.matcher;
}

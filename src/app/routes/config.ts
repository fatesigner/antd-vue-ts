/**
 * config
 */

import { IRouteConfig } from '../../lib/vue-helper/interface';

import { GetLayout, RootRouterLayoutName } from '../layout';

// 基础路由表，可匿名访问
const baseRoutes = [RouteMap(require('../layout/components/login/router').default)];

// 业务路由表，导入 routes 目录下的 router，并分析 meta 为其添加指定的 layout
const richRoutes = [RouteMap(require('../layout/components/menus-auth/router').default)];
const requirePages = require.context('./', true, /router\.ts$/);
requirePages.keys().forEach((filename) => {
  const router: IRouteConfig = requirePages(filename).default;
  // 若该路由可被匿名访问，将其添加至基础路由表
  if (router.meta.allowAnonymous) {
    baseRoutes.push(RouteMap(router));
  } else {
    richRoutes.push(RouteMap(router));
  }
});

export function RouteMap(router) {
  return {
    path: router.path,
    // 默认 layout 为 Empty
    component: GetLayout(router?.meta?.layout ? router?.meta?.layout : RootRouterLayoutName.Empty),
    children: [
      Object.assign(router, {
        path: ''
      })
    ]
  };
}

export const BaseRoutes = baseRoutes;

export const RichRoutes = richRoutes;

/**
 * router
 */

import { Component, RouteConfig } from 'vue-router/types/router';

interface IRouteConfigExtends<AUTH extends readonly string[]> extends RouteConfig {
  components?: {
    default: Component;
    header?: Component;
    sideMenus?: Component;
    footer?: Component;
  };
  meta: {
    // 标签，用于描述该页面名称
    label: string;
    // 该路由可访问的权限组
    auth?: AUTH[number][];
    // 是否缓存视图
    keepAlive?: boolean;
  };
}

/**
 * 页面路由信息接口
 */
export interface IRouteConfig<AUTH extends readonly string[]> extends IRouteConfigExtends<AUTH> {
  children?: IRouteConfigExtends<AUTH>[];
}

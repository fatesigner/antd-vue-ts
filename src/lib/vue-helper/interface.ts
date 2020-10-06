/**
 * interface
 */

import { Route } from 'vue-router';
import { Component, RawLocation, RouteConfig } from 'vue-router/types/router';

export type RouteStatusCode = 200 | 401 | 403 | 404;

// 获取待跳转的路由
export interface ILocationMap {
  (to: Route, from: Route, next: (to?: RawLocation) => void): void;
}

// 获取待跳转路由的访问权限
export interface IGetRouteAccessPermission {
  (to: Route): RouteStatusCode;
}

export interface RouteMeta<TRoles extends readonly string[] = string[]> {
  // 布局视图名
  layout?: string;
  // 标签，用于描述该页面名称
  label: string;
  // 是否缓存视图
  keepAlive?: boolean;
  // 自定义数据
  data?: Record<string, any>;
  // 是否允许匿名访问，当设置为 false 时，需要同时配置 auth 属性
  allowAnonymous?: boolean;
  // 允许访问的角色清单
  auth?: TRoles[number][];
}

export type IRouteConfig<TRoles extends readonly string[] = string[]> = RouteConfig & {
  components?: {
    default: Component;
    header?: Component;
    sideMenus?: Component;
    footer?: Component;
  };
} & {
  meta?: RouteMeta<TRoles>;
  children?: IRouteConfig<TRoles>[];
};

/**
 * menu 菜单接口
 */
export interface IMenuLink {
  id: string;
  label: string;
  name?: string;
  url?: string;
  icon?: string;
  level?: number;
  target?: '_blank' | '_system';
  comp?: boolean;
}

export interface IMenu extends IMenuLink {
  disabled?: boolean;
  readonly?: boolean;
  children?: IMenu[] | IMenuLink[];
}

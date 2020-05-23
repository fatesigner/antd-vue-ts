/**
 * router
 */

import { Component, RouteConfig } from 'vue-router/types/router';

import { IMenuLink } from './memu';
import { UnRequired } from '../client/lib/ts-helper';

interface IRouteConfigExtends<AUTH extends readonly string[], MENU extends readonly string[]> extends RouteConfig {
  components?: {
    default: Component;
    header?: Component;
    sideMenus?: Component;
    footer?: Component;
  };
  meta: {
    // 该路由可访问的权限组
    auth?: AUTH[number][];
    label: string;
  };
}

/**
 * 页面路由信息接口
 */
export interface IRouteConfig<AUTH extends readonly string[], MENU extends readonly string[]>
  extends IRouteConfigExtends<AUTH, MENU> {
  children?: IRouteConfigExtends<AUTH, MENU>[];
}

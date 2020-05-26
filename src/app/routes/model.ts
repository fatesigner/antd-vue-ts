/**
 * model
 */

import { IRouteConfig } from '../interfaces/router';
import { Role } from '../global';

// 页面路由信息接口
export type IAppRouteConfig = IRouteConfig<typeof Role.keys>;

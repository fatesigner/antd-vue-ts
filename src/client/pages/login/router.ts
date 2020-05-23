/**
 * router
 */

import { IAppRouteConfig } from '../../router';

const Router: IAppRouteConfig = {
  path: '/login',
  name: 'login',
  component: () => import('./Login.vue'),
  meta: {
    label: '登录'
  }
};

export default Router;

/**
 * router
 */

import { IRouteConfig } from '../../../../lib/vue-helper/interface';

import { i18n } from '../../../i18n';
import { RootRouterLayoutName } from '../../';

const Router: IRouteConfig = {
  name: 'menusAuth',
  path: '/menus-auth',
  component: () => import('./MenusAuth.vue'),
  meta: {
    layout: RootRouterLayoutName.Sidebar,
    label: i18n.keys.route.menusAuth,
    keepAlive: true
  }
};

export default Router;

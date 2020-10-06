/**
 * router
 */

import { IRouteConfig } from '../../../../lib/vue-helper/interface';

import { i18n } from '../../../i18n';
import { RootRouterLayoutName } from '../../';

const Router: IRouteConfig = {
  name: 'login',
  path: '/login',
  component: () => import('./Login.vue'),
  meta: {
    layout: RootRouterLayoutName.Empty,
    label: i18n.keys.route.login,
    keepAlive: true
  }
};

export default Router;

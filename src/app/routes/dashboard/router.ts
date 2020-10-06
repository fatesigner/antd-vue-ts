/**
 * router
 */

import { IRouteConfig } from '../../../lib/vue-helper/interface';

import { i18n } from '../../i18n';
import { RootRouterLayoutName } from '../../layout';

const Router: IRouteConfig = {
  name: 'dashboard',
  path: '/',
  component: () => import('./Dashboard.vue'),
  meta: {
    layout: RootRouterLayoutName.Sidebar,
    label: i18n.keys.route.dashboard,
    keepAlive: true
  }
};

export default Router;

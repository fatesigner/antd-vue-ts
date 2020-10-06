/**
 * router
 */

import { IRouteConfig } from '../../../lib/vue-helper/interface';

import { i18n } from '../../i18n';
import { RootRouterLayoutName } from '../../layout';

const Router: IRouteConfig = {
  name: 'table',
  path: '/table',
  component: () => import('./Table.vue'),
  meta: {
    layout: RootRouterLayoutName.Sidebar,
    label: i18n.keys.route.table,
    keepAlive: true
  }
};

export default Router;

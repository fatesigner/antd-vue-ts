/**
 * router
 */

import { Role } from '../../global';
import { IAppRouteConfig } from '../interfaces';
import { I18nkeys } from '../../i18n';

const Router: IAppRouteConfig = {
  path: '/inventory',
  name: 'inventory',
  component: () => import('./Inventory.vue'),
  meta: {
    auth: [Role.enum.admin, Role.enum.sale_commissioner, Role.enum.sale_financial, Role.enum.sale_warehouse],
    label: I18nkeys.route.inventory
  }
};

export default Router;
